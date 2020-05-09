import React from 'react';
import c from '../utils/c';
import Label from './Label';

const CheckboxList = ({ label, checked, children, onChange = () => {} }) => {
  const totalChilds = React.Children.count(children);

  return (
    <>
      {label && <Label className="mt-1 mb-1">{label}</Label>}
      {React.Children.map(children, (child, i) => {
        return (
          <div
            className={c(
              'flex items-center justify-between p-2 border-b w-full',
              i < totalChilds - 1 && 'border-b'
            )}
            key={child.props.id}
          >
            {React.cloneElement(child, {
              onClick: (e, isChecked) => {
                onChange(e, child.props.id, isChecked);
              },
              checked: checked[child.props.id],
            })}
          </div>
        );
      })}
    </>
  );
};

export default CheckboxList;
