import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrcamentosService } from '../../../core/services/orcamentos.service';

@Component({
  selector: 'app-gerar-orcamento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gerar-orcamento.component.html',
  styleUrl: './gerar-orcamento.component.scss',
})
export class GerarOrcamentoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly orcamentosService = inject(OrcamentosService);

  readonly solicitacaoMock = {
    titulo: 'Solicitação',
    tags: [] as string[],
    descricao: '',
    localizacao: '',
    periodo: '',
    fotos: [] as string[],
  };

  protected submitted = false;
  protected chipSelecionado: 'amanha' | 'dois-dias' | null = null;
  protected loading = signal(false);
  protected erro = signal('');

  protected readonly form = this.fb.group({
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
    prazo_dias: [null as number | null],
  });

  protected get valorControl() { return this.form.controls.valor; }
  protected get prazoDiasControl() { return this.form.controls.prazo_dias; }

  selecionarChip(chip: 'amanha' | 'dois-dias'): void {
    this.chipSelecionado = this.chipSelecionado === chip ? null : chip;
  }

  onEnviar(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    const idSolicitacao = this.route.snapshot.queryParamMap.get('idSolicitacao') ?? '';
    const v = this.form.value;

    this.loading.set(true);
    this.erro.set('');

    this.orcamentosService.criar({
      id_solicitacao: idSolicitacao,
      valor: v.valor!,
      prazo_dias: v.prazo_dias ?? undefined,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/prestador/hub']);
      },
      error: (err) => {
        this.loading.set(false);
        this.erro.set(err?.error?.message ?? 'Erro ao enviar orçamento. Tente novamente.');
      },
    });
  }
}
