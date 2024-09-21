import { createApp } from "vue"; // 导入Vue的createApp函数
import ElementPlus from "element-plus"; // 导入ElementPlus组件库
import "element-plus/dist/index.css"; // 导入ElementPlus的样式文件
import App from "./App.vue"; // 导入主应用组件
import { gsap } from "gsap"; // 导入GSAP动画库
import Particles from "particlesjs"; // 导入粒子效果库

// 创建Vue应用实例
const app = createApp(App);
// 使用ElementPlus组件库
app.use(ElementPlus);
// 配置全局属性，将GSAP动画库挂载到Vue实例上
app.config.globalProperties.$gsap = gsap;
// 将应用挂载到id为app的DOM元素上
app.mount("#app");

// 初始化粒子效果
window.onload = function () {
  Particles.init({
    selector: ".background", // 选择器，指定应用粒子效果的元素
    maxParticles: 30, // 增加粒子数量，增加动态感
    sizeVariations: 0.7, // 增加粒子大小变化，增加俏皮感
    speed: 0.3, // 稍微增加粒子移动速度，增加动态感
    color: "#3D3929", // 粒子颜色保持不变
    connectParticles: true, // 是否连接粒子
    minDistance: 250, // 减少粒子之间的最小距离，增加连接感
    lineLinked: {
      // 新增连线设置
      distance: 160, // 增加连线最大距离，增加连接感
      width: 15, // 减少连线宽度，增加俏皮感
    }
  });
};
