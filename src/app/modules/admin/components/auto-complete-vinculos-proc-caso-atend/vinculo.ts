/*import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged } from "rxjs";

@Component({
  selector: 'app-vinculo',
  standalone:false,
  templateUrl: './vinculo.html'
})
export class Vinculo implements OnChanges {

  control = new FormControl('');
  mostrarSugestoes = false;
@Input() vinculoSelecionado: any;
  @Input() resultados: any[] = [];

  @Output() buscar = new EventEmitter<string>();
  @Output() selecionado = new EventEmitter<any>();

  constructor() {
    // 🔥 fluxo real de autocomplete
    this.control.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(valor => {
      const v = (valor ?? '').toString().trim();

      if (v.length >= 2) {
        this.mostrarSugestoes = true;   // 🔥 abre dropdown
        this.buscar.emit(v);
      } else {
        this.mostrarSugestoes = false;
        this.buscar.emit('');
      }
    });
  }
ngOnChanges() {
  if (this.vinculoSelecionado) {
    this.control.setValue(this.getLabel(this.vinculoSelecionado), {
      emitEvent: false
    });
  }
}
  selecionar(item: any) {
    this.control.setValue(this.getLabel(item), { emitEvent: false });
    this.mostrarSugestoes = false;
    this.selecionado.emit(item);
  }

  getLabel(item: any): string {
    if (item.numeroProcesso) return item.numeroProcesso + ' - ' + (item.titulo ?? '');
    if (item.titulo) return item.titulo;
    if (item.assunto) return item.assunto;
    return '';
  }

  abrir() {
    if (this.control.value && this.control.value.toString().length >= 2) {
      this.mostrarSugestoes = true;
    }
  }

  fechar() {
    setTimeout(() => this.mostrarSugestoes = false, 200);
  }
}*/

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged } from "rxjs";

@Component({
  selector: 'app-vinculo',
  standalone: false,
  templateUrl: './vinculo.html'
})
export class Vinculo {

  control = new FormControl<string>('');
  mostrarSugestoes = false;
@Input() tipoVinculo: string | null = null;
  @Input() resultados: any[] = [];

  private _vinculoSelecionado: any;

  @Input()
  set vinculoSelecionado(value: any) {
    this._vinculoSelecionado = value;

    if (value) {
      const label = this.getLabel(value);

      // 🔥 delay leve pra garantir render do input
      setTimeout(() => {
        this.control.setValue(label, { emitEvent: false });
      });
    } else {
      this.control.setValue('', { emitEvent: false });
    }
  }

  get vinculoSelecionado() {
    return this._vinculoSelecionado;
  }

  @Output() buscar = new EventEmitter<string>();
  @Output() selecionado = new EventEmitter<any>();

  constructor() {
    this.control.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(valor => {

      const v = (valor ?? '').toString().trim();

      if (v.length >= 2) {
        this.mostrarSugestoes = true;
        this.buscar.emit(v);
      } else {
        this.mostrarSugestoes = false;
        this.buscar.emit('');
      }
    });
  }

  selecionar(item: any) {
    this.control.setValue(this.getLabel(item), { emitEvent: false });
    this.mostrarSugestoes = false;
    this.selecionado.emit(item);
  }

  getLabel(item: any): string {

    if (!item) return '';

    if (item.numeroProcesso)
      return `${item.numeroProcesso} - ${item.titulo ?? ''}`;

    if (item.pasta)
      return item.pasta;

    if (item.assunto)
      return item.assunto;

    if (item.titulo)
      return item.titulo;

    return '';
  }

  abrir() {
    const v = (this.control.value ?? '').toString();

    if (v.length >= 2) {
      this.mostrarSugestoes = true;
    }
  }

  fechar() {
    setTimeout(() => this.mostrarSugestoes = false, 200);
  }
}