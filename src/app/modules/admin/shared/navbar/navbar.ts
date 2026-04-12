import { Component, inject, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { AuthHelper } from '../../../../core/helpers/auth.helper';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements AfterViewInit {
  // Injeta ElementRef e Renderer2
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private usuarioService = inject(UsuarioService);
  //injeção de depedencia
  authHelper = inject(AuthHelper);
  //atributos 
  nomeUsuario: string = '';
  usuarioLogado: any;
  fotoUsuario: string = 'assets/appprocon/img/default-avatar.jpg';
  //função executada ao abrir a pagina
  ngOnInit() {
    //capturar o nome do usuário autenticado
    this.usuarioLogado = this.authHelper.get();
    this.nomeUsuario = this.authHelper.get()?.nomeUsuario ?? 'Usuário';
    this.usuarioService.consultarPerfilUsuarioPorId(this.usuarioLogado.idUsuario).subscribe({
      next: (response) => {
        const usuario = Array.isArray(response) ? response[0] : response;

       // this.fotoUsuario = usuario.fotos?.fileUrl
      //    ? `${environment.apiDeslandes}${usuario.fotos.fileUrl}`
      //    : 'assets/appdeslandes/img/default-avatar.jpg';

      },

    });
  }
  ngAfterViewInit() {
    const sidebar = document.querySelector('.sidebar'); // Busca global (caso sidebar esteja fora do navbar)
    const toggleBtn = this.el.nativeElement.querySelector('.sidebar-toggle');

    if (sidebar && toggleBtn) {
      this.renderer.listen(toggleBtn, 'click', () => {
        sidebar.classList.toggle('collapsed');
        window.dispatchEvent(new Event('resize'));
      });
    }
  }
  toggleTheme(): void {
    const themeKey = 'appstack-config-theme';
    const currentTheme = localStorage.getItem(themeKey);
    const newTheme = currentTheme === 'dark' ? 'default' : 'dark';

    document.documentElement.setAttribute('data-bs-theme', newTheme);
    document.documentElement.setAttribute('data-sidebar-theme', newTheme);
    localStorage.setItem(themeKey, newTheme);

    document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
  }
  logout() {
    if (confirm(`Deseja realmente sair do sistema, ${this.nomeUsuario}?`)) {
      this.authHelper.remove();//apagar os dados do usuario
      location.reload();//recarregar página
    }
  }
}
