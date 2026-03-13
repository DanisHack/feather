import { useState } from 'react';
import { colors } from '../../design-system/tokens';
import { SearchModal } from '../../components/SearchModal/SearchModal';
import { useWatchlistStore } from '../../store/watchlistStore';

export function AddStock() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { activeListId, addTicker } = useWatchlistStore();

  return (
    <>
      <button
        onClick={() => setSearchOpen(true)}
        className="transition-colors duration-150"
        style={{
          fontSize: 13,
          color: colors.text.tertiary,
          border: `1px solid ${colors.border.default}`,
          borderRadius: 6,
          padding: '6px 12px',
          background: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = colors.text.emphasis;
          e.currentTarget.style.borderColor = colors.border.hover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = colors.text.tertiary;
          e.currentTarget.style.borderColor = colors.border.default;
        }}
      >
        + Add stock
      </button>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(ticker) => {
          addTicker(activeListId, ticker);
          setSearchOpen(false);
        }}
      />
    </>
  );
}
