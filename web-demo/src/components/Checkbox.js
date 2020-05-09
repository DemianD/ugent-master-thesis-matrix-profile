import React, { useState, useEffect } from 'react';
import c from '../utils/c';

import { ReactComponent as Check } from '../icons/check.svg';

import './Checkbox.css';
import Label from './Label';

const Checkbox = ({ id, checked, onClick, disabled, children, ...props }) => {
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => setIsChecked(checked), [checked]);

  return (
    <div className="flex items-center">
      <button
        className={c(
          'group flex flex-shrink-0 items-center justify-center border rounded-sm mr-3 mt-2 mb-2',
          'Checkbox',
          !isChecked && !disabled && 'border-gray-900',
          !disabled && isChecked && 'bg-blue-1000 border-blue-1000',
          disabled && 'border-gray-400'
        )}
        onClick={(e) => {
          setIsChecked(!isChecked);
          onClick(e, !isChecked);
        }}
        id={id}
        disabled={disabled}
        {...props}
      >
        <div
          name="check"
          className={c('w-full h-full', !isChecked && 'hidden', !disabled && 'group-hover:block')}
        >
          <Check fill="white" />
        </div>
      </button>
      <Label htmlFor={id} className={c(!disabled && 'cursor-pointer')}>
        {children}
      </Label>
    </div>
  );
};

Checkbox.defaultProps = {
  onClick: () => {},
};

export default Checkbox;
