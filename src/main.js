import { createApp } from "vue"; // 导入Vue的createApp函数
import ElementPlus from "element-plus"; // 导入ElementPlus组件库
import "element-plus/dist/index.css"; // 导入ElementPlus的样式文件
import App from "./App.vue"; // 导入主应用组件
import { gsap } from "gsap"; // 导入GSAP动画库

// 创建Vue应用实例
const app = createApp(App);
// 使用ElementPlus组件库
app.use(ElementPlus);
// 配置全局属性，将GSAP动画库挂载到Vue实例上
app.config.globalProperties.$gsap = gsap;
// 将应用挂载到id为app的DOM元素上
app.mount("#app");

initParticles(); // 调用粒子效果初始化函数
import { initParticles } from "./particles"; // 导入粒子效果初始化函数


