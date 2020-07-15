#!/usr/bin/env zsh
#
# Update backend of QNote to the latest version on git tracking remote branch.
#


SCRIPT_PATH=${0:a}
source ${0:a:h}/_setup.zsh


cd $BACKEND_HOME
exit_if_last_command_fails


echo "[从 GitHub 下载更新]"
git_pull_updates
echo ""


echo "[编译]"
yarn install
exit_if_last_command_fails
echo ""


echo "[重启后端]"
pm2 restart "$PM2_PROCESS_NAME"
exit_if_last_command_fails
echo ""

echo "完成。"
