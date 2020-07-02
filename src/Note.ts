import mongoose from "mongoose";

// 创建用户数据表
const noteSchema = new mongoose.Schema({
  username:    { type: String },
  noteID:      { type: Number },
  noteContent: { type: String },
  done:        { type: Boolean }
});

export default mongoose.model("Note", noteSchema);
