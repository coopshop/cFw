﻿(function (w) {
    "use strict";

    var cfwValidaForm = function () { };

        cfwValidaForm.prototype.init = function () {
            var that = this;
            this.dealActions();

            $('body').find('[type="submit"]').on('click', function (e) {

                var $form = $(this).closest(that.options.form);

                if ($form.length) {
                    if (!that.validaForm($form))
                        e.preventDefault();
                }
            });
        }

        cfwValidaForm.prototype.validaForm = function ($form) {
            var r = true,
                that = this;

            $form.find('[data-validate]').each(function () {
                var type = $(this).attr('data-validate').toLowerCase() || $(this).attr('type').toLowerCase(),
                    val = $(this).val();

                if ($(this).is(':visible') || type == 'hidden') {

                    if (that.valida.hasOwnProperty(type)) {
                        r = that.valida[type]($(this));

                        that.warnCli(type, $(this), r);

                        if (r != true) {
                            $(document).trigger('cfw_validaform_error', [$form, type, $(this), r]);
                            return false;
                        }

                    } else
                        console.warn('´'+type + '´ não é um tipo de validação existente');

                } else {
                    console.warn('element: #' + $(this).attr('id') + ';\nvalida: ' + type + ';\nhidden: true;');
                }

            });

            return r;
        }

        cfwValidaForm.prototype.valida = {
            //
            clearStr: function (val) {
                return val.replace(/[^\w]/gi, '');
            },

            charsDistinct: function(val){
                return !!!val.match(/^(\d)\1*$/);
            },

            checkOptional: function ($el, callback) {
                if ($el.attr('data-validate-optional') == 'true' && !this.required($el))
                    return true;
                else
                    return callback();
            },

            //
            required: function ($el) {
                return !!this.clearStr($el.val().trim());
            },

            fullname: function ($el) {
                return this.checkOptional($el, function () {
                    return $el.val().trim().split(' ').length > 1;
                });
            },

            email: function ($el) {
                return this.checkOptional($el, function () {
                    var er = new RegExp(/^[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]{2,}\.[A-Za-z0-9]{2,}(\.[A-Za-z0-9])?/);
                    return !!er.test($el.val().trim());
                });
            },

            cpf: function ($el) {
                var that = this;

                return that.checkOptional($el, function () {
                    var val = that.clearStr($el.val());

                    // Elimina CPFs invalidos conhecidos e Qtd Chars
                    if (val.length != 11 || !that.charsDistinct(val))
                        return false;

                    // Valida 1o digito
                    var add = 0;
                    for (var i = 0; i < 9; i++)
                        add += parseInt(val.charAt(i)) * (10 - i);
                    var rev = 11 - (add % 11);
                    if (rev == 10 || rev == 11)
                        rev = 0;
                    if (rev != parseInt(val.charAt(9)))
                        return false;

                    // Valida 2o digito
                    var add = 0;
                    for (var i = 0; i < 10; i++)
                        add += parseInt(val.charAt(i)) * (11 - i);
                    var rev = 11 - (add % 11);
                    if (rev == 10 || rev == 11)
                        rev = 0;
                    if (rev != parseInt(val.charAt(10)))
                        return false;

                    return true;
                });
            },

            cnpj: function ($el) {
                var that = this;

                return that.checkOptional($el, function () {
                    var val = that.clearStr($el.val());

                    // Elimina CNPJs invalidos conhecidos
                    if (val.length != 14 || !that.charsDistinct(val))
                        return false;

                    // Valida DVs
                    var tamanho = val.length - 2
                    var numeros = val.substring(0, tamanho);
                    var digitos = val.substring(tamanho);
                    var soma = 0;
                    var pos = tamanho - 7;
                    for (var i = tamanho; i >= 1; i--) {
                        soma += numeros.charAt(tamanho - i) * pos--;
                        if (pos < 2)
                            pos = 9;
                    }
                    var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
                    if (resultado != digitos.charAt(0))
                        return false;

                    var tamanho = tamanho + 1;
                    var numeros = val.substring(0, tamanho);
                    var soma = 0;
                    var pos = tamanho - 7;
                    for (i = tamanho; i >= 1; i--) {
                        soma += numeros.charAt(tamanho - i) * pos--;
                        if (pos < 2)
                            pos = 9;
                    }
                    var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
                    if (resultado != digitos.charAt(1))
                        return false;

                    return true;
                });
            },

            url: function ($el) {
                return this.checkOptional($el, function () {
                    var er = new RegExp(/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i);
                    return !!er.test($el.val().trim());
                });
            },

            file: function ($el) {
                if (window.FileReader && window.FileReader.prototype.readAsArrayBuffer) {
                    var files = $el[0].files;

                    if (files.length > 0) {
                        var sizeLimit = $el.attr('data-validate-size');
                        var typeLimit = $el.attr('data-validate-ext');

                        if (!sizeLimit && !typeLimit) {
                            console.warn('´file´ precisa de mais um parametro para validação (data-validate-size ou data-validate-ext)');
                            return true;
                        }

                        if (+sizeLimit < Math.ceil(files[0].size / 1024))
                            return 'file_size';

                        if (typeLimit.indexOf(files[0].name.substr(-3)) < 0)
                            return 'file_ext';

                        return true;
                    }
                    else {
                        return $el.attr('data-validate-optional') == 'true';
                    }
                } else {
                    console.warn('FileReader API Not Supported');
                    return true;
                }
            },

            compare: function ($el) {
                var group = $el.attr('data-validate-group');
                var that = this;

                if(!group){
                    console.warn('Obrigatório parametro ´data-validate-group´ com a validação ´Compare´');
                    return true;
                }

                if(group){
                    var itens = $('[data-validate-group]:visible'),
                        tmpValue,
                        r = true;

                    $.each(itens, function () {
                        if (!r) return false;

                        var val = that.clearStr($(this).val());

                        if ($el.attr('data-validate-optional') != 'true' && !val)
                            r = false;

                        else if (typeof (tmpValue) === 'undefined')
                            tmpValue = val;

                        else if (tmpValue != val)
                            r = false;
                    });

                    return r;
                }
            },

            checkbox: function ($el) {
                var name = $el.attr('name');
                var qtdMin = $el.attr('data-validate-qtd').split(',')[0];
                var qtdMax = $el.attr('data-validate-qtd').split(',')[1] || $('input[name="' + name + '"]').length;
                var qtdSel = $('input[name="' + name + '"]:checked:visible').length;

                if (!name) {
                    console.warn('´checkbox´ precisa de um name.')
                    return true;
                }

                if (qtdSel)
                    return qtdSel >= qtdMin && qtdSel <= qtdMax;

                if (!qtdSel && $el.attr('data-validate-optional') == 'true')
                    return true;

            },

            hidden: function ($el) {
                return !!this.required($el);
            }
        }

        cfwValidaForm.prototype.warnCli = function (type, $el, situ) {

            if (situ != true) {
                var msgs = {
                    required: {
                        false: 'Campo obrigatório'
                    },
                    fullname: {
                        false: 'Preencha com seu Nome Completo (Nome Sobrenome)'
                    },
                    email: {
                        false: 'Utilize um email válido'
                    },
                    cpf: {
                        false: 'CPF inválido'
                    },
                    cnpj: {
                        false: 'CNPJ inválido'
                    },
                    url: {
                        false: 'URL inválida'
                    },
                    file: {
                        false: 'Campo obrigatório',
                        file_size: 'Tamanho do arquivo excedeu {size}Mb',
                        file_ext: 'Extensão do arquivo não permitida, envie: {ext}',
                    },
                    compare: {
                        false: 'Os valores dos campos devem ser iguais'
                    },
                    checkbox: {
                        false: 'Selecione ao menos {qtd} itens'
                    },
                    hidden: {
                        false: 'Campo obrigatório'
                    }
                }

                var msg = $el.attr('data-validate-txt') || msgs[type][situ];

                if (msg.indexOf('{') > 0) {
                    var regex = new RegExp(/({[\w]+})/gi),
                        info = msg.match(regex),
                        nvalue;

                    switch (info[0]) {
                        case '{size}':
                            nvalue = +$el.attr('data-validate-size')/1024;
                            break;
                        case '{qtd}':
                            var d = $el.attr('data-validate-qtd').split(',');
                            nvalue = d[0];
                            if (d[1]) nvalue += ' e no máximo ' + d[1];
                            break;
                        default:
                            nvalue = $el.attr('data-validate-' + info[0].replace(/[{}]/g, ''));
                            break;
                    }

                    msg = msg.replace(info[0], nvalue);
                }

                $el.focus();

                var parentEl = $el.attr('data-validate-target') ? $el.closest($el.attr('data-validate-target')) : $el.parent();

                parentEl
                  .addClass('cfw-input-invalid')
                  .attr('data-tooltip', msg);
            }

            if (situ == true)
                this.resetWarn();

        },

        cfwValidaForm.prototype.resetWarn = function () {
            $(this.options.form).find('.cfw-input-invalid').removeClass('cfw-input-invalid').removeAttr('data-tooltip');
        }

        cfwValidaForm.prototype.dealActions = function () {

            var $form = $(this.options.form),
                that = this;

            $form.on('keypress', 'input, select, textarea', function (e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    $form.find('[type=submit]:lt(1)').trigger('click');
                }
                else
                    that.resetWarn();
            });

            $form.on('change paste', 'input, select, textarea', function (e) {
                that.resetWarn();
            });
        }

    // commonjs
    if (typeof exports !== "undefined")
        exports.cfwValidaForm = cfwValidaForm;
    else
        w.cfwValidaForm = cfwValidaForm;

}(typeof global !== "undefined" ? global : this));