#!/usr/bin/env zsh
#
# Update backend of QNote to the latest version on git branch.
#

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

echo "\n[yarn install]"
yarn install

echo "\n[pm2 restart]"
pm2 restart "$PM2_PROCESS_NAME"
