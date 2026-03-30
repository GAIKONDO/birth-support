import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { useSupportSystems } from '../hooks/useSupportSystems';
import { useOwnerId } from '../hooks/useOwnerId';
import './SubMenu.css';

const SubMenu = ({ isVisible }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { ownerId, loading: ownerIdLoading } = useOwnerId();
  
  // Firestoreから出産支援制度のマスターデータを取得
  const { systems: supportSystems, loading: systemsLoading } = useSupportSystems({ activeOnly: true });
  
  // 追加済み制度とアクションの状態管理
  const [addedSystems, setAddedSystems] = useState(new Set());
  const [actions, setActions] = useState([]);
  const [examinations, setExaminations] = useState([]);
  
  // Firestoreから追加済み制度を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) {
      return;
    }

    const addedSystemsRef = doc(db, 'users', ownerId, 'data', 'addedSystems');
    
    // まず一度だけ読み込む
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
    
    // その後、リアルタイムでデータを監視
    const unsubscribe = onSnapshot(addedSystemsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const systemIds = data.systemIds || [];
        setAddedSystems(new Set(systemIds));
      } else {
        setAddedSystems(new Set());
      }
    });
    
    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);
  
  // Firestoreからアクションを読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) {
      return;
    }

    const actionsRef = doc(db, 'users', ownerId, 'data', 'actions');
    
    // まず一度だけ読み込む
    getDoc(actionsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setActions(data.actions || []);
        } else {
          setActions([]);
        }
      })
      .catch((error) => {
        console.error('アクション読み込みエラー:', error);
      });
    
    // その後、リアルタイムでデータを監視
    const unsubscribe = onSnapshot(actionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setActions(data.actions || []);
      } else {
        setActions([]);
      }
    });
    
    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);
  
  // Firestoreから診察記録を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) {
      return;
    }

    const examinationsRef = collection(db, 'users', ownerId, 'data', 'maternalHandbook', 'examinations');
    const q = query(examinationsRef, orderBy('date', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const exams = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setExaminations(exams);
    }, (error) => {
      console.error('診察記録監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);
  
  // 制度のステータスを取得する関数
  const getSystemStatus = useCallback((systemId) => {
    const systemIdNum = typeof systemId === 'string' ? parseInt(systemId, 10) : systemId;
    
    // まず、メインアクションとして追加されているかチェック
    const action = actions.find(a => {
      const aSystemId = typeof a.systemId === 'string' ? parseInt(a.systemId, 10) : a.systemId;
      return aSystemId === systemIdNum;
    });
    if (action) {
      return action.status || 'pending';
    }
    
    // サブアクションとして追加されているかチェック
    const foundSubActions = [];
    for (const mainAction of actions) {
      if (mainAction.subActions && Array.isArray(mainAction.subActions)) {
        let subAction = null;
        
        if (systemIdNum === 1) {
          subAction = mainAction.subActions.find(sa => sa.actionName === '出産育児一時金');
        } else if (systemIdNum === 2) {
          subAction = mainAction.subActions.find(sa => sa.actionName === '育児休業の申請');
        } else if (systemIdNum === 3) {
          subAction = mainAction.subActions.find(sa => sa.actionName === '出産手当金の申請');
        } else if (systemIdNum === 4) {
          subAction = mainAction.subActions.find(sa => sa.actionName === '児童手当の申請');
        } else {
          // ID 5以上の場合、動的に検索
          const system = supportSystems?.find(s => Number(s.id) === systemIdNum);
          if (system) {
            const expectedActionName = `${system.title}の申請`;
            subAction = mainAction.subActions.find(sa => sa.actionName === expectedActionName);
          }
        }
        
        if (subAction) {
          foundSubActions.push({ subAction, parentAction: mainAction.actionName });
        }
      }
    }
    
    if (foundSubActions.length > 0) {
      const statusPriority = { 'completed': 3, 'in-progress': 2, 'pending': 1 };
      let bestSubAction = foundSubActions[0];
      let bestPriority = statusPriority[foundSubActions[0].subAction.status] || 0;
      
      foundSubActions.forEach(({ subAction }) => {
        const priority = statusPriority[subAction.status] || 0;
        if (priority > bestPriority) {
          bestPriority = priority;
          bestSubAction = { subAction };
        }
      });
      
      return bestSubAction.subAction.status || 'pending';
    }
    
    return 'none';
  }, [actions, supportSystems]);
  
  // 登録済みの制度を判定する関数
  const isSystemRegistered = useCallback((systemId) => {
    const systemIdNum = typeof systemId === 'string' ? parseInt(systemId, 10) : systemId;
    
    // addedSystemsに含まれているかチェック
    if (addedSystems.has(systemIdNum)) {
      return true;
    }
    
    // actionsに含まれているかチェック
    const status = getSystemStatus(systemIdNum);
    return status !== 'none';
  }, [addedSystems, getSystemStatus]);
  
  // IDとアンカーのマッピング（既存の4つの制度 + 新しい制度）
  const systemIdToAnchor = {
    1: 'lump-sum',
    2: 'childcare-leave',
    3: 'childbirth-allowance',
    4: 'child-allowance',
    5: 'municipality-birth-gift',
    6: 'private-baby-coupon',
    7: 'company-birth-gift'
  };
  
  // IDとパスのマッピング（既存の4つの制度 + 新規追加の制度）
  const systemIdToPath = {
    1: '/support-systems/lump-sum',
    2: '/support-systems/childcare-leave',
    3: '/support-systems/childbirth-allowance',
    4: '/support-systems/child-allowance',
    5: '/support-systems/paternity-leave',
    6: '/support-systems/post-birth-leave-support',
    7: '/support-systems/childcare-short-time-work',
    8: '/support-systems/pregnancy-support'
  };
  
  // 登録済みの支援制度のサブメニュー項目を生成
  const getRegisteredSystemsMenuItems = () => {
    if (!supportSystems || supportSystems.length === 0) {
      return [];
    }
    
    const registeredSystems = supportSystems
      .filter(system => isSystemRegistered(system.id))
      .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
    
    // 重複を除去（同じIDまたは同じタイトルの制度を1つだけ残す）
    // 優先順位: displayOrderが小さいもの、IDが小さいもの
    const uniqueSystems = [];
    const seenIds = new Set();
    const seenTitles = new Set();
    
    for (const system of registeredSystems) {
      const systemId = Number(system.id);
      const title = system.title;
      
      // 既に同じIDまたは同じタイトルが存在する場合はスキップ
      if (seenIds.has(systemId) || seenTitles.has(title)) {
        console.log(`[SubMenu] 重複をスキップ: ID=${systemId}, タイトル="${title}"`);
        continue;
      }
      
      seenIds.add(systemId);
      seenTitles.add(title);
      uniqueSystems.push(system);
    }
    
    return uniqueSystems.map(system => {
      const systemId = Number(system.id);
      const anchor = systemIdToAnchor[systemId] || `system-${systemId}`;
      const path = systemIdToPath[systemId] || '/support-systems';
      
      // 個別ページがある場合は、アンカーではなく直接ページ遷移
      const hasDetailPage = systemIdToPath[systemId];
      
      return {
        id: anchor,
        label: system.title,
        anchor: hasDetailPage ? undefined : `#${anchor}`, // 個別ページがある場合はanchorを設定しない
        path: path
      };
    });
  };

  // 登録済みの支援制度のサブメニュー項目を取得
  const registeredSystemsMenuItems = getRegisteredSystemsMenuItems();
  
  // 診察記録のサブメニュー項目を生成
  const getExaminationsMenuItems = () => {
    return examinations.map((exam, index) => {
      const visitNumber = index + 1;
      let examDate = '';
      if (exam.date) {
        try {
          const date = new Date(exam.date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          examDate = `${year}年${month}月${day}日`;
        } catch (e) {
          examDate = '';
        }
      }
      const label = `${visitNumber}回目診察${examDate ? ` (${examDate})` : ''}`;
      
      return {
        id: `examination-${exam.id}`,
        label: label,
        path: `/electronic-maternal-handbook/examination/${exam.id}`
      };
    });
  };
  
  // 各ページのサブメニュー項目を定義
  const getSubMenuItems = () => {
    // 出産支援制度ページのサブメニューを動的に生成
    const supportSystemsMenu = [
      { id: 'intro', label: '制度の概要', anchor: '#intro', path: '/support-systems' },
      ...registeredSystemsMenuItems
    ];
    
    // 診察記録のサブメニューを動的に生成
    const examinationsMenuItems = getExaminationsMenuItems();
    const electronicMaternalHandbookMenu = [
      { id: 'overview', label: '概要', anchor: '#overview', path: '/electronic-maternal-handbook' },
      { id: 'pregnancy', label: '妊娠期の記録', anchor: '#pregnancy', path: '/electronic-maternal-handbook' },
      ...examinationsMenuItems,
      { id: 'postpartum', label: '産後の記録', anchor: '#postpartum', path: '/electronic-maternal-handbook' },
      { id: 'child', label: '子どもの記録', anchor: '#child', path: '/electronic-maternal-handbook' }
    ];
    
    return {
      '/mypage': [
        { id: 'profile', label: 'プロフィール', anchor: '#profile', path: '/mypage' },
        { id: 'services', label: '利用可能な制度', anchor: '#services', path: '/mypage' }
      ],
      '/mypage-authenticated': [
        { id: 'profile', label: 'プロフィール', anchor: '#profile', path: '/mypage-authenticated' },
        { id: 'services', label: '利用可能な制度', anchor: '#services', path: '/mypage-authenticated' }
      ],
      '/support-systems': supportSystemsMenu,
      '/support-systems/lump-sum': supportSystemsMenu,
      '/support-systems/childcare-leave': supportSystemsMenu,
      '/support-systems/childbirth-allowance': supportSystemsMenu,
      '/support-systems/child-allowance': supportSystemsMenu,
      '/support-systems/paternity-leave': supportSystemsMenu,
      '/support-systems/post-birth-leave-support': supportSystemsMenu,
      '/support-systems/childcare-short-time-work': supportSystemsMenu,
      '/support-systems/pregnancy-support': supportSystemsMenu,
    '/action-management': [
      { id: 'table', label: 'アクション一覧', anchor: '#table', path: '/action-management', view: 'table' },
      { id: 'gantt', label: 'ガントチャート', anchor: '#gantt', path: '/action-management', view: 'gantt' },
      { id: 'calendar', label: 'カレンダー', anchor: '#calendar', path: '/action-management', view: 'calendar' }
    ],
    '/electronic-maternal-handbook': electronicMaternalHandbookMenu,
    '/search': [
      { id: 'support', label: '支援制度', anchor: '#support', path: '/search', category: 'support' },
      { id: 'city-hall', label: '市役所', anchor: '#city-hall', path: '/search', category: 'city-hall' },
      { id: 'medical', label: '医療機関', anchor: '#medical', path: '/search', category: 'medical' },
      { id: 'community', label: 'コミュニティー', anchor: '#community', path: '/search', category: 'community' },
      { id: 'nursery', label: '保育施設', anchor: '#nursery', path: '/search', category: 'nursery' },
      { id: 'lessons', label: '習い事', anchor: '#lessons', path: '/search', category: 'lessons' },
      { id: 'education', label: '知育', anchor: '#education', path: '/search', category: 'education' }
    ],
      '/ai-assistant': [
        { id: 'chat', label: 'チャット', anchor: '#chat', path: '/ai-assistant' },
        { id: 'recommendations', label: 'おすすめ', anchor: '#recommendations', path: '/ai-assistant' },
        { id: 'mental-health', label: 'メンタルヘルス', anchor: '#mental-health', path: '/ai-assistant' }
      ],
      '/statistics': [
        { id: 'statistics-overview', label: '該当制度', path: '/statistics' },
        { id: 'payment-amount', label: '収支概算', path: '/payment-amount' },
        { id: 'necessary-expenses', label: '必要経費概算', path: '/necessary-expenses' },
        { id: 'tax-benefits', label: '税金優遇概算', path: '/tax-benefits' }
      ],
      '/specification': [
        { id: 'specification-overview', label: '概要', path: '/specification/overview' },
        { id: 'specification-features', label: '主要機能', path: '/specification/features' },
        { id: 'specification-tech-stack', label: '技術スタック', path: '/specification/tech-stack' },
        { id: 'specification-system-architecture', label: 'システムアーキテクチャ', path: '/specification/system-architecture' },
        { id: 'specification-infrastructure', label: 'インフラ構成', path: '/specification/infrastructure' },
        { id: 'specification-data-structure', label: 'データ構造', path: '/specification/data-structure' },
        { id: 'specification-page-structure', label: 'ページ構成', path: '/specification/page-structure' },
        { id: 'specification-business-plan', label: 'ビジネスモデル', path: '/specification/business-plan' },
        { id: 'specification-business-plan-detail', label: '事業計画', path: '/specification/business-plan-detail' },
        { id: 'specification-business-plan-simulation', label: 'シミュレーション', path: '/specification/business-plan-simulation' },
        { id: 'specification-market-size', label: '市場規模', path: '/specification/market-size' },
        { id: 'specification-subsidies', label: '補助金・助成金', path: '/specification/subsidies' },
        { id: 'specification-user-subsidies', label: '利用者向け助成金', path: '/specification/user-subsidies' },
        { id: 'specification-case-study', label: 'ケーススタディ', path: '/specification/case-study' },
        { id: 'specification-risk-assessment', label: 'リスク評価', path: '/specification/risk-assessment' },
        { id: 'specification-snapshot-comparison', label: 'スナップショット比較', path: '/specification/snapshot-comparison' },
        { id: 'specification-ringisho', label: '稟議書', path: '/specification/ringisho' }
      ]
    };
  };
  
  const subMenuItems = getSubMenuItems();

  // 現在のパスに基づいてサブメニューを取得
  const getCurrentSubMenu = () => {
    // 完全一致を優先
    if (subMenuItems[location.pathname]) {
      return subMenuItems[location.pathname];
    }
    // /payment-amount、/necessary-expenses、/tax-benefits の場合は統計情報のメニューを表示
    if (location.pathname === '/payment-amount' || location.pathname === '/necessary-expenses' || location.pathname === '/tax-benefits') {
      return subMenuItems['/statistics'] || [];
    }
    // /support-systems/で始まる場合は出産支援制度のメニューを表示
    if (location.pathname.startsWith('/support-systems/')) {
      return subMenuItems['/support-systems'] || [];
    }
    // /electronic-maternal-handbook/examination/で始まる場合は電子母子手帳のメニューを表示
    if (location.pathname.startsWith('/electronic-maternal-handbook/examination/')) {
      return subMenuItems['/electronic-maternal-handbook'] || [];
    }
    // /specification/で始まる場合は仕様書のメニューを表示
    if (location.pathname.startsWith('/specification/')) {
      return subMenuItems['/specification'] || [];
    }
    // /specification の場合は仕様書のメニューを表示（デフォルトは概要）
    if (location.pathname === '/specification') {
      return subMenuItems['/specification'] || [];
    }
    return [];
  };

  const currentSubMenu = getCurrentSubMenu();

  const handleClick = (e, item) => {
    e.preventDefault();
    if (item.path) {
      // 現在のURLパラメータ（ownerなど）を保持
      const ownerParam = searchParams.get('owner');
      const params = new URLSearchParams();
      if (ownerParam) {
        params.set('owner', ownerParam);
      }
      
      if (item.category) {
        // 検索ページの場合は、カテゴリをクエリパラメータとして渡す
        params.set('category', item.category);
      }
      
      // アクション管理の場合は、viewパラメータを追加
      if (item.view) {
        params.set('view', item.view);
      }
      
      const queryString = params.toString();
      const targetPath = queryString ? `${item.path}?${queryString}` : item.path;
      
      // アンカーリンクの場合は、ページ遷移後にスクロール
      if (item.anchor && item.anchor.startsWith('#')) {
        navigate(targetPath);
        // ページ遷移後にスクロール（少し遅延を入れてDOMが更新されるのを待つ）
        setTimeout(() => {
          const anchorId = item.anchor.substring(1);
          const element = document.getElementById(anchorId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        navigate(targetPath);
      }
    }
  };

  // サブメニューが存在しない場合はnullを返す
  if (currentSubMenu.length === 0) {
    return null;
  }

  // isVisibleがfalseの場合は閉じる、trueの場合は開く
  // サブメニューが存在しない場合は閉じる
  return (
    <aside className={`submenu ${currentSubMenu.length > 0 && isVisible ? 'submenu-open' : 'submenu-closed'}`}>
      <div className="submenu-content">
        <nav className="submenu-nav">
          <ul className="submenu-list">
            {currentSubMenu.map((item, index) => {
              // アクション管理の場合は、viewパラメータも確認
              let isActive = location.pathname === item.path;
              if (item.view && location.pathname === '/action-management') {
                const currentView = searchParams.get('view') || 'table'; // デフォルトはtable
                isActive = currentView === item.view;
              }
              // 検索ページの場合は、categoryパラメータも確認
              if (item.category && location.pathname === '/search') {
                const currentCategory = searchParams.get('category') || 'support';
                isActive = currentCategory === item.category;
              }
              // 診察記録の詳細ページの場合は、パスで一致を確認
              if (location.pathname.startsWith('/electronic-maternal-handbook/examination/')) {
                isActive = location.pathname === item.path;
              }
              return (
                <li key={item.id}>
                  <a 
                    href="#"
                    onClick={(e) => handleClick(e, item)}
                    className={`submenu-item ${isActive ? 'active' : ''}`}
                  >
                    {index + 1}. {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default SubMenu;

