# 额外内容

## 使用 PM2 管理 QNote 进程

``` shell
pm2 startup # 安装 PM2 的 systemd 配置
pm2 start src/index.js --name QNote
pm2 save
```
