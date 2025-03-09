/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontSize: {
        'xxs': '0.65rem', // Custom size for very small text
        'xxl': '1.875rem', // Custom size between xl and 2xl
        'header-lg': '1.875rem', // 30px
        'subtitle-md': '1.125rem', // 18px
      },
      lineHeight: {
        'header': '1.4',
        'subtitle': '1.6',
      },
      fontWeight: {
        'header-bold': 600, // Semi-bold
        'subtitle-regular': 400, // Regular
      },
      fontFamily: {
        khula: ['"Khula"', 'Helvetica', 'Arial', 'sans-serif'],
        regular: ['"Khula-Regular"', 'Helvetica', 'Arial', 'sans-serif'],
        bold: ['"Khula-Bold"', 'Helvetica', 'Arial', 'sans-serif'],
        light: ['"Khula-Light"', 'Helvetica', 'Arial', 'sans-serif'],
        semiBold: ['"Khula-SemiBold"', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
