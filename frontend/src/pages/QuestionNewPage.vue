<template>
  <div class="page">
    <h2 class="page-title">질문하기</h2>
    <div class="card">
      <div class="ctx-box" v-if="row">
        <span class="ctx-label">교육 일정</span>
        <div class="ctx-subject">{{ row.subject }}</div>
        <div class="ctx-meta">{{ row.md }} ({{ row.dow }})<template v-if="dateRange">&nbsp;<span class="ctx-range">{{ dateRange }}</span></template><template v-if="row.lead"> · 전임 {{ row.lead }}</template><template v-if="assist"> · 실습 {{ assist }}</template></div>
      </div>
      <label class="field"><span>과목</span>
        <select v-model="subject" class="input"><option v-for="s in subjects" :key="s" :value="s">{{ s }}</option></select>
      </label>
      <label class="field"><span>제목</span><input v-model.trim="title" class="input" placeholder="질문을 한 줄로 요약해주세요" /></label>
      <div class="field">
        <span>태그 <em>(입력 후 Enter, 선택)</em></span>
        <div class="tag-box" :class="{ focus: tagFocus }" @click="tagInput && tagInput.focus()">
          <input ref="tagInput" v-model="tagDraft" class="tag-input" placeholder="태그 입력 후 Enter"
                 @keydown.enter.prevent="onEnter" @keydown="onTagKey" @compositionstart="composing = true" @compositionend="composing = false"
                 @blur="tagFocus = false; addTag()" @focus="tagFocus = true" />
          <span v-if="tags.length" class="tag-sep"></span>
          <span v-for="(t, i) in tags" :key="t" class="chip">{{ t }}<button type="button" class="chip-x" @click.stop="removeTag(i)" aria-label="태그 삭제">×</button></span>
        </div>
      </div>
      <label class="field"><span>내용</span><textarea v-model="content" class="input textarea" rows="8" placeholder="어떤 상황에서 막혔는지, 시도해본 것은 무엇인지 적어주세요"></textarea></label>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="actions">
        <button class="ghost-btn" @click="router.back()">취소</button>
        <button class="primary-btn" @click="submit">등록</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import schedule from '../data/schedule.json'
import { session, questions } from '../data/store'
const route = useRoute(); const router = useRouter()
const subjects = [...new Set(schedule.filter(r => ['lecture','project','special','eval'].includes(r.kind)).map(r => r.subject))]
const fromQuery = schedule.find(r => r.date === route.query.date)
const subject = ref(fromQuery?.subject || subjects[0])

// 선택한 과목에 맞는 일정 행 — 링크로 들어온 날짜가 그 과목이면 그 날, 아니면 오늘과 가장 가까운 날
const todayKey = new Date().toISOString().slice(0, 10)
const row = computed(() => {
  if (fromQuery && fromQuery.subject === subject.value) return fromQuery
  const rows = schedule.filter(r => r.subject === subject.value)
  const dist = r => Math.abs(new Date(r.date) - new Date(todayKey))
  return rows.reduce((best, r) => (!best || dist(r) < dist(best) ? r : best), null)
})
const dateRange = computed(() => {
  const rows = schedule.filter(r => r.subject === subject.value)
  if (rows.length <= 1) return ''
  return `${rows[0].md} ~ ${rows[rows.length - 1].md} · ${rows.length}일`
})
const assist = computed(() => row.value?.instructors?.[String(session.user?.classNo ?? 4)] || '')
const title = ref(''); const content = ref(''); const error = ref('')
const tags = ref([]); const tagDraft = ref(''); const tagFocus = ref(false); const tagInput = ref(null)
// 한글 IME 조합 중(isComposing)에 들어오는 Enter 는 무시 — 안 그러면 조합 중 글자가 잘리거나 두 번 들어간다
const composing = ref(false)
function onEnter(e) { if (e.isComposing || composing.value || e.keyCode === 229) return; addTag() }
function addTag() {
  const t = tagDraft.value.replace(/,/g, '').trim().toLowerCase()
  if (t && !tags.value.includes(t) && tags.value.length < 5) tags.value.push(t)
  tagDraft.value = ''
}
function removeTag(i) { tags.value.splice(i, 1) }
function onTagKey(e) {
  if (e.isComposing || composing.value || e.keyCode === 229) return
  if (e.key === ',') { e.preventDefault(); addTag() }
  else if (e.key === 'Backspace' && !tagDraft.value && tags.value.length) tags.value.pop()
}
function submit() {
  if (!title.value || !content.value) { error.value = '제목과 내용을 입력해주세요.'; return }
  const item = questions.add({ subject: subject.value, date: row.value?.date || '', title: title.value, content: content.value,
    tags: [...tags.value], authorId: session.user.id, authorName: session.user.name })
  router.push('/questions/' + item.id)
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 14px; }
.ctx-box { background: linear-gradient(135deg, #6b35ff, #4f46e5); border-radius: 12px; padding: 14px 16px; color: #fff; }
.ctx-label { font-size: 10.5px; font-weight: 700; color: rgba(255,255,255,.65); text-transform: uppercase; letter-spacing: .5px; }
.ctx-subject { font-size: 16px; font-weight: 800; margin-top: 4px; }
.ctx-meta { font-size: 12px; color: rgba(255,255,255,.75); margin-top: 4px; }
.ctx-range { font-size: 11px; color: rgba(255,255,255,.6); background: rgba(255,255,255,.14); padding: 1px 7px; border-radius: 6px; margin-left: 2px; }
.field { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 700; color: #64748b; }
.field em { font-style: normal; font-weight: 500; color: #94a3b8; }
.tag-box { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-height: 42px; padding: 6px 10px; border: 1.5px solid #e2e8f0; border-radius: 10px; background: #fff; cursor: text; }
.tag-box.focus { border-color: #6b35ff; }
.chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 6px 4px 10px; border-radius: 6px; background: #ede9fe; color: #4c1d95; font-size: 12px; font-weight: 700; }
.chip-x { border: none; background: none; color: #7c3aed; font-size: 14px; line-height: 1; cursor: pointer; padding: 0 2px; font-family: inherit; }
.chip-x:hover { color: #4c1d95; }
.tag-input { width: 180px; flex-shrink: 0; border: none; outline: none; font-size: 13px; font-family: inherit; color: #0f172a; padding: 4px 2px; background: transparent; }
.tag-sep { width: 1px; height: 18px; background: #e2e8f0; margin: 0 2px; }
.input { padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; font-family: inherit; color: #0f172a; background: #fff; outline: none; }
.input:focus { border-color: #6b35ff; }
.textarea { resize: vertical; line-height: 1.6; }
.error { font-size: 12px; color: #dc2626; margin: 0; }
.actions { display: flex; justify-content: flex-end; gap: 8px; }
.ghost-btn { padding: 9px 18px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 10px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; font-family: inherit; }
.primary-btn { padding: 9px 20px; background: #6b35ff; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
</style>
