import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { useOwnerId } from '../hooks/useOwnerId';
import { categoryLabels, initialSupportSystemsData } from '../utils/supportSystemsData';
import { initializeData } from '../utils/initializeSupportSystems';
import './SupportSystems.css';

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

const SupportSystems = () => {
  const { currentUser } = useAuth();
  const { ownerId, loading: ownerIdLoading, isSharedMember, permission } = useOwnerId();
  const navigate = useNavigate();
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedParentAction, setSelectedParentAction] = useState(null);
  const [addedSystems, setAddedSystems] = useState(new Set());
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dueDate, setDueDate] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // モーダル表示時にbodyのスクロールを無効化
  useDisableScroll(!!selectedSystem);

  
  // マスターデータから出産支援制度のデータを取得
  const supportSystems = useMemo(() => {
    return initialSupportSystemsData.filter(system => system.isActive !== false);
  }, []);

  // 初期データを投入する関数（Firestoreへの同期用、必要に応じて手動実行）
  const handleInitializeData = useCallback(async () => {
    setIsInitializing(true);
    setInitError(null);
    
    try {
      await initializeData();
      // マスターデータを使用するため、ページリロードは不要
      console.log('✅ Firestoreへのデータ同期が完了しました。');
    } catch (error) {
      console.error('データ投入エラー:', error);
      setInitError(error);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Firestoreから追加済み制度を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) {
      if (!ownerIdLoading) {
        setLoading(false);
      }
      return;
    }

    const addedSystemsRef = doc(db, 'users', ownerId, 'data', 'addedSystems');
    
    // まず一度だけ読み込む（高速化）
    getDoc(addedSystemsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const systemIds = data.systemIds || [];
          console.log('追加済み制度を読み込みました:', systemIds);
          console.log('追加済み制度の型確認:', systemIds.map(id => `${id} (${typeof id})`));
          // systemIdsを数値に変換（文字列の場合は数値に変換）
          const numericSystemIds = systemIds.map(id => {
            if (typeof id === 'string') {
              const parsed = parseInt(id, 10);
              return isNaN(parsed) ? id : parsed;
            }
            return id;
          });
          const newSet = new Set(numericSystemIds);
          setAddedSystems(newSet);
          console.log('addedSystemsの型確認:', Array.from(newSet).map(id => `${id} (${typeof id})`));
        } else {
          console.log('追加済み制度データがありません');
          setAddedSystems(new Set());
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('追加済み制度読み込みエラー:', error);
        setLoading(false);
      });
    
    // その後、リアルタイムでデータを監視
    const unsubscribe = onSnapshot(addedSystemsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const systemIds = data.systemIds || [];
        console.log('追加済み制度を更新しました:', systemIds);
        console.log('追加済み制度の型確認:', systemIds.map(id => `${id} (${typeof id})`));
        // systemIdsを数値に変換（文字列の場合は数値に変換）
        const numericSystemIds = systemIds.map(id => {
          if (typeof id === 'string') {
            const parsed = parseInt(id, 10);
            return isNaN(parsed) ? id : parsed;
          }
          return id;
        });
        const newSet = new Set(numericSystemIds);
        setAddedSystems(newSet);
        // デバッグ: 状態が正しく更新されているか確認
        console.log('addedSystems状態を更新:', Array.from(newSet));
        console.log('addedSystemsの型確認:', Array.from(newSet).map(id => `${id} (${typeof id})`));
      } else {
        console.log('追加済み制度データが削除されました');
        setAddedSystems(new Set());
      }
      setLoading(false);
    }, (error) => {
      console.error('追加済み制度監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);

  // Firestoreからアクションを読み込んで、ステータスを監視
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) {
      return;
    }

    const actionsRef = doc(db, 'users', ownerId, 'data', 'actions');
    
    const unsubscribe = onSnapshot(actionsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const newActions = data.actions || [];
        setActions(newActions);
        
        // アクションが存在する場合、addedSystemsを自動的に更新
        // Firestoreから最新のaddedSystemsを読み込む
        try {
          const addedSystemsRef = doc(db, 'users', ownerId, 'data', 'addedSystems');
          const addedSystemsSnapshot = await getDoc(addedSystemsRef);
          const currentSystemIds = addedSystemsSnapshot.exists() ? (addedSystemsSnapshot.data().systemIds || []) : [];
          const currentAddedSystems = new Set(currentSystemIds);
          const newAddedSystems = new Set(currentSystemIds);
          let hasChanges = false;
          
          // 各アクションをチェックして、対応するsystemIdをaddedSystemsに追加
          for (const action of newActions) {
            // メインアクションとして追加されている場合
            if (action.systemId) {
              if (!newAddedSystems.has(action.systemId)) {
                newAddedSystems.add(action.systemId);
                hasChanges = true;
              }
            }
            
            // サブアクションとして追加されている場合
            if (action.subActions && Array.isArray(action.subActions)) {
              for (const subAction of action.subActions) {
                let systemId = null;
                
                // まず、systemIdフィールドをチェック（新しい制度の場合）
                if (subAction.systemId !== undefined && subAction.systemId !== null) {
                  systemId = typeof subAction.systemId === 'string' ? parseInt(subAction.systemId, 10) : subAction.systemId;
                  // ID 19（札幌市出産祝い金）の場合のみログを出力
                  if (systemId === 19) {
                    console.log(`[SupportSystems] サブアクション「${subAction.actionName}」にsystemIdフィールドを発見: ${systemId}`);
                  }
                } else {
                  // 後方互換性のため、アクション名からsystemIdを逆引き（既存の制度ID 1-4）
                  if (subAction.actionName === '出産育児一時金') {
                    systemId = 1;
                  } else if (subAction.actionName === '育児休業の申請') {
                    systemId = 2;
                  } else if (subAction.actionName === '出産手当金の申請') {
                    systemId = 3;
                  } else if (subAction.actionName === '児童手当の申請') {
                    systemId = 4;
                  } else {
                    // ID 5以降の新しい制度の場合、アクション名からsystemIdを逆引き
                    // アクション名は「{制度名}の申請」の形式
                    if (subAction.actionName && subAction.actionName.endsWith('の申請')) {
                      const systemTitle = subAction.actionName.replace('の申請', '');
                      // supportSystemsから該当する制度を検索
                      const matchedSystem = supportSystems.find(s => {
                        const systemTitleToMatch = s.title || s.name;
                        return systemTitleToMatch === systemTitle;
                      });
                      if (matchedSystem) {
                        systemId = typeof matchedSystem.id === 'string' ? parseInt(matchedSystem.id, 10) : matchedSystem.id;
                        // ID 19（札幌市出産祝い金）の場合のみログを出力
                        if (systemId === 19) {
                          console.log(`[SupportSystems] サブアクション「${subAction.actionName}」からsystemIdを逆引き: ${systemId} (${matchedSystem.title || matchedSystem.name})`);
                        }
                      } else {
                        // ID 19（札幌市出産祝い金）の場合のみログを出力
                        if (subAction.actionName.includes('札幌市')) {
                          console.log(`[SupportSystems] サブアクション「${subAction.actionName}」に対応する制度が見つかりません`);
                        }
                      }
                    }
                  }
                }
                
                if (systemId) {
                  // systemIdを数値に変換（一貫性のため）
                  const numericSystemId = typeof systemId === 'string' ? parseInt(systemId, 10) : systemId;
                  // ID 19（札幌市出産祝い金）の場合のみログを出力
                  if (numericSystemId === 19) {
                    console.log(`[SupportSystems] サブアクション「${subAction.actionName}」を発見。systemId: ${numericSystemId}, 既に追加済み: ${newAddedSystems.has(numericSystemId)}`);
                  }
                  if (!isNaN(numericSystemId) && !newAddedSystems.has(numericSystemId)) {
                    newAddedSystems.add(numericSystemId);
                    hasChanges = true;
                    if (numericSystemId === 19) {
                      console.log(`[SupportSystems] systemId ${numericSystemId}をaddedSystemsに追加しました`);
                    }
                    // 状態も即座に更新
                    setAddedSystems(new Set(newAddedSystems));
                  } else if (newAddedSystems.has(numericSystemId)) {
                    if (numericSystemId === 19) {
                      console.log(`[SupportSystems] systemId ${numericSystemId}は既にaddedSystemsに含まれています`);
                    }
                  }
                }
              }
            }
          }
          
          // 変更があった場合はFirestoreに保存
          if (hasChanges) {
            // systemIdsを数値の配列に変換（一貫性のため）
            const numericSystemIds = Array.from(newAddedSystems).map(id => {
              return typeof id === 'string' ? parseInt(id, 10) : id;
            }).filter(id => !isNaN(id));
            
            await setDoc(addedSystemsRef, { systemIds: numericSystemIds }, { merge: true });
            const numericSet = new Set(numericSystemIds);
            setAddedSystems(numericSet);
            // ID 19が含まれている場合のみログを出力
            if (numericSystemIds.includes(19)) {
              console.log('[SupportSystems] addedSystemsを自動更新しました（ID 19を含む）:', numericSystemIds);
            }
          } else {
            // 変更がなくても、systemIdsを数値に変換して一貫性を保つ
            const numericSystemIds = Array.from(newAddedSystems).map(id => {
              return typeof id === 'string' ? parseInt(id, 10) : id;
            }).filter(id => !isNaN(id));
            const numericSet = new Set(numericSystemIds);
            setAddedSystems(numericSet);
            // ID 19が含まれている場合のみログを出力
            if (numericSystemIds.includes(19)) {
              console.log('[SupportSystems] addedSystemsに変更はありません（ID 19を含む）:', numericSystemIds);
            }
          }
        } catch (error) {
          console.error('addedSystems自動更新エラー:', error);
        }
      } else {
        setActions([]);
      }
    }, (error) => {
      console.error('アクション監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading, supportSystems]);

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

  // 各制度のステータスを取得する関数（ガントチャートと一致させる）
  // actionsが変更されたときに再計算されるようにuseCallbackを使用
  const getSystemStatus = useCallback((systemId) => {
    // systemIdを数値に変換（Firestoreから取得したIDは文字列の可能性があるため）
    const systemIdNum = typeof systemId === 'string' ? parseInt(systemId, 10) : systemId;
    
    // まず、メインアクションとして追加されているかチェック
    const action = actions.find(a => {
      const aSystemId = typeof a.systemId === 'string' ? parseInt(a.systemId, 10) : a.systemId;
      return aSystemId === systemIdNum;
    });
    if (action) {
      console.log(`[getSystemStatus] systemId ${systemId}: Found main action`, action.actionName, 'status:', action.status);
      // statusが存在する場合
      if (action.status) {
        // ガントチャートと一致させるため、statusをそのまま返す
        // statusが 'pending', 'in-progress', 'completed' のいずれかであることを確認
        if (['pending', 'in-progress', 'completed'].includes(action.status)) {
          console.log(`[getSystemStatus] systemId ${systemId}: Returning status:`, action.status);
          return action.status;
        }
        // 無効なステータスの場合は 'pending' を返す
        console.warn(`[getSystemStatus] systemId ${systemId}: Invalid status:`, action.status);
        return 'pending';
      }
      // statusが存在しない場合は 'pending' を返す（追加済みだが未着手）
      console.log(`[getSystemStatus] systemId ${systemId}: No status, returning 'pending'`);
      return 'pending';
    }
    
    // サブアクションとして追加されているかチェック
    // 複数の親アクションに同じサブアクションが存在する場合があるため、すべてを検索して最も進んだステータスを返す
    const foundSubActions = [];
    for (const mainAction of actions) {
      if (mainAction.subActions && Array.isArray(mainAction.subActions)) {
        // まず、systemIdフィールドで検索（新しい制度の場合）
        let subAction = mainAction.subActions.find(sa => {
          const saSystemId = sa.systemId !== undefined && sa.systemId !== null 
            ? (typeof sa.systemId === 'string' ? parseInt(sa.systemId, 10) : sa.systemId)
            : null;
          return saSystemId === systemIdNum;
        });
        
        if (subAction) {
          // ID 19（札幌市出産祝い金）の場合のみログを出力
          if (systemIdNum === 19) {
            console.log(`[getSystemStatus] systemId 19: systemIdフィールドで発見！ 親アクション:`, mainAction.actionName, 'サブアクション:', subAction.actionName, 'ステータス:', subAction.status);
          }
          foundSubActions.push({ subAction, parentAction: mainAction.actionName });
        } else {
          // 後方互換性のため、アクション名から検索（既存の制度ID 1-4）
          if (systemIdNum === 1) { // 出産育児一時金
            subAction = mainAction.subActions.find(sa => sa.actionName === '出産育児一時金');
            if (subAction) {
              foundSubActions.push({ subAction, parentAction: mainAction.actionName });
            }
          } else if (systemIdNum === 2) { // 育児休業給付金
            subAction = mainAction.subActions.find(sa => sa.actionName === '育児休業の申請');
            if (subAction) {
              foundSubActions.push({ subAction, parentAction: mainAction.actionName });
            }
          } else if (systemIdNum === 3) { // 出産手当金
            subAction = mainAction.subActions.find(sa => sa.actionName === '出産手当金の申請');
            if (subAction) {
              foundSubActions.push({ subAction, parentAction: mainAction.actionName });
            }
          } else if (systemIdNum === 4) { // 児童手当
            subAction = mainAction.subActions.find(sa => sa.actionName === '児童手当の申請');
            if (subAction) {
              foundSubActions.push({ subAction, parentAction: mainAction.actionName });
            }
          } else {
            // ID 5以降の新しい制度の場合、動的にサブアクション名を検索
            // サブアクション名は「{制度名}の申請」の形式
            const system = supportSystems.find(s => Number(s.id) === systemIdNum);
            if (system) {
              // titleを優先（nameフィールドは存在しない可能性があるため）
              const expectedActionName = `${system.title || system.name}の申請`;
              subAction = mainAction.subActions.find(sa => sa.actionName === expectedActionName);
              if (subAction) {
                // ID 19（札幌市出産祝い金）の場合のみログを出力
                if (systemIdNum === 19) {
                  console.log(`[getSystemStatus] systemId 19: ${expectedActionName}を発見！ 親アクション:`, mainAction.actionName, 'ステータス:', subAction.status);
                }
                foundSubActions.push({ subAction, parentAction: mainAction.actionName });
              } else {
                // ID 19（札幌市出産祝い金）の場合のみログを出力
                if (systemIdNum === 19) {
                  console.log(`[getSystemStatus] systemId 19: サブアクション「${expectedActionName}」が見つかりません。親アクション:`, mainAction.actionName, 'サブアクション一覧:', mainAction.subActions.map(sa => sa.actionName));
                }
              }
            } else {
              // ID 19（札幌市出産祝い金）の場合のみログを出力
              if (systemIdNum === 19) {
                console.log(`[getSystemStatus] systemId 19: 制度データが見つかりません`);
              }
            }
          }
        }
      }
    }
    
    // 複数のサブアクションが見つかった場合、最も進んだステータスを返す
    if (foundSubActions.length > 0) {
      // ステータスの優先順位: completed > in-progress > pending
      const statusPriority = { 'completed': 3, 'in-progress': 2, 'pending': 1 };
      let bestSubAction = foundSubActions[0];
      let bestPriority = statusPriority[foundSubActions[0].subAction.status] || 0;
      
      foundSubActions.forEach(({ subAction, parentAction }) => {
        const priority = statusPriority[subAction.status] || 0;
        if (priority > bestPriority) {
          bestPriority = priority;
          bestSubAction = { subAction, parentAction };
        }
      });
      
      // ID 19（札幌市出産祝い金）の場合のみログを出力
      if (systemIdNum === 19) {
        console.log(`[getSystemStatus] systemId 19: Found ${foundSubActions.length} sub-action(s), using best status:`, bestSubAction.subAction.status, 'from parent:', bestSubAction.parentAction);
      }
      
      if (bestSubAction.subAction.status) {
        // statusが存在する場合
        // ガントチャートと一致させるため、statusをそのまま返す
        // statusが 'pending', 'in-progress', 'completed' のいずれかであることを確認
        if (['pending', 'in-progress', 'completed'].includes(bestSubAction.subAction.status)) {
          if (systemIdNum === 19) {
            console.log(`[getSystemStatus] systemId 19: Returning status:`, bestSubAction.subAction.status);
          }
          return bestSubAction.subAction.status;
        }
        // 無効なステータスの場合は 'pending' を返す
        if (systemIdNum === 19) {
          console.warn(`[getSystemStatus] systemId 19: Invalid status:`, bestSubAction.subAction.status);
        }
        return 'pending';
      }
      // statusが存在しない場合は 'pending' を返す（追加済みだが未着手）
      if (systemIdNum === 19) {
        console.log(`[getSystemStatus] systemId 19: No status, returning 'pending'`);
      }
      return 'pending';
    }
    
    if (systemIdNum === 19) {
      console.log(`[getSystemStatus] systemId 19: Not found, returning 'none'`);
    }
    return 'none'; // 未追加
  }, [actions, supportSystems]);

  // 追加済み制度をFirestoreに保存
  const saveAddedSystems = async (systemIds) => {
    if (!currentUser || !ownerId) return;
    
    // 共有メンバーの場合、編集権限がない場合は保存できない
    if (isSharedMember && permission !== 'editor') {
      alert('共有メンバーは編集権限がありません。');
      return;
    }
    
    try {
      const addedSystemsRef = doc(db, 'users', ownerId, 'data', 'addedSystems');
      await setDoc(addedSystemsRef, { systemIds: Array.from(systemIds) }, { merge: true });
      console.log('追加済み制度を保存しました:', Array.from(systemIds));
    } catch (error) {
      console.error('追加済み制度保存エラー:', error);
    }
  };

  const handleCardClick = (system, event) => {
    if (!system) return;
    
    const systemIdNum = typeof system.id === 'string' ? parseInt(system.id, 10) : system.id;
    const status = getSystemStatus(systemIdNum);
    
    // 既に追加済み、進行中、または完了の場合は詳細ページに遷移
    if (status !== 'none') {
      // 各制度の詳細ページパスを設定
      const detailPaths = {
        1: '/support-systems/lump-sum',
        2: '/support-systems/childcare-leave',
        3: '/support-systems/childbirth-allowance',
        4: '/support-systems/child-allowance',
        5: '/support-systems/paternity-leave',
        6: '/support-systems/post-birth-leave-support',
        7: '/support-systems/childcare-short-time-work',
        8: '/support-systems/pregnancy-support'
      };
      
      const detailPath = detailPaths[systemIdNum];
      if (detailPath) {
        navigate(detailPath);
      }
      return;
    }
    
    // 閲覧者の場合はクリックしても何もしない
    if (isSharedMember && permission !== 'editor') {
      return;
    }
    
    // 未追加の場合はアクション追加のモーダルを表示
    setSelectedSystem(system);
    // デフォルトで最初のアクションを選択（あれば）
    if (actions.length > 0) {
      setSelectedParentAction(actions[0].id);
    } else {
      setSelectedParentAction(null);
    }
  };

  const handleConfirmAdd = async () => {
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
      
      // systemIdに基づいて期間を設定
      const systemIdNum = typeof selectedSystem.id === 'string' ? parseInt(selectedSystem.id, 10) : selectedSystem.id;
      switch (systemIdNum) {
        case 1: // 出産育児一時金
          // 出産予定日の2週間前から1ヶ月後
          startDate = new Date(due);
          startDate.setDate(startDate.getDate() - 14);
          endDate = new Date(due);
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 2: // 育児休業給付金
          // 出産予定日の1ヶ月後から6ヶ月後
          startDate = new Date(due);
          startDate.setMonth(startDate.getMonth() + 1);
          endDate = new Date(due);
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case 3: // 出産手当金
          // 出産予定日の1ヶ月前から2ヶ月後
          startDate = new Date(due);
          startDate.setMonth(startDate.getMonth() - 1);
          endDate = new Date(due);
          endDate.setMonth(endDate.getMonth() + 2);
          break;
        default:
          // デフォルト：出産予定日の前後1ヶ月
          startDate = new Date(due);
          startDate.setMonth(startDate.getMonth() - 1);
          endDate = new Date(due);
          endDate.setMonth(endDate.getMonth() + 1);
      }
      
      startDate = formatDate(startDate);
      endDate = formatDate(endDate);
    } else {
      // 出産予定日が設定されていない場合は、今日から1ヶ月後
      const today = new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      startDate = formatDate(today);
      endDate = formatDate(oneMonthLater);
    }

    // 追加済み制度に追加（先に保存）
    const newAddedSystems = new Set(addedSystems);
    const systemIdToAdd = typeof selectedSystem.id === 'string' ? parseInt(selectedSystem.id, 10) : selectedSystem.id;
    newAddedSystems.add(systemIdToAdd);
    await saveAddedSystems(newAddedSystems);
    // 状態を更新（onSnapshotが更新を検知するまで）
    setAddedSystems(newAddedSystems);

    // 選択された親アクションのサブアクションとして追加
    try {
      if (!ownerId) {
        alert('オーナーIDが設定されていません。');
        return;
      }
      
      // 共有メンバーの場合、編集権限がない場合は追加できない
      if (isSharedMember && permission !== 'editor') {
        alert('共有メンバーは編集権限がありません。');
        return;
      }
      
      const actionsRef = doc(db, 'users', ownerId, 'data', 'actions');
      const actionsSnapshot = await getDoc(actionsRef);
      const currentActions = actionsSnapshot.exists() ? actionsSnapshot.data().actions || [] : [];
      
      // 親アクションを取得
      const parentAction = currentActions.find(a => a.id === selectedParentAction);
      if (!parentAction) {
        alert('選択された親アクションが見つかりません。');
        return;
      }
      
      // 既に同じアクション名のサブアクションがあるかチェック
      const existingSubAction = parentAction.subActions?.find(sa => sa.actionName === `${selectedSystem.title}の申請`);
      if (existingSubAction) {
        alert('このアクションは既に追加されています。');
        setSelectedSystem(null);
        setSelectedParentAction(null);
        return;
      }
      
      // すべてのIDを収集（重複チェック用）
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
      
      // 親アクションの既存のサブアクションのIDもチェック
      if (parentAction.subActions) {
        parentAction.subActions.forEach(sa => {
          if (sa.id >= subActionId) {
            subActionId = sa.id + 1;
          }
        });
      }
      
      // 新しいサブアクションを作成
      const newSubAction = {
        id: subActionId,
        type: '申請',
        actionName: `${selectedSystem.title}の申請`,
        startDate: startDate,
        endDate: endDate,
        remarks: selectedSystem.description,
        status: 'pending',
        subActions: []
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
      console.log('サブアクションを追加しました:', newSubAction.actionName);
      
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
            id: selectedSystem.id,
            name: selectedSystem.title,
            title: selectedSystem.title,
            description: selectedSystem.description,
            amount: selectedSystem.amount,
            eligibility: selectedSystem.eligibility,
            deadline: selectedSystem.deadline,
            referenceUrl: selectedSystem.referenceUrl,
            category: 'support',
            type: 'support-system',
            savedAt: new Date().toISOString()
          }, { merge: true });
        }
        
        // お気に入りにも自動的に追加
        if (!currentFavoriteIds.includes(itemId)) {
          const updatedFavoriteIds = [...currentFavoriteIds, itemId];
          await setDoc(savedItemsRef, { favoriteItemIds: updatedFavoriteIds }, { merge: true });
        }
      } catch (error) {
        console.error('マイページへの登録エラー:', error);
        // エラーが発生しても処理を続行
      }
    } catch (error) {
      console.error('サブアクション追加エラー:', error);
      alert('サブアクションの追加に失敗しました。');
    }

    setSelectedSystem(null);
    setSelectedParentAction(null);
  };

  const handleCancelAdd = () => {
    setSelectedSystem(null);
    setSelectedParentAction(null);
  };

  if (!currentUser) {
    return null;
  }

  // データ取得中のローディング状態を統合
  const isLoading = loading || ownerIdLoading; // systemsLoadingは常にfalse（マスターデータは即座に利用可能）
  
  // systems変数名をsupportSystemsに統一（既存のコードとの互換性のため）
  const systems = supportSystems;
  
  // 登録済みの制度のみをフィルタリング
  const isSystemRegistered = useCallback((systemId) => {
    // systemIdを数値に変換（FirestoreのドキュメントIDは文字列の可能性があるため）
    // 数値の文字列（"1", "2"など）や数値そのものの両方に対応
    let systemIdNum;
    if (typeof systemId === 'string') {
      // 数値の文字列かどうかをチェック
      const parsed = parseInt(systemId, 10);
      if (!isNaN(parsed) && parsed.toString() === systemId) {
        systemIdNum = parsed;
      } else {
        // 数値の文字列でない場合は、そのまま文字列として扱う（将来の拡張のため）
        // ただし、現在は数値IDのみをサポート
        console.warn(`[isSystemRegistered] systemId "${systemId}" is not a numeric ID`);
        return false;
      }
    } else {
      systemIdNum = systemId;
    }
    
    // addedSystemsに含まれているかチェック（これが主要な判定方法）
    if (addedSystems.has(systemIdNum)) {
      console.log(`[isSystemRegistered] systemId ${systemIdNum} (from "${systemId}"): found in addedSystems`);
      return true;
    }
    
    // actionsに含まれているかチェック（getSystemStatusを使用）
    // これは既存の制度（ID 1-4）の後方互換性のため
    const status = getSystemStatus(systemIdNum);
    if (status !== 'none') {
      console.log(`[isSystemRegistered] systemId ${systemIdNum} (from "${systemId}"): found in actions with status ${status}`);
      return true;
    }
    
    console.log(`[isSystemRegistered] systemId ${systemIdNum} (from "${systemId}"): not registered`);
    return false;
  }, [addedSystems, getSystemStatus]);
  
  // 登録済みの制度のみをフィルタリング
  const registeredSystems = useMemo(() => {
    console.log(`[SupportSystems] ========== フィルタリング開始 ==========`);
    console.log(`[SupportSystems] 全制度数:`, systems.length);
    console.log(`[SupportSystems] 全制度ID:`, systems.map(s => `${s.id} (${typeof s.id}) - ${s.title || s.name}`));
    console.log(`[SupportSystems] addedSystems:`, Array.from(addedSystems).map(id => `${id} (${typeof id})`));
    console.log(`[SupportSystems] actions数:`, actions.length);
    
    // 札幌市出産祝い金（ID 19）を特別にチェック
    const sapporoSystem = systems.find(s => Number(s.id) === 19);
    if (sapporoSystem) {
      console.log(`[SupportSystems] ★ 札幌市出産祝い金を発見:`, {
        id: sapporoSystem.id,
        title: sapporoSystem.title,
        name: sapporoSystem.name
      });
      console.log(`[SupportSystems] ★ addedSystemsに19が含まれているか:`, addedSystems.has(19));
      const status19 = getSystemStatus(19);
      console.log(`[SupportSystems] ★ getSystemStatus(19)の結果:`, status19);
    } else {
      console.log(`[SupportSystems] ★ 札幌市出産祝い金（ID 19）が見つかりません`);
    }
    
    const filtered = systems.filter(system => {
      // system.idを数値に変換
      let systemIdNum;
      if (typeof system.id === 'string') {
        const parsed = parseInt(system.id, 10);
        if (!isNaN(parsed) && parsed.toString() === system.id) {
          systemIdNum = parsed;
        } else {
          console.warn(`[SupportSystems] 制度 "${system.name || system.title}" のID "${system.id}" は数値に変換できません`);
          return false;
        }
      } else {
        systemIdNum = system.id;
      }
      
      // addedSystemsに含まれているかチェック
      const isInAddedSystems = addedSystems.has(systemIdNum);
      
      // getSystemStatusもチェック（後方互換性のため）
      const status = getSystemStatus(systemIdNum);
      const isInActions = status !== 'none';
      
      const isRegistered = isInAddedSystems || isInActions;
      
      // 札幌市出産祝い金の場合は詳細ログを出力
      if (systemIdNum === 19) {
        console.log(`[SupportSystems] ★★★ 札幌市出産祝い金の判定結果:`, {
          systemIdNum,
          isInAddedSystems,
          isInActions,
          status,
          isRegistered,
          addedSystems: Array.from(addedSystems),
          actions: actions.map(a => ({
            actionName: a.actionName,
            subActions: a.subActions?.map(sa => ({
              actionName: sa.actionName,
              systemId: sa.systemId
            }))
          }))
        });
      }
      
      if (!isRegistered) {
        console.log(`[SupportSystems] 制度 "${system.name || system.title}" (ID: ${systemIdNum}, 元のID: ${system.id}, type: ${typeof system.id}) は登録されていません`, {
          isInAddedSystems,
          isInActions,
          status
        });
      } else {
        console.log(`[SupportSystems] 制度 "${system.name || system.title}" (ID: ${systemIdNum}) は登録済み`, {
          isInAddedSystems,
          isInActions,
          status
        });
      }
      
      return isRegistered;
    });
    
    console.log(`[SupportSystems] ========== フィルタリング結果 ==========`);
    console.log(`[SupportSystems] 全制度数:`, systems.length);
    console.log(`[SupportSystems] 登録済み数:`, filtered.length);
    console.log(`[SupportSystems] 登録済みID:`, filtered.map(s => `${s.id} (${typeof s.id}) - ${s.title || s.name}`));
    console.log(`[SupportSystems] addedSystems:`, Array.from(addedSystems).map(id => `${id} (${typeof id})`));
    
    return filtered;
  }, [systems, addedSystems, getSystemStatus, actions]);
  
  // ページネーション計算
  const totalPages = Math.ceil(registeredSystems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSystems = registeredSystems.slice(startIndex, endIndex);
  
  // デバッグ: データの状態を確認
  console.log('[SupportSystems] 全制度数:', systems.length);
  console.log('[SupportSystems] 登録済み制度数:', registeredSystems.length);
  console.log('[SupportSystems] 登録済み制度:', registeredSystems.map(s => `${s.title} (ID: ${s.id})`));

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="support-systems-page">
        <div className="support-systems-content-card">
          <div className="support-systems-content">
            <div style={{ padding: '40px', textAlign: 'center', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>データを読み込んでいます...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 登録済み制度が空の場合の表示
  if (!isLoading && registeredSystems.length === 0) {
    return (
      <div className="support-systems-page">
        <div className="support-systems-content-card">
          <div className="support-systems-content">
            <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              {false ? (
                <>
                  <p style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
                    Firestoreのセキュリティルールが設定されていません
                  </p>
                  <div style={{ textAlign: 'left', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>以下の手順でセキュリティルールをデプロイしてください：</p>
                    <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                      <li>ターミナルで以下のコマンドを実行：<br />
                        <code style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                          firebase deploy --only firestore:rules
                        </code>
                      </li>
                      <li>または、Firebase Consoleで直接設定：<br />
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          Firebase Console → Firestore Database → ルール タブで、firestore.rulesの内容をコピー＆ペースト
                        </span>
                      </li>
                    </ol>
                  </div>
                  <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                    セキュリティルールをデプロイ後、ページをリロードしてください。
                  </p>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                    登録済みの出産支援制度がありません
                  </p>
                  <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                    検索ページから支援制度を登録すると、ここに表示されます。
                  </p>
                  {systems.length === 0 && (
                    <>
                      <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                        初期データを投入してください。
                      </p>
                      <button
                        onClick={handleInitializeData}
                        disabled={isInitializing}
                        style={{
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: 'white',
                          backgroundColor: isInitializing ? '#9ca3af' : '#3b82f6',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: isInitializing ? 'not-allowed' : 'pointer',
                          marginBottom: '20px'
                        }}
                      >
                        {isInitializing ? 'データを投入中...' : '初期データを投入する'}
                      </button>
                      {initError && (
                        <p style={{ marginTop: '10px', fontSize: '14px', color: '#ef4444' }}>
                          エラー: {initError.message || initError.toString()}
                        </p>
                      )}
                      <p style={{ marginTop: '20px', fontSize: '12px', color: '#9ca3af' }}>
                        または、ブラウザのコンソールで <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>window.initializeSupportSystemsData()</code> を実行することもできます。
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="support-systems-page">
      <div className="support-systems-content-card">
        <div className="support-systems-content">
        <div id="intro" className="intro-section">
          <div className="intro-header">
            <div>
              <h2>利用可能な出産支援制度</h2>
              <p>
                出産に関する各種支援制度の詳細情報をご確認いただけます。
                各制度の申請方法や必要書類についてもご案内しています。
              </p>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className="view-mode-toggle">
              <button
                className={`view-mode-button ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => setViewMode('card')}
                title="カード表示"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path>
                </svg>
              </button>
            </div>
            </div>
          </div>
        </div>

        {viewMode === 'card' ? (
          <div className="systems-list">
          {/* すべての制度を動的にレンダリング */}
          {paginatedSystems.map((system) => {
            const categoryLabel = system.category ? categoryLabels[system.category] || 'その他' : null;
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
            // カテゴリに応じた具体的な名称を取得
            const getCategorySpecificName = () => {
              switch(system.category) {
                case 'national':
                  return system.ministryName || null;
                case 'prefecture':
                  return system.prefectureName || null;
                case 'municipality':
                  return system.municipalityName || null;
                case 'private':
                  return system.organizationName || null;
                case 'company':
                  return system.companyName || null;
                default:
                  return null;
              }
            };
            const categorySpecificName = getCategorySpecificName();
            const status = getSystemStatus(system.id);
            const canAdd = !isSharedMember || permission === 'editor';
            const isClickable = canAdd && status === 'none';
            
            // IDに応じたアンカーIDを生成（既存のID 1-8は後方互換性のため）
            const getAnchorId = () => {
              const id = Number(system.id);
              switch(id) {
                case 1: return 'lump-sum';
                case 2: return 'childcare-leave';
                case 3: return 'childbirth-allowance';
                case 4: return 'child-allowance';
                case 5: return 'municipality-birth-gift';
                case 6: return 'private-baby-coupon';
                case 7: return 'company-birth-gift';
                case 8: return 'prefecture-birth-support';
                default: return `system-${id}`;
              }
            };
            
            return (
              <div
                key={system.id}
                id={getAnchorId()}
                className={`system-card ${status === 'pending' ? 'added' : ''} ${status === 'in-progress' ? 'in-progress' : ''} ${status === 'completed' ? 'completed' : ''} ${status !== 'none' ? 'added' : ''}`}
                onClick={(e) => handleCardClick(system, e)}
                style={{ cursor: isClickable ? 'pointer' : 'default', position: 'relative' }}
              >
                {/* カテゴリバッジと名称（左上） */}
                {categoryLabel && (
                  <div className="category-badge-container">
                    <div className={`category-badge ${getCategoryBadgeClass(system.category)}`}>
                      {categoryLabel}
                    </div>
                    {categorySpecificName && (
                      <span className="category-name">{categorySpecificName}</span>
                    )}
                  </div>
                )}
                
                {/* ステータスバッジ（右上） */}
                {status === 'pending' && (
                  <div className="added-badge">アクションに追加済</div>
                )}
                {status === 'in-progress' && (
                  <div className="in-progress-badge">進行中</div>
                )}
                {status === 'completed' && (
                  <div className="completed-badge">完了</div>
                )}
                
                <div className="system-header">
                  <h3 className="system-title">{system.title || system.name}</h3>
                </div>
              </div>
            );
          })}
          {/* ページネーションUI */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                {startIndex + 1}〜{Math.min(endIndex, registeredSystems.length)}件 / 全{registeredSystems.length}件
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
          </div>
        ) : (
          // テーブルビューのレンダリング
          <div className="systems-table-container">
            <table className="systems-table">
              <thead>
                <tr>
                  <th>ステータス</th>
                  <th>制度名</th>
                  <th>支給額</th>
                  <th>対象者</th>
                  <th>申請期限</th>
                  <th>詳細情報</th>
                  <th>アクション</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSystems.map((system) => {
                  const categoryLabel = system.category ? categoryLabels[system.category] || 'その他' : null;
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
              // カテゴリに応じた具体的な名称を取得
              const getCategorySpecificName = () => {
                switch(system.category) {
                  case 'national':
                    return system.ministryName || null;
                  case 'prefecture':
                    return system.prefectureName || null;
                  case 'municipality':
                    return system.municipalityName || null;
                  case 'private':
                    return system.organizationName || null;
                  case 'company':
                    return system.companyName || null;
                  default:
                    return null;
                }
              };
              const categorySpecificName = getCategorySpecificName();
              const status = getSystemStatus(system.id);
              const canAdd = !isSharedMember || permission === 'editor';
              
              return (
                <tr 
                  key={system.id}
                  className={`system-table-row ${status === 'pending' ? 'added' : ''} ${status === 'in-progress' ? 'in-progress' : ''} ${status === 'completed' ? 'completed' : ''}`}
                >
                  <td className="system-status-cell">
                    {status === 'none' && (
                      <span className="status-badge none-badge">未追加</span>
                    )}
                    {status === 'pending' && (
                      <span className="status-badge pending-badge">未着手</span>
                    )}
                    {status === 'in-progress' && (
                      <span className="status-badge in-progress-badge">進行中</span>
                    )}
                    {status === 'completed' && (
                      <span className="status-badge completed-badge">完了</span>
                    )}
                  </td>
                  <td className="system-name-cell">
                    <div className="system-name-with-category">
                      {categoryLabel && (
                        <div className="category-badge-row">
                          <span className={`category-badge-table ${getCategoryBadgeClass(system.category)}`}>
                            {categoryLabel}
                          </span>
                          {categorySpecificName && (
                            <span className="category-name-table">{categorySpecificName}</span>
                          )}
                        </div>
                      )}
                      <div className="system-title-row">
                        <span className="system-title-table">{system.title || system.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="system-amount-cell">{system.amount}</td>
                  <td className="system-eligibility-cell">{system.eligibility}</td>
                  <td className="system-deadline-cell">{system.deadline}</td>
                  <td className="system-reference-cell">
                    {system.referenceUrl && (
                      <a 
                        href={system.referenceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="detail-link-button"
                      >
                        詳細情報を見る
                      </a>
                    )}
                  </td>
                  <td className="system-action-cell">
                    {canAdd && status === 'none' && (
                      <button
                        className="add-action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(system, e);
                        }}
                      >
                        追加
                      </button>
                    )}
                    {status !== 'none' && (
                      <button className="added-action-button" disabled>
                        追加済み
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
              </tbody>
            </table>
            {/* ページネーションUI */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  {startIndex + 1}〜{Math.min(endIndex, registeredSystems.length)}件 / 全{registeredSystems.length}件
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
          </div>
        )}
        </div>
      </div>

      {/* 確認モーダル */}
      {selectedSystem && createPortal(
        <div className="add-action-modal" onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCancelAdd();
          }
        }}>
          <div className="add-action-content" onClick={(e) => e.stopPropagation()}>
            <div className="add-action-header">
              <h5 className="add-action-title">アクション管理に追加</h5>
              <button 
                className="add-action-close-button"
                onClick={handleCancelAdd}
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
                「{selectedSystem.title || selectedSystem.name}」をアクション管理に追加しますか？
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
                onClick={handleConfirmAdd}
                disabled={!selectedParentAction || actions.length === 0}
              >
                追加する
              </button>
              <button className="modal-button cancel" onClick={handleCancelAdd}>
                キャンセル
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SupportSystems;

