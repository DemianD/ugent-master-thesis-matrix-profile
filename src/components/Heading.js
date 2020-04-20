import React from 'react';
import c from '../utils/c';

const commonClassnames = 'font-black tracking-tighter leading-tight text-blue-1000';

export const H1 = ({ className, children }) => {
  return <h1 className={c(commonClassnames, className, 'text-4xl mb-2')}>{children}</h1>;
};

export const H2 = ({ className, children }) => {
  return <h2 className={c(commonClassnames, className, 'text-3xl mb-2')}>{children}</h2>;
};

export const H3 = ({ className, children }) => {
  return <h3 className={c(commonClassnames, className, 'text-2xl mb-2')}>{children}</h3>;
};
