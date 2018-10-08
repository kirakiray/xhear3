// 模拟类jQuery的方法
let likejQFn = {
    show() {},
    hide() {},
    css() {},
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
    defineProperty(XhearElementFn, fName, {
        value: likejQFn[fName]
    });
}

assign(XhearElementFnGetterOption, {
    position() {

    },
    offset() {

    }
});