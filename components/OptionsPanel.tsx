import React from 'react';
import { CUSTOM_INPUT_VALUE } from '../constants';

interface OptionsPanelProps {
  title: string;
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  name: string;
  allowCustom?: boolean;
  customValue?: string;
  onCustomValueChange?: (value: string) => void;
  customLabel?: string;
}

const OptionItem: React.FC<{
    name: string;
    value: string;
    label: string;
    selectedValue: string;
    onValueChange: (value: string) => void;
}> = ({ name, value, label, selectedValue, onValueChange }) => (
    <div>
        <input
            type="radio"
            name={name}
            id={`${name}-${value}`}
            value={value}
            checked={selectedValue === value}
            onChange={(e) => onValueChange(e.target.value)}
            className="hidden"
        />
        <label
            htmlFor={`${name}-${value}`}
            className={`block cursor-pointer select-none rounded-xl p-2 text-center text-sm transition-all duration-200 ${
                selectedValue === value
                ? 'bg-violet-600 text-white font-semibold shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
            {label}
        </label>
    </div>
);


const OptionsPanel: React.FC<OptionsPanelProps> = ({
    title,
    options,
    selectedValue,
    onValueChange,
    name,
    allowCustom = false,
    customValue = '',
    onCustomValueChange = () => {},
    customLabel = 'Custom...'
}) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-violet-300 mb-3">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((option) => (
          <OptionItem
            key={option}
            name={name}
            value={option}
            label={option}
            selectedValue={selectedValue}
            onValueChange={onValueChange}
          />
        ))}
        {allowCustom && (
            <OptionItem
                key={CUSTOM_INPUT_VALUE}
                name={name}
                value={CUSTOM_INPUT_VALUE}
                label={customLabel || 'Tự nhập...'}
                selectedValue={selectedValue}
                onValueChange={onValueChange}
            />
        )}
      </div>
      {allowCustom && selectedValue === CUSTOM_INPUT_VALUE && (
        <div className="mt-3">
            <input
                type="text"
                value={customValue}
                onChange={(e) => onCustomValueChange(e.target.value)}
                placeholder="Nhập giá trị tùy chỉnh của bạn..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                aria-label={`Custom value for ${name}`}
            />
        </div>
      )}
    </div>
  );
};

export default OptionsPanel;
