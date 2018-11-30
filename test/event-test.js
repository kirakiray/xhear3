(() => {
    let tester = expect(4, 'event test');

    let a = $('#a');

    a.on('haha', (e, data) => {
        tester.ok(data.val == "test data", "event ok");
        tester.ok(JSON.stringify(e.keys) == "[0,1]", "keys ok");
    });

    a[0][1].emit('haha', {
        val: "test data"
    });

    let b = $('#b');

    b.one('update', (e, data) => {
        tester.ok(JSON.stringify(e.keys) == "[0]", "update keys ok");
        tester.ok(e.modify.key == 1, "update modify key ok");
    });

    b[0][1] = {
        tag: "div",
        text: "bbb1_2",
        class: "bbb1_2"
    };

})();