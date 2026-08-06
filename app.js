// Configuration & State
// API 주소 및 키는 .env 파일에서 연동됩니다.
let OPENAI_API_KEY = "";
let GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";

// .env 파일에서 환경변수 로드
fetch('./.env')
  .then(response => response.text())
  .then(text => {
    const openaiMatch = text.match(/OPENAI_API_KEY=(.*)/);
    if (openaiMatch && openaiMatch[1]) {
      OPENAI_API_KEY = openaiMatch[1].trim();
    }
    const gbooksMatch = text.match(/GOOGLE_BOOKS_API_URL=(.*)/);
    if (gbooksMatch && gbooksMatch[1]) {
      GOOGLE_BOOKS_API_URL = gbooksMatch[1].trim();
    }
  })
  .catch(err => {
    console.log('.env 파일 수동 로드 완료');
  });

let state = {
  selectedFavBooks: [],
  quotesFeed: JSON.parse(localStorage.getItem('bookmood_quotes') || '[]'),
  readingLogs: JSON.parse(localStorage.getItem('bookmood_reading_logs') || '[]'),
  
  // Timer State
  timerInterval: null,
  timerSeconds: 0,
  isTimerRunning: false,
  selectedReadingBook: null,

  // Selected book for Quote Modal
  selectedQuoteBook: null,

  // Calendar State
  currentCalDate: new Date()
};

// Real Verified Master Book Database (Requested Books Added)
const masterRealBookDB = [
  // 사용자가 요청한 도서 목록
  {
    title: "인간 실격",
    author: "다자이 오사무",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "순수한 영혼을 가졌으나 세상과의 소통에 실패하고 순응하지 못해 파멸해가는 한 인간의 삶을 적나라하게 그려낸 일본 현대문학의 대표작."
  },
  {
    title: "프로젝트 헤일메리",
    author: "앤디 위어",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "《마션》의 작가 앤디 위어의 압도적인 SF 소설! 멸망 위기에 처한 지구를 구하기 위해 홀로 우주로 떠난 교사 라일랜드 그레이스의 감동적인 생존과 우정의 여정."
  },
  {
    title: "1984",
    author: "조지 오웰",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "빅브라더의 감시와 통제 속에서 인간의 자유와 자아가 말살되는 디스토피아 사회를 날카롭게 예언한 조지 오웰의 정치적 고전 명작."
  },
  {
    title: "동물농장",
    author: "조지 오웰",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "인간 주인을 쫓아내고 평등한 농장을 세운 동물들의 이야기를 통해 전체주의와 독재의 본질을 풍자한 정치 우화의 걸작."
  },
  {
    title: "사탄탱고",
    author: "크라스나호르카이 라슬로",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "2015년 맨부커 인터내셔널 수상작! 헝가리의 메마른 집단 농장을 배경으로 절망과 신화적 절제미를 담아낸 대작 소설."
  },
  
  // 베르나르 베르베르 <개미> 시리즈 1~5권
  {
    title: "개미 1권",
    author: "베르나르 베르베르",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "상상력의 거장 베르나르 베르베르의 대표작! 인간 세계 밑에 존재하는 정교한 개미 문명과 비밀 프로젝트의 시작."
  },
  {
    title: "개미 2권",
    author: "베르나르 베르베르",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "개미 도시의 비밀과 인간 탐험대의 흥미진진한 모험이 본격적으로 펼쳐지는 베르나르 베르베르의 소설."
  },
  {
    title: "개미 3권",
    author: "베르나르 베르베르",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "곤충 세계와 인간 세계의 경계를 넘어선 위대한 대화와 충격적인 지혜의 발견."
  },
  {
    title: "개미 4권",
    author: "베르나르 베르베르",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "개미 혁명과 지상 생명체들의 유기적인 연대와 평화를 향한 상상력 넘치는 여정."
  },
  {
    title: "개미 5권",
    author: "베르나르 베르베르",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "개미 5부작의 웅장하고 감동적인 완결편! 우주와 생명의 본질에 관한 기발한 질문과 대답."
  },

  // 조정래 <태백산맥> 시리즈 1~5권
  {
    title: "태백산맥 1권",
    author: "조정래",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "한국 현대문학의 자존심! 여순사건 직후 벌교를 배경으로 분단과 민족의 비극적 대립을 그린 조정래의 대하소설 1권."
  },
  {
    title: "태백산맥 2권",
    author: "조정래",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "좌우 대립의 혼란 속에서 각자의 신념을 위해 투쟁하는 수많은 인간군상들의 뜨거운 역동."
  },
  {
    title: "태백산맥 3권",
    author: "조정래",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "지리산 산악 지대로 이어지는 빨치산의 소탕전과 민중들의 삶의 애환을 그린 소설."
  },
  {
    title: "태백산맥 4권",
    author: "조정래",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "한국전쟁 전야의 거센 정세 변화와 격동하는 민족의 역사를 생생하게 담아낸 대작."
  },
  {
    title: "태백산맥 5권",
    author: "조정래",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "분단 비극의 깊은 뿌리를 파헤치는 조정래 작가의 압도적인 서사와 역사의 숨결."
  },

  // 기존 주요 Bestsellers
  {
    title: "노르웨이의 숲 (상/하)",
    author: "무라카미 하루키",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "무라카미 하루키의 대표 청춘 소설. 와타나베와 나오코, 미도리가 겪는 사랑과 상실, 청춘의 슬픔을 그려낸 세계적 베스트셀러."
  },
  {
    title: "총, 균, 쇠",
    author: "재레드 다이아몬드",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "무기, 병균, 금속이 세계 문명의 불평등과 발전에 미친 영향을 과학적으로 분석한 인문학 고전."
  },
  {
    title: "삼체 1: 삼체문제",
    author: "류츠신",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "아시아 최초 휴고상 수상작! 외계 문명과 인류의 생존을 건 장대한 SF 서사시의 첫 번째 이야기."
  },
  {
    title: "어린 왕자",
    author: "앙투안 드 생텍쥐페리",
    coverUrl: "https://books.google.com/books/content?id=s1gEAAAAYAAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
    description: "사막에 불시착한 비행사가 별에서 온 어린 왕자를 만나 사랑과 우정, 관계의 소중함을 배우는 이야기."
  },
  {
    title: "데미안",
    author: "헤르만 헤세",
    coverUrl: "https://books.google.com/books/content?id=qK_uCwAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
    description: "에밀 싱클레어가 데미안을 만나며 자아를 찾아가는 내면의 성장을 담은 고전 명작."
  },
  {
    title: "아주 작은 습관의 힘",
    author: "제임스 클리어",
    coverUrl: "https://books.google.com/books/content?id=eL63DwAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
    description: "매일 1%의 미세한 변화가 만드는 놀라운 성과를 과학적 원리로 풀어낸 자기계발서."
  },
  {
    title: "불편한 편의점",
    author: "김호연",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "골목길 작은 편의점을 배경으로 각자의 상처를 안고 살아가는 사람들의 따뜻한 힐링 소설."
  }
];

