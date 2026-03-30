// Firestoreからサンプルデータを削除するスクリプト（Firebase Admin SDK使用）
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

// 保持するID（正確なデータ）
const keepIds = [1, 2, 3, 4]; // 出産育児一時金、育児休業給付金、出産手当金、児童手当

async function deleteSampleSystems() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️  サンプルデータの削除を開始...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const supportSystemsRef = db.collection('supportSystems');
    const snapshot = await supportSystemsRef.get();
    
    let deletedCount = 0;
    let keptCount = 0;
    let errorCount = 0;
    
    console.log(`📝 全${snapshot.size}件のデータを確認します...`);
    
    for (const doc of snapshot.docs) {
      const docId = parseInt(doc.id, 10);
      
      if (isNaN(docId)) {
        console.log(`⚠️  ドキュメントID "${doc.id}" は数値に変換できません。スキップします。`);
        continue;
      }
      
      if (keepIds.includes(docId)) {
        console.log(`✅ ID ${docId}「${doc.data().title || doc.data().name}」は保持します。`);
        keptCount++;
      } else {
        try {
          await doc.ref.delete();
          console.log(`🗑️  ID ${docId}「${doc.data().title || doc.data().name}」を削除しました。`);
          deletedCount++;
        } catch (error) {
          console.error(`❌ ID ${docId}「${doc.data().title || doc.data().name}」の削除に失敗しました:`, error.message);
          errorCount++;
        }
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 削除結果:`);
    console.log(`   ✅ 保持: ${keptCount}件`);
    console.log(`   🗑️  削除: ${deletedCount}件`);
    console.log(`   ❌ エラー: ${errorCount}件`);
    console.log(`   📝 合計: ${snapshot.size}件`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ サンプルデータの削除が完了しました。');
    
    process.exit(0);
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ エラーが発生しました:', error.message);
    console.error('エラー詳細:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
}

deleteSampleSystems();

