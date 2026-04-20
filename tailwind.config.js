export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        war: {
          bg: '#0f0f0f',
          gold: '#d4af37',
          red: '#c0392b',
          teal: '#1abc9c',
          neutral: '#7f8c8d',
          dark: '#1a1a1a',
          panel: 'rgba(20, 20, 20, 0.85)'
        }
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif']
      },
      borderWidth: {
        3: '3px',
        6: '6px'
      },
      backdropBlur: {
        xs: '2px',
        md: '6px'
      }
    }
  },
  plugins: []
}
