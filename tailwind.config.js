/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bull: '#16a34a',
        bear: '#dc2626',
      },
    },
  },
  plugins: [],
};
