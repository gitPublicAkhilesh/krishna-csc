/** @type {import('tailwindcss').Config} */
module.exports = {
  blocklist: ["overline"],
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background-color)",
        foreground: "var(--text-color)",
        card: { DEFAULT: "var(--surface-color)", foreground: "var(--text-color)" },
        popover: { DEFAULT: "var(--surface-color)", foreground: "var(--text-color)" },
        primary: { DEFAULT: "var(--primary-color)", foreground: "var(--button-text-color)" },
        secondary: { DEFAULT: "var(--secondary-color)", foreground: "var(--button-text-color)" },
        muted: { DEFAULT: "var(--secondary-background-color)", foreground: "var(--secondary-text-color)" },
        accent: { DEFAULT: "var(--accent-color)", foreground: "var(--text-color)" },
        destructive: { DEFAULT: "var(--notification-alert-color)", foreground: "var(--button-text-color)" },
        border: "var(--border-color)", input: "var(--border-color)", ring: "var(--primary-color)",
        chart: { "1": "hsl(var(--chart-1))", "2": "hsl(var(--chart-2))", "3": "hsl(var(--chart-3))", "4": "hsl(var(--chart-4))", "5": "hsl(var(--chart-5))" },
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: { "accordion-down": "accordion-down 0.2s ease-out", "accordion-up": "accordion-up 0.2s ease-out" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
