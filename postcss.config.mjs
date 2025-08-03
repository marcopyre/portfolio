const config = {
  plugins: ["@tailwindcss/postcss"],
  theme: {
    extend: {
      
      animation: {
        fade: 'fadeOut 5s ease-in-out',
      },

      keyframes: theme => ({
        fadeOut: {
          '0%': { backgroundColor: theme('colors.red.300') },
          '100%': { backgroundColor: theme('colors.transparent') },
        },
      }),
    },
  },
};

export default config;
