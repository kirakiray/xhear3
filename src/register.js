// 元素自定义组件id计数器
let renderEleId = 100;

const renderEle = (ele) => {
    // 获取目标数据
    let tdb = regDatabase.get(ele.tagName.toLowerCase());

    if (!tdb) {
        console.warn('not register tag ' + ele.tagName.toLowerCase());
        return;
    }

    // 将内容元素拿出来先
    let childs = Array.from(ele.childNodes);

    // 填充代码
    tdb.temp && (ele.innerHTML = tdb.temp);

    // 生成renderId
    let renderId = renderEleId++;

    // 初始化元素
    let xhearEle = createXHearElement(ele);
    let xhearData = ele._xhearData;

    // 合并 proto 的函数
    tdb.proto && assign(xhearData, tdb.proto);

    // 设置renderID
    ele.removeAttribute('xv-ele');
    ele.setAttribute('xv-render', renderId);
    xhearData.xvRender = renderId;

    // 渲染依赖sx-ele，
    // 让ele使用渲染完成的内元素
    Array.from(ele.querySelectorAll(`[xv-ele][xv-shadow="${renderId}"]`)).forEach(ele => renderEle(e));

    // 全部设置 shadow id
    Array.from(ele.querySelectorAll("*")).forEach(ele => ele.setAttribute('xv-shadow', renderId));

    // 获取 xv-content
    let contentEle = ele.querySelector(`[xv-content][xv-shadow="${renderId}"]`);
    // 初始化一次
    createXHearElement(contentEle);

    if (contentEle) {
        defineProperty(xhearData, '$content', {
            get() {
                return createXHearElement(contentEle);
            }
        });

        defineProperty(contentEle._xhearData, "$host", {
            get() {
                return createXHearElement(ele);
            }
        });

        // 将原来的东西塞回去
        childs.forEach(ele => {
            contentEle.appendChild(ele);
        });
    }

    // test 先合并数据
    assign(xhearData, tdb.data);
}

const register = (options) => {
    let defaults = {
        // 自定义标签名
        tag: "",
        // 正文内容字符串
        temp: "",
        // 属性绑定keys
        attrs: [],
        props: [],
        // 默认数据
        data: {},
        // 直接监听属性变动对象
        watch: {},
        // render tag 映射
        // renderMap:{},
        // 原型链上的方法
        // proto: {},
        // 初始化完成后触发的事件
        // inited() {},
        // 添加进document执行的callback
        // attached() {},
        // 删除后执行的callback
        // detached() {}
    };
    assign(defaults, options);

    // 去除无用的代码（注释代码）
    defaults.temp = defaults.temp.replace(/<!--.+?-->/g, "");

    // 设置映射tag数据
    regDatabase.set(defaults.tag, defaults);
}