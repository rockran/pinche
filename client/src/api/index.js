import { showToast } from "../components/Confirm";

// 根据 umi 的环境变量区分开发和生产环境
const prefix = process.env.NODE_ENV === "development" ? "http://192.168.0.102:3001" : "";

const _fetch = (url, params) =>
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("_pinche_token") || ""}`,
    },
    body: JSON.stringify(params),
  });

const getPincheRecords = (params) => {
  return _fetch(`${prefix}/api/getPincheRecords`, params).then(async (res) => {
    const { code, data } = await res.json();
    if (code === 200) {
      return data;
    } else {
      showToast("服务器异常～请重试");
      return Promise.reject();
    }
  });
};

const updatePincheRecord = (params) => {
  return _fetch(`${prefix}/api/updatePincheRecord`, params).then(async (res) => {
    const { code, data } = await res.json();
    if (code === 200) {
      return data;
    } else {
      showToast("服务器异常～请重试");
      return Promise.reject();
    }
  });
};

const createPincheRecord = (params, flag) => {
  return _fetch(`${prefix}/api/createPincheRecord`, params).then(async (res) => {
    const { code, data } = await res.json();
    if (code === 200) {
      if (data === 0 && !flag) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return createPincheRecord(params);
      }
      return data;
    } else {
      showToast("服务器异常～请重试");
      return Promise.reject();
    }
  });
};

const createOrder = (params) => {
  return _fetch(`${prefix}/api/jsapiPay`, params).then(async (res) => {
    const { code, data } = await res.json();
    if (code === 200) {
      return data;
    } else {
      showToast("服务器异常～请重试");
      return Promise.reject();
    }
  });
};

export { getPincheRecords, createOrder, updatePincheRecord, createPincheRecord };
