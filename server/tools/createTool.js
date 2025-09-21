const mysql = require("mysql2/promise");
const { databaseConfig } = require("../config");
// 数据库配置
const dbConfig = {
  host: databaseConfig.host,
  user: databaseConfig.user,
  password: databaseConfig.password,
  database: databaseConfig.database,
  charset: "utf8mb4",
};

// 创建数据库连接池
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 创建表
async function createTable(createTableSQL) {
  try {
    const connection = await pool.getConnection();
    await connection.execute(createTableSQL);
    console.log("数据表创建成功！");
    connection.release();
    return true;
  } catch (error) {
    console.error("创建数据表失败:", error.message);
    return false;
  }
}

// const pinche_order = `
// CREATE TABLE IF NOT EXISTS pinche_order (
//     id INT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键ID',
//     open_id VARCHAR(200) NOT NULL COMMENT '用户唯一标识，关联user表',
//     order_number VARCHAR(100) NOT NULL UNIQUE COMMENT '订单号，唯一',
//     pay_status TINYINT NOT NULL DEFAULT 0 COMMENT '支付状态:0-未支付,1-已支付',
//     create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
//     update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

//     INDEX idx_open_id (open_id),
//     INDEX idx_order_number (order_number),
//     INDEX idx_pay_status (pay_status),
//     INDEX idx_create_time (create_time)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拼车支付订单表'
// `;

const pinche_records = `
CREATE TABLE IF NOT EXISTS pinche_records (
id INT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键ID',
open_id VARCHAR(200) NOT NULL UNIQUE COMMENT '用户唯一标识',
parent_open_id VARCHAR(200) COMMENT '谁推广来的',
order_number VARCHAR(100) NOT NULL UNIQUE COMMENT '订单号，唯一',
status TINYINT  DEFAULT 0 COMMENT '状态:0-进行中,1-已完成',
field_status TINYINT  DEFAULT 0 COMMENT '状态:0-已经支付未填写,1-已完成',
type TINYINT DEFAULT 1 COMMENT '1:乘客,2,顺风车,3:滴滴',
from_city VARCHAR(100)  COMMENT '出发城市',
to_city VARCHAR(100)  COMMENT '目的地城市',
from_address VARCHAR(200)  COMMENT '出发地详细地址',
to_address VARCHAR(200)  COMMENT '目的地详细地址',
start_time VARCHAR(10)  COMMENT '出发时间',
weixin VARCHAR(100)  COMMENT '联系微信号',
create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

INDEX idx_open_id (open_id),
INDEX idx_parent_open_id (parent_open_id),
INDEX idx_status (status),
INDEX idx_type (type),
INDEX idx_from_city (from_city),
INDEX idx_to_city (to_city),
INDEX idx_start_time (start_time),
INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拼车订单记录表'
`;

// createTable(pinche_order);
createTable(pinche_records);
