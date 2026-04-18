import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConsultarUsuarioResponse } from '../../../../core/models/usuario/consultar-usuarios.response';

@Component({
  selector: 'app-selecionar-responsaveis',
  standalone: false,
  templateUrl: './cadastrar-responsaveis.html'
})
export class CadastrarResponsaveis {
  @Input() label: string = 'Responsáveis';
  @Input() resultados: ConsultarUsuarioResponse[] = [];
  @Input() selecionadas: ConsultarUsuarioResponse[] = [];

  @Output() selecionadasChange = new EventEmitter<ConsultarUsuarioResponse[]>();
  @Output() buscar = new EventEmitter<string>();

  control = new FormControl('');
  aberto = false;

  // 🔍 busca automática igual UX moderno
  ngOnInit() {
    this.control.valueChanges.subscribe(valor => {
      this.buscar.emit(valor || '');
      this.aberto = true;
    });
  }

  selecionar(usuario: ConsultarUsuarioResponse) {
    const existe = this.selecionadas.find(e => e.id === usuario.id);

    if (existe) {
      this.selecionadas = this.selecionadas.filter(e => e.id !== usuario.id);
    } else {
      this.selecionadas = [...this.selecionadas, usuario];
    }

    this.selecionadasChange.emit(this.selecionadas);
    this.control.setValue('');
    this.aberto = false;
  }

  remover(usuario: ConsultarUsuarioResponse) {
    this.selecionadas = this.selecionadas.filter(e => e.id !== usuario.id);
    this.selecionadasChange.emit(this.selecionadas);
  }

  isSelecionado(usuario: ConsultarUsuarioResponse): boolean {
    return this.selecionadas.some(e => e.id === usuario.id);
  }
}