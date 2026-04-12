import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo-animada',
  standalone: false,
  templateUrl: './logo-animada.html',
  styleUrls: ['./logo-animada.css']
})
export class LogoAnimada {
  @Input() tamanho: 'pequena' | 'media' | 'grande' = 'media'; // valor padrão
}
