#!/usr/bin/env zsh
#
# Update frontend of QNote to the latest version on git branch.
#

BACKEND_HOME="$(dirname $0)/.."
BACKEND_HOME="$BACKEND_HOME:A"

FRONTEND_HOME="$BACKEND_HOME/../qnote"
FRONTEND_HOME="$FRONTEND_HOME:A"

echo "Backend Home: $BACKEND_HOME"
echo "Frontend Home: $FRONTEND_HOME"

if [[ "$BACKEND_HOME"  = '/' ]] || [[ "$FRONTEND_HOME"  = '/' ]] then
    echo "Working in root directory is not allowed."
    exit 1;
fi

cd $FRONTEND_HOME
echo "\nWorking directory: $FRONTEND_HOME"

echo "\n[env]"
env

echo "\n[update codebase]"
git pull

echo "\n[build]"
npm install
npm run build

echo "\n[deploy]"
rm -rf "$BACKEND_HOME/public"
cp -r "$FRONTEND_HOME/dist" "$BACKEND_HOME/public"
echo "done"
