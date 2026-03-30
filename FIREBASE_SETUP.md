# Firebase設定手順

## 1. Identity Toolkit APIの有効化

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクト「birth-support-personal」を選択
3. 左メニューから「APIとサービス」→「ライブラリ」をクリック
4. 検索バーで「Identity Toolkit API」を検索
5. 「Identity Toolkit API」をクリックして「有効にする」ボタンをクリック

## 2. APIキーの制限設定確認

1. Google Cloud Consoleで「APIとサービス」→「認証情報」を開く
2. APIキー（AIzaSyAI7X-BrZPoyValC015ifgXpM0hJWaQ6QA）をクリック
3. 「アプリケーションの制限」セクションを確認：
   - **開発環境の場合**: 「なし」を選択（推奨：開発時のみ）
   - **本番環境の場合**: 「HTTPリファラー（ウェブサイト）」を選択し、以下を追加：
     - `http://localhost:3000/*`
     - `http://localhost:5173/*`
     - `https://birth-support-personal.firebaseapp.com/*`
     - `https://birth-support-personal.web.app/*`
4. 「APIの制限」セクションで「Identity Toolkit API」が許可されているか確認
5. 「保存」をクリック

## 3. Firebase Authenticationの設定確認

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト「birth-support-personal」を選択
3. 左メニューから「Authentication」をクリック
4. 「Sign-in method」タブを開く
5. 「Google」プロバイダーをクリック
6. 「有効にする」トグルをONにする
7. プロジェクトのサポートメールを設定（既に設定済みの場合はそのまま）
8. 「保存」をクリック

## 4. 承認済みリダイレクトURIの確認

1. Google Cloud Consoleで「APIとサービス」→「認証情報」を開く
2. 「OAuth 2.0 クライアント ID」セクションを確認
3. WebアプリケーションのクライアントIDをクリック
4. 「承認済みのリダイレクト URI」に以下が含まれているか確認：
   - `http://localhost:3000`
   - `https://birth-support-personal.firebaseapp.com/__/auth/handler`

## トラブルシューティング

### APIキーが無効というエラーが出る場合

1. Identity Toolkit APIが有効化されているか確認
2. APIキーの制限設定を確認（開発環境では「なし」に設定）
3. 開発サーバーを再起動
4. ブラウザのキャッシュをクリア

### ログイン後にリダイレクトされない場合

1. Firebase Authenticationの設定を確認
2. 承認済みリダイレクトURIを確認
3. ブラウザのコンソールでエラーを確認

