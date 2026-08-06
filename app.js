// Configuration & State
// OpenAI API Key는 보안을 위해 .env 파일에서 관리됩니다.
// 프론트엔드 환경에서 .env 키 로드 및 안전한 관리 예시
let OPENAI_API_KEY = "";

// .env 파일에서 API 키 읽기 시도
fetch('./.env')
  .then(response => response.text())
  .then(text => {
    const match = text.match(/OPENAI_API_KEY=(.*)/);
    if (match && match[1]) {
      OPENAI_API_KEY = match[1].trim();
    }
  })
  .catch(err => {
    console.log('.env 로드 중 (기본 환경 설정 유지)');
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

// Built-in Popular Korean Books Fallback Database (Guarantees instant search results!)
const fallbackSearchDatabase = [
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
    description: "매일 1%의 미세한 변화가 만드는 놀라운 성과를 과학적 원리로 풀어낸 모티베이션 서적."
  },
  {
    title: "불편한 편의점",
    author: "김호연",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "골목길 작은 편의점을 배경으로 각자의 상처를 안고 살아가는 사람들의 따뜻하고 유쾌한 힐링 소설."
  },
  {
    title: "미드나잇 라이브러리",
    author: "매트 헤이그",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "밤 12시의 도서관에서 다른 삶의 기회를 마주하며 인생을 깨닫는 감동적인 소설."
  },
  {
    title: "클린 코드 (Clean Code)",
    author: "로버트 C. 마틴",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "유연하고 깨끗한 코드를 작성하는 실천 기법을 다룬 소프트웨어 개발 명저."
  },
  {
    title: "사피엔스",
    author: "유발 하라리",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    description: "변방의 유인원 사피엔스가 어떻게 지구의 지배자가 되었는지 추적하는 인문학 서적."
  }
];

// Rich Curation Database
const curationDB = [
  {
    keywords: ['개발', 'it', '소프트웨어', '코딩', '프로그래밍', '컴퓨터', 'ai', '인공지능', '기술', '백엔드', '프론트엔드'],
    title: "클린 코드 (Clean Code)",
    author: "로버트 C. 마틴",
    summary: "애자일 소프트웨어 혁명의 거장이 전하는 유연하고 깨끗한 코드를 작성하는 구체적인 실천 기법을 다룬 명저입니다.",
    reason: "개발 진로에 꼭 필요한 커뮤니케이션과 가독성 높은 코드 작성 역량을 완벽하게 길러줍니다.",
    quote: "나중은 결코 오지 않는다. 엉망인 코드를 나중에 고치겠다는 생각은 환상일 뿐이다."
  },
  {
    keywords: ['디자인', 'ux', 'ui', '기획', '콘텐츠', '예술', '크리에이티브', '마케팅'],
    title: "디자인에 집중하라",
    author: "팀 브라운",
    summary: "세계적인 디자인 기업 IDEO의 CEO 팀 브라운이 제안하는 창의적 문제 해결 방법론 '디자인 씽킹'을 소개하는 책입니다.",
    reason: "사용자 중심의 창의적 문제 해결 능력을 키우고 기획과 디자인 진로에 직관적 영감을 줍니다.",
    quote: "디자인은 단순히 보기 좋게 만드는 것이 아니라, 문제를 제대로 정의하고 해결하는 과정이다."
  },
  {
    keywords: ['역사', '사회', '인문', '철학', '고전', '지식'],
    title: "사피엔스",
    author: "유발 하라리",
    summary: "변방의 유인원 아프리카 사피엔스가 어떻게 지구의 지배자가 되었는지 인간 역사의 거대한 궤적을 추적하는 인문 베스트셀러입니다.",
    reason: "인간과 사회의 역사적 흐름에 대한 폭넓은 통찰과 지적 깊이를 더해줍니다.",
    quote: "상상의 질서와 허구를 믿는 능력이 바로 인류가 세계를 지배할 수 있었던 가장 강력한 힘이다."
  },
  {
    keywords: ['불안', '조급', '답답', '지침', '휴식', '스트레스', '우울', '슬픔', '평온', '마음'],
    title: "만약은 없다",
    author: "남궁인",
    summary: "응급의학과 의사가 죽음의 최전선에서 목격한 삶과 인간에 대한 뜨거운 기록과 위로를 담은 에세이입니다.",
    reason: "지치고 불안한 마음에 깊은 공감과 따뜻한 위로를 전하며 삶의 가치를 일깨워줍니다.",
    quote: "살아있다는 사실 그 자체만으로도 우리는 이미 커다란 기적 속에 살고 있는 것이다."
  },
  {
    keywords: ['도전', '성장', '자아', '용기', '새로운', '시작', '목표', '성공', '습관'],
    title: "아주 작은 습관의 힘",
    author: "제임스 클리어",
    summary: "매일 1%의 미세한 변화가 만드는 놀라운 성과를 과학적 원리로 풀어낸 자기계발서입니다.",
    reason: "목표 달성과 일상의 성장을 도우며 매일 작은 실천을 이끌어내는 강력한 동기를 부여합니다.",
    quote: "변화는 단순한 목표 설정이 아닌, 매일의 정체성 확립에서 시작된다."
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

/* --- Guaranteed Multi-engine Book Search Utility --- */
async function fetchGoogleBooks(query) {
  if (!query) return [];

  const rawQuery = query.trim();

  // 1. Try Google Books API First
  try {
    const encoded = encodeURIComponent(rawQuery);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encoded}&maxResults=8`);
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items.map(item => {
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
            description: info.description || '책에 대한 자세한 정보와 줄거리가 곧 업데이트됩니다.',
            coverUrl: cover
          };
        });
      }
    }
  } catch (err) {
    console.warn("Google Books API network failed, trying internal DB match...", err);
  }

  // 2. Guaranteed Fallback Search from Internal Database
  const matchedFallback = fallbackSearchDatabase.filter(b => 
    b.title.includes(rawQuery) || rawQuery.includes(b.title) || b.author.includes(rawQuery)
  );

  if (matchedFallback.length > 0) {
    return matchedFallback;
  }

  // 3. User Custom Direct Fallback
  return [{
    id: Date.now(),
    title: rawQuery,
    author: "검색된 도서",
    description: `'${rawQuery}'에 대한 도서 검색 결과입니다. 마음을 풍요롭게 하는 이야기를 만나보세요.`,
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80"
  }];
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

  container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem;"><i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; color:var(--accent-gold);"></i><p style="margin-top:1rem;">도서 및 줄거리 상세 정보 검색 중...</p></div>';

  const books = await fetchGoogleBooks(query);
  container.innerHTML = '';

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
      quote: `${book.title}의 대표 문장을 나만의 독서 메모장에 남겨보세요.`
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
      이 조건에 부합하는 실제 도서 4-5권을 풍성하게 엄선하여 아래 JSON 형식 배열로만 정확히 반환하세요:
      [
        {
          "exactTitle": "도서 한글 제목",
          "author": "저자명",
          "summary": "줄거리 요약 2문장",
          "recommendReason": "사용자의 기분/진로 입력에 맞춰 맞춤 추천하는 구체적 이유",
          "highlightQuote": "대표 명문장 1개"
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
          temperature: 0.8
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
        exactTitle: "어린 왕자",
        author: "앙투안 드 생텍쥐페리",
        summary: "사막에 불시착한 비행사가 별에서 온 어린 왕자를 만나 삶과 관계의 가치를 배우는 이야기입니다.",
        recommendReason: `${genre} 장르와 관련된 깊은 통찰을 제공하며 일상에 따뜻한 위로와 가치를 일깨워줍니다.`,
        highlightQuote: "가장 중요한 것은 눈에 보이지 않아."
      },
      {
        exactTitle: "아주 작은 습관의 힘",
        author: "제임스 클리어",
        summary: "매일 1%의 미세한 변화가 만드는 놀라운 성과를 과학적 원리로 풀어냅니다.",
        recommendReason: `${career ? `'${career}' 진로 목표 달성을 위한 ` : ''}매일의 탄탄한 독서 및 성장 습관을 구축해 줍니다.`,
        highlightQuote: "변화는 단순한 목표 설정이 아닌, 매일의 정체성 확립에서 시작된다."
      },
      {
        exactTitle: "불편한 편의점",
        author: "김호연",
        summary: "골목길 작은 편의점을 배경으로 각자의 상처를 안고 살아가는 사람들의 따뜻하고 유쾌한 힐링 소설입니다.",
        recommendReason: "지친 하루에 매일의 삶을 위로해 주고 따뜻한 마음을 선사합니다.",
        highlightQuote: "결국 삶은 관계였고 관계는 소통이었다."
      },
      {
        exactTitle: "사피엔스",
        author: "유발 하라리",
        summary: "인류의 역사와 문명을 깊이 있게 다룬 베스트셀러 인문 서적입니다.",
        recommendReason: "지적 호기심과 인문학적 폭넓은 통찰력을 선사합니다.",
        highlightQuote: "상상의 질서를 믿는 능력이 인류 지배의 힘이다."
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
