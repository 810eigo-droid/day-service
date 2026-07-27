// ===== 放課後等デイサービス Lino LP =====

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

// --- スタッフスライダー ---
// カード一式を複製してシームレスな無限ループにする
// （data-ph処理より先に行い、複製後の画像にもプレースホルダーを効かせる）
const staffTrack = document.querySelector('.staff-track');
if (staffTrack) staffTrack.innerHTML += staffTrack.innerHTML;

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
