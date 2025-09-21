const fs = require("fs");
const apeWeChatPay = require("ape-node-wechatpay-v3");
const schedule = require("node-schedule");
const { appConfig, APIv3 } = require("../config");

const weChatPay = new apeWeChatPay({
  appid: appConfig.APPID,
  mchid: appConfig.MACHID,
  serial_no: "53DCFD2DCF5CB84C3DDF791F190F0CC8A687A8F9",
  authType: "WECHATPAY2-SHA256-RSA2048",
  apiclientCert: fs.readFileSync("file/apiclient_cert.pem"),
  apiclientkey: fs.readFileSync("file/apiclient_key.pem"),
  certPath: "file/certificate",
  APIv3,
});

function generateOrderNumber() {
  const prefix = "HEMU";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 8; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${new Date().getTime()}${randomPart}`;
}

async function getJsPayData({ amount, openid }) {
  if (!amount || !openid) {
    return null;
  }

  const order_number = generateOrderNumber();
  let { data } = await weChatPay.jsapiPay({
    appid: appConfig.APPID,
    mchid: appConfig.MACHID,
    out_trade_no: order_number,
    description: "拼车吧",
    notify_url: "https://hemugzs.top/api/jfsjpinpay_cb",
    amount: { total: Number(amount) },
    payer: { openid: openid },
  });

  return {
    appid: data.appid,
    timeStamp: data.timeStamp,
    nonceStr: data.nonceStr,
    package: data.package,
    signType: data.signType,
    paySign: data.paySign,
  };
}

async function wxJsPayCallback(ctx, cb) {
  const body = ctx.request.body;
  const headers = ctx.request.header;
  await weChatPay.verifySignature(
    headers["wechatpay-signature"],
    headers["wechatpay-serial"],
    headers["wechatpay-timestamp"],
    headers["wechatpay-nonce"],
    body
  );
  ctx.status = 200;
  ctx.body = {
    success: true,
  };

  weChatPay
    .decrypting(
      body.resource.ciphertext, // 结果数据密文
      body.resource.nonce, // 加密使用的随机串
      body.resource.associated_data // 附加数据
    )
    .then((res) => {
      const data = JSON.parse(res.data);
      cb(data);
    })
    .catch((error) => {
      console.error("插入成功的订单失败");
    });
}

schedule.scheduleJob("0 0 5 * * *", function () {
  weChatPay.getWeChatPayCert();
});

module.exports = { weChatPay, getJsPayData, wxJsPayCallback };
