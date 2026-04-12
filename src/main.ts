import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Import só o jQuery para garantir acesso a $
import 'jquery';

declare var $: any; // declare globalmente

function configurarDataTablesPadrao() {
  if ($ && $.fn && $.fn.dataTable) {
    $.extend(true, $.fn.dataTable.defaults, {
      language: {
        url: 'assets/appdeslandes/datatable/datatable-ptbr.json'
      },
      responsive: true
    });
  } else {
    console.warn('DataTables não está disponível para configuração global');
  }
}

// Aguarda o carregamento do jQuery e do DataTables via index.html
$(document).ready(() => {
  configurarDataTablesPadrao();
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
});
