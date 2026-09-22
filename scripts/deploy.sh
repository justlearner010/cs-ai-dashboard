#!/usr/bin/env bash
# 一键部署：提交全部改动并推送到 GitHub，Actions 自动构建发布到 Pages。
# 用法：npm run deploy
set -euo pipefail
cd "$(dirname "$0")/.."

git add -A
if git diff --cached --quiet; then
  echo "无改动，仅执行 push"
else
  git commit -m "deploy: $(date '+%F %T')

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
fi
git push
echo "已推送，GitHub Actions 正在构建部署 → https://justlearner010.github.io/cs-ai-dashboard/"
echo "查看进度：gh run watch  或仓库 Actions 页"
