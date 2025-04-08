import { Routes } from '@angular/router';
import { loginGuard } from './guards/login.guard';
import { ChatComponent } from './chat/chat.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then((m) => m.RegisterComponent),
    canActivate: [loginGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
    canActivate: [loginGuard],
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [authGuard],
    // loadComponent: () =>
    //   import('./chat/chat.component').then((m) => m.ChatComponent),
  },
  {
    path: '**',
    redirectTo: 'chat',
    pathMatch: 'full',
  },
];
