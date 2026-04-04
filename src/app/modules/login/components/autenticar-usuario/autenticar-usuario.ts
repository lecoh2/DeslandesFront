import { Component, inject } from '@angular/core';
import { UsuarioService } from '../../../../core/services/usuario.service';

import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHelper } from '../../../../core/helpers/auth.helper';
import { AutenticarUsuarioRequest } from '../../../../core/models/usuario/autenticar-usuario.request';

@Component({
  selector: 'app-autenticar-usuario',
  standalone: false,
  templateUrl: './autenticar-usuario.html',
  styleUrl: './autenticar-usuario.css'
})
export class AutenticarUsuario {

  private service = inject(UsuarioService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private helper = inject(AuthHelper);

  anoAtual: number = new Date().getFullYear();
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;

  form = this.builder.group({
    login: new FormControl('', []),
    senha: new FormControl('', [])
  });

  onSubmit() {
  if (this.form.invalid) {
    this.mensagemErro = ['Preencha todos os campos obrigatórios.'];
    return;
  }

  this.carregando = true;
  this.mensagemErro = [];
  this.mensagemSucesso = [];

  const request: AutenticarUsuarioRequest = {
    login: this.form.value.login as string,
    senha: this.form.value.senha as string
  };

  console.group('🚀 Enviando autenticação');
  console.log('📤 Request:', request);
  console.groupEnd();

  this.service.autenticar(request).subscribe({
    next: (response) => {
      console.group('✅ RESPOSTA DE SUCESSO');
      console.log('Status:', 200);
      console.log('Response completa:', response);
      console.groupEnd();

      this.form.reset();
      this.mensagemErro = [];

      // Cria sessão / token / etc.
      this.helper.create(response);

      const primeiroNome = response?.nomeUsuario?.split(' ')[0] || 'Usuário';
      this.mensagemSucesso = [
        `Usuário ${primeiroNome} autenticado com sucesso! Redirecionando...`
      ];

      this.carregando = false;

      setTimeout(() => {
        this.router.navigate(['/admin/painel-principal']);
      }, 4000);
    },

    error: (e) => {
      console.group('⚠️ ERRO DE AUTENTICAÇÃO');
      console.log('Status:', e.status);
      console.log('Response completa:', e);
      console.log('Body (e.error):', e.error);
      console.groupEnd();

      this.mensagemErro = [];

      // 🔹 Captura mensagens personalizadas do backend
      const mensagemBackend =
        e?.error?.mensagem ||
        e?.error?.Mensagem ||
        e?.error?.message ||
        (typeof e?.error === 'string' ? e.error : null);

      // 🔹 Define a mensagem de erro para o usuário
      if (mensagemBackend) {
        this.mensagemErro.push(mensagemBackend);
      } else if (e.status === 401) {
        this.mensagemErro.push('Credenciais inválidas. Verifique seu login e senha.');
      } else if (e.status === 403) {
        this.mensagemErro.push('Acesso negado. Sua conta pode estar bloqueada.');
      } else if (e.status === 0) {
        this.mensagemErro.push('Servidor indisponível. Verifique sua conexão.');
      } else {
        this.mensagemErro.push('Ocorreu um erro inesperado ao processar sua solicitação.');
      }

      this.carregando = false;
    }
  });
}

}
