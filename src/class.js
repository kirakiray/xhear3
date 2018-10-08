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