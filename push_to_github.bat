@echo off
echo ========================================================
echo Pushing CreatorHub Platform Code to GitHub Repository
echo Repository: https://github.com/harsha2k5/CreatorHub
echo ========================================================

cd /d "%~dp0"

git config user.name "harsha2k5"
git config user.email "harsha2k5@users.noreply.github.com"
git add .
git commit -m "Update CreatorHub platform"
git branch -M main
git push -u origin main
git push origin main:master

echo ========================================================
echo Process Finished!
echo ========================================================
pause
