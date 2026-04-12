import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // 🔓 páginas públicas (SEO / inicialização)
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login/**',
    renderMode: RenderMode.Prerender
  },

  // 🔒 área autenticada (evita conflito com SSR)
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },

  // fallback geral
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];