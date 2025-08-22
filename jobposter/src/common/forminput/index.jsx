import React from 'react';

const FormInput = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          transition-colors duration-200
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
        `}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormInput;