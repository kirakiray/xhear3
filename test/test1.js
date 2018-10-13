let a = $('#a');
console.log(a);

let b = $({
    tag: "div",
    class: "aaa bbb",
    text: "i am b"
});

a.unshift(b);