// 模拟类jQuery的方法
const likejQFn = {
    show() {
        this.style.display = "";
        return this;
    },
    hide() {
        this.style.display = "none";
        return this;
    },
    on() {},
    one() {},
    off() {},
    trigger() {},
    triggerHandler() {},
    before() {},
    after() {},
    remove() {},
    empty() {},
    // like jQuery function find
    que(expr) {
        return $.que(expr, this.ele);
    }
};

for (let fName in likejQFn) {
    defineProperty(XhearElementFn, fName, {
        value: likejQFn[fName]
    });
}

defineProperties(XhearElementFn, {
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
    }
});

assign(XhearElementFnGetterOption, {
    position() {
        return {
            top: this.ele.offsetTop,
            left: this.ele.offsetLeft
        };
    },
    offset() {
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
});