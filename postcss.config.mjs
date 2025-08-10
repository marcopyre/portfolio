// Next.js + Tailwind v4: PostCSS config should only include plugins
// Remove unsupported fields like `theme` to avoid warnings.
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
