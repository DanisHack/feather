import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

export const aiRouter = Router();

const apiKey = process.env.ANTHROPIC_API_KEY ?? '';
const hasApiKey = Boolean(apiKey);

const anthropic = hasApiKey
  ? new Anthropic({ apiKey })
  : null;

if (!hasApiKey) {
  console.warn('[AI] ANTHROPIC_API_KEY not set — AI endpoints will return stubs.');
}

// ─── Helper ──────────────────────────────────────────────

async function ask(system: string, userMessage: string): Promise<string> {
  if (!anthropic) return '';

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: userMessage }],
  });

  const block = message.content[0];
  return block.type === 'text' ? block.text : '';
}

// ─── Basic query parser (no AI needed) ───────────────────

function basicParse(query: string): { field: string; operator: string; value: number | string; label: string }[] {
  const q = query.toLowerCase();
  const filters: { field: string; operator: string; value: number | string; label: string }[] = [];

  // Price: "under $20", "below $50", "above $100", "over $200"
  // Require $ sign to avoid false positives (e.g. "pe under 20" is not about price)
  const underMatch = q.match(/(?:under|below|less than|<)\s*\$(\d+)/) ?? q.match(/price\s*(?:under|below|less than|<)\s*\$?(\d+)/);
  if (underMatch) filters.push({ field: 'price', operator: 'lt', value: Number(underMatch[1]), label: `Price < $${underMatch[1]}` });

  const overMatch = q.match(/(?:over|above|more than|greater than|>)\s*\$(\d+)/) ?? q.match(/price\s*(?:over|above|more than|greater than|>)\s*\$?(\d+)/);
  if (overMatch) filters.push({ field: 'price', operator: 'gt', value: Number(overMatch[1]), label: `Price > $${overMatch[1]}` });

  // Market cap
  if (/large.?cap/i.test(q)) filters.push({ field: 'marketCap', operator: 'gt', value: 10_000_000_000, label: 'Market Cap > $10B' });
  if (/mid.?cap/i.test(q)) filters.push({ field: 'marketCap', operator: 'between', value: [2_000_000_000, 10_000_000_000] as unknown as number, label: 'Market Cap $2B-$10B' });
  if (/small.?cap/i.test(q)) filters.push({ field: 'marketCap', operator: 'lt', value: 2_000_000_000, label: 'Market Cap < $2B' });

  // Sector keywords
  if (/\btech/i.test(q)) filters.push({ field: 'sector', operator: 'in', value: 'technology', label: 'Sector: Technology' });
  if (/\bhealthcare|pharma|biotech/i.test(q)) filters.push({ field: 'sector', operator: 'in', value: 'healthcare', label: 'Sector: Healthcare' });
  if (/\benergy|oil/i.test(q)) filters.push({ field: 'sector', operator: 'in', value: 'energy', label: 'Sector: Energy' });
  if (/\bfinancial|bank/i.test(q)) filters.push({ field: 'sector', operator: 'in', value: 'financial', label: 'Sector: Financials' });

  // Dividend
  const divMatch = q.match(/dividend.*?(\d+(?:\.\d+)?)\s*%/);
  if (divMatch) filters.push({ field: 'dividendYield', operator: 'gt', value: Number(divMatch[1]), label: `Dividend Yield > ${divMatch[1]}%` });
  else if (/dividend/i.test(q)) filters.push({ field: 'dividendYield', operator: 'gt', value: 2, label: 'Dividend Yield > 2%' });

  // P/E
  const peMatch = q.match(/p\/?e.*?(?:under|below|<)\s*(\d+)/);
  if (peMatch) filters.push({ field: 'peRatio', operator: 'lt', value: Number(peMatch[1]), label: `P/E < ${peMatch[1]}` });

  // Profitable
  if (/profitable|positive.*(?:margin|earning)/i.test(q)) filters.push({ field: 'peRatio', operator: 'gt', value: 0, label: 'Profitable (P/E > 0)' });

  return filters;
}

// ─── Parse screener query ────────────────────────────────

aiRouter.post('/parse-screener', async (req, res) => {
  const { query } = req.body;

  if (!anthropic) {
    const filters = basicParse(query);
    if (filters.length === 0) {
      filters.push({ field: 'marketCap', operator: 'gt', value: 1_000_000_000, label: `Parsed from: "${query}"` });
    }
    res.json({
      filters,
      description: `Results for "${query}"`,
    });
    return;
  }

  try {
    const text = await ask(
      `You are a stock screener query parser. Given a natural language query about stocks, extract structured filters.

Return ONLY valid JSON (no markdown, no explanation) with this schema:
{
  "filters": [
    {
      "field": "marketCap" | "price" | "peRatio" | "sector" | "revenueGrowth" | "changePercent" | "volume" | "netMargin" | "grossMargin" | "dividendYield",
      "operator": "gt" | "lt" | "eq" | "between" | "in",
      "value": <number, string, or array>,
      "label": "<human-readable description>"
    }
  ],
  "description": "<1-sentence summary of what the user is looking for>"
}

Rules:
- "under $50" → { field: "price", operator: "lt", value: 50, label: "Price < $50" }
- "profitable" → { field: "netMargin", operator: "gt", value: 0, label: "Net Margin > 0%" }
- "tech stocks" → { field: "sector", operator: "eq", value: "Technology", label: "Sector: Technology" }
- "high dividend yield above 4%" → { field: "dividendYield", operator: "gt", value: 4, label: "Dividend Yield > 4%" }
- "large cap" → { field: "marketCap", operator: "gt", value: 10000000000, label: "Market Cap > $10B" }
- "small cap" → { field: "marketCap", operator: "lt", value: 2000000000, label: "Market Cap < $2B" }
- Extract ALL relevant filters from the query.`,
      query,
    );

    const parsed = JSON.parse(text);
    res.json({
      filters: parsed.filters ?? [],
      description: parsed.description ?? `Results for "${query}"`,
    });
  } catch (err) {
    console.error('[AI] parse-screener error:', err);
    // Fall back to regex-based parser
    const fallbackFilters = basicParse(query);
    if (fallbackFilters.length === 0) {
      fallbackFilters.push({ field: 'marketCap', operator: 'gt', value: 1_000_000_000, label: `Parsed from: "${query}"` });
    }
    res.json({
      filters: fallbackFilters,
      description: `Results for "${query}"`,
    });
  }
});

