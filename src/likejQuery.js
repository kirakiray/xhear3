// 模拟类jQuery的方法
setNotEnumer(XhearElementFn, {
    before(data) {
        if (/\D/.test(this.hostkey)) {
            console.error(`can't use before in this data =>`, this, data);
            throw "";
        }
        xeSplice(this.parent, this.hostkey, 0, data);
        return this;
    },
    after(data) {
        if (/\D/.test(this.hostkey)) {
            console.error(`can't use after in this data =>`, this, data);
            throw "";
        }
        xeSplice(this.parent, this.hostkey + 1, 0, data);
        return this;
    },
    remove() {
        if (/\D/.test(this.hostkey)) {
            console.error(`can't delete this key => ${this.hostkey}`, this, data);
            throw "";
        }
        xeSplice(this.parent, this.hostkey, 1);
    },
    empty() {
        this.html = "";
        return this;
    },
    parents(expr) {
        let pars = [];
        let tempTar = this.parent;

        if (!expr) {
            while (tempTar && tempTar.tag != "html") {
                pars.push(tempTar);
                tempTar = tempTar.parent;
            }
        } else {
            while (tempTar && tempTar.tag != "html") {
                if (meetsEle(tempTar.ele, expr)) {
                    pars.push(tempTar);
                }
                tempTar = tempTar.parent;
            }
        }

        return pars;
    },
    siblings(expr) {
        // 获取父层的所有子元素
        let parChilds = Array.from(this.ele.parentElement.children);

        // 删除自身
        let tarId = parChilds.indexOf(this.ele);
        parChilds.splice(tarId, 1);

        // 删除不符合规定的
        if (expr) {
            parChilds = parChilds.filter(e => {
                if (meetsEle(e, expr)) {
                    return true;
                }
            });
        }

        return parChilds.map(e => createXHearElement(e));
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
            return getContentEle(this.ele).textContent;
        },
        set(d) {
            getContentEle(this.ele).textContent = d;
        }
    },
    html: {
        get() {
            return getContentEle(this.ele).innerHTML;
        },
        set(d) {
            getContentEle(this.ele).innerHTML = d;
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