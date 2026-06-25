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
      {
        path: 'solicitar-orcamento',
        loadComponent: () =>
          import('./features/cliente/solicitar-orcamento/solicitar-orcamento.component').then(m => m.SolicitarOrcamentoComponent),
      },
    ],
  },
  {
    path: 'prestador',
    loadComponent: () =>
      import('./shared/layouts/prestador/prestador-layout.component').then(m => m.PrestadorLayoutComponent),
    children: [
      { path: '', redirectTo: 'hub', pathMatch: 'full' },
      {
        path: 'hub',
        loadComponent: () =>
          import('./features/prestador/hub/hub-prestador.component').then(m => m.HubPrestadorComponent),
      },
      {
        path: 'gerar-orcamento',
        loadComponent: () =>
          import('./features/prestador/gerar-orcamento/gerar-orcamento.component').then(m => m.GerarOrcamentoComponent),
      },
    ],
  },
];
