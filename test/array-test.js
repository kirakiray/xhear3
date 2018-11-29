(() => {
    let tester = expect(5, 'array test');

    let a = $('#a');

    let b = $({
        tag: "div",
        class: "aaa bbb",
        text: "2.5"
    });

    // 在a前面插入b
    a.splice(1, 1, b);

    tester.ok(a[1].text == "2.5", "a[1] ok");
    tester.ok(a.length == 6, "splice ok");

    setTimeout(() => {
        // 替换
        a[3] = {
            tag: "div",
            text: "3.5"
        };

        tester.ok(parseFloat(a.ele.children[3].innerHTML) == 3.5, "replace arr ok");

        a.sort((a, b) => {
            return b.text - a.text;
        });

        tester.ok(parseInt(a[0].text) == 6, "sort ok 1");
        tester.ok(parseInt(a[1].text) == 5, "sort ok 2");
    }, 1000);


})();