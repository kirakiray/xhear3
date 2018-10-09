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

// 转换元素
const parseStringToDom = (str) => {
    let par = document.createElement('div');
    par.innerHTML = str;
    let childs = Array.from(par.childNodes);
    return childs.filter(function (e) {
        if (!(e instanceof Text) || (e.textContent && e.textContent.trim())) {
            return e;
        }
    });
};

const parseDataToDom = (data) => {
    if (data.tag) {
        
    }
}

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
    let XhearElementHandler = {
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
            return init(this.ele.parentNode);
        },
        next() {
            return this.ele.nextElementSibling && init(this.ele.nextElementSibling);
        },
        prev() {
            return this.ele.previousElementSibling && init(this.ele.previousElementSibling);
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

    // 模拟类jQuery的方法
const likejQFn = {
    show() {
        this.style.display = "";
        return this;
    },
    hide() {
        this.style.display = "none";
        return this;
    },
    on() {},
    one() {},
    off() {},
    trigger() {},
    triggerHandler() {},
    before() {},
    after() {},
    remove() {},
    empty() {},
    // like jQuery function find
    que(expr) {
        return $.que(expr, this.ele);
    }
};

for (let fName in likejQFn) {
    defineProperty(XhearElementFn, fName, {
        value: likejQFn[fName]
    });
}

defineProperties(XhearElementFn, {
    text: {
        get() {
            return this.ele.textContent;
        },
        set(d) {
            this.ele.textContent = d;
        }
    },
    html: {
        get() {
            return this.ele.innerHTML;
        },
        set(d) {
            this.ele.innerHTML = d;
        }
    },
    style: {
        get() {
            return this.ele.style;
        },
        set(d) {
            let {
                style
            } = this;

            // 覆盖旧的样式
            let hasKeys = Array.from(style);
            let nextKeys = Object.keys(d);

            // 清空不用设置的key
            hasKeys.forEach(k => {
                if (!nextKeys.includes(k)) {
                    style[k] = "";
                }
            });

            assign(style, d);
        }
    }
});

assign(XhearElementFnGetterOption, {
    position() {
        return {
            top: this.ele.offsetTop,
            left: this.ele.offsetLeft
        };
    },
    offset() {
        let reobj = {
            top: 0,
            left: 0
        };

        let tar = this.ele;
        while (tar !== document) {
            reobj.top += tar.offsetTop;
            reobj.left += tar.offsetLeft;
            tar = tar.offsetParent
        }
        return reobj;
    }
});

    // 整理成 defineProperties getter 的参数对象
    for (let k in XhearElementFnGetterOption) {
        XhearElementFnGetterOption[k] = {
            get: XhearElementFnGetterOption[k]
        };
    }

    // 可运行的方法
    ['concat', 'every', 'filter', 'find', 'findIndex', 'forEach', 'map', 'slice', 'some'].forEach(methodName => {
        let oldFunc = Array.prototype[methodName];
        if (oldFunc) {
            defineProperty(XhearElementFn, methodName, {
                value(...args) {
                    return oldFunc.apply(Array.from(this.ele.children).map(e => init(e)), args);
                }
            });
        }
    });

    // 会影响数组结构的方法
    ['pop', 'push', 'reverse', 'sort', 'splice', 'shift', 'unshift'].forEach(methodName => {

    });

    defineProperties(XhearElementFn, XhearElementFnGetterOption);

    // main
    // 初始元素的方法
    const init = (ele) => {
        return new XhearElement(ele);
    }

    // 全局用$
    let $ = (expr) => {
        let reobj;

        // expr type
        let exprType = getType(expr);

        if (expr instanceof Element) {
            reobj = init(expr);
        } else if (exprType == "string") {
            if (expr.search("<") > -1) {
                reobj = parseStringToDom(expr)[0];
            } else {
                reobj = document.querySelector(expr);
            }
            reobj = init(reobj);
        }
        return reobj;
    }

    // init 
    glo.$ = $;
    assign($, {
        fn: XhearElementFn,
        type: getType,
        init,
        que: (expr, root = document) => Array.from(root.querySelectorAll(expr)).map(e => init(e))

    });

    $.register = (options) => {
    let defaults = {
        tag: ""
    };
    assign(defaults, options);
}

})(window);