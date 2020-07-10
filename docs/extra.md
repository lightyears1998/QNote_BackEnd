# 额外内容

## 使用 PM2 管理 QNote 进程

``` shell
pm2 startup # 安装 PM2 的 systemd 配置
pm2 start src/index.js --name QNote
pm2 save
```

## 使用 Crontab 定期更新

``` crontab
# [QNote]
0 4 * * * cd /home/qnote/qnote-backend && (./bin/update-backend.zsh) >var/log/crontab-update-backend.log 2>&1
30 4 * * * cd /home/qnote/qnote-backend && (./bin/update-frontend.zsh) >var/log/crontab-update-frontend.log 2>&1
```
