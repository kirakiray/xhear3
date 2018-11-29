// handle
let XhearElementHandler = {
    get(target, key, receiver) {
        // 判断是否纯数字
        if (/\D/.test(String(key))) {
            // if (/(parent|style|ele)/.test(key)) {
            //     // 默认带的key
            //     // 不是纯数字
            //     return Reflect.get(target, key, receiver);
            // } else {
            //     // 不是默认key
            //     debugger
            // }
            return Reflect.get(target, key, receiver);
        } else {
            // 纯数字，返回数组内的结构
            // let ele = target.ele.children[key]
            let ele = receiver.ele.children[key];
            return ele && createXHearElement(ele);
        }
    },
    set(target, key, value, receiver) {
        console.log(`setting ${key}!`);
        if (/\D/.test(key)) {
            // 不是纯数字
            return Reflect.set(target, key, value, receiver);
        } else {
            // 直接替换元素
            value = parseToXHearElement(value);
            let tarEle = receiver[key];
            let {
                parentElement
            } = tarEle.ele;
            parentElement.insertBefore(value.ele, tarEle.ele);
            parentElement.removeChild(tarEle.ele);
            return true;
        }
    },
    deleteProperty(target, key) {
        console.log(`delete ${key}`);
        return Reflect.defineProperty(target, key);
    }
};

// class
let XhearElement = function (ele) {
    defineProperties(this, {
        // ele: {
        //     value: ele
        // },
        // 事件寄宿对象
        [EVES]: {
            value: {}
        },
        // 实体事件函数寄存
        [XHEAREVENT]: {
            value: {}
        },
        tag: {
            // writeable: false,
            enumerable: true,
            value: ele.tagName.toLowerCase()
        }
    });

    // return new Proxy(this, XhearElementHandler);

};

// 判断是否要清除注册的事件函数
const intelClearEvent = (_this, eventName) => {
    // 查看是否没有注册的事件函数了，没有就清空call
    let tarEves = _this[EVES][eventName];

    if (tarEves && !tarEves.length) {
        let tarCall = _this[XHEAREVENT][eventName];

        // 清除注册事件函数
        _this.ele.removeEventListener(eventName, tarCall);
        delete _this[XHEAREVENT][eventName];
    }
}

// XhearElement prototype
let XhearElementFn = XhearElement.prototype = Object.create(XDataFn);
setNotEnumer(XhearElementFn, {
    on(...args) {
        let eventName = args[0];

        // 判断原生是否有存在注册的函数
        let tarCall = this[XHEAREVENT][eventName];
        if (!tarCall) {
            let eventCall;
            // 不存在就注册
            this.ele.addEventListener(eventName, eventCall = (e) => {
                // 阻止掉其他所有的函数监听
                e.stopImmediatePropagation();

                // 事件实例生成
                let target = createXHearElement(e.target);
                let eveObj = new XDataEvent(eventName, target);

                let tempTarget = target;
                while (tempTarget.ele !== this.ele) {
                    eveObj.keys.unshift(tempTarget.hostkey);
                    tempTarget = tempTarget.parent;
                }

                this.emit(eveObj);
            });
            this[XHEAREVENT][eventName] = eventCall;
        }

        return XDataFn.on.apply(this, args);
    },
    one(...args) {
        let eventName = args[0];
        let reData = XDataFn.one.apply(this, args);

        // 智能清除事件函数
        intelClearEvent(this, eventName);

        return reData;
    },
    off(...args) {
        let eventName = args[0];

        let reData = XDataFn.off.apply(this, args);

        // 智能清除事件函数
        intelClearEvent(this, eventName);

        return reData;
    },
    // emit() {},
    // watch() {},
    // unwatch() {},
    // sync() {},
    // unsync() {},
    // entrend() {},
    que(expr) {
        return $.que(expr, this.ele);
    }
});


defineProperties(XhearElementFn, {
    hostkey: {
        get() {
            return Array.from(this.ele.parentElement.children).indexOf(this.ele);
        }
    },
    parent: {
        get() {
            return createXHearElement(this.ele.parentElement);
        }
    },
    next: {
        get() {
            return this.ele.nextElementSibling && createXHearElement(this.ele.nextElementSibling);
        }
    },
    prev: {
        get() {
            let {
                previousElementSibling
            } = this.ele;
            return previousElementSibling && createXHearElement(previousElementSibling);
        }
    },
    next: {
        get() {
            let {
                nextElementSibling
            } = this.ele;
            return nextElementSibling && createXHearElement(nextElementSibling);
        }
    },
    index: {
        get() {
            return this.parent.findIndex(e => e.ele == this.ele);
        }
    },
    // 是否注册的Xele
    xvele: {
        get() {
            let {
                attributes
            } = this.ele;

            return attributes.hasOwnProperty('xv-ele') || attributes.hasOwnProperty('xv-render');
        }
    },
    // 是否渲染过
    rendered: {
        get() {
            return this.ele.attributes.hasOwnProperty('xv-render');
        }
    },
    class: {
        get() {
            return this.ele.classList;
        }

    },
    string: {
        get() {
            return JSON.stringify(this.object);
        }
    },
    object: {
        get() {
            let obj = {
                tag: this.tag
            };

            // 非xvele就保留class属性
            if (!this.xvRender) {
                let classValue = this.ele.classList.value;
                classValue && (obj.class = classValue);
            }

            this.forEach((e, i) => {
                if (e instanceof XhearElement) {
                    obj[i] = e.object;
                } else {
                    obj[i] = e;
                }
            });

            // obj.length = this.length;
            return obj;
        }
    },
    length: {
        get() {
            return this.ele.children.length;
        }
    }
});