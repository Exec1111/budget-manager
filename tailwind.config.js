/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'flup-orange': '#FF6B35',
        'custom-fuchsia': '#FF36AB',
        'dark-bg': '#1A1A1A',
        'dark-secondary': '#2D2D2D',
        'dark-accent': '#3D3D3D',
      },
    },
  },
  plugins: [],
}
