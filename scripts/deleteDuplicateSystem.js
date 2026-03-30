// Firestoreから重複データを削除するスクリプト（Firebase Admin SDK使用）
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数を読み込む
dotenv.config({ path: join(__dirname, '../.env') });

// Firebase Admin SDKの初期化
// サービスアカウントキーがある場合はそれを使用、なければ環境変数から設定を読み込む
let serviceAccount;
try {
  // サービスアカウントキーのパスを環境変数から取得
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountPath) {
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  }
} catch (error) {
  console.log('サービスアカウントキーが見つかりません。環境変数から設定を読み込みます。');
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // 環境変数から設定を読み込む
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('VITE_FIREBASE_PROJECT_ID環境変数が設定されていません。');
    }
    
    // デフォルトの認証情報を使用（gcloud CLIで認証済みの場合）
    admin.initializeApp({
      projectId: projectId
    });
  }
}

const db = admin.firestore();

async function deleteDuplicateSystem() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️  重複した制度データ（ID 9: 児童手当）を削除開始...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const systemRef = db.collection('supportSystems').doc('9');
    const snapshot = await systemRef.get();
    
    if (snapshot.exists) {
      await systemRef.delete();
      console.log('✅ ID 9の「児童手当」を削除しました。');
    } else {
      console.log('ℹ️  ID 9のデータは存在しませんでした。');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 重複データの削除が完了しました。');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    process.exit(0);
  }
}

deleteDuplicateSystem();

