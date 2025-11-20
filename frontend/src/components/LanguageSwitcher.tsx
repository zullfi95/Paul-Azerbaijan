"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';
import './LanguageSwitcher.css';

const LanguageSwitcher: React.FC = () => {
    const { locale, setLocale, availableLocales } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleLanguageChange = (newLocale: string) => {
        setLocale(newLocale);
        setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    return (
        <div className="language-switcher" ref={wrapperRef}>
            <button className="language-switcher-button" onClick={toggleDropdown}>
                <Globe className="icon" size={20} />
                <span className="current-locale">{locale.toUpperCase()}</span>
                <ChevronDown className={`chevron-icon ${isOpen ? 'open' : ''}`} size={16} />
            </button>
            {isOpen && (
                <ul className="language-dropdown">
                    {availableLocales.map((loc) => (
                        <li key={loc} onClick={() => handleLanguageChange(loc)}>
                            {loc.toUpperCase()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LanguageSwitcher;
