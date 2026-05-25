const COLORS = {
  ink: "#0A1A3A",
  primary: "#E5A53A",
  point: "#E07856",
  canvas: "#FFFFFF",
  mute: "#6B7280",
  line: "#E5E7EB",
  guide: "#F1F2F4",
};

const NAV = [
  ["dashboard", "대시보드", "dashboard"],
  ["journal", "일지", "journal"],
  ["shooting", "기록", "target"],
  ["timer", "타이머", "timer"],
  ["condition", "컨디션", "condition"],
  ["insights", "인사이트", "chart"],
  ["coach", "피드백", "coach"],
];

const TAGS = ["격발", "시선", "자세", "멘탈", "호흡", "손목", "루틴"];
const SORENESS = ["어깨", "팔", "손목", "허리", "목", "다리"];
const STORE_KEY = "x10-training-os";

const seedEntries = [
  {
    date: "2026-05-19",
    weather: "맑음",
    timeSlot: "오전",
    place: "태릉",
    condition: "좋음",
    strength: "정지훈련 30세트",
    stationaryDone: true,
    finishShots: 20,
    finishTotal: 196,
    recordSeries: [94, 96, 97, 95, 98, 96],
    xCount: 18,
    sleep: 7.5,
    sleepQuality: "좋음",
    stress: 2,
    soreness: ["손목"],
    mood: "차분",
    feedback: "격발 직전 손목 고정은 안정적. 4시리즈 후반 호흡 루틴 유지 필요.",
    tags: ["격발", "손목", "호흡"],
    memo: "후반 집중 유지가 좋았다.",
  },
  {
    date: "2026-05-20",
    weather: "흐림",
    timeSlot: "오후",
    place: "학교 사대",
    condition: "보통",
    strength: "밴드 3세트",
    stationaryDone: true,
    finishShots: 10,
    finishTotal: 97,
    recordSeries: [92, 95, 95, 94, 96, 95],
    xCount: 14,
    sleep: 6.5,
    sleepQuality: "보통",
    stress: 3,
    soreness: ["어깨"],
    mood: "긴장",
    feedback: "시선이 표적 아래로 떨어지는 패턴. 조준 진입 전 체크.",
    tags: ["시선", "자세"],
    memo: "초반이 흔들렸지만 5시리즈부터 회복.",
  },
  {
    date: "2026-05-21",
    weather: "비",
    timeSlot: "오전",
    place: "태릉",
    condition: "나쁨",
    strength: "휴식",
    stationaryDone: false,
    finishShots: 10,
    finishTotal: 93,
    recordSeries: [91, 93, 92, 94, 93, 95],
    xCount: 10,
    sleep: 5.8,
    sleepQuality: "나쁨",
    stress: 4,
    soreness: ["어깨", "목"],
    mood: "무거움",
    feedback: "격발 타이밍이 늦어짐. 루틴을 짧게 가져갈 것.",
    tags: ["격발", "멘탈"],
    memo: "수면 부족 영향이 컸다.",
  },
  {
    date: "2026-05-22",
    weather: "맑음",
    timeSlot: "오후",
    place: "학교 사대",
    condition: "좋음",
    strength: "정지훈련 30세트",
    stationaryDone: true,
    finishShots: 20,
    finishTotal: 198,
    recordSeries: [97, 97, 98, 96, 99, 97],
    xCount: 21,
    sleep: 8,
    sleepQuality: "좋음",
    stress: 1,
    soreness: [],
    mood: "가벼움",
    feedback: "호흡-격발 연결이 가장 안정적. 현재 리듬 유지.",
    tags: ["호흡", "격발"],
    memo: "마무리 20발이 매우 안정적.",
  },
  {
    date: "2026-05-23",
    weather: "맑음",
    timeSlot: "오전",
    place: "태릉",
    condition: "보통",
    strength: "정지훈련 20세트",
    stationaryDone: true,
    finishShots: 10,
    finishTotal: 98,
    recordSeries: [96, 95, 96, 96, 97, 96],
    xCount: 17,
    sleep: 7,
    sleepQuality: "보통",
    stress: 2,
    soreness: ["손목"],
    mood: "집중",
    feedback: "자세는 안정적이나 3시리즈 시선 이동이 빠름.",
    tags: ["자세", "시선"],
    memo: "중반 시야가 흔들렸다.",
  },
];

let state = loadState();
let route = location.hash.replace("#", "") || "dashboard";
let timer = {
  running: false,
  phase: "LOAD",
  remaining: 10,
  total: 10,
  set: 1,
  sets: 30,
  work: 60,
  rest: 60,
  side: "오른팔",
  interval: null,
  wakeLock: null,
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved?.entries?.length) return saved;
  } catch (error) {
    console.warn(error);
  }
  return { entries: seedEntries };
}

