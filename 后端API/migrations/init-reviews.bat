@echo off
chcp 65001 >nul
echo ================================
echo 初始化评价表
echo ================================
echo.

mysql -h localhost -P 3306 -u root -p666666 snack_mall < create-reviews-table.sql

echo.
echo ================================
echo 评价表初始化完成！
echo ================================
pause
