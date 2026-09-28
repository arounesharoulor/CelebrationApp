import React from 'react';
import { ReactTransliterate } from 'react-transliterate';
import 'react-transliterate/dist/index.css';

export default function TamilInput({ value, onChange, onBlur, isTamil, isTextArea, ...props }) {
  const handleChange = (text) => {
    if (onChange) {
      onChange({
        target: {
          name: props.name,
          value: text,
        },
      });
    }
  };

  const handleStandardChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  if (isTamil) {
    return (
      <ReactTransliterate
        value={value || ''}
        onChangeText={handleChange}
        onBlur={onBlur}
        lang="ta"
        renderComponent={(passedProps) => {
          return isTextArea ? (
            <textarea {...passedProps} {...props} />
          ) : (
            <input {...passedProps} {...props} />
          );
        }}
      />
    );
  }

  if (isTextArea) {
    return (
      <textarea
        value={value || ''}
        onChange={handleStandardChange}
        onBlur={onBlur}
        {...props}
      />
    );
  }

  return (
    <input
      value={value || ''}
      onChange={handleStandardChange}
      onBlur={onBlur}
      {...props}
    />
  );
}
