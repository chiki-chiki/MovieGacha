# CLAUDE.md

このリポジトリでClaude Codeが作業する際の方針。

## プロジェクト概要

映画ガチャアプリ。仕様は [movie-gacha-spec.md](movie-gacha-spec.md)、検討の経緯は
[movie-gacha-discussion-log.md](movie-gacha-discussion-log.md) を参照。

学習目的のプロジェクトのため、実装は基本的にGitHub Issue単位で細かく進める。

## 開発フロー: Issueごとに EPCC サイクルを回す

`movie-gacha-spec.md` の仕様は、1タスク=1コミットで完結する粒度のGitHub Issueに
分解済み(Issue一覧を参照)。実装は**Issueを1つずつ**、以下の
Explore → Plan → Code → Commit (EPCC) サイクルで進める。

1. **Explore**: 対象Issueに関連する既存コード・依存関係を確認する
2. **Plan**: 変更内容を具体的に(ファイル単位で)まとめ、着手前にユーザーに提示する
3. **Code**: Planに沿って実装し、`tsc --noEmit` や `next build` 等で検証する
   (可能な範囲でエビデンスを `docs/evidence/` に残す)
4. **Commit**: 1 Issue = 1コミットとしてコミットメッセージに `Closes #N` を含め、
   ブランチにpushしてPRを作成する

**重要**: 複数のIssueを続けてまとめて実装しない。1つのIssueのEPCCサイクルが
完了したら区切りとし、次のIssueに進む前にユーザーの確認を挟む。
これはユーザー自身が実装の一つひとつを追い、学習する目的も兼ねている。

## その他の注意

- 技術スタックはSupabase(Postgres) + Next.js。詳細は `movie-gacha-spec.md` セクション5
- 本番のSupabase/TMDB認証情報はサンドボックス環境には無いため、実際のAPI連携は
  ビルド・型チェック・(可能であれば)ローカルDBでの検証に留める
