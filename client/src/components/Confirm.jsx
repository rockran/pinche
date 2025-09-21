import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import styles from "./index.less";

const animationTime = 200; // 动画时间，单位（ms）
const appearAnimation = [{ opacity: 0 }, { opacity: 1 }]; // 淡入动画效果
const disappearAnimation = [{ opacity: 1 }, { opacity: 0 }]; // 淡出动画效果

const renderToastInBody = function (Component, options = {}) {
  const nextToastDiv = document.createElement("div");
  nextToastDiv.id = "toast-box";
  const presentToastDiv = document.getElementById("toast-box");
  if (presentToastDiv && document.body.contains(presentToastDiv)) {
    document.body.replaceChild(nextToastDiv, presentToastDiv);
  } else {
    document.body.appendChild(nextToastDiv);
    nextToastDiv.animate(appearAnimation, animationTime);
  }

  const root = createRoot(nextToastDiv);

  const onClose = () => {
    nextToastDiv.animate(disappearAnimation, animationTime).onfinish = function () {
      root.unmount();
      if (document.body.contains(nextToastDiv)) document.body.removeChild(nextToastDiv);
    };
  };
  root.render(<Component onClose={onClose} {...options}></Component>);

  return onClose;
};

const PayConfirm = function ({ onClose, onOk, amount }) {
  return (
    <div className={`${styles.popMask} mask`}>
      <div className={styles.confirmPay}>
        <div>
          <h4>温馨提示</h4>
          <p>
            <span>为什么收费</span>
            ：为了阻碍不愿拼车随意发一条玩的人，我们是人工提供规划路线、时间，如果您不愿意拼车，请不要发布，浪费大家时间哦～亲
          </p>
          <p className={styles.tip}>(联系方式找到到很多"试试玩"的人)</p>
          <p>
            <span>注明：拼车成功后，此钱退还给您～</span>
          </p>
          <div
            className={styles.payBtn}
            onClick={() => {
              onOk();
              onClose();
            }}
          >
            支付并发布（{amount / 100}元）
          </div>
          <div className={styles.close} onClick={onClose}>
            取消发布
          </div>
        </div>
      </div>
    </div>
  );
};

const ShowToast = ({ onClose, text, duration }) => {
  useEffect(() => {
    if (duration !== 0) {
      setTimeout(() => {
        onClose();
      }, duration);
    }
  }, []);

  return (
    <div className={`${styles.popMask} mask`} style={{ background: "transparent" }}>
      <div className={styles.showToast}>{text}</div>
    </div>
  );
};

const Supplementary = ({ onClose }) => {
  return (
    <div className={`${styles.popMask} mask`}>
      <div className={styles.confirmPay}>
        <div style={{ textAlign: "center" }}>
          <h4>温馨提示</h4>
          <p>您有一笔已支付的订单</p>
          <p>请您发布一条拼车信息哦～</p>
          <div className={styles.payBtn} onClick={onClose}>
            知道了
          </div>
        </div>
      </div>
    </div>
  );
};

const showToast = (text, options = {}) => {
  return renderToastInBody(ShowToast, { text, duration: 1500, ...options });
};
const showPayConfirm = (options) => renderToastInBody(PayConfirm, options);

const showSupplementary = (options) => renderToastInBody(Supplementary, options);

export { showToast, showPayConfirm, showSupplementary };
