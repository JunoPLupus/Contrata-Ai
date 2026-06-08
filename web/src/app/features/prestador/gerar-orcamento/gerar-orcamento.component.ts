import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  private readonly orcamentosService = inject(OrcamentosService);

  protected submitted = false;
  protected chipSelecionado: 'amanha' | 'dois-dias' | null = null;

  // Dados mockados da solicitação que o prestador está respondendo
  readonly solicitacaoMock = {
    titulo: 'Instalação de ar-condicionado split 12.000 BTUs',
    tags: ['Urgente', 'Residencial'],
    descricao:
      'Preciso instalar um ar-condicionado split de 12.000 BTUs no quarto principal. ' +
      'A parede é de alvenaria e há tomada 220V disponível a cerca de 2 metros do local desejado. ' +
      'Necessário perfurar a parede para passagem de tubulação.',
    localizacao: 'Brasília, DF — Asa Norte',
    periodo: 'Manhã (08h – 12h)',
    fotos: ['foto1', 'foto2', 'foto3'],
  };

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

    const v = this.form.value;
    this.orcamentosService.criar({
      id_solicitacao: 'mock-solicitacao-001',
      id_prestador: 'mock-prestador-001',
      valor: v.valor!,
      prazo_dias: v.prazo_dias ?? undefined,
    });

    this.router.navigate(['/prestador/painel']);
  }
}
