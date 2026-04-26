import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';

@Component({
  selector: 'app-etiquetas',
  standalone:false,
  templateUrl: './cadastrar-etiquetas.html',
  styleUrls: ['./cadastrar-etiquetas.css']
})
export class CadastrarEtiquetas {

  @Input() etiquetas: ConsultarEtiquetaResponse[] = [];
  @Input() selecionadas: ConsultarEtiquetaResponse[] = [];

  @Output() selecionadasChange = new EventEmitter<ConsultarEtiquetaResponse[]>();

  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

  aberto = false;

  toggle(event?: Event) {
    event?.stopPropagation();
    this.aberto = !this.aberto;
  }

toggleEtiqueta(et: ConsultarEtiquetaResponse) {
  const existe = this.selecionadas?.some(e => e.id === et.id);

  const novaLista = existe
    ? this.selecionadas.filter(e => e.id !== et.id)
    : [...(this.selecionadas ?? []), et];

  this.selecionadas = novaLista;
  this.selecionadasChange.emit(novaLista);
}

remover(et: ConsultarEtiquetaResponse) {
  const novaLista = (this.selecionadas ?? [])
    .filter(e => e.id !== et.id);

  this.selecionadas = novaLista;
  this.selecionadasChange.emit(novaLista);
}

  isSelecionada(et: ConsultarEtiquetaResponse): boolean {
  return (this.selecionadas ?? []).some(e => e.id === et.id);
}

  @HostListener('document:click', ['$event'])
  clickFora(event: MouseEvent) {
    if (!this.dropdownRef?.nativeElement.contains(event.target)) {
      this.aberto = false;
    }
  }
}