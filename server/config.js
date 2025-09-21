// 环境变量配置
require("dotenv").config();

const config = {
  databaseConfig: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  appConfig: {
    APP_SECRET: process.env.APP_SECRET,
    APPID: process.env.APP_ID,
    MACHID: process.env.APP_MACHID,
  },
  APIv3: process.env.APIv3,
};

module.exports = config;
