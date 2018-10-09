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