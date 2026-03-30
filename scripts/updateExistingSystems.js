// 既存の支援制度データを更新するスクリプト（Firebase Admin SDK使用）
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
let serviceAccount;
try {
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
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('VITE_FIREBASE_PROJECT_ID環境変数が設定されていません。');
    }
    admin.initializeApp({
      projectId: projectId
    });
  }
}

const db = admin.firestore();

// 更新するデータ
const updates = {
  1: {
    // 国の制度関連の情報
    ministryName: '厚生労働省'
  },
  2: {
    // 国の制度関連の情報
    ministryName: '厚生労働省'
  },
  3: {
    // 国の制度関連の情報
    ministryName: '厚生労働省'
  },
  4: {
    // 国の制度関連の情報
    ministryName: '厚生労働省'
  },
  5: {
    // 市区町村関連の情報
    municipalityName: '横浜市',
    municipalityType: '市',
    prefecture: '神奈川県'
  },
  6: {
    // 民間団体関連の情報
    organizationName: 'ベビー用品支援協会',
    organizationType: '一般社団法人'
  },
  7: {
    // 企業関連の情報
    companyName: '株式会社サンプル'
  }
};

async function updateExistingSystems() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 既存の支援制度データを更新開始...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const supportSystemsRef = db.collection('supportSystems');
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const [id, updateData] of Object.entries(updates)) {
      try {
        const systemRef = supportSystemsRef.doc(String(id));
        const snapshot = await systemRef.get();
        
        if (!snapshot.exists) {
          console.log(`⏭️  制度ID ${id}は存在しません。スキップします。`);
          continue;
        }
        
        // データを更新
        await systemRef.update(updateData);
        console.log(`✅ 制度ID ${id}を更新しました:`, updateData);
        updatedCount++;
      } catch (error) {
        console.error(`❌ 制度ID ${id}の更新に失敗しました:`, error.message);
        errorCount++;
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 更新結果:`);
    console.log(`   ✅ 更新: ${updatedCount}件`);
    console.log(`   ❌ エラー: ${errorCount}件`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ データ更新が完了しました！');
    
    process.exit(0);
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ エラーが発生しました:', error.message);
    console.error('エラー詳細:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
}

updateExistingSystems();

