/* ==========================================================================
   이마트 센트럴점 간편식 프로모션 - 인터랙션 스크립트 (app.js)
   ========================================================================== */

/* ─────────────────────────────────────────────
   1. 전역 상태: 장바구니 담긴 수량
───────────────────────────────────────────── */
const PRODUCTS = {
  bulgogi:   { name: '한끼 소불고기덮밥',    emoji: '🥩', price: 5900 },
  chicken:   { name: '매콤 닭갈비볶음밥',    emoji: '🍗', price: 5500 },
  saladwrap: { name: '훈제오리 샐러드랩',    emoji: '🥗', price: 6200 },
};

const PRESETS = {
  balance: { bulgogi: 1, chicken: 0, saladwrap: 1 },
  value:   { bulgogi: 0, chicken: 1, saladwrap: 1 },
  hearty:  { bulgogi: 1, chicken: 1, saladwrap: 0 },
  light:   { bulgogi: 0, chicken: 0, saladwrap: 2 },
};

let cart = { bulgogi: 0, chicken: 0, saladwrap: 0 };

/* ─────────────────────────────────────────────
   2. 유틸리티 함수
───────────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const fmt = (n) => n.toLocaleString('ko-KR') + '원';

function showToast(msg, duration = 2400) {
  const toast = $('#toast-message');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ─────────────────────────────────────────────
   3. 계산기 렌더링 핵심 로직
───────────────────────────────────────────── */
function calcTotals() {
  let totalQty = 0;
  let originalTotal = 0;
  Object.keys(cart).forEach((id) => {
    totalQty += cart[id];
    originalTotal += cart[id] * PRODUCTS[id].price;
  });

  const eligible = totalQty >= 2;
  const discountRate = eligible ? 0.2 : 0;
  const discountAmt = Math.floor(originalTotal * discountRate);
  const finalPrice = originalTotal - discountAmt;
  const perMealPrice = totalQty > 0 ? Math.floor(finalPrice / totalQty) : 0;

  return { totalQty, originalTotal, discountAmt, finalPrice, perMealPrice, eligible };
}

