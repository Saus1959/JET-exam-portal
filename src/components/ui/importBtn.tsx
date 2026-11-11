"use client";

import { Plus } from "lucide-react";
import React, { useRef } from "react";

interface ImportButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  label?: string;
  /** Вызывается с выбранным .xlsx файлом. */
  onFile: (file: File) => void;
}

const ImportButton: React.FC<ImportButtonProps> = ({
  label = "Import",
  className = "",
  onFile,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ""; // чтобы можно было выбрать тот же файл повторно
          if (file) onFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${className}`}
        {...props}
      >
        <Plus />
        <span>{label}</span>
      </button>
    </>
  );
};

export default ImportButton;
