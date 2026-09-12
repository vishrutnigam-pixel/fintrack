import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blackrock: {
          sand: "#F6F4EC",
          sandHover: "#ECE8DC",
          black: "#000000",
          yellow: "#FFE600",
          border: "#E5E3D8",
          rule: "#DCD8CC",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;