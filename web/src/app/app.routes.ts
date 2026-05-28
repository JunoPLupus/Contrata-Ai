import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./features/auth/cadastro/cadastro.component').then(m => m.CadastroComponent),
  },
  {
    path: 'cliente',
    loadComponent: () =>
      import('./shared/layouts/logado/logado-layout.component').then(m => m.LogadoLayoutComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/cliente/home/home.component').then(m => m.HomeComponent),
      },
    ],
  },
];
