import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
 standalone: false,
  templateUrl: './spinner.html',
  styleUrls: ['./spinner.css']
})
export class Spinner {
  @Input() show: boolean = false;
  @Input() message: string = 'Carregando...';
}


