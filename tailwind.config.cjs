/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        node: {
          normal: '#2563eb', // blue-600
          leader: '#16a34a', // green-600
          faulty: '#dc2626', // red-600
        },
        stage: {
          pre: '#0ea5e9',
          prepare: '#a855f7',
          commit: '#f59e0b',
        }
      },
    },
  },
  plugins: [],
};