@echo off
chcp 65001 >nul
echo ========================================
echo 导入测试数据到 snack_mall 数据库
echo ========================================
echo.

REM 设置 MySQL 路径
set MYSQL_PATH=D:\MySQL\bin\mysql.exe

echo 请输入 MySQL root 密码：
set /p MYSQL_PASSWORD=

echo.
echo 正在导入测试数据...
echo.

"%MYSQL_PATH%" -u root -p%MYSQL_PASSWORD% snack_mall < "test-data.sql"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 测试数据导入成功！
    echo ========================================
    echo.
    echo 📊 已导入的数据：
    echo - 管理员账号: 2 个
    echo - 商品分类: 6 个  
    echo - 测试商品: 8 个
    echo - 轮播图: 3 个
    echo - 优惠券: 3 个
    echo.
    echo 📝 管理员登录信息：
    echo 用户名: admin   密码: 123456
    echo 用户名: manager 密码: 123456
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ 导入失败！
    echo ========================================
    echo.
    echo 请检查：
    echo 1. 数据库 snack_mall 是否已创建
    echo 2. MySQL root 密码是否正确
    echo 3. test-data.sql 文件是否存在
    echo.
)

pause
