// 模拟类jQuery的方法
setNotEnumer(XhearElementFn, {
    // on() {},
    // one() {},
    // off() {},
    // trigger() {},
    // triggerHandler() {},
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
            while (tar && tar !== document) {
                reobj.top += tar.offsetTop;
                reobj.left += tar.offsetLeft;
                tar = tar.offsetParent
            }
            return reobj;
        }
    }
});