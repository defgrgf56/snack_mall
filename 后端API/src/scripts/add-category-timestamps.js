// 添加分类表时间字段的迁移脚本
const { Sequelize } = require('sequelize');

// 直接使用配置
const sequelize = new Sequelize('snack_mall', 'root', '666666', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log
});

async function migrate() {
  try {
    console.log('开始添加时间字段...');
    
    // 添加字段（MySQL 不支持 IF NOT EXISTS，需要先检查）
    await sequelize.query(`
      ALTER TABLE categories 
      ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `).catch(err => {
      if (err.message.includes('Duplicate column')) {
        console.log('字段已存在，跳过...');
      } else {
        throw err;
      }
    });
    
    console.log('✓ 字段添加成功');
    
    // 更新现有数据
    await sequelize.query(`
      UPDATE categories 
      SET created_at = NOW(), updated_at = NOW() 
      WHERE created_at IS NULL
    `);
    
    console.log('✓ 时间数据已更新');
    console.log('✓ 迁移完成！');
    
  } catch (error) {
    console.error('✗ 迁移失败:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

migrate();