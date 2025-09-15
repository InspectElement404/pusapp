import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // allows external access
    port: 5173,
    allowedHosts: ["catos.bungangera.site"], // add your Cloudflare hostname
  },
});