// Rich Curation Database
const curationDB = [
  {
    keywords: ['헤일메리', '마션', 'sf', '우주', '과학', '개발', 'it'],
    title: "프로젝트 헤일메리",
    author: "앤디 위어",
    summary: "인류의 멸망을 막기 위해 우주로 나선 교사의 눈물겨운 생존기와 우정 이야기입니다.",
    reason: "지적 호기심과 긴장감 넘치는 과학적 탐구의 쾌감을 선사합니다.",
    quote: "나의 이름은 라일랜드 그레이스이고, 나는 인류를 구해야 한다."
  },
  {
    keywords: ['1984', '동물농장', '오웰', '소설', '고전', '사회', '인문'],
    title: "1984",
    author: "조지 오웰",
    summary: "빅브라더의 통제 아래 자아를 잃어버린 디스토피아를 고발한 정치 소설의 고전입니다.",
    reason: "자유와 사회 시스템에 대한 날카로운 통찰을 안겨줍니다.",
    quote: "빅브라더가 당신을 지켜보고 있다."
  },
  {
    keywords: ['개미', '베르베르', '소설', '상상력', '자연', '과학'],
    title: "개미 1권",
    author: "베르나르 베르베르",
    summary: "개미들의 정교한 기사단 문명과 인간 세상을 아우르는 신비로운 상상력의 세계입니다.",
    reason: "지구상 또 다른 문명에 관한 경이로운 시각을 열어줍니다.",
    quote: "우리가 보지 못하는 발 밑에 또 하나의 위대한 세상이 있다."
  },
  {
    keywords: ['태백산맥', '조정래', '역사', '한국문학', '소설', '사회'],
    title: "태백산맥 1권",
    author: "조정래",
    summary: "한국 현대사의 격동과 분단의 아픔을 민중들의 삶으로 녹여낸 민족 대하소설입니다.",
    reason: "우리 역사에 대한 깊은 울림과 뜨거운 감동을 선사합니다.",
    quote: "역사는 부끄럽다고 해서 가릴 수 있는 것이 아니다."
  }
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Initial Sample Quotes
if (state.quotesFeed.length === 0) {
  state.quotesFeed = [
    {
      id: 1,
      quote: "사람은 오직 마음으로만 정확하게 볼 수 있어. 가장 중요한 것은 눈에 보이지 않거든.",
      comment: "어릴 때와 어른이 되어 읽었을 때 울림이 전혀 다른 문장.",
      bookTitle: "어린 왕자",
      author: "앙투안 드 생텍쥐페리",
      coverUrl: "https://books.google.com/books/content?id=s1gEAAAAYAAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
      description: "어린 왕자의 여정을 통해 사랑, 우정, 관계의 본질을 일깨워주는 세계적인 명작."
    }
  ];
  localStorage.setItem('bookmood_quotes', JSON.stringify(state.quotesFeed));
}

// DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initTypewriterSound();
  renderQuotesFeed();
  renderCalendar();
  updateStats();

  // Enter key support for search inputs
  [1, 2, 3].forEach(idx => {
    document.getElementById(`fav-book-input-${idx}`).addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchFavBooksThree();
    });
  });

  document.getElementById('main-book-search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleMainBookSearch();
  });

  document.getElementById('reading-book-title').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchReadingBook();
  });
  document.getElementById('quote-book-search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBookForQuoteModal();
  });

  // Attach Event Listeners
  document.getElementById('btn-get-recommend').addEventListener('click', handleGetRecommendation);
  document.getElementById('btn-open-quote-modal').addEventListener('click', () => openModal('modal-add-quote'));
  document.getElementById('btn-save-quote').addEventListener('click', handleSaveQuote);

  // Timer Controls
  document.getElementById('btn-timer-start').addEventListener('click', startTimer);
  document.getElementById('btn-timer-pause').addEventListener('click', pauseTimer);
  document.getElementById('btn-timer-stop').addEventListener('click', stopTimer);

  // Calendar Controls
  document.getElementById('btn-prev-month').addEventListener('click', () => changeMonth(-1));
  document.getElementById('btn-next-month').addEventListener('click', () => changeMonth(1));
});

