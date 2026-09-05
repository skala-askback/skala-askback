<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-logo">
        <span class="logo-text">SKALA</span>
        <span class="logo-badge">{{ role === 'professor' ? '교수 포털' : '훈련생 포털' }}</span>
      </div>
      <div class="role-toggle">
        <button class="role-btn" :class="{ active: role === 'student' }" @click="role = 'student'">학생 로그인</button>
        <button class="role-btn" :class="{ active: role === 'professor' }" @click="role = 'professor'">교수 로그인</button>
      </div>
      <div class="login-hero">
        <h1 class="login-title">{{ role === 'professor' ? '교수 전용 포털' : '훈련생 전용 포털' }}</h1>
        <p class="login-desc">아이디로 로그인 후<br><b>{{ role === 'professor' ? '질문을 검토하고 답변' : '본인의 교육 현황을 확인' }}</b>하세요.</p>
      </div>
      <form class="login-form" @submit.prevent="submit">
        <input v-model.trim="id" class="input" placeholder="아이디" autocomplete="username" />
        <input v-model="password" type="password" class="input" placeholder="비밀번호" autocomplete="current-password" />
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="login-btn">로그인</button>
      </form>
      <p class="login-notice">계정이 없으신가요? <router-link to="/signup" class="link">회원가입</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, homePath } from '../data/store'
const router = useRouter()
const role = ref('student'); const id = ref(''); const password = ref(''); const error = ref('')
function submit() {
  const r = auth.login(id.value, password.value, role.value)
  if (!r.ok) { error.value = r.msg; return }
  router.push(homePath())
}
</script>

<style src="../styles/auth.css"></style>
