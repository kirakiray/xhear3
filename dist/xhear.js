((glo) => {
    // 获取随机id
const getRandomId = () => Math.random().toString(32).substr(2);
let objectToString = Object.prototype.toString;
const getType = value => objectToString.call(value).toLowerCase().replace(/(\[object )|(])/g, '');

let {
    defineProperty,
    defineProperties,
    assign
} = Object

    // 属性切换器
function TokenList(ele, key) {
    defineProperties(this, {
        "_p": {
            value: ele
        },
        "_key": {
            value: key
        }
    });
}
let TokenListFn = {};
TokenList.prototype = TokenListFn;
defineProperties(TokenListFn, {
    add() {},
    remove() {},
    has() {},
    toggle() {},
    value() {}
});

    // handle
    let XhearHandler = {
        get: function (target, key, receiver) {
            // 判断是否纯数字
            if (/\D/.test(key)) {
                // 不是纯数字
                return Reflect.get(target, key, receiver);
            } else {
                // 纯数字，返回数组内的结构
                let ele = target.ele.children[key]
                return ele && init(ele);
            }

        },
        set: function (target, key, value, receiver) {
            console.log(`setting ${key}!`);
            return Reflect.set(target, key, value, receiver);
        },
        deleteProperty(target, key) {
            console.log(`delete ${key}`);
            return Reflect.defineProperty(target, key);
        }
    };

    // class
    let Xhear = function (ele) {
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

        return new Proxy(this, XhearHandler);
    };
    // let XhearFn = Object.create(Array.prototype);
    let XhearFn = {};
    Xhear.prototype = XhearFn;
    let XhearFnDPOption = {
        parent() {
            return init(this.ele.parentNode);
        },
        index() {
            return this.parent.findIndex(e => e.ele == this.ele);
        },
        // 是否注册的Xele
        xvele() {
            return false;
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
                if (e instanceof Xhear) {
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
    for (let k in XhearFnDPOption) {
        XhearFnDPOption[k] = {
            get: XhearFnDPOption[k]
        };
    }

    // 可运行的方法
    ['concat', 'every', 'filter', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'lastIndexOf', 'map', 'slice', 'some'].forEach(methodName => {
        let oldFunc = Array.prototype[methodName];
        if (oldFunc) {
            defineProperty(XhearFn, methodName, {
                value(...args) {
                    return oldFunc.apply(Array.from(this.ele.children).map(e => init(e)), args);
                }
            });
        }
    });

    // 会影响数组结构的方法
    ['pop', 'push', 'reverse', 'sort', 'splice', 'shift', 'unshift'].forEach(methodName => {

    });

    defineProperties(XhearFn, XhearFnDPOption);

    // main
    // 初始元素的方法
    const init = (ele) => {
        return new Xhear(ele);
    }

    // 全局用$
    let $ = (expr) => {
        let tarEle = document.querySelector(expr);
        return init(tarEle);
    }

    // init 
    glo.$ = $;

    $.register = (options) => {
    let defaults = {
        tag: ""
    };
    assign(defaults, options);
}

})(window);