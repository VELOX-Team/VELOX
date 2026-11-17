import { defineConfig } from 'vite';

// base باید نام ریپو باشد، چون سایت روی velox-team.github.io/VELOX منتشر می‌شود
export default defineConfig({
  base: '/VELOX/',
  build: { target: 'es2020' }
});
