import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CadastroPayload, PerfilCadastro } from '../../../core/models/cadastro.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss',
})
export class CadastroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  perfilSelecionado: PerfilCadastro = 'cliente';
  senhaVisivel = false;
  protected submitted = false;
  protected readonly loading = signal(false);
  protected readonly erro = signal('');

  protected readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    whatsapp: ['', Validators.required],
    senha: ['', [Validators.required, Validators.minLength(8)]],
    aceiteTermos: [false, Validators.requiredTrue],
  });

  protected get nomeControl() { return this.form.controls.nome; }
  protected get emailControl() { return this.form.controls.email; }
  protected get whatsappControl() { return this.form.controls.whatsapp; }
  protected get senhaControl() { return this.form.controls.senha; }
  protected get aceiteTermosControl() { return this.form.controls.aceiteTermos; }

  selecionarPerfil(perfil: PerfilCadastro): void {
    this.perfilSelecionado = perfil;
  }

  toggleSenha(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    const v = this.form.value;
    const payload: CadastroPayload = {
      nome: v.nome!,
      email: v.email!,
      whatsapp: v.whatsapp!,
      senha: v.senha!,
      perfilEscolhido: this.perfilSelecionado,
      aceiteTermos: v.aceiteTermos!,
    };
    this.loading.set(true);
    this.erro.set('');
    this.authService.cadastrar(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login'], { state: { mensagem: 'Cadastro realizado com sucesso! Faça login para continuar.' } });
      },
      error: () => {
        this.loading.set(false);
        this.erro.set('Erro ao cadastrar. Verifique os dados e tente novamente.');
      },
    });
  }
}
