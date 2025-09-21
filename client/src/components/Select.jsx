import styles from "./index.less";

export default function Select({ list, current, setValue }) {
  const onSelectValue = (e) => {
    const val = e.target.dataset.val;
    if (!val) return;
    setValue(val);
  };
  return (
    <div className={styles.selectWrap} onClick={onSelectValue}>
      {list.map((v) => {
        return (
          <span data-val={v} key={v} className={current === v ? styles.active : ""}>
            {v}
          </span>
        );
      })}
    </div>
  );
}
