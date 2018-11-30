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

    // test
    // if (items.length == 3) {
    //     debugger
    // }

    let {
        ele
    } = _this;

    // 确认是否渲染的元素，抽出content元素
    let children, contentEle = ele;

    if (ele.xvRender) {
        let {
            _xhearData
        } = ele;
        if (_xhearData) {
            let {
                $content
            } = _xhearData;
            if ($content) {
                contentEle = $content.ele;
                children = $content.ele.children;
            }
        }
    } else {
        children = ele.children;
    }

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

        let args;
        if (sFunc instanceof Array) {
            args = [sFunc];

            // 先做备份
            let backupChilds = Array.from(ele.children);

            // 修正顺序
            sFunc.forEach(eid => {
                ele.appendChild(backupChilds[eid]);
            });

            debugger
        } else {
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