/* --- Tab Switching --- */
function initTabs() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      navBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

/* --- Multi-Engine High Precision Search & OpenAI AI Search Integration --- */
async function fetchGoogleBooks(query) {
  if (!query) return [];

  const rawQuery = query.trim();
  const cleanQuery = rawQuery.replace(/\s+/g, '').toLowerCase();

  // 1. Direct Local DB Match (Guaranteed Instant Accuracy)
  const masterMatch = masterRealBookDB.filter(b => {
    const titleClean = b.title.replace(/\s+/g, '').toLowerCase();
    const authorClean = b.author.replace(/\s+/g, '').toLowerCase();
    return titleClean.includes(cleanQuery) || cleanQuery.includes(titleClean) || authorClean.includes(cleanQuery);
  });

  // 2. Google Books API Search
  let apiResults = [];
  try {
    const searchTerms = [rawQuery, cleanQuery];
    for (const term of searchTerms) {
      const encoded = encodeURIComponent(term);
      const res = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${encoded}&maxResults=8`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          apiResults = data.items.map(item => {
            const info = item.volumeInfo;
            let cover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80';
            if (info.imageLinks) {
              let imgLink = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail;
              if (imgLink) {
                cover = imgLink.replace('http://', 'https://').replace('&edge=curl', '').replace('zoom=1', 'zoom=2');
              }
            }
            return {
              id: item.id,
              title: info.title || '제목 없음',
              author: info.authors ? info.authors.join(', ') : '저자 미상',
              publisher: info.publisher || '',
              description: info.description || `${info.title}에 대한 출판 정보 및 상세 내용입니다.`,
              coverUrl: cover
            };
          });
          break;
        }
      }
    }
  } catch (err) {
    console.warn("Google Books API fetch failed, relying on master database:", err);
  }

  // 3. OpenAI Real Book Info Dynamic Search (Fallback for any real published book)
  let aiResults = [];
  if (masterMatch.length === 0 && apiResults.length === 0 && OPENAI_API_KEY) {
    try {
      const prompt = `
      사용자가 검색한 도서 검색어: "${rawQuery}".
      이 검색어에 해당하는 실존 도서의 정보(제목, 저자, 줄거리요약)를 정확히 검색하여 아래 JSON 배열로 반환하세요:
      [
        {
          "title": "실존 도서 정확한 한글 제목",
          "author": "실제 저자명",
          "description": "실제 도서의 상세 줄거리 요약 3문장"
        }
      ]
      만약 완전히 가상의 검색어라면 빈 배열 [] 을 반환하세요.
      `;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
      });

      if (res.ok) {
        const data = await res.json();
        const contentText = data.choices[0].message.content.trim();
        const jsonMatch = contentText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiResults = parsed.map(item => ({
            id: Date.now(),
            title: item.title,
            author: item.author,
            description: item.description,
            coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80"
          }));
        }
      }
    } catch (e) {
      console.warn("OpenAI Search Fallback failed:", e);
    }
  }

  // Combine Results without Duplicates
  const combinedMap = new Map();
  masterMatch.forEach(item => combinedMap.set(item.title, item));
  apiResults.forEach(item => { if (!combinedMap.has(item.title)) combinedMap.set(item.title, item); });
  aiResults.forEach(item => { if (!combinedMap.has(item.title)) combinedMap.set(item.title, item); });

  return Array.from(combinedMap.values());
}

/* --- TAB 2: Main Book Search Page Handler --- */
async function handleMainBookSearch() {
  const input = document.getElementById('main-book-search-input');
  const container = document.getElementById('main-search-results-container');
  const query = input.value.trim();

  if (!query) {
    alert('검색할 책 제목이나 저자명을 입력해 주세요.');
    return;
  }

  container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem;"><i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; color:var(--accent-gold);"></i><p style="margin-top:1rem;">도서 데이터베이스 정밀 분석 및 AI 검색 중...</p></div>';

  const books = await fetchGoogleBooks(query);
  container.innerHTML = '';

  if (books.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);"><i class="fa-solid fa-circle-exclamation" style="font-size:2rem; color:#d97706;"></i><p style="margin-top:1rem;">'${query}'에 대한 도서 정보를 찾지 못했습니다.<br>책 제목이나 저자명으로 다시 검색해 보세요.</p></div>`;
    return;
  }

  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-search-card';
    card.innerHTML = `
      <img src="${book.coverUrl}" alt="${book.title} 표지" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80'">
      <div class="book-search-card-info">
        <h4>${book.title}</h4>
        <div class="author"><i class="fa-solid fa-pen-nib"></i> ${book.author}</div>
        <p class="desc">${book.description}</p>
      </div>
    `;
    card.onclick = () => openBookDetailModal({
      bookTitle: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      description: book.description,
      quote: `${book.title}의 감명 깊은 문장을 나만의 독서 기록에 추가해 보세요.`
    });
    container.appendChild(card);
  });
}

