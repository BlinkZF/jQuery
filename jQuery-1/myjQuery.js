(function () {
    function jQuery(selector) {
        return new jQuery.prototype.init(selector)
    }
    jQuery.prototype.init = function (selector) {
        this.length = 0;
        //null undefined dom 
        if (selector == null) {
            return this;
        }
        if (typeof selector == 'string' && selector.indexOf('.') != -1) {
            var dom = document.getElementsByClassName(selector.slice(1))
        } else if (typeof selector == 'string' && selector.indexOf('#') != -1) {
            var dom = document.getRlementById(selector.slice(1))
        }

        //instanceof 看下selector原型链上有没有原型 
        if (selector instanceof Element || dom.length == undefined) {
            this[0] = dom || selector;
            this.length++;
        } else {
            // 基础铺垫
            for (var i = 0; i < dom.length; i++) {
                this[i] = dom[i];
                this.length++;
            }
        }
    }
    jQuery.prototype.css = function (config) {
        // 对象解析
        // 循环操作每一个dom
        // 循环操作
        for (var i = 0; i < this.length; i++) {
            for (var attr in config) {
                this[i].style[attr] = config[attr];
            }
        }
        // 链式操作重点
        return this;
        // 这里是拿到谁操作完成之后，又将其返回出去，方便下一次操作
    }
    // get()实例方法

    jQuery.prototype.pushStack = function (dom) {
        // dom newObj
        if (dom.constructor != jQuery) {
            dom = jQuery(dom);
        }
        dom.prevObject = this;
        return dom;
    }

    jQuery.prototype.get = function (num) {
        return num != null ? (num >= 0 ? this[num] : this[num + this.length]) : [].slice.call(this, 0)
    }

    // eq()源码
    jQuery.prototype.eq = function (num) {
        var dom = num != null ? (num >= 0 ? this[num] : this[num + this.length]) : null;
        return this.pushStack(dom);
    }

    // 集合方法
    jQuery.prototype.add = function (selector) {
        var curObj = jQuery(selector); //新选的add()中jquery对象
        var baseObj = this; //基础的jQuery对象
        var newObj = jQuery();
        for (var i = 0; i < curObj.length; i++) {
            newObj[newObj.length++] = curObj[i];
        }
        for (var i = 0; i < baseObj.length; i++) {
            newObj[newObj.length++] = baseObj[i];
        }
        this.pushStack(newObj);
        return newObj;
    }
    // 回退方法
    jQuery.prototype.end = function () {
        return this.prevObject;
    }

    // 自定义事件
    jQuery.prototype.myOn = function (type, handle) {
        for (var i = 0; i < this.length; i++) {
            if (!this[i].cacheEvent) {
                this[i].cacheEvent = {}
            }
            if (!this[i].cacheEvent[type]) {
                this[i].cacheEvent[type] = [handle]
                //这里使用数组来存储自定义事件是因为：同一个自定义事件绑定多次，也要能执行多次,
            } else {
                this[i].cacheEvent[type].push(handle);
            }
        }
    }
    jQuery.prototype.myTrigger = function (type) {
        var params = arguments.length > 1 ? [].slice().call(arguments, 1) : []; 
        // 利用slice方法将第一位之后的所有参数截取到一个数组中
        var self = this;
        for(var i = 0;i<this.length;i++){
            if(this[i].cacheEvent[type]){
                this[i].cacheEvent[type].forEach(function(ele,index){
                    ele.apply(self,params) //因为这里面的this是window,所以在外部先将this存起来
                })
            }
        }
    }

    // 让jQuery.prototype.init原型 执行jQuery原型
    jQuery.prototype.init.prototype = jQuery.prototype;
    window.$ = window.jQuery = jQuery

})()