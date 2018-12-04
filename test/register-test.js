(() => {
    let tester = expect(10, 'register test');

    $.register({
        tag: "testtag",
        temp: `
        <div style="font-size:12px;color:green;margin-top:30px;">Title testtag -------  itext:{{itext}}</div>
        <div xv-content></div>
        <div xv-tar="cbox"></div>
        <input type="text" xv-module="itext" style="background-color:transparent;color:#ddd;" />
        `,
        data: {
            aa: "I am aa",
            itext: "haha",
            sobj: {
                val: "I am sdata"
            }
        },
        proto: {
            show() {
                console.log('show running');
            }
        },
        watch: {
            itext(e) {
                tester.ok(this.ele == c.ele, "tag ok 2");
            }
        },
        inited() {
            tester.ok(this.ele == c.ele, "tag ok 1");
        },
        attached() {
            tester.ok(this.ele.getRootNode() == document, 'attacehd ok');
        }
    });

    // 等渲染完毕
    setTimeout(() => {
        let c = $('#c');
        tester.ok(c.aa == "I am aa", "register data ok");

        // 监听改动
        $('#main').one('update', e => {
            tester.ok(JSON.stringify(e.keys) == "[2]", "keys ok");
            tester.ok(e.modify.key == "aa", 'modify ok');
        });

        c.aa = 'change aa';

        $('#main').one('update', e => {
            tester.ok(JSON.stringify(e.keys) == `[2,"sobj"]`, "keys ok 2");
            tester.ok(e.modify.key == "val", 'modify ok 2');
        });

        c.sobj.val = "change sdata";

        // 直接设置元素
        c.$cbox[0] = {
            tag: "div",
            text: "haha"
        }

        tester.ok(c.$cbox[0].ele.getAttribute('xv-shadow') == c.ele.getAttribute('xv-render'), "shadow set ok 1");

        // 同步push添加
        c.$cbox.push({
            tag: "div",
            text: "haha2"
        });

        tester.ok(c.$cbox[1].ele.getAttribute('xv-shadow') == c.ele.getAttribute('xv-render'), "shadow set ok 2");
    }, 100);
})();