function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function icon(name) {
  const paths = {
    dashboard: '<path d="M3 13h8V3H3z"/><path d="M13 21h8V11h-8z"/><path d="M13 3h8v6h-8z"/><path d="M3 21h8v-6H3z"/>',
    journal: '<path d="M5 4h10a4 4 0 0 1 4 4v12H8a3 3 0 0 1-3-3z"/><path d="M8 4v13"/><path d="M11 9h5"/><path d="M11 13h4"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 13V8"/><path d="M15 2H9"/><path d="M12 2v3"/>',
    condition: '<path d="M12 21s7-4.4 7-11a7 7 0 0 0-14 0c0 6.6 7 11 7 11z"/><path d="M9 10h6"/><path d="M12 7v6"/>',
    chart: '<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-8"/>',
    coach: '<path d="M4 5h16v11H7l-3 3z"/><path d="M8 9h8"/><path d="M8 13h5"/>',
    camera: '<path d="M6 7h2l2-3h4l2 3h2a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3z"/><circle cx="12" cy="13" r="4"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    save: '<path d="M5 4h12l2 2v14H5z"/><path d="M8 4v6h8"/><path d="M8 18h8"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    pause: '<path d="M8 5v14"/><path d="M16 5v14"/>',
    reset: '<path d="M3 3v6h6"/><path d="M21 12a9 9 0 0 0-15.6-6.1L3 9"/><path d="M21 21v-6h-6"/><path d="M3 12a9 9 0 0 0 15.6 6.1L21 15"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.dashboard}</svg>`;
}

function mountNav() {
  const html = NAV.map(([id, label, ico]) => `
    <button class="nav-button ${route === id ? "active" : ""}" data-route="${id}" type="button" title="${label}">
      <span>${icon(ico)}</span><span>${label}</span>
    </button>
  `).join("");
  document.querySelector("#navList").innerHTML = html;
  document.querySelector("#mobileNav").innerHTML = html;
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => {
      location.hash = button.dataset.route;
    });
  });
}

function todayIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
}

function sortedEntries() {
  return [...state.entries].sort((a, b) => a.date.localeCompare(b.date));
}

function latestEntry() {
  return sortedEntries().at(-1) || seedEntries.at(-1);
}

function recordTotal(entry) {
  return entry.recordSeries?.reduce((sum, value) => sum + Number(value || 0), 0) || 0;
}

function average(arr) {
  return arr.length ? arr.reduce((sum, value) => sum + Number(value || 0), 0) / arr.length : 0;
}

function readiness(entry = latestEntry()) {
  const score = Math.round(
    Math.min(100, Math.max(45,
      (Number(entry.sleep || 0) / 8) * 35 +
      (entry.condition === "좋음" ? 28 : entry.condition === "보통" ? 20 : 12) +
      (5 - Number(entry.stress || 3)) * 6 +
      (entry.stationaryDone ? 12 : 4)
    ))
  );
  return score;
}

function correlationLabel() {
  const enoughSleep = state.entries.filter((e) => Number(e.sleep) >= 7).map(recordTotal);
  const lowSleep = state.entries.filter((e) => Number(e.sleep) < 7).map(recordTotal);
  const diff = average(enoughSleep) - average(lowSleep);
  return `수면 7시간↑ → ${diff >= 0 ? "+" : ""}${diff.toFixed(1)}점`;
}

function setTitle(title) {
  document.querySelector("#pageTitle").textContent = title;
  document.querySelector("#todayChip").textContent = formatDate(todayIso());
}

function renderApp() {
  mountNav();
  const renderers = {
    dashboard: renderDashboard,
    journal: renderJournal,
    shooting: renderShooting,
    timer: renderTimer,
    condition: renderCondition,
    insights: renderInsights,
    coach: renderCoach,
  };
  (renderers[route] || renderDashboard)();
  hydrateIcons();
}

function hydrateIcons() {
  document.querySelectorAll("[data-icon]").forEach((node) => {
    node.innerHTML = icon(node.dataset.icon);
  });
}

function statCard(label, value, caption, dark = false) {
  return `
    <article class="${dark ? "dark-card" : "card"}">
      <p class="card-label">${label}</p>
      <div class="metric"><strong>${value}</strong><span>${caption}</span></div>
    </article>
  `;
}

function renderDashboard() {
  const entry = latestEntry();
  const total = recordTotal(entry);
  setTitle("오늘의 훈련");
  document.querySelector("#appView").innerHTML = `
    <div class="dashboard-grid">
      <section class="dark-card">
        <p class="card-label">TODAY READINESS</p>
        <div class="two-col">
          <div>
            <h2>${readiness(entry)}점 컨디션</h2>
            <p class="muted">${formatDate(entry.date)} 기준, 기록과 컨디션을 합산한 오늘의 훈련 준비도입니다.</p>
            <div class="quick-actions">
              <button class="action-button gold" data-go="journal" type="button"><span data-icon="journal"></span>일지 작성</button>
              <button class="action-button ghost" data-go="timer" type="button"><span data-icon="timer"></span>정지훈련</button>
              <button class="action-button ghost" data-go="shooting" type="button"><span data-icon="target"></span>점수 입력</button>
            </div>
          </div>
          <div class="progress-ring" style="--progress:${readiness(entry)}%">
            <div>
              <span class="timer-time">${total}</span>
              <span class="timer-phase">최근 60발</span>
            </div>
          </div>
        </div>
        <p class="summary-line">→ ${correlationLabel()} 패턴이 이번 주 가장 강하게 나타났습니다.</p>
      </section>

      <section class="panel">
        <p class="card-label">X10 SNAPSHOT</p>
        <div class="phone-frame">
          <div class="phone-screen">
            <img src="./assets/images/x10-logo.png" alt="X10" style="width:150px;display:block;margin:0 auto 20px;" />
            ${statCard("마무리 사격", `${entry.finishTotal || 0}점`, `${entry.finishShots || 10}발 기준`, false)}
            <div style="height:14px"></div>
            ${statCard("X점", `${entry.xCount || 0}개`, "최근 기록 사격", true)}
          </div>
        </div>
      </section>
    </div>

    <section class="three-col">
      ${statCard("기록 자동화", "3분", "훈련 직후 입력 목표", true)}
      ${statCard("패턴 발견", TAGS.slice(0, 3).join(" · "), "주요 피드백 태그", false)}
      ${statCard("정지훈련", entry.stationaryDone ? "완료" : "대기", entry.strength || "미입력", false)}
    </section>

    <section class="two-col">
      <article class="panel chart-card">
        <p class="card-label">SCORE TREND</p>
        <h3>기록 사격 추이</h3>
        ${lineChart(sortedEntries().map((e) => recordTotal(e)))}
      </article>
      <article class="panel">
        <p class="card-label">COACH PATTERN</p>
        <h3>반복 피드백</h3>
        ${tagBars()}
      </article>
    </section>
  `;
  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      location.hash = button.dataset.go;
    });
  });
}

