@echo off
chcp 65001 >nul
echo ==========================================
echo 初始化退款表
echo ==========================================
echo.

echo 正在连接数据库并创建退款表...
mysql -u root -p666666 snack_mall < create-refunds-table.sql

if %errorlevel% equ 0 (
    echo.
    echo ✓ 退款表创建成功！
    echo.
    echo 已创建的表:
    echo   - refunds (退款表)
    echo   - refund_logs (退款日志表)
    echo.
) else (
    echo.
    echo ✗ 创建失败，请检查:
    echo   1. MySQL服务是否启动
    echo   2. 数据库密码是否正确(当前: 666666)
    echo   3. 数据库snack_mall是否存在
    echo.
)

pause
