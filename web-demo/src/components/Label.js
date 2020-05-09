import React from 'react';

const Label = ({ children, ...props }) => {
  return (
    <label className="block mb-1 cursor-pointer font-bold text-blue-1000" {...props}>
      {children}
    </label>
  );
};

export default Label;
