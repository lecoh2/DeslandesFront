import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors.ts/auth.interceptor';
import { provideNgxMask } from 'ngx-mask';


export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxMask(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // 👇 AGORA COM INTERCEPTOR
    provideHttpClient(
      withFetch(),
      withInterceptors([AuthInterceptor])
    )
  ]
};