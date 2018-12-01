((glo) => {
    // 获取随机id
const getRandomId = () => Math.random().toString(32).substr(2);
let objectToString = Object.prototype.toString;
const getType = value => objectToString.call(value).toLowerCase().replace(/(\[object )|(])/g, '');
const isUndefined = val => val === undefined;
// 克隆object
const cloneObject = obj => JSON.parse(JSON.stringify(obj));

// 设置不可枚举的方法
const setNotEnumer = (tar, obj) => {
    for (let k in obj) {
        defineProperty(tar, k, {
            // enumerable: false,
            writable: true,
            value: obj[k]
        });
    }
}

//改良异步方法
const nextTick = (() => {
    let isTick = false;
    let nextTickArr = [];
    return (fun) => {
        if (!isTick) {
            isTick = true;
            setTimeout(() => {
                for (let i = 0; i < nextTickArr.length; i++) {
                    nextTickArr[i]();
                }
                nextTickArr = [];
                isTick = false;
            }, 0);
        }
        nextTickArr.push(fun);
    };
})();

// common
const PROTO = '_proto_' + getRandomId();
const XHEAREVENT = "_xevent_" + getRandomId();
const EXKEYS = "_exkeys_" + getRandomId();

// database
// 注册数据
const regDatabase = new Map();

let {
    defineProperty,
    defineProperties,
    assign
} = Object;

// 获取 content 容器
const getContentEle = (tarEle) => {
    let contentEle = tarEle;

    // 判断是否xvRender
    if (tarEle.xvRender) {
        let {
            _xhearData
        } = contentEle;

        if (_xhearData) {
            let {
                $content
            } = _xhearData;

            if ($content) {
                contentEle = $content.ele;
            }
        }
    }

    return contentEle;
}

// 判断元素是否符合条件
const meetsEle = (ele, expr) => {
    if (ele === expr) {
        return !0;
    }
    let fadeParent = document.createElement('div');
    if (ele === document) {
        return false;
    }
    fadeParent.appendChild(ele.cloneNode(false));
    return fadeParent.querySelector(expr) ? true : false;
}

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

// 转换 xhearData 到 element
const parseDataToDom = (data) => {
    if (data.tag && !(data instanceof XhearElement)) {
        let ele = document.createElement(data.tag);

        data.class && ele.setAttribute('class', data.class);
        data.text && (ele.textContent = data.text);

        // 判断是否xv-ele
        let {
            xvele
        } = data;

        let xhearEle;

        if (xvele) {
            ele.setAttribute('xv-ele', "");
            renderEle(ele);
            xhearEle = createXHearElement(ele);

            // 数据合并
            xhearEle[EXKEYS].forEach(k => {
                let val = data[k];
                !isUndefined(val) && (xhearEle[k] = val);
            });
        }

        // 填充内容
        let akey = 0;
        while (akey in data) {
            let childEle = parseDataToDom(data[akey]);

            if (xvele && xhearEle) {
                let {
                    $content
                } = xhearEle;

                if ($content) {
                    $content.ele.appendChild(childEle);
                }
            } else {
                ele.appendChild(childEle);
            }
            akey++;
        }

        return ele;
    }
}

// main
const createXHearElement = ele => {
    if (!ele) {
        return;
    }
    let xhearData = ele._xhearData;
    if (!xhearData) {
        xhearData = new XhearElement(ele);
        ele._xhearData = xhearData;
    }

    // 防止内存泄露，隔离 xhearData 和 ele
    let xhearEle = Object.create(xhearData);
    defineProperties(xhearEle, {
        ele: {
            enumerable: false,
            value: ele
        }
    });
    xhearEle = new Proxy(xhearEle, XhearElementHandler);
    return xhearEle;
};
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

    // common
const EVES = "_eves_" + getRandomId();
const RUNARRMETHOD = "_runarrmethod_" + getRandomId();
const WATCHHOST = "_watch_" + getRandomId();
const SYNCHOST = "_synchost_" + getRandomId();
const MODIFYHOST = "_modify_" + getRandomId();
const MODIFYTIMER = "_modify_timer_" + getRandomId();

// business function
// 是否XData
let isXData = obj => obj instanceof XData;

// 生成xdata对象
const createXData = (obj, options) => {
    let redata = obj;
    switch (getType(obj)) {
        case "object":
        case "array":
            redata = new XData(obj, options);
            break;
    }

    return redata;
};

// 按条件判断数据是否符合条件
const conditData = (exprKey, exprValue, exprType, exprEqType, tarData) => {
    let reData = 0;

    // 搜索数据
    switch (exprType) {
        case "keyValue":
            let tarValue = tarData[exprKey];
            switch (exprEqType) {
                case "=":
                    if (tarValue == exprValue) {
                        reData = 1;
                    }
                    break;
                case ":=":
                    if (isXData(tarValue) && tarValue.findIndex(e => e == exprValue) > -1) {
                        reData = 1;
                    }
                    break;
                case "*=":
                    if (getType(tarValue) == "string" && tarValue.search(exprValue) > -1) {
                        reData = 1;
                    }
                    break;
                case "~=":
                    if (getType(tarValue) == "string" && tarValue.split(' ').findIndex(e => e == exprValue) > -1) {
                        reData = 1;
                    }
                    break;
            }
            break;
        case "hasValue":
            switch (exprEqType) {
                case "=":
                    if (Object.values(tarData).findIndex(e => e == exprValue) > -1) {
                        reData = 1;
                    }
                    break;
                case ":=":
                    Object.values(tarData).some(tarValue => {
                        if (isXData(tarValue) && tarValue.findIndex(e => e == exprValue) > -1) {
                            reData = 1;
                            return true;
                        }
                    });
                    break;
                case "*=":
                    Object.values(tarData).some(tarValue => {
                        if (getType(tarValue) == "string" && tarValue.search(exprValue) > -1) {
                            reData = 1;
                            return true;
                        }
                    });
                    break;
                case "~=":
                    Object.values(tarData).some(tarValue => {
                        if (getType(tarValue) == "string" && tarValue.split(' ').findIndex(e => e == exprValue) > -1) {
                            reData = 1;
                            return true;
                        }
                    });
                    break;
            }
            break;
        case "hasKey":
            if (tarData.hasOwnProperty(exprKey)) {
                reData = 1;
            }
            break;
    }

    return reData;
}

// 查找数据
let seekData = (data, exprObj) => {
    let arr = [];

    // 关键数据
    let exprKey = exprObj.k,
        exprValue = exprObj.v,
        exprType = exprObj.type,
        exprEqType = exprObj.eqType;

    Object.keys(data).forEach(k => {
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
    });
    return arr;
}

// modifyId清理设置
let addModify = (xdata, modifyId) => {
    let modifyHost = xdata[MODIFYHOST];
    modifyHost.push(modifyId);

    // 适时回收
    clearTimeout(xdata[MODIFYTIMER]);
    xdata[MODIFYTIMER] = setTimeout(() => {
        modifyHost.length = 0;
        modifyHost = null;
    }, 5000);
}

// main class
function XDataEvent(type, target) {
    let enumerable = true;
    defineProperties(this, {
        type: {
            enumerable,
            value: type
        },
        keys: {
            enumerable,
            value: []
        },
        target: {
            enumerable,
            value: target
        },
        bubble: {
            enumerable,
            writable: true,
            value: true
        },
        cancel: {
            enumerable,
            writable: true,
            value: false
        },
        currentTarget: {
            enumerable,
            writable: true,
            value: target
        }
    });
}

defineProperties(XDataEvent.prototype, {
    // trend数据，用于给其他数据同步用的
    trend: {
        get() {
            let {
                modify
            } = this;

            if (!modify) {
                return;
            }

            let reobj = {
                genre: modify.genre,
                keys: this.keys
            };

            defineProperty(reobj, "oldVal", {
                value: modify.oldVal
            });

            switch (modify.genre) {
                case "arrayMethod":
                    let {
                        methodName,
                        args,
                        modifyId
                    } = modify;

                    assign(reobj, {
                        methodName,
                        args,
                        modifyId
                    });
                    break;
                default:
                    let {
                        value
                    } = modify;

                    if (isXData(value)) {
                        value = value.object;
                    }
                    assign(reobj, {
                        key: modify.key,
                        value,
                    });
                    break;
            }

            return reobj;
        }
    }
});

function XData(obj, options = {}) {
    // 生成代理对象
    let proxyThis = new Proxy(this, XDataHandler);

    // 数组的长度
    let length = 0;

    // 非数组数据合并
    Object.keys(obj).forEach(k => {
        // 值
        let value = obj[k];

        if (!/\D/.test(k)) {
            // 数字key
            k = parseInt(k);

            if (k >= length) {
                length = k + 1;
            }
        }

        // 设置值
        this[k] = createXData(value, {
            parent: proxyThis,
            hostkey: k
        });
    });

    let opt = {
        status: "root",
        // 设置数组长度
        length,
        // 事件寄宿对象
        [EVES]: {},
        // watch寄宿对象
        [WATCHHOST]: {},
        // sync 寄宿对象
        [SYNCHOST]: [],
        [MODIFYHOST]: [],
        [MODIFYTIMER]: ""
    };

    if (options.parent) {
        opt.status = "binding";
        opt.parent = options.parent;
        opt.hostkey = options.hostkey;
    }

    // 设置不可枚举数据
    setNotEnumer(this, opt);

    // 返回Proxy对象
    return proxyThis;
}
let XDataFn = XData.prototype = {};

// 数组通用方法
// 可运行的方法
['concat', 'every', 'filter', 'find', 'findIndex', 'forEach', 'map', 'slice', 'some', 'indexOf', 'includes'].forEach(methodName => {
    let arrayFnFunc = Array.prototype[methodName];
    if (arrayFnFunc) {
        defineProperty(XDataFn, methodName, {
            writable: true,
            value(...args) {
                return arrayFnFunc.apply(this, args);
            }
        });
    }
});

// 会影响数组结构的方法
// sort参数会出现函数，会导致不能sync数据的情况
['pop', 'push', 'reverse', 'splice', 'shift', 'unshift'].forEach(methodName => {
    let arrayFnFunc = Array.prototype[methodName];
    if (arrayFnFunc) {
        defineProperty(XDataFn, methodName, {
            writable: true,
            value(...args) {
                // 设置不可执行setHandler
                this[RUNARRMETHOD] = 1;

                let {
                    _entrendModifyId
                } = this;

                if (_entrendModifyId) {
                    // 拿到数据立刻删除
                    delete this._entrendModifyId;
                } else {
                    _entrendModifyId = getRandomId();

                    addModify(this, _entrendModifyId);
                }

                let redata = arrayFnFunc.apply(this, args);

                // 事件实例生成
                let eveObj = new XDataEvent('update', this);

                eveObj.modify = {
                    genre: "arrayMethod",
                    methodName,
                    args,
                    modifyId: _entrendModifyId
                };

                this.emit(eveObj);

                // 还原可执行setHandler
                delete this[RUNARRMETHOD];

                return redata;
            }
        });
    }
});

// 获取事件数组
const getEvesArr = (tar, eventName) => {
    let eves = tar[EVES];
    let redata = eves[eventName] || (eves[eventName] = []);
    return redata;
};

const sortMethod = Array.prototype.sort;

// 设置数组上的方法
setNotEnumer(XDataFn, {
    // sort单独处理
    sort(sFunc) {
        // 设置不可执行setHandler
        this[RUNARRMETHOD] = 1;

        let {
            _entrendModifyId
        } = this;

        if (_entrendModifyId) {
            // 拿到数据立刻删除
            delete this._entrendModifyId;
        } else {
            _entrendModifyId = getRandomId();

            addModify(this, _entrendModifyId);
        }

        // 传送的后期参数
        let args;

        if (sFunc instanceof Array) {
            args = [sFunc];

            // 先做备份
            let backThis = Array.from(this);

            sFunc.forEach((eid, i) => {
                this[i] = backThis[eid];
            });
        } else {
            // 记录顺序的数组
            let orders = [];
            args = [orders];

            // 先做备份
            let backThis = Array.from(this);

            // 执行默认方法
            sortMethod.call(this, sFunc);

            // 记录顺序
            this.forEach(e => orders.push(backThis.indexOf(e)));
        }

        // 事件实例生成
        let eveObj = new XDataEvent('update', this);

        eveObj.modify = {
            genre: "arrayMethod",
            methodName: "sort",
            args,
            modifyId: _entrendModifyId
        };

        this.emit(eveObj);

        // 还原可执行setHandler
        delete this[RUNARRMETHOD];

        return this;
    },
    // 事件注册
    on(eventName, callback, options = {}) {
        let eves = getEvesArr(this, eventName);

        // 判断是否相应id的事件绑定
        let oid = options.id;
        if (!isUndefined(oid)) {
            let tarId = eves.findIndex(e => e.eventId == oid);
            (tarId > -1) && eves.splice(tarId, 1);
        }

        // 事件数据记录
        callback && eves.push({
            callback,
            eventId: options.id,
            onData: options.data,
            one: options.one
        });

        return this;
    },
    one(eventName, callback, options = {}) {
        options.one = 1;
        return this.on(eventName, callback, options);
    },
    off(eventName, callback, options = {}) {
        let eves = getEvesArr(this, eventName);
        eves.some((opt, index) => {
            // 想等值得删除
            if (opt.callback === callback && opt.eventId === options.id && opt.onData === options.data) {
                eves.splice(index, 1);
                return true;
            }
        });
        return this;
    },
    emit(eventName, emitData, options = {}) {
        let eves, eventObj;

        if (eventName instanceof XDataEvent) {
            // 直接获取对象
            eventObj = eventName;

            // 修正事件名变量
            eventName = eventName.type;
        } else {
            // 生成emitEvent对象
            eventObj = new XDataEvent(eventName, this);
        }

        // 设置emit上的bubble
        if (options.bubble == false) {
            eventObj.bubble = false;
        }

        // 修正currentTarget
        eventObj.currentTarget = this;

        // 获取事件队列数组
        eves = getEvesArr(this, eventName);

        // 删除的个数
        let deleteCount = 0;

        // 事件数组触发
        Array.from(eves).some((opt, index) => {
            // 触发callback
            // 如果cancel就不执行了
            if (eventObj.cancel) {
                return true;
            }

            // 添加数据
            let args = [eventObj];
            !isUndefined(opt.onData) && (eventObj.data = opt.onData);
            !isUndefined(opt.eventId) && (eventObj.eventId = opt.eventId);
            !isUndefined(opt.one) && (eventObj.one = opt.one);
            !isUndefined(emitData) && (args.push(emitData));

            opt.callback.apply(this, args);

            // 删除多余数据
            delete eventObj.data;
            delete eventObj.eventId;
            delete eventObj.one;

            // 判断one
            if (opt.one) {
                eves.splice(index - deleteCount, 1);
                deleteCount++;
            }
        });

        // 冒泡触发
        if (eventObj.bubble && !eventObj.cancel) {
            let {
                parent
            } = this;
            if (parent) {
                eventObj.keys.unshift(this.hostkey);
                parent.emit(eventObj, emitData);
            }
        }

        return this;
    },
    seek(expr) {
        // 代表式的组织化数据
        let exprObjArr = [];

        let hostKey;
        let hostKeyArr = expr.match(/(^[^\[\]])\[.+\]/);
        if (hostKeyArr && hostKeyArr.length >= 2) {
            hostKey = hostKeyArr[1];
        }

        // 分析expr字符串数据
        let garr = expr.match(/\[.+?\]/g);

        garr.forEach(str => {
            str = str.replace(/\[|\]/g, "");
            let strarr = str.split(/(=|\*=|:=|~=)/);

            let param_first = strarr[0];

            switch (strarr.length) {
                case 3:
                    if (param_first) {
                        exprObjArr.push({
                            type: "keyValue",
                            k: param_first,
                            eqType: strarr[1],
                            v: strarr[2]
                        });
                    } else {
                        exprObjArr.push({
                            type: "hasValue",
                            eqType: strarr[1],
                            v: strarr[2]
                        });
                    }
                    break;
                case 1:
                    exprObjArr.push({
                        type: "hasKey",
                        k: param_first
                    });
                    break;
            }
        });

        // 要返回的数据
        let redata;

        exprObjArr.forEach((exprObj, i) => {
            let exprKey = exprObj.k,
                exprValue = exprObj.v,
                exprType = exprObj.type,
                exprEqType = exprObj.eqType;

            switch (i) {
                case 0:
                    // 初次查找数据
                    redata = seekData(this, exprObj);
                    break;
                default:
                    // 筛选数据
                    redata = redata.filter(tarData => conditData(exprKey, exprValue, exprType, exprEqType, tarData) ? tarData : undefined);
            }
        });

        // hostKey过滤
        if (hostKey) {
            redata = redata.filter(e => (e.hostkey == hostKey) ? e : undefined);
        }

        return redata;
    },
    // 插入trend数据
    entrend(options) {
        // 目标数据
        let target = this;

        // 获取target
        options.keys.forEach(k => {
            target = target[k];
        });

        switch (options.genre) {
            case "arrayMethod":
                // 判断是否运行过
                if (this[MODIFYHOST].includes(options.modifyId)) {
                    return this;
                } else {
                    addModify(this, options.modifyId);
                }

                // 临时记录数据
                target._entrendModifyId = options.modifyId;
                target[options.methodName](...options.args);
                break;
            case "delete":
                delete target[options.key];
                break;
            default:
                target[options.key] = options.value;
                break;
        }

        return this;
    },
    watch(expr, callback) {
        let arg1Type = getType(expr);
        if (/function/.test(arg1Type)) {
            callback = expr;
            expr = "_";
        }

        // 获取相应队列数据
        let tarExprObj = this[WATCHHOST][expr] || (this[WATCHHOST][expr] = {
            // 是否已经有nextTick
            isNextTick: 0,
            // 事件函数存放数组
            arr: [],
            // 空expr使用的数据
            modifys: [],
            // 注册的update事件函数
            // updateFunc
        });

        // 判断是否注册了update事件函数
        if (!tarExprObj.updateFunc) {
            this.on('update', tarExprObj.updateFunc = (e) => {
                // 如果是 _ 添加modify
                if (expr == "_") {
                    tarExprObj.modifys.push(e.trend);
                }

                // 判断是否进入nextTick
                if (tarExprObj.isNextTick) {
                    return;
                }

                // 锁上
                tarExprObj.isNextTick = 1;

                nextTick(() => {
                    switch (expr) {
                        case "_":
                            tarExprObj.arr.forEach(callback => {
                                callback({
                                    type: "watch",
                                    modifys: Array.from(tarExprObj.modifys)
                                });
                            });
                            break;
                        default:
                            // 带有expr的
                            let sData = this.seek(expr);
                            let {
                                oldVals
                            } = tarExprObj;

                            // 判断是否相等
                            let isEq = 1;
                            if (sData.length != oldVals.length) {
                                isEq = 0;
                            }
                            isEq && sData.some((e, i) => {
                                if (oldVals[i] != e) {
                                    isEq = 0;
                                    return true;
                                }
                            });

                            // 不相等就触发callback
                            if (!isEq) {
                                tarExprObj.arr.forEach(callback => {
                                    callback({
                                        type: "watch",
                                        expr,
                                        old: oldVals,
                                        val: sData
                                    });
                                });
                                tarExprObj.oldVals = sData;
                            }

                    }

                    // 开放nextTick
                    tarExprObj.isNextTick = 0;
                });
            });
        }

        // 添加callback
        tarExprObj.arr.push(callback);

        // 判断是否expr
        if (expr != "_") {
            let sData = this.seek(expr);
            callback({
                val: sData
            });
            tarExprObj.oldVals = sData;
        }

        return this;
    },
    // 注销watch
    unwatch(expr, callback) {
        let arg1Type = getType(expr);
        if (/function/.test(arg1Type)) {
            callback = expr;
            expr = "_";
        }

        let tarExprObj = this[WATCHHOST][expr];

        if (tarExprObj) {
            let tarId = tarExprObj.arr.indexOf(callback);
            if (tarId > -1) {
                tarExprObj.arr.splice(tarId, 1);
            }

            // 判断arr是否清空，是的话回收update事件绑定
            if (!tarExprObj.arr.length) {
                this.off('update', tarExprObj.updateFunc);
                delete tarExprObj.updateFunc;
                delete this[WATCHHOST][expr];
            }
        }

        return this;
    },
    // 同步数据
    sync(xdataObj, options) {
        let optionsType = getType(options);

        let watchFunc, oppWatchFunc;

        switch (optionsType) {
            case "string":
                this.watch(watchFunc = e => {
                    e.modifys.forEach(trend => {
                        let keysOne = isUndefined(trend.keys[0]) ? trend.key : trend.keys[0];
                        if (keysOne == options) {
                            xdataObj.entrend(trend);
                        }
                    });
                });
                xdataObj.watch(oppWatchFunc = e => {
                    e.modifys.forEach(trend => {
                        let keysOne = isUndefined(trend.keys[0]) ? trend.key : trend.keys[0];
                        if (keysOne == options) {
                            this.entrend(trend);
                        }
                    });
                });
                break;
            case "array":
                this.watch(watchFunc = e => {
                    e.modifys.forEach(trend => {
                        let keysOne = isUndefined(trend.keys[0]) ? trend.key : trend.keys[0];
                        if (options.includes(keysOne)) {
                            xdataObj.entrend(trend);
                        }
                    });
                });
                xdataObj.watch(oppWatchFunc = e => {
                    e.modifys.forEach(trend => {
                        let keysOne = isUndefined(trend.keys[0]) ? trend.key : trend.keys[0];
                        if (options.includes(keysOne)) {
                            this.entrend(trend);
                        }
                    });
                });
                break;
            case "object":
                let resOptions = {};
                Object.keys(options).forEach(k => {
                    resOptions[options[k]] = k;
                });

                this.watch(watchFunc = e => {
                    e.modifys.forEach(trend => {
                        trend = cloneObject(trend);
                        let keysOne = trend.keys[0];

                        keysOne = isUndefined(keysOne) ? trend.key : keysOne;

                        if (options.hasOwnProperty(keysOne)) {
                            if (isUndefined(trend.keys[0])) {
                                trend.key = options[keysOne];
                            } else {
                                trend.keys[0] = options[keysOne];
                            }
                            xdataObj.entrend(trend);
                        }
                    });
                });

                xdataObj.watch(watchFunc = e => {
                    e.modifys.forEach(trend => {

                        trend = cloneObject(trend);

                        let keysOne = trend.keys[0];

                        keysOne = isUndefined(keysOne) ? trend.key : keysOne;

                        if (resOptions.hasOwnProperty(keysOne)) {
                            if (isUndefined(trend.keys[0])) {
                                trend.key = resOptions[keysOne];
                            } else {
                                trend.keys[0] = resOptions[keysOne];
                            }
                            this.entrend(trend);
                        }
                    });
                });

                break;
            default:
                // undefined
                this.watch(watchFunc = e => {
                    e.modifys.forEach(trend => {
                        xdataObj.entrend(trend);
                    });
                });
                xdataObj.watch(oppWatchFunc = e => {
                    e.modifys.forEach(trend => {
                        this.entrend(trend);
                    });
                });
                break;
        }

        this[SYNCHOST].push({
            opp: xdataObj,
            oppWatchFunc,
            watchFunc
        });

        return this;
    },
    // 注销sync绑定
    unsync(xdataObj) {
        let tarIndex = this[SYNCHOST].findIndex(e => e.opp == xdataObj);
        if (tarIndex > -1) {
            let tarObj = this[SYNCHOST][tarIndex];

            // 注销watch事件
            this.unwatch(tarObj.watchFunc);
            tarObj.opp.unwatch(tarObj.oppWatchFunc);

            // 去除记录数据
            this[SYNCHOST].splice(tarIndex, 1);
        } else {
            console.warn("not found => ", xdataObj);
        }

        return this;
    },
    // 删除相应Key的值
    removeByKey(key) {
        // 删除子数据
        if (/\D/.test(key)) {
            // 非数字
            delete this[key];
        } else {
            // 纯数字，术语数组内元素，通过splice删除
            this.splice(parseInt(key), 1);
        }
    },
    // 删除值
    remove(value) {
        if (isUndefined(value)) {
            // 删除自身
            let {
                parent
            } = this;

            // 删除
            parent.removeByKey(this.hostkey);
        } else {
            if (isXData(value)) {
                this.removeByKey(value.hostkey);
            } else {
                let tarId = this.indexOf(value);
                if (tarId > -1) {
                    this.removeByKey(tarId);
                }
            }
        }
    },
    clone() {
        return createXData(this.object);
    },
    // push的去重版本
    add(data) {
        !this.includes(data) && this.push(data);
    },
    reset(value) {
        let valueKeys = Object.keys(value);

        // 删除本身不存在的key
        Object.keys(this).forEach(k => {
            if (!valueKeys.includes(k) && k !== "length") {
                delete this[k];
            }
        });

        assign(this, value);
        return this;
    }
});


defineProperties(XDataFn, {
    // 直接返回object
    "object": {
        get() {
            let obj = {};

            Object.keys(this).forEach(k => {
                let val = this[k];

                if (isXData(val)) {
                    obj[k] = val.object;
                } else {
                    obj[k] = val;
                }
            });

            return obj;
        }
    },
    "string": {
        get() {
            return JSON.stringify(this.object);
        }
    },
    "root": {
        get() {
            let root = this;
            while (root.parent) {
                root = root.parent;
            }
            return root;
        }
    }
});

// 私有属性正则
const PRIREG = /^_.+|^parent$|^hostkey$|^status$|^length$/;

// handler
let XDataHandler = {
    set(xdata, key, value, receiver) {
        // 私有的变量直接通过
        if (PRIREG.test(key)) {
            return Reflect.set(xdata, key, value, receiver);
        }

        let newValue = value;

        // 判断是否属于xdata数据
        if (isXData(value)) {
            if (value.parent == receiver) {
                value.hostkey = key;
            } else {
                if (value.status == "root") {
                    value.status = 'binding';
                } else {
                    // 从原来的地方拿走，先从原处删除在安上
                    value.remove();
                }
                value.parent = receiver;
                value.hostkey = key;
            }
        } else {
            // 数据转换
            newValue = createXData(value, {
                parent: receiver,
                hostkey: key
            });
        }

        let oldVal = xdata[key];

        let reData;

        if (!xdata[RUNARRMETHOD]) {
            // 相同值就别瞎折腾了
            if (oldVal === newValue) {
                return true;
            }

            if (isXData(oldVal)) {
                if (isXData(newValue) && oldVal.string === newValue.string) {
                    // 同是object
                    return true;
                }
            }

            // 事件实例生成
            let eveObj = new XDataEvent('update', receiver);

            let isFirst;
            // 判断是否初次设置
            if (!xdata.hasOwnProperty(key)) {
                isFirst = 1;
            }

            // 添加修正数据
            eveObj.modify = {
                // change 改动
                // set 新增值
                genre: isFirst ? "set" : "change",
                key,
                value,
                oldVal
            };

            reData = Reflect.set(xdata, key, newValue, receiver)

            // 触发事件
            receiver.emit(eveObj);
        } else {
            reData = Reflect.set(xdata, key, newValue, receiver)
        }

        return reData;
    },
    deleteProperty(xdata, key) {
        // 私有的变量直接通过
        if (PRIREG.test(key)) {
            return Reflect.deleteProperty(xdata, key);
        }

        // 都不存在瞎折腾什么
        if (!xdata.hasOwnProperty(key)) {
            return true;
        }

        let receiver;

        if (xdata.parent) {
            receiver = xdata.parent[xdata.hostkey];
        } else {
            Object.values(xdata).some(e => {
                if (isXData(e)) {
                    receiver = e.parent;
                    return true;
                }
            });

            if (!receiver) {
                receiver = new Proxy(xdata, XDataHandler);
            }
        }

        let oldVal = xdata[key];

        let reData = Reflect.deleteProperty(xdata, key);

        // 事件实例生成
        let eveObj = new XDataEvent('update', receiver);

        // 添加修正数据
        eveObj.modify = {
            // change 改动
            // set 新增值
            genre: "delete",
            key,
            oldVal
        };

        // 触发事件
        receiver.emit(eveObj);

        return reData;
    }
};

    // handle
let XhearElementHandler = {
    get(target, key, receiver) {
        // 判断是否纯数字
        if (/\D/.test(String(key))) {
            return Reflect.get(target, key, receiver);
        } else {
            let ele = getContentEle(receiver.ele).children[key];
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
        let childKeys = Object.keys(getContentEle(data.ele).children);
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
    emit(...args) {
        let reData = XDataFn.emit.apply(this, args);

        return reData;
    },
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
            } else {
                // 获取自定义数据
                let exkeys = this[EXKEYS];
                exkeys && exkeys.forEach(k => {
                    obj[k] = this[k];
                });
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
            let contentEle = getContentEle(this.ele);
            return contentEle.children.length;
        }
    }
});

    // 可运行的方法
['concat', 'every', 'filter', 'find', 'findIndex', 'forEach', 'map', 'slice', 'some'].forEach(methodName => {
    let oldFunc = Array.prototype[methodName];
    if (oldFunc) {
        setNotEnumer(XhearElementFn, {
            [methodName](...args) {
                return oldFunc.apply(Array.from(getContentEle(this.ele).children).map(e => createXHearElement(e)), args);
            }
        });
    }
});

// 通用splice方法
const xeSplice = (_this, index, howmany, ...items) => {
    let {
        _entrendModifyId
    } = _this;

    if (_entrendModifyId) {
        // 拿到数据立刻删除
        delete _this._entrendModifyId;
    } else {
        _entrendModifyId = getRandomId();

        addModify(_this, _entrendModifyId);
    }

    let reArr = [];

    let {
        ele
    } = _this;

    // 确认是否渲染的元素，抽出content元素
    let contentEle = getContentEle(ele);
    let {
        children
    } = contentEle;

    // 先删除后面数量的元素
    while (howmany > 0) {
        let childEle = children[index];

        reArr.push(parseToXHearElement(childEle));

        // 删除目标元素
        ele.removeChild(childEle);

        // 数量减少
        howmany--;
    }

    // 定位目标子元素
    let tar = children[index];

    // 添加元素
    if (index >= 0 && tar) {
        items.forEach(e => {
            contentEle.insertBefore(parseToXHearElement(e).ele, tar);
        });
    } else {
        items.forEach(e => {
            contentEle.appendChild(parseToXHearElement(e).ele);
        });
    }

    // 事件实例生成
    let eveObj = new XDataEvent('update', this);

    eveObj.modify = {
        genre: "arrayMethod",
        methodName: "splice",
        args: [index, howmany, ...items],
        modifyId: _entrendModifyId
    };

    _this.emit(eveObj);

    return reArr;
}

setNotEnumer(XhearElementFn, {
    splice(...args) {
        let rarr = xeSplice(this, ...args);
        return rarr;
    },
    unshift(...items) {
        xeSplice(this, 0, 0, ...items);
        return this.length;
    },
    push(...items) {
        xeSplice(this, this.length, 0, ...items);
        return this.length;
    },
    shift() {
        let rarr = xeSplice(this, 0, 1, ...args);
        return rarr;
    },
    pop() {
        let rarr = xeSplice(this, this.length - 1, 1, ...args);
        return rarr;
    },
    sort(sFunc) {
        // 获取改动id
        let {
            _entrendModifyId
        } = this;

        if (_entrendModifyId) {
            // 拿到数据立刻删除
            delete this._entrendModifyId;
        } else {
            _entrendModifyId = getRandomId();
            addModify(this, _entrendModifyId);
        }

        let contentEle = getContentEle(this.ele);

        let args;
        if (sFunc instanceof Array) {
            args = [sFunc];

            // 先做备份
            let backupChilds = Array.from(contentEle.children);

            // 修正顺序
            sFunc.forEach(eid => {
                contentEle.appendChild(backupChilds[eid]);
            });
        } else {
            // 新生成数组
            let arr = Array.from(contentEle.children).map(e => createXHearElement(e));
            let backupArr = Array.from(arr);

            // 执行排序函数
            arr.sort(sFunc);

            // 记录顺序
            let ids = [];

            arr.forEach(e => {
                ids.push(backupArr.indexOf(e));
            });

            // 修正新顺序
            arr.forEach(e => {
                contentEle.appendChild(e.ele);
            });

            args = [ids];
        }

        // 事件实例生成
        let eveObj = new XDataEvent('update', this);

        eveObj.modify = {
            genre: "arrayMethod",
            methodName: "sort",
            args,
            modifyId: _entrendModifyId
        };

        this.emit(eveObj);
        return this;
    },
    reverse() {
        let contentEle = getContentEle(this.ele);
        let childs = Array.from(contentEle.children).reverse();
        childs.forEach(e => {
            contentEle.appendChild(e);
        });
        return this;
    },
    indexOf(d) {
        if (d instanceof XhearElement) {
            d = d.ele;
        }
        return Array.from(getContentEle(this.ele).children).indexOf(d);
    },
    includes(d) {
        return this.indexOf(d) > -1;
    }
});

    // 模拟类jQuery的方法
setNotEnumer(XhearElementFn, {
    before(data) {
        xeSplice(this.parent, this.hostkey, 0, data);
        return this;
    },
    after(data) {
        xeSplice(this.parent, this.hostkey + 1, 0, data);
        return this;
    },
    remove() {
        xeSplice(this.parent, this.hostkey, 1);
    },
    empty() {
        this.html = "";
        return this;
    },
    parents(expr) {
        let pars = [];
        let tempTar = this.parent;

        if (!expr) {
            while (tempTar && tempTar.tag != "html") {
                pars.push(tempTar);
                tempTar = tempTar.parent;
            }
        } else {
            while (tempTar && tempTar.tag != "html") {
                if (meetsEle(tempTar.ele, expr)) {
                    pars.push(tempTar);
                }
                tempTar = tempTar.parent;
            }
        }

        return pars;
    },
    siblings(expr) {
        // 获取父层的所有子元素
        let parChilds = Array.from(this.ele.parentElement.children);

        // 删除自身
        let tarId = parChilds.indexOf(this.ele);
        parChilds.splice(tarId, 1);

        // 删除不符合规定的
        if (expr) {
            parChilds = parChilds.filter(e => {
                if (meetsEle(e, expr)) {
                    return true;
                }
            });
        }

        return parChilds.map(e => createXHearElement(e));
    },
    // like jQuery function find
    que(expr) {
        return $.que(expr, this.ele);
    }
});

defineProperties(XhearElementFn, {
    display: {
        get() {
            return getComputedStyle(this.ele)['display'];
        },
        set(val) {
            this.ele.style['display'] = val;
        }
    },
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
    },
    position: {
        get() {
            return {
                top: this.ele.offsetTop,
                left: this.ele.offsetLeft
            };
        }
    },
    offset: {
        get() {
            let reobj = {
                top: 0,
                left: 0
            };

            let tar = this.ele;
            while (tar && tar !== document) {
                reobj.top += tar.offsetTop;
                reobj.left += tar.offsetLeft;
                tar = tar.offsetParent
            }
            return reobj;
        }
    }
});

    // 元素自定义组件id计数器
