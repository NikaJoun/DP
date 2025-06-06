<template>
  <div class="center-column">
    <img src="@/assets/images/big-logo.png" alt="Big Logo" class="big-logo" />
    <p class="slogan">Твой путь к звёздам</p>
  </div>
</template>

<style scoped>
.center-column {
  text-align: center;
  flex: 1;
  min-width: 250px;
}

.big-logo {
  max-width: 300px;
  width: 100%;
  height: auto;
  margin: 0 auto;
}

.slogan {
  font-size: 1.5rem;
  font-weight: 500;
  color: #000;
  margin-top: 1rem;
}

@media (max-width: 992px) {
  .center-column {
    margin: 2rem 0;
  }
}
</style>