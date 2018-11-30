(() => {
    let tester = expect(5, 'register test');

    $.register({
        tag: "testtag",
        temp: `
        <div style="font-size:12px;color:green;margin-top:30px;">Title testtag</div>
        <div xv-content></div>
        `,
        data: {
            aa: "I am aa",
            sobj: {
                val: "I am sdata"
            }
        },
        proto: {
            show() {
                console.log('show running');
            }
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
    }, 100);
})();