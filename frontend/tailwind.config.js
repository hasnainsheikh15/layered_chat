/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",

        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",

        muted: "hsl(var(--muted))",
        accent: "hsl(var(--accent))",
      },
    },
  },
  plugins: [],
};