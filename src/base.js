((glo) => {
    //<!--public-->

    //<!--class-->

    // handle
    let XhearElementHandler = {
        get: function (target, key, receiver) {
            // 判断是否纯数字
            if (/\D/.test(key)) {
                // 不是纯数字
                return Reflect.get(target, key, receiver);
            } else {
                // 纯数字，返回数组内的结构
                let ele = target.ele.children[key]
                return ele && createXHearElement(ele);
            }

        },
        set: function (target, key, value, receiver) {
            // console.log(`setting ${key}!`);
            return Reflect.set(target, key, value, receiver);
        },
        deleteProperty(target, key) {
            console.log(`delete ${key}`);
            return Reflect.defineProperty(target, key);
        }
    };

    // class
    let XhearElement = function (ele) {
        defineProperties(this, {
            ele: {
                value: ele
            },
            tag: {
                writeable: false,
                enumerable: true,
                value: ele.tagName.toLowerCase()
            }
        });

        return new Proxy(this, XhearElementHandler);
    };

    // XhearElement prototype
    let XhearElementFn = {};
    XhearElement.prototype = XhearElementFn;
    let XhearElementFnGetterOption = {
        parent() {
            return createXHearElement(this.ele.parentNode);
        },
        next() {
            return this.ele.nextElementSibling && createXHearElement(this.ele.nextElementSibling);
        },
        prev() {
            return this.ele.previousElementSibling && createXHearElement(this.ele.previousElementSibling);
        },
        index() {
            return this.parent.findIndex(e => e.ele == this.ele);
        },
        // 是否注册的Xele
        xvele() {
            return this.ele.attributes.hasOwnProperty('xv-ele') || this.ele.attributes.hasOwnProperty('xv-render');
        },
        // 是否渲染过
        rendered() {
            return false;
        },
        class() {
            return this.ele.classList;

        },
        string() {
            return JSON.stringify(this.object);

        },
        object() {
            let obj = {
                tag: this.tag
            };

            // 非xvele就保留class属性
            if (!this.xvele) {
                obj.class = this.ele.classList.value;
            }

            this.forEach((e, i) => {
                if (e instanceof XhearElement) {
                    obj[i] = e.object;
                } else {
                    obj[i] = e;
                }
            });
            obj.length = this.length;
            return obj;

        },
        length() {
            return this.ele.children.length;
        }
    };

    // 设置成不可枚举的属性对象
    let XElementPriFn = {};

    // 可运行的方法
    ['concat', 'every', 'filter', 'find', 'findIndex', 'forEach', 'map', 'slice', 'some'].forEach(methodName => {
        let oldFunc = Array.prototype[methodName];
        if (oldFunc) {
            // defineProperty(XhearElementFn, methodName, {
            //     value(...args) {
            //         return oldFunc.apply(Array.from(this.ele.children).map(e => createXHearElement(e)), args);
            //     }
            // });
            XElementPriFn[methodName] = function (...args) {
                return oldFunc.apply(Array.from(this.ele.children).map(e => createXHearElement(e)), args);
            };
        }
    });

    // 会影响数组结构的方法
    // ['pop', 'push', 'reverse', 'sort', 'splice', 'shift', 'unshift'].forEach(methodName => {

    // });

    XElementPriFn.unshift = function (...items) {
        this.splice(0, 0, ...items);
        return this;
    };

    XElementPriFn.push = function (...items) {
        this.splice(this.length, 0, ...items);
        return this;
    };

    // 实现splice，然后主要的 shift unshift pop push 都基于splice实现
    XElementPriFn.splice = function (index, howmany, ...items) {
        let tar = this.ele.children[index];
        if (index >= 0 && tar) {
            items.forEach(e => {
                this.ele.insertBefore(parseToXHearElement(e).ele, tar);
            });
        } else {
            items.forEach(e => {
                this.ele.appendChild(parseToXHearElement(e).ele);
            });
        }
    };

    //<!--likejQuery-->

    // 整理成 defineProperties getter 的参数对象
    for (let k in XhearElementFnGetterOption) {
        XhearElementFnGetterOption[k] = {
            get: XhearElementFnGetterOption[k]
        };
    }

    for (let fName in XElementPriFn) {
        defineProperty(XhearElementFn, fName, {
            value: XElementPriFn[fName]
        });
    }

    defineProperties(XhearElementFn, XhearElementFnGetterOption);

    // main
    const createXHearElement = ele => ele && new XhearElement(ele);
    const parseToXHearElement = expr => {
        if (expr instanceof XhearElement) {
            return expr;
        }

        let reobj;

        // expr type
        let exprType = getType(expr);

        if (expr instanceof Element) {
            reobj = createXHearElement(expr);
        } else if (exprType == "string") {
            reobj = parseStringToDom(expr)[0];
            reobj = createXHearElement(reobj);
        } else if (exprType == "object") {
            reobj = parseDataToDom(expr);
            reobj = createXHearElement(reobj);
        }

        return reobj;
    }

    // 全局用$
    let $ = (expr) => {
        if (expr instanceof XhearElement) {
            return expr;
        }

        let tar = expr;

        if (getType(expr) === "string" && expr.search("<") === -1) {
            tar = document.querySelector(expr);
        }

        return parseToXHearElement(tar);
    }

    // init 
    glo.$ = $;
    assign($, {
        fn: XhearElementFn,
        type: getType,
        init: createXHearElement,
        que: (expr, root = document) => Array.from(root.querySelectorAll(expr)).map(e => init(e))

    });

    //<!--register-->

})(window);