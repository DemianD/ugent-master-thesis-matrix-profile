import React, { useRef } from 'react';

const Editor = ({ id, name, className, value, onChange }) => {
  const ref = useRef();

  const setSelection = position => {
    ref.current.selectionStart = ref.current.selectionEnd = position + 1;
  };

  const handleTab = e => {
    if (e.keyCode === 9) {
      e.preventDefault();

      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;

      onChange(q => {
        return `${q.substring(0, start)}\t${q.substring(end)}`;
      });

      // Reset cursor position
      setTimeout(() => {
        setSelection(start);
      }, 1);
    }
  };

  return (
    <textarea
      ref={ref}
      id={id}
      name={name}
      value={value}
      className={className}
      onKeyDown={handleTab}
      onChange={e => onChange(e.target.value)}
    />
  );
};

export default Editor;
