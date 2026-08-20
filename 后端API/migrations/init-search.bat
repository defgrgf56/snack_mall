@echo off
chcp 65001 >nul
echo ================================
echo 初始化搜索表
echo ================================
echo.

mysql -h localhost -P 3306 -u root -p666666 snack_mall < create-search-tables.sql

echo.
echo ================================
echo 搜索表初始化完成！
echo ================================
pause