let renderEleId = 100;

const renderEle = (ele) => {
    // 获取目标数据
    let tdb = regDatabase.get(ele.tagName.toLowerCase());

    if (!tdb) {
        console.warn('not register tag ' + ele.tagName.toLowerCase());
        return;
    }

    // 将内容元素拿出来先
    let childs = Array.from(ele.childNodes);

    // 填充代码
    tdb.temp && (ele.innerHTML = tdb.temp);

    // 生成renderId
    let renderId = renderEleId++;

    // 初始化元素
    let xhearEle = createXHearElement(ele);
    let xhearData = ele._xhearData;

    // 合并 proto 的函数
    tdb.proto && assign(xhearData, tdb.proto);

    // 设置renderID
    ele.removeAttribute('xv-ele');
    ele.setAttribute('xv-render', renderId);
    ele.xvRender = xhearData.xvRender = renderId;

    // 全部设置 shadow id
    Array.from(ele.querySelectorAll("*")).forEach(ele => ele.setAttribute('xv-shadow', renderId));

    // 渲染依赖sx-ele，
    // 让ele使用渲染完成的内元素
    Array.from(ele.querySelectorAll(`[xv-ele][xv-shadow="${renderId}"]`)).forEach(ele => renderEle(e));

    // 转换 xv-span 元素
    Array.from(ele.querySelectorAll(`xv-span[xv-shadow="${renderId}"]`)).forEach(e => {
        debugger

        // 替换xv-span
        var textnode = document.createTextNode("");
        e.parentNode.insertBefore(textnode, e);
        e.parentNode.removeChild(e);

        // 文本数据绑定
        var svkey = e.getAttribute('svkey');

        // xhearObj.watch(svkey, d => {
        //     textnode.textContent = d;
        // });
    });

    // 获取 xv-content
    let contentEle = ele.querySelector(`[xv-content][xv-shadow="${renderId}"]`);
    contentEle.xvContent = renderId;
    // 初始化一次
    createXHearElement(contentEle);

    if (contentEle) {
        defineProperty(xhearData, '$content', {
            get() {
                return createXHearElement(contentEle);
            }
        });

        defineProperty(contentEle._xhearData, "$host", {
            get() {
                return createXHearElement(ele);
            }
        });

        // 将原来的东西塞回去
        childs.forEach(ele => {
            contentEle.appendChild(ele);
        });
    }

    // 添加_exkey
    let tdbdata = tdb.data;
    let exkeys = Object.keys(tdbdata);
    defineProperty(xhearData, EXKEYS, {
        value: exkeys
    });

    // test 先合并数据
    exkeys.forEach(k => {
        let val = tdbdata[k];

        if (val instanceof Object) {
            val = cloneObject(val);
            // 数据转换
            val = createXData(val, {
                parent: xhearEle,
                hostkey: k
            });
        }
        xhearData[k] = val;
    });

    // assign(xhearData, tdb.data);
    // Object.keys(tdb.data).forEach(key => {
    //     let val = tdb.data[key];
    //     defineProperty(xhearData, key, {
    //         enumerable: true,
    //         // writable: true,
    //         get() {
    //             return val;
    //         },
    //         set(d) {
    //             val = d;
    //         }
    //     });
    // });
}

