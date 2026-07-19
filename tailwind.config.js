/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#ffffff',
        'bg-soft': '#f7f6f3',
        border: '#e9e9e7',
        text: '#37352f',
        'text-muted': '#787774',
        'text-faint': '#9b9a97',
        blueBg: '#d3e5ef', blueFg: '#0b6e99',
        greenBg: '#dbeddb', greenFg: '#2b7a4b',
        purpleBg: '#e8deee', purpleFg: '#6b46c1',
        grayBg: '#ebeced', grayFg: '#5f5e5b',
        heart: '#c9184a',
        primary: '#37352f',
      },
      borderRadius: {
        card: '8px',
      },
    },
  },
  plugins: [],
};
