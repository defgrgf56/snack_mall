@echo off
chcp 65001 >nul
echo ================================
echo 初始化秒杀和活动专区数据表
echo ================================
echo.

REM 从.env文件读取数据库配置
for /f "tokens=1,2 delims==" %%a in ('type ..\.env ^| findstr /r "^DB_"') do (
    set %%a=%%b
)

REM 去除可能的引号和空格
set DB_HOST=%DB_HOST:"=%
set DB_PORT=%DB_PORT:"=%
set DB_USER=%DB_USER:"=%
set DB_PASSWORD=%DB_PASSWORD:"=%
set DB_NAME=%DB_NAME:"=%

echo 数据库配置:
echo HOST: %DB_HOST%
echo PORT: %DB_PORT%
echo USER: %DB_USER%
echo DATABASE: %DB_NAME%
echo.

echo 正在执行SQL脚本...
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < create-seckill-activity-tables.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================
    echo ✓ 数据表初始化成功！
    echo ================================
) else (
    echo.
    echo ================================
    echo × 初始化失败，请检查数据库连接
    echo ================================
)

echo.
pause
