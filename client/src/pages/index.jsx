import About from "../components/About";
import Publish from "../components/Publish";
import Form from "../components/Form";
import Detail from "../components/Detail";
import { useEffect, useState } from "react";
import { getPincheRecords } from "../api/index";
import { showSupplementary } from "../components/Confirm";

function getQueryParam(name) {
  const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  const r = location.search.substr(1).match(reg);
  console.log(name, location.search.substr(1).match(reg));
  if (r != null && r[2] !== "null") return decodeURIComponent(r[2]);
  return "";
}

export default function HomePage() {
  const state = getQueryParam("state");
  const code = getQueryParam("code");
  const [type, setType] = useState();

  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("_pinche_token") || code) {
      getPincheRecords({ code }).then((res) => {
        setDetailData(res);
        if (res.field_status === 0) {
          showSupplementary();
        }
        res.token && localStorage.setItem("_pinche_token", res.token);
      });
    }
  }, []);

  console.log("detailData", detailData);

  const updateDetailData = (data) => {
    setDetailData({
      ...detailData,
      ...data,
      field_status: 1,
    });
  };

  const onPublish = (type) => {
    if (detailData?.token) {
      setType(type);
    } else {
      const { origin, pathname } = location;
      const redirect_uri = encodeURIComponent(`${origin}${pathname}`);
      location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx35ffdcbae9cd1c0c&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`;
    }
  };
  const flag =
    !detailData ||
    (detailData && typeof detailData.field_status === "undefined") ||
    (detailData && detailData.field_status === 0);

  return (
    <>
      {detailData?.field_status === 1 && (
        <Detail detailData={detailData} onUpdateFormPop={() => setType(detailData.type)}></Detail>
      )}
      <About />
      {flag && <Publish onPublish={onPublish}></Publish>}
      <Form
        state={state}
        type={type}
        onClose={() => setType()}
        detailData={detailData}
        updateDetailData={updateDetailData}
      ></Form>
    </>
  );
}
