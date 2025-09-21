const mysql = require("mysql2/promise");
const { databaseConfig } = require("../config");
// 创建数据库连接池（增加 keep-alive 与连接超时以减少偶发断链）
const pool = mysql.createPool({
  host: databaseConfig.host,
  user: databaseConfig.user,
  password: databaseConfig.password,
  database: databaseConfig.database,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
});

// 统一封装执行，针对瞬时网络错误做有限次重试
async function executeWithRetry(sql, params = [], retries = 2) {
  let attempt = 0;
  // 指定会出现于网络抖动/连接被回收的错误码
  const transientErrorCodes = new Set(["ETIMEDOUT", "PROTOCOL_CONNECTION_LOST", "ECONNRESET"]);
  while (true) {
    try {
      return await pool.execute(sql, params);
    } catch (err) {
      const code = err && err.code;
      const isTransient = code && transientErrorCodes.has(code);
      if (!isTransient || attempt >= retries) throw err;
      const backoffMs = 100 * Math.pow(2, attempt); // 100ms, 200ms, 400ms
      await new Promise((r) => setTimeout(r, backoffMs));
      attempt += 1;
    }
  }
}

// 定时心跳，避免连接长时间闲置被中间设备回收
setInterval(async () => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.ping();
    } finally {
      conn.release();
    }
  } catch (e) {
    // 心跳失败不抛出，打印一次便于排查
    console.warn("MySQL 心跳失败:", e && e.code ? e.code : e);
  }
}, 60000);

// 新增 record 记录
async function createPincheRecord({
  open_id,
  order_number,
  type = 1,
  from_city = "",
  to_city = "",
  from_address = "",
  to_address = "",
  start_time = "",
  weixin = "",
  status = 0,
}) {
  const sql = `
    INSERT INTO pinche_records 
    (open_id, order_number, status, type, from_city, to_city, from_address, to_address, start_time, weixin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await executeWithRetry(sql, [
      open_id,
      order_number,
      status,
      type,
      from_city,
      to_city,
      from_address,
      to_address,
      start_time,
      weixin,
    ]);
    return result.insertId;
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("recoed 记录已存在  open_id 和 order_number 唯一");
    }
    throw error;
  }
}

// 查询记录（支持多条件查询）
async function getPincheRecords(queryParams) {
  let sql = `SELECT * FROM pinche_records WHERE 1=1`;
  const params = [];

  // 动态构建查询条件
  if (queryParams.open_id) {
    sql += ` AND open_id = ?`;
    params.push(queryParams.open_id);
  }
  if (queryParams.order_number) {
    sql += ` AND order_number = ?`;
    params.push(queryParams.order_number);
  }
  if (queryParams.status) {
    sql += ` AND status = ?`;
    params.push(queryParams.status);
  }

  // 添加其他查询条件...
  sql += ` ORDER BY create_time DESC`;

  if (queryParams.latest) {
    sql += " LIMIT 1";
  }

  try {
    const [rows] = await executeWithRetry(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

// 更新 record 记录

// 该方法需要同时传入 id 和 open_id
/**
 * 动态更新 pinche_records 表，whereParams 支持多条件
 * @param {Object} whereParams - 作为 WHERE 条件的对象，如 { open_id, id, order_number }
 * @param {Object} updates - 需要更新的字段对象
 */
async function updatePincheRecord(whereParams = {}, updates = {}) {
  const updateFields = [];
  const updateParams = [];
  const whereFields = [];
  const whereValues = [];

  Object.keys(updates).forEach((key) => {
    if (
      [
        "field_status",
        "type",
        "from_city",
        "to_city",
        "from_address",
        "to_address",
        "start_time",
        "parent_open_id",
        "weixin",
      ].includes(key)
    ) {
      updateFields.push(`${key} = ?`);
      updateParams.push(updates[key]);
    }
  });
  if (updateFields.length === 0) {
    throw new Error("无有效更新字段");
  }

  // 构建动态 WHERE 语句
  Object.keys(whereParams).forEach((key) => {
    if (["open_id", "field_status"].includes(key)) {
      whereFields.push(`${key} = ?`);
      whereValues.push(whereParams[key]);
    }
  });
  if (whereFields.length === 0) {
    throw new Error("无有效 WHERE 条件");
  }

  const sql = `
    UPDATE pinche_records 
    SET ${updateFields.join(", ")} 
    WHERE ${whereFields.join(" AND ")}
  `;

  try {
    const [result] = await executeWithRetry(sql, [...updateParams, ...whereValues]);
    return result.affectedRows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createPincheRecord,
  getPincheRecords,
  updatePincheRecord,
};
