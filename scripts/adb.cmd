@echo off
call "%~dp0android-env.cmd"
"%ANDROID_HOME%\platform-tools\adb.exe" %*
