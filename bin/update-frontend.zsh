#!/usr/bin/env zsh
#
# Update frontend of QNote to the latest version on git tracking remote branch.
#


SCRIPT_PATH=${0:a}
source ${0:a:h}/_setup.zsh


cd $FRONTEND_HOME
exit_if_last_command_fails


echo "[从 GitHub 下载更新]"
git reset --hard > /dev/null
git pull
exit_if_last_command_fails
git log -1
echo ""


echo "[构建]"
npm install
npm run build
exit_if_last_command_fails
echo ""


echo "[部署到后端]"
rm -rf "$BACKEND_HOME/public"
cp -r "$FRONTEND_HOME/dist" "$BACKEND_HOME/public"
exit_if_last_command_fails
echo ""


echo "完成。"
