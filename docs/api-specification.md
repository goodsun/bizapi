# BizDAO API 仕様書

## 概要

BizDAO APIは、Discord Bot連携機能を持つNFT/SBTマーケットプレイス向けのAPIです。AWS Lambda上でNode.js 20.xで動作し、DynamoDB、Discord、Notion、SQSとの連携機能を提供します。

## 基本情報

- **アプリケーション名**: bizbot
- **バージョン**: 1.0.0
- **説明**: bizendao Discord Bot
- **プラットフォーム**: AWS Lambda (Node.js 20.x)
- **フレームワーク**: Express.js + Serverless Express
- **データベース**: Amazon DynamoDB
- **外部連携**: Discord Bot、Notion、SQS

## アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Discord Bot   │────│   API Gateway   │────│  AWS Lambda     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                              ┌─────────┼─────────┐
                                              │         │         │
                                    ┌─────────────┐ ┌──────────┐ ┌──────────┐
                                    │  DynamoDB   │ │ Discord  │ │  Notion  │
                                    └─────────────┘ └──────────┘ └──────────┘
                                              │
                                        ┌──────────┐
                                        │   SQS    │
                                        └──────────┘
```

## 環境変数

### 必須環境変数
- `DISCORD_BOT_KEY`: Discord Botトークン
- `DISCORD_GUILD_ID`: Discord Guild ID
- `NOTION_API_KEY`: Notion統合シークレット
- `NOTION_DATABASE_ID`: NotionデータベースID

### DynamoDBテーブル設定
- `DYNAMO_TABLE_PREFIX`: テーブル接頭辞
- `DYNAMO_SOFT_DELETE`: ソフトデリート設定

## API エンドポイント

### 基本エンドポイント

#### GET /
- **説明**: APIのバージョン情報表示
- **レスポンス**: HTML形式でAPI名とバージョン情報

#### GET /init
- **説明**: システム初期化
- **機能**: 
  - メンバーリスト初期化
  - ショップリスト初期化
  - アイテムリスト初期化
  - コンテンツ初期化
  - Discord管理者への通知送信

### メンバー管理

#### GET /member
- **説明**: メンバーリスト取得
- **レスポンス**: HTMLとJSONのメンバー情報

#### GET /member/dump
- **説明**: 全メンバー情報のダンプ
- **レスポンス**: DynamoDBから全てのメンバー情報を取得

#### GET /member/:eoa
- **説明**: EOAアドレス指定でメンバー情報取得
- **パラメータ**: `eoa` - Ethereumアドレス
- **レスポンス**: 指定したEOAのメンバー詳細情報

#### POST /regist
- **説明**: DiscordIDとEOAアドレスの紐付け登録
- **リクエストボディ**:
  ```json
  {
    "discordId": "string",
    "eoa": "string",
    "secret": "string"
  }
  ```

#### POST /disconnect
- **説明**: DiscordIDとEOAアドレスの紐付け解除
- **リクエストボディ**:
  ```json
  {
    "discordId": "string",
    "eoa": "string"
  }
  ```

### ショップ管理

#### GET /shop
- **説明**: ショップリスト取得
- **レスポンス**: アクティブなショップ一覧

#### GET /shop/dump
- **説明**: 全ショップ情報のダンプ
- **レスポンス**: DynamoDBから全てのショップ情報を取得

#### GET /shop/id/:id
- **説明**: ショップID指定で詳細情報取得
- **パラメータ**: `id` - ショップID

#### GET /shop/eoa/:eoa
- **説明**: EOAアドレス指定でショップ情報取得
- **パラメータ**: `eoa` - Ethereumアドレス

#### POST /shop/add
- **説明**: 新規ショップ追加
- **機能**: 自動的に新しいIDを生成して追加

#### POST /shop/delete
- **説明**: ショップ削除
- **機能**: 設定に応じてソフトデリートまたは物理削除

#### POST /shop/update/:id
- **説明**: ショップ情報更新
- **パラメータ**: `id` - ショップID

### アイテム管理

#### GET /item
- **説明**: アイテムリスト取得
- **レスポンス**: アクティブなアイテム一覧

#### GET /item/id/:id
- **説明**: アイテムID指定で詳細情報取得
- **パラメータ**: `id` - アイテムID

#### GET /item/eoa/:eoa
- **説明**: EOAアドレス指定でアイテム情報取得
- **パラメータ**: `eoa` - Ethereumアドレス

#### POST /item/add
- **説明**: 新規アイテム追加
- **機能**: 自動的に新しいIDを生成して追加

#### POST /item/delete
- **説明**: アイテム削除
- **機能**: 設定に応じてソフトデリートまたは物理削除

#### POST /item/update/:id
- **説明**: アイテム情報更新
- **パラメータ**: `id` - アイテムID

### コンテンツ管理

#### GET /contents
- **説明**: コンテンツ一覧取得（カウント順）

#### GET /contents/path
- **説明**: コンテンツ一覧取得（パス順）

#### GET /contents/get/:lang
- **説明**: 言語別コンテンツ取得（カウント順）
- **パラメータ**: `lang` - 言語コード

#### GET /contents/new/:lang
- **説明**: 言語別最新コンテンツ取得
- **パラメータ**: `lang` - 言語コード

#### GET /contents/path/:lang
- **説明**: 言語別コンテンツ取得（パス順）
- **パラメータ**: `lang` - 言語コード

#### GET /contents/get/:lang/:dir/:md
- **説明**: 指定パスのコンテンツ取得
- **パラメータ**: 
  - `lang` - 言語コード
  - `dir` - ディレクトリ名
  - `md` - マークダウンファイル名

#### GET /contents/delete/:lang/:dir/:md
- **説明**: 指定パスのコンテンツ削除
- **パラメータ**: 
  - `lang` - 言語コード
  - `dir` - ディレクトリ名
  - `md` - マークダウンファイル名

#### GET /contents/create/:title
- **説明**: 新規コンテンツ作成
- **パラメータ**: `title` - コンテンツタイトル

### ブロックチェーン連携

#### GET /token/:method/:ca
- **説明**: トークン情報取得
- **パラメータ**: 
  - `method` - 実行メソッド
  - `ca` - コントラクトアドレス

#### GET /token/:method/:ca/:id
- **説明**: 特定トークンID情報取得
- **パラメータ**: 
  - `method` - 実行メソッド
  - `ca` - コントラクトアドレス
  - `id` - トークンID

#### GET /tba/:rca/:aca/:chainId/:ca/:id/:salt
- **説明**: Token Bound Account情報取得
- **パラメータ**: 
  - `rca` - レジストリコントラクトアドレス
  - `aca` - アカウントコントラクトアドレス
  - `chainId` - チェーンID
  - `ca` - コントラクトアドレス
  - `id` - トークンID
  - `salt` - ソルト値

#### GET /own/:eoa/:ca
- **説明**: EOA所有NFT情報取得
- **パラメータ**: 
  - `eoa` - Ethereumアドレス
  - `ca` - コントラクトアドレス

#### GET /ownlist/:eoa
- **説明**: EOA所有の全NFT/SBTリスト取得
- **パラメータ**: `eoa` - Ethereumアドレス

#### GET /metadata/member/:id
- **説明**: メンバーのメタデータ取得（寄付情報含む）
- **パラメータ**: `id` - メンバーID

### Discord連携

#### GET /discord
- **説明**: Discord情報取得

#### GET /discord/:id
- **説明**: DiscordID→EOAアドレス変換
- **パラメータ**: `id` - DiscordユーザーID

#### GET /sendMember/:id/:mes
- **説明**: 指定ユーザーへのDM送信
- **パラメータ**: 
  - `id` - DiscordユーザーID
  - `mes` - メッセージ内容

### システム管理

#### GET /membersync
- **説明**: メンバー情報同期（本番環境以外）
- **機能**: マスターテーブルからレプリカテーブルへのデータ同期

#### GET /dynamosync
- **説明**: DynamoDB同期処理開始（本番環境以外）

#### GET /dynamo
- **説明**: DynamoDB情報取得

#### GET /dynamo/member/:id
- **説明**: DynamoDB特定メンバー情報取得
- **パラメータ**: `id` - メンバーID

#### GET /notion
- **説明**: Notion情報取得

#### GET /eoalist
- **説明**: EOAアドレスリスト取得

### トランザクション管理

#### POST /transrequest
- **説明**: NFT購入時の転送リクエスト処理
- **リクエストボディ**:
  ```json
  {
    "ca": "string",
    "id": "string",
    "eoa": "string",
    "secret": "string"
  }
  ```
- **機能**: 
  - 購入者認証
  - 作家への転送通知
  - Discord通知送信

## Discord Slash Commands

### POST /interactions
Discord Botのインタラクション処理エンドポイント

#### 対応コマンド:

1. **`/gm`**
   - 機能: あいさつコマンド
   - レスポンス: "GM!"メッセージをチャンネルに送信

2. **`/regist <eoa>`**
   - 機能: EOAアドレス登録
   - パラメータ: EOAアドレス
   - 処理: 
     - EOA有効性確認
     - 重複確認
     - 秘密キー生成
     - 登録URL送信

3. **`/member-sbt`**
   - 機能: 会員証SBT発行
   - 権限: Holder &FANロール必要
   - 処理: SBT発行用URL生成・送信

4. **`/editor`**
   - 機能: 記事編集画面アクセス
   - 処理: エディター用URL生成・送信

5. **`/apply`**
   - 機能: NFT所有確認・ロール付与
   - 処理: 
     - 所有NFT/SBT確認
     - Holder &FANロール付与（所有している場合）

6. **`/sync <type>`**
   - 機能: データ同期
   - パラメータ: "notion" または "dynamo"
   - 権限: 同期ロール必要

7. **`/getkey <nft_path>`**
   - 機能: NFT秘密キー取得
   - パラメータ: NFTパス
   - 権限: NFT所有者のみ

## データモデル

### Member（メンバー）
```json
{
  "DiscordId": "string",
  "Eoa": "string",
  "Name": "string",
  "Icon": "string",
  "Roles": ["string"],
  "Secret": "string"
}
```

### Shop（ショップ）
```json
{
  "id": "string",
  "name": "string",
  "eoa": "string",
  "status": "string"
}
```

### Item（アイテム）
```json
{
  "id": "string",
  "name": "string",
  "eoa": "string",
  "ca": "string",
  "tokenId": "string"
}
```

### Content（コンテンツ）
```json
{
  "id": "string",
  "path": "string",
  "title": "string",
  "imgurl": "string",
  "created": "timestamp",
  "count": "number"
}
```

## ロール管理

システムで使用されるDiscordロール:

```javascript
const roleNumbers = {
  "Admin": "1143943645205102632",
  "Engineer": "1144649703712104639", 
  "member": "1206600859962834954",
  "Holder &Fan": "1206603253580701726",
  "Potter": "1206865922950955028",
  "CommunityManager": "1206867833292722236",
  "Supporter": "1210764298280902656",
  "Soul Binder": "1287453818853789787"
};
```

## SQS メッセージ処理

### サポートされる機能:
- `discord-message`: Discord チャンネルメッセージ送信
- `discord-direct-message`: Discord DM送信
- `notion-sync`: Notion同期処理
- `dynamo-sync`: DynamoDB同期処理

### メッセージ形式:
```json
{
  "function": "string",
  "params": {
    "message": "string",
    "channelId": "string",
    "userId": "string"
  }
}
```

## セキュリティ

### CORS設定
- Origin: "*" (全てのオリジンを許可)
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization

### Discord認証
- Discord Interactions APIのverifyKeyMiddlewareを使用
- 公開キーによる署名検証

### アクセス制御
- ロールベースのアクセス制御
- 特定コマンドには対応するロールが必要
- NFT所有権による認証

## デプロイ

### 環境別デプロイスクリプト
- `npm run local`: ローカル環境
- `npm run test`: テスト環境
- `npm run flow`: フロー環境
- `npm run stg`: ステージング環境
- `npm run prd`: 本番環境

### AWS Lambda設定
- Runtime: Node.js 20.x
- Role: nodoapi-role
- API Gateway: {proxy+}設定
- CORS設定とタイムアウト設定が必要

## 外部連携設定

### Discord Bot設定
- 詳細: [Discord設定ドキュメント](../doc/discord_setting.md)
- 必要権限: SERVER MEMBERS INTENT

### Notion連携設定
- 詳細: [Notion設定ドキュメント](../doc/notion_setting.md)

### スラッシュコマンド登録
- 詳細: [スラッシュコマンド設定](../doc/slashcommand/slash_command.md)

## エラーハンドリング

### 一般的なエラーレスポンス
- 認証失敗: 権限エラーメッセージ
- データ不正: バリデーションエラー
- システムエラー: 内部エラーログ出力

### 開発環境での制限
- 本番環境では一部の同期機能が無効
- 開発・テスト環境でのみ利用可能な機能あり

## ログ設定

- CloudWatch Logsとの連携
- Lambda関数からのログ出力
- Discord通知によるシステム状態監視

## 今後の拡張予定

- API認証の強化
- レート制限の実装
- エラーハンドリングの改善
- パフォーマンス最適化
- テストカバレッジの向上