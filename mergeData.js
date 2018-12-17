var fs = require('fs');

let details_list = fs.readFileSync('./output.json', 'utf-8');
details_list = JSON.parse(details_list);

let merge_data = '';
Object.keys(details_list).map((brands) => {
    details_list[brands].map((item) => {
        let file = fs.readFileSync(`./data/${item.brand}.json`, 'utf-8');
        if (file) {
            console.log(`${item.brand} 下载完成`);
            merge_data += file;
        } else {
            console.log(`${item.brand} 缺失！！！！！！！！！！`)
        }
    })
})

fs.writeFileSync('./data/all.json', merge_data, {
    flag: 'a'
});