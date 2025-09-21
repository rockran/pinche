import styles from "./index.less";

export default function About() {
  return (
    <div className={`${styles.about} card`}>
      <h3>平台服务介绍</h3>
      <p>
        平台服务于打工族上班通勤，我们希望把通勤路线一致的人撮合为
        <span style={{ color: "#333", fontWeight: 700 }}>长期固定的1+4搭子</span>
        ，即1个司机4位乘客（仅上班无下班）。好处如下：
      </p>
      <p>
        <span>1. </span>乘客打车成本低至0.5～0.7元/公里 <br />
        例：10公里，乘客成本6元左右，堪比公交地铁。而司机可得4x6=24元，高于打车价
      </p>
      <p>
        <span>2.</span>
        车主多一笔收入，也无需每天都劳心劳力找乘客。乘客也能用最低价实现用车上班
      </p>
      <p style={{ color: "#333" }}>
        固定搭子对乘客/司机最大好处：省心。不会遇到一些奇葩的人。平台为你们规划固定的搭子，固定的出发时间、地点、路线等。一起交友、一起上班，一举三得
      </p>
    </div>
  );
}