function currentOrNewEntry() {
  const date = todayIso();
  return state.entries.find((entry) => entry.date === date) || {
    date,
    weather: "맑음",
    timeSlot: "오전",
    place: "",
    condition: "보통",
    strength: "",
    stationaryDone: false,
    finishShots: 10,
    finishTotal: 0,
    recordSeries: [0, 0, 0, 0, 0, 0],
    xCount: 0,
    sleep: 7,
    sleepQuality: "보통",
    stress: 3,
    soreness: [],
    mood: "차분",
    feedback: "",
    tags: [],
    memo: "",
  };
}

function renderJournal() {
  const entry = currentOrNewEntry();
  setTitle("AI 훈련일지");
  document.querySelector("#appView").innerHTML = `
    <form class="two-col" id="journalForm">
      <section class="panel">
        <p class="card-label">META PIN</p>
        <h3>훈련 컨텍스트</h3>
        <div class="form-grid" style="margin-top:18px">
          ${field("date", "날짜", "date", entry.date)}
          ${selectField("weather", "날씨", ["맑음", "흐림", "비", "눈", "실내"], entry.weather)}
          ${selectField("timeSlot", "시간대", ["오전", "오후", "야간"], entry.timeSlot)}
          ${field("place", "훈련 장소", "text", entry.place, "태릉") }
          <div class="form-field full">
            <span class="field-label">컨디션</span>
            ${segments("condition", ["좋음", "보통", "나쁨"], entry.condition)}
          </div>
          ${field("strength", "체력훈련", "text", entry.strength, "정지훈련 30세트")}
          <div class="form-field">
            <span class="field-label">정지훈련 완료</span>
            <label class="toggle-row">완료 표시
              <span class="switch"><input name="stationaryDone" type="checkbox" ${entry.stationaryDone ? "checked" : ""}><span></span></span>
            </label>
          </div>
        </div>
      </section>

      <section class="panel">
        <p class="card-label">TRAINING RECORD</p>
        <h3>점수 · 피드백 · 소감</h3>
        <div class="form-grid" style="margin-top:18px">
          ${selectField("finishShots", "마무리 발수", ["10", "20"], String(entry.finishShots || 10))}
          ${field("finishTotal", "마무리 총점", "number", entry.finishTotal || "", "98")}
          ${field("xCount", "X점", "number", entry.xCount || "", "18")}
          ${field("mood", "오늘의 기분", "text", entry.mood, "차분")}
          <div class="form-field full">
            <span class="field-label">코치 피드백 태그</span>
            ${tagSelector("tags", TAGS, entry.tags || [])}
          </div>
          <div class="form-field full scan-box">
            <span class="field-label">수기 훈련일지 AI 스캔</span>
            <div class="scan-layout">
              <label class="scan-uploader">
                <input id="journalPhoto" type="file" accept="image/*" capture="environment" />
                <span data-icon="camera"></span>
                <strong>종이노트 촬영 / 사진 선택</strong>
                <small>훈련일지를 찍으면 AI가 텍스트로 변환합니다.</small>
              </label>
              <img id="scanPreview" class="scan-preview" alt="선택한 훈련일지 사진 미리보기" hidden />
            </div>
            <textarea id="ocrText" class="ocr-textarea" placeholder="사진을 선택한 뒤 AI 텍스트 변환을 누르세요. 변환된 텍스트는 여기서 직접 수정할 수 있습니다."></textarea>
            <div class="tool-row">
              <button class="mini-button" id="ocrBtn" type="button"><span data-icon="camera"></span>AI 텍스트 변환</button>
              <button class="mini-button" data-ocr-fill="auto" type="button">피드백/소감 자동 채우기</button>
              <button class="mini-button" data-ocr-fill="feedback" type="button">코치 피드백에 넣기</button>
              <button class="mini-button" data-ocr-fill="memo" type="button">오늘의 소감에 넣기</button>
            </div>
            <p class="scan-status" id="ocrStatus">사진 속 글자가 선명할수록 인식률이 높습니다.</p>
          </div>
          ${textareaField("feedback", "코치 피드백", entry.feedback)}
          ${textareaField("memo", "오늘의 소감", entry.memo)}
        </div>
        <div class="tool-row" style="margin-top:16px">
          <button class="action-button gold" type="submit"><span data-icon="save"></span>저장</button>
          <button class="action-button ghost" id="structureBtn" type="button"><span data-icon="chart"></span>AI 구조화</button>
        </div>
      </section>
    </form>
    <section class="panel" id="aiPreview">
      <p class="card-label">STRUCTURED PREVIEW</p>
      <h3>기록 → 분석 → 피드백</h3>
      <p class="summary-line">→ 입력된 훈련 맥락은 점수, 컨디션, 피드백 패턴과 연결됩니다.</p>
    </section>
  `;
  bindSegments();
  bindJournalForm();
  bindJournalScan();
}

