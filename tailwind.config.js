/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-button': 'var(--color-custom-button)',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [process.env.NEXT_PUBLIC_DAISYUI_THEMES || 'light'],
  },
}
