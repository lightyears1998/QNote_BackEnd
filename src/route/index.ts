import express from "express";
import jwt from "jsonwebtoken";
import { getManager } from "typeorm";
import { app } from "..";
import { User, Note } from "../entity";


const router = express.Router();


router.all("/", (_, res) => {
  res.json("We good.");
});

// 登录api
// 接受:用户名 密码
// 返回:token值
router.post("/signin", async (req, res) => {
  const db = getManager();

  // 获取请求信息中的用户名,密码
  const { username, password } = req.body;

  // 查询数据库User中是否存有用户名与密码相匹配的用户
  await db.find(User, { username: username, password: password })
    .then(result => {
      if (result.length === 0) {
        res.status(401).send("账号不存在");
      } else {
        // 存在该用户切密码正确,发送token;
        const token = jwt.sign({ id: username }, app.jwtSecret);
        res.status(200).send({ token });
      }
    }).catch(() => res.status(500).send("访问数据库失败!"));
});


// // 异步检测注册用户api
// // 接受:用户名
// // 返回:用户名是否存在
// router.post("/registerName", async (req, res) => {
//   // 获取请求信息中的用户名
//   const { username } = req.body;
//   await db.findOne(User, { username: username })
//     .then(result => {
//       if (result) {
//         res.status(200).send(false);
//       } else {
//         res.status(200).send(true);
//       }
//     });
// });

// // 注册api
// // 接受:用户名与密码
// // 返回:token值
// router.post("/register", async (req, res) => {
//   // 获取请求信息中的用户名,密码
//   const { username, password, confirmPassword } = req.body;
//   console.log(req.body);

//   if (password !== confirmPassword) {
//     res.status(443).send({ "javascript": "javascript" });
//   }

//   // 写入信息
//   db.create(User, { username: username, password: password, noteNum: 0, currentNoteNum: 0, completeNoteNum: 0, giveUpNoteNum: 0 });
//   // 新账号直接登录
//   const token = jwt.sign({ id: username }, app.jwtSecret);
//   res.status(200).send({ token });
// });

// // 个人主页获取信息
// // 接受:用户名
// // 返回:用户个人信息以及所有便签信息
// router.get("/getMessage/:username", async (req, res) => {
//   // 获取请求信息中的用户名
//   const username = req.params.username;
//   // console.log(username)
//   // 获取用户信息
//   // 获取未完成事务表
//   const note = await db.find(Note, { username: username })
//     .then(result => {
//       return result;
//     });
//   await db.findOne(User, { username: username })
//     .then(result => {
//       const info = { user: result, note };
//       res.send(info);
//     })
//     .catch(err => {
//       console.log(err);
//     });
// });


// // 添加任务api
// // 接受:用户名 事务内容
// // 返回:新事务的ID
// router.get("/addTask/:username/:noteContent", async (req, res) => {
//   const username = req.params.username;
//   const noteContent = req.params.noteContent;
//   // 得到新ID
//   const { noteID, noteNum, currentNoteNum } = await db.findOne(Note, { username: username })
//     .then(result => {
//       const noteID = result.noteNum + 1;
//       const noteNum = result.noteNum;
//       const currentNoteNum = result.currentNoteNum;
//       return { noteID, noteNum, currentNoteNum };
//     });
//     // 数据库信息更新
//     // 更新User表信息
//   await db.updat({ username: username }, { noteNum: noteID, currentNoteNum: currentNoteNum + 1 });
//   // 更新Note表信息
//   await Note.create({ username: username, noteID: noteID, noteContent: noteContent, done: false });
//   // 返回ID
//   res.send(`${noteID}`);
// });


// // 事务完成api
// // 接受:用户名 完成事务的ID
// router.post("/completeTask", async (req, res) => {
//   // 获取传递过来的用户名与便签ID
//   const { username, noteID } = req.body;
//   let completeNoteNum, currentNoteNum;
//   await User.findOne({ username: username })
//     .then(result => {
//       completeNoteNum = result.completeNoteNum + 1;
//       currentNoteNum = result.currentNoteNum - 1;
//     });
//   // 更新指定便签的状态
//   await Note.updateOne({ username: username, noteID: noteID }, { done: true });
//   // 更新用户已完成事务数目
//   await User.updateOne({ username: username }, { completeNoteNum: completeNoteNum, currentNoteNum: currentNoteNum });
//   res.send("done");
// });


// // 放弃事务api
// // 接受:用户名,放弃事务的ID
// router.post("/giveUpTask", async (req, res) => {
//   console.log(req.body);
//   // 获取传递过来的用户名与便签ID
//   const { username, noteID } = req.body;
//   // 用户放弃目标数+1
//   let giveUpNoteNum, currentNoteNum;

//   await db.findOne(User, { username: username })
//     .then(result => {
//       giveUpNoteNum = result.giveUpNoteNum + 1;
//       currentNoteNum = result.currentNoteNum - 1;
//     });

//   await db.remove(Note, { username: username, noteID: noteID });
//   // 用户放弃目标数+1
//   await User.updateOne({ username: username }, { giveUpNoteNum: giveUpNoteNum, currentNoteNum: currentNoteNum });
//   res.send("done");
// });


// // api:删除已经完成的事务
// // 接受:用户名,删除事务的ID
// router.post("/deleteNote", async (req, res) => {
//   const { username, noteID } = req.body;
//   console.log(username, noteID);
//   // 删除指定便签
//   await Note.findOneAndDelete({ username: username, noteID: noteID });
//   res.send("done");
// });

const a = 123;

export {
  router,
  a
};
