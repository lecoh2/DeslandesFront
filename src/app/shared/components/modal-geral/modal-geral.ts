import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-modal-geral',
  standalone:false,
  templateUrl: './modal-geral.html',
  styleUrls: ['./modal-geral.css']
})
export class ModalGeral {
@Input() id!: string; // id do modal
  @Input() titulo: string = 'Modal';
  @Input() control: any; // pode ser FormControl ou outro objeto
  @Input() itensSelecionados: any[] = [];
  @Input() itensFiltrados: any[] = [];

  @Output() selecionar = new EventEmitter<any>();
  @Output() removerSelecionado = new EventEmitter<any>();
  @Output() salvar = new EventEmitter<void>();

  // Funções internas para emitir eventos
  onSelecionar(item: any) {
    this.selecionar.emit(item);
  }

  onRemover(item: any) {
    this.removerSelecionado.emit(item);
  }

  onSalvar() {
    this.salvar.emit();
  }
}