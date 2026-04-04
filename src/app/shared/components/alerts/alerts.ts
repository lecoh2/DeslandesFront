import { Component, ElementRef, Input, ViewChild, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-alerts',
  standalone: false,
  templateUrl: './alerts.html',
  styleUrl: './alerts.css'
})
export class Alerts {

  //parâmentros do component
  @Input() icone: string = ''; // classe do ícone, ex: 'fas fa-check-circle'
  @Input() titulo: string = '';
  @Input() mensagens: string[] = [];
  @Input() tipo: 'success' | 'danger' | 'warning' | 'info' = 'success';

  @ViewChild('modalElement') modalElement!: ElementRef;

  fading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mensagens'] && this.mensagens.length > 0) {
      // Inicia fade após 2s
      setTimeout(() => {
        this.fading = true;
        // Remove após o fade (por exemplo, 0.5s depois)
        setTimeout(() => {
          this.fecharMensagem();
        }, 100);
      }, 10000);
    }
  }
  //função para fechar as mensagens
  fecharMensagem() {
    this.mensagens = [];
  }
}