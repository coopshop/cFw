﻿/*
 * Retorna a largura (width) ou altura (height) da janela.
 *
 * @name        wSize
 * @param       {String} ´h´ para height e ´w´ para width
 * @return      {Number} resultado
 * @sample      if(wSize('w') > 800) {};
 */

var wSize = function (type) {
    if (type == 'h') return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    if (type == 'w') return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

/************************************************************/

/*
 * Captura parametro passado via GET na URL
 *
 * @name        getUrlParameter
 * @param       {String} nome parametro a ser capturado
 * @return      {String} resultado
 * @sample      var x = getURLParameter('id');
 */

var getUrlParameter = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
};

/************************************************************/

/*
 * Trata a uma string contendo uma data retornando um objeto com suas propriedades
 *
 * @name        dealData
 * @param       {String} Data a ser tratada
 *              Deve ser passado no formato pt-BR, ex: ´16/12/2016´ ou ´16/12/2016 14:12:00´
 * @return:     {Object}
 *              {
 *                  day         // nº dia -> 01
 *                  month       // nº mês -> 12
 *                  year        // nº ano -> 2016
 *                  monthAbr    // nome abreviado mês (3 caracteres) -> dez
 *                  monthExt    // nome por extenso do mês -> dezembro
 *                  fullHour    // horario completo -> 12:10:00
 *                  hour        // nº hora -> 12
 *                  minute      // nº minuto -> 10
 *                  second      // nº segundos -> 00
 *              }
 * @sample      var data = 16/12/2016 14:12:00');
 *              console.info(data.monthExt); // imprime Dezembro
 */

var dealData = function (data) {
    var r = {};
    var date = data.split(' ');
    var monthExt = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'movembro', 'dezembro'];

    r.datetime = date[0].split('/').reverse().join('-');
    r.day = date[0].split('/')[0];
    r.monthAbr = monthExt[date[0].split('/')[1] - 1].substring(0, 3);
    r.monthExt = monthExt[date[0].split('/')[1] - 1];
    r.month = date[0].split('/')[1];
    r.year = date[0].split('/')[2];

    if (data.indexOf(' ') > -1) {
        r.fullhour = date[1].split(':')[0] + ':' + date[1].split(':')[1];
        r.hour = date[1].split(':')[0];
        r.minute = date[1].split(':')[1];
        r.second = date[1].split(':')[2];
    }

    return r;
}

/************************************************************/

/*
 * Substitui acentos pela caracter simples correspondente, remove pontos e
 * troca demais caracteres especiais por hifen
 *
 * @name        clearString
 * @param       {String} valor a ser tratado
 * @return      {String} resultado
 * @sample      console.info(clearString('ação.c|c.é')); // imprime acaoc-ce
 */

var clearString = function(string) {
    var retorno = string.toLowerCase();
    // faz as substituições dos acentos
    retorno = retorno.replace(/[á|ã|â|à]/gi, "a");
    retorno = retorno.replace(/[é|ê|è]/gi, "e");
    retorno = retorno.replace(/[í|ì|î]/gi, "i");
    retorno = retorno.replace(/[õ|ò|ó|ô]/gi, "o");
    retorno = retorno.replace(/[ú|ù|û]/gi, "u");
    retorno = retorno.replace(/[ç]/gi, "c");
    retorno = retorno.replace(/[ñ]/gi, "n");
    retorno = retorno.replace(/[á|ã|â]/gi, "a");
    // remove . (ponto)
    retorno = retorno.replace(/\./gi, "");
    // faz a substituição dos espaços e outros caracteres por - (hífen)
    retorno = retorno.replace(/\W/gi, "-");
    // remove - (hífen) duplicados
    retorno = retorno.replace(/(\-)\1+/gi, "-");

    return retorno;
}

/************************************************************/

/*
 * Altera apresentação do texto deixando somente a primeira letra maiúscula
 *
 * @name        capitalizeStr
 * @param       {String} valor a ser ´capitalizado´
 * @param       {Bolean} fazer ´capitalizamento´ em todas palavras ou somente na primeira da string
 * @return      {String} resultado
 * @sample      console.info(capitalize('boa ventura de são roque'));       // imprime Boa ventura de são roque
 * @sample      console.info(capitalize('boa ventura de são roque', true)); // imprime Boa Ventura de São Roque
 */

var capitalizeStr = function (string, eachWord) {
    var str;

    if (eachWord)
        str = string.replace(/\w\S*/g, function (txt) { return txt.length > 2 ? txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase() : txt; });
    else
        str = string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);

    return str;
}