function field(name, label, type, value, placeholder = "") {
  return `
    <label class="form-field">
      <span class="field-label">${label}</span>
      <input name="${name}" type="${type}" value="${value ?? ""}" placeholder="${placeholder}" />
    </label>
  `;
}

function selectField(name, label, options, value) {
  return `
    <label class="form-field">
      <span class="field-label">${label}</span>
      <select name="${name}">
        ${options.map((option) => `<option value="${option}" ${option === value ? "selected" : ""}>${option}</option>`).join("")}
      </select>
    </label>
  `;
}

function textareaField(name, label, value) {
  return `
    <label class="form-field full">
      <span class="field-label">${label}</span>
      <textarea name="${name}">${value || ""}</textarea>
    </label>
  `;
}

function segments(name, options, value) {
  return `
    <div class="segmented" data-segment="${name}">
      ${options.map((option) => `<button type="button" class="segment ${option === value ? "active" : ""}" data-value="${option}">${option}</button>`).join("")}
      <input type="hidden" name="${name}" value="${value}" />
    </div>
  `;
}

function tagSelector(name, options, selected) {
  return `
    <div class="chip-row" data-tags="${name}">
      ${options.map((option) => `<button type="button" class="tag-chip ${selected.includes(option) ? "active" : ""}" data-value="${option}">${option}</button>`).join("")}
      <input type="hidden" name="${name}" value="${selected.join(",")}" />
    </div>
  `;
}

function bindSegments() {
  document.querySelectorAll("[data-segment]").forEach((group) => {
    const input = group.querySelector("input");
    group.querySelectorAll(".segment").forEach((button) => {
      button.addEventListener("click", () => {
        group.querySelectorAll(".segment").forEach((node) => node.classList.remove("active"));
        button.classList.add("active");
        input.value = button.dataset.value;
      });
    });
  });
  document.querySelectorAll("[data-tags]").forEach((group) => {
    const input = group.querySelector("input");
    group.querySelectorAll(".tag-chip").forEach((button) => {
      button.addEventListener("click", () => {
        button.classList.toggle("active");
        input.value = [...group.querySelectorAll(".tag-chip.active")].map((node) => node.dataset.value).join(",");
      });
    });
  });
}

function formEntry(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const existing = state.entries.find((entry) => entry.date === data.date) || currentOrNewEntry();
  return {
    ...existing,
    ...data,
    finishShots: Number(data.finishShots || 10),
    finishTotal: Number(data.finishTotal || 0),
    xCount: Number(data.xCount || 0),
    stationaryDone: Boolean(form.stationaryDone?.checked),
    tags: data.tags ? data.tags.split(",").filter(Boolean) : [],
  };
}

function upsertEntry(entry) {
  const index = state.entries.findIndex((item) => item.date === entry.date);
  if (index >= 0) state.entries[index] = entry;
  else state.entries.push(entry);
  persist();
}

function bindJournalForm() {
  const form = document.querySelector("#journalForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    upsertEntry(formEntry(form));
    toast("훈련일지가 저장되었습니다.");
  });
  document.querySelector("#structureBtn").addEventListener("click", () => {
    const entry = formEntry(form);
    document.querySelector("#aiPreview").innerHTML = `
      <p class="card-label">STRUCTURED PREVIEW</p>
      <div class="four-col">
        ${compactCard("기록", `${entry.finishTotal || 0}점`, `${entry.finishShots}발 마무리`)}
        ${compactCard("컨디션", entry.condition, entry.timeSlot)}
        ${compactCard("태그", entry.tags.join(" · ") || "미분류", "코치 피드백")}
        ${compactCard("다음 포인트", nextFocus(entry), "개선 방향")}
      </div>
      <p class="summary-line">→ ${entry.memo || "오늘 기록은 누적 데이터로 전환되어 다음 훈련의 기준점이 됩니다."}</p>
    `;
  });
}

let ocrEnginePromise = null;

function bindJournalScan() {
  const fileInput = document.querySelector("#journalPhoto");
  const preview = document.querySelector("#scanPreview");
  const ocrText = document.querySelector("#ocrText");
  const status = document.querySelector("#ocrStatus");
  const feedback = document.querySelector('[name="feedback"]');
  const memo = document.querySelector('[name="memo"]');
  if (!fileInput || !ocrText) return;

  let selectedFile = null;
  let previewUrl = null;

  fileInput.addEventListener("change", () => {
    selectedFile = fileInput.files?.[0] || null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!selectedFile) {
      preview.hidden = true;
      status.textContent = "사진을 다시 선택해 주세요.";
      return;
    }
    previewUrl = URL.createObjectURL(selectedFile);
    preview.src = previewUrl;
    preview.hidden = false;
    status.textContent = "사진이 선택되었습니다. AI 텍스트 변환을 눌러 주세요.";
  });

  document.querySelector("#ocrBtn").addEventListener("click", async () => {
    if (!selectedFile) {
      toast("먼저 종이노트 사진을 선택해 주세요.");
      return;
    }
    const button = document.querySelector("#ocrBtn");
    button.disabled = true;
    status.textContent = "AI OCR 엔진을 준비하고 있습니다.";
    try {
      const Tesseract = await loadOcrEngine();
      const result = await Tesseract.recognize(selectedFile, "kor+eng", {
        logger: (message) => {
          if (!message.status) return;
          const pct = message.progress ? ` ${Math.round(message.progress * 100)}%` : "";
          status.textContent = `AI가 글자를 읽는 중입니다. ${message.status}${pct}`;
        },
      });
      ocrText.value = cleanScannedText(result.data.text);
      status.textContent = "텍스트 변환이 완료되었습니다. 내용을 확인하고 수정할 수 있습니다.";
      toast("수기 일지를 텍스트로 변환했습니다.");
    } catch (error) {
      console.error(error);
      status.textContent = "텍스트 변환에 실패했습니다. 사진을 더 밝고 정면으로 다시 촬영해 주세요.";
      toast("AI 텍스트 변환에 실패했습니다.");
    } finally {
      button.disabled = false;
    }
  });

  document.querySelectorAll("[data-ocr-fill]").forEach((button) => {
    button.addEventListener("click", () => {
      const text = ocrText.value.trim();
      if (!text) {
        toast("먼저 변환된 텍스트를 확인해 주세요.");
        return;
      }
      if (button.dataset.ocrFill === "feedback") {
        feedback.value = appendText(feedback.value, text);
      } else if (button.dataset.ocrFill === "memo") {
        memo.value = appendText(memo.value, text);
      } else {
        const split = splitScannedJournal(text);
        feedback.value = appendText(feedback.value, split.feedback);
        memo.value = appendText(memo.value, split.memo);
      }
      toast("변환된 텍스트를 일지에 넣었습니다.");
    });
  });
}

