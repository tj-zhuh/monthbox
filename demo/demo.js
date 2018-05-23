
require.config({
    paths: {
        "monthbox": "../src/monthbox",
        "jquery": "jquery-1.12.4"
    }
})

define(function (require) {

    var $ = require('jquery');
    var monthbox = require('monthbox');

    monthbox.config({
        //minYear: 2015,
        //minMonth: 6,
        //maxYear: 2018,
        //maxMonth: 8
    });

    monthbox.init();

    monthbox.change(function () {        
        $('.display').html('当前选择了' + monthbox.year + '年' + monthbox.month + '月');
    });

    $('html').click(function () {
        monthbox.hide();
    }) 

    $("#setEnable").click(function () {
        monthbox.setDisabled(false);
    })

    $("#setDisable").click(function () {
        monthbox.setDisabled(true);
    })
})
 

