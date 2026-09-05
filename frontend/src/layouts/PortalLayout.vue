<template>
  <div class="portal-root">
    <header class="mobile-header">
      <span class="header-logo">SKALA</span>
      <div class="header-right">
        <span class="header-name">{{ user.name }}</span>
        <button class="logout-btn" @click="logout">로그아웃</button>
      </div>
    </header>

    <div class="portal-body">
      <aside class="portal-sidebar">
        <div class="sidebar-brand">
          <span class="brand-logo">SKALA</span>
          <span class="brand-sub">{{ isProf ? '교수 포털' : '훈련생 포털' }}</span>
        </div>
        <div class="sidebar-user">
          <div class="user-avatar">{{ user.name.slice(0, 1) }}</div>
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-role">{{ isProf ? '교수' : '훈련생' }}</span>
          </div>
        </div>
        <nav class="sidebar-nav">
          <template v-if="isProf">
            <router-link to="/dashboard" class="nav-item" active-class="active">강의 대시보드</router-link>
            <router-link to="/questions" class="nav-item" active-class="active">질문 관리 <span v-if="pendingCount" class="nav-count">{{ pendingCount }}</span></router-link>
          </template>
          <router-link v-else to="/home" class="nav-item" active-class="active">마이스페이스 (HOME)</router-link>
          <router-link to="/more/profile" class="nav-item" active-class="active">나의 프로필</router-link>
          <template v-if="!isProf">
            <router-link to="/attendance" class="nav-item" active-class="active">출결</router-link>
            <router-link to="/certificate-request" class="nav-item" active-class="active">참여확인서/출결확인서</router-link>
          </template>
          <div class="nav-group-label">교육과정</div>
          <router-link to="/schedule" class="nav-item sub" active-class="active">교육일정</router-link>
          <template v-if="!isProf">
            <router-link to="/questions/new" class="nav-item sub" active-class="active">질문하기</router-link>
            <router-link to="/questions" class="nav-item sub" active-class="active">나의 질문</router-link>
            <div class="nav-group-label">학습 분석</div>
            <router-link to="/weakness" class="nav-item sub" active-class="active">내 약점</router-link>
            <router-link to="/quiz" class="nav-item sub" active-class="active">약점 퀴즈</router-link>
          </template>
        </nav>
        <div class="sidebar-footer">
          <button class="logout-btn-sidebar" @click="logout">로그아웃</button>
        </div>
      </aside>

      <main class="portal-content">
        <router-view />
      </main>
    </div>

    <nav class="bottom-nav">
      <router-link :to="isProf ? '/dashboard' : '/home'" class="nav-item" active-class="active"><span class="nav-icon">⌂</span><span class="nav-label">홈</span></router-link>
      <router-link v-if="!isProf" to="/attendance" class="nav-item" active-class="active"><span class="nav-icon">✓</span><span class="nav-label">출결</span></router-link>
      <router-link to="/schedule" class="nav-item" active-class="active"><span class="nav-icon">▦</span><span class="nav-label">시간표</span></router-link>
      <router-link v-if="!isProf" to="/questions" class="nav-item" active-class="active"><span class="nav-icon">?</span><span class="nav-label">질문</span></router-link>
      <router-link to="/more" class="nav-item" active-class="active"><span class="nav-icon">⋯</span><span class="nav-label">더보기</span></router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { session, auth, questions, store } from '../data/store'
const router = useRouter()
const user = computed(() => session.user || { name: '' })
const isProf = computed(() => session.user?.role === 'professor')
const pendingCount = computed(() => { store.version; return questions.all().filter(q => q.status === 'REVIEW').length })
function logout() { auth.logout(); router.push('/login') }
</script>

<style scoped>
.portal-root { min-height: 100vh; display: flex; flex-direction: column; background: #f1f5f9; }
.mobile-header { display: flex; align-items: center; justify-content: space-between; height: 52px; padding: 0 16px; background: #0f172a; }
.header-logo { font-size: 16px; font-weight: 900; color: #a78bfa; letter-spacing: 1.5px; }
.header-right { display: flex; align-items: center; gap: 10px; }
.header-name { font-size: 12px; font-weight: 600; color: #e2e8f0; }
.logout-btn { background: none; border: 1px solid #334155; color: #94a3b8; padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer; }
.portal-body { flex: 1 1 0%; display: flex; overflow: hidden; }
.portal-sidebar { display: none; width: 220px; flex-shrink: 0; background: #fff; border-right: 1px solid #e2e8f0; flex-direction: column; height: 100vh; position: sticky; top: 0; overflow-y: auto; }
.sidebar-brand { padding: 20px 20px 16px; border-bottom: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 2px; }
.brand-logo { font-size: 18px; font-weight: 900; color: #6b35ff; letter-spacing: 1.5px; }
.brand-sub { font-size: 10px; font-weight: 600; color: #94a3b8; }
.sidebar-user { display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-bottom: 1px solid #f1f5f9; }
.user-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #6b35ff, #a78bfa); color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-name { font-size: 13px; font-weight: 700; color: #0f172a; display: block; }
.user-role { font-size: 11px; color: #94a3b8; }
.sidebar-nav { flex: 1 1 0%; padding: 12px 8px; display: flex; flex-direction: column; gap: 1px; overflow-y: auto; }
.sidebar-nav .nav-item { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569; text-decoration: none; transition: .15s; cursor: pointer; }
.sidebar-nav .nav-item:hover { background: #f8fafc; color: #0f172a; }
.sidebar-nav .nav-item.active { background: #fef9c3; color: #92400e; font-weight: 700; }
.sidebar-nav .nav-item.sub { padding-left: 20px; font-size: 12.5px; font-weight: 500; }
.sidebar-nav .nav-item.sub.active { background: #fef9c3; color: #92400e; font-weight: 700; }
.nav-group-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .8px; padding: 12px 12px 4px; }
.sidebar-footer { padding: 12px 16px; border-top: 1px solid #f1f5f9; }
.logout-btn-sidebar { width: 100%; padding: 8px; border: 1px solid #e2e8f0; background: none; border-radius: 8px; color: #64748b; font-size: 12px; font-weight: 600; cursor: pointer; transition: .15s; }
.logout-btn-sidebar:hover { border-color: #6b35ff; color: #6b35ff; }
.portal-content { flex: 1 1 0%; overflow-y: auto; min-width: 0; padding: 20px 16px 90px; }
.bottom-nav { position: fixed; left: 0; right: 0; bottom: 0; height: 60px; background: #fff; border-top: 1px solid #e2e8f0; display: grid; grid-template-columns: repeat(5, 1fr); z-index: 50; }
.nav-count { margin-left: auto; font-size: 10px; font-weight: 800; background: #6b35ff; color: #fff; padding: 1px 7px; border-radius: 10px; }
.bottom-nav .nav-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; text-decoration: none; color: #94a3b8; padding: 8px 0; }
.bottom-nav .nav-item.active { color: #6b35ff; }
.bottom-nav .nav-icon { font-size: 20px; line-height: 22px; }
.nav-label { font-size: 10px; font-weight: 700; white-space: nowrap; }
@media (min-width: 1024px) {
  .mobile-header { display: none; }
  .bottom-nav { display: none; }
  .portal-sidebar { display: flex; }
  .portal-content { padding: 24px 28px; }
}
@media (min-width: 768px) and (max-width: 1023px) { .portal-content { padding: 20px 20px 80px; } }
</style>
