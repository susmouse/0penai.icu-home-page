import Particles from "particlesjs"; // 导入粒子效果库

export function initParticles() {
  window.onload = function () {
    Particles.init({
      selector: ".background", // 选择器，指定应用粒子效果的元素
      maxParticles: 30, // 增加粒子数量，增加动态感
      sizeVariations: 0.7, // 增加粒子大小变化，增加俏皮感
      speed: 0.3, // 稍微增加粒子移动速度，增加动态感
      color: "#F0EFEA", // 粒子颜色保持不变
      connectParticles: true, // 是否连接粒子
      minDistance: 250, // 减少粒子之间的最小距离，增加连接感
      lineLinked: {
        // 新增连线设置
        distance: 160, // 增加连线最大距离，增加连接感
        width: 15, // 减少连线宽度，增加俏皮感
      }
    });
  };
}
