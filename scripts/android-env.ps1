# Run before Android commands if adb is not recognized:
#   . .\scripts\android-env.ps1

$env:ANDROID_HOME = "C:\Users\asus\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:Path"

Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
adb version
