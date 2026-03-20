/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        danger: '#FF4500',
        warning: '#FF8C00',
        success: '#22C55E',
        rust: 'hsl(25, 90%, 50%)',
        blood: 'hsl(0, 70%, 35%)',
        ash: 'hsl(20, 5%, 40%)',
        dust: 'hsl(35, 30%, 65%)',
        military: 'hsl(80, 20%, 25%)',
        'warning-yellow': 'hsl(45, 95%, 55%)',
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'system-ui', 'sans-serif'],
        display: ['Black Ops One', 'system-ui', 'sans-serif'],
        body: ['Rajdhani', 'system-ui', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
          '75%': { opacity: '0.95' },
        },
        'dust-float': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-100vh) translateX(50px)', opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px -5px hsl(25 90% 50% / 0.3)' },
          '50%': { boxShadow: '0 0 40px -5px hsl(25 90% 50% / 0.6)' },
        },
        'slide-up': {
          from: { transform: 'translateY(30px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'warning-pulse': {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        flicker: 'flicker 3s ease-in-out infinite',
        'dust-float': 'dust-float 15s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'warning-pulse': 'warning-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
