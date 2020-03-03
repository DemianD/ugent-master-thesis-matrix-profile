import React from 'react';

const Label = ({ children, ...props }) => {
  return (
    <label className="block mb-2 cursor-pointer" {...props}>
      {children}
    </label>
  );
};

export default Label;
