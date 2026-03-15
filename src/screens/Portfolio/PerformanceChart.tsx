import { useRef, useEffect } from 'react';
import { createChart, type IChartApi, LineStyle } from 'lightweight-charts';
import { colors } from '../../design-system/tokens';

interface DataPoint {
  date: Date;
  value: number;
  benchmark: number;
}

interface PerformanceChartProps {
  data?: DataPoint[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      height: 220,
      layout: {
        background: { color: 'transparent' },
        textColor: colors.text.tertiary,
        fontSize: 11,
      },
      grid: {
        vertLines: { color: colors.bg.elevated[1] },
        horzLines: { color: colors.bg.elevated[1] },
      },
      crosshair: {
        vertLine: { color: colors.border.strong, width: 1, style: LineStyle.Dashed },
        horzLine: { color: colors.border.strong, width: 1, style: LineStyle.Dashed },
      },
      rightPriceScale: {
        borderColor: colors.border.subtle,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: colors.border.subtle,
        timeVisible: false,
      },
      handleScroll: false,
      handleScale: false,
      watermark: { visible: false },
    });

    chartRef.current = chart;

    // Portfolio line (indigo)
    const portfolioSeries = chart.addLineSeries({
      color: colors.accent.indigo,
      lineWidth: 2,
      title: 'Portfolio',
      priceFormat: {
        type: 'custom',
        formatter: (price: number) =>
          '$' + price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      },
    });

    // S&P 500 benchmark line (dashed, muted)
    const benchmarkSeries = chart.addLineSeries({
      color: colors.border.hover,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      title: 'S&P 500',
      priceFormat: {
        type: 'custom',
        formatter: (price: number) =>
          '$' + price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      },
    });

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    portfolioSeries.setData(
      data.map((d) => ({ time: formatDate(d.date), value: d.value }))
    );

    benchmarkSeries.setData(
      data.map((d) => ({ time: formatDate(d.date), value: d.benchmark }))
    );

    chart.timeScale().fitContent();

    // ResizeObserver
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="[&_a[href*='tradingview']]:!hidden"
      style={{
        width: '100%',
        height: 220,
        marginTop: 16,
        marginBottom: 24,
      }}
    />
  );
}