function loadOcrEngine() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (ocrEnginePromise) return ocrEnginePromise;
  ocrEnginePromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.async = true;
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error("OCR engine failed to load."));
    document.head.append(script);
  });
  return ocrEnginePromise;
}

function cleanScannedText(text) {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function splitScannedJournal(text) {
  const normalized = text.replace(/\r/g, "");
  const feedbackMatch = normalized.match(/(?:코치\s*)?피드백\s*[:：]?\s*([\s\S]*?)(?:오늘의\s*소감|소감|느낀점|메모|$)/);
  const memoMatch = normalized.match(/(?:오늘의\s*소감|소감|느낀점|메모)\s*[:：]?\s*([\s\S]*)/);
  const feedback = cleanScannedText(feedbackMatch?.[1] || "");
  const memo = cleanScannedText(memoMatch?.[1] || normalized);
  return { feedback, memo };
}

function appendText(current, next) {
  if (!next) return current || "";
  return current?.trim() ? `${current.trim()}\n${next}` : next;
}

function compactCard(label, title, caption) {
  return `
    <article class="card accent-top" style="--bar-color:${label === "다음 포인트" ? COLORS.point : COLORS.primary}">
      <p class="card-label">${label}</p>
      <h3>${title}</h3>
      <p class="muted">${caption}</p>
    </article>
  `;
}

function nextFocus(entry) {
  if (entry.tags?.includes("시선")) return "조준 진입";
  if (entry.tags?.includes("격발")) return "격발 타이밍";
  if (entry.tags?.includes("호흡")) return "호흡 루틴";
  return "후반 집중";
}

function renderShooting() {
  const entry = currentOrNewEntry();
  setTitle("사격 기록");
  document.querySelector("#appView").innerHTML = `
    <section class="two-col">
      <form class="panel" id="shootingForm">
        <p class="card-label">60 SHOTS RECORD</p>
        <h3>6시리즈 기록 사격</h3>
        <div class="score-grid" style="margin-top:18px">
          ${(entry.recordSeries || [0, 0, 0, 0, 0, 0]).map((value, index) => `
            <label class="form-field">
              <span class="field-label">${index + 1}시리즈</span>
              <input class="series-input" name="series${index}" type="number" min="0" max="109" step="1" value="${value || ""}" />
            </label>
          `).join("")}
        </div>
        <div class="form-grid" style="margin-top:16px">
          ${field("finishTotal", "마무리 총점", "number", entry.finishTotal || "", "98")}
          ${selectField("finishShots", "마무리 발수", ["10", "20"], String(entry.finishShots || 10))}
          ${field("xCount", "X점", "number", entry.xCount || "", "18")}
          ${field("date", "기록일", "date", entry.date)}
        </div>
        <div class="tool-row" style="margin-top:16px">
          <button class="action-button gold" type="submit"><span data-icon="save"></span>기록 저장</button>
        </div>
      </form>

      <section class="dark-card" id="scoreSummary"></section>
    </section>
    <section class="panel chart-card">
      <p class="card-label">SERIES FLOW</p>
      <h3>시리즈 내 진행 차트</h3>
      <div id="seriesChart"></div>
    </section>
  `;
  bindShooting();
}

function bindShooting() {
  const form = document.querySelector("#shootingForm");
  const update = () => {
    const series = [...form.querySelectorAll(".series-input")].map((input) => Number(input.value || 0));
    const total = series.reduce((sum, value) => sum + value, 0);
    const avg = total ? total / 60 : 0;
    document.querySelector("#scoreSummary").innerHTML = `
      <p class="card-label">AUTO TOTAL</p>
      <div class="metric"><strong>${total}</strong><span>60발 총점</span></div>
      <div class="three-col" style="margin-top:22px">
        ${miniStat("평균", avg.toFixed(2))}
        ${miniStat("X점", form.xCount.value || 0)}
        ${miniStat("마무리", form.finishTotal.value || 0)}
      </div>
      <p class="summary-line">→ ${seriesAdvice(series)}</p>
    `;
    document.querySelector("#seriesChart").innerHTML = barChart(series, 100);
  };
  form.querySelectorAll("input, select").forEach((input) => input.addEventListener("input", update));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const date = form.date.value || todayIso();
    const existing = state.entries.find((entry) => entry.date === date) || currentOrNewEntry();
    upsertEntry({
      ...existing,
      date,
      recordSeries: [...form.querySelectorAll(".series-input")].map((input) => Number(input.value || 0)),
      finishTotal: Number(form.finishTotal.value || 0),
      finishShots: Number(form.finishShots.value || 10),
      xCount: Number(form.xCount.value || 0),
    });
    toast("사격 기록이 저장되었습니다.");
  });
  update();
}

