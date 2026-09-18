import React from 'react';

export default function TamilInput({ value, onChange, onBlur, isTamil, isTextArea, ...props }) {
  const handleTransliterateWord = async (word) => {
    if (!word || !/[a-zA-Z]/.test(word)) return word;
    try {
      const res = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=ta-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`);
      const data = await res.json();
      if (data[0] === 'SUCCESS') {
        return data[1][0][1][0] || word;
      }
    } catch (err) {
      console.error('Transliteration error', err);
    }
    return word;
  };

  const handleChange = async (e) => {
    const val = e.target.value;
    onChange(e); // immediately update UI

    if (isTamil && val.endsWith(' ')) {
      const words = val.slice(0, -1).split(' ');
      const lastWord = words[words.length - 1];
      
      if (lastWord && /[a-zA-Z]/.test(lastWord)) {
        const transliterated = await handleTransliterateWord(lastWord);
        if (transliterated !== lastWord) {
          words[words.length - 1] = transliterated;
          const newValue = words.join(' ') + ' ';
          onChange({ target: { name: props.name, value: newValue } });
        }
      }
    }
  };

  const handleBlur = async (e) => {
    const val = e.target.value;
    if (isTamil && val && /[a-zA-Z]/.test(val)) {
      const transliterated = await handleTransliterateWord(val);
      if (transliterated !== val) {
        onChange({ target: { name: props.name, value: transliterated } });
      }
    }
    if (onBlur) onBlur(e);
  };

  if (isTextArea) {
    return (
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    );
  }

  return (
    <input
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}
