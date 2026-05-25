import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CadastroPayload } from '../../../core/models/cadastro.model';
import { Perfil } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss',
})
export class CadastroComponent {
  private readonly fb = inject(FormBuilder);

  perfilSelecionado: Perfil = 'cliente';
  senhaVisivel = false;
  protected submitted = false;

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

  selecionarPerfil(perfil: Perfil): void {
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
      perfis: this.perfilSelecionado === 'prestador' ? ['cliente', 'prestador'] : ['cliente'],
      aceiteTermos: v.aceiteTermos!,
    };
    console.log(payload);
  }
}