function miniStat(label, value) {
  return `<div><p class="card-label">${label}</p><h3 style="color:var(--primary)">${value}</h3></div>`;
}

function seriesAdvice(series) {
  const best = Math.max(...series);
  const worst = Math.min(...series.filter(Boolean));
  if (!worst) return "시리즈를 입력하면 자동으로 흐름을 계산합니다.";
  if (best - worst >= 5) return "시리즈 편차가 큽니다. 중반 루틴을 다시 고정하세요.";
  return "시리즈 편차가 안정적입니다. 현재 리듬을 유지하세요.";
}

function renderTimer() {
  setTitle("AI 정지훈련 타이머");
  document.querySelector("#appView").innerHTML = `
    <section class="two-col">
      <div class="dark-card">
        <p class="card-label">STATIONARY TRAINING</p>
        <div class="progress-ring" id="timerRing" style="--progress:0%">
          <div>
            <span class="timer-time" id="timerTime">00:10</span>
            <span class="timer-phase" id="timerPhase">LOAD</span>
          </div>
        </div>
        <div class="three-col" style="margin-top:24px">
          ${miniStat("세트", `<span id="timerSet">1/${timer.sets}</span>`)}
          ${miniStat("팔", `<span id="timerSide">${timer.side}</span>`)}
          ${miniStat("큐", `<span id="timerCue">대기</span>`)}
        </div>
        <div class="tool-row" style="margin-top:24px">
          <button class="action-button gold" id="timerStart" type="button"><span data-icon="play"></span>시작</button>
          <button class="action-button ghost" id="timerPause" type="button"><span data-icon="pause"></span>정지</button>
          <button class="action-button ghost" id="timerReset" type="button"><span data-icon="reset"></span>초기화</button>
        </div>
        <p class="summary-line">→ 시선은 사대에 고정하고, 음성 큐만으로 한 사이클씩 진행합니다.</p>
      </div>

      <form class="panel" id="timerConfig">
        <p class="card-label">INTERVAL SETUP</p>
        <h3>훈련 세팅</h3>
        <div class="form-grid" style="margin-top:18px">
          ${field("sets", "세트 수", "number", timer.sets)}
          ${field("work", "버티기 초", "number", timer.work)}
          ${field("rest", "휴식 초", "number", timer.rest)}
          <div class="form-field">
            <span class="field-label">팔 순서</span>
            <div class="toggle-row">오른팔 4세트 → 왼팔 1세트</div>
          </div>
        </div>
        <div class="tool-row" style="margin-top:16px">
          <button class="mini-button" data-preset="demo" type="button">데모 10초</button>
          <button class="mini-button" data-preset="standard" type="button">60분 표준</button>
        </div>
      </form>
    </section>
  `;
  bindTimer();
  renderTimerFace();
}

function bindTimer() {
  const config = document.querySelector("#timerConfig");
  config.addEventListener("input", () => {
    timer.sets = Number(config.sets.value || 30);
    timer.work = Number(config.work.value || 60);
    timer.rest = Number(config.rest.value || 60);
    timer.side = sideForSet(timer.set);
    timer.total = timer.phase === "START" ? timer.work : timer.phase === "STOP" ? timer.rest : 10;
    renderTimerFace();
  });
  config.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.preset === "demo") {
        config.sets.value = 3;
        config.work.value = 5;
        config.rest.value = 5;
      } else {
        config.sets.value = 30;
        config.work.value = 60;
        config.rest.value = 60;
      }
      config.dispatchEvent(new Event("input"));
      resetTimer(false);
    });
  });
  document.querySelector("#timerStart").addEventListener("click", startTimer);
  document.querySelector("#timerPause").addEventListener("click", pauseTimer);
  document.querySelector("#timerReset").addEventListener("click", () => resetTimer(true));
}

async function startTimer() {
  if (timer.running) return;
  timer.running = true;
  await requestWakeLock();
  playCue(timer.phase);
  timer.interval = setInterval(() => {
    timer.remaining -= 1;
    if (timer.remaining <= 0) advanceTimer();
    renderTimerFace();
  }, 1000);
}

function pauseTimer() {
  timer.running = false;
  clearInterval(timer.interval);
  releaseWakeLock();
  renderTimerFace();
}

function resetTimer(showMessage) {
  pauseTimer();
  timer.phase = "LOAD";
  timer.remaining = 10;
  timer.total = 10;
  timer.set = 1;
  timer.side = sideForSet(timer.set);
  renderTimerFace();
  if (showMessage) toast("타이머를 초기화했습니다.");
}

function sideForSet(setNumber) {
  return setNumber % 5 === 0 ? "왼팔" : "오른팔";
}

function advanceTimer() {
  if (timer.phase === "LOAD") {
    timer.phase = "START";
    timer.total = timer.work;
    timer.remaining = timer.work;
  } else if (timer.phase === "START") {
    timer.phase = "STOP";
    timer.total = timer.rest;
    timer.remaining = timer.rest;
  } else {
    if (timer.set >= timer.sets) {
      resetTimer(false);
      toast("정지훈련을 완료했습니다.");
      markStationaryDone();
      return;
    }
    timer.set += 1;
    timer.side = sideForSet(timer.set);
    timer.phase = "START";
    timer.total = timer.work;
    timer.remaining = timer.work;
  }
  playCue(timer.phase);
}

