// 模拟类jQuery的方法
let likejQFn = {
    show() {},
    hide() {},
    // css() {},
    on() {},
    one() {},
    off() {},
    trigger() {},
    triggerHandler() {},
    before() {},
    after() {},
    remove() {},
    empty() {}
};

for (let fName in likejQFn) {
    defineProperty(XhearFn, fName, {
        value: likejQFn[fName]
    });
}

// css属性专用Proxy handler
// const cssProxyHandler = {
//     get(target, key, receiver) {
//         debugger
//     },
//     set(target, key, value, receiver) {
//         debugger
//     }
// };

// defineProperties(XhearFn, {
//     css: {
//         get() {
//             // 获取style
//             let {
//                 style
//             } = this.ele;
//             let styleKeys = Array.from(style);

//             let reobj = {};

//             styleKeys.forEach(k => {
//                 reobj[k] = style[k];
//             });

//             return new Proxy(reobj, cssProxyHandler);
//         },
//         set(options) {
//             // 设置style
//             let styleKeys = Array.from(this.ele.style);

//             let {
//                 style
//             } = this.ele;
//         }
//     }
// });

assign(XhearFnGetterOption, {
    position() {

    },
    offset() {

    }
});