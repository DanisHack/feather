import { useState, useRef, useEffect } from 'react';
import { colors } from '../../design-system/tokens';
import { useWatchlistStore } from '../../store/watchlistStore';

export function WatchlistTabs() {
  const { lists, activeListId, setActiveList, addList } = useWatchlistStore();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) {
      inputRef.current?.focus();
    }
  }, [adding]);

  const handleAdd = () => {
    const name = newName.trim();
    if (name) {
      addList(name);
    }
    setNewName('');
    setAdding(false);
  };

  return (
    <div className="flex items-center gap-1" style={{ padding: '16px 16px 0' }}>
      {lists.map((list) => {
        const active = list.id === activeListId;
        return (
          <button
            key={list.id}
            onClick={() => setActiveList(list.id)}
            className="transition-colors duration-150"
            style={{
              fontSize: 13,
              color: active ? colors.text.emphasis : colors.text.tertiary,
              background: active ? colors.bg.elevated[4] : 'transparent',
              borderRadius: 6,
              padding: '4px 12px',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.color = colors.text.secondary;
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.color = colors.text.tertiary;
            }}
          >
            {list.name}
          </button>
        );
      })}

      {adding ? (
        <input
          ref={inputRef}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') { setAdding(false); setNewName(''); }
          }}
          onBlur={handleAdd}
          placeholder="List name..."
          style={{
            fontSize: 13,
            color: colors.text.emphasis,
            background: colors.bg.elevated[3],
            border: `1px solid ${colors.border.hover}`,
            borderRadius: 6,
            padding: '4px 10px',
            outline: 'none',
            width: 120,
          }}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="transition-colors duration-150"
          style={{
            color: colors.text.tertiary,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            padding: '4px 8px',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = colors.text.emphasis; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = colors.text.tertiary; }}
        >
          +
        </button>
      )}
    </div>
  );
}
