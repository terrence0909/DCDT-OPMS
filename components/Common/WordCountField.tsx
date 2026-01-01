
import React, { useState, useEffect } from 'react';

interface WordCountFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  maxWords?: number;
  placeholder?: string;
  required?: boolean;
}

const WordCountField: React.FC<WordCountFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  maxWords = 50, 
  placeholder,
  required = false 
}) => {
  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const count = getWordCount(value);
  const isOverLimit = count > maxWords;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    onChange(newVal);
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-secondary uppercase">{label} {required && <span className="text-alert">*</span>}</label>
        <span className={`text-[10px] font-mono ${isOverLimit ? 'text-alert font-bold' : 'text-secondary'}`}>
          {count} / {maxWords} words
        </span>
      </div>
      <textarea
        spellCheck="true"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full p-3 border rounded-sm text-sm focus:outline-none transition-colors min-h-[100px] ${
          isOverLimit ? 'border-alert focus:border-alert' : 'border-border focus:border-primary'
        }`}
      />
      {isOverLimit && (
        <p className="text-[10px] text-alert font-semibold uppercase tracking-tight">Warning: Maximum word limit exceeded for this field.</p>
      )}
    </div>
  );
};

export default WordCountField;
