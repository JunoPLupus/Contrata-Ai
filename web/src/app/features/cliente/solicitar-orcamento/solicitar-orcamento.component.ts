import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitacoesService } from '../../../core/services/solicitacoes.service';
import { Categoria } from '../../../core/models/categoria.model';
import { TipoSolicitacao } from '../../../core/models/solicitacao.model';
@Component({
  selector: 'app-solicitar-orcamento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './solicitar-orcamento.component.html',
  styleUrl: './solicitar-orcamento.component.scss',
})
export class SolicitarOrcamentoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly solicitacoesService = inject(SolicitacoesService);
  protected submitted = false;
  protected categorias: Categoria[] = [
    { _id: '', nome: 'Elétrica', descricao: 'Serviços elétricos' },
    { _id: '', nome: 'Hidráulica', descricao: 'Encanamento e vazamentos' },
    { _id: '', nome: 'Pintura', descricao: 'Pintura residencial e comercial' },
    { _id: '', nome: 'Limpeza', descricao: 'Limpeza residencial e comercial' },
    { _id: '', nome: 'Jardinagem', descricao: 'Manutenção de jardins' },
    { _id: '', nome: 'TI & Tecnologia', descricao: 'Suporte técnico e redes' },
  ];
  protected prestadores: { _id: string; nome: string }[] = [];
  protected readonly loading = signal(false);
  protected readonly erro = signal('');
  protected readonly form = this.fb.group({
    tipo: ['geral' as TipoSolicitacao],
    id_categoria: ['', Validators.required],
    descricao: ['', [Validators.required, Validators.minLength(10)]],
    id_prestador_direto: [''],
  });
  protected get tipoControl() { return this.form.controls.tipo; }
  protected get categoriaControl() { return this.form.controls.id_categoria; }
  protected get descricaoControl() { return this.form.controls.descricao; }
  protected get prestadorControl() { return this.form.controls.id_prestador_direto; }
  ngOnInit(): void {
    this.solicitacoesService.getCategorias().subscribe({
      next: (cats) => {
        if (cats?.length) {
          this.categorias = cats.map(c => ({ _id: c.id || c._id, nome: c.nome, descricao: c.descricao }));
        }
      },
      error: () => {},
    });
    this.solicitacoesService.buscarPrestadores().subscribe({
      next: (prestadores) => this.prestadores = prestadores,
      error: () => {},
    });
    this.tipoControl.valueChanges.subscribe(tipo => {
      const prestadorCtrl = this.prestadorControl;
      if (tipo === 'direto') {
        prestadorCtrl.setValidators([Validators.required]);
      } else {
        prestadorCtrl.clearValidators();
        prestadorCtrl.setValue('');
      }
      prestadorCtrl.updateValueAndValidity();
    });
  }
  selecionarTipo(tipo: TipoSolicitacao): void {
    this.tipoControl.setValue(tipo);
  }
  onSubmit(): void {
    this.submitted = true;
    console.log('form válido?', this.form.valid, this.form.value);
    if (this.form.invalid) return;
    const v = this.form.value;
    const tipo = v.tipo as TipoSolicitacao;
    this.loading.set(true);
    this.erro.set('');
    this.solicitacoesService.criar({
      id_categoria: v.id_categoria!,
      tipo,
      descricao: v.descricao!,
      ...(tipo === 'direto' && v.id_prestador_direto
        ? { id_prestador_direto: v.id_prestador_direto }
        : {}),
    }).subscribe({
      next: () => this.router.navigate(['/cliente/home']),
      error: () => {
        this.loading.set(false);
        this.erro.set('Erro ao enviar solicitação. Tente novamente.');
      },
    });
  }
  voltar(): void {
    this.router.navigate(['/cliente/home']);
  }
}