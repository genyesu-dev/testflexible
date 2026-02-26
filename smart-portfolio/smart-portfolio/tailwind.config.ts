import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sell: { 50: '#FEF2F2', 500: '#EF4444', 600: '#DC2626' },
        buy: { 50: '#F0FDF4', 500: '#22C55E', 600: '#16A34A' },
        watch: { 50: '#F5F3FF', 500: '#8B5CF6', 600: '#7C3AED' },
      },
    },
  },
  plugins: [],
};
export default config;
