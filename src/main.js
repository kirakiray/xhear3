// handle
let XhearElementHandler = {
    get(target, key, receiver) {
        // 判断是否纯数字
        if (/\D/.test(String(key))) {
            return Reflect.get(target, key, receiver);
        } else {
            // 纯数字，返回数组内的结构
            let ele;

            // 判断是否渲染的元素
            if (target.xvRender) {
                let {
                    $content
                } = target;

                if ($content) {
                    ele = $content.ele.children[key];
                } else {
                    console.warn('hasn\'t content element =>', receiver.ele);
                }
            } else {
                // 普通元素就是children
                ele = receiver.ele.children[key];
            }

            return ele && createXHearElement(ele);
        }
    },
    set(target, key, value, receiver) {
        console.log(`setting ${key}!`);
        let oldVal;
        if (/\D/.test(key)) {
            // 判断是否有_exkey上的字段
            if (target[EXKEYS] && target[EXKEYS].includes(key)) {
                oldVal = target[key];

                // 设置在原型对象上
                target.ele._xhearData[key] = value;

            } else {
                // 不是纯数字，设置在proxy对象上
                return Reflect.set(target, key, value, receiver);
            }
        } else {
            // 直接替换元素
            value = parseToXHearElement(value);

            // 获取旧值
            let tarEle = receiver[key];
            let {
                parentElement
            } = tarEle.ele;
            parentElement.insertBefore(value.ele, tarEle.ele);
            parentElement.removeChild(tarEle.ele);

            oldVal = tarEle;
        }

        // update事件冒泡
        // 事件实例生成
        let eveObj = new XDataEvent('update', receiver);

        // 添加修正数据
        eveObj.modify = {
            // change 改动
            // set 新增值
            genre: "change",
            key,
            value,
            oldVal
        };

        // 触发事件
        receiver.emit(eveObj);

        return true;
    }
};

// class
let XhearElement = function (ele) {
    defineProperties(this, {
        // ele: {
        //     value: ele
        // },
        // 事件寄宿对象
        // [EVES]: {
        //     value: {}
        // },
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

    // 继承 xdata 的数据
    let opt = {
        // 事件寄宿对象
        [EVES]: {},
        // watch寄宿对象
        [WATCHHOST]: {},
        // sync 寄宿对象
        [SYNCHOST]: [],
        [MODIFYHOST]: [],
        [MODIFYTIMER]: ""
    };
    setNotEnumer(this, opt);

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

// 重构seekData函数
seekData = (data, exprObj) => {
    let arr = [];

    // 关键数据
    let exprKey = exprObj.k,
        exprValue = exprObj.v,
        exprType = exprObj.type,
        exprEqType = exprObj.eqType;

    let searchFunc = k => {
        let tarData = data[k];

        if (isXData(tarData)) {
            // 判断是否可添加
            let canAdd = conditData(exprKey, exprValue, exprType, exprEqType, tarData);

            // 允许就添加
            canAdd && arr.push(tarData);

            // 查找子项
            let newArr = seekData(tarData, exprObj);
            arr.push(...newArr);
        }
    }

    if (data instanceof XhearElement) {
        // 准备好key
        let exkeys = data[EXKEYS] || [];
        let childKeys = Object.keys(data.ele.children);
        [...exkeys, ...childKeys].forEach(searchFunc);
    } else {
        Object.keys(data).forEach(searchFunc);
    }
    searchFunc = null;
    return arr;
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
            let {
                parentElement
            } = this.ele;

            if (!parentElement) {
                return;
            }

            if (parentElement.xvContent) {
                parentElement = parentElement._xhearData.$host.ele;
            }
            return createXHearElement(parentElement);
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
            return !!this.ele.xvRender;
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
            let {
                ele
            } = this;

            if (ele.xvRender) {
                return ele._xhearData.$content.ele.children.length;
            } else {
                return this.ele.children.length;
            }
        }
    }
});