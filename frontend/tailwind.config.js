export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Outfit', 'sans-serif'],
    },
    extend: {
      colors: {
        background: "#08060F", // Deep purple-black
        surface: "#120E1E", // Slightly lighter purple-black
        surfaceLight: "#1F1A30",
        primary: "#6366F1", // Indigo
        primaryHover: "#4F46E5",
        secondary: "#8B5CF6", // Violet
        accent: "#06B6D4", // Cyan
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
