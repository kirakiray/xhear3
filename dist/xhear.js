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
            // console.log(`getting ${key}!`);

            // 判断是否纯数字
            if (/\D/.test(key)) {
                // 不是纯数字
                return Reflect.get(target, key, receiver);
            } else {
                // 纯数字，返回数组内的结构
                return target.ele.children[key];
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
        defineProperty(this, 'ele', {
            value: ele
        });
        return new Proxy(this, XhearHandler);
    };
    let XhearFn = Object.create(Array.prototype);
    Xhear.prototype = XhearFn;
    let XhearFnDPOption = {
        // 是否注册的Xele
        xvele: {
            get() {
                return false;
            }
        },
        // 是否渲染过
        rendered: {
            get() {
                return false;
            }
        },
        // 标签名
        tag: {
            get() {
                return this.ele.tagName.toLowerCase();
            }
        },
        class: {
            get() {
                return this.ele.classList;
            }
        },
        string: {
            get() {
                return JSON.stringify(this);
            }
        },
        object: {
            get() {
                return JSON.parse(this.string);
            }
        },
    };
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

    $.register = (options) => {
    let defaults = {
        tag: ""
    };
    assign(defaults, options);
}

    // init 
    glo.$ = $;

})(window);