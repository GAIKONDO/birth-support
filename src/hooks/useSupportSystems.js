import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';

/**
 * 出産支援制度のマスターデータを取得するカスタムフック
 * リアルタイムでデータを監視し、データベースに新しいデータが追加されると自動的に更新される
 * @param {Object} options - オプション
 * @param {boolean} options.activeOnly - アクティブな制度のみ取得するか（デフォルト: true）
 * @param {string} options.category - カテゴリーでフィルタリング
 * @returns {Object} { systems, loading, error, refetch }
 */
export const useSupportSystems = (options = {}) => {
  const { activeOnly = true, category = null } = options;
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const supportSystemsRef = collection(db, 'supportSystems');
    
    // リアルタイムでデータを監視（データベースに新しいデータが追加されると自動的に更新される）
    const unsubscribe = onSnapshot(
      supportSystemsRef,
      (snapshot) => {
        try {
          let systemsData = snapshot.docs.map(doc => {
            const data = doc.data();
            // ドキュメントIDを数値に変換（可能な場合）
            // FirestoreのドキュメントIDが数値の文字列（"1", "2"など）の場合は数値に変換
            let id = doc.id;
            const parsedId = parseInt(id, 10);
            if (!isNaN(parsedId) && parsedId.toString() === id) {
              id = parsedId;
            }
            
            // データ内にもidフィールドがある場合は、それも数値に変換
            const result = {
              id: id,
              ...data
            };
            
            // データ内のidフィールドも数値に変換（一貫性のため）
            if (data.id !== undefined) {
              const dataIdParsed = parseInt(data.id, 10);
              if (!isNaN(dataIdParsed) && dataIdParsed.toString() === String(data.id)) {
                result.id = dataIdParsed;
              }
            }
            
            console.log(`[useSupportSystems] 制度 "${data.title || data.name}" のID: doc.id="${doc.id}", data.id=${data.id}, 最終ID=${result.id} (${typeof result.id})`);
            
            return result;
          });

          // クライアント側でフィルタリング
          if (activeOnly) {
            systemsData = systemsData.filter(system => system.isActive !== false);
          }

          if (category) {
            systemsData = systemsData.filter(system => system.category === category);
          }

          // displayOrderでソート
          systemsData.sort((a, b) => {
            const orderA = a.displayOrder || 999;
            const orderB = b.displayOrder || 999;
            return orderA - orderB;
          });

          console.log('[useSupportSystems] 取得した制度データ:', systemsData.length, '件');
          console.log('[useSupportSystems] 制度ID一覧:', systemsData.map(s => `${s.id} (${typeof s.id})`));

          setSystems(systemsData);
          setLoading(false);
        } catch (err) {
          console.error('出産支援制度データの処理エラー:', err);
          setError(err);
          setSystems([]);
          setLoading(false);
        }
      },
      (err) => {
        console.error('出産支援制度データの取得エラー:', err);
        console.error('エラー詳細:', {
          code: err.code,
          message: err.message
        });
        setError(err);
        setSystems([]);
        setLoading(false);
      }
    );

    // クリーンアップ関数
    return () => unsubscribe();
  }, [activeOnly, category]);

  // refetch関数（手動で再取得したい場合に使用）
  const refetch = async () => {
    // onSnapshotが自動的に更新するため、この関数は主にエラー回復用
    setLoading(true);
    // onSnapshotが自動的に再試行するため、ここでは特に何もしない
  };

  return { systems, loading, error, refetch };
};

/**
 * 出産支援制度を検索する関数
 * @param {string} searchQuery - 検索クエリ
 * @param {Object} options - オプション
 * @returns {Promise<Array>} 検索結果の配列
 */
export const searchSupportSystems = async (searchQuery, options = {}) => {
  const { activeOnly = true, category = null } = options;

  try {
    const supportSystemsRef = collection(db, 'supportSystems');
    let q = query(supportSystemsRef, orderBy('displayOrder', 'asc'));

    // カテゴリーでフィルタリング
    if (category) {
      q = query(q, where('category', '==', category));
    }

    const snapshot = await getDocs(q);
    let allSystems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // クライアント側でアクティブな制度のみフィルタリング（useSupportSystemsと同じロジック）
    if (activeOnly) {
      allSystems = allSystems.filter(system => system.isActive !== false);
    }

    // クライアント側で検索（Firestoreの全文検索は制限があるため）
    if (!searchQuery || searchQuery.trim() === '') {
      return allSystems;
    }

    const queryLower = searchQuery.toLowerCase();
    const filteredSystems = allSystems.filter(system => {
      // タイトルで検索
      if (system.title && system.title.toLowerCase().includes(queryLower)) {
        return true;
      }
      
      // 説明で検索
      if (system.description && system.description.toLowerCase().includes(queryLower)) {
        return true;
      }
      
      // 検索キーワードで検索
      if (system.searchKeywords && Array.isArray(system.searchKeywords)) {
        if (system.searchKeywords.some(keyword => keyword.toLowerCase().includes(queryLower))) {
          return true;
        }
      }
      
      // タグで検索
      if (system.tags && Array.isArray(system.tags)) {
        if (system.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
          return true;
        }
      }
      
      // 支給額で検索
      if (system.amount && system.amount.toLowerCase().includes(queryLower)) {
        return true;
      }
      
      // 対象者で検索
      if (system.eligibility && system.eligibility.toLowerCase().includes(queryLower)) {
        return true;
      }
      
      return false;
    });

    return filteredSystems;
  } catch (err) {
    console.error('出産支援制度の検索エラー:', err);
    throw err;
  }
};

