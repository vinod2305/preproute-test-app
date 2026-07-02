/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — sourced from the Figma design tokens.
        primary: {
          50: '#f7fbff', // brand semi white
          100: '#eff5ff',
          200: '#bfdbfe', // brand semi light
          300: '#93c5fd',
          400: '#60a5fa', // brand light
          500: '#5988ef', // brand primary (buttons)
          600: '#3f74ec',
          700: '#1b5def', // brand logo (links / emphasis)
          800: '#1748bf',
          900: '#000a3a', // brand very dark logo
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
}
