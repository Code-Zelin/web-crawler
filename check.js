var fs = require('fs');

let details_list = fs.readFileSync('./output.json', 'utf-8');
details_list = JSON.parse(details_list);

Object.keys(details_list).map((brands) => {
    details_list[brands].map((item) => {
        let file = fs.readFileSync(`./phone/${item.brand}.json`, 'utf-8');
        if (file) {
            console.log(`${item.brand} 下载完成`);
        } else {
            console.log(`${item.brand} 缺失！！！！！！！！！！`)
        }
    })
})