/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // T1 动效 token：transition-* 不带显式 duration/timing 时消费 :root 的 --motion-* 变量；
    // 显式 duration-*/ease-* 档位保持默认刻度（#6 精致感 pass 中逐步收敛到 token）
    transitionDuration: {
      DEFAULT: 'var(--motion-base, 200ms)',
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      250: '250ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    transitionTimingFunction: {
      DEFAULT: 'var(--motion-ease, cubic-bezier(0, 0, 0.2, 1))',
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    extend: {
      colors: {
        brand: {
          50: '#fdf5fa',
          100: '#fbeaf6',
          200: '#f7d3ee',
          300: '#f0b3e0',
          400: '#e48bcc',
          500: '#d068b8',
          600: '#c253a4',
          700: '#a8478d',
          800: '#8a3775',
          900: '#6b2b5b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
