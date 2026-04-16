import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PessoaResumo } from '../../../../core/models/pessoa/pessoa-resumo';
import { PessoaSelecionada } from '../../../../core/models/pessoa/pessoa-selecionada';
import { PessoaSelecionadaAtendimento } from '../../../../core/models/pessoa/pessoa-selecionada-atendimento';

@Component({
  standalone: false,
  selector: 'app-autocomplete-pessoa-atendimento',
  templateUrl: './autocomplete-pessoa-atendimento.html'
})
export class AutocompletePessoaAtendimento {

  @Input() label: string = 'Pessoa';
  @Input() placeholder: string = 'Digite o nome';

  @Input() resultados: PessoaResumo[] = [];
  @Input() selecionadas: PessoaSelecionadaAtendimento[] = [];

  @Output() buscar = new EventEmitter<string>();
  @Output() selecionadasChange = new EventEmitter<PessoaSelecionadaAtendimento[]>();

  control = new FormControl('');
  mostrarSugestoes = false;

  onBuscar() {
    const valor = this.control.value || '';
    this.buscar.emit(valor);
  }

  selecionar(p: PessoaResumo) {
    const jaExiste = this.selecionadas.some(x => x.id === p.id);

    if (!jaExiste) {
      const novaPessoa: PessoaSelecionadaAtendimento = {
        ...p
      };

      this.selecionadas = [...this.selecionadas, novaPessoa];
      this.selecionadasChange.emit(this.selecionadas);
    }

    this.control.setValue('');
    this.mostrarSugestoes = false;
  }

  remover(p: PessoaSelecionadaAtendimento) {
    this.selecionadas = this.selecionadas.filter(x => x.id !== p.id);
    this.selecionadasChange.emit(this.selecionadas);
  }

  ocultarComDelay() {
    setTimeout(() => this.mostrarSugestoes = false, 200);
  }
}