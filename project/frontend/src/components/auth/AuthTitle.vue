<template>
  <div class="title-container">
    <h1>Авторизация</h1>
  </div>
</template>

<style scoped>
.title-container {
  position: fixed;
  left: 0;
  bottom: 2rem;
  background-color: #EADDC3;
  padding: 1.5rem 2rem;
  border-radius: 0 50px 50px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  max-width: 300px;
  z-index: 10;
}

.title-container h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #212121;
  font-weight: 500;
}

@media (max-width: 768px) {
  .title-container {
    position: static;
    margin-bottom: 1.5rem;
    max-width: 100%;
    text-align: center;
    border-radius: 8px;
  }
}
</style>