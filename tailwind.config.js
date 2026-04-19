/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#F5EFE4',
        paper: '#FCF8F0',
        ink: '#1F2A37',
        muted: '#6B7280',
        line: '#D8C9A8',
        brand: '#1E3A5F',
        brandSoft: '#325779',
        accent: '#B88932',
        accentSoft: '#E7D8B7',
        success: '#2D6A4F',
        danger: '#A63D40',
      },
      boxShadow: {
        card: '0 12px 24px rgba(30, 58, 95, 0.08)',
      },
    },
  },
  plugins: [],
};
