// ===== 放課後等デイサービス Lino LP =====

// スクロールアニメーションはJS有効時のみ（無効時も全文が読める）
// ?noanim を付けるとアニメーション無しで表示（確認・キャプチャ用）
if (!location.search.includes('noanim')) document.body.classList.add('js');

// --- 画像プレースホルダー ---
// data-ph="表示名|推奨サイズ" を持つ <img> が読み込めない場合、
// 同名ファイルの追加を促すプレースホルダーに置き換える。
// data-fallback があれば先に代替画像を試す。
// 画像ファイルを images/ に置くだけで自動的に本物の画像が表示される。
document.querySelectorAll('img[data-ph]').forEach((img) => {
  const swap = () => {
    if (img.dataset.fallback && !img.dataset.triedFallback) {
      img.dataset.triedFallback = '1';
      img.src = img.dataset.fallback;
      return;
    }
    if (img.dataset.swapped) return;
    img.dataset.swapped = '1';
    const [label, size] = (img.dataset.ph || '画像').split('|');
    const file = (img.getAttribute('src') || '').split('/').pop();
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
