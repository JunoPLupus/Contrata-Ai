import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected get emailControl() {
    return this.form.controls.email;
  }

  protected get senhaControl() {
    return this.form.controls.senha;
  }

  protected async onSubmit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.valid) {
      this.loading.set(true);
      this.erro.set(null);
      try {
        const token = await firstValueFrom(
          this.authService.login(this.form.value.email!, this.form.value.senha!)
        );
        this.authService.salvarToken(token);
        const tipo = this.authService.getTipoUsuario();
        this.router.navigate([tipo === 'prestador' ? '/prestador/hub' : '/cliente/home']);
      } catch {
        this.erro.set('Email ou senha inválidos');
      } finally {
        this.loading.set(false);
      }
    }
  }
}
