/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Work Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Work Sans"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: '#E50914',
        brandAccent: '#F6121D',
        brandDark: '#141414',
        brandDarker: '#0B0B0B',
        brandMuted: '#8C8C8C',
        panel: '#1F1F1F',
        panelMuted: '#232323',
      },
      boxShadow: {
        glow: '0 35px 90px rgba(0, 0, 0, 0.65)',
        panel: '0 30px 50px rgba(0, 0, 0, 0.55)',
      },
      backgroundImage: {
        mesh:
          'radial-gradient(circle at 15% 15%, rgba(245,245,241,0.08), transparent 40%), radial-gradient(circle at 75% 5%, rgba(229,9,20,0.22), transparent 45%), radial-gradient(circle at 70% 70%, rgba(217,48,37,0.18), transparent 55%)',
      },
    },
  },
  plugins: [],
}

