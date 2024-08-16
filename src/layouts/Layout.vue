<script setup lang="ts"></script>

<template>
  <div class="wrapper">
    <div class="image">
      <img src="../assets/images/logo.png" alt="logo">
    </div>
    <h1 class="title">
      Weather on VueJS
    </h1>
    <div class="buttons">
      <RouterLink v-slot="{ isActive }" :to="{ name: 'Home' }">
        <button class="first_button" :class="{ selected_button: isActive }">
          Home
        </button>
      </RouterLink>
      <RouterLink v-slot="{ isActive }" :to="{ name: 'Favorite' }">
        <button class="second_button" :class="{ selected_button: isActive }">
          Favorite
        </button>
      </RouterLink>
    </div>
    <div class="container">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  padding-top: 40px;
  max-width: 1200px;
  padding: 0 40px;
  margin: 0 auto;
  padding-bottom: 200px;
}

.container {
  padding: 20px;
  border: solid deepskyblue 2px;
  border-radius: 10px;
  border-top-left-radius: 0;
}

.image {
  display: flex;
  justify-content: center;
}

.image img {
  width: 240px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.buttons button {
  background: transparent;
  border: solid deepskyblue 2px;
  border-bottom: 0px;
  padding: 4px 12px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  color: navy;
}

.first_button {
  border-right: 0px !important;
  border-top-left-radius: 10px;
}
.second_button {
  border-top-right-radius: 10px;
}

.selected_button {
  font-weight: 700 !important;
  color: blue !important;
}
</style>
