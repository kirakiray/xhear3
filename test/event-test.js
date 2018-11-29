(() => {
    let tester = expect(2, 'event test');
    
    let a = $('#a');

    a.on('haha', (e, data) => {
        tester.ok(data.val == "test data", "event ok");
        tester.ok(JSON.stringify(e.keys) == "[0,1]", "keys ok");
    });

    a[0][1].emit('haha', {
        val: "test data"
    });

})();