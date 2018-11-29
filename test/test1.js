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

$.register({
    tag: "testtag",
    temp: `
    <div style="font-size:12px;color:green;margin-top:30px;">Title testtag</div>
    <div xv-content></div>
    `,
    data: {
        aa: "I am aa"
    },
    proto: {
        show() {
            console.log('show running');
        }
    }
});

let c = $('#c');