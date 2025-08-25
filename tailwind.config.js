// tailwind.config.js
import animate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  // Với Tailwind v4 và plugin Vite, bạn không cần thuộc tính "content" nữa.
  // Các thuộc tính như "darkMode", "theme", "extend" cũng được xử lý trong file CSS.
  
  // Bạn chỉ cần khai báo plugin ở đây.
  plugins: [
    animate
  ],
}