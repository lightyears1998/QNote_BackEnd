#!/usr/bin/env zsh
#
# Update backend of QNote to the latest version on git branch.
#

USER=qnote
PM2_PROCESS_NAME=QNote

if [[ $UID == 0 || $EUID == 0 ]]; then
    echo "Running this script as root is not allowed."

    if [[ $USER == "root" ]]; then
        exit 1
    fi

    echo "Try to run as $USER."

    id -u $USER
    if [[ $? == 1 ]]; then
        echo "Fail to run this script as $USER, because that user $USER doesn't exist."
        exit 1
    fi

    sudo -u $USER $0
fi

cd "$(dirname $0)/.."
echo "Working directory: $PWD"

if [[ "$PWD" = '/' ]] then
    echo "Working in root directory is not allowed."
    exit 1;
fi

echo "\n[env]"
env

echo "\n[git pull]"
git reset --hard
git pull

echo "\n[yarn install]"
yarn install

echo "\n[pm2 restart]"
pm2 restart "$PM2_PROCESS_NAME"
