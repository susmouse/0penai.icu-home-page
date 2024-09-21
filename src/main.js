import { createApp } from "vue"; // 导入Vue的createApp函数
import ElementPlus from "element-plus"; // 导入ElementPlus组件库
import "element-plus/dist/index.css"; // 导入ElementPlus的样式文件
import App from "./App.vue"; // 导入主应用组件
import { gsap } from "gsap"; // 导入GSAP动画库
import { initParticles } from "./particles"; // 导入粒子效果初始化函数

initParticles(); // 调用粒子效果初始化函数
const app = createApp(App); // 创建Vue应用实例
app.use(ElementPlus); // 使用ElementPlus组件库
app.config.globalProperties.$gsap = gsap; // 将GSAP动画库挂载到Vue实例上
app.mount("#app"); // 将应用挂载到id为app的DOM元素上
