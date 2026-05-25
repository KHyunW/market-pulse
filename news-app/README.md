# 📈 마켓펄스 (Market Pulse)

매일 오전 8:40 기준 실시간 경제 헤드라인을 보여주는 나만의 아이폰 PWA 앱.

![preview](https://via.placeholder.com/400x800/0A0A0A/00E88F?text=Market+Pulse)

## ✨ 기능

- 🔴 네이버 검색 API로 **실시간 경제 뉴스** 가져오기
- 📱 아이폰 홈화면에 추가하면 **진짜 앱처럼** 작동 (PWA)
- 🏷️ 카테고리별 탭 (전체/증시/환율/부동산/기업/글로벌)
- ⏱️ 자동 새로고침 (5분마다)
- 🎨 다크 모드 + 네온 그린 액센트 디자인

---

## 🚀 배포 가이드 (15분이면 끝)

### Step 1. 네이버 API 키 발급 (3분)

1. https://developers.naver.com/apps/#/register 접속
2. 네이버 로그인
3. 입력 항목:
   - **애플리케이션 이름**: `마켓펄스` (자유)
   - **사용 API**: `검색` 선택
   - **비로그인 오픈 API 서비스 환경**: `WEB 설정` 선택
   - **웹 서비스 URL**: `http://localhost:3000` (나중에 Vercel URL로 수정 가능)
4. 등록 완료 → **Client ID**와 **Client Secret** 복사해두기

---

### Step 2. GitHub에 코드 올리기 (5분)

1. https://github.com 가입 (이미 계정 있으면 생략)
2. 우측 상단 `+` → **New repository** → 이름 `market-pulse` → Create
3. 컴퓨터에서 이 폴더 통째로 GitHub에 업로드
   - GitHub Desktop 앱을 쓰면 가장 쉬움: https://desktop.github.com
   - 또는 GitHub 페이지에서 "uploading an existing file" 클릭 후 드래그앤드롭

---

### Step 3. Vercel 배포 (5분)

1. https://vercel.com 접속 → **Sign up with GitHub**
2. 대시보드에서 **Add New → Project** 클릭
3. 방금 만든 `market-pulse` 저장소 선택 → **Import**
4. **Environment Variables** 섹션에서 추가:
   ```
   NAVER_CLIENT_ID      = (Step 1에서 받은 Client ID)
   NAVER_CLIENT_SECRET  = (Step 1에서 받은 Client Secret)
   ```
5. **Deploy** 클릭 → 2분 대기
6. 완료되면 `https://market-pulse-xxx.vercel.app` 같은 URL이 나옴

---

### Step 4. 아이폰 홈화면에 추가 (1분)

1. 아이폰 **Safari**로 위 Vercel URL 접속
2. 하단 **공유 버튼** (□↑) 탭
3. **"홈 화면에 추가"** 선택
4. 완료! 홈화면에서 앱처럼 사용 가능 🎉

---

## 📁 파일 구조

```
market-pulse/
├── api/
│   └── news.js              # Vercel 서버리스 함수 (네이버 API 프록시)
├── public/
│   ├── index.html           # 메인 HTML
│   ├── style.css            # 스타일
│   ├── app.js               # 앱 로직
│   └── manifest.json        # PWA 설정
├── vercel.json              # Vercel 배포 설정
├── package.json
└── README.md
```

---

## 🔧 커스터마이징

### 카테고리 추가/변경

`public/index.html` 의 `<nav class="tabs">` 부분에서 수정:

```html
<button class="tab" data-query="검색어">표시이름</button>
```

### 색상 변경

`public/style.css` 의 `:root` 변수 수정:

```css
--accent: #00E88F;  /* 네온 그린 → 원하는 색으로 */
```

### 마감 시간 표시 변경

`public/index.html` 의 `<span id="cutoffTime">` 부분 수정.

---

## 💡 트러블슈팅

**"환경변수 설정 필요" 에러가 떠요**
- Vercel 대시보드 → 프로젝트 → Settings → Environment Variables 확인
- 추가 후 반드시 **Redeploy** 한 번 더 해야 적용됨

**뉴스가 영어로만 나와요**
- 카테고리 탭의 `data-query` 값이 한국어인지 확인

**아이폰에서 홈화면 추가 메뉴가 안 보여요**
- 반드시 **Safari** 브라우저로 접속 (크롬 ❌)

---

## 🔒 보안

- API 키는 Vercel 환경변수에 안전하게 보관됨 (코드에 노출 안됨)
- 프론트엔드에서 키를 절대 볼 수 없는 구조
- Vercel Edge Cache로 5분 캐싱 → API 호출 절약

---

Made with ❤️
