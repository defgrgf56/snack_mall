@echo off
chcp 65001 >nul
echo ================================
echo 导入搜索测试数据
echo ================================
echo.

mysql -h localhost -P 3306 -u root -p666666 snack_mall < test-data-search.sql

echo.
echo ================================
echo 测试数据导入完成！
echo ================================
pause
