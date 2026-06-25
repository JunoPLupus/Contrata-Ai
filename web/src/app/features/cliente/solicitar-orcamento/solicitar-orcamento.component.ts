import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitacoesService } from '../../../core/services/solicitacoes.service';
import { Categoria } from '../../../core/models/categoria.model';
import { TipoSolicitacao } from '../../../core/models/solicitacao.model';

interface PrestadorMock {
  _id: string;
  nome: string;
}

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

  readonly categorias: Categoria[] = [
    { _id: 'cat-1', nome: 'Elétrica', descricao: 'Serviços elétricos residenciais e comerciais' },
    { _id: 'cat-2', nome: 'Hidráulica', descricao: 'Encanamento, vazamentos, instalações' },
    { _id: 'cat-3', nome: 'Pintura', descricao: 'Pintura interna, externa e textura' },
    { _id: 'cat-4', nome: 'Marcenaria', descricao: 'Móveis sob medida, reparos em madeira' },
    { _id: 'cat-5', nome: 'Limpeza', descricao: 'Limpeza residencial e comercial' },
    { _id: 'cat-6', nome: 'Jardinagem', descricao: 'Manutenção de jardins e áreas verdes' },
    { _id: 'cat-7', nome: 'Refrigeração', descricao: 'Ar condicionado e geladeiras' },
    { _id: 'cat-8', nome: 'TI & Tecnologia', descricao: 'Suporte técnico, redes e computadores' },
  ];

  readonly prestadores: PrestadorMock[] = [
    { _id: 'prest-1', nome: 'Ricardo Volt — Elétrica' },
    { _id: 'prest-2', nome: 'Maria Silva — Pintura' },
    { _id: 'prest-3', nome: 'Carlos Hidro — Hidráulica' },
    { _id: 'prest-4', nome: 'Ana Jardins — Jardinagem' },
    { _id: 'prest-5', nome: 'Pedro Tech — TI & Tecnologia' },
  ];

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
    if (this.form.invalid) return;

    const v = this.form.value;
    const tipo = v.tipo as TipoSolicitacao;

    this.solicitacoesService.criar({
      id_cliente: 'user-001',
      id_categoria: v.id_categoria!,
      tipo,
      descricao: v.descricao!,
      ...(tipo === 'direto' && v.id_prestador_direto
        ? { id_prestador_direto: v.id_prestador_direto }
        : {}),
    });

    this.router.navigate(['/cliente/home']);
  }

  voltar(): void {
    this.router.navigate(['/cliente/home']);
  }
}