function renderTimerFace() {
  const time = document.querySelector("#timerTime");
  if (!time) return;
  const min = String(Math.floor(timer.remaining / 60)).padStart(2, "0");
  const sec = String(timer.remaining % 60).padStart(2, "0");
  const progress = Math.max(0, Math.min(100, ((timer.total - timer.remaining) / timer.total) * 100));
  time.textContent = `${min}:${sec}`;
  document.querySelector("#timerPhase").textContent = timer.phase;
  document.querySelector("#timerSet").textContent = `${timer.set}/${timer.sets}`;
  document.querySelector("#timerSide").textContent = timer.side;
  document.querySelector("#timerCue").textContent = timer.running ? "재생 중" : "대기";
  document.querySelector("#timerRing").style.setProperty("--progress", `${progress}%`);
}

function playCue(phase) {
  const file = phase === "START" ? "START.mp3" : phase === "STOP" ? "STOP.mp3" : "LOAD.mp3";
  const audio = new Audio(`./assets/audio/${file}`);
  audio.play().catch(() => {
    if ("speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance(phase));
  });
}

async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator) timer.wakeLock = await navigator.wakeLock.request("screen");
  } catch (error) {
    console.warn(error);
  }
}

function releaseWakeLock() {
  timer.wakeLock?.release?.();
  timer.wakeLock = null;
}

function markStationaryDone() {
  const entry = currentOrNewEntry();
  upsertEntry({ ...entry, stationaryDone: true, strength: entry.strength || "정지훈련 완료" });
}

function renderCondition() {
  const entry = currentOrNewEntry();
  setTitle("컨디션 체크인");
  document.querySelector("#appView").innerHTML = `
    <form class="two-col" id="conditionForm">
      <section class="panel">
        <p class="card-label">SLEEP & MOOD</p>
        <h3>수면과 심리 상태</h3>
        <div class="form-grid" style="margin-top:18px">
          <label class="form-field full">
            <span class="field-label">수면 시간 <strong id="sleepLabel">${entry.sleep}h</strong></span>
            <input name="sleep" type="range" min="3" max="10" step="0.5" value="${entry.sleep}" />
          </label>
          <div class="form-field full">
            <span class="field-label">수면 질</span>
            ${segments("sleepQuality", ["좋음", "보통", "나쁨"], entry.sleepQuality)}
          </div>
          <label class="form-field full">
            <span class="field-label">스트레스 <strong id="stressLabel">${entry.stress}</strong></span>
            <input name="stress" type="range" min="1" max="5" step="1" value="${entry.stress}" />
          </label>
          ${field("mood", "기분", "text", entry.mood, "차분")}
          ${field("date", "체크인 날짜", "date", entry.date)}
        </div>
      </section>

      <section class="panel">
        <p class="card-label">BODY CHECK</p>
        <h3>근육통 부위</h3>
        <div style="margin-top:18px">${tagSelector("soreness", SORENESS, entry.soreness || [])}</div>
        <div class="dark-card" style="margin-top:18px">
          <p class="card-label">PROFILE</p>
          <div class="metric"><strong id="conditionScore">${readiness(entry)}</strong><span>훈련 준비도</span></div>
          <p class="summary-line">→ 컨디션은 F1 메타 핀과 자동으로 연결됩니다.</p>
        </div>
        <div class="tool-row" style="margin-top:16px">
          <button class="action-button gold" type="submit"><span data-icon="save"></span>체크인 저장</button>
        </div>
      </section>
    </form>
  `;
  bindSegments();
  const form = document.querySelector("#conditionForm");
  const update = () => {
    document.querySelector("#sleepLabel").textContent = `${form.sleep.value}h`;
    document.querySelector("#stressLabel").textContent = form.stress.value;
  };
  form.sleep.addEventListener("input", update);
  form.stress.addEventListener("input", update);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const existing = state.entries.find((entry) => entry.date === data.date) || currentOrNewEntry();
    upsertEntry({
      ...existing,
      ...data,
      sleep: Number(data.sleep),
      stress: Number(data.stress),
      soreness: data.soreness ? data.soreness.split(",").filter(Boolean) : [],
    });
    toast("컨디션 체크인이 저장되었습니다.");
  });
}

function renderInsights() {
  setTitle("인사이트 분석");
  const entries = sortedEntries();
  const totals = entries.map(recordTotal);
  const avgTotal = Math.round(average(totals));
  const best = Math.max(...totals);
  const last = latestEntry();
  document.querySelector("#appView").innerHTML = `
    <section class="three-col">
      ${statCard("주간 평균", avgTotal, "기록 사격 60발", true)}
      ${statCard("최고 기록", best, "최근 데이터 기준", false)}
      ${statCard("컨디션 패턴", correlationLabel(), "수면-점수 관계", false)}
    </section>
    <section class="two-col">
      <article class="panel chart-card">
        <p class="card-label">MONTHLY TREND</p>
        <h3>점수 변화 추적</h3>
        ${lineChart(totals)}
      </article>
      <article class="panel">
        <p class="card-label">WEAKNESS PATTERN</p>
        <h3>반복 약점 도출</h3>
        ${tagBars()}
        <p class="summary-line">→ ${nextFocus(last)}을 다음 훈련의 첫 번째 점검 항목으로 추천합니다.</p>
      </article>
    </section>
    <section class="panel">
      <p class="card-label">WEEKLY REPORT</p>
      <h3>개인화 코칭 리포트</h3>
      <div class="four-col" style="margin-top:18px">
        ${compactCard("기록", `${totals.at(-1) || 0}점`, "최근 60발")}
        ${compactCard("컨디션", `${readiness(last)}점`, last.condition)}
        ${compactCard("피드백", topTag(), "최빈 태그")}
        ${compactCard("전략", nextFocus(last), "다음 훈련")}
      </div>
    </section>
  `;
}

