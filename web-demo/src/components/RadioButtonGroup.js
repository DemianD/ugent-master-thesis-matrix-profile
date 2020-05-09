import React from 'react';

const RadioButtonGroup = ({ name, onChange, className, defaultChecked, children }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          onChange,
          name,
          defaultChecked: child.props.value === defaultChecked,
        })
      )}
    </div>
  );
};

RadioButtonGroup.defaultProps = {
  onChange: () => {},
};

export default RadioButtonGroup;
