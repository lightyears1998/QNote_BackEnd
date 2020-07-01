const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const path = require('path');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('secret', 'suiyi') //  这里设置的字符串可以是任意的

app.use(express.static(path.join(__dirname, 'public')));

let allowCors = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin); // 设置允许来自哪里的跨域请求访问（req.headers.origin为当前访问来源的域名与端口）
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS"); // 设置允许接收的请求类型
    res.header("Access-Control-Allow-Headers", "Content-Type,request-origin"); // 设置请求头中允许携带的参数
    res.header("Access-Control-Allow-Credentials", "true"); // 允许客户端携带证书式访问。保持跨域请求中的Cookie。注意：此处设true时，Access-Control-Allow-Origin的值不能为 '*'
    res.header("Access-control-max-age", 1000); // 设置请求通过预检后多少时间内不再检验，减少预请求发送次数
    next();
};

app.use(allowCors); // 使用跨域中间件

app.listen(3000, () => {
    console.log('服务器启动成功!');
})

//获取用户数据库
let User = require('./User.js');
let Note = require('./note.js');

//token插件
const jwt = require('jsonwebtoken');

//登录api
//接受:用户名 密码
//返回:token值
app.post('/signin', async(req, res) => {
    console.log(req.body);
    // 获取请求信息中的用户名,密码
    const { username, password } = req.body;
    // 查询数据库User中是否存有用户名与密码相匹配的用户
    await User.find({ username: username, password: password })
        .then(result => {
            if (result.length === 0) {
                res.status(401).send('账号不存在');
            } else {
                //存在该用户切密码正确,发送token;
                const token = jwt.sign({ id: User._id }, app.get("secret"));
                res.status(200).send({ token });
            }
        }).catch(err => res.status(500).send('访问数据库失败!'));
})

//异步检测注册用户api
//接受:用户名
//返回:用户名是否存在
app.post('/registerName', async(req, res) => {
    //获取请求信息中的用户名
    let { username } = req.body;
    await User.findOne({ username: username })
        .then(result => {
            if (result) {
                res.status(200).send(false);
            } else {
                res.status(200).send(true)
            }
        })
})

//注册api
//接受:用户名与密码
//返回:token值
app.post('/register', async(req, res) => {
    //获取请求信息中的用户名,密码
    const { username, password, confirmPassword } = req.body;
    console.log(req.body)
        //写入信息
    await User.create({ username: username, password: password, noteNum: 0, currentNoteNum: 0, completeNoteNum: 0, giveUpNoteNum: 0 });
    //新账号直接登录
    const token = jwt.sign({ id: User._id }, app.get("secret"));
    res.status(200).send({ token });
})

//个人主页获取信息
//接受:用户名
//返回:用户个人信息以及所有便签信息
app.get('/getMessage/:username', async(req, res) => {
    //获取请求信息中的用户名
    const username = req.params.username;
    // console.log(username)
    //获取用户信息
    //获取未完成事务表
    let note = await Note.find({ username: username })
        .then(result => {
            return result;
        })
    await User.findOne({ username: username })
        .then(result => {
            let info = { user: result, note }
            res.send(info);
        })
        .catch(err => { console.log(err) })
})


//添加任务api
//接受:用户名 事务内容
//返回:新事务的ID
app.get('/addTask/:username/:noteContent', async(req, res) => {
    let username = req.params.username;
    let noteContent = req.params.noteContent;
    //得到新ID
    let { noteID, noteNum, currentNoteNum } = await User.findOne({ username: username })
        .then(result => {
            let noteID = result.noteNum + 1;
            let noteNum = result.noteNum;
            let currentNoteNum = result.currentNoteNum;
            return { noteID, noteNum, currentNoteNum };
        })
        //数据库信息更新
        //更新User表信息
    await User.updateOne({ username: username }, { noteNum: noteID, currentNoteNum: currentNoteNum + 1 })
        //更新Note表信息
    await Note.create({ username: username, noteID: noteID, noteContent: noteContent, done: false });
    //返回ID
    res.send(`${noteID}`);
})

//事务完成api
//接受:用户名 完成事务的ID
app.post('/completeTask', async(req, res) => {
    //获取传递过来的用户名与便签ID
    let { username, noteID } = req.body;
    let completeNoteNum, currentNoteNum;
    await User.findOne({ username: username })
        .then(result => {
            completeNoteNum = result.completeNoteNum + 1;
            currentNoteNum = result.currentNoteNum - 1;
        })
        //更新指定便签的状态
    await Note.updateOne({ username: username, noteID: noteID }, { done: true });
    //更新用户已完成事务数目
    await User.updateOne({ username: username }, { completeNoteNum: completeNoteNum, currentNoteNum: currentNoteNum });
    res.send('done');
})

//放弃事务api
//接受:用户名,放弃事务的ID
app.post('/giveUpTask', async(req, res) => {
    console.log(req.body)
        //获取传递过来的用户名与便签ID
    const { username, noteID } = req.body;
    //用户放弃目标数+1
    let giveUpNoteNum, currentNoteNum;
    await User.findOne({ username: username })
        .then(result => {
            giveUpNoteNum = result.giveUpNoteNum + 1;
            currentNoteNum = result.currentNoteNum - 1;
        })
        //删除指定便签
    await Note.findOneAndDelete({ username: username, noteID: noteID });
    //用户放弃目标数+1
    await User.updateOne({ username: username }, { giveUpNoteNum: giveUpNoteNum, currentNoteNum: currentNoteNum });
    res.send('done');
})

//api:删除已经完成的事务
//接受:用户名,删除事务的ID
app.post('/deleteNote', async(req, res) => {
    const { username, noteID } = req.body;
    console.log(username, noteID)
        //删除指定便签
    await Note.findOneAndDelete({ username: username, noteID: noteID });
    res.send('done');
})