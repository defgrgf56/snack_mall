@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   零食商城 - 配置 AppSecret
echo ========================================
echo.
echo 当前AppID: wxdca249674206beb2
echo.
echo ----------------------------------------
echo 获取AppSecret步骤：
echo ----------------------------------------
echo 1. 访问: https://mp.weixin.qq.com/
echo 2. 使用管理员微信扫码登录
echo 3. 进入: 开发 → 开发管理 → 开发设置
echo 4. 找到"开发者密钥(AppSecret)"
echo 5. 点击"生成"或"重置"
echo 6. 扫码确认
echo 7. 复制AppSecret（只显示一次！）
echo.
echo ----------------------------------------
echo.

set /p appsecret=请粘贴AppSecret: 

if "%appsecret%"=="" (
    echo.
    echo ❌ 未输入AppSecret
    echo.
    pause
    exit /b 1
)

echo.
echo 正在配置...

cd "后端API"

if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo ✅ 已创建 .env 文件
)

powershell -Command "(Get-Content .env) -replace 'WX_SECRET=.*', 'WX_SECRET=%appsecret%' | Set-Content .env"

echo ✅ AppSecret 已配置
echo.
echo ----------------------------------------
echo 正在检查配置...
echo ----------------------------------------
echo.

call npm run check-env

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ 配置完成！
    echo ========================================
    echo.
    echo 下一步：
    echo 1. 重启后端: cd 后端API && npm run dev
    echo 2. 重启微信开发者工具
    echo 3. 测试登录功能
    echo.
) else (
    echo.
    echo ⚠️  配置检查未通过，请手动检查 .env 文件
    echo.
)

pause
