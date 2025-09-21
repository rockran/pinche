const axios = require("axios");
const { appConfig } = require("../config");

const CryptoJS = require("crypto-js");

class CryptoUtils {
  constructor(secretKey = "pinche-ranhejun-key-2025") {
    this.secretKey = secretKey;
  }
  encrypt(text) {
    try {
      return CryptoJS.AES.encrypt(text, this.secretKey).toString();
    } catch (error) {
      throw new Error(`加密失败了: ${error.message}`);
    }
  }
  decrypt(encryptedText) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
      const result = decrypted.toString(CryptoJS.enc.Utf8);

      if (!result) {
        throw new Error("解密失败，可能是密钥错误或数据损坏");
      }
      return result;
    } catch (error) {
      throw new Error(`解密失败: ${error.message}`);
    }
  }
}

const cryptoUtils = new CryptoUtils();

const list = ["/api/getPincheRecords"];

function auth() {
  return async function (ctx, next) {
    const url = ctx.request.url;
    if (url.indexOf("jfsjpinpay_cb") > -1) {
      await next();
    } else {
      try {
        const authHeader = ctx.request.header["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
          const { code } = ctx.request.body;

          if (!code) {
            ctx.throw(401, "Invalid code");
          } else {
            const { openid } = await getWxUserInfo(code);

            if (!openid) {
              throw "无效 code";
            }

            ctx.state.user = {
              open_id: openid,
            };
          }
        } else {
          const { open_id } = JSON.parse(cryptoUtils.decrypt(token));
          ctx.state.user = {
            open_id,
          };
        }

        await next();
      } catch (err) {
        console.log("auth 错误", err);
        ctx.throw(401, "Invalid token");
      }
    }
  };
}

async function getWxUserInfo(code) {
  try {
    const { data } = await axios.get(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appConfig.APPID}&secret=${appConfig.APP_SECRET}&code=${code}&grant_type=authorization_code`
    );
    return data;
  } catch (error) {
    return null;
  }
}

module.exports = { auth, getWxUserInfo, cryptoUtils };
