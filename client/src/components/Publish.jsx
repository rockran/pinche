import styles from "./index.less";

export default function Publish({ onPublish }) {
  return (
    <div className={styles.publish}>
      <div className="flex">
        <span>我是拼车乘客</span>
        <span className={styles.btn} onClick={() => onPublish(1)}>
          去发布
        </span>
      </div>
      <div className="flex">
        <span>我是顺风车主</span>
        <span className={styles.btn} onClick={() => onPublish(2)}>
          去发布
        </span>
      </div>
      <div className="flex">
        <span>我是滴滴司机</span>
        <span className={styles.btn} onClick={() => onPublish(3)}>
          去发布
        </span>
      </div>
    </div>
  );
}
