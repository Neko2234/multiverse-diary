# 🌌 Multiverse Diary（マルチバース日記）

日記を書くと、様々なキャラクター（ペルソナ）からAIが生成したコメントをもらえるユニークな日記アプリです。

![Multiverse Diary](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?logo=tailwindcss)

## ✨ 特徴

- 📝 **日記を書く** - シンプルで使いやすい日記入力画面
- 💬 **多様な視点からのコメント** - 先生、友達、恋人、親戚、有名人、異世界人など様々なキャラクターからコメントがもらえる
- 🎭 **カスタムキャラクター** - 自分だけのオリジナルキャラクターを作成可能
- 🔄 **キャラクター管理** - ドラッグ＆ドロップで表示順を変更、表示/非表示の切り替え
- 🤖 **AI分析** - 日記の内容をAIが分析し、感情や傾向をフィードバック
- 💾 **ローカル保存** - すべてのデータはブラウザのローカルストレージに保存（プライバシー保護）
- 📱 **レスポンシブ対応** - PC・タブレット・スマートフォンで快適に利用可能

## 🚀 デモ

GitHub Pagesでホスティング: `https://<username>.github.io/multiverse-diary/`

## 🛠️ 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 19.x | UIフレームワーク |
| Vite | 7.x | ビルドツール |
| Tailwind CSS | 4.x | スタイリング |
| @dnd-kit | 6.x | ドラッグ＆ドロップ |
| Lucide React | - | アイコン |
| Google Gemini API | - | AI応答生成 |

## 📦 インストール

```bash
# リポジトリをクローン
git clone https://github.com/<username>/multiverse-diary.git
cd multiverse-diary

# 依存関係をインストール
npm install
```

## 🔧 開発

```bash
# 開発サーバーを起動（http://localhost:5173/multiverse-diary/）
npm run dev

# 本番用ビルド
npm run build

# ビルド結果をプレビュー
npm run preview

# Lintチェック
npm run lint
```

## 📁 プロジェクト構成

```
multiverse-diary/
├── public/              # 静的ファイル
├── src/
│   ├── assets/          # 画像等のアセット
│   ├── components/      # Reactコンポーネント
│   │   ├── index.js            # エクスポート集約
│   │   ├── Avatar.jsx          # アバター表示
│   │   ├── CommentCard.jsx     # コメントカード
│   │   ├── AnalysisSection.jsx # AI分析セクション
│   │   ├── PersonaSelector.jsx # ペルソナ選択UI
│   │   ├── EntryItem.jsx       # 日記エントリー表示
│   │   ├── SettingsModal.jsx   # 設定モーダル
│   │   └── AddPersonaModal.jsx # キャラクター追加モーダル
│   ├── constants/
│   │   └── personas.js  # ペルソナ定義・カラー・アイコン
│   ├── services/
│   │   └── api.js       # Gemini API通信
│   ├── App.jsx          # メインアプリコンポーネント
│   ├── App.css          # アプリスタイル
│   ├── index.css        # グローバルスタイル
│   └── main.jsx         # エントリーポイント
├── index.html
├── vite.config.js       # Vite設定
├── eslint.config.js     # ESLint設定
└── package.json
```

## ⚙️ 設定

### Gemini APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. 無料のAPIキーを取得
3. アプリの設定画面でAPIキーを入力

> 💡 APIキーはブラウザのローカルストレージにのみ保存され、外部サーバーには送信されません。

## 📱 使い方

1. **日記を書く** - 「新規」ボタンをタップして日記を入力
2. **ペルソナを選択** - コメントがほしいキャラクターを選択
3. **送信** - 「みんなにシェア」ボタンでAIコメントを生成
4. **閲覧** - 過去の日記とコメントをいつでも確認

### キャラクター管理

- **設定 → キャラクター** でキャラクターを管理
- ドラッグ＆ドロップで表示順を変更
- 👁️アイコンで表示/非表示を切り替え
- 「キャラクターを追加」で自分だけのキャラクターを作成

## 🗄️ データ保存

すべてのデータはブラウザのローカルストレージに保存されます：

| キー | 内容 |
|------|------|
| `multiverse_diary_entries` | 日記エントリー |
| `gemini_api_key` | APIキー |
| `multiverse_diary_custom_personas` | カスタムキャラクター |
| `multiverse_diary_selected_personas` | 選択中のペルソナ |
| `multiverse_diary_hidden_personas` | 非表示ペルソナID |
| `multiverse_diary_persona_order` | ペルソナ表示順 |

## 🚢 デプロイ（GitHub Pages）

```bash
# ビルド
npm run build

# distフォルダをgh-pagesブランチにデプロイ
npx gh-pages -d dist
```

## 📄 ライセンス

MIT License

## 🙏 謝辞

- [Google Gemini API](https://ai.google.dev/) - AI応答生成
- [Lucide Icons](https://lucide.dev/) - 美しいアイコン
- [dnd-kit](https://dndkit.com/) - ドラッグ＆ドロップ機能
