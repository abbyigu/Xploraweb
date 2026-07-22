import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions: string[];
  placeholder?: string;
}

// Notion-style tag input: chips for selected values, a dropdown of existing
// tags (across all spots) to reuse, and free typing + "," or Enter to add a
// brand new one.
export function TagInput({ value, onChange, suggestions, placeholder }: Props) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || value.some(v => v.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(value.filter(v => v !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  const matches = suggestions
    .filter(s => !value.some(v => v.toLowerCase() === s.toLowerCase()))
    .filter(s => s.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 8);

  return (
    <div ref={containerRef} className="relative">
      <div className="w-full min-h-[2.5rem] px-2 py-1.5 rounded-lg border border-border text-sm focus-within:ring-2 focus-within:ring-primary flex flex-wrap items-center gap-1.5">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => addTag(input)}
          placeholder={value.length === 0 ? placeholder : undefined}
          className="flex-1 min-w-[6rem] outline-none bg-transparent py-0.5"
        />
      </div>
      {open && matches.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-border bg-card shadow-lg py-1">
          {matches.map(s => (
            <button
              key={s}
              type="button"
              onMouseDown={e => { e.preventDefault(); addTag(s); }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted/60 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
