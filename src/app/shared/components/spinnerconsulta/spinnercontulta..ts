import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner-consulta', // <-- mudar para o selector que você vai usar no HTML
  standalone: false,
  templateUrl: './spinnerconsulta.html',
  styleUrls: ['./spinnerconsulta.css']
})
export class SpinnerConsulta {  // <-- nome da classe padronizado
  @Input() carregando: boolean = false;
  @Input() message: string = 'Consultando...';
}
