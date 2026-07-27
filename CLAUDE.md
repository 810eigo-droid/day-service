# 放課後等デイサービスLino LP（TAF-design 制作）

このリポジトリはクライアント確認用の公開ミラー。開発元は `810eigo-droid/teach-funnel-site` の
`lino/` ディレクトリ（ブランチ: claude/daycare-lp-development-g8w5jr）。詳しい作業ルールはそちらの CLAUDE.md 参照。

## ⚠️ 最重要ルール：サンプル透かし

- この案件は**入金前**の間、`index.html` の `<html data-sample>` 属性による
  「SAMPLE / © TAF-design」透かしを**外してはならない**
- クライアントへ送るリンクや文面を頼まれたら、透かしが有効か必ず確認し、
  無効になっていたら警告する
- `index-2.html` は透かしなしのクリーン版（納品マスター）。リンクとして共有しない
- 納品時（入金確認後）のみ: `data-sample` と noindex メタタグを削除する

## 運用メモ

- クライアントは `images/` に画像を直接アップロードする（ファイル名規則は IMAGE_GUIDE.md）
- 確認URL: https://810eigo-droid.github.io/day-service/（`?fresh` でキャッシュ無視）
- このリポジトリを直接編集した場合は teach-funnel-site 側の `lino/` にも反映すること
