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