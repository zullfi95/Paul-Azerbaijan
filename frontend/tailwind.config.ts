import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'paul-primary': '#1A1A1A',
        'paul-secondary': '#4A4A4A',
        'paul-accent-bread': '#E8D5B7',
        'paul-accent-gold': '#D4AF37',
        'paul-accent-coffee': '#7B5E3B',
        'paul-background': '#FFFFFF',
        'paul-background-secondary': '#F9F9F6',
        'primary-1': '#fffcf8',
        'primary-2': '#fef4e6',
        'black-colour-paul': '#000000',
        'ivory-colour-paul': '#fef4e6',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
        'prata': ['Prata', 'serif'],
        'sabon-bold': ['Sabon Next LT Pro Bold', 'serif'],
        'sabon-regular': ['Sabon Next LT Pro Regular', 'serif'],
        'sabon-demi': ['Sabon Next LT Pro Demi', 'serif'],
        'sabon-display': ['Sabon Next LT Pro Display', 'serif'],
        'sabon-display-italic': ['Sabon Next LT Pro DisplayItalic', 'serif'],
        'sabon-demi-italic': ['Sabon Next LT Pro DemiItalic', 'serif'],
        'parisine-regular': ['Parisine Regular', 'sans-serif'],
        'parisine-pro-gris': ['Parisine Pro Gris Regular', 'sans-serif'],
        'parisine-pro-clair': ['Parisine Pro Clair Bold', 'sans-serif'],
      },
      fontSize: {
        'hero': ['3rem', { lineHeight: '1.1' }],
        'hero-mobile': ['2rem', { lineHeight: '1.1' }],
        'h1': ['2.5rem', { lineHeight: '1.2' }],
        'h2': ['2rem', { lineHeight: '1.3' }],
        'h3': ['1.5rem', { lineHeight: '1.4' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
