import { Component, inject } from '@angular/core';
import { AccessService } from '../../../../core/services/access.service';
import { AuthHelper } from '../../../../core/helpers/auth.helper';
import { UsuarioService } from '../../../../core/services/usuario.service';


@Component({
  selector: 'app-siderbar',
  standalone: false,
  templateUrl: './siderbar.html',
  styleUrl: './siderbar.css'
})
export class Siderbar {
  constructor(public access: AccessService
  ) { }
  authHelper = inject(AuthHelper);

  //atributos 
  nomeUsuario: string = '';
  usuarioLogado: any;
  ngOnInit() {
    this.usuarioLogado = this.authHelper.get();
    this.nomeUsuario = this.authHelper.get()?.nomeUsuario ?? 'Usuário';
  }
  logout() {
    if (confirm(`Deseja realmente sair do sistema, ${this.nomeUsuario}?`)) {
      this.authHelper.remove();//apagar os dados do usuario
      location.reload();//recarregar página
    }
  }
}
