"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language: selectedLanguage, setLanguage } = useLanguage();

  const languages = [
    { code: 'az', name: 'AZ' },
    { code: 'en', name: 'EN' },
    { code: 'ru', name: 'RU' }
  ];

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[1];

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="language-selector">
      <button
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        onTouchStart={() => {}} // iOS Safari touch fix
        type="button"
      >
        <Image
          src="/images/langHeder.svg"
          alt="Language"
          width={23}
          height={23}
          className="language-icon"
        />
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${selectedLanguage === language.code ? 'selected' : ''}`}
              onClick={() => handleLanguageSelect(language.code)}
              onTouchStart={() => {}} // iOS Safari touch fix
              type="button"
            >
              <span className="language-name">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
