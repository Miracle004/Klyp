/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        accent: {
          indigo: "#4F46E5",
          teal: "#0D9488",
        }
      }
    },
  },
  plugins: [],
}
