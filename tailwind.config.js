/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        sage: {
          50: '#f4f7f5',
          100: '#e3ebe6',
          200: '#c6d8cd',
          300: '#9fc0ab',
          400: '#75a385',
          500: '#568767',
          600: '#426c51',
          700: '#365642',
          800: '#2d4637',
          900: '#263b2f',
        },
        warm: {
          50: '#fdfbf7',
          100: '#f7f2e8',
          200: '#ede2ce',
          300: '#e0cda9',
          400: '#d2b380',
          500: '#c5975b',
          600: '#b6804d',
          700: '#976441',
          800: '#7a503a',
          900: '#634232',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
