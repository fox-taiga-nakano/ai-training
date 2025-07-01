# 社員管理システム

NestJS API バックエンドと Next.js フロントエンドを含む Turborepo 構成のフルスタック社員管理システムです。

## 環境構築手順

### 必要な環境

- **Node.js**: 20 以上（推奨: Node.js 20+）
- **pnpm**: 10.12.4（厳密にこのバージョンを使用）
- **Docker**: PostgreSQL データベース用

### 1. リポジトリのクローンと依存関係のインストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd ai-training

# 依存関係をインストール
pnpm install

# Husky プリコミットフックを初期化
pnpm prepare
```

### 2. データベースの設定

```bash
# PostgreSQL コンテナを起動
docker-compose up -d

# データベース環境変数の設定
cp packages/database/.env.example packages/database/.env
# packages/database/.env ファイルを編集してDATABASE_URLを設定

# Prisma Client を生成
pnpm db:generate

# データベーススキーマを適用
pnpm db:push

# 初期データを投入
pnpm db:seed
```

### 3. 開発サーバーの起動

```bash
# 全アプリケーションを同時起動
pnpm dev

# 個別起動の場合
# API サーバー（ポート 3000）
cd apps/api && pnpm dev

# Web サーバー（ポート 3001）
cd apps/web && pnpm dev
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
pnpm check-types   # TypeScript 型チェック（Web）
pnpm tsc           # 全プロジェクトの型チェック

# テスト実行
pnpm test          # ユニットテスト
pnpm test:e2e      # E2E テスト（Playwright）
pnpm test:watch    # テスト監視モード

# データベース操作
pnpm db:studio     # Prisma Studio 起動
pnpm db:reset      # データベースリセット
pnpm db:migrate    # マイグレーション実行（本番用）
```

### トラブルシューティング

#### データベース接続エラー

```bash
# Docker コンテナの状態確認
docker-compose ps

# コンテナを再起動
docker-compose restart

# 環境変数を確認
cat packages/database/.env
```

#### 型エラーやESLintエラー

```bash
# 型チェック
pnpm check-types

# ESLint でエラー確認・修正
pnpm lint --fix
```

## プロジェクト構成

### アプリケーション

- **apps/api** - NestJS バックエンド API サーバー（ポート 3000）
  - 社員管理 API エンドポイント
  - 部署管理 API エンドポイント
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

#### 社員管理機能

- 社員一覧表示（データテーブル）
- 社員情報の新規登録・編集・削除
- 部署による分類管理
- フィルタリング・ソート・ページネーション

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

## データベース構成

### Employee（社員）モデル

- `id`: 一意識別子（cuid）
- `name`: 氏名
- `email`: メールアドレス（ユニーク）
- `phone`: 電話番号（オプション）
- `position`: 役職
- `salary`: 給与（オプション）
- `hireDate`: 入社日
- `departmentId`: 部署ID（オプション）
- `status`: ステータス（ACTIVE/INACTIVE/PENDING）
- `createdAt`/`updatedAt`: 作成・更新日時

### Department（部署）モデル

- `id`: 一意識別子（cuid）
- `name`: 部署名（ユニーク）
- `description`: 説明（オプション）
- `createdAt`/`updatedAt`: 作成・更新日時
- `employees`: 所属社員一覧（リレーション）

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

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
