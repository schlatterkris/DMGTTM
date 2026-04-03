/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'vault-blood': '#8b0000',
        'vault-paper': '#f4e4bc',
        'vault-ink': '#2b1d0e',
        'void': '#0a0a0a',
      },
    },
  },
  plugins: [],
}
