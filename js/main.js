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

// --- 連番写真の自動検出 ---
// images/ 内の base-1.webp, base-2.webp ... を順に探し、見つかった一覧を返す。
// includeBase=true なら base.webp 単体も先頭候補に含める。
const probePhotos = (base, includeBase, max = 6) =>
  new Promise((resolve) => {
    const names = (includeBase ? [base + '.webp'] : []).concat(
      Array.from({ length: max }, (_, i) => `${base}-${i + 1}.webp`)
    );
    const found = new Set();
    let pending = names.length;
    const done = () => resolve(names.filter((n) => found.has(n)));
    names.forEach((name) => {
      const probe = new Image();
      probe.onload = () => { found.add(name); if (--pending === 0) done(); };
      probe.onerror = () => { if (--pending === 0) done(); };
      probe.src = 'images/' + name + FRESH;
    });
  });

// --- コンセプト3ステップ：写真のクロスフェード ---
// concept-stepN-1.webp, -2.webp... が置かれると、カードの写真が
// ゆっくり入れ替わるスライドショーになる（1枚だけなら固定表示）
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.step-card').forEach((card, i) => {
  probePhotos('concept-step' + (i + 1), false).then((list) => {
    if (!list.length) return;
    const slot = card.querySelector('img, .ph-box');
    if (!slot) return;
    const wrap = document.createElement('div');
    wrap.className = 'photo-fade';
    wrap.innerHTML = list
      .map((n, j) => `<img src="images/${n}${FRESH}" alt="" class="${j === 0 ? 'show' : ''}">`)
      .join('');
    slot.replaceWith(wrap);
    if (list.length > 1 && !REDUCED) {
      let cur = 0;
      const imgs = wrap.querySelectorAll('img');
      setInterval(() => {
        imgs[cur].classList.remove('show');
        cur = (cur + 1) % imgs.length;
        imgs[cur].classList.add('show');
      }, 3800 + i * 500);
    }
  });
});

// --- 施設スライダー ---
const facilitySlider = document.querySelector('.facility-slider');
if (facilitySlider) {
  const track = facilitySlider.querySelector('.facility-track');
  let slides = [...facilitySlider.querySelectorAll('.facility-slide')];
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

  // 連番写真（facility-01-1.webp 等）が置かれていたら、全枚数をスライドに展開する
  const FACILITY_GROUPS = [
    ['facility-01', 'ゆったり過ごせるメインルーム'],
    ['facility-02', '集中できる学習スペース'],
    ['facility-03', 'のびのび遊べるスペース'],
    ['activity-01', '日々の活動の様子'],
    ['activity-02', '季節のイベントも大切に'],
    ['activity-03', '外あそび・おでかけ'],
  ];
  Promise.all(FACILITY_GROUPS.map(([base]) => probePhotos(base, true))).then((lists) => {
    if (lists.flat().length > 0) {
      track.innerHTML = FACILITY_GROUPS.map(([base, cap], gi) => {
        if (!lists[gi].length) {
          // 写真がまだ無いカテゴリはプレースホルダーを表示
          return `<figure class="facility-slide"><div class="ph-box"><span class="ph-emoji">🌺</span>` +
                 `<b>${cap}</b><code>${base}-1.webp</code></div><figcaption>${cap}</figcaption></figure>`;
        }
        return lists[gi].map((n, j) =>
          `<figure class="facility-slide"><img src="images/${n}${FRESH}" alt="${cap}" loading="lazy">` +
          `<figcaption>${cap}${lists[gi].length > 1 ? `（${j + 1}）` : ''}</figcaption></figure>`
        ).join('');
      }).join('');
      slides = [...facilitySlider.querySelectorAll('.facility-slide')];
      current = 0;
    }
    buildDots();
    start();
  });
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
