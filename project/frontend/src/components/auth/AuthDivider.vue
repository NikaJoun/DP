<template>
  <div class="divider-container">
    <div class="divider-line"></div>
    <span class="divider-text">Или</span>
    <div class="divider-line"></div>
  </div>
</template>

<script>
export default {
  name: 'AuthDivider'
}
</script>

<style scoped>
.divider-container {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #e0e0e0;
}

.divider-text {
  padding: 0 12px;
  color: #757575;
  font-size: 0.9rem;
}
</style>