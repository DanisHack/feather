import { useState } from 'react';
import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';

interface ParsedFiltersProps {
  filters: { field: string; label: string }[];
  onRemove: (index: number) => void;
}

export function ParsedFilters({ filters, onRemove }: ParsedFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((filter, i) => (
        <motion.div
          key={`${filter.field}-${i}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: i * 0.1 }}
        >
          <FilterChip label={filter.label} onRemove={() => onRemove(i)} />
        </motion.div>
      ))}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-1.5"
      style={{
        fontSize: 12,
        color: colors.text.emphasis,
        background: hovered ? `${colors.accent.indigo}33` : `${colors.accent.indigo}1F`,
        border: `1px solid ${colors.accent.indigo}4D`,
        borderRadius: 6,
        padding: '3px 8px 3px 10px',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span>{label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: colors.text.secondary,
          cursor: 'pointer',
          fontSize: 14,
          padding: '0 2px',
          lineHeight: 1,
        }}
      >
        &times;
      </button>
    </div>
  );
}
