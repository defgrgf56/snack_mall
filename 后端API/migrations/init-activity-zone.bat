@echo off
chcp 65001 >nul
echo ========================================
echo 初始化活动专区表
echo ========================================
echo.

REM 设置数据库连接信息
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=snack_shop
set DB_USER=root
set DB_PASS=123456

echo 正在创建活动专区表...
mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% %DB_NAME% < create-activity-zone-tables.sql

if %errorlevel% == 0 (
    echo [成功] 活动专区表创建成功
) else (
    echo [失败] 活动专区表创建失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 活动专区表初始化完成！
echo ========================================
pause