function renderCoach() {
  setTitle("코치 피드백");
  document.querySelector("#appView").innerHTML = `
    <section class="two-col">
      <form class="panel" id="coachForm">
        <p class="card-label">FEEDBACK LOG</p>
        <h3>피드백 입력</h3>
        <div class="form-grid" style="margin-top:18px">
          ${field("date", "날짜", "date", todayIso())}
          ${field("coachName", "코치", "text", "", "Coach")}
          ${textareaField("feedback", "피드백", "")}
          <div class="form-field full">
            <span class="field-label">태그</span>
            ${tagSelector("tags", TAGS, [])}
          </div>
        </div>
        <div class="tool-row" style="margin-top:16px">
          <button class="action-button gold" type="submit"><span data-icon="plus"></span>추가</button>
        </div>
      </form>
      <section class="panel">
        <p class="card-label">SEARCH</p>
        <h3>이력 검색</h3>
        <label class="form-field" style="margin-top:18px">
          <span class="field-label">키워드</span>
          <input id="feedbackSearch" type="search" placeholder="격발, 시선, 자세..." />
        </label>
        <div style="margin-top:18px">${tagBars()}</div>
      </section>
    </section>
    <section class="panel">
      <p class="card-label">TIMELINE</p>
      <h3>피드백 타임라인</h3>
      <div class="timeline" id="feedbackTimeline" style="margin-top:12px"></div>
    </section>
  `;
  bindSegments();
  const form = document.querySelector("#coachForm");
  const renderTimeline = () => {
    const q = document.querySelector("#feedbackSearch").value.trim();
    const items = sortedEntries().filter((entry) => {
      const text = `${entry.feedback} ${(entry.tags || []).join(" ")}`;
      return !q || text.includes(q);
    }).reverse();
    document.querySelector("#feedbackTimeline").innerHTML = items.length ? items.map((entry) => `
      <article class="timeline-item">
        <span class="timeline-date">${formatDate(entry.date)}</span>
        <div>
          <h3>${(entry.tags || ["피드백"]).join(" · ")}</h3>
          <p class="muted">${entry.feedback || "피드백 없음"}</p>
        </div>
      </article>
    `).join("") : `<div class="empty-state">검색 결과가 없습니다.</div>`;
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const existing = state.entries.find((entry) => entry.date === data.date) || currentOrNewEntry();
    upsertEntry({
      ...existing,
      date: data.date,
      feedback: data.feedback,
      tags: data.tags ? data.tags.split(",").filter(Boolean) : [],
    });
    form.reset();
    bindSegments();
    renderTimeline();
    toast("피드백이 추가되었습니다.");
  });
  document.querySelector("#feedbackSearch").addEventListener("input", renderTimeline);
  renderTimeline();
}

function lineChart(values) {
  const width = 640;
  const height = 250;
  const pad = 28;
  const nums = values.length ? values : [0];
  const min = Math.min(...nums) - 4;
  const max = Math.max(...nums) + 4;
  const points = nums.map((value, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(1, nums.length - 1);
    const y = height - pad - ((value - min) / Math.max(1, max - min)) * (height - pad * 2);
    return [x, y];
  });
  const d = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="score trend chart">
      <path d="M${pad} ${height - pad}H${width - pad}" stroke="${COLORS.guide}" />
      <path d="M${pad} ${pad}V${height - pad}" stroke="${COLORS.guide}" />
      <path d="${d}" fill="none" stroke="${COLORS.primary}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
      ${points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${COLORS.ink}" />`).join("")}
    </svg>
  `;
}

function barChart(values, max) {
  const labels = values.map((_, index) => `${index + 1}시리즈`);
  return `<div class="bar-list">${values.map((value, index) => `
    <div class="bar-item">
      <span>${labels[index]}</span>
      <span class="bar-track"><span class="bar-fill" style="--value:${Math.min(100, (value / max) * 100)}%"></span></span>
      <span>${value}</span>
    </div>
  `).join("")}</div>`;
}

function tagCounts() {
  return state.entries.flatMap((entry) => entry.tags || []).reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
}

function tagBars() {
  const counts = tagCounts();
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (!rows.length) return `<div class="empty-state">아직 피드백 태그가 없습니다.</div>`;
  const max = Math.max(...rows.map((row) => row[1]));
  return `<div class="bar-list">${rows.map(([tag, count]) => `
    <div class="bar-item">
      <span>${tag}</span>
      <span class="bar-track"><span class="bar-fill" style="--value:${(count / max) * 100}%"></span></span>
      <span>${count}</span>
    </div>
  `).join("")}</div>`;
}

function topTag() {
  const rows = Object.entries(tagCounts()).sort((a, b) => b[1] - a[1]);
  return rows[0]?.[0] || "미분류";
}

function toast(message) {
  document.querySelector(".toast")?.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.remove(), 2600);
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `x10-training-data-${todayIso()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

window.addEventListener("hashchange", () => {
  route = location.hash.replace("#", "") || "dashboard";
  renderApp();
});

document.querySelector("#exportBtn").addEventListener("click", exportData);
renderApp();
