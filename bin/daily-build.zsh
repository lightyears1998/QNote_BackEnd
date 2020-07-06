#!/usr/bin/env zsh

PM2_PROCESS_NAME=QNote

cd "$(dirname $0)/.."
echo "Working directory: $PWD"

if [[ "$PWD"  = '/' ]] then
    echo "Working in root directory is not allowed."
    exit 1;
fi

echo "\n[env]"
env

echo "\n[git pull]"
git pull

echo "\n[yarn install and build]"
yarn install
rm -rf ./lib
yarn build

echo "\n[pm2 restart]"
pm2 restart "$PM2_PROCESS_NAME"
