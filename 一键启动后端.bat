@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   零食商城 - 后端服务启动
echo ========================================
echo.
echo 📦 项目信息:
echo   AppID: wxdca249674206beb2
echo   端口: 3000
echo   数据库: snack_mall
echo.
echo ----------------------------------------
echo.

cd "后端API"

echo 🔍 检查配置...
call npm run check-env
echo.

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 配置检查失败，请检查 .env 文件
    pause
    exit /b 1
)

echo ========================================
echo   ✅ 配置检查通过！
echo ========================================
echo.
echo 🚀 正在启动后端服务...
echo.
echo ⚠️  启动后请保持此窗口打开
echo ⚠️  要停止服务，按 Ctrl+C
echo.
echo ========================================
echo.

call npm run dev
