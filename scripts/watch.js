const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

let count = 1;

let beforeCode = "";

let mainFun = async () => {
    // 打开主体base文件
    let basefile = await readFile('src/base.js', 'utf8');

    // 正则匹配文件名标记
    await Promise.all(basefile.match(/\/\/<\!--(.+?)-->/g).map(async (e) => {
        // 获取文件名
        let f = e.match(/\/\/<\!--(.+?)-->/);
        if (f && (1 in f)) {
            f = f[1];
        }

        // 读取文件
        let code = await readFile(`src/${f}.js`, 'utf8');

        // 替换记录部分
        basefile = basefile.replace(`//<!--${f}-->`, e => code);
    }));

    if (beforeCode == basefile) {
        return;
    }
    beforeCode = basefile;

    // 写入最终文件
    fs.writeFile('dist/xhear.js', basefile, 'utf8', (err) => {
        if (err) throw err;
        console.log('xhear.js write succeed!' + count++);
    });
}

let readFileTimer;

fs.watch('src/', async (err, file) => {
    clearTimeout(readFileTimer);
    readFileTimer = setTimeout(mainFun, 1000);
});