// handle
let XhearElementHandler = {
    get(target, key, receiver) {
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
        ele: {
            value: ele
        },
        tag: {
            // writeable: false,
            enumerable: true,
            value: ele.tagName.toLowerCase()
        }
    });

    return new Proxy(this, XhearElementHandler);
};

// XhearElement prototype
let XhearElementFn = XhearElement.prototype = {};
setNotEnumer(XhearElementFn, {
    on() {},
    one() {},
    off() {},
    emit() {},
    watch() {},
    unwatch() {},
    sync() {},
    unsync() {},
    entrend() {},
    que(expr) {
        return $.que(expr, this.ele);
    }
});


defineProperties(XhearElementFn, {
    parent: {
        get() {
            return createXHearElement(this.ele.parentNode);
        }
    },
    next: {
        get() {
            return this.ele.nextElementSibling && createXHearElement(this.ele.nextElementSibling);
        }
    },
    prev: {
        get() {
            return this.ele.previousElementSibling && createXHearElement(this.ele.previousElementSibling);
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
        }
    },
    length: {
        get() {
            return this.ele.children.length;
        }
    }
});