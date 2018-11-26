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
const createXHearElement = ele => {
    let xhearEle = ele._XHearEle;
    if (!xhearEle) {
        xhearEle = new XhearElement(ele);
        ele._XHearEle = xhearEle;
    }
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