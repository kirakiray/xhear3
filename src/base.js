((glo) => {
    //<!--public-->

    //<!--xdata-->

    //<!--class-->

    //<!--main-->

    //<!--arrayMethod-->

    //<!--likejQuery-->

    // 全局用$
    let $ = (expr) => {
        if (expr instanceof XhearElement) {
            return expr;
        }

        let tar = expr;

        if (getType(expr) === "string" && expr.search("<") === -1) {
            tar = document.querySelector(expr);
        }

        return parseToXHearElement(tar);
    }

    // init 
    glo.$ = $;
    assign($, {
        fn: XhearElementFn,
        type: getType,
        init: createXHearElement,
        que: (expr, root = document) => Array.from(root.querySelectorAll(expr)).map(e => createXHearElement(e)),
        xdata: createXData
    });

    //<!--register-->

})(window);