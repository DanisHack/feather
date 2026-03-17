import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import type { SectorData } from '../../hooks/useMarkets';

interface SectorHeatmapProps {
  sectors: SectorData[];
}

function getSectorBg(changePercent: number): string {
  const pos = colors.status.positive; // #4EBE96
  const neg = colors.status.negative; // #D84F68
  if (changePercent > 2) return `${pos}33`; // 20% opacity
  if (changePercent > 1) return `${pos}1F`; // 12%
  if (changePercent > 0) return `${pos}0F`; // 6%
  if (changePercent > -1) return `${neg}0F`;
  if (changePercent > -2) return `${neg}1F`;
  return `${neg}33`;
}

export function SectorHeatmap({ sectors }: SectorHeatmapProps) {
  return (
    <div style={{ marginTop: 24 }}>
      {/* Section label */}
      <div
        style={{
          fontSize: 11,
          color: colors.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 12,
        }}
      >
        Sectors
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}
      >
        {sectors.map((sector) => (
          <SectorTile key={sector.key} name={sector.name} changePercent={sector.changePercent} />
        ))}
      </div>
    </div>
  );
}

function SectorTile({
  name,
  changePercent,
}: {
  name: string;
  changePercent: number;
}) {
  const isPositive = changePercent >= 0;
  const changeColor = isPositive ? colors.status.positive : colors.status.negative;

  return (
    <motion.div
      style={{
        borderRadius: 8,
        padding: 14,
        background: getSectorBg(changePercent),
        cursor: 'default',
      }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
    >
      <div style={{ fontSize: 13, fontWeight: 500, color: colors.text.emphasis }}>
        {name}
      </div>
      <div style={{ fontSize: 12, color: changeColor, marginTop: 4 }}>
        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
      </div>
    </motion.div>
  );
}
