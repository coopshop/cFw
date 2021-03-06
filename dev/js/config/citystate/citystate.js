﻿(function () {

    var plugin = cfw.pathFile.plugin + 'citystate/citystate.min.js';
    cfw.getJS(plugin);

    cfw.citystate.start = function (options) {

        var config = {
            filterStates: [],
            group: Math.floor((Math.random()*9999)+1),
            selectState: null,
            selectCity: null,
            initials: false,
            initState: null,
            initCity: null
        };

        var options = $.extend(config, options);

        var si = setInterval(function () {
            if (cfw.loadedJS[plugin] == 'loaded') {
                clearInterval(si);

                citystate.options = options;
                citystate.init();

            }
        }, 100);
    }

    // eventos cidade/estado
    //$(document).on('cfw_cities_loaded', function (e, $el) {});
    //$(document).on('cfw_states_loaded', function (e, $el) {});

})();