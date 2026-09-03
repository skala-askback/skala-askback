<template>
  <div class="page">
    <h2 class="page-title">내 프로필</h2>
    <div class="card">
      <div class="profile-hero">
        <div class="big-avatar">{{ user.name.slice(-2) }}</div>
        <div class="profile-name">{{ user.name }}</div>
        <div class="profile-line">{{ user.campus }} {{ user.cohort }} {{ user.classNo }}반</div>
      </div>
      <div class="info-list">
        <div class="info-row"><span class="info-k">캠퍼스</span><span class="info-v">{{ user.campus }}</span></div>
        <div class="info-row"><span class="info-k">기수</span><span class="info-v">{{ user.cohort }}</span></div>
        <div class="info-row"><span class="info-k">반</span><span class="info-v">{{ user.classNo }}반</span></div>
        <div class="info-row"><span class="info-k">고유번호</span><span class="info-v">{{ user.studentId }}</span></div>
        <div class="info-row"><span class="info-k">이메일</span><span class="info-v">{{ user.email }}</span></div>
      </div>
      <div class="section-title">💻 자산(노트북) 정보</div>
      <div class="form-row"><span class="info-k">자산번호</span><input class="input" v-model="asset" placeholder="자산번호" /></div>
      <label class="check-row"><input type="checkbox" v-model="returned" /> 자산 반납 완료</label>
      <div class="form-row"><span class="info-k">비고</span><input class="input" v-model="note" placeholder="특이사항 (선택)" /></div>
      <button class="primary-btn full">자산 정보 저장</button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { user as base } from '../data/user'
import { session } from '../data/store'
const user = { ...base, ...(session.user || {}) }
const asset = ref(''); const returned = ref(false); const note = ref('')
</script>
<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 14px; }
.profile-hero { display: flex; flex-direction: column; align-items: center; gap: 8px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
.big-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #6b35ff, #a78bfa); color: #fff; font-size: 22px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.profile-name { font-size: 20px; font-weight: 800; color: #0f172a; }
.profile-line { font-size: 13px; font-weight: 700; color: #6b35ff; }
.info-list { display: flex; flex-direction: column; gap: 10px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
.info-row, .form-row { display: grid; grid-template-columns: 72px 1fr; align-items: center; gap: 8px; }
.info-k { font-size: 13px; color: #94a3b8; }
.info-v { font-size: 14px; font-weight: 600; color: #0f172a; }
.section-title { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 4px; }
.input { padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; background: #f8fafc; }
.check-row { font-size: 13px; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.primary-btn { padding: 11px 16px; background: #6b35ff; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; }
.primary-btn.full { width: 100%; }
</style>
