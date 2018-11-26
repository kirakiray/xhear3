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

a.on('haha', (e, data) => {
    debugger
});

a[0][1].emit('haha');

setTimeout(() => {
    a.sort((a, b) => {
        return b.text - a.text;
    });
}, 1000);