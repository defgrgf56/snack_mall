@echo off
chcp 65001 >nul
echo ========================================
echo 零食小程序商城 - 导入完整测试数据
echo ========================================
echo.

REM 检查是否安装了 MySQL
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到 MySQL 命令，请确认已安装 MySQL 并添加到环境变量
    pause
    exit /b
)

echo 警告：此操作将清空数据库所有数据并导入新的测试数据！
echo.
echo 请确认以下信息：
echo   数据库地址: localhost:3306
echo   数据库名称: snack_mall
echo   用户名: root
echo.
set /p CONFIRM=确认执行吗？(输入 YES 继续): 

if /i not "%CONFIRM%"=="YES" (
    echo.
    echo 操作已取消
    pause
    exit /b
)

echo.
echo ========================================
echo 步骤 1/2: 清空现有数据...
echo ========================================
cmd /c "chcp 65001 >nul && mysql -h localhost -P 3306 -u root -p666666 --default-character-set=utf8mb4 snack_mall < 清空数据库.sql"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [错误] 清空数据失败！
    pause
    exit /b
)

echo [成功] 数据已清空
echo.

echo ========================================
echo 步骤 2/2: 导入测试数据...
echo ========================================
cmd /c "chcp 65001 >nul && mysql -h localhost -P 3306 -u root -p666666 --default-character-set=utf8mb4 snack_mall < 完整测试数据.sql"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [错误] 导入数据失败！
    pause
    exit /b
)

echo [成功] 测试数据导入完成
echo.

echo ========================================
echo 数据导入统计
echo ========================================
echo.
echo ✅ 管理员: 8个
echo ✅ 用户: 10个
echo ✅ 分类: 8个
echo ✅ 商品: 20个
echo ✅ 商品图片: 60张
echo ✅ 轮播图: 8个
echo ✅ 优惠券: 10个
echo ✅ 用户优惠券: 15条
echo ✅ 地址: 20个
echo ✅ 购物车: 12条
echo ✅ 订单: 10个（各种状态）
echo ✅ 订单商品: 20条
echo ✅ 订单日志: 30条
echo ✅ 积分记录: 20条
echo ✅ 系统配置: 8条
echo.
echo ========================================
echo 重要提示
echo ========================================
echo.
echo 1. 管理员账号: admin
echo    默认密码: admin123 (需要用bcrypt加密)
echo.
echo 2. 测试用户OpenID: oTest001 - oTest010
echo    手机号: 13800138001 - 13800138010
echo.
echo 3. 订单状态:
echo    - 待付款: 2个
echo    - 待发货: 2个
echo    - 待收货: 2个
echo    - 已完成: 4个
echo.
echo 4. 图片URL为示例数据，实际使用需要替换真实图片
echo.
pause