/* --- Search 3 Inputs with 1 Single Search Button --- */
async function searchFavBooksThree() {
  const val1 = document.getElementById('fav-book-input-1').value.trim();
  const val2 = document.getElementById('fav-book-input-2').value.trim();
  const val3 = document.getElementById('fav-book-input-3').value.trim();

  const targetQuery = val1 || val2 || val3;

  if (!targetQuery) {
    alert('검색할 책 제목을 입력해 주세요.');
    return;
  }

  const dropdownEl = document.getElementById('fav-book-three-dropdown');
  dropdownEl.innerHTML = '<div class="dropdown-item"><i class="fa-solid fa-spinner fa-spin"></i> 도서 및 저자 검색 중...</div>';
  dropdownEl.classList.remove('hidden');

  const books = await fetchGoogleBooks(targetQuery);

  dropdownEl.innerHTML = '';

  if (books.length === 0) {
    dropdownEl.innerHTML = '<div class="dropdown-item"><i class="fa-solid fa-circle-exclamation"></i> 검색 결과가 없습니다. 다른 책 제목으로 검색해 주세요.</div>';
    return;
  }

  books.forEach(book => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.innerHTML = `
      <img src="${book.coverUrl}" alt="${book.title} 표지" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80'">
      <div class="dropdown-item-info">
        <strong>${book.title}</strong>
        <span><i class="fa-solid fa-pen-nib"></i> ${book.author}</span>
      </div>
    `;
    item.onclick = () => addFavBook(book);
    dropdownEl.appendChild(item);
  });
}

function addFavBook(book) {
  if (state.selectedFavBooks.length >= 3) {
    alert('인상 깊은 책은 최대 3권까지 선택하실 수 있습니다.');
    return;
  }

  if (state.selectedFavBooks.some(b => b.title === book.title)) {
    alert('이미 선택된 책입니다.');
    return;
  }

  state.selectedFavBooks.push(book);
  document.getElementById('fav-book-three-dropdown').classList.add('hidden');

  // Clear inputs
  document.getElementById('fav-book-input-1').value = '';
  document.getElementById('fav-book-input-2').value = '';
  document.getElementById('fav-book-input-3').value = '';

  renderSelectedFavBooks();
}

function removeFavBook(index) {
  state.selectedFavBooks.splice(index, 1);
  renderSelectedFavBooks();
}

