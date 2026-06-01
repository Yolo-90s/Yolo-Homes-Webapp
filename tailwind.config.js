/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          light: "#3B82F6",
        },
        sky2: "#0EA5E9",
        accent: "#14B8A6",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        ink: "#0F172A",
        muted: "#64748B",
        canvas: "#F8FAFC",
        line: "#E2E8F0",
        chart: {
          blue: "#2563EB",
          sky: "#0EA5E9",
          teal: "#14B8A6",
          amber: "#F59E0B",
          green: "#22C55E",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)",
        soft: "0 10px 30px rgba(15,23,42,0.08)",
      },
    },
  },
  plugins: [],
};
