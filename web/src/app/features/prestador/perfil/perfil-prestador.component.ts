import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prestador } from '../../../core/models/prestador.model';
import { Usuario } from '../../../core/models/usuario.model';
import { Avaliacao } from '../../../core/models/avaliacao.model';
import { Categoria } from '../../../core/models/categoria.model';

type AvaliacaoDisplay = Avaliacao & { nome_cliente?: string };

@Component({
  selector: 'app-perfil-prestador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-prestador.component.html',
  styleUrl: './perfil-prestador.component.scss',
})
export class PerfilPrestadorComponent {

  readonly prestador: Prestador = {
    _id: 'prest-001',
    id_usuario: 'usr-001',
    foto: '',
    telefone_profissional: '(11) 98765-4321',
    descricao:
      'Eletricista certificado com mais de 12 anos de experiência em instalações residenciais e comerciais. ' +
      'Especializado em instalação de ar-condicionado, quadros de distribuição, redes de dados e automação residencial. ' +
      'Atendo toda a Grande São Paulo com pontualidade e materiais de qualidade. ' +
      'Emito nota fiscal e ofereço garantia de 90 dias em todos os serviços realizados.',
  };

  readonly usuario: Usuario = {
    _id: 'usr-001',
    nome: 'Carlos Souza',
    email: 'carlos.souza@email.com',
    whatsapp: '(11) 98765-4321',
    localizacao_cidade: 'São Paulo',
  };

  readonly categorias: Categoria[] = [
    { _id: 'cat-eletrica', nome: 'Elétrica' },
    { _id: 'cat-climatizacao', nome: 'Climatização' },
  ];

  readonly avaliacoes: AvaliacaoDisplay[] = [
    {
      _id: 'av-001',
      id_prestador: 'prest-001',
      id_cliente: 'cli-001',
      nota: 5,
      comentario:
        'Profissional excelente! Chegou no horário combinado, fez o serviço com muito cuidado e deixou tudo limpo. Recomendo sem hesitar.',
      data: new Date('2026-06-10T10:00:00'),
      anonima: false,
      nome_cliente: 'Maria Santos',
    },
    {
      _id: 'av-002',
      id_prestador: 'prest-001',
      id_cliente: 'cli-002',
      nota: 4,
      comentario:
        'Ótimo trabalho na instalação do ar-condicionado. Único ponto foi um atraso de 30 minutos, mas avisou com antecedência.',
      data: new Date('2026-05-28T14:00:00'),
      anonima: true,
    },
    {
      _id: 'av-003',
      id_prestador: 'prest-001',
      id_cliente: 'cli-003',
      nota: 5,
      comentario:
        'Fez a troca do quadro elétrico com muita competência. Explicou tudo que foi feito e o preço foi muito justo.',
      data: new Date('2026-05-15T09:00:00'),
      anonima: false,
      nome_cliente: 'João Pereira',
    },
    {
      _id: 'av-004',
      id_prestador: 'prest-001',
      id_cliente: 'cli-004',
      nota: 3,
      comentario: 'Serviço bem feito, mas demorou mais que o prazo combinado.',
      data: new Date('2026-04-20T11:00:00'),
      anonima: true,
    },
  ];

  get notaMedia(): number {
    if (!this.avaliacoes.length) return 0;
    const soma = this.avaliacoes.reduce((acc, av) => acc + av.nota, 0);
    return soma / this.avaliacoes.length;
  }

  get iniciais(): string {
    return this.usuario.nome
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  starsArray(nota: number): { filled: boolean }[] {
    const rounded = Math.round(nota);
    return Array.from({ length: 5 }, (_, i) => ({ filled: i < rounded }));
  }

  autorDisplay(av: AvaliacaoDisplay): string {
    return av.anonima ? 'Anônimo' : (av.nome_cliente ?? 'Cliente');
  }
}
