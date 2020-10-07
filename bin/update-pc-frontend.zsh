#!/usr/bin/env zsh
#
# Update frontend of QNote to the latest version on git tracking remote branch.
#


SCRIPT_PATH=${0:a}
source ${0:a:h}/_setup.zsh


cd $PC_FRONTEND_HOME
exit_if_last_command_fails


echo "[从 GitHub 下载更新]"
git_pull_updates
echo ""


echo "[构建]"
npm install
npm run build
exit_if_last_command_fails
echo ""


echo "[部署到后端]"
rm -rf "$BACKEND_HOME/public/pc"
cp -rv "$PC_FRONTEND_HOME/build" "$BACKEND_HOME/public/pc"
exit_if_last_command_fails
echo ""


echo "完成。"