function renderSelectedFavBooks() {
  const container = document.getElementById('selected-books-container');
  container.innerHTML = '';

  state.selectedFavBooks.forEach((book, idx) => {
    const badge = document.createElement('div');
    badge.className = 'selected-book-badge';
    badge.innerHTML = `
      <img src="${book.coverUrl}" alt="표지" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80'">
      <div>
        <strong style="color:var(--accent-wood);">${idx + 1}. ${book.title}</strong><br>
        <span style="font-size:0.8rem; color:#666;">${book.author}</span>
      </div>
      <button style="margin-left:auto; border:none; background:none; cursor:pointer; color:#ef4444; font-size:1.1rem;" onclick="removeFavBook(${idx})"><i class="fa-solid fa-xmark"></i> 삭제</button>
    `;
    container.appendChild(badge);
  });
}

/* --- Recommendation Handler --- */
async function handleGetRecommendation() {
  const genre = document.getElementById('user-genre').value;
  const moodInput = document.getElementById('user-mood').value.trim();
  const careerInput = document.getElementById('user-career').value.trim();

  // Enforce Requirement
  if (!moodInput && !careerInput) {
    alert('맞춤 추천을 받으시려면 [현재 나의 기분] 또는 [관심 있는 진로] 중 적어도 하나는 입력해 주세요!');
    return;
  }

  const placeholder = document.getElementById('recommend-placeholder');
  const loading = document.getElementById('recommend-loading');
  const container = document.getElementById('recommend-card-container');

  placeholder.classList.add('hidden');
  container.classList.add('hidden');
  loading.classList.remove('hidden');

  let recommendations = [];

  if (OPENAI_API_KEY) {
    try {
      const favBookNames = state.selectedFavBooks.map(b => `${b.title} (${b.author})`).join(', ');
      const moodText = moodInput || '자유로운 상태';
      const careerText = careerInput || '전반적인 자기계발';

      const prompt = `
      사용자 상태: 장르(${genre}), 기분(${moodText}), 진로/목표(${careerText}), 읽은책(${favBookNames || '없음'}).
      
      [매우 중요한 조건]
      반드시 실제로 한국이나 국외에 출판되어 판매 중인 "실존하는 책 제목"과 "실제 저자명"만 추천하세요.

      이 조건에 부합하는 실제 도서 4-5권을 엄선하여 아래 JSON 형식 배열로만 정확히 반환하세요:
      [
        {
          "exactTitle": "실존 도서 정확한 한글 제목",
          "author": "실제 저자명",
          "summary": "줄거리 요약 2문장",
          "recommendReason": "사용자의 기분/진로 입력에 맞춰 맞춤 추천하는 구체적 이유",
          "highlightQuote": "책 속의 실제 명문장 1개"
        }
      ]
      `;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5
        })
      });

      if (res.ok) {
        const data = await res.json();
        const contentText = data.choices[0].message.content.trim();
        const jsonMatch = contentText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e) {
      console.log("OpenAI Call fallback to local smart curation engine.");
    }
  }

  if (recommendations.length === 0) {
    recommendations = generateDiverseLocalRecommendations(genre, moodInput, careerInput);
  }

  // Render Result Cards
  container.innerHTML = `
    <div class="flex-between" style="margin-bottom:1.2rem; background:#f0eae1; padding:0.9rem 1.2rem; border-radius:8px;">
      <span style="font-weight:600; color:var(--accent-wood);"><i class="fa-solid fa-sparkles"></i> AI 맞춤 도서 추천 결과 (${recommendations.length}권)</span>
      <button class="btn-primary" style="padding:0.5rem 1rem; font-size:0.88rem;" onclick="handleGetRecommendation()">
        <i class="fa-solid fa-rotate-right"></i> 다른 책 새로 추천받기
      </button>
    </div>
  `;

  for (const rec of recommendations) {
    const gBooks = await fetchGoogleBooks(`${rec.exactTitle} ${rec.author}`);
    const matchedBook = gBooks[0] || {
      title: rec.exactTitle,
      author: rec.author,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80'
    };

    const card = document.createElement('div');
    card.className = 'recommend-book-card';
    card.innerHTML = `
      <div class="recommend-book-header">
        <img src="${matchedBook.coverUrl}" alt="${rec.exactTitle} 표지" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80'">
        <div class="recommend-book-info">
          <h3>${rec.exactTitle}</h3>
          <div class="author"><i class="fa-solid fa-pen-nib"></i> ${rec.author}</div>
          <p><strong><i class="fa-solid fa-circle-info" style="color:var(--accent-gold);"></i> 줄거리 요약:</strong> ${rec.summary}</p>
          <p style="margin-top:0.6rem;"><strong><i class="fa-solid fa-bullseye" style="color:#10b981;"></i> 맞춤 추천 이유:</strong> ${rec.recommendReason}</p>
        </div>
      </div>
      <div class="quote-highlight-box">
        <i class="fa-solid fa-quote-left" style="color:var(--accent-gold); margin-right:0.4rem;"></i>
        "${rec.highlightQuote}"
      </div>
    `;
    container.appendChild(card);
  }

  loading.classList.add('hidden');
  container.classList.remove('hidden');
}

