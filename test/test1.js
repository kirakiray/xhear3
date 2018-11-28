let a = $('#a');
console.log(a);

let b = $({
    tag: "div",
    class: "aaa bbb",
    text: "2.5"
});

b.style = {
    color: "red"
};

// 在a前面插入b
// a.unshift(b);
a.splice(1, 1, b);

a[3] = {
    tag: "div",
    text: "3.5"
};

// let cfun;
// a.on('click', cfun = (e, data) => {
//     debugger
//     a.off('click', cfun);
// });

a.one('click', cfun = (e, data) => {
    debugger
});

a.on('haha', (e, data) => {
    console.log("haha => ", e, data);
});

a[0][1].emit('haha', {
    val: "test data"
});

setTimeout(() => {
    a.sort((a, b) => {
        return b.text - a.text;
    });
}, 1000);