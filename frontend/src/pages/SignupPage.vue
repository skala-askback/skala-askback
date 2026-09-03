<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-logo">
        <span class="logo-text">SKALA</span>
        <span class="logo-badge">회원가입</span>
      </div>
      <div class="login-hero">
        <h1 class="login-title">계정 만들기</h1>
        <p class="login-desc">아이디와 비밀번호만 입력하면 됩니다.</p>
      </div>
      <form class="login-form" @submit.prevent="submit">
        <div class="role-toggle">
          <button type="button" class="role-btn" :class="{ active: role === 'student' }" @click="role = 'student'">학생</button>
          <button type="button" class="role-btn" :class="{ active: role === 'professor' }" @click="role = 'professor'">교수</button>
        </div>
        <input v-model.trim="name" class="input" placeholder="이름" />
        <input v-model.trim="id" class="input" placeholder="아이디" autocomplete="username" />
        <input v-model="password" type="password" class="input" placeholder="비밀번호" autocomplete="new-password" />
        <input v-model="password2" type="password" class="input" :class="{ bad: password2 && password2 !== password }" placeholder="비밀번호 확인" autocomplete="new-password" />
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="login-btn">가입하기</button>
      </form>
      <p class="login-notice">이미 계정이 있으신가요? <router-link to="/login" class="link">로그인</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, homePath } from '../data/store'
const router = useRouter()
const role = ref('student'); const name = ref(''); const id = ref(''); const password = ref(''); const password2 = ref(''); const error = ref('')
function submit() {
  error.value = ''
  if (!name.value || !id.value || !password.value) { error.value = '모든 항목을 입력해주세요.'; return }
  if (password.value !== password2.value) { error.value = '비밀번호가 일치하지 않습니다.'; return }
  const r = auth.signup({ id: id.value, password: password.value, name: name.value, role: role.value })
  if (!r.ok) { error.value = r.msg; return }
  auth.login(id.value, password.value, role.value)
  router.push(homePath())
}
</script>

<style src="../styles/auth.css"></style>