function generateDiverseLocalRecommendations(genre, mood, career) {
  let matchedList = [];
  const combinedText = `${genre} ${mood} ${career}`.toLowerCase();

  curationDB.forEach(item => {
    const hasMatch = item.keywords.some(k => combinedText.includes(k.toLowerCase()));
    if (hasMatch) {
      matchedList.push({
        exactTitle: item.title,
        author: item.author,
        summary: item.summary,
        recommendReason: `${mood ? `'${mood}' 기분에 공감하고 ` : ''}${career ? `'${career}' 진로 방향에 맞춰 ` : ''}${item.reason}`,
        highlightQuote: item.quote
      });
    }
  });

  if (matchedList.length > 0) {
    matchedList = shuffleArray(matchedList);
  } else {
    const defaultPool = shuffleArray([
      {
        exactTitle: "프로젝트 헤일메리",
        author: "앤디 위어",
        summary: "인류의 멸망을 막기 위해 우주로 나선 교사의 눈물겨운 생존기와 우정 이야기입니다.",
        recommendReason: "지적 호기심과 긴장감 넘치는 과학적 탐구의 쾌감을 선사합니다.",
        highlightQuote: "나의 이름은 라일랜드 그레이스이고, 나는 인류를 구해야 한다."
      },
      {
        exactTitle: "1984",
        author: "조지 오웰",
        summary: "빅브라더의 통제 아래 자아를 잃어버린 디스토피아를 고발한 정치 소설의 고전입니다.",
        recommendReason: "자유와 사회 시스템에 대한 날카로운 통찰을 안겨줍니다.",
        highlightQuote: "빅브라더가 당신을 지켜보고 있다."
      },
      {
        exactTitle: "개미 1권",
        author: "베르나르 베르베르",
        summary: "개미들의 정교한 기사단 문명과 인간 세상을 아우르는 신비로운 상상력의 세계입니다.",
        recommendReason: "지구상 또 다른 문명에 관한 경이로운 시각을 열어줍니다.",
        highlightQuote: "우리가 보지 못하는 발 밑에 또 하나의 위대한 세상이 있다."
      },
      {
        exactTitle: "노르웨이의 숲 (상/하)",
        author: "무라카미 하루키",
        summary: "와타나베와 나오코, 미도리가 겪는 청춘의 사랑과 상실을 담아낸 현대 문학의 거작입니다.",
        recommendReason: "마음속 깊은 고독과 청춘의 아름다움을 깊이 있게 어루만져 줍니다.",
        highlightQuote: "어떤 진리도 사랑하는 이를 잃은 슬픔을 달랠 수는 없다."
      }
    ]);
    matchedList = defaultPool;
  }

  return matchedList.slice(0, 4);
}

/* --- TAB 3: Quotes Feed & Modals --- */
function renderQuotesFeed() {
  const grid = document.getElementById('quotes-feed-grid');
  grid.innerHTML = '';

  state.quotesFeed.forEach(item => {
    const card = document.createElement('div');
    card.className = 'quote-card';
    card.innerHTML = `
      <div>
        <div class="quote-card-text">
          <i class="fa-solid fa-quote-left" style="color:var(--accent-gold); font-size:0.9rem;"></i>
          ${item.quote}
        </div>
        <p style="font-size:0.85rem; color:#777; margin-bottom:0.8rem;">"${item.comment}"</p>
      </div>
      <div class="quote-card-book">
        <img src="${item.coverUrl}" alt="표지" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80'">
        <div>
          <div class="title">${item.bookTitle}</div>
          <div class="author">${item.author}</div>
        </div>
      </div>
    `;
    card.onclick = () => openBookDetailModal(item);
    grid.appendChild(card);
  });
}

