@echo off
call "%~dp0android-env.cmd"
cd /d "%~dp0.."
call npx expo run:android %*
