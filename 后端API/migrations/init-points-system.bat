@echo off
chcp 65001 >nul
echo ================================
echo 初始化积分系统表
echo ================================
echo.

mysql -h localhost -P 3306 -u root -p666666 snack_mall < create-points-system-tables.sql

echo.
echo ================================
echo 积分系统表初始化完成！
echo ================================
pause
