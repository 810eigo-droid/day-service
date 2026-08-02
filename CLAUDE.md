# 放課後等デイサービスLino LP（TAF-design 制作）

このリポジトリはクライアント確認用の公開ミラー。開発元は `810eigo-droid/teach-funnel-site` の
`lino/` ディレクトリ（ブランチ: claude/daycare-lp-development-g8w5jr）。詳しい作業ルールはそちらの CLAUDE.md 参照。

## サンプル透かしの扱い（この案件は注文済み）

- **この案件は注文済み（2026-07確認）。公開用 `index.html` は透かしなしが正しい状態**
- `index-2.html` は透かし付き（`data-sample`）の保管版。サンプル提示が必要なときに使う
- 透かしを勝手に復活させないこと（過去に誤って復活させた事例あり）
- noindex メタタグは正式公開のタイミングで削除する

## 運用メモ

- クライアントは `images/` に画像を直接アップロードする（ファイル名規則は IMAGE_GUIDE.md）
- 確認URL: https://810eigo-droid.github.io/day-service/（`?fresh` でキャッシュ無視）
- このリポジトリを直接編集した場合は teach-funnel-site 側の `lino/` にも反映すること
