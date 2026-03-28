/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'app-pattern':
          'radial-gradient(circle at 20% -10%, rgba(250, 204, 21, 0.18), transparent 35%), radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.2), transparent 40%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      },
      boxShadow: {
        soft: '0 16px 45px -24px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
}

