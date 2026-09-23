/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          dark: '#020617',    // slate-950 body
          panel: '#0f172a',   // slate-900 container
          border: '#1e293b',  // slate-800 border
          slick: '#22d3ee',   // cyan-400 (oil slicks)
          origin: '#34d399',  // emerald-400 (hindcast release)
          danger: '#f43f5e',  // rose-500 (AIS anomalies / threats)
          warning: '#fbbf24', // amber-400 (loitering / review alerts)
        }
      }
    },
  },
  plugins: [],
};