const register = (options) => {
    let defaults = {
        // 自定义标签名
        tag: "",
        // 正文内容字符串
        temp: "",
        // 属性绑定keys
        attrs: [],
        props: [],
        // 默认数据
        data: {},
        // 直接监听属性变动对象
        watch: {},
        // render tag 映射
        // renderMap:{},
        // 原型链上的方法
        // proto: {},
        // 初始化完成后触发的事件
        // inited() {},
        // 添加进document执行的callback
        // attached() {},
        // 删除后执行的callback
        // detached() {}
    };
    assign(defaults, options);

    // 复制数据
    defaults.attrs = defaults.attrs.slice();
    defaults.props = defaults.props.slice();
    defaults.data = cloneObject(defaults.data);
    defaults.watch = cloneObject(defaults.watch);

    if (defaults.temp) {
        let {
            temp
        } = defaults;

        // 判断temp有内容的话，就必须带上 xv-content
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = temp;

        let xvcontent = tempDiv.querySelector('[xv-content]');
        if (!xvcontent) {
            throw defaults.tag + " need container!";
        }

        // 去除无用的代码（注释代码）
        temp = temp.replace(/<!--.+?-->/g, "");

        //准换自定义字符串数据
        var textDataArr = temp.match(/{{.+?}}/g);
        textDataArr && textDataArr.forEach((e) => {
            var key = /{{(.+?)}}/.exec(e);
            if (key) {
                temp = temp.replace(e, `<xv-span svkey="${key[1].trim()}"></xv-span>`);
            }
        });

        defaults.temp = temp;
    }

    // 设置映射tag数据
    regDatabase.set(defaults.tag, defaults);
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
        que: (expr, root = document) => Array.from(root.querySelectorAll(expr)).map(e => createXHearElement(e)),
        xdata: createXData,
        register
    });

    // 初始化控件
    nextTick(() => {
        Array.from(document.querySelectorAll('[xv-ele]')).forEach(e => {
            renderEle(e);
        });
    });

})(window);