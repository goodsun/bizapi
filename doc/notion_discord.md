## 開発環境 SETUP

### NOTION でワークスペースを作成

https://www.notion.so/ja-jp

### 作成したワークスペースでデータベースを作成

ページを追加 > テーブル > 新規データベース

```
カラム名:user 種類: ユーザー
カラム名:id 種類: 数値
カラム名:name 種類: タイトル
カラム名:roles 種類: マルチセレクト
カラム名:icon 種類: ファイル＆メディア
カラム名:join 種類: 日付
カラム名:exit 種類: チェックボックス
```

作成したデータベースの URL は以下の通りになります。

```
https://www.notion.so/[ワークスペース名]/[データベース名]?v=XXXXXXXXXXXXXXXXXXXXXXXXX
```

### notion api setting

https://programming-zero.net/notion-api-setting/

上記サイトを参考に以下２点の設定を行なってください。

```
・インテグレーションを作成しシークレットを取得
・インテグレーション作成後、上で作成したデータベースのAPI操作を許可
```

### discord bot 設定

https://discord.com/developers/docs/ja/getting-started

上記サイトを参考にアプリ・bot の作成を行なってください。

```
1.アプリを作成
2.左カラムの「Bot」メニューにて
    ・PUBLIC BOTのチェックを入れる
    ・Privileged Gateway Intentsの中のSERVER MEMBERS INTENT のチェックを入れる
    ・Tokenのリセットを行い生成されたtokenをメモしておいてください。(.envファイル「DISCORD_BOT_KEY」に記載します)
    ・「save changes」をクリックし変更を保存
3.左カラムの「OAuth > URL Generator」にて
    ・SCOPES欄の「bot」をチェック
    ・BOT PERMISSIONSを必要に応じ設定(メンバーリストの読み込み限定にする場合は不要)
    ・生成される「GENERATED URL」をコピー機しておいてください。
４.生成されたGENERATED URLにブラウザでアクセス
    ・botを追加するサーバを選択(管理者権限が必要です)し「はい」をクリック
    ・「管理者」権限を与え与えることを確認し「はい」をクリック
```

### DISCORD_GUILD_ID を確認

ブラウザで discord にアクセスした際の URL が

```
https://discord.com/channels/[GUILD_ID]/[CHANNNEL_ID]
```

となっています。

[GUILD_ID]部分を.env ファイルの DISCORD_GUILD_ID に記載してください。

### .env ファイルを作成

.env.example をコピーして.env ファイルを作成し各環境変数を設定してください

```
DISCORD_BOT_KEY=[discordボットのキー]
DISCORD_GUILD_ID=[discordのguildID]
NOTION_API_KEY=[インテグレーションのシークレット]
NOTION_DATABASE_ID=[notionで作ったデータベース名]
```


### customSettings.js ファイルを作成

customSettings.js.example をコピーして customSettings ファイルを作成し 実際に利用する discord の RoleID とロール名称のマッピングを設定してください。
※ ユーザーについているロールを右クリックすることで、ID をコピーできます。 または、ロールの設定からロールを右クリックすることでも ID をコピーできます。

```
export const CUSTOM_SETTINGS = {
  // 実際に利用するdiscordのRoleIDとロール名称のマッピングを設定してください
  roles: {
    "1000000000000000000": "Admins",
    "1000000000000000001": "Member",
    "1000000000000000002": "CommunityManager",
    "1000000000000000003": "Supporter",
  },
};
```
