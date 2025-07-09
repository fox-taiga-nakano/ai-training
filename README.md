# EC通販システム

NestJS API バックエンドと Next.js フロントエンドを含む Turborepo 構成のフルスタックEC通販システムです。

## 環境構築手順

### 必要な環境

- **Node.js**: 20 以上（推奨: Node.js 20+）
- **pnpm**: 10.13.1（厳密にこのバージョンを使用）
- **Docker**: PostgreSQL データベース用

### 1. リポジトリのクローンと依存関係のインストール

```bash
# リポジトリをクローン
git clone https://github.com/fox-taiga-nakano/ai-training.git
cd ai-training

# pnpmの確認
pnpm -v

# 以下のような出力であれば `Y` を入力して下さい
! Corepack is about to download https://registry.npmjs.org/pnpm/-/pnpm-10.13.1.tgz
? Do you want to continue? [Y/n]

# 依存関係をインストール
pnpm install
```

### 2. データベースの設定

```bash
# 環境変数の設定
cp packages/database/.env.example packages/database/.env

# PostgreSQL コンテナを起動
docker compose up -d

# データベースの初期化
pnpm db:init
```

### 3. 開発サーバーの起動

```bash
# 全アプリケーションを同時起動
pnpm dev
```

### 4. 動作確認

- **フロントエンド**: http://localhost:3001
- **API**: http://localhost:3000
- **Prisma Studio**: `pnpm db:studio` でデータベース GUI を起動

### 5. 開発時のコマンド

```bash
# コード品質チェック
pnpm lint          # ESLint 実行
pnpm format        # Prettier 実行
pnpm build         # 全プロジェクトのビルド（型チェック含む）

# テスト実行
pnpm test          # ユニットテスト
pnpm test:e2e      # E2E テスト（Playwright）

# データベース操作
pnpm db:studio     # Prisma Studio 起動
pnpm db:reset      # データベースリセット
pnpm db:migrate    # マイグレーション実行（本番用）
```

### トラブルシューティング

#### データベース接続エラー

```bash
# Docker コンテナの状態確認
docker compose ps

# コンテナを再起動
docker compose restart

# 環境変数を確認
cat packages/database/.env
```

#### 型エラーやESLintエラー

```bash
# ESLint でエラー確認・修正
pnpm lint --fix
```

## プロジェクト構成

### アプリケーション

- **apps/api** - NestJS バックエンド API サーバー（ポート 3000）
  - 注文管理 API エンドポイント
  - 商品管理 API エンドポイント
  - ユーザー管理 API エンドポイント
  - 配送・決済管理 API エンドポイント
  - Prisma ORM を使用したデータベース操作
  - JWT 認証対応

- **apps/web** - Next.js フロントエンド（ポート 3001）
  - App Router を使用したモダンな Next.js 構成
  - shadcn/ui コンポーネントライブラリ
  - TailwindCSS v4 でスタイリング
  - ダークモード対応
  - レスポンシブデザイン

### 共有パッケージ

- **@repo/api** - API 関連の共有リソース
  - DTO（Data Transfer Object）
  - エンティティ定義
  - バリデーションスキーマ

- **@repo/database** - データベース管理パッケージ
  - Prisma スキーマ定義
  - シードデータ
  - マイグレーション管理

- **@repo/ui** - 共有 UI コンポーネントライブラリ
  - shadcn/ui ベースのコンポーネント
  - カスタムフック
  - ユーティリティ関数

- **@repo/eslint-config** - ESLint 設定（Prettier 含む）
- **@repo/jest-config** - Jest テスト設定
- **@repo/typescript-config** - TypeScript 設定

### 主要機能

#### 注文管理機能

- 注文一覧表示（データテーブル）
- 注文情報の詳細表示・編集
- 注文ステータス管理
- 決済・配送情報管理
- フィルタリング・ソート・ページネーション

#### 商品管理機能

- 商品一覧表示
- 商品情報の新規登録・編集・削除
- カテゴリ・サプライヤー管理
- 在庫管理

#### ユーザー管理機能

- ユーザー一覧表示
- ユーザー情報管理
- 注文履歴管理

#### データテーブル機能

- Tanstack Table を使用した高機能テーブル
- リアルタイム検索・フィルタリング
- カスタムカラム設定
- 一括操作対応

#### UI/UX

- モダンなダッシュボード UI
- サイドバーナビゲーション
- 確認モーダル・通知システム
- アクセシビリティ対応

全てのコードは 100% TypeScript で記述され、型安全性が保証されています。

### 技術スタック

#### フロントエンド

- **Next.js 15** - React ベースのフルスタックフレームワーク
- **React 19** - UI ライブラリ
- **TailwindCSS v4** - ユーティリティファーストの CSS フレームワーク
- **shadcn/ui** - モダンな UI コンポーネントライブラリ
- **Tanstack Table** - 高機能データテーブル
- **React Hook Form + Zod** - フォーム管理とバリデーション
- **next-themes** - ダークモード対応

#### バックエンド

- **NestJS** - Node.js のスケーラブルサーバーサイドフレームワーク
- **Prisma ORM** - 次世代 Node.js/TypeScript ORM
- **PostgreSQL** - リレーショナルデータベース
- **Docker** - コンテナ化技術

#### 開発ツール

- **TypeScript** - 静的型チェック
- **ESLint** - コード品質管理
- **Prettier** - コードフォーマッター
- **Jest** - ユニットテスト
- **Playwright** - E2E テスト
- **Husky** - Git フック管理

## 開発ガイドライン

### コード規約

- TypeScript strict モード必須
- ESLint エラーゼロを維持
- セミコロンなし、シングルクォート使用
- インデント 2 スペース
- `cn()` 関数で className を結合

### パフォーマンス最適化

- RSC（React Server Components）を優先
- Client Components は最小限に
- useMemo/useCallback を適切に使用
- コンポーネントは 300 行以下を目安

### セキュリティ

- Server Actions でサーバー処理を実装
- バリデーションはクライアント・サーバー両方で実行
- 秘密情報のログ出力・コミット禁止

## MCP PostgreSQL Server を使用したテストデータ作成ハンズオン

詳細なハンズオン手順については、[LESSON.md](LESSON.md) をご覧ください。

### 概要

このプロジェクトは、MCP（Model Context Protocol）PostgreSQL Serverを使用してテストデータを効率的に作成する学習教材です。複雑なリレーションを持つEC通販システムのデータベースに対して、MCPツールを使用してテストデータを挿入し、実際の開発現場で使えるスキルを身につけることができます。

### 学習内容

- MCP PostgreSQL Serverの導入と設定
- データベース構造の理解（ER図作成）
- 段階的なテストデータ作成（Phase 1〜4）
- 大量データの効率的な作成手法
- データ整合性の確認とベストプラクティス

### 前提条件

- PostgreSQL データベースが起動していること
- MCP PostgreSQL Server がインストールされていること
- Claude Code でMCP設定が完了していること

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [MCP PostgreSQL Server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)
