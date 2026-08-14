@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   零食商城 - 首次提交到GitHub
echo ========================================
echo.
echo GitHub仓库: https://github.com/defgrgf56/snack_mall.git
echo.
echo ----------------------------------------
echo 提交前检查清单：
echo ----------------------------------------
echo.
echo ✅ 代码已完成开发
echo ✅ 已测试主要功能
echo ⚠️  确认.env文件不会被提交
echo ⚠️  确认无敏感信息
echo.
set /p confirm=确认要提交吗？(y/n): 

if /i not "%confirm%"=="y" (
    echo.
    echo ❌ 取消提交
    pause
    exit /b 0
)

echo.
echo ----------------------------------------
echo 开始提交...
echo ----------------------------------------
echo.

REM 检查是否已初始化Git
if not exist ".git" (
    echo 📦 初始化Git仓库...
    git init
    echo.
)

REM 检查远程仓库
git remote -v | findstr "origin" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 🔗 添加远程仓库...
    git remote add origin https://github.com/defgrgf56/snack_mall.git
    echo.
)

REM 配置Git用户（如果未配置）
git config user.name >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    set /p username=请输入Git用户名: 
    git config user.name "!username!"
)

git config user.email >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    set /p email=请输入Git邮箱: 
    git config user.email "!email!"
)

echo.
echo 📝 添加文件...
git add .

echo.
echo 💾 创建提交...
git commit -m "初始提交：零食商城小程序完整项目

功能特性：
- ✅ 11个小程序页面（首页、分类、购物车、我的等）
- ✅ 40+个后端API接口
- ✅ 微信登录（支持开发/生产模式）
- ✅ TabBar底部导航（4个Tab）
- ✅ 购物车徽标提示
- ✅ 完整的项目文档（20000+字）

技术栈：
- 前端：微信小程序原生开发
- 后端：Node.js + Express + MySQL + Sequelize
- 认证：JWT身份认证
- 文档：Markdown完整文档

AppID: wxdca249674206beb2"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 提交失败
    pause
    exit /b 1
)

echo.
echo 🚀 推送到GitHub...
echo.
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  主分支推送失败，尝试master分支...
    git push -u origin master
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ 提交成功！
    echo ========================================
    echo.
    echo 🎉 代码已成功推送到GitHub
    echo.
    echo 仓库地址:
    echo https://github.com/defgrgf56/snack_mall
    echo.
    echo 下一步：
    echo 1. 访问GitHub查看代码
    echo 2. 添加README完善信息
    echo 3. 继续开发新功能
    echo.
) else (
    echo.
    echo ========================================
    echo   ⚠️  推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络问题
    echo 2. 需要身份认证
    echo 3. 仓库权限问题
    echo.
    echo 解决方案：
    echo 1. 检查网络连接
    echo 2. 配置GitHub Personal Access Token
    echo 3. 参考：Git使用指南.md
    echo.
)

pause
