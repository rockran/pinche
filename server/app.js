const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");

const { auth, cryptoUtils } = require("./tools/auth");
const { wxJsPayCallback, getJsPayData } = require("./tools/pay");
const { updatePincheRecord, createPincheRecord, getPincheRecords } = require("./tools/database");

const app = new Koa();

const router = new Router();

app.use(bodyParser());

// app.use(require("koa-cors")());

app.use(auth());

// 获取拼车信息
router.post("/api/getPincheRecords", async (ctx) => {
  try {
    const { open_id } = ctx.state.user;

    const [data] = await getPincheRecords({
      open_id: open_id,
      status: 0,
      latest: true,
    });

    ctx.body = {
      code: 200,
      data: {
        token: cryptoUtils.encrypt(JSON.stringify({ open_id })),
        field_status: data?.field_status,
        type: data?.type,
        from_city: data?.type,
        to_city: data?.to_city,
        from_address: data?.from_address,
        to_address: data?.to_address,
        start_time: data?.start_time,
        weixin: data?.weixin,
      },
    };
  } catch (error) {
    console.error("getPincheInfo 获取失败", error);
    ctx.status = 500;
    ctx.body = { error: "!" };
  }
});

// 发布+修改 拼车信息
router.post("/api/createPincheRecord", async (ctx) => {
  try {
    const { open_id } = ctx.state.user;
    const {
      type,
      from_city,
      to_city = "",
      from_address,
      to_address = "",
      start_time = "",
      weixin,
      state = "",
    } = ctx.request.body;

    if (!(open_id && type && from_city && weixin)) {
      throw "参数错误";
    }

    const whereParams = { open_id, field_status: 0 };
    const updates = {
      type,
      from_city,
      to_city,
      from_address,
      to_address,
      start_time,
      weixin,
      parent_open_id: state,
      field_status: 1,
    };
    const result = await updatePincheRecord(whereParams, updates);
    ctx.body = {
      code: 200,
      data: result,
    };
  } catch (error) {
    console.error("创建失败:", error);
    ctx.status = 500;
    ctx.body = { error: "!" };
  }
});
router.post("/api/updatePincheRecord", async (ctx) => {
  try {
    const { open_id } = ctx.state.user;
    const { from_city, to_city, from_address, to_address, start_time, weixin } = ctx.request.body;

    if (!(open_id && from_city && from_address && weixin)) {
      throw "参数错误";
    }

    const whereParams = { open_id, field_status: 1 };
    const updates = {
      from_city,
      to_city,
      from_address,
      to_address,
      start_time,
      weixin,
    };

    const result = await updatePincheRecord(whereParams, updates);
    if (result === 1) {
      ctx.body = {
        code: 200,
        data: result,
      };
    } else {
      throw "未找到匹配项";
    }
  } catch (error) {
    console.error("修改失败:", error);
    ctx.status = 500;
    ctx.body = { error: "!" };
  }
});

// 下单支付
router.post("/api/jsapiPay", async (ctx) => {
  const { open_id } = ctx.state.user;
  const { amount } = ctx.request.body;

  if (!open_id || !Number(amount)) {
    throw "参数错误～";
  }

  try {
    const data = await getJsPayData({ openid: open_id, amount });

    ctx.body = {
      code: 200,
      data,
    };
  } catch (error) {
    console.error("支付下单失败:", error);
    ctx.status = 500;
    ctx.body = { error: "!" };
  }
});

router.post("/api/jfsjpinpay_cb", async (ctx) => {
  wxJsPayCallback(ctx, async (data) => {
    const open_id = data.payer.openid;
    const order_number = data.out_trade_no;

    createPincheRecord({ open_id, order_number, field_status: 0 });
  });
});

// 使用路由
app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {});
