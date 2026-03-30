# Firebase Authentication設定手順

## エラー: CONFIGURATION_NOT_FOUND の解決方法

このエラーは、Firebase Authenticationの設定が不完全な場合に発生します。

## 必須の設定手順

### 1. Identity Toolkit APIの有効化（必須）

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクト「birth-support-personal」を選択
3. 「APIとサービス」→「ライブラリ」を開く
4. 検索バーで「Identity Toolkit API」を検索
5. 「Identity Toolkit API」をクリック
6. **「有効にする」をクリック**（これが最も重要です）

### 2. OAuth同意画面の設定（必須）

1. Google Cloud Consoleで「APIとサービス」→「OAuth同意画面」を開く
2. 「外部」を選択して「作成」をクリック
3. 以下の情報を入力：
   - **アプリ名**: 「出産支援制度アプリ」など
   - **ユーザーサポートメール**: あなたのメールアドレス（gkondo@ctc-america.com）
   - **アプリのロゴ**: 任意（省略可）
   - **アプリのホームページ**: `http://localhost:3000`
   - **承認済みのドメイン**: `localhost` を追加
4. 「保存して次へ」をクリック
5. 「スコープ」画面で「保存して次へ」をクリック
6. 「テストユーザー」画面で、必要に応じてテストユーザーを追加（開発中は任意）
7. 「保存して次へ」をクリック
8. 「概要」画面で設定を確認して完了

### 3. Firebase AuthenticationでGoogle認証を有効化（必須）

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト「birth-support-personal」を選択
3. 左メニューから「Authentication」をクリック
4. 「始める」をクリック（初回の場合）
5. 「Sign-in method」タブを開く
6. 「Google」プロバイダーをクリック
7. **「有効にする」トグルをONにする**
8. 「プロジェクトのサポートメール」を選択（gkondo@ctc-america.com）
9. 「保存」をクリック

### 4. OAuth 2.0 クライアントIDの確認

1. Google Cloud Consoleで「APIとサービス」→「認証情報」を開く
2. 「OAuth 2.0 クライアント ID」セクションを確認
3. 「Webアプリケーション」タイプのクライアントIDが存在することを確認
4. 存在しない場合：
   - 「認証情報を作成」→「OAuth クライアント ID」をクリック
   - 「アプリケーションの種類」で「ウェブアプリケーション」を選択
   - 「名前」を入力（例：「出産支援制度アプリ - Web」）
   - 「承認済みのリダイレクト URI」に以下を追加：
     - `http://localhost:3000`
     - `http://localhost:3000/__/auth/handler`
     - `https://birth-support-personal.firebaseapp.com/__/auth/handler`
   - 「作成」をクリック

### 5. 設定の反映を待つ

設定変更後、**最大5分程度**かかることがあります。しばらく待ってから再度ログインを試してください。

## 確認チェックリスト

- [ ] Identity Toolkit APIが有効化されている
- [ ] OAuth同意画面が設定されている
- [ ] Firebase AuthenticationでGoogle認証が有効になっている
- [ ] OAuth 2.0 クライアントIDが作成されている
- [ ] 開発サーバーを再起動した

## トラブルシューティング

### まだエラーが出る場合

1. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete または Cmd+Shift+Delete）
2. シークレット/プライベートモードで試す
3. 別のブラウザで試す
4. 5分待ってから再度試す（設定の反映に時間がかかる場合がある）

