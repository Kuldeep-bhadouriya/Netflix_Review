/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        ink: '#05030a',
        aurora: '#7f5af0',
        neon: '#22d3ee',
        flare: '#f472b6',
        dusk: '#1f2937',
      },
      boxShadow: {
        glow: '0 25px 70px rgba(127, 90, 240, 0.25)',
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at 20% 20%, rgba(127,90,240,0.35), transparent 50%), radial-gradient(circle at 80% 0%, rgba(244,114,182,0.35), transparent 45%), radial-gradient(circle at 50% 80%, rgba(34,211,238,0.25), transparent 45%)',
      },
    },
  },
  plugins: [],
}

