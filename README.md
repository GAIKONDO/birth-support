# 出産支援制度アプリ

出産支援制度に関する情報を提供するパーソナルアプリケーションです。

## 機能

- Googleアカウントでのログイン認証
- マイページでの個人情報表示
- 出産支援制度の情報確認

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. AuthenticationでGoogle認証を有効化
3. Firestore Databaseを作成（必要に応じて）
4. Firestoreのセキュリティルールを設定：
   
   Firebase Console > Firestore Database > ルール タブで、以下のルールを設定してください：
   
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // ユーザーのデータへのアクセス（オーナーまたは共有メンバー）
       match /users/{userId}/data/{document=**} {
         allow read: if request.auth != null && (
           request.auth.uid == userId ||
           exists(/databases/$(database)/documents/users/$(userId)/sharedMembers/$(request.auth.email.replace(/[^a-zA-Z0-9]/g, '_'))) ||
           exists(/databases/$(database)/documents/users/$(userId)/sharedMembers/$(request.auth.uid))
         );
         allow write: if request.auth != null && (
           request.auth.uid == userId ||
           (exists(/databases/$(database)/documents/users/$(userId)/sharedMembers/$(request.auth.email.replace(/[^a-zA-Z0-9]/g, '_'))) &&
            get(/databases/$(database)/documents/users/$(userId)/sharedMembers/$(request.auth.email.replace(/[^a-zA-Z0-9]/g, '_'))).data.permission == 'editor' &&
            get(/databases/$(database)/documents/users/$(userId)/sharedMembers/$(request.auth.email.replace(/[^a-zA-Z0-9]/g, '_'))).data.status == 'accepted') ||
           (exists(/databases/$(database)/documents/users/$(userId)/sharedMembers/$(request.auth.uid)) &&
            get(/databases/$(database)/documents/users/$(userId)/sharedMembers/$(request.auth.uid)).data.permission == 'editor' &&
            get(/databases/$(database)/documents/users/$(userId)/sharedMembers/$(request.auth.uid)).data.status == 'accepted')
         );
       }
       
       // 共有メンバー管理（オーナーのみ）
       match /users/{userId}/sharedMembers/{memberId} {
         allow read: if request.auth != null && request.auth.uid == userId;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // 招待管理
       match /invitations/{invitationId} {
         allow read: if request.auth != null && (
           resource.data.email == request.auth.token.email ||
           resource.data.ownerId == request.auth.uid
         );
         allow create: if request.auth != null;
         allow delete: if request.auth != null && (
           resource.data.email == request.auth.token.email ||
           resource.data.ownerId == request.auth.uid
         );
         allow update: if request.auth != null && (
           resource.data.email == request.auth.token.email ||
           resource.data.ownerId == request.auth.uid
         );
       }
     }
   }
   ```
5. `.env.example`を`.env`にコピーして、Firebase設定値を入力

```bash
cp .env.example .env
```

`.env`ファイルにFirebaseの設定値を入力してください。

### 3. 初期データの投入

出産支援制度のマスターデータをFirestoreに投入する必要があります。

開発サーバーを起動後、ブラウザのコンソールで以下のコマンドを実行してください：

```javascript
window.initializeSupportSystemsData()
```

または、`src/utils/supportSystemsData.js`の`initialSupportSystemsData`配列を編集して、新しい制度を追加してから実行することもできます。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## プロジェクト構造

```
src/
  ├── components/        # Reactコンポーネント
  │   ├── Login.jsx      # ログインページ
  │   ├── MyPage.jsx     # マイページ
  │   └── ProtectedRoute.jsx  # 認証保護ルート
  ├── contexts/          # React Context
  │   └── AuthContext.jsx  # 認証コンテキスト
  ├── firebase.js        # Firebase設定
  ├── App.jsx            # メインアプリコンポーネント
  └── main.jsx           # エントリーポイント
```

## 出産支援制度データの管理

出産支援制度のマスターデータはFirestoreの`supportSystems`コレクションで管理されています。

### 新しい制度を追加する方法

1. `src/utils/supportSystemsData.js`の`initialSupportSystemsData`配列に新しい制度を追加
2. ブラウザのコンソールで`window.initializeSupportSystemsData()`を実行

または、Firebase Consoleから直接追加することもできます。

### データ構造

各制度は以下のフィールドを持ちます：

- `id`: 制度ID（数値）
- `title`: 制度名
- `description`: 説明
- `amount`: 支給額
- `eligibility`: 対象者
- `deadline`: 申請期限
- `referenceUrl`: 参考リンク
- `category`: カテゴリ（'national', 'prefecture', 'municipality', 'private', 'company'）
- `tags`: タグ配列（検索用）
- `searchKeywords`: 検索キーワード配列
- `isActive`: アクティブフラグ（true/false）
- `displayOrder`: 表示順序
- `createdAt`: 作成日時
- `updatedAt`: 更新日時

#### カテゴリ別の追加フィールド

**国（category: 'national'）の場合：**
- `ministryName`: 省庁名・組織名（例: '厚生労働省'）

**都道府県（category: 'prefecture'）の場合：**
- `prefectureName`: 都道府県名（例: '東京都'）

**市区町村（category: 'municipality'）の場合：**
- `municipalityName`: 市・区・町・村の名前（例: '横浜市'）
- `municipalityType`: 市区町村の種別（'市', '区', '町', '村' のいずれか）
- `prefecture`: 都道府県名（オプション、例: '神奈川県'）

**民間（category: 'private'）の場合：**
- `organizationName`: 団体名（例: 'ベビー用品支援協会'）
- `organizationType`: 団体の種類（'企業', 'NPO法人', '一般社団法人', '財団法人', 'その他' など）

**勤務先（category: 'company'）の場合：**
- `companyName`: 企業名（例: '株式会社サンプル'）

### 検索機能

検索ページでは、タイトル、説明、タグ、検索キーワード、支給額、対象者などから検索できます。

## 技術スタック

- React 19
- Vite
- Firebase Authentication
- Firebase Firestore
- React Router DOM

## ビルド

```bash
npm run build
```

## ライセンス

MIT
