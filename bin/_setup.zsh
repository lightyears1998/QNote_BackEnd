#!/usr/bin/env zsh
#
# Setup environment variables for later use.
#


if [[ $SCRIPT_PATH = "" ]]; then
    echo "_setup.zsh 应该由 update-frontend.zsh 或 update-backend.zsh 调用而非直接运行。"
    exit 1
fi


export EXEC_USER="qnote"
if [[ $USER != $EXEC_USER ]]; then
    echo "[执行身份检查]"
    echo "您是 $USER，脚本应当以 $EXEC_USER 身份运行。"
    echo "尝试切换到 $EXEC_USER 身份并执行后续代码。"

    id -u $EXEC_USER >/dev/null 2>&1
    if [[ $? != 0 ]]; then
        echo "切换身份失败，因为 $EXEC_USER 用户不存在。"
        exit 1
    fi
    echo ""

    sudo -u $EXEC_USER -H -i $SCRIPT_PATH
    exit $?
fi


exit_if_last_command_fails () {
    if [[ $? != 0 ]]; then
        exit $?
    fi
}


git_pull_updates () {
    git reset --hard > /dev/null
    git pull
    exit_if_last_command_fails
    git --no-pager log -1
}


echo "[环境变量设定]"
export PM2_PROCESS_NAME="QNote"

export BACKEND_HOME="${0:a:h}/../"
export BACKEND_HOME=$BACKEND_HOME:A

export FRONTEND_HOME="${0:a:h}/../../qnote"
export FRONTEND_HOME=$FRONTEND_HOME:A

export PC_FRONTEND_HOME="${0:a:h}/../../qnote-pc"
export PC_FRONTEND_HOME=$PC_FRONTEND_HOME:A

env
echo ""


if [[ "BACKEND_HOME" = '/' ]] || [[ "$FRONTEND_HOME" = '/' ]] then
    echo "[路径安全检查]"
    echo "BACKEND_HOME 或 FRONTEND_HOME 其一处于系统根路径。"
    echo "禁止在根路径上使用脚本。"
    exit 1;
fi
