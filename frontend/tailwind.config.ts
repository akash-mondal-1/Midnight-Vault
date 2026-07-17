import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'moon-white': '#F4F6F0',
        'silver': '#C0C0C0',
        'pearl': '#EAE0C8',
        'midnight-blue': '#0B1021',
        'space-black': '#050505',
        'lavender': '#E6E6FA',
        'soft-indigo': '#4B0082',
        'moon-glow': '#F0E68C',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.8', boxShadow: '0 0 15px 5px rgba(240, 230, 140, 0.2)' },
          '50%': { opacity: '1', boxShadow: '0 0 25px 10px rgba(240, 230, 140, 0.4)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
