import { useCallback, useEffect, useState, useRef } from "react";

import Select from "./Select";
import styles from "./index.less";
import { updatePincheRecord, createPincheRecord, createOrder } from "../api/index";
import { showToast, showPayConfirm } from "../components/Confirm";

function formatEmpty(type, formData) {
  if (type === 3) {
    return !(formData.from_city && formData.from_address && formData.weixin);
  }
  return !(
    formData.from_city &&
    formData.from_address &&
    formData.to_city &&
    formData.to_address &&
    formData.start_time &&
    formData.weixin
  );
}

const amount = 1;
const address = ["北京", "上海", "广州", "深圳", "杭州", "南京", "成都", "重庆"];

async function wxJSB_Pay(params) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await createOrder(params);

      if (typeof WeixinJSBridge !== "undefined") {
        WeixinJSBridge?.invoke(
          "getBrandWCPayRequest",
          {
            appId: data.appid,
            timeStamp: data.timeStamp,
            nonceStr: data.nonceStr,
            package: data.package,
            signType: data.signType,
            paySign: data.paySign,
          },
          function (res) {
            if (res.err_msg == "get_brand_wcpay_request:ok") {
              resolve();
            } else {
              reject();
            }
          }
        );
      } else {
        showToast("请在微信客户端中打开");
        reject("请在微信客户端中打开");
      }
    } catch (error) {
      reject();
    }
  });
}

export default function Form({ type, state, detailData, onClose, updateDetailData }) {
  const [openpop, setOpenpop] = useState(0);

  const [formData, setFormData] = useState({
    from_city: "",
    from_address: "",
    to_city: "",
    to_address: "",
    start_time: "",
    weixin: "",
  });

  const look = useRef(false);

  const onChangeFormData = useCallback(
    (data) => {
      setFormData({
        ...formData,
        ...data,
      });
    },
    [formData]
  );

  useEffect(() => {
    if (type && detailData?.field_status === 1) {
      setFormData({
        from_city: detailData?.from_city || "",
        from_address: detailData?.from_address || "",
        to_city: detailData?.to_city || "",
        to_address: detailData?.to_address || "",
        start_time: detailData?.start_time || "",
        weixin: detailData?.weixin || "",
      });
    }
    setOpenpop(0);
    look.current = false;
  }, [type]);

  const onSubmit = async () => {
    if (formatEmpty(type, formData)) {
      showToast("请完整填写表单");
      return;
    }

    try {
      if (typeof detailData?.field_status == "undefined") {
        showPayConfirm({
          amount,
          onOk: async () => {
            await wxJSB_Pay({ amount, openid: detailData.open_id });
            const hide = showToast("正在发布中...", { noClose: true });
            await createPincheRecord({ ...formData, type, state });
            hide();
            showToast("发布成功");
            updateDetailData({ ...formData, type });
            onClose();
          },
        });
      } else {
        if (look.current) {
          return;
        }
        look.current = true;
        if (detailData?.field_status === 0) {
          await createPincheRecord({ ...formData, type, state }, true);
        } else if (detailData?.field_status === 1) {
          await updatePincheRecord({ ...formData });
          showToast("修改成功");
        }
        updateDetailData({ ...formData, type });
        onClose();
      }
    } catch (error) {
      look.current = false;
    }
  };

  return (
    <>
      {type && <div className="mask"></div>}
      <div className={styles.formWrap} style={{ bottom: `${type ? "0" : "-100%"}` }}>
        <div className={styles.form}>
          <span className={styles.close} onClick={onClose}></span>
          <div className="card">
            <h4>出发地址</h4>
            <div className={`${styles.address} ${openpop === 1 ? styles.open : ""}`}>
              <div onClick={() => setOpenpop((t) => (t == 1 ? 0 : 1))}>
                {formData.from_city || "选择出发地区"}
                <i></i>
              </div>

              <div>
                <Select
                  className={styles.selectAddress}
                  list={address}
                  current={formData.from_city}
                  setValue={(v) => {
                    onChangeFormData({ from_city: v });
                    setOpenpop(0);
                  }}
                ></Select>
              </div>
            </div>
            <input
              value={formData.from_address}
              maxLength={100}
              onChange={(e) => onChangeFormData({ from_address: e.target.value })}
              placeholder="输入详细地址，例：某区某街道某小区1幢"
            />
          </div>

          {type !== 3 && (
            <>
              <div className="card">
                <h4>目的地址</h4>
                <div className={`${styles.address} ${openpop === 2 ? styles.open : ""}`}>
                  <div onClick={() => setOpenpop((t) => (t == 2 ? 0 : 2))}>
                    {formData.to_city || "选择所在地区"}
                    <i></i>
                  </div>

                  <div>
                    <Select
                      className={styles.selectAddress}
                      list={address}
                      current={formData.to_city}
                      setValue={(v) => {
                        onChangeFormData({ to_city: v });
                        setOpenpop(0);
                      }}
                    ></Select>
                  </div>
                </div>
                <input
                  value={formData.to_address}
                  maxLength={100}
                  onChange={(e) => onChangeFormData({ to_address: e.target.value })}
                  placeholder="输入详细地址，例：某某公司或某某大厦等"
                />
              </div>

              <div className="card">
                <h4>
                  上班时间<span>(这里选择你到公司的时间即可)</span>
                </h4>
                <div className={styles.time}>
                  <Select
                    current={formData.start_time}
                    setValue={(v) => onChangeFormData({ start_time: v })}
                    list={["08:30", "09:00", "09:30", "10:00"]}
                  ></Select>
                </div>
              </div>
            </>
          )}

          <div className="card">
            <h4>
              联系方式<span>(时间路线规划成功后，会有工作人员联系你)</span>
            </h4>
            <input
              value={formData.weixin}
              maxLength={100}
              onChange={(e) => onChangeFormData({ weixin: e.target.value })}
              placeholder="请输入微信联系方式，手机号或微信号"
            />
          </div>
          <div className={styles.lastCard}></div>

          <div className={styles.submitBtn}>
            <div onClick={onSubmit}>{detailData?.field_status === 1 ? "修改" : "确定发布"}</div>
          </div>
        </div>
      </div>
    </>
  );
}
