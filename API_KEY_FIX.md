# APIキーエラーの解決方法

## エラー: API key not valid

このエラーは、APIキーがIdentity Toolkit APIで使用できない状態になっていることを示しています。

## 解決手順

### 1. Google Cloud ConsoleでAPIキーを確認

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクト「birth-support-personal」を選択
3. 「APIとサービス」→「認証情報」を開く
4. APIキーの一覧を確認

### 2. Firebase Consoleで使用されているAPIキーを確認

Firebase Consoleで表示されているAPIキーが、Google Cloud Consoleの認証情報ページに表示されない場合があります。これは正常です。

### 3. APIキーの制限を確認・修正

APIキーが見つかった場合：

1. APIキーをクリックして編集画面を開く
2. 「APIの制限」セクションを確認：
   - 「キーを制限しない」が選択されているか確認
   - または「キーを制限」が選択されている場合、「Identity Toolkit API」が含まれているか確認
3. 「アプリケーションの制限」セクションを確認：
   - 開発環境の場合：「なし」を選択
   - または「HTTPリファラー（ウェブサイト）」が選択されている場合、以下を追加：
     - `http://localhost:3000/*`
     - `http://localhost:5173/*`
     - `https://birth-support-personal.firebaseapp.com/*`
4. 「保存」をクリック

### 4. Identity Toolkit APIが有効になっているか確認

1. Google Cloud Consoleで「APIとサービス」→「ライブラリ」を開く
2. 「Identity Toolkit API」を検索
3. 「有効」になっているか確認
4. 無効な場合は「有効にする」をクリック

### 5. 新しいAPIキーを作成する（上記で解決しない場合）

1. Google Cloud Consoleで「APIとサービス」→「認証情報」を開く
2. 「認証情報を作成」→「APIキー」をクリック
3. 作成されたAPIキーをコピー
4. APIキーをクリックして編集：
   - 「APIの制限」：「Identity Toolkit API」を選択
   - 「アプリケーションの制限」：「なし」（開発環境の場合）
   - 「保存」をクリック
5. `.env`ファイルの`VITE_FIREBASE_API_KEY`を新しいAPIキーに更新
6. 開発サーバーを再起動

