var express = require('express');
var router = express.Router();
var wechat = require('wechat');
var mysql = require('mysql');
var schedule = require("node-schedule");


var config = {                                  // 微信公众号配置信息
    token: 'weixin',
    appid: 'wx68b18f787f9878cd',
    appsecret: '056b3b767a368f84fac584456111ad7f',
    encodingAESKey: ''
};

var huxi_state = 0,         // 座椅人状态标志变量
    dahan_state = 0,
    zhuangtai_state = 0;


var sql = 'SELECT * FROM heal_chair';
// 定时任务

// var rule = new schedule.RecurrenceRule();
// var times = [];
// for (var i = 1; i < 60; i++){
//     times.push(i);
// }
// rule.second = times;
// var doSomeThing = schedule.scheduleJob(rule, function () {
//                     // console.log('定时任务测试');
// })

setInterval(function () {

    var connection = mysql.createConnection({       // 数据库配置信息   每次关闭连接都要重新创建一个连接
        host: '111.231.90.29',
        user: 'root',
        password: 'LL960220',
        port: '3306',
        database: 'test',
        charset: 'utf8'
    });

    //mysql 数据库处理 start
    connection.connect();

    connection.query(sql, function (err, result) {      // 异步执行，执行完后返回回调函数
        if (err){
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }

        console.log(result);    // 打印测试

        for (number in result){
            switch (result[number].people_state){

                case '呼吸':
                    if (result[number].value == 0){
                        console.log('呼吸正常');
                        huxi_state = 0;
                    } else {
                        console.log('呼吸不正常,心率偏高');
                        huxi_state = 1;
                    }
                    break;

                case '打鼾':
                    if (result[number].value == 0){
                        console.log('没人打鼾');
                        dahan_state = 0;
                    } else {
                        console.log('有人打鼾，心率略微偏高');
                        dahan_state = 1;
                    }
                    break;

                case '有无人':
                    if (result[number].value == 0){
                        console.log('座椅上无人');
                        zhuangtai_state = 0;
                    } else {
                        console.log('座椅上有人');
                        zhuangtai_state = 1;
                    }
                    break;

                default:
                    console.log('数据出错');
            }
        }
    });

    connection.end();

    // 数据库处理 end
}, 2000);

// 定时任务 end















// 微信公众号处理 start

router.use(express.query());

router.use('/', wechat(config, function (req, res, next) {
    console.log(req.weixin);
    var message = req.weixin;

    //文本    可换成switch
    if (message.Content === '心率') {

        if (dahan_state == 1 || huxi_state == 1){
            res.reply('心率略微偏高');
        } else {
            res.reply('心率正常');
        }
    }
    else if (message.Content === '状态') {

        if (zhuangtai_state == 1){
            res.reply('有人在座椅上');
        } else {
            res.reply('座椅上无人');
        }
    }
    else if (message.Content === '打鼾') {

        if (dahan_state == 1){
            res.reply('有人打鼾,心率偏高');
        } else {
            res.reply('没人打鼾');
        }
    }
    else if (message.Content === '呼吸'){
        if (huxi_state == 1){
            res.reply('呼吸急促，心率偏高');
        } else {
            res.reply('呼吸正常');
        }
    }

}));

module.exports = router;

// 微信公众号处理 end