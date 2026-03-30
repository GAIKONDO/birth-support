import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { searchSupportSystems, useSupportSystems } from '../hooks/useSupportSystems';
import { useOwnerId } from '../hooks/useOwnerId';
import { categoryLabels, initialSupportSystemsData } from '../utils/supportSystemsData';
import { initializeData } from '../utils/initializeSupportSystems';
import './Search.css';

// モーダル表示時にbodyのスクロールを無効化するカスタムフック
const useDisableScroll = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
};

const Search = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  // URLパラメータを唯一の情報源として使用
  const selectedCategory = searchParams.get('category') || 'support';
  const [searchResults, setSearchResults] = useState([]);
  const [savedItems, setSavedItems] = useState(new Set());
  const [loading, setLoading] = useState(false);
  
  // オーナーIDと権限を取得
  const { ownerId, loading: ownerIdLoading, isSharedMember, permission } = useOwnerId();
  
  // 支援制度カテゴリの場合、Firestoreからデータを取得
  const { systems: supportSystems, loading: systemsLoading } = useSupportSystems({ 
    activeOnly: true 
  });
  
  // 自動投入の状態管理
  const [hasAutoInitialized, setHasAutoInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // データが不足している場合、自動的にデータを投入（一度だけ実行）
  useEffect(() => {
    if (!currentUser || systemsLoading || isInitializing || hasAutoInitialized) return;
    
    // 期待される制度ID（1-8）
    const expectedIds = [1, 2, 3, 4, 5, 6, 7, 8];
    const existingIds = supportSystems.map(s => {
      const id = typeof s.id === 'string' ? parseInt(s.id, 10) : s.id;
      return isNaN(id) ? null : id;
    }).filter(id => id !== null);
    
    const missingIds = expectedIds.filter(id => !existingIds.includes(id));
    
    console.log('[Search] 自動投入チェック:', {
      supportSystemsLength: supportSystems.length,
      existingIds,
      missingIds,
      hasAutoInitialized
    });
    
    // データが空、または新しいデータが不足している場合
    if ((supportSystems.length === 0 || missingIds.length > 0) && !systemsLoading) {
      if (supportSystems.length === 0) {
        console.log('📝 [Search] Firestoreにデータが存在しないため、自動的にデータを投入します...');
      } else {
        console.log(`📝 [Search] Firestoreに不足しているデータ（ID: ${missingIds.join(', ')}）を追加するため、自動的にデータを投入します...`);
      }
      setHasAutoInitialized(true);
      setIsInitializing(true);
      
      initializeData()
        .then(() => {
          console.log('✅ [Search] データ投入が完了しました。');
          // ページをリロードしてデータを再取得
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        })
        .catch((error) => {
          console.error('❌ [Search] データ投入エラー:', error);
          setIsInitializing(false);
          setHasAutoInitialized(false); // エラー時は再試行可能にする
        });
    }
  }, [currentUser, systemsLoading, supportSystems, isInitializing, hasAutoInitialized]);
  
  // 追加済み制度とアクションの状態管理
  const [addedSystems, setAddedSystems] = useState(new Set());
  const [actions, setActions] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedParentAction, setSelectedParentAction] = useState(null);
  const [favoriteItems, setFavoriteItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  
  // フィルター状態
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterPrefecture, setFilterPrefecture] = useState('');
  const [filterMunicipality, setFilterMunicipality] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTargetAudience, setFilterTargetAudience] = useState([]); // 複数選択可能な配列に変更
  
  // ターゲットオーディエンスのラベル定義
  const targetAudienceLabels = {
    'company': '企業のための制度',
    'pre-pregnant': '妊娠前',
    'pregnant': '妊婦',
    'parent-0-1': '0-1歳の親',
    'parent-1-2': '1-2歳の親',
    'parent-2-3': '2-3歳の親',
    'parent-3-6': '3-6歳の親',
    'parent-6-plus': '6歳以上の親'
  };
  
  // 妊娠前の判定関数
  const isPrePregnantSystem = (system) => {
    return system.title?.includes('不妊治療') || 
           system.title?.includes('生殖補助') || 
           system.title?.includes('凍結卵子') ||
           system.description?.includes('不妊治療') ||
           system.description?.includes('生殖補助') ||
           system.tags?.some(tag => tag.includes('不妊治療') || tag.includes('生殖補助'));
  };
  
  // 対象者フィルターボタンのトグル関数
  const toggleTargetAudienceFilter = (audience) => {
    setFilterTargetAudience(prev => {
      if (prev.includes(audience)) {
        return prev.filter(a => a !== audience);
      } else {
        return [...prev, audience];
      }
    });
    setCurrentPage(1); // フィルター変更時は1ページ目に戻す
  };

  // モーダル表示時にbodyのスクロールを無効化
  useDisableScroll(selectedSystem && selectedSystem.type === 'support-system' || isFilterModalOpen);


  // カテゴリの定義
  const categories = [
    { id: 'support', label: '支援制度', icon: '🤝' },
    { id: 'city-hall', label: '市役所', icon: '🏛️' },
    { id: 'medical', label: '医療機関', icon: '🏥' },
    { id: 'community', label: 'コミュニティー', icon: '👥' },
    { id: 'nursery', label: '保育施設', icon: '🏫' },
    { id: 'lessons', label: '習い事', icon: '🎨' },
    { id: 'education', label: '知育', icon: '📚' }
  ];

  // Firestoreから追加済み制度を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const addedSystemsRef = doc(db, 'users', ownerId, 'data', 'addedSystems');
    
    getDoc(addedSystemsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const systemIds = data.systemIds || [];
          setAddedSystems(new Set(systemIds));
        } else {
          setAddedSystems(new Set());
        }
      })
      .catch((error) => {
        console.error('追加済み制度読み込みエラー:', error);
      });
    
    const unsubscribe = onSnapshot(addedSystemsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const systemIds = data.systemIds || [];
        setAddedSystems(new Set(systemIds));
      } else {
        setAddedSystems(new Set());
      }
    }, (error) => {
      console.error('追加済み制度監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);

  // Firestoreからアクションを読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const actionsRef = doc(db, 'users', ownerId, 'data', 'actions');
    
    const unsubscribe = onSnapshot(actionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setActions(data.actions || []);
      } else {
        setActions([]);
      }
    }, (error) => {
      console.error('アクション監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);

  // Firestoreから出産予定日を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
    const unsubscribe = onSnapshot(userDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDueDate(data.dueDate || '');
      } else {
        setDueDate('');
      }
    }, (error) => {
      console.error('出産予定日監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);

  // Firestoreから保存済みアイテムを読み込む
  useEffect(() => {
    if (!currentUser) return;

    const savedItemsRef = doc(db, 'users', currentUser.uid, 'data', 'savedSearchItems');
    
    getDoc(savedItemsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSavedItems(new Set(data.itemIds || []));
          setFavoriteItems(new Set(data.favoriteItemIds || []));
        }
      })
      .catch((error) => {
        console.error('保存済みアイテム読み込みエラー:', error);
      });

    const unsubscribe = onSnapshot(savedItemsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSavedItems(new Set(data.itemIds || []));
        setFavoriteItems(new Set(data.favoriteItemIds || []));
      } else {
        setSavedItems(new Set());
        setFavoriteItems(new Set());
      }
    }, (error) => {
      console.error('保存済みアイテム監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // URLパラメータが変更されたときに検索クエリとページをリセット
  useEffect(() => {
    setSearchQuery('');
    setCurrentPage(1);

    // 支援制度以外のカテゴリの場合は検索結果をクリア
    if (selectedCategory !== 'support') {
      setSearchResults([]);
    }
  }, [selectedCategory]);

  // 都道府県と市区町村の一覧を取得
  const getPrefectureList = () => {
    const prefectures = new Set();
    initialSupportSystemsData.forEach(system => {
      if (system.prefectureName) {
        prefectures.add(system.prefectureName);
      }
    });
    return Array.from(prefectures).sort();
  };

  const getMunicipalityList = (prefecture = '') => {
    const municipalities = new Set();
    initialSupportSystemsData.forEach(system => {
      if (system.municipalityName) {
        if (!prefecture || system.prefectureName === prefecture) {
          municipalities.add(system.municipalityName);
        }
      }
    });
    return Array.from(municipalities).sort();
  };

  // フィルター適用関数
  const applyFilters = (results) => {
    let filtered = results;
    
    if (filterPrefecture) {
      filtered = filtered.filter(item => item.prefectureName === filterPrefecture);
    }
    
    if (filterMunicipality) {
      filtered = filtered.filter(item => item.municipalityName === filterMunicipality);
    }
    
    if (filterCategory) {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    // 複数選択された対象者でフィルタリング（いずれかが一致すれば表示）
    if (filterTargetAudience.length > 0) {
      filtered = filtered.filter(item => {
        // 選択された対象者のいずれかが一致すれば表示
        return filterTargetAudience.some(selected => {
          // 妊娠前のフィルタリング
          if (selected === 'pre-pregnant') {
            return isPrePregnantSystem(item);
          }
          
          // その他の対象者フィルタリング
          if (!item.targetAudience || !Array.isArray(item.targetAudience)) {
            return false;
          }
          return item.targetAudience.includes(selected);
        });
      });
    }
    
    return filtered;
  };

  // 支援制度カテゴリが選択されていて、検索キーワードが空の場合、全ての制度を表示
  // マスターデータ（initialSupportSystemsData）を直接参照して表示
  useEffect(() => {
    console.log('[Search] マスターデータから検索結果を生成:', {
      selectedCategory,
      searchQuery: searchQuery.trim(),
      masterDataLength: initialSupportSystemsData.length,
      filterPrefecture,
      filterMunicipality,
      filterCategory
    });
    
    if (selectedCategory === 'support' && !searchQuery.trim()) {
      // マスターデータから直接検索結果を生成
      let formattedResults = initialSupportSystemsData
        .filter(system => system.isActive !== false) // アクティブな制度のみ
        .map(system => ({
          id: system.id,
          name: system.title,
          description: system.description,
          amount: system.amount,
          eligibility: system.eligibility,
          deadline: system.deadline,
          referenceUrl: system.referenceUrl,
          category: system.category,
          type: 'support-system',
          // カテゴリ別の具体的な名称を追加
          ministryName: system.ministryName || null,
          prefectureName: system.prefectureName || null,
          municipalityName: system.municipalityName || null,
          organizationName: system.organizationName || null,
          companyName: system.companyName || null,
          // ターゲットオーディエンスを追加
          targetAudience: system.targetAudience || []
        }));
      
      // フィルターを適用
      formattedResults = applyFilters(formattedResults);
      
      console.log('[Search] formattedResults設定（マスターデータから）:', formattedResults.length, '件');
      setSearchResults(formattedResults);
      setCurrentPage(1); // フィルター変更時は1ページ目に戻す
    }
  }, [selectedCategory, searchQuery, filterPrefecture, filterMunicipality, filterCategory, filterTargetAudience]);

  // 検索実行
  const handleSearch = async () => {
    setLoading(true);
    
    try {
      // 支援制度カテゴリの場合はマスターデータから検索
      if (selectedCategory === 'support') {
        const query = searchQuery.trim().toLowerCase() || '';
        
        // マスターデータから検索
        let results = initialSupportSystemsData.filter(system => system.isActive !== false);
        
        // 検索キーワードがある場合はフィルタリング
        if (query) {
          results = results.filter(system => {
            // タイトルで検索
            if (system.title && system.title.toLowerCase().includes(query)) {
              return true;
            }
            // 説明で検索
            if (system.description && system.description.toLowerCase().includes(query)) {
              return true;
            }
            // 検索キーワードで検索
            if (system.searchKeywords && Array.isArray(system.searchKeywords)) {
              if (system.searchKeywords.some(keyword => keyword.toLowerCase().includes(query))) {
                return true;
              }
            }
            // タグで検索
            if (system.tags && Array.isArray(system.tags)) {
              if (system.tags.some(tag => tag.toLowerCase().includes(query))) {
                return true;
              }
            }
            // 支給額で検索
            if (system.amount && system.amount.toLowerCase().includes(query)) {
              return true;
            }
            // 対象者で検索
            if (system.eligibility && system.eligibility.toLowerCase().includes(query)) {
              return true;
            }
            return false;
          });
        }
        
        // 検索結果をSearch.jsxの形式に変換
        let formattedResults = results.map(system => ({
          id: system.id,
          name: system.title,
          description: system.description,
          amount: system.amount,
          eligibility: system.eligibility,
          deadline: system.deadline,
          referenceUrl: system.referenceUrl,
          category: system.category,
          type: 'support-system', // 識別用
          // カテゴリ別の具体的な名称を追加
          ministryName: system.ministryName || null,
          prefectureName: system.prefectureName || null,
          municipalityName: system.municipalityName || null,
          organizationName: system.organizationName || null,
          companyName: system.companyName || null,
          // ターゲットオーディエンスを追加
          targetAudience: system.targetAudience || []
        }));
        
        // フィルターを適用
        formattedResults = applyFilters(formattedResults);
        
        setSearchResults(formattedResults);
        setCurrentPage(1); // 検索結果が変わったら1ページ目に戻す
      } else {
        // その他のカテゴリは検索キーワードが必要
        if (!searchQuery.trim()) {
          setSearchResults([]);
          return;
        }
        // その他のカテゴリはモックデータを使用
      const mockResults = generateMockResults(selectedCategory, searchQuery);
      setSearchResults(mockResults);
      }
    } catch (error) {
      console.error('検索エラー:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // モック結果を生成
  const generateMockResults = (category, query) => {
    const baseResults = {
      'city-hall': [
        { id: '1', name: '市役所 本庁', address: '東京都千代田区1-1-1', phone: '03-1234-5678', description: '市役所の本庁舎です。各種手続きが可能です。' },
        { id: '2', name: '市役所 支所A', address: '東京都千代田区2-2-2', phone: '03-2345-6789', description: '市役所の支所です。' }
      ],
      'medical': [
        { id: '1', name: '○○産婦人科医院', address: '東京都新宿区1-1-1', phone: '03-1111-2222', description: '産婦人科専門の医療機関です。' },
        { id: '2', name: '△△小児科クリニック', address: '東京都新宿区2-2-2', phone: '03-3333-4444', description: '小児科専門のクリニックです。' }
      ],
      'support': [], // Firestoreから取得するため、モックデータは空に
      'community': [
        { id: '1', name: 'ママサークル「はじめまして」', address: '東京都渋谷区1-1-1', description: '新米ママのためのサークルです。' },
        { id: '2', name: 'パパママ交流会', address: '東京都渋谷区2-2-2', description: 'パパとママの交流会です。' }
      ],
      'nursery': [
        { id: '1', name: '○○保育園', address: '東京都世田谷区1-1-1', phone: '03-5555-6666', description: '認可保育園です。0歳から受け入れ可能。' },
        { id: '2', name: '△△保育園', address: '東京都世田谷区2-2-2', phone: '03-7777-8888', description: '認可保育園です。' }
      ],
      'lessons': [
        { id: '1', name: 'リトミック教室', address: '東京都港区1-1-1', phone: '03-9999-0000', description: '0歳から参加できるリトミック教室です。' },
        { id: '2', name: 'ベビースイミング', address: '東京都港区2-2-2', phone: '03-1111-2222', description: 'ベビースイミング教室です。' }
      ],
      'education': [
        { id: '1', name: '知育玩具レンタルサービス', address: 'オンライン', description: '知育玩具をレンタルできるサービスです。' },
        { id: '2', name: 'ベビー知育教室', address: '東京都中央区1-1-1', phone: '03-3333-4444', description: '0歳から参加できる知育教室です。' }
      ]
    };

    const results = baseResults[category] || [];
    // 検索クエリでフィルタリング（実際の実装では、サーバー側でフィルタリング）
    return results.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
    );
  };

  // アイテムをマイページに保存
  const handleSaveItem = async (item) => {
    if (!currentUser) return;

    try {
      const savedItemsRef = doc(db, 'users', currentUser.uid, 'data', 'savedSearchItems');
      const snapshot = await getDoc(savedItemsRef);
      const currentData = snapshot.exists() ? snapshot.data() : {};
      const currentItemIds = currentData.itemIds || [];
      const currentFavoriteIds = currentData.favoriteItemIds || [];
      
      const itemId = `${selectedCategory}-${item.id}`;
      
      if (currentItemIds.includes(itemId)) {
        alert('既に登録されています。');
        return;
      }

      const updatedItemIds = [...currentItemIds, itemId];
      await setDoc(savedItemsRef, { itemIds: updatedItemIds }, { merge: true });
      
      // アイテムの詳細情報も保存
      const itemRef = doc(db, 'users', currentUser.uid, 'data', 'savedSearchItems', 'items', itemId);
      await setDoc(itemRef, {
        ...item,
        category: selectedCategory,
        savedAt: new Date().toISOString()
      }, { merge: true });

      // お気に入りにも自動的に追加
      if (!currentFavoriteIds.includes(itemId)) {
        const updatedFavoriteIds = [...currentFavoriteIds, itemId];
        await setDoc(savedItemsRef, { favoriteItemIds: updatedFavoriteIds }, { merge: true });
        setFavoriteItems(new Set(updatedFavoriteIds));
      }

      alert('マイページに登録しました。');
    } catch (error) {
      console.error('アイテム保存エラー:', error);
      alert('登録に失敗しました。');
    }
  };

  // アイテムが保存済みかチェック
  const isItemSaved = (item) => {
    // 支援制度の場合、出産支援制度に追加済みならマイページにも登録済みとして扱う
    if (item.type === 'support-system') {
      return isSystemAdded(item.id);
    }
    const itemId = `${selectedCategory}-${item.id}`;
    return savedItems.has(itemId);
  };

  // 支援制度が追加済みかチェック
  const isSystemAdded = (systemId) => {
    const systemIdNum = typeof systemId === 'string' ? parseInt(systemId, 10) : systemId;
    
    // addedSystemsに含まれているかチェック
    if (addedSystems.has(systemIdNum)) {
      return true;
    }
    
    // アクションのサブアクションとして追加されているかチェック
    for (const action of actions) {
      if (action.subActions && Array.isArray(action.subActions)) {
        for (const subAction of action.subActions) {
          let expectedActionName = null;
          if (systemIdNum === 1) {
            expectedActionName = '出産育児一時金';
          } else if (systemIdNum === 2) {
            expectedActionName = '育児休業の申請';
          } else if (systemIdNum === 3) {
            expectedActionName = '出産手当金の申請';
          } else if (systemIdNum === 4) {
            expectedActionName = '児童手当の申請';
          }
          
          if (expectedActionName && subAction.actionName === expectedActionName) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // 追加済み制度をFirestoreに保存
  const saveAddedSystems = async (systemIds) => {
    if (!currentUser || !ownerId) return;
    
    if (isSharedMember && permission !== 'editor') {
      alert('共有メンバーは編集権限がありません。');
      return;
    }
    
    try {
      const addedSystemsRef = doc(db, 'users', ownerId, 'data', 'addedSystems');
      await setDoc(addedSystemsRef, { systemIds: Array.from(systemIds) }, { merge: true });
    } catch (error) {
      console.error('追加済み制度保存エラー:', error);
    }
  };

  // 支援制度を出産支援制度ページに追加
  const handleAddToSupportSystems = (system, event) => {
    if (!system || system.type !== 'support-system') return;
    
    // 閲覧者の場合は追加できない
    if (isSharedMember && permission !== 'editor') {
      alert('共有メンバーは編集権限がありません。');
      return;
    }
    
    setSelectedSystem(system);
    // デフォルトで最初のアクションを選択（あれば）
    if (actions.length > 0) {
      setSelectedParentAction(actions[0].id);
    } else {
      setSelectedParentAction(null);
    }
  };

  // 確認して追加
  const handleConfirmAddToSupportSystems = async () => {
    if (!selectedSystem || !currentUser || !selectedParentAction) {
      alert('親アクションを選択してください。');
      return;
    }

    // 日付をYYYY-MM-DD形式に変換
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // 出産予定日を基準に実施期間を計算
    let startDate, endDate;
    
    if (dueDate) {
      const due = new Date(dueDate);
      const systemIdNum = typeof selectedSystem.id === 'string' ? parseInt(selectedSystem.id, 10) : selectedSystem.id;
      
      switch (systemIdNum) {
        case 1: // 出産育児一時金
          startDate = new Date(due);
          startDate.setDate(startDate.getDate() - 14);
          endDate = new Date(due);
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 2: // 育児休業給付金
          startDate = new Date(due);
          startDate.setMonth(startDate.getMonth() + 1);
          endDate = new Date(due);
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case 3: // 出産手当金
          startDate = new Date(due);
          startDate.setMonth(startDate.getMonth() - 1);
          endDate = new Date(due);
          endDate.setMonth(endDate.getMonth() + 2);
          break;
        default:
          startDate = new Date(due);
          startDate.setMonth(startDate.getMonth() - 1);
          endDate = new Date(due);
          endDate.setMonth(endDate.getMonth() + 1);
      }
      
      startDate = formatDate(startDate);
      endDate = formatDate(endDate);
    } else {
      const today = new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      startDate = formatDate(today);
      endDate = formatDate(oneMonthLater);
    }

    // 追加済み制度に追加
    const systemIdToAdd = typeof selectedSystem.id === 'string' ? parseInt(selectedSystem.id, 10) : selectedSystem.id;
    const newAddedSystems = new Set(addedSystems);
    newAddedSystems.add(systemIdToAdd);
    await saveAddedSystems(newAddedSystems);
    setAddedSystems(newAddedSystems);

    // 選択された親アクションのサブアクションとして追加
    try {
      if (!ownerId) {
        alert('オーナーIDが設定されていません。');
        return;
      }
      
      if (isSharedMember && permission !== 'editor') {
        alert('共有メンバーは編集権限がありません。');
        return;
      }
      
      const actionsRef = doc(db, 'users', ownerId, 'data', 'actions');
      const actionsSnapshot = await getDoc(actionsRef);
      const currentActions = actionsSnapshot.exists() ? actionsSnapshot.data().actions || [] : [];
      
      const parentAction = currentActions.find(a => a.id === selectedParentAction);
      if (!parentAction) {
        alert('選択された親アクションが見つかりません。');
        return;
      }
      
      // 既に同じアクション名のサブアクションがあるかチェック
      const existingSubAction = parentAction.subActions?.find(sa => sa.actionName === `${selectedSystem.title || selectedSystem.name}の申請`);
      if (existingSubAction) {
        alert('このアクションは既に追加されています。');
        setSelectedSystem(null);
        setSelectedParentAction(null);
        return;
      }
      
      // すべてのIDを収集
      const allIds = new Set();
      currentActions.forEach(action => {
        allIds.add(action.id);
        if (action.subActions) {
          action.subActions.forEach(subAction => {
            allIds.add(subAction.id);
            if (subAction.subActions) {
              subAction.subActions.forEach(subSubAction => {
                allIds.add(subSubAction.id);
              });
            }
          });
        }
      });
      
      // サブアクションIDを生成
      let subActionId = 1;
      while (allIds.has(subActionId)) {
        subActionId++;
      }
      
      if (parentAction.subActions) {
        parentAction.subActions.forEach(sa => {
          if (sa.id >= subActionId) {
            subActionId = sa.id + 1;
          }
        });
      }
      
      // 新しいサブアクションを作成
      const systemIdToAdd = typeof selectedSystem.id === 'string' ? parseInt(selectedSystem.id, 10) : selectedSystem.id;
      const newSubAction = {
        id: subActionId,
        type: '申請',
        actionName: `${selectedSystem.title || selectedSystem.name}の申請`,
        startDate: startDate,
        endDate: endDate,
        remarks: selectedSystem.description,
        status: 'pending',
        subActions: [],
        systemId: systemIdToAdd // systemIdを追加して、後で検索しやすくする
      };
      
      // 親アクションのサブアクションに追加
      const updatedActions = currentActions.map(action => {
        if (action.id === selectedParentAction) {
          return {
            ...action,
            subActions: [...(action.subActions || []), newSubAction]
          };
        }
        return action;
      });
      
      await setDoc(actionsRef, { actions: updatedActions }, { merge: false });
      
      // マイページにも自動的に登録（支援制度の場合）
      try {
        const savedItemsRef = doc(db, 'users', currentUser.uid, 'data', 'savedSearchItems');
        const savedItemsSnapshot = await getDoc(savedItemsRef);
        const currentData = savedItemsSnapshot.exists() ? savedItemsSnapshot.data() : {};
        const currentItemIds = currentData.itemIds || [];
        const currentFavoriteIds = currentData.favoriteItemIds || [];
        
        const itemId = `support-${selectedSystem.id}`;
        
        // 登録済みアイテムに追加
        if (!currentItemIds.includes(itemId)) {
          const updatedItemIds = [...currentItemIds, itemId];
          await setDoc(savedItemsRef, { itemIds: updatedItemIds }, { merge: true });
          
          // アイテムの詳細情報も保存
          const itemRef = doc(db, 'users', currentUser.uid, 'data', 'savedSearchItems', 'items', itemId);
          await setDoc(itemRef, {
            ...selectedSystem,
            category: 'support',
            savedAt: new Date().toISOString()
          }, { merge: true });
        }
        
        // お気に入りにも自動的に追加
        if (!currentFavoriteIds.includes(itemId)) {
          const updatedFavoriteIds = [...currentFavoriteIds, itemId];
          await setDoc(savedItemsRef, { favoriteItemIds: updatedFavoriteIds }, { merge: true });
          setFavoriteItems(new Set(updatedFavoriteIds));
        }
      } catch (error) {
        console.error('マイページへの登録エラー:', error);
        // エラーが発生しても処理を続行
      }
      
      alert('出産支援制度ページに追加しました。');
    } catch (error) {
      console.error('サブアクション追加エラー:', error);
      alert('追加に失敗しました。');
    }

    setSelectedSystem(null);
    setSelectedParentAction(null);
  };

  const handleCancelAddToSupportSystems = () => {
    setSelectedSystem(null);
    setSelectedParentAction(null);
  };

  // 出産支援制度から登録を解除
  const handleRemoveFromSupportSystems = async (system) => {
    if (!currentUser || !ownerId) return;

    if (isSharedMember && permission !== 'editor') {
      alert('共有メンバーは編集権限がありません。');
      return;
    }

    const systemId = typeof system.id === 'string' ? parseInt(system.id, 10) : system.id;
    const systemName = system.title || system.name || 'この制度';

    // 確認ダイアログ
    const confirmMessage = `「${systemName}」を出産支援制度から解除しますか？\n\n解除すると、アクション管理からも削除されます。`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // 1. addedSystemsから削除
      const addedSystemsRef = doc(db, 'users', ownerId, 'data', 'addedSystems');
      const addedSystemsSnapshot = await getDoc(addedSystemsRef);
      if (addedSystemsSnapshot.exists()) {
        const data = addedSystemsSnapshot.data();
        const systemIds = (data.systemIds || []).filter(sid => sid !== systemId);
        await setDoc(addedSystemsRef, { systemIds }, { merge: true });
      }

      // 2. actionsから該当のサブアクションを削除
      const actionsRef = doc(db, 'users', ownerId, 'data', 'actions');
      const actionsSnapshot = await getDoc(actionsRef);
      if (actionsSnapshot.exists()) {
        const currentActions = actionsSnapshot.data().actions || [];
        const updatedActions = currentActions.map(action => {
          if (action.subActions && Array.isArray(action.subActions)) {
            const filteredSubActions = action.subActions.filter(subAction => {
              // systemIdで一致するものを削除
              if (subAction.systemId === systemId) {
                return false;
              }
              // アクション名で一致するものも削除（後方互換性のため）
              const expectedActionName = `${systemName}の申請`;
              if (subAction.actionName === expectedActionName || subAction.actionName.includes(systemName)) {
                return false;
              }
              return true;
            });
            return {
              ...action,
              subActions: filteredSubActions
            };
          }
          return action;
        });
        await setDoc(actionsRef, { actions: updatedActions }, { merge: false });
      }

      // 3. savedSearchItemsからも削除（マイページへの登録も解除）
      try {
        const savedItemsRef = doc(db, 'users', currentUser.uid, 'data', 'savedSearchItems');
        const savedItemsSnapshot = await getDoc(savedItemsRef);
        if (savedItemsSnapshot.exists()) {
          const currentData = savedItemsSnapshot.data();
          const itemId = `support-${system.id}`;
          
          // itemIdsから削除
          const currentItemIds = currentData.itemIds || [];
          const updatedItemIds = currentItemIds.filter(id => id !== itemId);
          
          // favoriteItemIdsからも削除（お気に入りも解除）
          const currentFavoriteIds = currentData.favoriteItemIds || [];
          const updatedFavoriteIds = currentFavoriteIds.filter(id => id !== itemId);
          
          await setDoc(savedItemsRef, { 
            itemIds: updatedItemIds,
            favoriteItemIds: updatedFavoriteIds
          }, { merge: true });
          
          // アイテムの詳細情報も削除
          const itemRef = doc(db, 'users', currentUser.uid, 'data', 'savedSearchItems', 'items', itemId);
          await setDoc(itemRef, {}, { merge: false });
        }
      } catch (error) {
        console.error('マイページからの削除エラー:', error);
        // エラーが発生しても処理を続行
      }

      alert('出産支援制度から解除しました。');
    } catch (error) {
      console.error('登録解除エラー:', error);
      alert('解除に失敗しました。');
    }
  };

  // お気に入りの切り替え
  const handleToggleFavorite = async (item) => {
    if (!currentUser) return;

    const itemId = `${selectedCategory}-${item.id}`;
    const isRegistered = item.type === 'support-system' ? isSystemAdded(item.id) : isItemSaved(item);
    const isCurrentlyFavorite = isFavorite(item);
    
    // 登録済みのアイテムのお気に入りを外そうとする場合、確認を求める
    if (isCurrentlyFavorite && isRegistered) {
      const confirmMessage = item.type === 'support-system' 
        ? `「${item.name || item.title}」は出産支援制度に登録済みです。\n\nお気に入りから外しても、出産支援制度への登録は残りますが、お気に入りから外しますか？`
        : `「${item.name}」はマイページに登録済みです。\n\nお気に入りから外しても、マイページへの登録は残りますが、お気に入りから外しますか？`;
      
      if (!window.confirm(confirmMessage)) {
        return; // キャンセルされた場合は処理を中断
      }
    }

    try {
      const savedItemsRef = doc(db, 'users', currentUser.uid, 'data', 'savedSearchItems');
      const snapshot = await getDoc(savedItemsRef);
      const currentFavoriteIds = snapshot.exists() ? (snapshot.data().favoriteItemIds || []) : [];
      
      let updatedFavoriteIds;
      if (isCurrentlyFavorite) {
        // お気に入りから削除
        updatedFavoriteIds = currentFavoriteIds.filter(id => id !== itemId);
      } else {
        // お気に入りに追加
        updatedFavoriteIds = [...currentFavoriteIds, itemId];
      }
      
      await setDoc(savedItemsRef, { favoriteItemIds: updatedFavoriteIds }, { merge: true });
      // onSnapshotが自動的に状態を更新するので、ここでのsetFavoriteItemsは不要だが、
      // 即座にUIを更新するために呼び出す
      setFavoriteItems(new Set(updatedFavoriteIds));
    } catch (error) {
      console.error('お気に入り更新エラー:', error);
      alert('お気に入りの更新に失敗しました。');
    }
  };

  // アイテムがお気に入りかチェック
  const isFavorite = (item) => {
    const itemId = `${selectedCategory}-${item.id}`;
    const isInFavoriteItems = favoriteItems.has(itemId);
    
    // お気に入りリストに明示的に含まれている場合はtrue
    if (isInFavoriteItems) {
      return true;
    }
    
    // 登録済みの場合は自動的にお気に入りとして扱う
    // （登録時に自動的にお気に入りに追加されるため）
    // ただし、お気に入りリストに含まれていない場合はfalseを返す
    // （お気に入りを外した場合は、お気に入りリストから削除されているため）
    // つまり、登録済みでもお気に入りリストに含まれていない場合は、お気に入りを外したと判断する
    return false;
  };

  if (!currentUser) {
    return null;
  }

  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="search-page">
      <div className="search-content-card">
      {/* ヘッダーセクション（グラデーション背景） */}
      <div className="search-header-section">
        <div className="search-header-content">
          <h1 className="search-main-title">さあ、何を検索しましょう?</h1>
          
          {/* 検索バー */}
          <div className="search-bar-wrapper">
            <div className="search-input-container">
              <svg className="search-icon-left" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="search-input-main"
                placeholder={`${currentCategory?.label}を検索...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <button 
                className={`search-filter-button ${filterPrefecture || filterMunicipality || filterCategory ? 'filter-active' : ''}`}
                onClick={() => setIsFilterModalOpen(true)}
                title="フィルター"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </button>
            </div>
          </div>

          {/* カテゴリアイコン */}
          <div className="category-icons-section">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-icon-button ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => {
                    // URLパラメータを更新（これによりselectedCategoryも自動的に更新される）
                    setSearchParams({ category: category.id });
                }}
                title={category.label}
              >
                <div className="category-icon-circle">
                  <span className="category-icon-emoji">{category.icon}</span>
                </div>
                <span className="category-icon-label">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="search-content">

        {/* 検索結果 */}
        {(loading || (selectedCategory === 'support' && systemsLoading)) && (
          <div className="loading-section">
            <div className="loading-card">
              <p>検索中...</p>
            </div>
          </div>
        )}

        {/* 対象者フィルターボタン（支援制度カテゴリの場合、検索結果の有無に関わらず表示） */}
        {!loading && !(selectedCategory === 'support' && systemsLoading) && selectedCategory === 'support' && (
          <div className="target-audience-filter-section">
            <div className="target-audience-filter-label">対象者で絞り込む:</div>
            <div className="target-audience-filter-buttons">
              {Object.entries(targetAudienceLabels).map(([key, label]) => (
                <button
                  key={key}
                  className={`target-audience-filter-button ${filterTargetAudience.includes(key) ? 'active' : ''}`}
                  onClick={() => toggleTargetAudienceFilter(key)}
                >
                  {label}
                </button>
              ))}
              {filterTargetAudience.length > 0 && (
                <button
                  className="target-audience-filter-clear"
                  onClick={() => {
                    setFilterTargetAudience([]);
                    setCurrentPage(1);
                  }}
                >
                  クリア
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !(selectedCategory === 'support' && systemsLoading) && searchResults.length > 0 && (
          <div className="search-results-section">
            <div className="results-header-card">
              <div className="results-header-left">
                <h2 className="results-title">検索結果</h2>
                <span className="results-count">({searchResults.length}件)</span>
              </div>
              <div className="results-header-right">
                <button 
                  className={`filter-button ${filterPrefecture || filterMunicipality || filterCategory ? 'filter-active' : ''}`}
                  onClick={() => setIsFilterModalOpen(true)}
                  title="フィルター"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                </button>
                <button className="sort-button" title="並び替え">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M7 12h10M11 18h2"></path>
                  </svg>
                </button>
                <div className="view-mode-toggle">
                  <button
                    className={`view-mode-button ${viewMode === 'card' ? 'active' : ''}`}
                    onClick={() => setViewMode('card')}
                    title="カード表示"
                  >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                  <button
                    className={`view-mode-button ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="表形式表示"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path>
                    </svg>
                  </button>
              </div>
            </div>
            </div>
            {/* ページネーション計算 */}
            {(() => {
              const totalPages = Math.ceil(searchResults.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedResults = searchResults.slice(startIndex, endIndex);
              
              return (
                <>
                  {viewMode === 'card' ? (
            <div className="results-grid">
                    {paginatedResults.map((item) => {
                const isRegistered = item.type === 'support-system' ? isSystemAdded(item.id) : isItemSaved(item);
                const categoryLabel = item.type === 'support-system' && item.category ? categoryLabels[item.category] || 'その他' : null;
                const getCategoryBadgeClass = (category) => {
                  switch(category) {
                    case 'national': return 'category-badge-national';
                    case 'prefecture': return 'category-badge-prefecture';
                    case 'municipality': return 'category-badge-municipality';
                    case 'private': return 'category-badge-private';
                    case 'company': return 'category-badge-company';
                    default: return 'category-badge-default';
                  }
                };
                return (
                <div 
                  key={item.id} 
                  className={`result-card ${isRegistered ? 'result-card-registered' : ''}`}
                >
                  {/* カテゴリバッジと名称（左上） */}
                  {item.type === 'support-system' && categoryLabel && (() => {
                    // カテゴリに応じた具体的な名称を取得
                    const getCategorySpecificName = () => {
                      switch(item.category) {
                        case 'national':
                          return item.ministryName || null;
                        case 'prefecture':
                          return item.prefectureName || null;
                        case 'municipality':
                          return item.municipalityName || null;
                        case 'private':
                          return item.organizationName || null;
                        case 'company':
                          return item.companyName || null;
                        default:
                          return null;
                      }
                    };
                    const categorySpecificName = getCategorySpecificName();
                    
                    // デバッグ用ログ
                    if (item.category === 'national' || item.category === 'prefecture' || item.category === 'municipality' || item.category === 'private' || item.category === 'company') {
                      console.log(`[Search] Item ${item.id} (${item.name}):`, {
                        category: item.category,
                        ministryName: item.ministryName,
                        prefectureName: item.prefectureName,
                        municipalityName: item.municipalityName,
                        organizationName: item.organizationName,
                        companyName: item.companyName,
                        categorySpecificName: categorySpecificName
                      });
                    }
                    
                    return (
                      <div className="category-badge-container" key={`badge-${item.id}`}>
                        <div className={`category-badge ${getCategoryBadgeClass(item.category)}`}>
                          {categoryLabel}
                        </div>
                        {categorySpecificName && (
                          <span className="category-name">{categorySpecificName}</span>
                        )}
                      </div>
                    );
                  })()}
                  {/* ターゲットオーディエンスバッジ */}
                  {item.type === 'support-system' && item.targetAudience && Array.isArray(item.targetAudience) && item.targetAudience.length > 0 && (
                    <div className="target-audience-container">
                      {item.targetAudience.map((audience, idx) => (
                        <span key={idx} className="target-audience-badge">
                          {targetAudienceLabels[audience] || audience}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="result-card-header">
                    <h4 className="result-card-title">{item.name}</h4>
                    <div className="result-card-actions">
                      {isRegistered && (
                        <span 
                          className="saved-badge saved-badge-clickable"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.type === 'support-system') {
                              handleRemoveFromSupportSystems(item);
                            }
                          }}
                          title={item.type === 'support-system' ? 'クリックして登録を解除' : ''}
                          style={{ cursor: item.type === 'support-system' ? 'pointer' : 'default' }}
                        >
                          {item.type === 'support-system' ? '出産支援制度に登録済み' : '登録済み'}
                        </span>
                      )}
                      <div className="card-action-icons">
                        <button 
                          className={`favorite-button ${isFavorite(item) ? 'favorite-active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item);
                          }}
                          title={isFavorite(item) ? 'お気に入りから削除' : 'お気に入りに追加'}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite(item) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                        {item.type === 'support-system' && !isSystemAdded(item.id) && (
                          <button
                            className="register-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToSupportSystems(item, e);
                            }}
                            title="出産支援制度に追加"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14"></path>
                            </svg>
                          </button>
                        )}
                        {item.type !== 'support-system' && !isItemSaved(item) && (
                          <button
                            className="register-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveItem(item);
                            }}
                            title="マイページに登録"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {item.description && (
                    <p className="result-card-description">{item.description}</p>
                  )}
                  {/* 支援制度の場合、詳細情報を表示 */}
                  {item.type === 'support-system' && (
                    <>
                      {item.amount && (
                        <div className="result-card-info">
                          <span className="info-label">支給額:</span>
                          <span className="info-value">{item.amount}</span>
                        </div>
                      )}
                      {item.eligibility && (
                        <div className="result-card-info">
                          <span className="info-label">対象者:</span>
                          <span className="info-value">{item.eligibility}</span>
                        </div>
                      )}
                      {item.deadline && (
                        <div className="result-card-info">
                          <span className="info-label">申請期限:</span>
                          <span className="info-value">{item.deadline}</span>
                        </div>
                      )}
                      {item.referenceUrl && (
                        <div className="result-card-info">
                          <span className="info-label">参考リンク:</span>
                          <a 
                            href={item.referenceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="reference-link"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: '#3b82f6', textDecoration: 'underline' }}
                          >
                            詳細情報を見る
                          </a>
                        </div>
                      )}
                    </>
                  )}
                  {/* その他のカテゴリの情報 */}
                  {item.type !== 'support-system' && (
                    <>
                  {item.address && (
                    <div className="result-card-info">
                      <span className="info-label">住所:</span>
                      <span className="info-value">{item.address}</span>
                    </div>
                  )}
                  {item.phone && (
                    <div className="result-card-info">
                      <span className="info-label">電話:</span>
                      <span className="info-value">{item.phone}</span>
                    </div>
                  )}
                    </>
                  )}
                </div>
              );
              })}
                    </div>
                  ) : (
                    <div className="results-table-container">
                      <table className="results-table">
                        <thead>
                          <tr>
                            <th>カテゴリ</th>
                            <th>対象者</th>
                            <th>制度名</th>
                            <th>説明</th>
                            <th>支給額</th>
                            <th>対象者（詳細）</th>
                            <th>申請期限</th>
                            <th>参考リンク</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedResults.map((item) => {
                            const isRegistered = item.type === 'support-system' ? isSystemAdded(item.id) : isItemSaved(item);
                            const categoryLabel = item.type === 'support-system' && item.category ? categoryLabels[item.category] || 'その他' : null;
                            const getCategoryBadgeClass = (category) => {
                              switch(category) {
                                case 'national': return 'category-badge-national';
                                case 'prefecture': return 'category-badge-prefecture';
                                case 'municipality': return 'category-badge-municipality';
                                case 'private': return 'category-badge-private';
                                case 'company': return 'category-badge-company';
                                default: return 'category-badge-default';
                              }
                            };
                            const getCategorySpecificName = () => {
                              if (item.type !== 'support-system') return null;
                              switch(item.category) {
                                case 'national': return item.ministryName || null;
                                case 'prefecture': return item.prefectureName || null;
                                case 'municipality': return item.municipalityName || null;
                                case 'private': return item.organizationName || null;
                                case 'company': return item.companyName || null;
                                default: return null;
                              }
                            };
                            const categorySpecificName = getCategorySpecificName();
                            
                            return (
                              <tr 
                                key={item.id}
                                className={isRegistered ? 'result-table-row-registered' : ''}
                              >
                                <td className="result-table-category-cell">
                                  {categoryLabel && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                      <span className={`category-badge ${getCategoryBadgeClass(item.category)}`}>
                                        {categoryLabel}
                                      </span>
                                      {categorySpecificName && (
                                        <span className="category-name">{categorySpecificName}</span>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="result-table-target-audience-cell">
                                  {item.type === 'support-system' && item.targetAudience && Array.isArray(item.targetAudience) && item.targetAudience.length > 0 ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                      {item.targetAudience.map((audience, idx) => (
                                        <span key={idx} className="target-audience-badge">
                                          {targetAudienceLabels[audience] || audience}
                                        </span>
                                      ))}
                                    </div>
                                  ) : '-'}
                                </td>
                                <td className="result-table-name-cell">
                                  <strong>{item.name}</strong>
                                </td>
                                <td className="result-table-description-cell">
                                  {item.description || '-'}
                                </td>
                                <td className="result-table-amount-cell">
                                  {item.type === 'support-system' && item.amount ? item.amount : '-'}
                                </td>
                                <td className="result-table-eligibility-cell">
                                  {item.type === 'support-system' && item.eligibility ? item.eligibility : '-'}
                                </td>
                                <td className="result-table-deadline-cell">
                                  {item.type === 'support-system' && item.deadline ? item.deadline : '-'}
                                </td>
                                <td className="result-table-link-cell">
                                  {item.referenceUrl ? (
                                    <a 
                                      href={item.referenceUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="reference-link"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      詳細情報
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                      </svg>
                                    </a>
                                  ) : '-'}
                                </td>
                                <td className="result-table-actions-cell">
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {isRegistered && (
                                      <span 
                                        className="saved-badge saved-badge-clickable" 
                                        style={{ fontSize: '11px', padding: '2px 8px', cursor: item.type === 'support-system' ? 'pointer' : 'default' }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (item.type === 'support-system') {
                                            handleRemoveFromSupportSystems(item);
                                          }
                                        }}
                                        title={item.type === 'support-system' ? 'クリックして登録を解除' : ''}
                                      >
                                        {item.type === 'support-system' ? '登録済み' : '登録済み'}
                                      </span>
                                    )}
                    <button
                                      className={`favorite-button ${isFavorite(item) ? 'favorite-active' : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleFavorite(item);
                                      }}
                                      title={isFavorite(item) ? 'お気に入りから削除' : 'お気に入りに追加'}
                                      style={{ padding: '4px' }}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite(item) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                      </svg>
                                    </button>
                                    {item.type === 'support-system' && !isSystemAdded(item.id) && (
                                      <button
                                        className="register-button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddToSupportSystems(item, e);
                                        }}
                                        title="出産支援制度に追加"
                                        style={{ padding: '4px' }}
                                      >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M12 5v14M5 12h14"></path>
                                        </svg>
                                      </button>
                                    )}
                                    {item.type !== 'support-system' && !isItemSaved(item) && (
                                      <button
                                        className="register-button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSaveItem(item);
                                        }}
                                        title="マイページに登録"
                                        style={{ padding: '4px' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                  )}
                </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
            </div>
                  )}
                    {/* ページネーションUI */}
                    {totalPages > 1 && (
                      <div className="pagination-container">
                        <div className="pagination-info">
                          {startIndex + 1}〜{Math.min(endIndex, searchResults.length)}件 / 全{searchResults.length}件
                        </div>
                        <div className="pagination-buttons">
                          <button
                            className="pagination-button"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            title="前のページ"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                            // 現在のページ周辺のページ番号のみ表示
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 2 && page <= currentPage + 2)
                            ) {
                              return (
                                <button
                                  key={page}
                                  className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                                  onClick={() => setCurrentPage(page)}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === currentPage - 3 ||
                              page === currentPage + 3
                            ) {
                              return (
                                <span key={page} className="pagination-ellipsis">...</span>
                              );
                            }
                            return null;
                          })}
                          <button
                            className="pagination-button"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            title="次のページ"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
          </div>
        )}

        {!loading && !(selectedCategory === 'support' && systemsLoading) && searchQuery && searchResults.length === 0 && (
          <div className="no-results-section">
            <div className="no-results-card">
              <p>検索結果が見つかりませんでした。</p>
            </div>
          </div>
        )}

        {!loading && !(selectedCategory === 'support' && systemsLoading) && !searchQuery && selectedCategory === 'support' && supportSystems.length === 0 && (
          <div className="empty-state-section">
            <div className="empty-state-card">
              <p>出産支援制度のデータがありません。データを投入してください。</p>
            </div>
          </div>
        )}
        {!loading && !(selectedCategory === 'support' && systemsLoading) && !searchQuery && selectedCategory !== 'support' && (
          <div className="empty-state-section">
            <div className="empty-state-card">
              <p>検索キーワードを入力して、{currentCategory?.label}を検索してください。</p>
            </div>
          </div>
        )}
        </div>

        {/* 出産支援制度追加確認モーダル */}
        {selectedSystem && selectedSystem.type === 'support-system' && createPortal(
          <div className="add-action-modal" onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelAddToSupportSystems();
            }
          }}>
            <div className="add-action-content" onClick={(e) => e.stopPropagation()}>
              <div className="add-action-header">
                <h5 className="add-action-title">出産支援制度に追加</h5>
                <button 
                  className="add-action-close-button"
                  onClick={handleCancelAddToSupportSystems}
                  title="閉じる"
                  aria-label="閉じる"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="add-action-body">
                  <p>
                    「{selectedSystem.title || selectedSystem.name}」を出産支援制度ページに追加しますか？
                  </p>
                {actions.length > 0 ? (
                  <div className="modal-form-group">
                    <label htmlFor="parent-action-select">親アクションを選択:</label>
                    <select
                      id="parent-action-select"
                      className="modal-select"
                      value={selectedParentAction || ''}
                      onChange={(e) => setSelectedParentAction(Number(e.target.value))}
                    >
                      <option value="">選択してください</option>
                      {actions.map(action => (
                        <option key={action.id} value={action.id}>
                          {action.number}. {action.actionName} ({action.type})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '24px' }}>
                    アクションがありません。まずアクション管理でアクションを作成してください。
                  </p>
                )}
              </div>
              <div className="add-action-footer">
                <button
                  className="modal-button confirm"
                  onClick={handleConfirmAddToSupportSystems}
                  disabled={!selectedParentAction || actions.length === 0}
                >
                  追加する
                </button>
                <button
                  className="modal-button cancel"
                  onClick={handleCancelAddToSupportSystems}
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
      
      {/* フィルターモーダル */}
      {isFilterModalOpen && createPortal(
        <div className="filter-modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsFilterModalOpen(false);
          }
        }}>
          <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="filter-modal-header">
              <h3 className="filter-modal-title">フィルター</h3>
              <button 
                className="filter-modal-close"
                onClick={() => setIsFilterModalOpen(false)}
                title="閉じる"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="filter-modal-body">
              <div className="filter-group">
                <label className="filter-label">都道府県</label>
                <select
                  className="filter-select"
                  value={filterPrefecture}
                  onChange={(e) => {
                    setFilterPrefecture(e.target.value);
                    setFilterMunicipality(''); // 都道府県変更時は市区町村をリセット
                  }}
                >
                  <option value="">すべて</option>
                  {getPrefectureList().map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label className="filter-label">市区町村</label>
                <select
                  className="filter-select"
                  value={filterMunicipality}
                  onChange={(e) => setFilterMunicipality(e.target.value)}
                  disabled={!filterPrefecture}
                >
                  <option value="">すべて</option>
                  {getMunicipalityList(filterPrefecture).map(muni => (
                    <option key={muni} value={muni}>{muni}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label className="filter-label">カテゴリ</label>
                <select
                  className="filter-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">すべて</option>
                  <option value="national">国の制度</option>
                  <option value="prefecture">都道府県の制度</option>
                  <option value="municipality">市区町村の制度</option>
                  <option value="private">民間の制度</option>
                  <option value="company">企業の制度</option>
                </select>
              </div>
            </div>
            <div className="filter-modal-footer">
              <button
                className="filter-button-clear"
                onClick={() => {
                  setFilterPrefecture('');
                  setFilterMunicipality('');
                  setFilterCategory('');
                }}
              >
                クリア
              </button>
              <button
                className="filter-button-apply"
                onClick={() => setIsFilterModalOpen(false)}
              >
                適用
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Search;

