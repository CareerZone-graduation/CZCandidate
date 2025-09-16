// tailwind.config.js
import animate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  // Với Tailwind v4 và plugin Vite, bạn không cần thuộc tính "content" nữa.
  // Mọi thứ được quản lý tự động.
  plugins: [
    animate
  ],
}