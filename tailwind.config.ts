/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'mesh-fluid': 'mesh 15s ease-in-out infinite alternate',
        'mesh-fluid-slow': 'mesh 20s ease-in-out infinite alternate-reverse',
      },
      keyframes: {
        mesh: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        }
      },
      colors: {
        neon: {
          blue: '#0a0f24',
          cyan: '#00f0ff',
          magenta: '#ff00ff',
        },
        slate: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          hover: '#283548',
        },
        primary: {
          indigo: '#6366f1',
          blue: '#38bdf8',
        }
      }
    },
  },
  plugins: [],
}