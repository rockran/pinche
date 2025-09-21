import styles from "./index.less";

const TYPE_MAP = {
  1: "乘客",
  2: "顺风车主",
  3: "滴滴司机",
};

export default function Detail({ onUpdateFormPop, detailData }) {
  if (!detailData?.field_status === 1) return null;

  return (
    <div className={styles.detail}>
      <p>发布成功，请您耐心等待......</p>
      <div className="card">
        <div className="flex">
          <h3>详细信息</h3>
          <i className={styles.type}>类型：{TYPE_MAP[detailData.type] || "-"}</i>
        </div>

        <div className={`${styles.item} flex`}>
          <span className={styles.lable}>出发地址</span>
          <span>
            [{detailData.from_city}市]-{detailData.from_address}
          </span>
        </div>
        {detailData?.to_address && (
          <div className={`${styles.item} flex`}>
            <span className={styles.lable}>目的地址</span>
            <span>
              [{detailData.to_city}市]-{detailData.to_address}
            </span>
          </div>
        )}
        {detailData?.start_time && (
          <div className={`${styles.item} flex`}>
            <span className={styles.lable}>上班时间</span>
            <span>{detailData.start_time}</span>
          </div>
        )}
        <div className={`${styles.item} flex ${styles.last}`}>
          <span className={styles.lable}>联系方式</span>
          <span>{detailData.weixin}</span>
        </div>

        <div className={styles.updataBtn} onClick={onUpdateFormPop}>
          修改信息
        </div>
      </div>
    </div>
  );
}
