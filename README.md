# EC通販システム

NestJS API バックエンドと Next.js フロントエンドを含む Turborepo 構成のフルスタックEC通販システムです。

## 環境構築手順

### 必要な環境

- **Node.js**: 20 以上（推奨: Node.js 20+）
- **pnpm**: 10.13.1（厳密にこのバージョンを使用）
- **Docker**: PostgreSQL データベース用

### 1. リポジトリのクローンと依存関係のインストール

※`git bash`で実行してください

```bash
# リポジトリをクローン
git clone https://github.com/fox-taiga-nakano/ai-training.git
cd ai-training

# pnpmの確認
pnpm -v

# 以下のような出力であれば `Y` を入力して下さい
! Corepack is about to download https://registry.npmjs.org/pnpm/-/pnpm-10.13.1.tgz
? Do you want to continue? [Y/n] Y

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

---

## MCPハンズオン学習

### 概要

このプロジェクトは、MCP（Model Context Protocol）PostgreSQL Serverを使用してテストデータを効率的に作成する学習教材です。
複雑なリレーションを持つEC通販システムのデータベースに対して、MCPを活用してテストデータを挿入し、実際の開発現場で使えるスキルを身につけることができます。

### 学習課題と時間配分

- **チュートリアル: ER図作成**: 15分
  - データベース構造の理解
  - スキーマの可視化
  - MCP PostgreSQL Serverを使用したテーブル構造分析
- **課題: 大量データ作成**: 10分
  - 1000件のテストデータ作成
  - 効率的な作成手法
  - データ整合性の確認

**総時間**: 約25分

### 前提条件

- PostgreSQL データベースが起動していること（上記環境構築手順を完了）
- Github Copilot でMCP PostgreSQL Server設定が完了していること

### ハンズオン手順

詳細なハンズオン手順については、[LESSON.md](LESSON.md) をご覧ください。

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [MCP PostgreSQL Server](https://github.com/antonorlov/mcp-postgres-server)
