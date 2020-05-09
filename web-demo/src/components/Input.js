import React from 'react';
import Editor from './Editor';
import c from '../utils/c';

const commonClassnames =
  'appearance-none rounded-sm w-full py-2 px-3 leading-tight border border-blue-1000 bg-red-100';

const Input = ({ type, className, ...props }) => {
  if (type === 'editor') {
    return <Editor className={c(commonClassnames, className)} {...props} />;
  }
  if (type === 'multiline') {
    return <textarea className={c(commonClassnames, className)} {...props}></textarea>;
  }

  return <input type={type} className={c(commonClassnames, className)} {...props} />;
};

export default Input;
