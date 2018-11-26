((glo) => {
    // 获取随机id
const getRandomId = () => Math.random().toString(32).substr(2);
let objectToString = Object.prototype.toString;
const getType = value => objectToString.call(value).toLowerCase().replace(/(\[object )|(])/g, '');
const isUndefined = val => val === undefined;

let {
    defineProperty,
    defineProperties,
    assign
} = Object;

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

// 克隆object
const cloneObject = obj => JSON.parse(JSON.stringify(obj));

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

        return ele;
    }
}

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

    // common
const EVES = "_eves_" + getRandomId();
const RUNARRMETHOD = "_runarrmethod_" + getRandomId();
const WATCHHOST = "_watch_" + getRandomId();
const SYNCHOST = "_synchost_" + getRandomId();
const MODIFYHOST = "_modify_" + getRandomId();
const MODIFYTIMER = "_modify_timer_" + getRandomId();

// business function
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
                    if (tarValue instanceof XData && tarValue.findIndex(e => e == exprValue) > -1) {
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
                        if (tarValue instanceof XData && tarValue.findIndex(e => e == exprValue) > -1) {
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
            if (exprKey in tarData) {
                reData = 1;
            }
            break;
    }

    return reData;
}

// 查找数据
const seekData = (data, exprObj) => {
    let arr = [];

    // 关键数据
    let exprKey = exprObj.k,
        exprValue = exprObj.v,
        exprType = exprObj.type,
        exprEqType = exprObj.eqType;

    Object.keys(data).forEach(k => {
        let tarData = data[k];

        if (tarData instanceof XData) {
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
    }, 8000);
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

                    if (value instanceof XData) {
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
const getEvesArr = (tar, eventName) => tar[EVES][eventName] || (tar[EVES][eventName] = []);

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

        let rootWatchHost = this[WATCHHOST]["$"];

        if (!rootWatchHost) {
            rootWatchHost = this[WATCHHOST]["$"] = {
                timer: 0,
                modifys: []
            };

            // update事件绑定的函数
            let updateFunc;

            // 注册update事件
            this.on('update', updateFunc = e => {
                // 添加进trend队列
                let {
                    trend
                } = e;
                rootWatchHost.modifys.push(trend);

                // 重置计时器
                clearTimeout(rootWatchHost.timer);
                rootWatchHost.timer = setTimeout(() => {
                    // 备份modifys并清零
                    let cloneModifys = Array.from(rootWatchHost.modifys);
                    rootWatchHost.modifys.length = 0;

                    Object.keys(this[WATCHHOST]).forEach(expr => {
                        let tarObj = this[WATCHHOST][expr];

                        switch (expr) {
                            case "$":
                                // 不用任何操作
                                break;
                            case "_":
                                // 无expr
                                tarObj.arr.forEach(callback => {
                                    callback({
                                        type: "watch",
                                        modifys: cloneModifys
                                    });
                                });
                                break;
                            default:
                                // 带有expr的
                                let seekData = this.seek(expr);
                                let {
                                    oldVals
                                } = tarObj;

                                // 判断是否相等
                                let isEq = 1;
                                if (seekData.length != oldVals.length) {
                                    isEq = 0;
                                }
                                isEq && seekData.some((e, i) => {
                                    if (oldVals[i] != e) {
                                        isEq = 0;
                                        return true;
                                    }
                                });

                                // 不相等就触发callback
                                if (!isEq) {
                                    tarObj.arr.forEach(callback => {
                                        callback({
                                            type: "watch",
                                            expr,
                                            old: oldVals,
                                            val: seekData
                                        });
                                    });
                                    oldVals = seekData;
                                }
                                break;
                        }
                    });
                }, 0);
            });
        }

        // 添加进队列
        let tarExprObj = this[WATCHHOST][expr] || (this[WATCHHOST][expr] = {
            arr: []
        });

        // 添加进队列
        tarExprObj.arr.push(callback);

        // 判断是否expr
        if (expr != "_") {
            let seekData = this.seek(expr);
            callback({
                val: seekData
            });
            tarExprObj.oldVals = seekData;
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

                        if (keysOne in options) {
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

                        if (keysOne in resOptions) {
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
            if (value instanceof XData) {
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

                if (val instanceof XData) {
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
        if (value instanceof XData) {
            if (value.parent == receiver) {
                value.hostkey = key;
            } else {
                if (value.status == "root") {
                    value.status = 'binding';
                    value.parent = receiver;
                    value.hostkey = key;
                } else {
                    debugger
                }
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

            if (oldVal instanceof XData) {
                if (newValue instanceof XData && oldVal.string === newValue.string) {
                    // 同是object
                    return true;
                }
            }

            // 事件实例生成
            let eveObj = new XDataEvent('update', receiver);

            let isFirst;
            // 判断是否初次设置
            if (!(key in xdata)) {
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
        if (!(key in xdata)) {
            return true;
        }

        let receiver;

        if (xdata.parent) {
            receiver = xdata.parent[xdata.hostkey];
        } else {
            Object.values(xdata).some(e => {
                if (e instanceof XData) {
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

    // 可运行的方法
['concat', 'every', 'filter', 'find', 'findIndex', 'forEach', 'map', 'slice', 'some'].forEach(methodName => {
    let oldFunc = Array.prototype[methodName];
    if (oldFunc) {
        setNotEnumer(XhearElementFn, {
            [methodName](...args) {
                return oldFunc.apply(Array.from(this.ele.children).map(e => createXHearElement(e)), args);
            }
        });
    }
});

// 通用splice方法
const xeSplice = (_this, index, howmany, ...items) => {
    let reArr = [];

    let {
        ele
    } = _this;
    let {
        children
    } = ele;

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
            ele.insertBefore(parseToXHearElement(e).ele, tar);
        });
    } else {
        items.forEach(e => {
            ele.appendChild(parseToXHearElement(e).ele);
        });
    }

    return reArr;
}

setNotEnumer(XhearElementFn, {
    splice(...args) {
        let rarr = xeSplice(this, ...args);;
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
        if (getType(sFunc).search('function') > -1) {
            let {
                ele
            } = this;

            // 新生成数组
            let arr = Array.from(ele.children).map(e => createXHearElement(e));
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
                ele.appendChild(e.ele);
            });

        } else if (sFunc instanceof Array) {
            debugger
        }
        return this;
    },
    reverse() {
        let {
            ele
        } = this;
        let childs = Array.from(ele.children).reverse();
        childs.forEach(e => {
            ele.appendChild(e);
        });
        return this;
    },
    indexOf(d) {
        if (d instanceof XhearElement) {
            d = d.ele;
        }
        return Array.from(this.ele.children).indexOf(d);
    },
    includes(d) {
        return this.indexOf(d) > -1;
    }
});

    // 模拟类jQuery的方法
setNotEnumer(XhearElementFn, {
    on() {},
    one() {},
    off() {},
    trigger() {},
    triggerHandler() {},
    before(data) {

    },
    after(data) {
        debugger
    },
    remove() {},
    empty() {
        this.html = "";
        return this;
    },
    parents() {},
    siblings(expr) {

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
            while (tar !== document) {
                reobj.top += tar.offsetTop;
                reobj.left += tar.offsetLeft;
                tar = tar.offsetParent
            }
            return reobj;
        }
    }
});

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
        xdata: createXData
    });

    $.register = (options) => {
    let defaults = {
        tag: ""
    };
    assign(defaults, options);
}

})(window);