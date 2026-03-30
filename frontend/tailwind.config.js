/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'app-pattern':
          'radial-gradient(circle at 18% -6%, rgba(148, 163, 184, 0.22), transparent 36%), radial-gradient(circle at 82% 0%, rgba(100, 116, 139, 0.18), transparent 42%), linear-gradient(180deg, #edf1f6 0%, #e2e8f0 100%)',
      },
      boxShadow: {
        soft: '0 16px 42px -26px rgba(15, 23, 42, 0.42)',
      },
    },
  },
  plugins: [],
}