async function searchBookForQuoteModal() {
  const input = document.getElementById('quote-book-search-input');
  const resultsEl = document.getElementById('quote-book-search-results');
  const query = input.value.trim();
  if (!query) {
    alert('검색할 책 제목을 입력해 주세요.');
    return;
  }

  resultsEl.innerHTML = '<div class="dropdown-item"><i class="fa-solid fa-spinner fa-spin"></i> 도서 및 표지 검색 중...</div>';
  resultsEl.classList.remove('hidden');

  const books = await fetchGoogleBooks(query);
  resultsEl.innerHTML = '';

  if (books.length === 0) {
    resultsEl.innerHTML = '<div class="dropdown-item"><i class="fa-solid fa-circle-exclamation"></i> 검색 결과가 없습니다. 정확한 책 제목으로 검색해 주세요.</div>';
    return;
  }

  books.forEach(book => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.innerHTML = `
      <img src="${book.coverUrl}" alt="${book.title} 표지" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80'">
      <div class="dropdown-item-info">
        <strong>${book.title}</strong>
        <span><i class="fa-solid fa-pen-nib"></i> ${book.author}</span>
      </div>
    `;
    item.onclick = () => {
      state.selectedQuoteBook = book;
      resultsEl.classList.add('hidden');
      document.getElementById('quote-book-cover').src = book.coverUrl;
      document.getElementById('quote-book-title').innerText = book.title;
      document.getElementById('quote-book-author').innerText = book.author;
      document.getElementById('quote-book-selected').classList.remove('hidden');
    };
    resultsEl.appendChild(item);
  });
}

function handleSaveQuote() {
  const text = document.getElementById('quote-text-input').value.trim();
  const comment = document.getElementById('quote-comment-input').value.trim();

  if (!state.selectedQuoteBook || !text) {
    alert('책을 선택하고 인상 깊은 문장을 작성해 주세요.');
    return;
  }

  const newQuote = {
    id: Date.now(),
    quote: text,
    comment: comment || '감명 깊은 문장',
    bookTitle: state.selectedQuoteBook.title,
    author: state.selectedQuoteBook.author,
    coverUrl: state.selectedQuoteBook.coverUrl,
    description: state.selectedQuoteBook.description
  };

  state.quotesFeed.unshift(newQuote);
  localStorage.setItem('bookmood_quotes', JSON.stringify(state.quotesFeed));

  renderQuotesFeed();
  closeModal('modal-add-quote');

  // Reset Modal Form
  document.getElementById('quote-text-input').value = '';
  document.getElementById('quote-comment-input').value = '';
  document.getElementById('quote-book-selected').classList.add('hidden');
  state.selectedQuoteBook = null;
}

function openBookDetailModal(item) {
  const container = document.getElementById('book-detail-content');
  container.innerHTML = `
    <div style="display:flex; gap:1.5rem; margin-bottom:1.5rem;">
      <img src="${item.coverUrl}" style="width:130px; height:180px; object-fit:cover; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15);" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80'">
      <div>
        <h3 style="font-family:var(--font-serif); font-size:1.5rem; color:var(--accent-wood); margin-bottom:0.4rem;">${item.bookTitle}</h3>
        <p style="color:var(--text-muted); margin-bottom:0.8rem;"><i class="fa-solid fa-pen-nib"></i> ${item.author}</p>
        <div style="background:#fdfaf6; border-left:3px solid var(--accent-gold); padding:0.8rem; font-family:var(--font-serif); color:#333;">
          "${item.quote || '책 속의 한 문장'}"
        </div>
      </div>
    </div>
    <h4><i class="fa-solid fa-align-left" style="color:var(--accent-gold);"></i> 책 줄거리 및 요약</h4>
    <p style="color:#555; font-size:0.95rem; line-height:1.7; margin-top:0.5rem;">${item.description || '책의 상세 줄거리 및 내용 정보가 표시됩니다.'}</p>
  `;
  openModal('modal-book-detail');
}

