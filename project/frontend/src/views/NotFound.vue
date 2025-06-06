<template>
  <div class="not-found">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Заблудились в облаках</h2>
      <p class="error-message">Страница, которую вы ищете, уплыла в небеса</p>
      
      <router-link to="/" class="home-link">
        <span>Вернуться на землю</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </router-link>
    </div>
    
    <div class="cloud-illustration">
      <img src="@/assets/images/logo.png" alt="Lost Cloud">
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: calc(100vh - 40px);
  padding: 0 60px;
  position: relative;
}

.error-content {
  flex: 1;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.error-code {
  font-size: 6rem;
  font-weight: 800;
  color: #4C5F81;
  margin-bottom: 0.5rem;
  font-family: 'Hatigek Batagor', sans-serif;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #333;
}

.error-message {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  color: #555;
}

.home-link {
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #4C5F81 0%, #6B7B9B 100%);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 95, 129, 0.3);
}

.home-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(76, 95, 129, 0.4);
}

.home-link svg {
  margin-left: 0.8rem;
  transition: transform 0.3s ease;
}

.home-link:hover svg {
  transform: translateX(5px);
}

.cloud-illustration {
  flex: 1;
  display: flex;
  justify-content: center;
}

.cloud-illustration img {
  max-width: 400px;
  width: 100%;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
}

@media (max-width: 992px) {
  .not-found {
    flex-direction: column;
    padding: 2rem;
    text-align: center;
  }
  
  .error-content {
    margin-bottom: 3rem;
    padding: 2rem;
  }
  
  .cloud-illustration img {
    max-width: 300px;
  }
  
  .error-code {
    font-size: 4rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
}
</style>