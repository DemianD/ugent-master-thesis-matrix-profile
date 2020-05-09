import React from 'react';

const Button = ({ children, ...props }) => {
  return (
    <button className="bg-blue-1100 text-white px-4 py-1 " {...props}>
      {children}
    </button>
  );
};

export default Button;
