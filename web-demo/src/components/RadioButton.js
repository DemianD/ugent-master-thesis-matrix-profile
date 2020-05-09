import React from 'react';

import './RadioButton.css';

const RadioButton = ({ children, value, name, onChange = () => {}, ...props }) => {
  const ID = `RadioButton__${name}__${value}`;
  return (
    <>
      <label
        className="RadioButton flex relative select-none items-center mb-2 cursor-pointer"
        htmlFor={ID}
      >
        <input
          {...props}
          name={name}
          type="radio"
          value={value}
          className="absolute opacity-0 cursor-pointer"
          id={ID}
          onChange={() => onChange(value)}
        />
        <div className="RadioButton__Checkmark absolute left-0 h-5 w-5 rounded-full border border-gray-900 flex justify-center items-center">
          <div className="rounded-full border border-blue-1000 bg-blue-1000 hidden" />
        </div>
        {children}
      </label>
    </>
  );
};

export default RadioButton;
