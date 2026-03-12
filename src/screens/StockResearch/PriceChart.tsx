import { useEffect, useRef } from 'react';
import { createChart, type IChartApi } from 'lightweight-charts';
import { colors } from '../../design-system/tokens';

interface PriceChartProps {
  data: { time: string; value: number }[];
}

export function PriceChart({ data }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height: 260,
      layout: {
        background: { color: 'transparent' },
        textColor: colors.text.tertiary,
      },
      grid: {
        vertLines: { color: colors.bg.elevated[1] },
        horzLines: { color: colors.bg.elevated[1] },
      },
      crosshair: {
        vertLine: {
          color: colors.border.hover,
          style: 1, // dashed
        },
        horzLine: {
          color: colors.border.hover,
          style: 1,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      watermark: { visible: false },
      handleScroll: false,
      handleScale: false,
    });

    const areaSeries = chart.addAreaSeries({
      topColor: `${colors.accent.indigo}40`,
      bottomColor: `${colors.accent.indigo}00`,
      lineColor: colors.accent.indigo,
      lineWidth: 2,
    });

    areaSeries.setData(data);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        chart.applyOptions({ width });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data]);

  return <div ref={containerRef} className="[&_a[href*='tradingview']]:!hidden" />;
}
