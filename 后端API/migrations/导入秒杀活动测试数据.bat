@echo off
chcp 65001 >nul
echo ================================
echo 导入秒杀和活动测试数据
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
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < test-data-seckill-activity.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================
    echo ✓ 测试数据导入成功！
    echo ================================
    echo.
    echo 已添加:
    echo - 10个秒杀活动
    echo - 4个活动专区
    echo - 20个活动商品关联
    echo - 5张优惠券
    echo.
) else (
    echo.
    echo ================================
    echo × 导入失败，请检查:
    echo 1. 数据库连接是否正常
    echo 2. products表中是否有商品数据
    echo 3. 商品ID是否存在
    echo ================================
)

echo.
pause
