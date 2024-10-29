/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: [
    "./src/**/*.{tsx,ts}", // Watch all TypeScript and TypeScript React files in src directory
    "./build/**/*.{html,js,css}" // Include HTML, JavaScript, and CSS files in build for custom styling
  ],
  theme: {
    extend: {
      // Customize colors, spacing, etc. if needed
    }
  },
  plugins: []
}
