/* =========================================================
   MARKET PULSE — App Logic
   ========================================================= */

(function() {
  'use strict';

  let currentQuery = '경제';
  let isLoading = false;

  // ============================================================
  // 기업 키워드 사전 (이름 → 종목코드)
  // ============================================================
  const COMPANY_MAP = [
    { keywords: ['삼성전자'],              name: '삼성전자',      code: '005930' },
    { keywords: ['SK하이닉스', 'SK 하이닉스'], name: 'SK하이닉스',   code: '000660' },
    { keywords: ['LG에너지솔루션', 'LG엔솔'], name: 'LG에너지솔루션', code: '373220' },
    { keywords: ['현대자동차', '현대차'],    name: '현대자동차',    code: '005380' },
    { keywords: ['기아'],                  name: '기아',          code: '000270' },
    { keywords: ['POSCO홀딩스', '포스코'],  name: 'POSCO홀딩스',   code: '005490' },
    { keywords: ['카카오'],                name: '카카오',        code: '035720' },
    { keywords: ['네이버', 'NAVER'],        name: '네이버',        code: '035420' },
    { keywords: ['셀트리온'],              name: '셀트리온',      code: '068270' },
    { keywords: ['KB금융', 'KB국민은행'],   name: 'KB금융',        code: '105560' },
    { keywords: ['신한지주', '신한은행', '신한금융'], name: '신한지주', code: '055550' },
    { keywords: ['하나금융', '하나은행'],   name: '하나금융',      code: '086790' },
    { keywords: ['우리금융', '우리은행'],   name: '우리금융',      code: '316140' },
    { keywords: ['LG화학'],                name: 'LG화학',        code: '051910' },
    { keywords: ['삼성SDI'],               name: '삼성SDI',       code: '006400' },
    { keywords: ['LG전자'],                name: 'LG전자',        code: '066570' },
    { keywords: ['현대모비스'],            name: '현대모비스',    code: '012330' },
    { keywords: ['삼성바이오로직스', '삼바'], name: '삼성바이오',   code: '207940' },
    { keywords: ['삼성물산'],              name: '삼성물산',      code: '028260' },
    { keywords: ['삼성생명'],              name: '삼성생명',      code: '032830' },
    { keywords: ['삼성화재'],              name: '삼성화재',      code: '000810' },
    { keywords: ['SK이노베이션', 'SK온'],   name: 'SK이노베이션',  code: '096770' },
    { keywords: ['SK텔레콤', 'SKT'],        name: 'SK텔레콤',      code: '017670' },
    { keywords: ['KT'],                    name: 'KT',            code: '030200' },
    { keywords: ['에코프로비엠'],          name: '에코프로비엠',  code: '247540' },
    { keywords: ['에코프로'],              name: '에코프로',      code: '086520' },
    { keywords: ['포스코퓨처엠'],          name: '포스코퓨처엠',  code: '003670' },
    { keywords: ['한화에어로스페이스', '한화에어로'], name: '한화에어로', code: '012450' },
    { keywords: ['HD현대중공업', '현대중공업'], name: 'HD현대중공업', code: '329180' },
    { keywords: ['두산에너빌리티'],        name: '두산에너빌리티', code: '034020' },
    { keywords: ['한국전력', '한전'],       name: '한국전력',      code: '015760' },
    { keywords: ['HMM'],                   name: 'HMM',           code: '011200' },
    { keywords: ['아모레퍼시픽'],          name: '아모레퍼시픽',  code: '090430' },
    { keywords: ['CJ제일제당'],            name: 'CJ제일제당',    code: '097950' },
    { keywords: ['LG그룹', 'LG'],          name: 'LG',            code: '003550' },
    { keywords: ['롯데케미칼'],            name: '롯데케미칼',    code: '011170' },
    { keywords: ['기업은행', 'IBK'],        name: '기업은행',      code: '024110' },
    { keywords: ['카카오뱅크'],            name: '카카오뱅크',    code: '323410' },
    { keywords: ['카카오페이'],            name: '카카오페이',    code: '377300' },
    { keywords: ['크래프톤'],              name: '크래프톤',      code: '259960' },
    { keywords: ['엔씨소프트', '엔씨'],     name: '엔씨소프트',    code: '036570' },
    { keywords: ['현대해상'],              name: '현대해상',      code: '001450' },
    { keywords: ['한국항공우주', 'KAI'],    name: '한국항공우주',  code: '047810' },
  ];

  // ============================================================
  // 뉴스에서 관련 기업 추출
  // ============================================================
  function extractCompanies(items) {
    const texts = items.map(item =>
      stripHtml(item.title) + ' ' + stripHtml(item.description)
    );

    const matched = [];
    COMPANY_MAP.forEach(company => {
      let count = 0;
      texts.forEach(t => {
        if (company.keywords.some(kw => t.includes(kw))) count++;
      });
      if (count > 0) matched.push({ ...company, count });
    });

    return matched.sort((a, b) => b.count - a.count).slice(0, 10);
  }

  // ============================================================
  // 관련 기업 렌더링
  // ============================================================
  function renderCompanies(companies) {
    const section = document.getElementById('companySection');
    const list = document.getElementById('companyList');
    const countEl = document.getElementById('companyCount');

    if (!companies.length) {
      section.style.display = 'none';
      return;
    }

    list.innerHTML = companies.map((c, i) => `
      <a class="company-chip"
         href="https://finance.naver.com/item/main.naver?code=${c.code}"
         target="_blank"
         rel="noopener"
         style="animation-delay: ${i * 40}ms">
        <span class="chip-name">${c.name}</span>
        <span class="chip-count">${c.count}</span>
      </a>
    `).join('');

    countEl.textContent = `${companies.length} STOCKS`;
    section.style.display = 'block';
  }

  // ============================================================
  // 날짜 표시
  // ============================================================
  function updateDateLabels() {
    const now = new Date();
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const days = ['일','월','화','수','목','금','토'];

    const m = months[now.getMonth()];
    const d = String(now.getDate()).padStart(2, '0');
    const y = now.getFullYear();
    const dayName = days[now.getDay()];

    document.getElementById('heroDate').textContent = `${m} ${d}, ${y}`;

    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('updateTime').textContent = `${dayName}요일 · ${hh}:${mm}`;
  }

  // ============================================================
  // 시간 포맷
  // ============================================================
  function formatRelativeTime(pubDate) {
    try {
      const d = new Date(pubDate);
      const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);

      if (diffMin < 1) return '방금';
      if (diffMin < 60) return `${diffMin}분 전`;
      if (diffMin < 1440) return `${Math.floor(diffMin/60)}시간 전`;
      return `${Math.floor(diffMin/1440)}일 전`;
    } catch {
      return '';
    }
  }

  // ============================================================
  // HTML 엔티티 제거
  // ============================================================
  function stripHtml(s) {
    if (!s) return '';
    return s
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  // ============================================================
  // 출처 추출
  // ============================================================
  function extractSource(item) {
    try {
      const url = item.originallink || item.link;
      if (!url) return 'NEWS';
      const hostname = new URL(url).hostname.replace('www.', '');
      const parts = hostname.split('.');

      // 한국 언론사 매핑
      const sourceMap = {
        'mk': '매경',
        'hankyung': '한경',
        'chosun': '조선',
        'donga': '동아',
        'joongang': '중앙',
        'hani': '한겨레',
        'khan': '경향',
        'yna': '연합',
        'yonhapnews': '연합',
        'mt': '머투',
        'edaily': '이데일리',
        'sedaily': '서경',
        'fnnews': '파이낸셜',
        'newsis': '뉴시스',
        'news1': '뉴스1',
        'kbs': 'KBS',
        'mbc': 'MBC',
        'sbs': 'SBS',
        'ytn': 'YTN',
        'jtbc': 'JTBC',
        'chosunbiz': '조선비즈',
        'biz': '비즈',
        'asiae': '아경',
        'asiatoday': '아투'
      };

      const key = parts[0];
      return sourceMap[key] || key.toUpperCase().slice(0, 6);
    } catch {
      return 'NEWS';
    }
  }

  // ============================================================
  // 스켈레톤 표시
  // ============================================================
  function showSkeleton() {
    document.getElementById('companySection').style.display = 'none';
    const list = document.getElementById('newsList');
    let html = '';
    for (let i = 0; i < 5; i++) {
      html += `
        <div class="skeleton-item">
          <div class="skel-row">
            <div class="skel-pill"></div>
            <div class="skel-text short"></div>
          </div>
          <div class="skel-text title"></div>
          <div class="skel-text title2"></div>
          <div class="skel-text desc"></div>
        </div>`;
    }
    list.innerHTML = html;
    document.getElementById('sectionCount').textContent = '로딩 중';
  }

  // ============================================================
  // 에러 상태 표시
  // ============================================================
  function showError(title, desc) {
    const list = document.getElementById('newsList');
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon error"><i class="ti ti-alert-triangle"></i></div>
        <div class="empty-title">${title}</div>
        <div class="empty-desc">${desc}</div>
      </div>`;
    document.getElementById('sectionCount').textContent = 'ERROR';
  }

  // ============================================================
  // 뉴스 렌더링
  // ============================================================
  function renderNews(items) {
    const list = document.getElementById('newsList');

    if (!items || items.length === 0) {
      showError('뉴스가 없습니다', '잠시 후 다시 시도해주세요');
      return;
    }

    let html = '';
    items.forEach((item, i) => {
      const title = stripHtml(item.title);
      const desc = stripHtml(item.description);
      const source = extractSource(item);
      const time = formatRelativeTime(item.pubDate);
      const link = item.originallink || item.link;

      html += `
        <article class="news-item" data-link="${link}" style="animation-delay: ${i * 40}ms">
          <div class="news-meta-row">
            <span class="news-rank">${String(i + 1).padStart(2, '0')}</span>
            <span class="news-source">${source}</span>
            <span class="news-time">
              <i class="ti ti-clock"></i>
              ${time}
            </span>
          </div>
          <h2 class="news-title">${title}</h2>
          <p class="news-desc">${desc}</p>
        </article>
      `;
    });

    list.innerHTML = html;
    document.getElementById('sectionCount').textContent = `${items.length} ARTICLES`;

    // 관련 기업 추출 및 렌더링
    renderCompanies(extractCompanies(items));

    // 클릭 이벤트
    list.querySelectorAll('.news-item').forEach(el => {
      el.addEventListener('click', () => {
        const link = el.dataset.link;
        if (link) window.open(link, '_blank');
      });
    });

    // 티커 업데이트 (헤드라인을 흘려보내기)
    updateTicker(items);
  }

  // ============================================================
  // 티커 업데이트
  // ============================================================
  function updateTicker(items) {
    const ticker = document.getElementById('ticker');
    const titles = items.slice(0, 8).map(item => {
      const t = stripHtml(item.title);
      return `<span class="ticker-item"><span class="symbol">●</span> ${t.slice(0, 40)}</span>`;
    });
    // 두 번 반복해서 무한 스크롤 효과
    ticker.innerHTML = (titles.join('') + titles.join(''));
  }

  // ============================================================
  // 뉴스 가져오기
  // ============================================================
  async function fetchNews(query = currentQuery) {
    if (isLoading) return;
    isLoading = true;

    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.classList.add('spinning');

    showSkeleton();

    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(query)}&display=15&sort=date`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 500 && errData.error?.includes('환경변수')) {
          showError(
            '환경변수 설정 필요',
            'Vercel 대시보드에서 <code>NAVER_CLIENT_ID</code>와 <code>NAVER_CLIENT_SECRET</code>을 추가해주세요.'
          );
          return;
        }
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      renderNews(data.items);

    } catch (err) {
      console.error('Fetch error:', err);
      showError('연결 실패', err.message || '네트워크를 확인해주세요');
    } finally {
      isLoading = false;
      setTimeout(() => refreshBtn.classList.remove('spinning'), 400);
    }
  }

  // ============================================================
  // 탭 이벤트
  // ============================================================
  function setupTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentQuery = tab.dataset.query;
        fetchNews(currentQuery);
      });
    });
  }

  // ============================================================
  // 초기화
  // ============================================================
  function init() {
    updateDateLabels();
    setInterval(updateDateLabels, 60000); // 1분마다 시간 갱신
    setupTabs();

    document.getElementById('refreshBtn').addEventListener('click', () => {
      fetchNews(currentQuery);
    });

    // 첫 로드
    fetchNews();

    // 5분마다 자동 새로고침
    setInterval(() => fetchNews(currentQuery), 5 * 60 * 1000);

    // PWA 다시 활성화 시 새로고침
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        fetchNews(currentQuery);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

  // ============================================================
  // 출처 추출
  // ============================================================
  function extractSource(item) {
    try {
      const url = item.originallink || item.link;
      if (!url) return 'NEWS';
      const hostname = new URL(url).hostname.replace('www.', '');
      const parts = hostname.split('.');

      // 한국 언론사 매핑
      const sourceMap = {
        'mk': '매경',
        'hankyung': '한경',
        'chosun': '조선',
        'donga': '동아',
        'joongang': '중앙',
        'hani': '한겨레',
        'khan': '경향',
        'yna': '연합',
        'yonhapnews': '연합',
        'mt': '머투',
        'edaily': '이데일리',
        'sedaily': '서경',
        'fnnews': '파이낸셜',
        'newsis': '뉴시스',
        'news1': '뉴스1',
        'kbs': 'KBS',
        'mbc': 'MBC',
        'sbs': 'SBS',
        'ytn': 'YTN',
        'jtbc': 'JTBC',
        'chosunbiz': '조선비즈',
        'biz': '비즈',
        'asiae': '아경',
        'asiatoday': '아투'
      };

      const key = parts[0];
      return sourceMap[key] || key.toUpperCase().slice(0, 6);
    } catch {
      return 'NEWS';
    }
  }

  // ============================================================
  // 스켈레톤 표시
  // ============================================================
  function showSkeleton() {
    const list = document.getElementById('newsList');
    let html = '';
    for (let i = 0; i < 5; i++) {
      html += `
        <div class="skeleton-item">
          <div class="skel-row">
            <div class="skel-pill"></div>
            <div class="skel-text short"></div>
          </div>
          <div class="skel-text title"></div>
          <div class="skel-text title2"></div>
          <div class="skel-text desc"></div>
        </div>`;
    }
    list.innerHTML = html;
    document.getElementById('sectionCount').textContent = '로딩 중';
  }

  // ============================================================
  // 에러 상태 표시
  // ============================================================
  function showError(title, desc) {
    const list = document.getElementById('newsList');
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon error"><i class="ti ti-alert-triangle"></i></div>
        <div class="empty-title">${title}</div>
        <div class="empty-desc">${desc}</div>
      </div>`;
    document.getElementById('sectionCount').textContent = 'ERROR';
  }

  // ============================================================
  // 뉴스 렌더링
  // ============================================================
  function renderNews(items) {
    const list = document.getElementById('newsList');

    if (!items || items.length === 0) {
      showError('뉴스가 없습니다', '잠시 후 다시 시도해주세요');
      return;
    }

    let html = '';
    items.forEach((item, i) => {
      const title = stripHtml(item.title);
      const desc = stripHtml(item.description);
      const source = extractSource(item);
      const time = formatRelativeTime(item.pubDate);
      const link = item.originallink || item.link;

      html += `
        <article class="news-item" data-link="${link}" style="animation-delay: ${i * 40}ms">
          <div class="news-meta-row">
            <span class="news-rank">${String(i + 1).padStart(2, '0')}</span>
            <span class="news-source">${source}</span>
            <span class="news-time">
              <i class="ti ti-clock"></i>
              ${time}
            </span>
          </div>
          <h2 class="news-title">${title}</h2>
          <p class="news-desc">${desc}</p>
        </article>
      `;
    });

    list.innerHTML = html;
    document.getElementById('sectionCount').textContent = `${items.length} ARTICLES`;

    // 클릭 이벤트
    list.querySelectorAll('.news-item').forEach(el => {
      el.addEventListener('click', () => {
        const link = el.dataset.link;
        if (link) window.open(link, '_blank');
      });
    });

    // 티커 업데이트 (헤드라인을 흘려보내기)
    updateTicker(items);
  }

  // ============================================================
  // 티커 업데이트
  // ============================================================
  function updateTicker(items) {
    const ticker = document.getElementById('ticker');
    const titles = items.slice(0, 8).map(item => {
      const t = stripHtml(item.title);
      return `<span class="ticker-item"><span class="symbol">●</span> ${t.slice(0, 40)}</span>`;
    });
    // 두 번 반복해서 무한 스크롤 효과
    ticker.innerHTML = (titles.join('') + titles.join(''));
  }

  // ============================================================
  // 뉴스 가져오기
  // ============================================================
  async function fetchNews(query = currentQuery) {
    if (isLoading) return;
    isLoading = true;

    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.classList.add('spinning');

    showSkeleton();

    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(query)}&display=15&sort=date`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 500 && errData.error?.includes('환경변수')) {
          showError(
            '환경변수 설정 필요',
            'Vercel 대시보드에서 <code>NAVER_CLIENT_ID</code>와 <code>NAVER_CLIENT_SECRET</code>을 추가해주세요.'
          );
          return;
        }
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      renderNews(data.items);

    } catch (err) {
      console.error('Fetch error:', err);
      showError('연결 실패', err.message || '네트워크를 확인해주세요');
    } finally {
      isLoading = false;
      setTimeout(() => refreshBtn.classList.remove('spinning'), 400);
    }
  }

  // ============================================================
  // 탭 이벤트
  // ============================================================
  function setupTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentQuery = tab.dataset.query;
        fetchNews(currentQuery);
      });
    });
  }

  // ============================================================
  // 초기화
  // ============================================================
  function init() {
    updateDateLabels();
    setInterval(updateDateLabels, 60000); // 1분마다 시간 갱신
    setupTabs();

    document.getElementById('refreshBtn').addEventListener('click', () => {
      fetchNews(currentQuery);
    });

    // 첫 로드
    fetchNews();

    // 5분마다 자동 새로고침
    setInterval(() => fetchNews(currentQuery), 5 * 60 * 1000);

    // PWA 다시 활성화 시 새로고침
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        fetchNews(currentQuery);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
