// src/config/database.js - 数据库配置
module.exports = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'snack_mall',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '666666',
    dialect: 'mysql',
    timezone: '+08:00',
    dialectOptions: {
      charset: 'utf8mb4',
      dateStrings: true,
      typeCast: true
    },
    define: {
      timestamps: false,  // 禁用时间戳（数据表没有created_at等字段）
      underscored: true,
      paranoid: false,    // 禁用软删除
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'mysql',
    timezone: '+08:00',
    dialectOptions: {
      charset: 'utf8mb4',
      dateStrings: true,
      typeCast: true
    },
    define: {
      timestamps: false,
      underscored: true,
      paranoid: false,
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  }
}
