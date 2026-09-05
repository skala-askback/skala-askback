import { createRouter, createWebHistory } from 'vue-router'
import PortalLayout from './layouts/PortalLayout.vue'
import { session, homePath } from './data/store'

const routes = [
  { path: '/login', component: () => import('./pages/LoginPage.vue'), meta: { public: true } },
  { path: '/signup', component: () => import('./pages/SignupPage.vue'), meta: { public: true } },
  { path: '/', redirect: () => homePath() },
  {
    path: '/', component: PortalLayout,
    children: [
      { path: 'home', component: () => import('./pages/HomePage.vue') },
      { path: 'more/profile', component: () => import('./pages/ProfilePage.vue') },
      { path: 'attendance', component: () => import('./pages/AttendancePage.vue') },
      { path: 'certificate-request', component: () => import('./pages/CertificatePage.vue') },
      { path: 'schedule', component: () => import('./pages/SchedulePage.vue') },
      { path: 'questions', component: () => import('./pages/QuestionListPage.vue') },
      { path: 'questions/new', component: () => import('./pages/QuestionNewPage.vue'), meta: { role: 'student' } },
      { path: 'questions/:id', component: () => import('./pages/QuestionDetailPage.vue') },
      { path: 'weakness', component: () => import('./pages/WeaknessPage.vue'), meta: { role: 'student' } },
      { path: 'quiz', component: () => import('./pages/QuizPage.vue'), meta: { role: 'student' } },
      { path: 'dashboard', component: () => import('./pages/ProfessorDashboardPage.vue'), meta: { role: 'professor' } },
      { path: 'more', component: () => import('./pages/MorePage.vue') },
    ],
  },
]

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach((to) => {
  if (to.meta.public) return session.user ? homePath() : true
  if (!session.user) return '/login'
  if (to.meta.role && session.user.role !== to.meta.role) return homePath()
  // 교수는 마이스페이스·출결·확인서 페이지가 없다 → 질문 관리로
  if (session.user.role === 'professor' && ['/home', '/attendance', '/certificate-request'].includes(to.path)) return '/dashboard'
  return true
})
export default router
