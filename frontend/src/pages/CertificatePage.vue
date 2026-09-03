<template>
  <div class="page narrow">
    <h2 class="page-title">참여확인서/출결확인서</h2>
    <div class="info-box">
      <div class="info-title">📌 참여확인서 및 출결확인서 발급 요청 방법</div>
      <p>참여확인서 및 출결확인서(출석부)는 <b class="hl">대한상공회의소</b>에서 발급하며, 아래와 같은 내용으로 메일로 요청해주세요.</p>
      <ul>
        <li><b>메일 수신자</b>: ppackdaehan0319@gmail.com (대한상의 담당자)</li>
        <li><b>메일 제목</b>: SKALA O회차 OOO(본인이름) 참여확인서 or 출결확인서(출석부)</li>
        <li><b>내용</b>:
          <ul><li>본인 성명</li><li>생년월일성별 (예: 990101-1)</li><li>교육생 고유번호 (POOO, UOOO, GOOO 등)</li><li>참여 캠퍼스</li><li>참여 회차</li><li>자료 제출처</li></ul>
        </li>
        <li><b>첨부파일</b>:
          <ul><li>[출결확인서(출석부) 요청 경우] 출결 확인 필요 기간에 대한 첨부용 출결 자료<br>
            <span class="hl">* 첨부용 출결 자료는 아래에서 출결 확인 필요 기간 설정 후 다운로드 해주세요.</span><br>
            <span class="hl">* 참여확인서를 요청하는 경우에는 출결 자료 첨부하지 않습니다.</span></li></ul>
        </li>
      </ul>
    </div>
    <div class="card">
      <p class="desc">출결확인서(출석부) 첨부용 출결 자료를 엑셀로 다운로드합니다.<br>출결확인필요기간을 입력하면 해당 기간의 출결정보로 엑셀이 생성됩니다.</p>
      <div class="field-label">출결확인필요기간 <span class="req">*</span></div>
      <div class="range-row"><input type="date" class="input" /><span>~</span><input type="date" class="input" /></div>
      <div class="hint">입력한 출결확인필요기간 범위의 출결정보만 추출됩니다.</div>
      <button class="download-btn">📥 출결 자료 엑셀 다운로드</button>
      <div class="hint">포함 항목: 대한상의훈련과정ID · 과정명 · 훈련생이름 · 훈련생고유번호 · 훈련일자 · 입실/퇴실 · 외출시작/종료시간</div>
    </div>
  </div>
</template>
<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page.narrow { max-width: 528px; margin: 0 auto; padding-top: 16px; }
.page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.info-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 14px; padding: 18px 20px; font-size: 13px; color: #374151; line-height: 1.6; }
.info-title { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
.info-box ul { padding-left: 18px; margin: 6px 0; }
.info-box p { margin: 0 0 6px; }
.hl { color: #6b35ff; font-weight: 700; }
.card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 10px; }
.desc { font-size: 13px; color: #374151; line-height: 1.6; margin: 0; }
.field-label { font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 6px; }
.req { color: #dc2626; }
.range-row { display: flex; align-items: center; gap: 8px; }
.input { flex: 1; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-family: inherit; color: #0f172a; }
.hint { font-size: 11.5px; color: #94a3b8; }
.download-btn { background: #6b35ff; color: #fff; border: none; border-radius: 8px; padding: 10px 16px; font-size: 13px; font-weight: 700; cursor: pointer; }
</style>
