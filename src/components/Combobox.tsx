import React, { useEffect, useMemo, useRef, useState } from 'react';

interface ComboboxProps {
  options: string[];
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  autoFocus?: boolean;
  type?: string;
  // Mode contrôlé (piloté par un state React)
  value?: string;
  onChange?: (value: string) => void;
  // Mode non contrôlé (formulaire lu via FormData / getElementById au submit)
  defaultValue?: string;
  // Appelé à chaque changement de valeur, dans les deux modes (utile pour des effets
  // de bord comme pré-remplir un autre champ sans rendre celui-ci contrôlé)
  onValueChange?: (value: string) => void;
  // Ouvre la liste vers le haut au lieu du bas — utile quand le champ est proche du
  // bord inférieur d'un conteneur avec overflow-hidden (ex: dernière ligne d'un tableau).
  dropUp?: boolean;
}

/**
 * Remplace le motif natif <input list="..."> + <datalist>, qui ne montre que les
 * options correspondant au texte déjà présent dans le champ (donc rien d'utile
 * quand le champ contient déjà une valeur valide). Ici, au focus, on montre
 * toutes les options tant que le texte ne filtre pas activement une recherche.
 */
export default function Combobox({
  options,
  placeholder,
  className,
  id,
  name,
  required,
  autoFocus,
  type = 'text',
  value,
  onChange,
  defaultValue,
  onValueChange,
  dropUp = false
}: ComboboxProps) {
  const isControlled = value !== undefined;
  const [text, setText] = useState(defaultValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentText = isControlled ? (value || '') : text;

  const uniqueOptions = useMemo(() => Array.from(new Set(options.filter(Boolean))), [options]);

  const filteredOptions = useMemo(() => {
    const q = currentText.trim().toLowerCase();
    if (!q) return uniqueOptions;
    const exactMatch = uniqueOptions.some(o => o.toLowerCase() === q);
    if (exactMatch) return uniqueOptions;
    return uniqueOptions.filter(o => o.toLowerCase().includes(q));
  }, [uniqueOptions, currentText]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const selectOption = (opt: string) => {
    if (isControlled) {
      onChange?.(opt);
    } else {
      if (inputRef.current) {
        inputRef.current.value = opt;
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
      setText(opt);
    }
    onValueChange?.(opt);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {isControlled ? (
        <input
          ref={inputRef}
          type={type}
          id={id}
          name={name}
          required={required}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={className}
          value={value}
          onChange={e => { onChange?.(e.target.value); onValueChange?.(e.target.value); }}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />
      ) : (
        <input
          ref={inputRef}
          type={type}
          id={id}
          name={name}
          required={required}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={className}
          defaultValue={defaultValue}
          onChange={e => { setText(e.target.value); onValueChange?.(e.target.value); }}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />
      )}
      {isOpen && filteredOptions.length > 0 && (
        <div className={`absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {filteredOptions.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectOption(opt)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
