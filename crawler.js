// var http = require('http');
var express = require('express');
var cheerio = require('cheerio');
const charset = require('superagent-charset');
var superagent = charset(require('superagent'));
var fs = require('fs')
var url = 'http://product.cnmo.com/manu.html'; // 要爬取的网址

var app = express();


function filterHtml(html) {
    var $ = cheerio.load(html);

    var big_classify = $('#c_mlist2').eq(0);
    var classify_list = big_classify.find('.czgrad_tit');
    var brand_list = big_classify.find('.plist.hot_plist');

    //预期想抓取的每个课程结构
    /*{
        'a': [
            {
                url: 'xxx',
                brand: 'xx',
                logo: 'xxxx',
            }
        ]
    }*/

    let node_data = {};
    classify_list.each((index, classify) => {
        const element_this = $(classify);

        let classify_item = [];
        brand_list.eq(index).find('li').each((i, brand_item) => {
            brand_item = $(brand_item);
            classify_item.push({
                url: 'http:' + brand_item.find('.pic_box').attr('href'),
                brand: brand_item.find('.title').text(),
                logo: 'http:' + brand_item.find('img').attr('src'),
            })
        });
        node_data[element_this.find('.zm').text()] = classify_item;
    });

    return node_data;
}

function printInfo(info, course) {
    fs.writeFileSync('./output.json', JSON.stringify(info), {
        flag: 'a'
    })
}

async function filterDetail(html, brand) {
    var $ = cheerio.load(html);

    let details = [];
    var productlist = $('.productlist', '.mainbox');

    var page_num = $('#page_num', '.mainbox');

    productlist.find('.productlist-ul-li').each(function(index, element) {
        const item = $(element);
        details.push({
            name: item.find('.pul-title').attr('title'),
            image: 'http:' + item.find('img').attr('src'),
            brand,
        })
    })

    if (page_num.children().length > 0) {
        let href = page_num.children().eq(-1).attr('href');
        if (href) {
            href = 'http:' + href;
            let newDetails = await formatSuperagent(href, function(html) {
                return filterDetail(html, brand);
            });
            details = [...details, ...newDetails];
            return details;
        } else {
            return details;
        }
    } else {
        return details;
    }
}

function formatSuperagent(url, callback) {
    let data = null;
    return new Promise((resolve, reject) => {
        superagent.get(url)
            .charset('gbk')
            .end(function (err, sres) {
                var html = sres.text;
                data = callback(html);
                return resolve(data);
            });
    })
}

app.get('/', function (req, res, next) {
    superagent.get(url)
        .charset('gbk')
        .end(function (err, sres) {
            var html = sres.text;
            var output = filterHtml(html);
            printInfo(output, 'nodejs');
            res.send(output);
        });
})

app.get('/detail', function(req, res, next) {
    // req.buffer(false);
    let details_list = fs.readFileSync('./output.json', 'utf-8');
    details_list = JSON.parse(details_list);
    const list_length = Object.keys(details_list);
    list_length.map(function(item, index) {
        details_list[item].map(function(detail) {
            (async function(inner_data) {
                var endValue = await formatSuperagent(inner_data.url, function(html) {
                    var output =  filterDetail(html, inner_data.brand);
                    return output;
                })
                fs.writeFileSync(`./${inner_data.brand}.json`, JSON.stringify(endValue), {
                    flag: 'a'
                })
            })(detail);
        })
    })
});
app.listen(3000, function () {
    console.log('app is listening at port 3000');
});