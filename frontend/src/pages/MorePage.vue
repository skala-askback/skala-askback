<template>
  <div class="page">
    <h2 class="page-title">더보기</h2>
    <div class="menu">
      <router-link to="/more/profile" class="menu-item">나의 프로필<span>›</span></router-link>
      <router-link to="/certificate-request" class="menu-item">참여확인서/출결확인서<span>›</span></router-link>
      <button class="menu-item">로그아웃<span>›</span></button>
    </div>
  </div>
</template>
<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.menu { background: #fff; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden; }
.menu-item { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 16px; border: none; border-bottom: 1px solid #f1f5f9; background: #fff; font-size: 14px; font-weight: 600; color: #0f172a; text-align: left; cursor: pointer; font-family: inherit; }
.menu-item span { color: #94a3b8; }
</style>
