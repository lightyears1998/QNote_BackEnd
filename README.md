# QNote Backend

[![Maintainability](https://api.codeclimate.com/v1/badges/1a5387c0ce48116489b5/maintainability)](https://codeclimate.com/github/lightyears1998/qnote-backend/maintainability)

QNote 后端。

## 安装和配置

QNote 后端需要特定的软件环境，详见[前置需求](docs/prerequisite.md)。

``` shell
git clone https://github.com/YongXun/QNote_BackEnd.git server
cd server
yarn install --frozen-lockfile
```

QNote 使用 `.env` 文件保存环境变量。

``` conf
# Motto
MOTTO_ENABLE=false

# Mailing
MAIL_ENABLE=true
MAIL_HOST=smtp.hosting.bareheaded.composer
MAIL_PORT=465
MAIL_FROM=from@bareheaded.composer
MAIL_USERNAME=notifier@bareheaded.composer
MAIL_PASSWORD=pa$$w0rd
```

## 运行

``` shell
node src/index.js
```

推荐[使用 PM2 管理 QNote 进程](docs/extra.md)。
