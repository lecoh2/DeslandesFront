import { Component, Input, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-texto-deslandes-animado',
  standalone:false,
  template: `<h1 class="maquina-escrever">{{ textoExibido }}</h1>`,
  styleUrls: ['./texto-deslandes-animado.css']
})
export class TextoDeslandesAnimado implements OnInit {
  @Input() frase: string = 'Sistema de Controle de Processos Judiciais';
  textoExibido: string = '';
  private index = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.digitar();
  }

  private digitar() {
    if (this.index < this.frase.length) {
      this.textoExibido += this.frase[this.index];
      this.index++;
      this.cdr.detectChanges(); // força update da view
      setTimeout(() => this.digitar(), 50);
    }
  }
}