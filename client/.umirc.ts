import { defineConfig } from "umi";
// @ts-ignore
import px2vw from "postcss-px-to-viewport";

export default defineConfig({
  npmClient: "npm",
  hash: true,
  publicPath: "/pinche/",
  base: "/pinche/",
  outputPath: "pinche",

  // 配置额外的 postcss 插件(px 转 vw|vh)
  extraPostCSSPlugins: [
    px2vw({
      unitToConvert: "px", // 要转换的单位
      viewportWidth: 750, // 设计稿的视口宽度
      unitPrecision: 6, // 转换后保留的小数位数
      propList: ["*"], // 可以转换的属性，'*'表示全部
      viewportUnit: "vw", // 希望使用的视口单位
      fontViewportUnit: "vw", // 字体使用的视口单位
      selectorBlackList: [], // 不转换为视口单位的选择器
      minPixelValue: 1, // 小于或等于1px不转换
      mediaQuery: false, // 是否允许在媒体查询中转换
      replace: true, // 是否直接替换已转换的单位
      exclude: /(node_module)/, // 忽略转换的文件
    }),
  ],
});
