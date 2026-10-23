import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SolicitacoesService } from '../../../core/services/solicitacoes.service';
import { ServicosService } from '../../../core/services/servicos.service';
import { Categoria } from '../../../core/models/categoria.model';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.scss',
})
export class ServicosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly solicitacoesService = inject(SolicitacoesService);
  private readonly servicosService = inject(ServicosService);

  protected submitted = false;
  protected categorias: Categoria[] = [];
  protected readonly loading = signal(false);
  protected readonly erro = signal('');
  protected readonly sucesso = signal(false);

  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    idCategoria: ['', Validators.required],
    descricao: ['', [Validators.minLength(5), Validators.maxLength(500)]],
    preco: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  protected get tituloControl() { return this.form.controls.titulo; }
  protected get categoriaControl() { return this.form.controls.idCategoria; }
  protected get descricaoControl() { return this.form.controls.descricao; }
  protected get precoControl() { return this.form.controls.preco; }

  ngOnInit(): void {
    this.solicitacoesService.getCategorias().subscribe({
      next: (cats) => {
        this.categorias = cats.map(c => ({ _id: c.id ?? c._id, nome: c.nome, descricao: c.descricao }));
      },
      error: () => {},
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    const v = this.form.value;
    this.loading.set(true);
    this.erro.set('');
    this.sucesso.set(false);

    this.servicosService.cadastrar({
      titulo: v.titulo!.trim(),
      idCategoria: v.idCategoria!,
      descricao: v.descricao?.trim() || undefined,
      preco: v.preco!,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.sucesso.set(true);
        this.submitted = false;
        this.form.reset();
      },
      error: (err) => {
        this.loading.set(false);
        this.erro.set(err?.error?.message ?? 'Erro ao cadastrar serviço. Tente novamente.');
      },
    });
  }
}
