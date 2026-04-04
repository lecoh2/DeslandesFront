function limitarUf(valor) {
  if (!valor) return '';
  valor = valor.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 2);
  return valor;
}

function formatarTelefonesEmLinha(valor) {
  if (!valor) return '';
  return valor
    .split(';')
    .map(tel => {
      const cleaned = tel.replace(/\D/g, '');
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        return tel.trim();
      }
    })
    .join('; ');
}

function limitarTelefonesMaximo33Numeros(valor) {
  const apenasNumeros = valor.replace(/\D/g, '').substring(0, 33);
  let resultado = '';
  let contador = 0;

  while (contador < apenasNumeros.length) {
    const restante = apenasNumeros.length - contador;

    if (restante >= 11) {
      resultado += `(${apenasNumeros.substr(contador, 2)}) ${apenasNumeros.substr(contador + 2, 5)}-${apenasNumeros.substr(contador + 7, 4)}; `;
      contador += 11;
    } else if (restante >= 10) {
      resultado += `(${apenasNumeros.substr(contador, 2)}) ${apenasNumeros.substr(contador + 2, 4)}-${apenasNumeros.substr(contador + 6, 4)}; `;
      contador += 10;
    } else {
      break;
    }
  }

  return resultado.trim().replace(/;$/, '');
}

function validarQuantidadeTelefones(valor) {
  const telefones = valor.split(';').map(t => t.trim()).filter(t => t);
  return telefones.length <= 3;
}

function limitarSeparadoresTelefone(valor, event) {
  const quantidade = (valor.match(/;/g) || []).length;
  if (event.key === ';' && quantidade >= 2) {
    event.preventDefault();
  }
}
