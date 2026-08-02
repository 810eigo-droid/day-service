// ===== 放課後等デイサービス Lino LP =====

// --- サンプルモード ---
// <html data-sample> が付いているページだけ「SAMPLE」透かしを全面表示し、
// 右クリック・文字選択を抑止する。
// Lino案件は注文済みのため index.html（公開用）は透かしなし、
// index-2.html を透かし版として保管している。
const SAMPLE_MODE = document.documentElement.hasAttribute('data-sample');
if (SAMPLE_MODE) {
  const wm = document.createElement('div');
  wm.className = 'sample-watermark';
  wm.setAttribute('aria-hidden', 'true');
  document.body.appendChild(wm);
  const ribbon = document.createElement('div');
  ribbon.className = 'sample-ribbon';
  ribbon.textContent = 'サンプル（ご確認用）© TAF-design';
  document.body.appendChild(ribbon);
  document.body.classList.add('sample-mode');
  document.addEventListener('contextmenu', (e) => e.preventDefault());
}

// スクロールアニメーションはJS有効時のみ（無効時も全文が読める）
// ?noanim を付けるとアニメーション無しで表示（確認・キャプチャ用）
if (!location.search.includes('noanim')) document.body.classList.add('js');

// --- 画像プレースホルダー ---
// data-ph="表示名|推奨サイズ" を持つ <img> が読み込めない場合、
// 同名ファイルの別拡張子（webp/jpg/png）→ data-fallback の順に試し、
// どれも無ければファイル名入りのプレースホルダーに置き換える。
// 画像ファイルを images/ に置くだけで自動的に本物の画像が表示される。
// URLに ?fresh を付けると全画像をキャッシュ無視で再取得（更新確認用）
const FRESH = location.search.includes('fresh') ? '?t=' + Date.now() : '';
if (FRESH) {
  document.querySelectorAll('img[src], source[srcset]').forEach((el) => {
    const attr = el.tagName === 'SOURCE' ? 'srcset' : 'src';
    el.setAttribute(attr, el.getAttribute(attr) + FRESH);
  });
}

// --- 施設スライダー ---
const facilitySlider = document.querySelector('.facility-slider');
if (facilitySlider) {
  const track = facilitySlider.querySelector('.facility-track');
  const slides = [...facilitySlider.querySelectorAll('.facility-slide')];
  const dotsWrap = facilitySlider.querySelector('.facility-dots');
  let current = 0;
  let timer;

  const visibleCount = () => (window.innerWidth <= 820 ? 1 : 3);
  const maxIndex = () => Math.max(0, slides.length - visibleCount());
  const showSlide = (index) => {
    const positions = maxIndex() + 1;
    current = (index + positions) % positions;
    const gap = window.innerWidth <= 820 ? 12 : 18;
    const slideWidth = (facilitySlider.clientWidth - gap * (visibleCount() - 1)) / visibleCount();
    track.style.transform = `translateX(-${current * (slideWidth + gap)}px)`;
    dotsWrap.querySelectorAll('.facility-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
  };
  const start = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    clearInterval(timer);
    timer = setInterval(() => showSlide(current + 1), 1500);
  };

  const buildDots = () => {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIndex(); i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'facility-dot';
      dot.setAttribute('aria-label', `${i + 1}番目の組み合わせを表示`);
      dot.addEventListener('click', () => {
        showSlide(i);
        start();
      });
      dotsWrap.appendChild(dot);
    }
    showSlide(Math.min(current, maxIndex()));
  };
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      start();
    }, 150);
  });
  facilitySlider.addEventListener('mouseenter', () => clearInterval(timer));
  facilitySlider.addEventListener('mouseleave', start);
  facilitySlider.addEventListener('focusin', () => clearInterval(timer));
  facilitySlider.addEventListener('focusout', start);
  buildDots();
  start();
}

const EXTS = ['webp', 'jpg', 'jpeg', 'png'];
document.querySelectorAll('img[data-ph]').forEach((img) => {
  const original = (img.getAttribute('src') || '').split('?')[0];
  const base = original.replace(/\.[a-z]+$/i, '');
  const origExt = (original.match(/\.([a-z]+)$/i) || [])[1] || '';
  const candidates = EXTS.filter((e) => e !== origExt.toLowerCase()).map((e) => base + '.' + e + FRESH);
  const swap = () => {
    const next = candidates.shift();
    if (next) { img.src = next; return; }
    if (img.dataset.fallback && !img.dataset.triedFallback) {
      img.dataset.triedFallback = '1';
      img.src = img.dataset.fallback + FRESH;
      return;
    }
    if (img.dataset.swapped) return;
    img.dataset.swapped = '1';
    const [label, size] = (img.dataset.ph || '画像').split('|');
    const file = base.split('/').pop() + '.webp';
    const box = document.createElement('div');
    box.className = 'ph-box';
    box.innerHTML =
      '<span class="ph-emoji">🌺</span>' +
      '<b>' + label + '</b>' +
      '<code>' + file + '</code>' +
      (size ? '<small>' + size + '</small>' : '');
    img.replaceWith(box);
  };
  if (img.complete && img.naturalWidth === 0) swap();
  img.addEventListener('error', swap);
});

// --- 差し替え画像（成長の輪など） ---
// data-hides を持つ画像：読み込めたら指定要素（CSS版の図など）を隠し、
// 読み込めなければ画像側を消してCSS版をそのまま表示する。
document.querySelectorAll('img[data-hides]').forEach((img) => {
  const hide = () =>
    document.querySelectorAll(img.dataset.hides).forEach((el) => (el.style.display = 'none'));
  const drop = () =>
    (img.closest('.section-pic-link') || img.closest('picture') || img).remove();
  if (img.complete) {
    if (img.naturalWidth > 0) hide();
    else drop();
  } else {
    img.addEventListener('load', hide);
    img.addEventListener('error', drop);
  }
});

// --- モバイルメニュー ---
const menuBtn = document.getElementById('menuBtn');
const gnav = document.getElementById('gnav');
if (menuBtn && gnav) {
  menuBtn.addEventListener('click', () => {
    const open = gnav.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
  });
  gnav.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      gnav.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    })
  );
}

// --- スクロールで表示されるアニメーション ---
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('on');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// --- ページトップボタン ---
const pagetop = document.getElementById('pagetop');
if (pagetop) {
  window.addEventListener(
    'scroll',
    () => pagetop.classList.toggle('show', window.scrollY > 600),
    { passive: true }
  );
}

// --- 未設定のSNSリンク ---
document.querySelectorAll('a[data-todo]').forEach((a) => {
  a.addEventListener('click', (e) => {
    if (a.getAttribute('href') === '#') {
      e.preventDefault();
      alert('リンク未設定です：' + a.dataset.todo);
    }
  });
});
