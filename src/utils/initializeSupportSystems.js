// 開発時に一度実行して、Firestoreに初期データを投入するためのスクリプト
// ブラウザのコンソールで実行するか、開発用のページから実行できます

import { db } from '../firebase';
import { initializeSupportSystemsData } from './supportSystemsData';

/**
 * Firestoreに初期データを投入する関数
 * 開発時に一度実行してください
 */
export const initializeData = async () => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 出産支援制度のマスターデータを投入開始...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const result = await initializeSupportSystemsData(db);
    
    if (result.errors > 0) {
      console.warn(`⚠️  一部のデータの投入に失敗しました。エラー: ${result.errors}件`);
    }
    
    return result;
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ データ投入エラー:', error);
    console.error('エラー詳細:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // よくあるエラーの解決方法を表示
    if (error.code === 'permission-denied') {
      console.error('💡 解決方法: Firestoreのセキュリティルールを確認してください。');
      console.error('   firebase deploy --only firestore:rules を実行してください。');
    } else if (error.code === 'unauthenticated') {
      console.error('💡 解決方法: ブラウザでアプリにログインしてから実行してください。');
    }
    
    throw error;
  }
};

/**
 * Firestoreからサンプルデータを削除する関数
 * ID 1-4（出産育児一時金、育児休業給付金、出産手当金、児童手当）以外を削除
 */
export const deleteSampleSystems = async () => {
  try {
    const { collection, getDocs, doc, deleteDoc } = await import('firebase/firestore');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️  サンプルデータの削除を開始...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 保持するID（正確なデータ）
    const keepIds = [1, 2, 3, 4]; // 出産育児一時金、育児休業給付金、出産手当金、児童手当
    
    const supportSystemsRef = collection(db, 'supportSystems');
    const snapshot = await getDocs(supportSystemsRef);
    
    let deletedCount = 0;
    let keptCount = 0;
    let errorCount = 0;
    
    console.log(`📝 全${snapshot.size}件のデータを確認します...`);
    
    for (const docSnapshot of snapshot.docs) {
      const docId = parseInt(docSnapshot.id, 10);
      
      if (isNaN(docId)) {
        console.log(`⚠️  ドキュメントID "${docSnapshot.id}" は数値に変換できません。スキップします。`);
        continue;
      }
      
      const data = docSnapshot.data();
      const title = data.title || data.name || '不明';
      
      if (keepIds.includes(docId)) {
        console.log(`✅ ID ${docId}「${title}」は保持します。`);
        keptCount++;
      } else {
        try {
          await deleteDoc(doc(supportSystemsRef, docSnapshot.id));
          console.log(`🗑️  ID ${docId}「${title}」を削除しました。`);
          deletedCount++;
        } catch (error) {
          console.error(`❌ ID ${docId}「${title}」の削除に失敗しました:`, error.message);
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
    
    return { kept: keptCount, deleted: deletedCount, errors: errorCount };
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ 削除エラー:', error);
    console.error('エラー詳細:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (error.code === 'permission-denied') {
      console.error('💡 解決方法: Firestoreのセキュリティルールを確認してください。');
    } else if (error.code === 'unauthenticated') {
      console.error('💡 解決方法: ブラウザでアプリにログインしてから実行してください。');
    }
    
    throw error;
  }
};

// ブラウザのコンソールから実行できるように、グローバルに公開（開発環境のみ）
if (import.meta.env.DEV) {
  window.initializeSupportSystemsData = initializeData;
  window.deleteSampleSystems = deleteSampleSystems;
  console.log('💡 開発モード: ブラウザのコンソールで以下のコマンドを実行できます:');
  console.log('   - window.initializeSupportSystemsData() : データを投入');
  console.log('   - window.deleteSampleSystems() : サンプルデータを削除（ID 1-4以外）');
}