// ─── Generate morning brief ──────────────────────────────

aiRouter.post('/morning-brief', async (req, res) => {
  const { news, holdings } = req.body;

  if (!anthropic) {
    res.json({
      brief: `Good morning. Here's your market brief covering ${news?.length ?? 0} stories relevant to your ${holdings?.length ?? 0} holdings.`,
    });
    return;
  }

  try {
    const newsContext = (news ?? [])
      .slice(0, 10)
      .map((n: { title: string; description?: string; tickers?: string[] }) =>
        `- ${n.title}${n.tickers?.length ? ` [${n.tickers.join(', ')}]` : ''}`
      )
      .join('\n');

    const holdingsContext = holdings?.length
      ? `The user holds: ${holdings.join(', ')}.`
      : 'No specific holdings provided.';

    const text = await ask(
      `You are a financial news analyst writing a morning market brief for a premium stock research app. Write a concise 2-paragraph market brief.

Paragraph 1: Key market movers and trends from today's news.
Paragraph 2: Notable earnings, sector movements, or events relevant to the user's holdings.

Style: Professional, concise, data-driven. No greetings. No bullet points. Just clean prose. Under 200 words total.`,
      `Today's top stories:\n${newsContext}\n\n${holdingsContext}`,
    );

    res.json({ brief: text });
  } catch (err) {
    console.error('[AI] morning-brief error:', err);
    res.json({
      brief: `Good morning. Here's your market brief covering ${news?.length ?? 0} stories.`,
    });
  }
});

// ─── Summarize a single news article ─────────────────────

aiRouter.post('/summarize', async (req, res) => {
  const { title, description, source } = req.body;

  if (!anthropic) {
    res.json({ summary: `Summary of: ${title}` });
    return;
  }

  try {
    const text = await ask(
      'You are a financial news summarizer. Write exactly one sentence summarizing the key takeaway of this article. Be concise and factual.',
      `Title: ${title}\nSource: ${source}\nDescription: ${description ?? ''}`,
    );
    res.json({ summary: text });
  } catch (err) {
    console.error('[AI] summarize error:', err);
    res.json({ summary: `Summary of: ${title}` });
  }
});

// ─── Analyze earnings ────────────────────────────────────

aiRouter.post('/analyze-earnings', async (req, res) => {
  const { ticker, pressRelease } = req.body;

  if (!anthropic) {
    res.json({
      summary: `Earnings analysis for ${ticker}`,
      keyPoints: ['Revenue beat estimates', 'Guidance raised'],
      beat: true,
      guidance: 'Raised',
    });
    return;
  }

  try {
    const text = await ask(
      `You are a financial analyst specializing in earnings reports. Analyze the earnings for the given stock ticker.

Return ONLY valid JSON (no markdown):
{
  "summary": "<2-3 sentence earnings analysis>",
  "keyPoints": ["<point 1>", "<point 2>", "<point 3>"],
  "beat": true | false,
  "guidance": "Raised" | "Maintained" | "Lowered" | "Not provided"
}`,
      `Ticker: ${ticker}\n${pressRelease ? `Press release:\n${pressRelease}` : 'No press release available. Provide a general analysis based on the ticker.'}`,
    );

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error('[AI] analyze-earnings error:', err);
    res.json({
      summary: `Earnings analysis for ${ticker}`,
      keyPoints: [],
      beat: null,
      guidance: 'Not provided',
    });
  }
});

// ─── Analyze stock ───────────────────────────────────────

aiRouter.post('/analyze-stock', async (req, res) => {
  const { ticker, financials, news } = req.body;

  if (!anthropic) {
    res.json({ analysis: `Comprehensive analysis of ${ticker} coming soon.` });
    return;
  }

  try {
    const newsContext = (news ?? [])
      .slice(0, 5)
      .map((n: { title: string }) => `- ${n.title}`)
      .join('\n');

    const text = await ask(
      `You are a senior equity research analyst. Write a concise fundamental analysis of the given stock. Cover: business overview, recent performance, key risks, and outlook. 2-3 paragraphs, under 250 words. Professional tone.`,
      `Ticker: ${ticker}\n\nRecent news:\n${newsContext || 'No recent news.'}\n\nFinancials: ${financials ? JSON.stringify(financials).slice(0, 1000) : 'Not available.'}`,
    );

    res.json({ analysis: text });
  } catch (err) {
    console.error('[AI] analyze-stock error:', err);
    res.json({ analysis: `Comprehensive analysis of ${ticker} coming soon.` });
  }
});
