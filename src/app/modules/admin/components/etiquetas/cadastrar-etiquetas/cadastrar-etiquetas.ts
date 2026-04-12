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
    const existe = this.selecionadas.find(e => e.id === et.id);

    if (existe) {
      this.selecionadas = this.selecionadas.filter(e => e.id !== et.id);
    } else {
      this.selecionadas.push(et);
    }

    this.selecionadasChange.emit(this.selecionadas);
  }

  remover(et: ConsultarEtiquetaResponse) {
    this.selecionadas = this.selecionadas.filter(e => e.id !== et.id);
    this.selecionadasChange.emit(this.selecionadas);
  }

  isSelecionada(et: ConsultarEtiquetaResponse): boolean {
    return this.selecionadas.some(e => e.id === et.id);
  }

  @HostListener('document:click', ['$event'])
  clickFora(event: MouseEvent) {
    if (!this.dropdownRef?.nativeElement.contains(event.target)) {
      this.aberto = false;
    }
  }
}