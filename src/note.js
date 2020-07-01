const mongoose = require("mongoose");

//创建用户数据表
const noteSchema = new mongoose.Schema({
    username: { type: String },
    noteID: { type: Number },
    noteContent: { type: String },
    done: { type: Boolean }
});

module.exports = mongoose.model('Note', noteSchema);