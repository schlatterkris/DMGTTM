/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Use these in your JSX like: className="font-uncial"
        uncial: ['"Uncial Antiqua"', 'serif'],
        // Use these in your JSX like: className="font-parchment"
        parchment: ['"Crimson Text"', 'serif'],
      },
      colors: {
        vault: {
          paper: '#fdf1dc',
          ink: '#331100',
          blood: '#58180d',
          gold: '#c5a059',
        }
      }
    },
  },
  plugins: [],
}
