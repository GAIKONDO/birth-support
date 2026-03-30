# APIキーの設定手順

## 方法1: Firebase ConsoleからAPIキーを確認（推奨）

Firebase ConsoleでAPIキーを確認できます：

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト「birth-support-personal」を選択
3. 左メニューの⚙️（設定）アイコンをクリック
4. 「プロジェクトの設定」をクリック
5. 「全般」タブを開く
6. 「ウェブアプリ」セクションで、既存のアプリを選択するか、新規作成
7. 「SDK の設定と構成」セクションで、`firebaseConfig`の`apiKey`を確認

現在のAPIキー: `AIzaSyAI7X-BrZPoyValC015ifgXpM0hJWaQ6QA`

## 方法2: Google Cloud ConsoleでAPIキーを作成

Google Cloud Consoleで新しいAPIキーを作成する場合：

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクト「birth-support-personal」を選択
3. 「APIとサービス」→「認証情報」を開く
4. 上部の「認証情報を作成」→「APIキー」をクリック
5. 作成されたAPIキーをコピー
6. APIキーをクリックして編集：
   - **名前**: 「Firebase Web App API Key」など
   - **アプリケーションの制限**: 「なし」（開発環境の場合）
   - **APIの制限**: 「Identity Toolkit API」を選択
   - 「保存」をクリック
7. `.env`ファイルの`VITE_FIREBASE_API_KEY`を新しいAPIキーに更新

## 重要な設定

### Identity Toolkit APIの有効化（必須）

1. Google Cloud Consoleで「APIとサービス」→「ライブラリ」を開く
2. 「Identity Toolkit API」を検索
3. 「Identity Toolkit API」をクリック
4. 「有効にする」をクリック

### Firebase Authenticationの設定

1. Firebase Consoleで「Authentication」→「Sign-in method」を開く
2. 「Google」をクリック
3. 「有効にする」をONにする
4. 「保存」をクリック

