<template>
  <div class="starfield" ref="starfield">
    <div
      class="orbit"
      v-for="(orbit, i) in orbits"
      :key="'orbit-' + i"
      :style="{ 
        width: orbit.radius * 2 + 'px', 
        height: orbit.radius * 2 + 'px',
        borderColor: `rgba(255, 255, 255, ${orbit.opacity})`
      }"
    >
      <div
        class="orbit-star"
        v-for="(star, j) in orbit.stars"
        :key="'star-' + i + '-' + j"
        :style="getStarStyle(orbit, j)"
      ></div>
    </div>
  </div>

  <div class="background-clouds">
    <!-- Облака в правом верхнем углу -->
    <div
      v-for="(cloud, i) in topClouds"
      :key="'top-' + i"
      class="cloud top-cloud"
      :style="cloudStyle(cloud)"
    ></div>

    <!-- Облака в левом нижнем углу -->
    <div
      v-for="(cloud, i) in bottomClouds"
      :key="'bottom-' + i"
      class="cloud bottom-cloud"
      :style="cloudStyle(cloud)"
    ></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      orbits: [
        { radius: 50, stars: 6, speed: 25, opacity: 0.05, starSize: 2 },
        { radius: 90, stars: 8, speed: 30, opacity: 0.07, starSize: 2 },
        { radius: 140, stars: 10, speed: 35, opacity: 0.1, starSize: 3 },
        { radius: 200, stars: 12, speed: 40, opacity: 0.08, starSize: 3 },
        { radius: 270, stars: 14, speed: 45, opacity: 0.06, starSize: 4 },
        { radius: 350, stars: 16, speed: 50, opacity: 0.04, starSize: 3 },
        { radius: 440, stars: 18, speed: 55, opacity: 0.03, starSize: 2 },
        { radius: 540, stars: 20, speed: 60, opacity: 0.02, starSize: 2 }
      ],
      topClouds: this.generateCornerClouds('top'),
      bottomClouds: this.generateCornerClouds('bottom')
    }
  },
  methods: {
    generateCornerClouds(position) {
      const clouds = []
      const fixedSize = 250

      if (position === 'top') {
        clouds.push(
          { size: fixedSize, opacity: 0.6, animationDelay: `0s`, top: '-20px', right: '150px' },
          { size: fixedSize, opacity: 0.7, animationDelay: `0.3s`, top: '-15px', right: '-20px' },
          { size: fixedSize, opacity: 0.6, animationDelay: `0.6s`, top: '40px', right: '200px' },
          { size: fixedSize, opacity: 0.7, animationDelay: `1s`, top: '100px', right: '100px' },
          { size: fixedSize, opacity: 0.6, animationDelay: `1.3s`, top: '120px', right: '-20px' },
          { size: fixedSize, opacity: 0.7, animationDelay: `1.6s`, top: '160px', right: '60px' }
        )
      } else if (position === 'bottom') {
        clouds.push(
          { size: fixedSize, opacity: 0.6, animationDelay: `0s`, bottom: '-40px', left: '-20px' },
          { size: fixedSize, opacity: 0.7, animationDelay: `0.3s`, bottom: '-40px', left: '50px' },
          { size: fixedSize, opacity: 0.6, animationDelay: `0.6s`, bottom: '-40px', left: '200px' },
          { size: fixedSize, opacity: 0.7, animationDelay: `1s`, bottom: '60px', left: '-40px' },
          { size: fixedSize, opacity: 0.6, animationDelay: `1.3s`, bottom: '100px', left: '100px' },
          { size: fixedSize, opacity: 0.7, animationDelay: `1.6s`, bottom: '130px', left: '-80px' }
        )
      }

      return clouds
    },

    cloudStyle(cloud) {
      return {
        position: 'absolute',
        width: `${cloud.size}px`,
        height: `${cloud.size * 0.6}px`,
        opacity: cloud.opacity,
        animationDelay: cloud.animationDelay,
        ...cloud
      }
    },
    
    getStarStyle(orbit, starIndex) {
      const angle = (starIndex / orbit.stars) * Math.PI * 2;
      const twinkleDuration = 2 + Math.random() * 3;
      
      return {
        '--radius': `${orbit.radius}px`,
        '--angle': `${angle}rad`,
        '--size': `${orbit.starSize}px`,
        '--twinkle-duration': `${twinkleDuration}s`,
        '--animation-name': `orbit-${orbit.radius}-rotation`,
        animationDuration: `${orbit.speed}s`,
        animationDelay: `${starIndex * 0.15}s`,
        opacity: `${0.3 + Math.random() * 0.7}`,
        width: `${orbit.starSize}px`,
        height: `${orbit.starSize}px`
      }
    }
  },
  mounted() {
    this.orbits.forEach(orbit => {
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes orbit-${orbit.radius}-rotation {
          0% {
            transform: 
              translate(-50%, -50%)
              rotate(var(--angle))
              translateX(var(--radius))
              rotate(var(--angle));
          }
          100% {
            transform: 
              translate(-50%, -50%)
              rotate(calc(var(--angle) + 2 * 3.1415926535rad))
              translateX(var(--radius))
              rotate(calc(var(--angle) + 2 * 3.1415926535rad));
          }
        }
      `;
      document.head.appendChild(style);
    });
  }
}
</script>

<style scoped>
.starfield {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.background-clouds {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  overflow: visible;
}

.cloud {
  background: linear-gradient(160deg, #ffffff 30%, rgba(255, 255, 255, 0.3) 100%);
  border-radius: 150px;
  filter: drop-shadow(0 4px 15px rgba(0, 0, 0, 0.1));
  animation: float 22s ease-in-out infinite;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.cloud::before {
  width: 70%;
  height: 80%;
  top: -40%;
  left: 15%;
}

.cloud::after {
  width: 50%;
  height: 60%;
  top: -30%;
  right: 10%;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(10px, -10px) scale(1.01);
  }
  50% {
    transform: translate(-10px, 8px) scale(0.99);
  }
  75% {
    transform: translate(6px, 6px) scale(1.02);
  }
}

.orbit {
  position: absolute;
  border-radius: 50%;
  border-style: solid;
  border-width: 1px;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.orbit-star {
  position: absolute;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.7);
  animation: 
    var(--animation-name) linear infinite,
    twinkle ease-in-out var(--twinkle-duration) infinite alternate;
  transform-origin: center;
  will-change: transform, opacity;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.4;
    box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.5);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 8px 3px rgba(255, 255, 255, 0.9);
  }
}
</style>