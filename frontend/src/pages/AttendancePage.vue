<template>
  <div class="page">
    <div class="page-title-row">
      <div>
        <h2 class="page-title">{{ user.name }}님의 출결 현황</h2>
        <select class="period-select" v-model="period">
          <option v-for="p in periods" :key="p.key" :value="p.key">{{ p.label }}</option>
        </select>
      </div>
      <button class="guide-btn">출결 관련 안내 자료</button>
    </div>

    <div class="stat-cards">
      <div class="stat-card"><div class="stat-k">출석률</div><div class="stat-v c-green">100%</div><div class="stat-cmp c-green">SKALA 4기 평균대비 ▲1.5%</div></div>
      <div class="stat-card"><div class="stat-k">결석률</div><div class="stat-v c-red">0%</div><div class="stat-cmp c-green">SKALA 4기 평균대비 ▼1.5%</div></div>
      <div class="stat-card"><div class="stat-k">지각/조퇴율</div><div class="stat-v c-amber">0%</div><div class="stat-cmp c-green">SKALA 4기 평균대비 ▼1.4%</div></div>
      <div class="stat-card"><div class="stat-k">공가사용률</div><div class="stat-v c-blue">0%</div><div class="stat-cmp c-green">SKALA 4기 평균대비 ▼1.9%</div></div>
    </div>

    <div class="two-col">
      <!-- 왼쪽 -->
      <div class="col-main">
        <div class="card">
          <div class="card-title">단위기간별 출석 현황</div>
          <div class="table-wrap">
            <table class="tbl">
              <thead><tr><th>단위기간</th><th>시작일</th><th>종료일</th><th>상태</th><th>훈련일수</th><th>공가일수</th><th>출석일수</th><th>결석일수</th><th>지각일수</th><th>조퇴일수</th><th>외출일수</th><th>출석률</th><th>결석률</th><th>지각/조퇴율</th><th>공가사용률</th><th>성장지원금</th></tr></thead>
              <tbody>
                <tr v-for="r in units" :key="r.key" :class="{ 'row-current': r.key === period, 'row-future': r.state === '진행 예정', 'row-total': r.key === 'total' }">
                  <td>{{ r.name }}</td><td>{{ r.start }}</td><td>{{ r.end }}</td>
                  <td><span v-if="r.state !== '-'" class="state-chip" :class="stateClass(r.state)">{{ r.state }}</span><span v-else>-</span></td>
                  <td>{{ r.days }}</td><td>{{ r.leave }}</td><td>{{ r.present }}</td><td>{{ r.absent }}</td><td>{{ r.late }}</td><td>{{ r.early }}</td><td>{{ r.out }}</td>
                  <td>{{ r.rate }}</td><td>{{ r.absentRate }}</td><td>{{ r.lateRate }}</td><td>{{ r.leaveRate }}</td><td>{{ r.bonus }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <div class="card-title">일별 출석 현황 <span class="card-sub">({{ currentPeriod.label }})</span></div>
            <button class="excel-btn">엑셀 다운로드</button>
          </div>
          <div class="table-wrap">
            <table class="tbl">
              <thead><tr><th>단위기간</th><th>일자</th><th>입실시간</th><th>퇴실시간</th><th>외출시간</th><th>복귀시간</th><th>출결상태</th><th>공가 신청</th><th>출결 특이사항</th><th>출결 특이사항 사유</th></tr></thead>
              <tbody>
                <tr v-for="d in days" :key="d.date">
                  <td>{{ currentPeriod.short }}</td><td>{{ d.date }}</td>
                  <td class="mono">{{ d.in || '–' }}</td><td class="mono">{{ d.out || '–' }}</td><td>–</td><td>–</td>
                  <td><span v-if="d.in" class="status-chip ok">정상출석</span><span v-else class="status-chip none">-</span></td>
                  <td><a v-if="d.in" class="link">공가 신청하기</a><span v-else>-</span></td>
                  <td class="dim">-</td><td class="dim"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 오른쪽 -->
      <div class="col-side">
        <div class="card">
          <div class="card-head">
            <div class="card-title">공가 사용 현황</div>
            <button class="mini-btn">신청현황</button>
          </div>
          <div class="leave-summary">
            <div class="leave-total"><div class="leave-num">0</div><div class="leave-unit">일</div></div>
            <div class="leave-legend">
              <div class="legend-row"><span><i class="dot red"></i>질병·입원</span><b>0일</b></div>
              <div class="legend-note">❉최대 10일 사용 가능</div>
              <div class="legend-row"><span><i class="dot blue"></i>훈련·시험·공인권 등</span><b>0일</b></div>
              <div class="legend-row"><span><i class="dot yellow"></i>경조사 (결혼·사망·출산)</span><b>0일</b></div>
            </div>
          </div>
          <table class="tbl compact">
            <thead><tr><th>일자</th><th>공가 구분</th><th>상태</th></tr></thead>
            <tbody><tr><td colspan="3" class="empty">신청 내역이 없습니다.</td></tr></tbody>
          </table>
        </div>

        <div class="card">
          <div class="card-title">출결 특이사항 입력</div>
          <div class="form-row"><label>일자 <span class="req">*</span></label><input type="date" class="input" /></div>
          <div class="form-row"><label>구분 <span class="req">*</span></label>
            <div class="check-group">
              <label v-for="t in ['결석','지각','조퇴','외출']" :key="t" class="check"><input type="checkbox" /> {{ t }}</label>
            </div>
          </div>
          <div class="form-row"><label>사유 <span class="req">*</span></label><input class="input" placeholder="사유를 입력하세요" /></div>
          <div class="form-actions"><button class="primary-btn">저장</button></div>
          <div class="card-title mt">출결 특이사항 등록 내역 <span class="count-chip">0건</span></div>
          <div class="note-empty">등록된 내역이 없습니다.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { user as base } from '../data/user'
import { session } from '../data/store'
const user = { ...base, ...(session.user || {}) }

const periods = [
  { key: 'all', label: '전체 단위기간', short: '전체' },
  { key: 'p1', label: '1차 단위기간 (2026.07.14 ~ 2026.08.13)', short: '1차 단위기간' },
  { key: 'p2', label: '2차 단위기간 (2026.08.14 ~ 2026.09.13)', short: '2차 단위기간' },
  { key: 'p3', label: '3차 단위기간 (2026.09.14 ~ 2026.10.13)', short: '3차 단위기간' },
  { key: 'p4', label: '4차 단위기간 (2026.10.14 ~ 2026.11.13)', short: '4차 단위기간' },
  { key: 'p5', label: '5차 단위기간 (2026.11.14 ~ 2026.12.11)', short: '5차 단위기간' },
]
const period = ref('p2')
const currentPeriod = computed(() => periods.find(p => p.key === period.value) || periods[2])

const units = [
  { key: 'p1', name: '1차 단위기간', start: '2026.07.14(화)', end: '2026.08.13(목)', state: '종료', days: 22, leave: 0, present: 22, absent: 0, late: 0, early: 0, out: 0, rate: '100%', absentRate: '0%', lateRate: '0%', leaveRate: '0%', bonus: '지급대상' },
  { key: 'p2', name: '2차 단위기간', start: '2026.08.14(금)', end: '2026.09.13(일)', state: '진행중', days: 21, leave: 0, present: 14, absent: 0, late: 0, early: 0, out: 0, rate: '100%', absentRate: '0%', lateRate: '0%', leaveRate: '0%', bonus: '-' },
  { key: 'p3', name: '3차 단위기간', start: '2026.09.14(월)', end: '2026.10.13(화)', state: '진행 예정', days: 17, leave: 0, present: '-', absent: '-', late: '-', early: '-', out: '-', rate: '-', absentRate: '-', lateRate: '-', leaveRate: '-', bonus: '-' },
  { key: 'p4', name: '4차 단위기간', start: '2026.10.14(수)', end: '2026.11.13(금)', state: '진행 예정', days: 23, leave: 0, present: '-', absent: '-', late: '-', early: '-', out: '-', rate: '-', absentRate: '-', lateRate: '-', leaveRate: '-', bonus: '-' },
  { key: 'p5', name: '5차 단위기간', start: '2026.11.14(토)', end: '2026.12.11(금)', state: '진행 예정', days: 20, leave: 0, present: '-', absent: '-', late: '-', early: '-', out: '-', rate: '-', absentRate: '-', lateRate: '-', leaveRate: '-', bonus: '-' },
  { key: 'total', name: '통계', start: '2026.07.14(화)', end: '2026.12.11(금)', state: '-', days: 103, leave: 0, present: 36, absent: 0, late: 0, early: 0, out: 0, rate: '100%', absentRate: '0%', lateRate: '0%', leaveRate: '0%', bonus: '-' },
]
const stateClass = s => ({ '종료': 'done', '진행중': 'now', '진행 예정': 'next' }[s] || '')

const days = [
  { date: '2026.08.14(금)', in: '08:34', out: '17:50' },
  { date: '2026.08.18(화)', in: '08:45', out: '17:53' },
  { date: '2026.08.19(수)', in: '08:45', out: '19:18' },
  { date: '2026.08.20(목)', in: '08:38', out: '17:51' },
  { date: '2026.08.21(금)', in: '08:42', out: '17:55' },
  { date: '2026.08.24(월)', in: '08:41', out: '17:50' },
  { date: '2026.08.25(화)', in: '08:47', out: '17:50' },
  { date: '2026.08.26(수)', in: '08:41', out: '17:54' },
  { date: '2026.08.27(목)', in: '08:37', out: '17:51' },
  { date: '2026.08.28(금)', in: '08:46', out: '17:51' },
  { date: '2026.08.29(토)', in: '08:40', out: '12:58' },
  { date: '2026.08.31(월)', in: '08:42', out: '17:51' },
  { date: '2026.09.01(화)', in: '08:42', out: '17:50' },
  { date: '2026.09.02(수)', in: '08:44', out: '17:58' },
  { date: '2026.09.03(목)' }, { date: '2026.09.04(금)' }, { date: '2026.09.07(월)' }, { date: '2026.09.08(화)' },
  { date: '2026.09.09(수)' }, { date: '2026.09.10(목)' }, { date: '2026.09.11(금)' },
]
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 10px; }
.period-select { min-width: 268px; padding: 7px 12px; border: 1.5px solid #c4b5fd; border-radius: 8px; font-size: 13px; font-weight: 700; color: #4c1d95; background: #fff; font-family: inherit; }
.guide-btn { padding: 8px 14px; background: #fef9c3; color: #92400e; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; }

.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card { background: #fff; border-radius: 14px; padding: 14px 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.stat-k { font-size: 11px; color: #64748b; font-weight: 600; }
.stat-v { font-size: 24px; font-weight: 800; margin: 2px 0; }
.stat-cmp { font-size: 10.5px; font-weight: 700; }
.c-green { color: #16a34a; } .c-red { color: #dc2626; } .c-amber { color: #f59e0b; } .c-blue { color: #3b82f6; }

.two-col { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; align-items: start; }
.col-main, .col-side { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

.card { background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 12px; }
.card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.card-title { font-size: 14px; font-weight: 800; color: #0f172a; }
.card-title.mt { margin-top: 10px; }
.card-sub { font-size: 12px; font-weight: 500; color: #64748b; margin-left: 4px; }
.excel-btn { background: #f0fdf4; color: #15803d; border: 1.5px solid #86efac; border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; }
.mini-btn { background: #6b35ff; color: #fff; border: none; border-radius: 8px; padding: 5px 12px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: inherit; }

.table-wrap { overflow-x: auto; }
.tbl { width: 100%; border-collapse: collapse; font-size: 12px; white-space: nowrap; }
.tbl th { background: #f8fafc; color: #64748b; font-weight: 700; padding: 9px 10px; border-bottom: 2px solid #e2e8f0; text-align: center; }
.tbl td { padding: 9px 10px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #374151; }
.tbl .row-current td { background: #f5f3ff; font-weight: 700; color: #0f172a; }
.tbl .row-current td:first-child { border-left: 3px solid #6b35ff; }
.tbl .row-future td { color: #94a3b8; }
.tbl .row-total td { font-weight: 700; color: #0f172a; border-top: 2px solid #e2e8f0; border-bottom: none; }
.tbl.compact th, .tbl.compact td { padding: 8px 6px; font-size: 11.5px; }
.tbl .empty { color: #94a3b8; padding: 16px; }
.mono { font-variant-numeric: tabular-nums; }
.dim { color: #cbd5e1; }
.state-chip { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 700; }
.state-chip.done { background: #f1f5f9; color: #475569; }
.state-chip.now { background: #dbeafe; color: #1d4ed8; }
.state-chip.next { background: #dcfce7; color: #15803d; }
.status-chip { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.status-chip.ok { background: #dcfce7; color: #15803d; }
.status-chip.none { background: #f1f5f9; color: #94a3b8; }
.link { color: #6b35ff; font-weight: 700; cursor: pointer; }

.leave-summary { display: flex; gap: 14px; background: #f8fafc; border-radius: 12px; padding: 14px; }
.leave-total { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 56px; }
.leave-num { font-size: 30px; font-weight: 800; color: #0f172a; line-height: 1; }
.leave-unit { font-size: 11px; color: #64748b; margin-top: 4px; }
.leave-legend { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.legend-row { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #374151; }
.legend-row b { color: #0f172a; }
.legend-note { font-size: 10.5px; color: #dc2626; padding-left: 14px; }
.dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 6px; vertical-align: 1px; }
.dot.red { background: #ef4444; } .dot.blue { background: #3b82f6; } .dot.yellow { background: #f59e0b; }

.form-row { display: grid; grid-template-columns: 56px 1fr; align-items: center; gap: 8px; }
.form-row label { font-size: 12px; font-weight: 700; color: #0f172a; }
.req { color: #dc2626; }
.input { width: 100%; padding: 8px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 12.5px; font-family: inherit; color: #0f172a; background: #fff; }
.check-group { display: flex; gap: 10px; flex-wrap: wrap; }
.check { display: flex; align-items: center; gap: 4px; font-size: 12.5px; color: #374151; font-weight: 500; }
.form-actions { display: flex; justify-content: flex-end; }
.primary-btn { padding: 8px 20px; background: #6b35ff; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
.count-chip { font-size: 11px; font-weight: 700; color: #6b35ff; background: #ede9fe; padding: 2px 8px; border-radius: 6px; margin-left: 6px; }
.note-empty { font-size: 12.5px; color: #94a3b8; background: #f8fafc; border-radius: 10px; padding: 12px; text-align: center; }

@media (max-width: 1100px) { .two-col { grid-template-columns: 1fr; } }
@media (max-width: 900px) { .stat-cards { grid-template-columns: repeat(2, 1fr); } }
</style>
