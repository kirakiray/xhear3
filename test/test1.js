let a = $('#a');
console.log(a);

let b = $('.aaa.bbb');

b.style = {
    color: "red"
};

// let cfun;
// a.on('click', cfun = (e, data) => {
//     debugger
//     a.off('click', cfun);
// });

a.one('click', cfun = (e, data) => {
    console.log('click a');
});

let c = $('#c');