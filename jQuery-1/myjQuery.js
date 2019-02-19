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
    // 入队了
    jQuery.prototype.myQueue = function () {  
        var queueObj = this;
        var queueName = arguments[0] || 'fx' //这里的fx是animate自己独有的名称队列
        var addFunc = arguments[1] || null;
        var len = arguments.length;
        // 根据传入参数的多少判断是取队列还是添加队列
        if(len == 1){
            return queueObj[0][queueName];
        }
        // queueObj这个对象中记录了一个dom，将队列存在dom身上
        // 官方queue() 内部用到了一个全局构造函数data  通过data创建全局对象，根据这个对象进行全局存储
        queueObj[0][queueName] == undefined ? queueObj[0][queueName] = [addFunc] : queueObj[0][queueName].push(addFunc);
        return this;
    }
    // 出队列
    jQuery.prototype.myDequeue = function () { 
        //理解：当外部函数调用函数的时候，没有调用源，为了保证this不变(依旧是调用myDequeue()的)，使用这种将this保存起来的方法
        var self = this; 
        var queueName = arguments[0] || 'fx';
        var queueArr = this.myQueue(queueName);
        var currFunc = queueArr.shift();
        if(currFunc == undefined){
            return;
        }
        // 这里是一个递归函数,每当currFunc有值的时候，就在调用myDequeue,直到queueArr中的参数为空，这时currFun也就为空 这时递归就停止
        var next = function () { 
            self.myDequeue(queueName)
        }
        currFunc(next);
        return this;
    }

    jQuery.prototype.myDelay = function (duration) {  
        var queueArr = this[0]['fx'];
        queueArr.push(function (next) {  
            setTimeout(function () {  
                next();
            },duration)
        })
        return this;
    }

    jQuery.prototype.myAnimate = function (json,callback) {  
        var len = this.length;
        var self = this;
        // 最后添加到队列里的内容函数
        var baseFunc = function (next) {  
            var times = 0 //参考数值
            for(var i = 0;i<len;i++){
                startMove(self[i],json,function () {  
                    times++;
                    if(times = len){
                        callback && callback()
                        next();
                    }
                })
            }
        }

        // 入队操作
        this.myQueue('fx',baseFunc);

        if(this.myQueue('fx').length == 1){
            this.myDequeue('fx');
        }
        function getStyle(obj,attr) {
            if(obj.currentStyle){
                return obj.currentStyle[attr];
            }else{
                return window.getComputedStyle(obj,false)[attr];
            }
        }
        function startMove(obj,json,callback) {  
            clearInterval(obj.timer);
            var iSpeed;
            var iCur;
            var name;
            obj.timer = setInterval(function () {  
                var bStop = true;
                for(var attr in json){
                    if(attr === 'opacity'){
                        name = attr;
                        iCur = parseFloat(getStyle(obj,attr))*100; 
                    }else{
                        iCur = parseInt(getStyle(obj,attr));
                    }
                    iSpeed = (json[attr]-iCur)/7;
                    if(iSpeed>0){
                        iSpeed = Math.ceil(iSpeed);
                    }else{
                        iSpeed = Math.floor(iSpeed);
                    }
                    if(attr === 'opacity'){
                        obj.style.opacity = (iCur + iSpeed) / 100;
                    }else{
                        obj.style[attr] = iCur + iSpeed +'px';
                    }
                    if(json[attr] - iCur !== 0){
                        bStop = false
                    }
                }
                if(bStop){
                    clearInterval(obj.timer);
                    callback()
                }
            },30)
        }
        return this;
    }




    // 让jQuery.prototype.init原型 执行jQuery原型
    jQuery.prototype.init.prototype = jQuery.prototype;
    window.$ = window.jQuery = jQuery

})()