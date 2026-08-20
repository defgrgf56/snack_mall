@echo off
chcp 65001 >nul
echo ================================
echo 导入评价测试数据
echo ================================
echo.

mysql -h localhost -P 3306 -u root -p666666 snack_mall < test-data-reviews.sql

echo.
echo ================================
echo 评价测试数据导入完成！
echo ================================
pause
