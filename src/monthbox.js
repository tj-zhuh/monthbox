; (function (root, factory) {
    if (typeof define == 'function' && define.amd) {
        define(function (require) {
            var jquery = require('jquery');
            return factory(jquery);
        })
    }
    else {
        root.monthbox = factory(root.$)
    }
}(this, function ($) {

    if (typeof $ !== 'function')
        throw new Error('模块$获取失败');

    var manager = (function ($) {
        return {
            privates: [],
            instances: [],
            ctor: null,
            create: function () {
                if (typeof ctor !== 'function')
                    throw new Error('ctor不是函数');

                var obj = new ctor();
                this.privates.push({});
                this.instances.push(obj);
                return obj;

            },
            getp: function (obj, key) {
                if (!obj || typeof key !== 'string')
                    throw new Error('getp函数参数不正确');

                for (var i = 0; i < this.instances.length; i++) {
                    if (this.instances[i] === obj) {
                        return this.privates[i][key];
                    }
                }

            },
            setp: function (obj, key, value) {

                if (!obj || typeof key !== 'string')
                    throw new Error('getp函数参数不正确');

                for (var i = 0; i < this.instances.length; i++) {
                    if (this.instances[i] === obj) {
                        this.privates[i][key] = value;
                    }
                }
            },
            fac: function (ctor) {
                var that = this;
                this.ctor = ctor;
                var dfObj = this.create();
                function ret() {
                    return that.create();
                };
                $.extend(ret, dfObj);
                ret.version = typeof version === 'string' ? version : undefined;
                this.instances[0] = ret;
                return ret;
            }
        };
    })($);

    var defOptions = {
        selector: '.monthbox',
        minYear: '', // 最小的年
        minMonth: '', // 最小的月
        maxYear: '', // 最大的年
        maxMonth: '', // 最大的月
        defYear: '', // 默认的年
        defMonth: '' // 默认的月
    };

    // 月份
    function Month() {
        this.element; // 元素
        this.name;  // 文字  01 02 ... 12
        this.num;  //月份数字  1～12
    }

    function ctor() {
        this.element;    // 容器
        this.elementText; // 文本框
        this.elementPanel;  // 下拉框
        this.elementPre; // 向前的按钮
        this.elementPost; // 向后的按钮
        this.elementYear; // 年
        this.ul;      // ul元素
        this.months = [];  // 月份列表

        this.year;   // 当前选择的年
        this.month;  // 当前选中的月

        this.beforeTextClickHandler;  // 点击text元素之前的事件处理
        this.changeHandler; // 修改事件处理

        this.options = defOptions;
    }

    ctor.prototype.config = function (_options) {
        this.options = $.extend(true, {}, this.options, _options);
    }

    ctor.prototype.setText = function () {
        if (this.year && this.month) {
            this.elementText.html(this.year + '.' + this.month);
        }
    }

    ctor.prototype.setYear = function (y) {
        this.year = y;
        this.elementYear.html(y);
    }

    // 检查各按钮的可用性
    ctor.prototype.checkDisable = function () {
        var y = this.year;   // 此时选择的年        
        var minY = this.options.minYear;   // 最小的年
        var minM = this.options.minMonth;  // 最小的月
        var maxY = this.options.maxYear;   // 最大的年
        var maxM = this.options.maxMonth;  // 最大的月

        var preAvailable = y > minY;  // 前一年的按钮是否可用

        y > minY ? this.elementPre.removeClass('disabled') : this.elementPre.addClass('disabled');
        y < maxY ? this.elementPost.removeClass('disabled') : this.elementPost.addClass('disabled');

        for (var i = 0 ; i < 12; i++) {
            var monthObj = this.months[i];
            var available = true;
            if (y == minY && i + 1 < minM) available = false;
            if (y == maxY && i + 1 > maxM) available = false;
            available ? monthObj.element.removeClass('disabled') : monthObj.element.addClass('disabled');
        }
    }

    ctor.prototype.init = function () {
        var that = this;
        var element = $(this.options.selector);     //  容器              
        var text = $("<div class='monthbox-text'></div>");   // 文本框部分
        var panel = $("<div class='monthbox-panel'></div>");   // 下拉窗体部分
        element.append(text);
        element.append(panel);
        this.element = element;
        this.elementText = text;
        this.elementPanel = panel;
        
        this.year = this.options.defYear;
        this.month = this.options.defMonth;
        this.setText();

        var textHeight = text.height();
        panel.css('top', (textHeight + 1) + 'px');

        var head = $("<div class='head'></div>");
        panel.append(head);

        var pre = $("<div class='pp pre unselectable'>&lt;</div>");
        head.append(pre);

        var post = $("<div class='pp post unselectable'>&gt;</div>");
        head.append(post);

        var year = $("<div class='year'></div>");
        year.html(this.options.defYear);
        head.append(year);

        var hr = $("<div class='hr'></div>");
        panel.append(hr);

        var ul = $("<ul class='months'></ul>");
        panel.append(ul);

        var space = $("<div class='space'>&nbsp;</div>");
        panel.append(space);

        for (var i = 0; i < 12; i++) {
            var li = $("<li class='month'></li>");
            var str = (i + 1).toString();
            if (i + 1 < 10) {
                str = '0' + str;
            }
            li.attr('num', (i + 1));
            li.attr('monthName', str);
            li.html(str);
            ul.append(li);

            var month = new Month();
            month.element = li;
            month.num = (i + 1);
            month.name = str;
            this.months.push(month);
        }

        // 点击text事件
        text.click(function (e) {

            var flag = panel.hasClass('active');

            if (typeof that.beforeTextClickHandler === 'function') {
                that.beforeTextClickHandler();
            }

            if (flag) {
                panel.removeClass('active');
            } else {
                panel.addClass('active');
            }

            e.stopPropagation();
        })

        // 下拉窗体的点击事件
        panel.click(function (e) {
            e.stopPropagation();
        })

        // 向前按钮的点击事件
        pre.click(function (e) {

            var el = $(this);
            if (el.hasClass('disabled')) return;

            that.year--;
            that.setYear(that.year);

            // 设置各按钮的不可用状态
            that.checkDisable();

            if (typeof that.changeHandler === 'function') {
                that.changeHandler('pre');
            }

            e.stopPropagation();
        })

        // 向前按钮的点击事件
        post.click(function (e) {

            var el = $(this);
            if (el.hasClass('disabled')) return;

            that.year++;
            that.setYear(that.year);

            // 设置各按钮的不可用状态
            that.checkDisable();

            if (typeof that.changeHandler === 'function') {
                that.changeHandler('post');
            }

            e.stopPropagation();
        })

        // 某个月的点击事件
        panel.on('click', '.month', function (e) {

            var element = $(this);
            if (element.hasClass('disabled')) return;

            var num = element.attr('num');
            var name = element.attr('monthName');
            that.month = num;
            that.setText();
            that.hide();

            if (typeof that.changeHandler === 'function') {
                that.changeHandler(num);
            }

            e.stopPropagation();
        })


       
        this.elementPre = pre;
        this.elementPost = post;
        this.elementYear = year;
        this.ul = ul;

        // 设置各按钮的不可用状态
        this.checkDisable();
    }

    ctor.prototype.hide = function () {
        this.elementPanel.removeClass('active');
    }

    ctor.prototype.beforeTextClick = function (func) {
        this.beforeTextClickHandler = func;
    }

    ctor.prototype.change = function (func) {
        this.changeHandler = func;
    }

    return manager.fac(ctor);
}))