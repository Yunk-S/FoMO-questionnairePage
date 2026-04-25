import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18211f",
        moss: "#48675e",
        jade: "#2f8f7a",
        coral: "#d66b56",
        cloud: "#f6fbf8",
        shell: "#fff7ef"
      },
      boxShadow: {
        glass: "0 24px 80px rgba(24, 33, 31, 0.14)",
        soft: "0 12px 34px rgba(47, 143, 122, 0.12)"
      },
      borderRadius: {
        panel: "8px"
      }
    }
  },
  plugins: []
};

export default config;