function renderReceipt() {
  const { totalQty, originalTotal, discountAmt, finalPrice, perMealPrice, eligible } = calcTotals();

  /* 수량 표시 업데이트 */
  Object.keys(cart).forEach((id) => {
    $('#qty-' + id).textContent = cart[id];
    const card = document.getElementById('card-' + id);
    if (cart[id] > 0) {
      card.style.borderColor = '#FFB800';
      card.style.boxShadow = '0 8px 20px rgba(255,184,0,0.18)';
    } else {
      card.style.borderColor = '';
      card.style.boxShadow = '';
    }
  });

  /* 담긴 목록 리스트 */
  const listEl = $('#selected-items-list');
  const itemsInCart = Object.keys(cart).filter((id) => cart[id] > 0);
  if (itemsInCart.length === 0) {
    listEl.innerHTML = `<div class="empty-list-placeholder">
      <span>🛒 담긴 상품이 없습니다.<br>원하는 메뉴의 <strong>[+]</strong> 버튼을 눌러주세요.</span>
    </div>`;
  } else {
    listEl.innerHTML = itemsInCart.map((id) => {
      const p = PRODUCTS[id];
      const rowTotal = p.price * cart[id];
      return `<div class="receipt-item-row">
        <div class="item-row-left">
          <span>${p.emoji}</span>
          <span class="item-row-name">${p.name}</span>
          <span class="item-row-qty">×${cart[id]}</span>
        </div>
        <span class="item-row-price">${fmt(rowTotal)}</span>
      </div>`;
    }).join('');
  }

  /* 진행 바: 최대 2개 기준 */
  const progressPct = Math.min((totalQty / 2) * 100, 100);
  $('#items-progress-bar').style.width = progressPct + '%';

  /* 안내 메시지 */
  const reqText = $('#req-text');
  if (totalQty === 0) {
    reqText.innerHTML = '원하는 메뉴를 <strong>2개 이상</strong> 골라보세요!';
    $('#discount-status-box').style.backgroundColor = '';
  } else if (totalQty === 1) {
    reqText.innerHTML = '1개 더 담으시면 <strong>20% 파격 할인</strong>이 적용됩니다!';
    $('#discount-status-box').style.backgroundColor = '#FFF9E6';
  } else {
    reqText.innerHTML = `🎉 <strong>${totalQty}개</strong> 선택 완료! 20% 즉시 할인이 적용됩니다!`;
    $('#discount-status-box').style.backgroundColor = '#EBFBF3';
  }

  /* 요약 금액 */
  $('#total-qty-text').textContent = totalQty + '개';
  const origEl = $('#original-price-text');
  origEl.textContent = fmt(originalTotal);
  origEl.style.textDecoration = (eligible && originalTotal > 0) ? 'line-through' : 'none';
  origEl.style.color = (eligible && originalTotal > 0) ? '#94A3B8' : '';

  $('#discount-amount-text').textContent = eligible ? `-${fmt(discountAmt)}` : '-0원';
  $('#final-price-text').textContent = totalQty > 0 ? fmt(finalPrice) : '0원';

  const mealBadge = $('#meal-price-badge');
  $('#per-meal-price-text').textContent = totalQty > 0 ? fmt(perMealPrice) : '0원';
  mealBadge.style.display = totalQty > 0 ? 'block' : 'none';

  /* 응원 메시지 */
  const cheerBanner = $('#combo-cheer-banner');
  const cheerText = $('#cheer-text');
  if (eligible) {
    cheerBanner.style.backgroundColor = '#EFF6FF';
    cheerBanner.style.borderColor = '#BFDBFE';
    cheerText.innerHTML = `1끼 평균 <strong style="color:#D97706">${fmt(perMealPrice)}</strong>! 가성비 간편식 선택 완료!`;
  } else if (totalQty === 1) {
    cheerBanner.style.backgroundColor = '#FFF9E6';
    cheerBanner.style.borderColor = '#FFE58F';
    cheerText.innerHTML = '1개만 더 담으면 <strong>전 조합 9천원대</strong>로 즐길 수 있어요!';
  } else {
    cheerBanner.style.backgroundColor = '#F8FAFC';
    cheerBanner.style.borderColor = '#E2E8F0';
    cheerText.textContent = '2개를 담으면 전 조합 9천원대로 할인됩니다!';
  }

  /* 스티키 바 업데이트 */
  $('#sticky-qty').textContent = totalQty + '개';
  if (eligible) {
    $('#sticky-price').textContent = `${fmt(finalPrice)} (20% DC 적용)`;
    $('#sticky-price').style.color = '#D97706';
  } else if (totalQty > 0) {
    $('#sticky-price').textContent = `${fmt(originalTotal)} (2개부터 할인)`;
    $('#sticky-price').style.color = '#64748B';
  } else {
    $('#sticky-price').textContent = '0원 (0% DC)';
    $('#sticky-price').style.color = '#94A3B8';
  }
}

/* 프리셋 적용 */
function applyPreset(name) {
  if (!PRESETS[name]) return;
  cart = { ...PRESETS[name] };
  renderReceipt();
  const labels = {
    balance: '영양균형형 조합이 담겼어요! 🥗+🥩',
    value:   '가성비균형형 조합이 담겼어요! 🥗+🍗',
    hearty:  '든든형 조합이 담겼어요! 🥩+🍗',
    light:   '가벼운형 조합이 담겼어요! 🥗+🥗',
  };
  showToast(labels[name]);

  /* 계산기 섹션으로 부드럽게 스크롤 */
  const calcSection = document.getElementById('calculator');
  if (calcSection) {
    setTimeout(() => calcSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  }
}

/* ─────────────────────────────────────────────
   4. 매일 점심 12:00 타임어택 카운트다운
───────────────────────────────────────────── */
function updateCountdown() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(12, 0, 0, 0);

  /* 이미 12시가 지났으면 내일 12시로 */
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }

  const diff = target - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const pad = (n) => String(n).padStart(2, '0');
  document.getElementById('cd-hours').textContent = pad(h);
  document.getElementById('cd-minutes').textContent = pad(m);
  document.getElementById('cd-seconds').textContent = pad(s);

  /* 12:00 전 30분 이내이면 긴장감 색상 강조 */
  const cdDisplay = document.getElementById('countdown-display');
  if (h === 0 && m < 30) {
    cdDisplay.style.filter = 'hue-rotate(320deg) brightness(1.1)';
    document.getElementById('timer-status-text').textContent = '⚡ 타임어택 임박! 서두르세요!';
  } else {
    cdDisplay.style.filter = '';
    document.getElementById('timer-status-text').textContent = '오늘의 타임어택까지 남은 시간';
  }
}

