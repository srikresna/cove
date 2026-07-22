export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          paper: '#fdfbf9',
        },
        charcoal: '#171717',
        cocoa: {
          ink: '#2b1a07',
        },
        dew: {
          drop: '#f7efe9',
        },
        marker: {
          orange: '#ff6f1e',
        },
        burnt: {
          sienna: '#ce500a',
        },
        sticker: {
          sky: '#3b82f6',
          bubblegum: '#ff66cf',
          sprout: '#22c55e',
        },
        shadow: {
          mist: '#bebcbb',
        }
      },
      fontFamily: {
        gelica: ['Outfit', 'sans-serif'],
        geist: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'paper-lift': '0px 1px 2px 0px rgba(0, 0, 0, 0.25)',
        'card-subtle': '0px 2px 20px 0px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'pill': '20px',
        'card': '12px',
        'footer': '56px',
      }
    },
  },
  plugins: [],
}
