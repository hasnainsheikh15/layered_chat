/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",

        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",

        muted: "hsl(var(--muted))",
        accent: "hsl(var(--accent))",
        
        // New theme colors
        'teal-dark': '#071510',
        'teal-secondary': '#0d2318',
        'teal-accent': '#40D2BA',
        'teal-dark-text': '#04342C',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'bounce-stagger': 'bounceStagger 0.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};