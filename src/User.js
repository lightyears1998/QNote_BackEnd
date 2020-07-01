const mongoose = require("mongoose");

//连接用户数据库
mongoose.connect('mongodb://localhost/user', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('连接数据库成功!'))
    .catch(err => console.log(err, '连接数据库失败!'))

//创建用户数据表
const userSchema = new mongoose.Schema({
    username: { type: String },
    password: { type: String },
    noteNum: { type: Number },
    currentNoteNum: { type: Number },
    giveUpNoteNum: { type: Number },
    completeNoteNum: { type: Number }
});

module.exports = mongoose.model('User', userSchema);