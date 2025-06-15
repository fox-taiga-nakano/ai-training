# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは、Turborepo を使用したフルスタック monorepo で、NestJS APIバックエンドと Next.js フロントエンドを含む社員管理システムです。

## アーキテクチャ

### アプリケーション構成

- `apps/api/` - NestJS バックエンド (ポート3000)
- `apps/web/` - Next.js フロントエンド (ポート3001)

### 共有パッケージ

- `@repo/api` - 共有APIリソース（DTO、Entity等）
- `@repo/ui` - 共有React UIコンポーネントライブラリ（shadcn/ui ベース）
- `@repo/eslint-config` - ESLint設定
- `@repo/jest-config` - Jest設定
- `@repo/typescript-config` - TypeScript設定

### フロントエンド構成

- Next.js 15 + React 19
- TailwindCSS v4
- shadcn/ui コンポーネント
- Tanstack Table（データテーブル用）
- React Hook Form + Zod（フォーム管理）
- ダークモード対応（next-themes）

### バックエンド構成

- NestJS フレームワーク
- 現在はメモリ内データストレージ（実際のDBなし）
- RESTful API エンドポイント

## 開発コマンド

### 開発サーバー起動

```bash
pnpm dev  # 全アプリケーション同時起動
```

### ビルド

```bash
pnpm build  # 全アプリケーションビルド
```

### テスト

```bash
pnpm test        # ユニットテスト実行
pnpm test:e2e    # E2Eテスト実行（Playwright使用）
```

### コード品質

```bash
pnpm lint        # ESLint実行
pnpm format      # Prettier実行
```

### 個別アプリケーション操作

```bash
# APIのみ開発モード
cd apps/api && pnpm dev

# Webのみ開発モード
cd apps/web && pnpm dev

# 個別テスト実行
cd apps/web && pnpm test:watch
```

## コード規約

### UIコンポーネント

- 共有コンポーネントは `@repo/ui` パッケージに配置
- shadcn/ui のパターンに従う
- Tailwind CSS クラスを使用
- バリアント管理には `class-variance-authority` を使用

### APIデザイン

- NestJS の標準的なパターンに従う
- DTO は `@repo/api` パッケージで共有
- エンティティとDTOを明確に分離

### 日本語対応

- UIテキストは日本語を使用
- コメントは日本語で記述
- エラーメッセージも日本語対応

### フォーム処理

- React Hook Form + Zod の組み合わせを使用
- バリデーションスキーマは型安全に定義

## 主要機能

### 社員管理

- 社員一覧表示（データテーブル）
- 社員新規登録フォーム
- 部署管理
- 権限管理

### データテーブル機能

- フィルタリング
- ソート
- ページネーション
- カスタムカラム定義

## 開発時の注意点

- TypeScript strict モードが有効
- ESLint で警告ゼロを維持（max-warnings 0）
- パッケージ間の依存関係は workspace プロトコルを使用
- Node.js 18以上が必要
- pnpm 10.11.0 を使用
