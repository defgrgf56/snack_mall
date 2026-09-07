@echo off
chcp 65001 >nul
echo ========================================
echo 导入活动专区测试数据
echo ========================================
echo.

REM 设置数据库连接信息
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=snack_shop
set DB_USER=root
set DB_PASS=123456

echo 正在导入测试数据...
mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% %DB_NAME% < test-data-activity-zone.sql

if %errorlevel% == 0 (
    echo [成功] 测试数据导入成功
) else (
    echo [失败] 测试数据导入失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 测试数据导入完成！
echo ========================================
pause