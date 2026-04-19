import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ListaTarefasResponse } from '../../../../core/models/tarefa/lista-tarefas-response';
import { ListaTarefaSelecionada } from '../../../../core/models/tarefa/lista-tarefa-selecionada';


@Component({
  standalone: false,
  selector: 'app-autocomplete-lista-tarefas',
  templateUrl: './autocomplete-lista-tarefas.html'
})
export class AutocompleteListaTarefas {

  // =========================
  // CONFIGURAÇÃO
  // =========================
  @Input() label: string = 'Listas de tarefas existentes';
  @Input() placeholder: string = 'Digite a descrição';

  // =========================
  // DADOS (BACKEND)
  // =========================
  @Input() resultados: ListaTarefasResponse[] = [];

  // =========================
  // DADOS (FRONT SELEÇÃO)
  // =========================
  @Input() selecionadas: ListaTarefaSelecionada[] = [];

  // =========================
  // OUTPUT
  // =========================
  @Output() buscar = new EventEmitter<string>();
  @Output() selecionadasChange = new EventEmitter<ListaTarefaSelecionada[]>();

  control = new FormControl('');
  mostrarSugestoes = false;

  // =========================
  // BUSCAR
  // =========================
  onBuscar() {
    const valor = this.control.value || '';
    this.buscar.emit(valor);
    this.mostrarSugestoes = true;
  }

  // =========================
  // SELECIONAR ITEM
  // =========================
  selecionar(item: ListaTarefasResponse) {

    const jaExiste = this.selecionadas.some(x =>
      x.descricao.toLowerCase() === item.descricao.toLowerCase()
    );

    if (!jaExiste) {
      const novo: ListaTarefaSelecionada = {
        id: undefined,
        descricao: item.descricao
      };

      this.selecionadas = [...this.selecionadas, novo];
      this.selecionadasChange.emit(this.selecionadas);
    }

    this.control.setValue('');
    this.mostrarSugestoes = false;
  }

  // =========================
  // REMOVER ITEM
  // =========================
  remover(item: ListaTarefaSelecionada) {
    this.selecionadas = this.selecionadas.filter(
      x => x.descricao !== item.descricao
    );

    this.selecionadasChange.emit(this.selecionadas);
  }

  // =========================
  // UX
  // =========================
  ocultarComDelay() {
    setTimeout(() => this.mostrarSugestoes = false, 200);
  }
}