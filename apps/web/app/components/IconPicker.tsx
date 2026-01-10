import { useEffect, useMemo, useState } from 'react';
import { AppIcon, appIconOptions } from './AppIcon';

type IconPickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function IconPicker({
  value,
  onChange,
  placeholder
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const options = useMemo(() => {
    if (!query) {
      return appIconOptions.slice(0, 18);
    }
    const lowered = query.toLowerCase();
    return appIconOptions
      .filter((name) => name.includes(lowered))
      .slice(0, 18);
  }, [query]);

  const handleSelect = (name: string) => {
    setQuery(name);
    onChange(name);
    setOpen(false);
  };

  return (
    <div
      className="icon-picker"
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      <input
        type="text"
        value={query}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onChange(next);
          setOpen(true);
        }}
        placeholder={placeholder}
      />
      {open && options.length > 0 ? (
        <div className="icon-options">
          {options.map((name) => (
            <button
              key={name}
              type="button"
              className="icon-option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(name)}
            >
              <AppIcon name={name} size={18} />
              <span>{name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