/* ─────────────────────────────────────────────
   5. 카드뉴스 캐러셀 슬라이더
───────────────────────────────────────────── */
let currentSlide = 0;
const TOTAL_SLIDES = 6;
let autoSlideTimer = null;

function goToSlide(idx) {
  currentSlide = (idx + TOTAL_SLIDES) % TOTAL_SLIDES;
  const track = document.getElementById('slider-track');
  if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;

  /* 도트 인디케이터 업데이트 */
  $$('#slider-dots .dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function startAutoSlide() {
  stopAutoSlide();
  autoSlideTimer = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
  if (autoSlideTimer) clearInterval(autoSlideTimer);
}

/* 터치 스와이프 지원 */
function initSwipe(el) {
  let startX = 0;
  el.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { stopAutoSlide(); dx < 0 ? nextSlide() : prevSlide(); startAutoSlide(); }
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   6. 라이트박스 이미지 확대 모달
───────────────────────────────────────────── */
function openModal(src, caption) {
  const modal = document.getElementById('image-modal');
  const img = document.getElementById('modal-img');
  const cap = document.getElementById('modal-caption');
  img.src = src;
  img.alt = caption || '확대 이미지';
  cap.textContent = caption || '';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('image-modal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────────
   7. FAQ 아코디언
───────────────────────────────────────────── */
function initFAQ() {
  $$('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('active');

      /* 모두 닫기 */
      $$('.faq-item').forEach((el) => {
        el.classList.remove('active');
        el.querySelector('.faq-answer').style.maxHeight = '0';
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      /* 클릭한 것 토글 */
      if (!isOpen) {
        item.classList.add('active');
        const answer = item.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ─────────────────────────────────────────────
   8. 공유 기능
───────────────────────────────────────────── */
function sharePromotion() {
  const shareData = {
    title: '이마트 센트럴점 간편식 20% 파격 할인!',
    text: '원하는 간편식 2개 골라 담으면 20% 즉시 할인! 전 조합 9천원대 실현!',
    url: window.location.href,
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => fallbackCopyLink());
  } else {
    fallbackCopyLink();
  }
}

function fallbackCopyLink() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => showToast('🔗 링크가 클립보드에 복사되었습니다!'))
    .catch(() => showToast('📋 URL을 직접 복사해 공유해 주세요.'));
}

/* ─────────────────────────────────────────────
   9. 스크롤 시 헤더 스타일 변화
───────────────────────────────────────────── */
function initScrollEffects() {
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.style.boxShadow = '0 2px 16px rgba(0,0,0,0.08)';
    } else {
      header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   10. 행사 기간 유효성 체크 (10.21 ~ 11.03)
───────────────────────────────────────────── */
function checkEventPeriod() {
  const now = new Date();
  const start = new Date('2026-10-21');
  const end = new Date('2026-11-03T23:59:59');
  const pillBadge = document.querySelector('.hero-pill-badge');

  if (now < start) {
    const days = Math.ceil((start - now) / 86400000);
    if (pillBadge) {
      pillBadge.innerHTML = `<span class="badge-dot"></span> 행사 시작 D-${days} · 10.21 오픈 예정!`;
    }
  } else if (now > end) {
    const heroTitle = document.querySelector('.highlight-yellow');
    if (heroTitle) heroTitle.style.opacity = '0.5';
    showToast('이번 프로모션은 종료되었습니다. 다음 행사를 기대해 주세요!', 5000);
  }
}

/* ─────────────────────────────────────────────
   11. 전체 이벤트 초기화 (DOMContentLoaded)
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ── 초기 렌더 ── */
  renderReceipt();
  checkEventPeriod();

  /* ── 카운트다운 시작 ── */
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ── 수량 버튼 이벤트 (이벤트 위임) ── */
  document.querySelector('.products-selection-col').addEventListener('click', (e) => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const target = btn.dataset.target;
    if (!target) return;

    if (btn.classList.contains('btn-plus')) {
      cart[target] = Math.min(cart[target] + 1, 9);
    } else if (btn.classList.contains('btn-minus')) {
      cart[target] = Math.max(cart[target] - 1, 0);
    }
    renderReceipt();
  });

  /* ── 프리셋 버튼 (계산기 상단 바) ── */
  $$('.preset-btn[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });

  /* ── 프리셋 버튼 (큐레이션 카드) ── */
  $$('.btn-curation-apply[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });

  /* ── 초기화 버튼 ── */
  document.getElementById('btn-calc-reset')?.addEventListener('click', () => {
    cart = { bulgogi: 0, chicken: 0, saladwrap: 0 };
    renderReceipt();
    showToast('🗑️ 선택이 초기화되었습니다.');
  });

  /* ── 슬라이더 초기화 ── */
  const track = document.getElementById('slider-track');
  if (track) {
    document.getElementById('slider-prev-btn')?.addEventListener('click', () => {
      stopAutoSlide(); prevSlide(); startAutoSlide();
    });
    document.getElementById('slider-next-btn')?.addEventListener('click', () => {
      stopAutoSlide(); nextSlide(); startAutoSlide();
    });

    /* 도트 클릭 */
    $$('#slider-dots .dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        stopAutoSlide();
        goToSlide(parseInt(dot.dataset.index));
        startAutoSlide();
      });
    });

    /* 카드 이미지 클릭 → 라이트박스 */
    $$('.slide-img-box').forEach((box) => {
      box.addEventListener('click', () => {
        const imgSrc = box.dataset.fullImg;
        const caption = box.closest('.slide-card')?.querySelector('.slide-caption h4')?.textContent;
        openModal(imgSrc, caption);
      });
    });

    initSwipe(track);
    startAutoSlide();
  }

  /* ── 포스터 확대 모달 버튼 ── */
  document.getElementById('poster-preview-trigger')?.addEventListener('click', () => {
    openModal('./포스터.png', '이마트 센트럴점 공식 프로모션 포스터');
  });

  document.getElementById('btn-open-poster-modal')?.addEventListener('click', () => {
    openModal('./포스터.png', '이마트 센트럴점 공식 프로모션 포스터');
  });

  /* ── 모달 닫기 ── */
  document.getElementById('btn-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-backdrop')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ── FAQ 아코디언 ── */
  initFAQ();

  /* ── 공유 버튼 ── */
  document.getElementById('btn-share-header')?.addEventListener('click', sharePromotion);
  document.getElementById('btn-sticky-share')?.addEventListener('click', sharePromotion);

  /* ── 매장 주소 복사 ── */
  document.getElementById('btn-copy-address')?.addEventListener('click', () => {
    navigator.clipboard.writeText('이마트 센트럴점 · 지하 1층 냉장 간편식 골든존')
      .then(() => showToast('📋 매장 주소가 복사되었습니다!'))
      .catch(() => showToast('이마트 센트럴점 (냉장 간편식 골든존)'));
  });

  /* ── 지도 앱 안내 ── */
  document.getElementById('btn-open-map-notice')?.addEventListener('click', () => {
    showToast('📍 "이마트 센트럴점"으로 검색해 주세요!', 3000);
  });

  /* ── 스크롤 효과 ── */
  initScrollEffects();

  /* ── 스크롤 연동 네비 활성화 (Intersection Observer) ── */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === '#' + entry.target.id
            );
          });
        }
      });
    },
    { threshold: 0.35 }
  );
  sections.forEach((sec) => observer.observe(sec));

});
