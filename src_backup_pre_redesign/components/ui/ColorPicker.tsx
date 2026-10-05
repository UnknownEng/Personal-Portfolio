import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  description,
}) => {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-[#1E293B] bg-[#0A0E1A]/60">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-medium text-slate-300">{label}</label>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          {value.toUpperCase()}
        </span>
      </div>
      {description && <p className="text-[11px] text-slate-500">{description}</p>}
      <div className="flex items-center gap-3 mt-1">
        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-700 shadow-inner shrink-0 cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer opacity-100"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-[#111827] border border-[#1E293B] rounded px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  );
};
