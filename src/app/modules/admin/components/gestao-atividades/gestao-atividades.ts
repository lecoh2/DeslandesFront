import { Component, OnInit } from '@angular/core';

interface ItemKanban {
  id: string;
  titulo: string;
  tipo: string;
  data: Date;
  responsavel: string;
  status: string;
}

@Component({
  selector: 'app-gestao-atividades',
  standalone:false,
  templateUrl: './gestao-atividades.html',
  styleUrl: './gestao-atividades.css'
})
export class GestaoAtividades implements OnInit {

  // 🔎 FILTROS
  filtro = {
    periodo: null as string | null,
    atribuicao: null as string | null,
    pessoaId: null as string | null,
    tipo: null as string | null,
    status: null as string | null
  };

  // 📋 LISTAS DE FILTRO
  periodos = [
    'Hoje',
    'Ontem',
    'Amanhã',
    'Esta semana',
    'Este mês',
    'Próximo mês',
    'Últimos 7 dias',
    'Últimos 30 dias'
  ];

  atribuicoes = [
    'Minhas',
    'Todas',
    'Criadas por mim',
    'Sou responsável',
    'Sou envolvido'
  ];

  tipos = ['Tarefa', 'Prazo', 'Audiência'];

  statusList = [
    'A Fazer',
    'Em Andamento',
    'Prazo',
    'Concluído',
    'Cancelado'
  ];

  // 👥 MOCK (depois vem do backend)
  pessoas = [
    { id: '1', nome: 'João' },
    { id: '2', nome: 'Maria' }
  ];

  // 📦 TODOS OS ITENS
  todosItens: ItemKanban[] = [];

  // 🧱 COLUNAS KANBAN
  colunas = [
    { nome: 'A Fazer', itens: [] as ItemKanban[] },
    { nome: 'Em Andamento', itens: [] as ItemKanban[] },
    { nome: 'Prazo', itens: [] as ItemKanban[] },
    { nome: 'Concluído', itens: [] as ItemKanban[] },
    { nome: 'Cancelado', itens: [] as ItemKanban[] }
  ];

  // ================= INIT =================
  ngOnInit(): void {
    this.carregarMock();
    this.distribuirKanban();
  }

  // ================= MOCK =================
  carregarMock() {
    this.todosItens = [
      {
        id: '1',
        titulo: 'Petição inicial',
        tipo: 'Tarefa',
        data: new Date(),
        responsavel: 'João',
        status: 'A Fazer'
      },
      {
        id: '2',
        titulo: 'Audiência trabalhista',
        tipo: 'Audiência',
        data: new Date(),
        responsavel: 'Maria',
        status: 'Prazo'
      },
      {
        id: '3',
        titulo: 'Revisar contrato',
        tipo: 'Prazo',
        data: new Date(),
        responsavel: 'João',
        status: 'Em Andamento'
      }
    ];
  }

  // ================= DISTRIBUI =================
  distribuirKanban() {
    // limpa colunas
    this.colunas.forEach(c => c.itens = []);

    // distribui
    this.todosItens.forEach(item => {
      const coluna = this.colunas.find(c => c.nome === item.status);
      if (coluna) {
        coluna.itens.push(item);
      }
    });
  }

  // ================= FILTRO =================
  filtrar() {
    let lista = [...this.todosItens];

    // 🔎 FILTRO POR TIPO
    if (this.filtro.tipo) {
      lista = lista.filter(i => i.tipo === this.filtro.tipo);
    }

    // 🔎 FILTRO POR STATUS
    if (this.filtro.status) {
      lista = lista.filter(i => i.status === this.filtro.status);
    }

    // 🔎 FILTRO POR RESPONSÁVEL
    if (this.filtro.pessoaId) {
      const pessoa = this.pessoas.find(p => p.id === this.filtro.pessoaId);
      if (pessoa) {
        lista = lista.filter(i => i.responsavel === pessoa.nome);
      }
    }

    // 👉 depois você pode adicionar:
    // periodo, atribuicao, etc.

    this.atualizarColunas(lista);
  }

  atualizarColunas(lista: ItemKanban[]) {
    this.colunas.forEach(c => c.itens = []);

    lista.forEach(item => {
      const coluna = this.colunas.find(c => c.nome === item.status);
      if (coluna) {
        coluna.itens.push(item);
      }
    });
  }

}