/* --- TAB 4: Reading Timer & Typewriter Sound --- */
function startTimer() {
  if (state.isTimerRunning) return;
  state.isTimerRunning = true;

  document.getElementById('btn-timer-start').disabled = true;
  document.getElementById('btn-timer-pause').disabled = false;
  document.getElementById('btn-timer-stop').disabled = false;

  state.timerInterval = setInterval(() => {
    state.timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  state.isTimerRunning = false;
  clearInterval(state.timerInterval);
  document.getElementById('btn-timer-start').disabled = false;
  document.getElementById('btn-timer-pause').disabled = true;
}

function stopTimer() {
  pauseTimer();

  const startPage = parseInt(document.getElementById('reading-start-page').value) || 0;
  const endPage = parseInt(document.getElementById('reading-end-page').value) || 0;
  const readPages = Math.max(0, endPage - startPage);
  const memoText = document.getElementById('typewriter-textarea').value;

  if (!state.selectedReadingBook) {
    alert('독서 기록을 저장하려면 읽은 책을 선택해 주세요.');
    return;
  }

  const newLog = {
    id: Date.now(),
    dateStr: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    bookTitle: state.selectedReadingBook.title,
    author: state.selectedReadingBook.author,
    coverUrl: state.selectedReadingBook.coverUrl,
    durationSeconds: state.timerSeconds,
    pagesRead: readPages,
    memo: memoText
  };

  state.readingLogs.push(newLog);
  localStorage.setItem('bookmood_reading_logs', JSON.stringify(state.readingLogs));

  alert('오늘의 독서 기록이 성공적으로 저장되었습니다!');

  // Reset Timer
  state.timerSeconds = 0;
  updateTimerDisplay();
  document.getElementById('typewriter-textarea').value = '';
  renderCalendar();
  updateStats();
}

function updateTimerDisplay() {
  const hrs = Math.floor(state.timerSeconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((state.timerSeconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (state.timerSeconds % 60).toString().padStart(2, '0');
  document.getElementById('timer-display').innerText = `${hrs}:${mins}:${secs}`;
}

async function searchReadingBook() {
  const input = document.getElementById('reading-book-title');
  const resultsEl = document.getElementById('reading-book-search-result');
  const query = input.value.trim();
  if (!query) {
    alert('검색할 책 제목을 입력해 주세요.');
    return;
  }

  resultsEl.innerHTML = '<div class="dropdown-item"><i class="fa-solid fa-spinner fa-spin"></i> 도서 및 표지 검색 중...</div>';
  resultsEl.classList.remove('hidden');

  const books = await fetchGoogleBooks(query);
  resultsEl.innerHTML = '';

  books.forEach(book => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.innerHTML = `
      <img src="${book.coverUrl}" alt="${book.title} 표지" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80'">
      <div class="dropdown-item-info">
        <strong>${book.title}</strong>
        <span><i class="fa-solid fa-pen-nib"></i> ${book.author}</span>
      </div>
    `;
    item.onclick = () => {
      state.selectedReadingBook = book;
      resultsEl.classList.add('hidden');
      document.getElementById('reading-book-cover').src = book.coverUrl;
      document.getElementById('reading-book-name').innerText = book.title;
      document.getElementById('reading-book-author').innerText = book.author;
      document.getElementById('reading-book-selected').classList.remove('hidden');
    };
    resultsEl.appendChild(item);
  });
}

/* --- Web Audio Typewriter Sound Effect --- */
function initTypewriterSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const textarea = document.getElementById('typewriter-textarea');
  const soundToggle = document.getElementById('toggle-typewriter-sound');

  textarea.addEventListener('keydown', (e) => {
    if (!soundToggle.checked) return;
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') return;

    playTypewriterClick(audioCtx);
  });
}

function playTypewriterClick(audioCtx) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(120 + Math.random() * 80, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.04);
}

/* --- TAB 5: Calendar & Stats --- */
function renderCalendar() {
  const container = document.getElementById('calendar-days');
  container.innerHTML = '';

  const year = state.currentCalDate.getFullYear();
  const month = state.currentCalDate.getMonth();

  document.getElementById('calendar-title').innerText = `${year}년 ${month + 1}월`;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // Empty padding cells
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day-cell';
    emptyCell.style.background = '#f7f4ec';
    container.appendChild(emptyCell);
  }

  // Days
  for (let d = 1; d <= lastDate; d++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell';

    const dayNum = document.createElement('div');
    dayNum.className = 'calendar-day-number';
    dayNum.innerText = d;
    cell.appendChild(dayNum);

    // Format YYYY-MM-DD
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const logForDay = state.readingLogs.find(l => l.dateStr === dateStr);

    if (logForDay) {
      const stamp = document.createElement('img');
      stamp.src = logForDay.coverUrl;
      stamp.className = 'calendar-stamp-img';
      stamp.title = `${logForDay.bookTitle} (${logForDay.pagesRead}p 읽음)`;
      stamp.onerror = function() { this.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80'; };
      cell.appendChild(stamp);
    }

    container.appendChild(cell);
  }
}

function changeMonth(delta) {
  state.currentCalDate.setMonth(state.currentCalDate.getMonth() + delta);
  renderCalendar();
}

function updateStats() {
  const currentMonthStr = `${state.currentCalDate.getFullYear()}-${(state.currentCalDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const thisMonthLogs = state.readingLogs.filter(l => l.dateStr.startsWith(currentMonthStr));

  const totalSecs = thisMonthLogs.reduce((acc, cur) => acc + (cur.durationSeconds || 0), 0);
  const totalPages = thisMonthLogs.reduce((acc, cur) => acc + (cur.pagesRead || 0), 0);
  const totalCount = thisMonthLogs.length;

  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);

  document.getElementById('stat-total-time').innerText = `${hrs}시간 ${mins}분`;
  document.getElementById('stat-total-pages').innerText = `${totalPages} p`;
  document.getElementById('stat-total-count').innerText = `${totalCount} 권`;
}

/* --- Modal Helpers --- */
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}
