import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { useOwnerId } from '../hooks/useOwnerId';
import ActionTable from './ActionTable';
import GanttChart from './GanttChart';
import ActionCalendar from './ActionCalendar';
import './ActionManagement.css';

const ActionManagement = () => {
  const { currentUser } = useAuth();
  const { ownerId, loading: ownerIdLoading, isSharedMember, permission } = useOwnerId();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [firstExaminationDate, setFirstExaminationDate] = useState('');
  const previousDueDateRef = useRef('');
  const previousFirstExaminationDateRef = useRef('');
  const [viewMode, setViewMode] = useState('table'); // 'table', 'gantt', or 'calendar'
  const [showCompleted, setShowCompleted] = useState(true); // 完了アクションの表示/非表示
  const allTypesArray = ['妊娠期', '産褥期', '授乳期', '育児期', '復職期', '診察', '申請', '報告', 'その他', '申請準備', 'MTG'];
  const [selectedTypes, setSelectedTypes] = useState(new Set(allTypesArray)); // 表示する種別
  const [showTypeFilter, setShowTypeFilter] = useState(false); // 種別フィルタモーダルの表示/非表示
  const [showPeriodSettings, setShowPeriodSettings] = useState(false); // 期間設定モーダルの表示/非表示
  const [editingDueDate, setEditingDueDate] = useState(''); // 期間設定モーダル内で編集中の出産予定日
  // 種別の期間設定（デフォルト値）
  const [periodSettings, setPeriodSettings] = useState({
    妊娠期: { startDaysBeforeDue: 280, endDaysAfterDue: 0 }, // 出産予定日の280日前から出産予定日まで
    産褥期: { startDaysAfterDue: 0, endDaysAfterDue: 56 }, // 出産予定日から56日後まで
    授乳期: { startDaysAfterDue: 56, endDaysAfterDue: 365 }, // 産褥期終了から1年後まで
    育児期: { startDaysAfterDue: 365, endDaysAfterDue: 730 }, // 1年後から2年後まで
    復職期: { startDaysAfterDue: 365, endDaysAfterDue: 730 } // 1年後から2年後まで（デフォルト）
  });

  // parentActionIdとparentSubActionIdに基づいてサブアクションとサブサブアクションを正しい親に配置する関数
  // Firestoreの配列の順番をそのまま保持する
  const reorganizeSubActionsByParentId = (actions) => {
    console.log('reorganizeSubActionsByParentId - 開始:');
    actions.forEach((action, index) => {
      console.log(`  [${index + 1}] ${action.actionName} (ID: ${action.id}): 元のsubActions数 = ${action.subActions?.length || 0}`);
      if (action.subActions && action.subActions.length > 0) {
        action.subActions.forEach((subAction, subIndex) => {
          console.log(`    [${index + 1}-${subIndex + 1}] ${subAction.actionName} (ID: ${subAction.id}, parentActionId: ${subAction.parentActionId || 'なし'})`);
        });
      }
    });
    
    // 各アクションのsubActionsの順番をそのまま保持
    // parentActionIdに基づいてサブアクションを正しい親に配置するだけ
    const result = actions.map((action) => {
      // このアクションに属するサブアクションを収集（元の配列の順番を保持）
      const correctSubActions = [];
      
      // すべてのアクションから、このアクションに属するサブアクションを収集
      actions.forEach((sourceAction) => {
        if (sourceAction.subActions) {
          sourceAction.subActions.forEach((subAction) => {
            const parentActionId = subAction.parentActionId || sourceAction.id;
            if (parentActionId === action.id) {
              // このサブアクションに属するサブサブアクションを収集（元の配列の順番を保持）
              const correctSubSubActions = [];
              if (subAction.subActions) {
                subAction.subActions.forEach((subSubAction) => {
                  const parentSubActionId = subSubAction.parentSubActionId || subAction.id;
                  if (parentSubActionId === subAction.id) {
                    const { parentSubActionId, parentActionId, ...rest } = subSubAction;
                    correctSubSubActions.push({ ...rest, parentSubActionId: subAction.id });
                  }
                });
              }
              
              // 既に追加されているかチェック（重複を防ぐ）
              if (!correctSubActions.find(sa => sa.id === subAction.id)) {
                const { parentActionId, ...rest } = subAction;
                correctSubActions.push({
                  ...rest,
                  parentActionId: action.id,
                  subActions: correctSubSubActions
                });
              }
            }
          });
        }
      });
      
      // 元のアクションのsubActionsの順番を保持
      // もし元のアクションにsubActionsがある場合は、その順番を優先
      if (action.subActions && action.subActions.length > 0) {
        const orderedSubActions = [];
        action.subActions.forEach((originalSubAction) => {
          const found = correctSubActions.find(sa => sa.id === originalSubAction.id);
          if (found) {
            orderedSubActions.push(found);
          }
        });
        // 元のアクションにないサブアクションも追加（移動されたもの）
        correctSubActions.forEach((sa) => {
          if (!orderedSubActions.find(osa => osa.id === sa.id)) {
            orderedSubActions.push(sa);
          }
        });
        return {
          ...action,
          subActions: orderedSubActions
        };
      }
      
      return {
        ...action,
        subActions: correctSubActions
      };
    });
    
    console.log('reorganizeSubActionsByParentId - 終了:');
    result.forEach((action, index) => {
      console.log(`  [${index + 1}] ${action.actionName} (ID: ${action.id}): 結果のsubActions数 = ${action.subActions?.length || 0}`);
      if (action.subActions && action.subActions.length > 0) {
        action.subActions.forEach((subAction, subIndex) => {
          console.log(`    [${index + 1}-${subIndex + 1}] ${subAction.actionName} (ID: ${subAction.id}, parentActionId: ${subAction.parentActionId || 'なし'})`);
        });
      }
    });
    
    return result;
  };

  // Firestoreからデータを読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) {
      if (!ownerIdLoading) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    const actionsRef = doc(db, 'users', ownerId, 'data', 'actions');
    
    // タイムアウトを設定（10秒）
    const timeoutId = setTimeout(() => {
      console.warn('データ読み込みがタイムアウトしました');
      setActions([]);
      setLoading(false);
      setError('データの読み込みに時間がかかっています。Firestoreのセキュリティルールを確認してください。');
    }, 10000);
    
    // まず一度だけ読み込む（高速化）
    getDoc(actionsRef)
      .then((snapshot) => {
        clearTimeout(timeoutId);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const loadedActions = data.actions || [];
          console.log('getDoc - Firestoreから読み込んだアクション数:', loadedActions.length);
          // 各アクションの順番をログ出力
          loadedActions.forEach((action, index) => {
            console.log(`  [${index + 1}] ${action.actionName} (ID: ${action.id}, number: ${action.number}): ${action.subActions?.length || 0}件のサブアクション`);
            if (action.subActions && action.subActions.length > 0) {
              action.subActions.forEach((subAction, subIndex) => {
                console.log(`    [${index + 1}-${subIndex + 1}] ${subAction.actionName} (ID: ${subAction.id})`);
              });
            }
          });
          // Firestoreの配列の順番を保持しつつ、parentActionIdに基づいてサブアクションを正しい親に配置
          // reorganizeSubActionsByParentIdを呼ぶが、順番は保持する
          const reorganizedActions = reorganizeSubActionsByParentId(loadedActions);
          console.log('getDoc - reorganizeSubActionsByParentId後のアクション:');
          reorganizedActions.forEach((action, index) => {
            console.log(`  [${index + 1}] ${action.actionName} (ID: ${action.id}): ${action.subActions?.length || 0}件のサブアクション`);
            if (action.subActions && action.subActions.length > 0) {
              action.subActions.forEach((subAction, subIndex) => {
                console.log(`    [${index + 1}-${subIndex + 1}] ${subAction.actionName} (ID: ${subAction.id})`);
              });
            }
          });
          setActions(reorganizedActions);
        } else {
          // 初期データがない場合は空配列を設定
          setActions([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('データ読み込みエラー:', error);
        setError(`データの読み込みに失敗しました: ${error.message}`);
        setActions([]);
        setLoading(false);
      });
    
    // その後、リアルタイムでデータを監視
    let isFirstSnapshot = true;
    const unsubscribe = onSnapshot(
      actionsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const newActions = data.actions || [];
          // Firestoreの配列の順番を保持しつつ、parentActionIdに基づいてサブアクションを正しい親に配置
          // reorganizeSubActionsByParentIdを呼ぶが、順番は保持する
          const reorganizedActions = reorganizeSubActionsByParentId(newActions);
          console.log('onSnapshot - データ更新:', reorganizedActions.length, '件のアクション');
          // 各アクションのサブアクション数をログ出力
          reorganizedActions.forEach(action => {
            console.log(`  - ${action.actionName} (ID: ${action.id}): ${action.subActions?.length || 0}件のサブアクション`);
          });
          // 初回のスナップショットはスキップ（getDocで既に読み込んでいるため）
          if (isFirstSnapshot) {
            isFirstSnapshot = false;
            return;
          }
          setActions(reorganizedActions);
        } else {
          // 初回のスナップショットはスキップ
          if (isFirstSnapshot) {
            isFirstSnapshot = false;
            return;
          }
          setActions([]);
        }
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('リアルタイムデータ監視エラー:', error);
        // エラーが発生しても、既に読み込んだデータがあれば表示を続ける
        setError(`データの監視に失敗しました: ${error.message}`);
      }
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [currentUser, ownerId, ownerIdLoading]);

  // URLパラメータからviewModeを読み取る
  // パラメータがない場合はデフォルトでtableを設定
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'table' || viewParam === 'gantt' || viewParam === 'calendar') {
      setViewMode(viewParam);
    } else {
      // URLパラメータがない場合は、デフォルトでtableを設定
      setViewMode('table');
      const newParams = new URLSearchParams(searchParams);
      newParams.set('view', 'table');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Firestoreからフィルター設定を読み込む（viewModeは除く）
  // 閲覧者の場合は自分のユーザーIDで保存、オーナーの場合はownerIdで保存
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    // 閲覧者の場合は自分のユーザーID、オーナーの場合はownerIdを使用
    const userIdForPreferences = isSharedMember ? currentUser.uid : ownerId;
    const preferencesRef = doc(db, 'users', userIdForPreferences, 'data', 'preferences');
    
    getDoc(preferencesRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.selectedTypes && Array.isArray(data.selectedTypes)) {
            setSelectedTypes(new Set(data.selectedTypes));
          }
          if (data.showCompleted !== undefined) {
            setShowCompleted(data.showCompleted);
          }
          // viewModeはFirestoreから読み込まない（URLパラメータのみを使用）
        }
      })
      .catch((error) => {
        console.error('フィルター設定読み込みエラー:', error);
      });
  }, [currentUser, ownerId, ownerIdLoading, isSharedMember]);

  // フィルター設定をFirestoreに保存（viewModeは除く）
  // 閲覧者の場合も自分のユーザーIDで保存できるようにする
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    // 閲覧者の場合は自分のユーザーID、オーナーの場合はownerIdを使用
    const userIdForPreferences = isSharedMember ? currentUser.uid : ownerId;
    const preferencesRef = doc(db, 'users', userIdForPreferences, 'data', 'preferences');
    
    // デバウンス処理（500ms待機）
    const timeoutId = setTimeout(() => {
      setDoc(preferencesRef, {
        selectedTypes: Array.from(selectedTypes),
        showCompleted: showCompleted
        // viewModeは保存しない（URLパラメータのみを使用）
      }, { merge: true })
        .catch((error) => {
          console.error('フィルター設定保存エラー:', error);
        });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedTypes, showCompleted, currentUser, ownerId, ownerIdLoading, isSharedMember]);

  // Firestoreから期間設定を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const periodSettingsRef = doc(db, 'users', ownerId, 'data', 'periodSettings');
    
    getDoc(periodSettingsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.settings) {
            setPeriodSettings(data.settings);
          }
        }
      })
      .catch((error) => {
        console.error('期間設定読み込みエラー:', error);
      });
  }, [currentUser, ownerId, ownerIdLoading]);

  // 期間設定をFirestoreに保存
  const savePeriodSettings = async (newSettings) => {
    if (!currentUser || !ownerId) return;

    try {
      const periodSettingsRef = doc(db, 'users', ownerId, 'data', 'periodSettings');
      await setDoc(periodSettingsRef, { settings: newSettings }, { merge: true });
      console.log('期間設定を保存しました');
    } catch (error) {
      console.error('期間設定保存エラー:', error);
      throw error;
    }
  };

  // 種別に基づいて期間を計算する関数
  const calculatePeriodDates = (type) => {
    if (!dueDate) {
      const today = new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      return {
        startDate: formatDate(today),
        endDate: formatDate(oneMonthLater)
      };
    }

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const due = new Date(dueDate);
    const setting = periodSettings[type];
    
    if (!setting) {
      // 設定がない場合はデフォルト（今日から1ヶ月後）
      const today = new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      return {
        startDate: formatDate(today),
        endDate: formatDate(oneMonthLater)
      };
    }

    let startDate, endDate;

    if (type === '妊娠期') {
      // 出産予定日のX日前から出産予定日まで
      startDate = new Date(due);
      startDate.setDate(startDate.getDate() - (setting.startDaysBeforeDue || 280));
      endDate = new Date(due);
      endDate.setDate(endDate.getDate() + (setting.endDaysAfterDue || 0));
    } else if (type === '産褥期') {
      // 出産予定日からX日後まで
      startDate = new Date(due);
      startDate.setDate(startDate.getDate() + (setting.startDaysAfterDue || 0));
      endDate = new Date(due);
      endDate.setDate(endDate.getDate() + (setting.endDaysAfterDue || 56));
    } else if (type === '授乳期') {
      // 産褥期の終了日からX日後まで
      const postpartumEndDate = new Date(due);
      postpartumEndDate.setDate(postpartumEndDate.getDate() + 56); // 産褥期の終了日
      startDate = new Date(postpartumEndDate);
      startDate.setDate(startDate.getDate() + (setting.startDaysAfterDue || 0));
      endDate = new Date(due);
      endDate.setDate(endDate.getDate() + (setting.endDaysAfterDue || 365));
    } else {
      // 育児期、復職期など
      startDate = new Date(due);
      startDate.setDate(startDate.getDate() + (setting.startDaysAfterDue || 365));
      endDate = new Date(due);
      endDate.setDate(endDate.getDate() + (setting.endDaysAfterDue || 730));
    }

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  };

  // 出産予定日を基準にデフォルトアクションを追加する関数
  const addDefaultActionsForDueDate = async (targetDueDate, targetFirstExaminationDate, currentUserId) => {
    if (!currentUserId || !targetDueDate) {
      console.log('addDefaultActionsForDueDate: パラメータが不足しています', { currentUserId, targetDueDate });
      return;
    }

    console.log('addDefaultActionsForDueDate: 開始', { targetDueDate, targetFirstExaminationDate, currentUserId });

    try {
      const actionsRef = doc(db, 'users', currentUserId, 'data', 'actions');
      // 最新の状態を取得するため、少し待機してから読み込む（保存操作の完了を待つ）
      await new Promise(resolve => setTimeout(resolve, 100));
      const actionsSnapshot = await getDoc(actionsRef);
      const currentActions = actionsSnapshot.exists() ? actionsSnapshot.data().actions || [] : [];

      console.log('addDefaultActionsForDueDate: 現在のアクション数', currentActions.length);

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const due = new Date(targetDueDate);
      const newActions = [...currentActions];
      let hasChanges = false;

      // すべてのIDを収集（重複チェック用）- 関数の最初で定義
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
      
      // 既にnewActionsに追加されているIDも収集
      newActions.forEach(action => {
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

      // 1. 妊娠期間のアクション
      // 既存のアクションをチェック（IDベースで確実にチェック）
      const pregnancyPeriodAction = currentActions.find(a => a.actionName === '妊娠期間');
      const pregnancyPeriodActionInNew = newActions.find(a => a.actionName === '妊娠期間');
      
      if (!pregnancyPeriodAction && !pregnancyPeriodActionInNew) {
        // 初回設定：妊娠期間は約40週間（280日）なので、出産予定日から280日前を開始日とする
        const pregnancyStartDate = new Date(due);
        pregnancyStartDate.setDate(pregnancyStartDate.getDate() - 280);
        
        const id = currentActions.length > 0 ? Math.max(...currentActions.map(a => a.id)) + 1 : 1;
        const nextNumber = currentActions.length > 0 ? Math.max(...currentActions.map(a => a.number)) + 1 : 1;
        
        newActions.push({
          id,
          number: nextNumber,
          type: '妊娠期',
          actionName: '妊娠期間',
          startDate: formatDate(pregnancyStartDate),
          endDate: formatDate(due),
          remarks: '妊娠期間全体を管理します',
          status: 'pregnancy-period', // 特別な状態
          subActions: []
        });
        hasChanges = true;
        console.log('妊娠期間のアクションを追加しました（進行中）');
      } else if (pregnancyPeriodAction) {
        // 更新時：開始日は変更せず、終了日のみ更新
        const updatedAction = {
          ...pregnancyPeriodAction,
          endDate: formatDate(due) // 終了日のみ更新
        };
        
        const index = newActions.findIndex(a => a.id === pregnancyPeriodAction.id);
        if (index !== -1) {
          newActions[index] = updatedAction;
          hasChanges = true;
          console.log('妊娠期間のアクションの終了日を更新しました');
        }
      } else {
        // 既にnewActionsに追加されている場合は何もしない
        console.log('妊娠期間のアクションは既に追加済みです');
      }

      // 2. 初回診察（妊娠確認）のアクション（妊娠期間のサブアクションとして追加）
      // 妊娠期間のアクションを取得（更新後のnewActionsから取得）
      const pregnancyPeriodActionForSubActions = newActions.find(a => a.actionName === '妊娠期間');
      
      // すべてのアクションをチェックして、既存のサブアクションを検索（他の親アクションに移動されたサブアクションも検出）
      const findAllSubActionsByName = (actionName) => {
        for (const action of newActions) {
          if (action.subActions) {
            const found = action.subActions.find(sa => sa.actionName === actionName);
            if (found) {
              return { subAction: found, parentAction: action };
            }
          }
        }
        return null;
      };
      
      // サブアクションが他の親アクションに存在するかチェックする関数（parentActionIdを考慮）
      const isSubActionInOtherParent = (subActionId, currentParentId) => {
        for (const action of newActions) {
          if (action.subActions) {
            const found = action.subActions.find(sa => {
              // IDが一致し、かつparentActionIdが現在の親アクションIDと異なる場合
              return sa.id === subActionId && sa.parentActionId && sa.parentActionId !== currentParentId;
            });
            if (found) {
              return true;
            }
          }
        }
        return false;
      };
      
      // サブアクションが既に存在するかチェックする関数（parentActionIdを考慮）
      const isSubActionExists = (subActionId) => {
        for (const action of newActions) {
          if (action.subActions) {
            const found = action.subActions.find(sa => sa.id === subActionId);
            if (found) {
              return true;
            }
          }
        }
        return false;
      };
      
      if (pregnancyPeriodActionForSubActions) {
        // 既存のサブアクションをチェック（すべてのアクションから検索）
        const existingFirstExamination = findAllSubActionsByName('初回診察（妊娠確認）');
        const existingMaternalHandbook = findAllSubActionsByName('母子手帳取得');
        const existingLumpSum = findAllSubActionsByName('出産育児一時金');
        // 妊娠期間のサブアクションとして存在するかもチェック（既存の動作を維持）
        const existingFirstExaminationInPregnancy = pregnancyPeriodActionForSubActions.subActions?.find(sa => sa.actionName === '初回診察（妊娠確認）');
        const existingMaternalHandbookInPregnancy = pregnancyPeriodActionForSubActions.subActions?.find(sa => sa.actionName === '母子手帳取得');
        const existingLumpSumInPregnancy = pregnancyPeriodActionForSubActions.subActions?.find(sa => sa.actionName === '出産育児一時金');
        
        // 初回診察（妊娠確認）の期間を計算
        let firstExaminationStartDate;
        let firstExaminationEndDate;
        
        if (targetFirstExaminationDate) {
          // 初回診察日が設定されている場合は、その日付を使用
          firstExaminationStartDate = new Date(targetFirstExaminationDate);
          firstExaminationEndDate = new Date(targetFirstExaminationDate);
          firstExaminationEndDate.setDate(firstExaminationEndDate.getDate() + 14); // 2週間後
        } else {
          // 初回診察日が設定されていない場合は、出産予定日から約8ヶ月前（240日前）を開始日とする
          firstExaminationStartDate = new Date(due);
          firstExaminationStartDate.setDate(firstExaminationStartDate.getDate() - 240);
          firstExaminationEndDate = new Date(firstExaminationStartDate);
          firstExaminationEndDate.setDate(firstExaminationEndDate.getDate() + 14); // 2週間後
        }
        
        // 母子手帳取得の期間を計算
        const handbookStartDate = new Date(due);
        handbookStartDate.setDate(handbookStartDate.getDate() - 210);
        
        const handbookEndDate = new Date(due);
        handbookEndDate.setDate(handbookEndDate.getDate() - 180);
        
        // 出産育児一時金の期間を計算（出産予定日の2週間前から1ヶ月後）
        const lumpSumStartDate = new Date(due);
        lumpSumStartDate.setDate(lumpSumStartDate.getDate() - 14); // 2週間前
        
        const lumpSumEndDate = new Date(due);
        lumpSumEndDate.setMonth(lumpSumEndDate.getMonth() + 1); // 1ヶ月後
        
        // 既存のサブアクションをコピー（状態を含むすべてのフィールドを保持）
        // parentActionIdに基づいて正しい親アクションのサブアクションのみを含める
        const pregnancyPeriodId = pregnancyPeriodActionForSubActions.id;
        const newSubActions = (pregnancyPeriodActionForSubActions.subActions || [])
          .filter(sa => {
            // parentActionIdが設定されている場合は、それが現在の親アクションIDと一致するもののみ
            if (sa.parentActionId) {
              return sa.parentActionId === pregnancyPeriodId;
            }
            // parentActionIdが設定されていない場合は、他の親アクションに存在しないもののみ
            return !isSubActionInOtherParent(sa.id, pregnancyPeriodId);
          })
          .map(sa => ({ ...sa, parentActionId: sa.parentActionId || pregnancyPeriodId }));
        
        console.log('既存のサブアクション:', newSubActions.map(sa => sa.actionName));
        console.log('existingMaternalHandbook:', existingMaternalHandbook);
        
        // 初回診察（妊娠確認）を追加または更新
        if (!existingFirstExamination) {
          // 初回診察のサブアクションIDを生成
          let firstExaminationSubActionId = 1;
          while (allIds.has(firstExaminationSubActionId)) {
            firstExaminationSubActionId++;
          }
          
          newSubActions.push({
            id: firstExaminationSubActionId,
            parentActionId: pregnancyPeriodId,
            type: '診察',
            actionName: '初回診察（妊娠確認）',
            startDate: formatDate(firstExaminationStartDate),
            endDate: formatDate(firstExaminationEndDate),
            remarks: '妊娠が確認された際の初回診察',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
        } else if (existingFirstExaminationInPregnancy && targetFirstExaminationDate) {
          // 既存の初回診察が妊娠期間のサブアクションとして存在する場合のみ更新
          // 既存の初回診察の期間を更新（状態は保持）
          // 日付が実際に変更された場合のみ更新
          const existingStartDate = formatDate(firstExaminationStartDate);
          const existingEndDate = formatDate(firstExaminationEndDate);
          if (existingFirstExaminationInPregnancy.startDate !== existingStartDate || 
              existingFirstExaminationInPregnancy.endDate !== existingEndDate) {
            const index = newSubActions.findIndex(sa => sa.id === existingFirstExaminationInPregnancy.id);
            if (index !== -1) {
              // 既存のサブアクションのすべてのフィールドを保持し、日付のみを更新
              newSubActions[index] = {
                ...existingFirstExaminationInPregnancy,
                startDate: existingStartDate,
                endDate: existingEndDate
                // status, type, remarks, subActionsなどの既存の値はスプレッド演算子で保持される
              };
              hasChanges = true;
            }
          }
        } else {
          // 既に他の親アクションに移動されている場合は何もしない
          console.log('初回診察（妊娠確認）は既に他の親アクションに存在します（移動済み）');
        }
        
        // 母子手帳取得を追加
        if (!existingMaternalHandbook) {
          // 母子手帳取得のサブアクションIDを生成（既存のIDと重複しないように）
          let maternalHandbookSubActionId = 1;
          while (allIds.has(maternalHandbookSubActionId)) {
            maternalHandbookSubActionId++;
          }
          
          // 既存のサブアクションのIDもチェック
          newSubActions.forEach(sa => {
            if (sa.id >= maternalHandbookSubActionId) {
              maternalHandbookSubActionId = sa.id + 1;
            }
          });
          
          newSubActions.push({
            id: maternalHandbookSubActionId,
            parentActionId: pregnancyPeriodId,
            type: '申請',
            actionName: '母子手帳取得',
            startDate: formatDate(handbookStartDate),
            endDate: formatDate(handbookEndDate),
            remarks: '妊娠12週前後（約3ヶ月）に取得します',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
          console.log('母子手帳取得を追加しました:', maternalHandbookSubActionId);
        } else {
          console.log('母子手帳取得は既に存在します:', existingMaternalHandbook?.subAction?.id);
        }
        
        // 出産育児一時金を追加
        if (!existingLumpSum) {
          // 出産育児一時金のサブアクションIDを生成（既存のIDと重複しないように）
          let lumpSumSubActionId = 1;
          while (allIds.has(lumpSumSubActionId)) {
            lumpSumSubActionId++;
          }
          
          // 既存のサブアクションのIDもチェック
          newSubActions.forEach(sa => {
            if (sa.id >= lumpSumSubActionId) {
              lumpSumSubActionId = sa.id + 1;
            }
          });
          
          newSubActions.push({
            id: lumpSumSubActionId,
            parentActionId: pregnancyPeriodId,
            type: '申請',
            actionName: '出産育児一時金',
            startDate: formatDate(lumpSumStartDate),
            endDate: formatDate(lumpSumEndDate),
            remarks: '出産育児一時金（50万円）の申請',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
          console.log('出産育児一時金を追加しました:', lumpSumSubActionId);
          
          // 出産支援制度ページのカードを「追加済み」にするため、addedSystemsにも追加
          if (currentUserId) {
            try {
              const addedSystemsRef = doc(db, 'users', currentUserId, 'data', 'addedSystems');
              const addedSystemsSnapshot = await getDoc(addedSystemsRef);
              const currentSystemIds = addedSystemsSnapshot.exists() ? (addedSystemsSnapshot.data().systemIds || []) : [];
              if (!currentSystemIds.includes(1)) { // 1は出産育児一時金のsystemId
                const updatedSystemIds = [...currentSystemIds, 1];
                await setDoc(addedSystemsRef, { systemIds: updatedSystemIds }, { merge: true });
                console.log('addedSystemsに出産育児一時金を追加しました');
              }
            } catch (error) {
              console.error('addedSystems追加エラー:', error);
            }
          }
        } else {
          console.log('出産育児一時金は既に存在します:', existingLumpSum.id);
        }
        
        // 妊娠確認後の必須事項を追加
        
        // 1. 妊娠届出（市区町村への提出）- 母子手帳取得のサブサブアクションとして
        // 母子手帳取得が妊娠期間のサブアクションとして存在する場合のみ追加
        const existingMaternalHandbookForSubSub = newSubActions.find(sa => sa.actionName === '母子手帳取得');
        if (existingMaternalHandbookForSubSub) {
          const existingPregnancyNotification = existingMaternalHandbookForSubSub.subActions?.find(ssa => ssa.actionName === '妊娠届出（市区町村への提出）');
          if (!existingPregnancyNotification) {
            // 妊娠届出の期間は母子手帳取得と同じ
            let pregnancyNotificationSubSubId = 1;
            while (allIds.has(pregnancyNotificationSubSubId)) {
              pregnancyNotificationSubSubId++;
            }
            if (existingMaternalHandbookForSubSub.subActions) {
              existingMaternalHandbookForSubSub.subActions.forEach(ssa => {
                if (ssa.id >= pregnancyNotificationSubSubId) {
                  pregnancyNotificationSubSubId = ssa.id + 1;
                }
              });
            }
            
            const pregnancyNotificationSubSub = {
              id: pregnancyNotificationSubSubId,
              parentSubActionId: existingMaternalHandbookForSubSub.id,
              parentActionId: pregnancyPeriodId,
              type: '報告',
              actionName: '妊娠届出（市区町村への提出）',
              startDate: formatDate(handbookStartDate),
              endDate: formatDate(handbookEndDate),
              remarks: '住民票のある自治体（市区町村役場・保健センターなど）に提出。母子手帳をもらうため。',
              status: 'pending',
              subActions: []
            };
            
            const handbookIndex = newSubActions.findIndex(sa => sa.id === existingMaternalHandbookForSubSub.id);
            if (handbookIndex !== -1) {
              newSubActions[handbookIndex] = {
                ...existingMaternalHandbookForSubSub,
                subActions: [...(existingMaternalHandbookForSubSub.subActions || []), pregnancyNotificationSubSub]
              };
              hasChanges = true;
            }
          }
        }
        
        // 2. 妊婦健診助成制度の利用 - 妊娠期間のサブアクションとして
        const existingPrenatalCheckup = findAllSubActionsByName('妊婦健診助成制度の利用');
        if (!existingPrenatalCheckup) {
          // 妊娠初期から後期まで（出産予定日の280日前から出産予定日まで）
          const prenatalStartDate = new Date(due);
          prenatalStartDate.setDate(prenatalStartDate.getDate() - 280);
          const prenatalEndDate = new Date(due);
          
          let prenatalSubActionId = 1;
          while (allIds.has(prenatalSubActionId)) {
            prenatalSubActionId++;
          }
          newSubActions.forEach(sa => {
            if (sa.id >= prenatalSubActionId) {
              prenatalSubActionId = sa.id + 1;
            }
          });
          
          newSubActions.push({
            id: prenatalSubActionId,
            parentActionId: pregnancyPeriodId,
            type: '申請',
            actionName: '妊婦健診助成制度の利用',
            startDate: formatDate(prenatalStartDate),
            endDate: formatDate(prenatalEndDate),
            remarks: '自治体から交付された受診券を使い、妊婦健診費用を補助',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
        }
        
        // 3. 上司・人事への妊娠報告 - 妊娠期間のサブアクションとして（安定期12〜16週）
        const existingWorkReport = findAllSubActionsByName('上司・人事への妊娠報告');
        if (!existingWorkReport) {
          // 安定期（出産予定日の210日前から180日前）
          const workReportStartDate = new Date(due);
          workReportStartDate.setDate(workReportStartDate.getDate() - 210);
          const workReportEndDate = new Date(due);
          workReportEndDate.setDate(workReportEndDate.getDate() - 180);
          
          let workReportSubActionId = 1;
          while (allIds.has(workReportSubActionId)) {
            workReportSubActionId++;
          }
          newSubActions.forEach(sa => {
            if (sa.id >= workReportSubActionId) {
              workReportSubActionId = sa.id + 1;
            }
          });
          
          newSubActions.push({
            id: workReportSubActionId,
            parentActionId: pregnancyPeriodId,
            type: '報告',
            actionName: '上司・人事への妊娠報告',
            startDate: formatDate(workReportStartDate),
            endDate: formatDate(workReportEndDate),
            remarks: '安定期（12〜16週）に入った頃に報告。通院・体調配慮、勤務内容調整、休暇取得の準備',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
        }
        
        // 4. 母性健康管理指導事項連絡カード - 上司・人事への妊娠報告のサブサブアクションとして
        // 上司・人事への妊娠報告が妊娠期間のサブアクションとして存在する場合のみ追加
        const existingWorkReportForSubSub = newSubActions.find(sa => sa.actionName === '上司・人事への妊娠報告');
        if (existingWorkReportForSubSub) {
          const existingMaternalHealthCard = existingWorkReportForSubSub.subActions?.find(ssa => ssa.actionName === '母性健康管理指導事項連絡カード');
          if (!existingMaternalHealthCard) {
            const workReportStartDate = new Date(due);
            workReportStartDate.setDate(workReportStartDate.getDate() - 210);
            const workReportEndDate = new Date(due);
            workReportEndDate.setDate(workReportEndDate.getDate() - 180);
            
            let maternalHealthCardSubSubId = 1;
            while (allIds.has(maternalHealthCardSubSubId)) {
              maternalHealthCardSubSubId++;
            }
            if (existingWorkReportForSubSub.subActions) {
              existingWorkReportForSubSub.subActions.forEach(ssa => {
                if (ssa.id >= maternalHealthCardSubSubId) {
                  maternalHealthCardSubSubId = ssa.id + 1;
                }
              });
            }
            
            const maternalHealthCardSubSub = {
              id: maternalHealthCardSubSubId,
              parentSubActionId: existingWorkReportForSubSub.id,
              parentActionId: pregnancyPeriodId,
              type: '報告',
              actionName: '母性健康管理指導事項連絡カード',
              startDate: formatDate(workReportStartDate),
              endDate: formatDate(workReportEndDate),
              remarks: '医師が勤務上の配慮を指示した際に会社へ提出',
              status: 'pending',
              subActions: []
            };
            
            const workReportIndex = newSubActions.findIndex(sa => sa.id === existingWorkReportForSubSub.id);
            if (workReportIndex !== -1) {
              newSubActions[workReportIndex] = {
                ...existingWorkReportForSubSub,
                subActions: [...(existingWorkReportForSubSub.subActions || []), maternalHealthCardSubSub]
              };
              hasChanges = true;
            }
          }
        }
        
        // 5. 産前産後休暇の申請 - 妊娠期間のサブアクションとして（出産予定日の6週間前から）
        const existingMaternityLeave = findAllSubActionsByName('産前産後休暇の申請');
        if (!existingMaternityLeave) {
          // 出産予定日の6週間前から
          const maternityLeaveStartDate = new Date(due);
          maternityLeaveStartDate.setDate(maternityLeaveStartDate.getDate() - 42);
          const maternityLeaveEndDate = new Date(due);
          
          let maternityLeaveSubActionId = 1;
          while (allIds.has(maternityLeaveSubActionId)) {
            maternityLeaveSubActionId++;
          }
          newSubActions.forEach(sa => {
            if (sa.id >= maternityLeaveSubActionId) {
              maternityLeaveSubActionId = sa.id + 1;
            }
          });
          
          newSubActions.push({
            id: maternityLeaveSubActionId,
            parentActionId: pregnancyPeriodId,
            type: '申請',
            actionName: '産前産後休暇の申請',
            startDate: formatDate(maternityLeaveStartDate),
            endDate: formatDate(maternityLeaveEndDate),
            remarks: '出産予定日の6週間前から産前休暇、出産後8週間は産後休暇',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
        }
        
        // 6. 育児休業の申請 - 妊娠期間のサブアクションとして
        const existingChildcareLeave = findAllSubActionsByName('育児休業の申請');
        if (!existingChildcareLeave) {
          // 出産予定日の1ヶ月前から
          const childcareLeaveStartDate = new Date(due);
          childcareLeaveStartDate.setMonth(childcareLeaveStartDate.getMonth() - 1);
          const childcareLeaveEndDate = new Date(due);
          
          let childcareLeaveSubActionId = 1;
          while (allIds.has(childcareLeaveSubActionId)) {
            childcareLeaveSubActionId++;
          }
          newSubActions.forEach(sa => {
            if (sa.id >= childcareLeaveSubActionId) {
              childcareLeaveSubActionId = sa.id + 1;
            }
          });
          
          newSubActions.push({
            id: childcareLeaveSubActionId,
            parentActionId: pregnancyPeriodId,
            type: '申請',
            actionName: '育児休業の申請',
            startDate: formatDate(childcareLeaveStartDate),
            endDate: formatDate(childcareLeaveEndDate),
            remarks: '出産後に取得予定の場合、職場規定に沿って早めに相談',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
          
          // 育児休業給付金のカードを「追加済み」にするため、addedSystemsにも追加
          if (currentUserId) {
            try {
              const addedSystemsRef = doc(db, 'users', currentUserId, 'data', 'addedSystems');
              const addedSystemsSnapshot = await getDoc(addedSystemsRef);
              const currentSystemIds = addedSystemsSnapshot.exists() ? (addedSystemsSnapshot.data().systemIds || []) : [];
              if (!currentSystemIds.includes(2)) { // 2は育児休業給付金のsystemId
                const updatedSystemIds = [...currentSystemIds, 2];
                await setDoc(addedSystemsRef, { systemIds: updatedSystemIds }, { merge: true });
                console.log('addedSystemsに育児休業給付金を追加しました');
              }
            } catch (error) {
              console.error('addedSystems追加エラー:', error);
            }
          }
        }
        
        // 7. 出産手当金の申請 - 妊娠期間のサブアクションとして（出産予定日の1ヶ月前から2ヶ月後）
        const existingChildbirthAllowance = findAllSubActionsByName('出産手当金の申請');
        if (!existingChildbirthAllowance) {
          // 出産予定日の1ヶ月前から2ヶ月後
          const childbirthAllowanceStartDate = new Date(due);
          childbirthAllowanceStartDate.setMonth(childbirthAllowanceStartDate.getMonth() - 1);
          const childbirthAllowanceEndDate = new Date(due);
          childbirthAllowanceEndDate.setMonth(childbirthAllowanceEndDate.getMonth() + 2);
          
          let childbirthAllowanceSubActionId = 1;
          while (allIds.has(childbirthAllowanceSubActionId)) {
            childbirthAllowanceSubActionId++;
          }
          newSubActions.forEach(sa => {
            if (sa.id >= childbirthAllowanceSubActionId) {
              childbirthAllowanceSubActionId = sa.id + 1;
            }
          });
          
          newSubActions.push({
            id: childbirthAllowanceSubActionId,
            parentActionId: pregnancyPeriodId,
            type: '申請',
            actionName: '出産手当金の申請',
            startDate: formatDate(childbirthAllowanceStartDate),
            endDate: formatDate(childbirthAllowanceEndDate),
            remarks: '産前42日＋産後56日の間、給与の約2/3を支給（勤務先の健康保険加入者のみ）',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
          
          // 出産手当金のカードを「追加済み」にするため、addedSystemsにも追加
          if (currentUserId) {
            try {
              const addedSystemsRef = doc(db, 'users', currentUserId, 'data', 'addedSystems');
              const addedSystemsSnapshot = await getDoc(addedSystemsRef);
              const currentSystemIds = addedSystemsSnapshot.exists() ? (addedSystemsSnapshot.data().systemIds || []) : [];
              if (!currentSystemIds.includes(3)) { // 3は出産手当金のsystemId
                const updatedSystemIds = [...currentSystemIds, 3];
                await setDoc(addedSystemsRef, { systemIds: updatedSystemIds }, { merge: true });
                console.log('addedSystemsに出産手当金を追加しました');
              }
            } catch (error) {
              console.error('addedSystems追加エラー:', error);
            }
          }
        }
        
        // サブアクションの順番を保持（ソートしない）
        // 妊娠期間のアクションを更新
        const updatedPregnancyPeriodAction = {
          ...pregnancyPeriodActionForSubActions,
          subActions: newSubActions
        };
        
        // newActions内の妊娠期間アクションを更新
        const index = newActions.findIndex(a => a.id === pregnancyPeriodActionForSubActions.id);
        if (index !== -1) {
          newActions[index] = updatedPregnancyPeriodAction;
          if (hasChanges) {
            console.log('妊娠期間のアクションに初回診察、母子手帳取得、出産育児一時金を追加しました');
          }
        }
      }

      // 3. 産褥期のアクション
      // 産褥期の終了日を計算（出産予定日から約8週間後）
      const postpartumEndDate = new Date(due);
      postpartumEndDate.setDate(postpartumEndDate.getDate() + 56);
      const postpartumEndDateStr = formatDate(postpartumEndDate);
      
      const postpartumPeriodAction = currentActions.find(a => a.actionName === '産褥期');
      const postpartumPeriodActionInNew = newActions.find(a => a.actionName === '産褥期');
      
      if (!postpartumPeriodAction && !postpartumPeriodActionInNew) {
        // 初回設定：産褥期は通常、出産後約6-8週間（約2ヶ月）の期間
        const id = newActions.length > 0 ? Math.max(...newActions.map(a => a.id)) + 1 : 1;
        const nextNumber = newActions.length > 0 ? Math.max(...newActions.map(a => a.number)) + 1 : 1;
        
        newActions.push({
          id,
          number: nextNumber,
          type: '産褥期',
          actionName: '産褥期',
          startDate: formatDate(due),
          endDate: postpartumEndDateStr,
          remarks: '出産後約6-8週間の産褥期を管理します',
          status: 'postpartum-period', // 特別な状態
          subActions: []
        });
        hasChanges = true;
        console.log('産褥期のアクションを追加しました（進行中）');
      } else if (postpartumPeriodAction) {
        // 更新時：開始日は変更せず、終了日のみ更新
        const updatedAction = {
          ...postpartumPeriodAction,
          endDate: postpartumEndDateStr // 終了日のみ更新
        };
        
        const index = newActions.findIndex(a => a.id === postpartumPeriodAction.id);
        if (index !== -1) {
          newActions[index] = updatedAction;
          hasChanges = true;
          console.log('産褥期のアクションの終了日を更新しました');
        }
      } else {
        // 既にnewActionsに追加されている場合は何もしない
        console.log('産褥期のアクションは既に追加済みです');
      }
      
      // 産褥期のサブアクションを追加
      const postpartumPeriodActionForSubActions = newActions.find(a => a.actionName === '産褥期');
      if (postpartumPeriodActionForSubActions) {
        // parentActionIdに基づいて正しい親アクションのサブアクションのみを含める
        const postpartumPeriodId = postpartumPeriodActionForSubActions.id;
        const existingPostpartumSubActions = (postpartumPeriodActionForSubActions.subActions || [])
          .filter(sa => {
            // parentActionIdが設定されている場合は、それが現在の親アクションIDと一致するもののみ
            if (sa.parentActionId) {
              return sa.parentActionId === postpartumPeriodId;
            }
            // parentActionIdが設定されていない場合は、他の親アクションに存在しないもののみ
            return !isSubActionInOtherParent(sa.id, postpartumPeriodId);
          })
          .map(sa => ({ ...sa, parentActionId: sa.parentActionId || postpartumPeriodId }));
        
        // 1. 出生届の提出（出産直後14日以内）
        // すべてのアクションから検索して、既に他の親アクションに移動されたサブアクションを除外
        const existingBirthRegistrationInAll = findAllSubActionsByName('出生届の提出');
        const existingBirthRegistration = existingPostpartumSubActions.find(sa => sa.actionName === '出生届の提出');
        // 既に他の親アクションに移動されている場合は追加しない
        if (!existingBirthRegistrationInAll && !existingBirthRegistration) {
          const birthRegistrationStartDate = new Date(due);
          const birthRegistrationEndDate = new Date(due);
          birthRegistrationEndDate.setDate(birthRegistrationEndDate.getDate() + 14);
          
          let birthRegistrationSubActionId = 1;
          while (allIds.has(birthRegistrationSubActionId)) {
            birthRegistrationSubActionId++;
          }
          existingPostpartumSubActions.forEach(sa => {
            if (sa.id >= birthRegistrationSubActionId) {
              birthRegistrationSubActionId = sa.id + 1;
            }
          });
          
          existingPostpartumSubActions.push({
            id: birthRegistrationSubActionId,
            parentActionId: postpartumPeriodId,
            type: '報告',
            actionName: '出生届の提出',
            startDate: formatDate(birthRegistrationStartDate),
            endDate: formatDate(birthRegistrationEndDate),
            remarks: '出生から14日以内に提出。出生地または本籍地の市区町村役場',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
        }
        
        // 2. 健康保険への加入手続き（出産直後）
        // すべてのアクションから検索して、既に他の親アクションに移動されたサブアクションを除外
        const existingHealthInsuranceInAll = findAllSubActionsByName('健康保険への加入手続き');
        const existingHealthInsurance = existingPostpartumSubActions.find(sa => sa.actionName === '健康保険への加入手続き');
        // 既に他の親アクションに移動されている場合は追加しない
        if (!existingHealthInsuranceInAll && !existingHealthInsurance) {
          const healthInsuranceStartDate = new Date(due);
          const healthInsuranceEndDate = new Date(due);
          healthInsuranceEndDate.setDate(healthInsuranceEndDate.getDate() + 14);
          
          let healthInsuranceSubActionId = 1;
          while (allIds.has(healthInsuranceSubActionId)) {
            healthInsuranceSubActionId++;
          }
          existingPostpartumSubActions.forEach(sa => {
            if (sa.id >= healthInsuranceSubActionId) {
              healthInsuranceSubActionId = sa.id + 1;
            }
          });
          
          existingPostpartumSubActions.push({
            id: healthInsuranceSubActionId,
            parentActionId: postpartumPeriodId,
            type: '申請',
            actionName: '健康保険への加入手続き',
            startDate: formatDate(healthInsuranceStartDate),
            endDate: formatDate(healthInsuranceEndDate),
            remarks: '赤ちゃんを医療保険に加入させる。勤務先または国民健康保険窓口',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
        }
        
        // 3. 児童手当の申請（出産直後15日以内）
        // すべてのアクションから検索して、既に他の親アクションに移動されたサブアクションを除外
        const existingChildAllowanceInAll = findAllSubActionsByName('児童手当の申請');
        const existingChildAllowance = existingPostpartumSubActions.find(sa => sa.actionName === '児童手当の申請');
        // 既に他の親アクションに移動されている場合は追加しない
        if (!existingChildAllowanceInAll && !existingChildAllowance) {
          const childAllowanceStartDate = new Date(due);
          const childAllowanceEndDate = new Date(due);
          childAllowanceEndDate.setDate(childAllowanceEndDate.getDate() + 15);
          
          let childAllowanceSubActionId = 1;
          while (allIds.has(childAllowanceSubActionId)) {
            childAllowanceSubActionId++;
          }
          existingPostpartumSubActions.forEach(sa => {
            if (sa.id >= childAllowanceSubActionId) {
              childAllowanceSubActionId = sa.id + 1;
            }
          });
          
          existingPostpartumSubActions.push({
            id: childAllowanceSubActionId,
            parentActionId: postpartumPeriodId,
            type: '申請',
            actionName: '児童手当の申請',
            startDate: formatDate(childAllowanceStartDate),
            endDate: formatDate(childAllowanceEndDate),
            remarks: '出生翌日から15日以内に申請（遡及できない）。申請月の翌月分から支給開始',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
          
          // 児童手当のカードを「追加済み」にするため、addedSystemsにも追加
          if (currentUserId) {
            try {
              const addedSystemsRef = doc(db, 'users', currentUserId, 'data', 'addedSystems');
              const addedSystemsSnapshot = await getDoc(addedSystemsRef);
              const currentSystemIds = addedSystemsSnapshot.exists() ? (addedSystemsSnapshot.data().systemIds || []) : [];
              if (!currentSystemIds.includes(4)) { // 4は児童手当のsystemId
                const updatedSystemIds = [...currentSystemIds, 4];
                await setDoc(addedSystemsRef, { systemIds: updatedSystemIds }, { merge: true });
                console.log('addedSystemsに児童手当を追加しました');
              }
            } catch (error) {
              console.error('addedSystems追加エラー:', error);
            }
          }
        }
        
        // 産褥期のアクションを更新
        const updatedPostpartumPeriodAction = {
          ...postpartumPeriodActionForSubActions,
          subActions: existingPostpartumSubActions
        };
        
        const postpartumIndex = newActions.findIndex(a => a.id === postpartumPeriodActionForSubActions.id);
        if (postpartumIndex !== -1) {
          newActions[postpartumIndex] = updatedPostpartumPeriodAction;
        }
      }

      // 4. 授乳期のアクション
      // 授乳期の開始日は産褥期の終了日と同じにする
      const breastfeedingStartDateStr = postpartumEndDateStr;
      
      const breastfeedingPeriodAction = currentActions.find(a => a.actionName === '授乳期');
      const breastfeedingPeriodActionInNew = newActions.find(a => a.actionName === '授乳期');
      
      if (!breastfeedingPeriodAction && !breastfeedingPeriodActionInNew) {
        // 初回設定：授乳期は産褥期の終了日から開始し、出産予定日から1年後を終了日とする
        const breastfeedingEndDate = new Date(due);
        breastfeedingEndDate.setFullYear(breastfeedingEndDate.getFullYear() + 1);
        
        const id = newActions.length > 0 ? Math.max(...newActions.map(a => a.id)) + 1 : 1;
        const nextNumber = newActions.length > 0 ? Math.max(...newActions.map(a => a.number)) + 1 : 1;
        
        newActions.push({
          id,
          number: nextNumber,
          type: '授乳期',
          actionName: '授乳期',
          startDate: breastfeedingStartDateStr, // 産褥期の終了日と同じ
          endDate: formatDate(breastfeedingEndDate),
          remarks: '産褥期終了後から1年程度の授乳期を管理します',
          status: 'breastfeeding-period', // 特別な状態
          subActions: []
        });
        hasChanges = true;
        console.log('授乳期のアクションを追加しました（進行中）');
      } else if (breastfeedingPeriodAction) {
        // 更新時：開始日は産褥期の終了日と同じに更新、終了日も更新
        const breastfeedingEndDate = new Date(due);
        breastfeedingEndDate.setFullYear(breastfeedingEndDate.getFullYear() + 1);
        
        const updatedAction = {
          ...breastfeedingPeriodAction,
          startDate: breastfeedingStartDateStr, // 産褥期の終了日と同じに更新
          endDate: formatDate(breastfeedingEndDate) // 終了日も更新
        };
        
        const index = newActions.findIndex(a => a.id === breastfeedingPeriodAction.id);
        if (index !== -1) {
          newActions[index] = updatedAction;
          hasChanges = true;
          console.log('授乳期のアクションの開始日と終了日を更新しました');
        }
      } else {
        // 既にnewActionsに追加されている場合は何もしない
        console.log('授乳期のアクションは既に追加済みです');
      }
      
      // 授乳期のサブアクションを追加
      const breastfeedingPeriodActionForSubActions = newActions.find(a => a.actionName === '授乳期');
      if (breastfeedingPeriodActionForSubActions) {
        // parentActionIdに基づいて正しい親アクションのサブアクションのみを含める
        const breastfeedingPeriodId = breastfeedingPeriodActionForSubActions.id;
        const existingBreastfeedingSubActions = (breastfeedingPeriodActionForSubActions.subActions || [])
          .filter(sa => {
            // parentActionIdが設定されている場合は、それが現在の親アクションIDと一致するもののみ
            if (sa.parentActionId) {
              return sa.parentActionId === breastfeedingPeriodId;
            }
            // parentActionIdが設定されていない場合は、他の親アクションに存在しないもののみ
            return !isSubActionInOtherParent(sa.id, breastfeedingPeriodId);
          })
          .map(sa => ({ ...sa, parentActionId: sa.parentActionId || breastfeedingPeriodId }));
        
        // 1. 乳児健康診査の予約（産後1〜3か月）
        // すべてのアクションから検索して、既に他の親アクションに移動されたサブアクションを除外
        const existingInfantHealthCheckInAll = findAllSubActionsByName('乳児健康診査の予約');
        const existingInfantHealthCheck = existingBreastfeedingSubActions.find(sa => sa.actionName === '乳児健康診査の予約');
        // 既に他の親アクションに移動されている場合は追加しない
        if (!existingInfantHealthCheckInAll && !existingInfantHealthCheck) {
          const infantHealthCheckStartDate = new Date(due);
          infantHealthCheckStartDate.setDate(infantHealthCheckStartDate.getDate() + 30); // 産後1ヶ月
          const infantHealthCheckEndDate = new Date(due);
          infantHealthCheckEndDate.setDate(infantHealthCheckEndDate.getDate() + 90); // 産後3ヶ月
          
          let infantHealthCheckSubActionId = 1;
          while (allIds.has(infantHealthCheckSubActionId)) {
            infantHealthCheckSubActionId++;
          }
          existingBreastfeedingSubActions.forEach(sa => {
            if (sa.id >= infantHealthCheckSubActionId) {
              infantHealthCheckSubActionId = sa.id + 1;
            }
          });
          
          existingBreastfeedingSubActions.push({
            id: infantHealthCheckSubActionId,
            parentActionId: breastfeedingPeriodId,
            type: '診察',
            actionName: '乳児健康診査の予約',
            startDate: formatDate(infantHealthCheckStartDate),
            endDate: formatDate(infantHealthCheckEndDate),
            remarks: '自治体から案内が届きます（1か月・3か月健診など）。母子手帳に結果を記録',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
        }
        
        // 2. 予防接種スケジュールの登録（産後1〜3か月）
        // すべてのアクションから検索して、既に他の親アクションに移動されたサブアクションを除外
        const existingVaccinationScheduleInAll = findAllSubActionsByName('予防接種スケジュールの登録');
        const existingVaccinationSchedule = existingBreastfeedingSubActions.find(sa => sa.actionName === '予防接種スケジュールの登録');
        // 既に他の親アクションに移動されている場合は追加しない
        if (!existingVaccinationScheduleInAll && !existingVaccinationSchedule) {
          const vaccinationScheduleStartDate = new Date(due);
          vaccinationScheduleStartDate.setDate(vaccinationScheduleStartDate.getDate() + 30); // 産後1ヶ月
          const vaccinationScheduleEndDate = new Date(due);
          vaccinationScheduleEndDate.setDate(vaccinationScheduleEndDate.getDate() + 90); // 産後3ヶ月
          
          let vaccinationScheduleSubActionId = 1;
          while (allIds.has(vaccinationScheduleSubActionId)) {
            vaccinationScheduleSubActionId++;
          }
          existingBreastfeedingSubActions.forEach(sa => {
            if (sa.id >= vaccinationScheduleSubActionId) {
              vaccinationScheduleSubActionId = sa.id + 1;
            }
          });
          
          existingBreastfeedingSubActions.push({
            id: vaccinationScheduleSubActionId,
            parentActionId: breastfeedingPeriodId,
            type: '申請',
            actionName: '予防接種スケジュールの登録',
            startDate: formatDate(vaccinationScheduleStartDate),
            endDate: formatDate(vaccinationScheduleEndDate),
            remarks: '母子手帳後半にある接種スケジュール表を確認し、病院に予約',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
        }
        
        // 3. 保育園・認可外施設の情報収集（産後1〜3か月）
        // すべてのアクションから検索して、既に他の親アクションに移動されたサブアクションを除外
        const existingNurseryResearchInAll = findAllSubActionsByName('保育園・認可外施設の情報収集');
        const existingNurseryResearch = existingBreastfeedingSubActions.find(sa => sa.actionName === '保育園・認可外施設の情報収集');
        // 既に他の親アクションに移動されている場合は追加しない
        if (!existingNurseryResearchInAll && !existingNurseryResearch) {
          const nurseryResearchStartDate = new Date(due);
          nurseryResearchStartDate.setDate(nurseryResearchStartDate.getDate() + 30); // 産後1ヶ月
          const nurseryResearchEndDate = new Date(due);
          nurseryResearchEndDate.setDate(nurseryResearchEndDate.getDate() + 90); // 産後3ヶ月
          
          let nurseryResearchSubActionId = 1;
          while (allIds.has(nurseryResearchSubActionId)) {
            nurseryResearchSubActionId++;
          }
          existingBreastfeedingSubActions.forEach(sa => {
            if (sa.id >= nurseryResearchSubActionId) {
              nurseryResearchSubActionId = sa.id + 1;
            }
          });
          
          existingBreastfeedingSubActions.push({
            id: nurseryResearchSubActionId,
            parentActionId: breastfeedingPeriodId,
            type: 'その他',
            actionName: '保育園・認可外施設の情報収集',
            startDate: formatDate(nurseryResearchStartDate),
            endDate: formatDate(nurseryResearchEndDate),
            remarks: '復職時期を見据えて早めに調査・申請（地域によっては妊娠中から相談可）',
            status: 'pending',
            subActions: []
          });
          hasChanges = true;
        }
        
        // 授乳期のアクションを更新
        const updatedBreastfeedingPeriodAction = {
          ...breastfeedingPeriodActionForSubActions,
          subActions: existingBreastfeedingSubActions
        };
        
        const breastfeedingIndex = newActions.findIndex(a => a.id === breastfeedingPeriodActionForSubActions.id);
        if (breastfeedingIndex !== -1) {
          newActions[breastfeedingIndex] = updatedBreastfeedingPeriodAction;
        }
      }

      // 変更があった場合のみ保存
      if (hasChanges) {
        // 番号を1から始まる連番に再割り当て（渡された順番を保持）
        const renumberedActions = newActions.map((action, index) => ({
          ...action,
          number: index + 1,
          // サブアクションも深くコピーして状態を保持
          subActions: action.subActions ? action.subActions.map(sa => ({ ...sa })) : []
        }));
        
        // parentActionIdに基づいてサブアクションを正しい親アクションに配置しない（順番を保持するため）
        // reorganizeSubActionsByParentIdは呼ばない（順番を保持するため）
        const reorganizedActions = renumberedActions;
        
        console.log('addDefaultActionsForDueDate - 保存するアクション数:', reorganizedActions.length);
        // 各アクションのサブアクション数をログ出力
        reorganizedActions.forEach(action => {
          console.log(`  - ${action.actionName} (ID: ${action.id}): ${action.subActions?.length || 0}件のサブアクション`);
        });
        
        // Firestoreに直接保存（onSnapshotが自動的に状態を更新する）
        await setDoc(actionsRef, { actions: reorganizedActions }, { merge: false });
        // setActionsは呼ばない（onSnapshotが自動的に更新するため、二重更新を防ぐ）
        console.log('デフォルトアクションを追加/更新しました', reorganizedActions.length, '件');
      } else {
        console.log('addDefaultActionsForDueDate: 変更がありませんでした');
      }
    } catch (error) {
      console.error('デフォルトアクション追加エラー:', error);
      console.error('エラーの詳細:', error.stack);
    }
  };

  // Firestoreから出産予定日と初回診察日を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
    
    // まず一度だけ読み込む（初期値の設定）
    getDoc(userDataRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const initialDueDate = data.dueDate || '';
          const initialFirstExaminationDate = data.firstExaminationDate || '';
          
          previousDueDateRef.current = initialDueDate;
          previousFirstExaminationDateRef.current = initialFirstExaminationDate;
          setDueDate(initialDueDate);
          setFirstExaminationDate(initialFirstExaminationDate);
          
          // 初期値が設定されている場合は、デフォルトアクションを追加
          if (initialDueDate) {
            console.log('初期値でデフォルトアクションを追加します', { initialDueDate, initialFirstExaminationDate });
            addDefaultActionsForDueDate(initialDueDate, initialFirstExaminationDate, ownerId);
          }
        }
      })
      .catch((error) => {
        console.error('初期データ読み込みエラー:', error);
      });
    
    // その後、リアルタイムでデータを監視
    const unsubscribe = onSnapshot(userDataRef, async (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {};
      const newDueDate = data.dueDate || '';
      const newFirstExaminationDate = data.firstExaminationDate || '';
      const previousDueDate = previousDueDateRef.current;
      const previousFirstExaminationDate = previousFirstExaminationDateRef.current;
      
      console.log('出産予定日・初回診察日の変更を検知', {
        newDueDate,
        previousDueDate,
        newFirstExaminationDate,
        previousFirstExaminationDate,
        changed: newDueDate !== previousDueDate || newFirstExaminationDate !== previousFirstExaminationDate
      });
      
      // 出産予定日が設定された場合、または初回診察日が変更された場合、自動アクションを追加/更新
      if (newDueDate && (newDueDate !== previousDueDate || newFirstExaminationDate !== previousFirstExaminationDate)) {
        console.log('デフォルトアクションを追加/更新します');
        try {
          await addDefaultActionsForDueDate(newDueDate, newFirstExaminationDate, ownerId);
        } catch (error) {
          console.error('デフォルトアクション追加中にエラーが発生しました:', error);
        }
      }
      
      previousDueDateRef.current = newDueDate;
      previousFirstExaminationDateRef.current = newFirstExaminationDate;
      setDueDate(newDueDate);
      setFirstExaminationDate(newFirstExaminationDate);
    }, (error) => {
      console.error('データ監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);

  // アクションを期間アクションのサブアクションとして自動分類する関数
  const categorizeActionsByPeriod = (actions) => {
    // 期間アクションを取得
    const pregnancyPeriodAction = actions.find(a => a.actionName === '妊娠期間');
    const postpartumPeriodAction = actions.find(a => a.actionName === '産褥期');
    const breastfeedingPeriodAction = actions.find(a => a.actionName === '授乳期');
    
    // 期間アクション以外のアクションを取得（既にサブアクションとして分類されているものは除外）
    const periodActionNames = ['妊娠期間', '産褥期', '授乳期'];
    const parentActionTypes = ['妊娠期', '産褥期', '授乳期', '育児期', '復職期']; // 親アクションの種別
    const allSubActionIds = new Set();
    actions.forEach(action => {
      if (periodActionNames.includes(action.actionName) && action.subActions) {
        action.subActions.forEach(subAction => {
          allSubActionIds.add(subAction.id);
        });
      }
    });
    
    // 親アクション（種別が「妊娠期」「産褥期」「授乳期」「育児期」「復職期」のいずれか）は除外
    const regularActions = actions.filter(a => 
      !periodActionNames.includes(a.actionName) && 
      !allSubActionIds.has(a.id) && // 既にサブアクションとして分類されているものは除外
      !parentActionTypes.includes(a.type) // 親アクションの種別は除外
    );
    
    console.log('categorizeActionsByPeriod - 入力アクション数:', actions.length);
    console.log('categorizeActionsByPeriod - 親アクション:', actions.filter(a => parentActionTypes.includes(a.type)).map(a => ({ id: a.id, actionName: a.actionName, type: a.type })));
    console.log('categorizeActionsByPeriod - regularActions数:', regularActions.length);
    
    // 期間アクションのコピーを作成（既存のサブアクションを保持）
    const periodActions = [
      pregnancyPeriodAction ? { ...pregnancyPeriodAction, subActions: [...(pregnancyPeriodAction.subActions || [])] } : null,
      postpartumPeriodAction ? { ...postpartumPeriodAction, subActions: [...(postpartumPeriodAction.subActions || [])] } : null,
      breastfeedingPeriodAction ? { ...breastfeedingPeriodAction, subActions: [...(breastfeedingPeriodAction.subActions || [])] } : null
    ].filter(Boolean);
    
    // 各通常アクションを適切な期間アクションのサブアクションとして分類
    regularActions.forEach(action => {
      if (!action.startDate) return; // 開始日がない場合はスキップ
      
      const actionStartDate = new Date(action.startDate);
      
      // 妊娠期間内かチェック
      if (pregnancyPeriodAction) {
        const pregnancyStart = new Date(pregnancyPeriodAction.startDate);
        const pregnancyEnd = new Date(pregnancyPeriodAction.endDate);
        if (actionStartDate >= pregnancyStart && actionStartDate <= pregnancyEnd) {
          const periodAction = periodActions.find(a => a.actionName === '妊娠期間');
          if (periodAction) {
            periodAction.subActions.push(action);
            return; // 分類済み
          }
        }
      }
      
      // 産褥期内かチェック
      if (postpartumPeriodAction) {
        const postpartumStart = new Date(postpartumPeriodAction.startDate);
        const postpartumEnd = new Date(postpartumPeriodAction.endDate);
        if (actionStartDate >= postpartumStart && actionStartDate <= postpartumEnd) {
          const periodAction = periodActions.find(a => a.actionName === '産褥期');
          if (periodAction) {
            periodAction.subActions.push(action);
            return; // 分類済み
          }
        }
      }
      
      // 授乳期内かチェック
      if (breastfeedingPeriodAction) {
        const breastfeedingStart = new Date(breastfeedingPeriodAction.startDate);
        const breastfeedingEnd = new Date(breastfeedingPeriodAction.endDate);
        if (actionStartDate >= breastfeedingStart && actionStartDate <= breastfeedingEnd) {
          const periodAction = periodActions.find(a => a.actionName === '授乳期');
          if (periodAction) {
            periodAction.subActions.push(action);
            return; // 分類済み
          }
        }
      }
      
      // どの期間にも該当しない場合は、妊娠期間のサブアクションとして追加（デフォルト）
      if (pregnancyPeriodAction) {
        const periodAction = periodActions.find(a => a.actionName === '妊娠期間');
        if (periodAction) {
          periodAction.subActions.push(action);
        }
      }
    });
    
    // 期間アクションとその他のアクションを結合
    // 親アクション（種別が「妊娠期」「産褥期」「授乳期」「育児期」「復職期」のいずれか）も含める
    const otherActions = actions.filter(a => 
      !periodActionNames.includes(a.actionName) && 
      !periodActions.some(pa => pa.subActions.some(sa => sa.id === a.id))
    );
    
    console.log('categorizeActionsByPeriod - otherActions数:', otherActions.length);
    console.log('categorizeActionsByPeriod - otherActions:', otherActions.map(a => ({ id: a.id, actionName: a.actionName, type: a.type })));
    console.log('categorizeActionsByPeriod - 返却アクション数:', periodActions.length + otherActions.length);
    
    return [...periodActions, ...otherActions];
  };

  // Firestoreにデータを直接保存する関数（再分類なし、状態を保持）
  const saveActionsToFirestoreDirectly = async (newActions) => {
    if (!currentUser) {
      console.error('ユーザーがログインしていません');
      return;
    }
    
    try {
      console.log('saveActionsToFirestoreDirectly - 保存前のアクション数:', newActions.length);
      // 各アクションのサブアクション数をログ出力
      newActions.forEach(action => {
        console.log(`  - ${action.actionName} (ID: ${action.id}): ${action.subActions?.length || 0}件のサブアクション`);
        if (action.subActions && action.subActions.length > 0) {
          action.subActions.forEach(subAction => {
            console.log(`    - ${subAction.actionName} (ID: ${subAction.id})`);
          });
        }
      });
      
      // 番号を1から始まる連番に再割り当て（渡された順番を保持）
      const renumberedActions = newActions.map((action, index) => ({
        ...action,
        number: index + 1
      }));
      
      console.log('saveActionsToFirestoreDirectly - 保存前のアクション順番:');
      newActions.forEach((action, index) => {
        console.log(`  [${index + 1}] ${action.actionName} (ID: ${action.id})`);
      });
      
      console.log('saveActionsToFirestoreDirectly - 保存するアクション数:', renumberedActions.length);
      // 各アクションのサブアクション数をログ出力（順番も確認）
      renumberedActions.forEach((action, index) => {
        console.log(`  [${index + 1}] ${action.actionName} (ID: ${action.id}, number: ${action.number}): ${action.subActions?.length || 0}件のサブアクション`);
        if (action.subActions && action.subActions.length > 0) {
          action.subActions.forEach((subAction, subIndex) => {
            console.log(`    [${index + 1}-${subIndex + 1}] ${subAction.actionName} (ID: ${subAction.id})`);
          });
        }
      });
      
      console.log('saveActionsToFirestoreDirectly - Firestoreに保存する配列の順番:');
      renumberedActions.forEach((action, index) => {
        console.log(`  [${index + 1}] ${action.actionName} (ID: ${action.id})`);
      });
      
      if (!ownerId) {
        console.error('ownerIdが設定されていません');
        return;
      }
      
      // 共有メンバーの場合、編集権限がない場合は保存できない
      if (isSharedMember && permission !== 'editor') {
        alert('共有メンバーは編集権限がありません。');
        throw new Error('編集権限がありません');
      }
      
      const actionsRef = doc(db, 'users', ownerId, 'data', 'actions');
      await setDoc(actionsRef, { actions: renumberedActions }, { merge: false });
      console.log('saveActionsToFirestoreDirectly - データを保存しました:', renumberedActions.length, '件のアクション');
    } catch (error) {
      console.error('データ保存エラー:', error);
      console.error('エラー詳細:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      alert(`データの保存に失敗しました: ${error.message}\n\nFirestoreのセキュリティルールを確認してください。`);
      throw error; // エラーを再スローして、呼び出し元で処理できるようにする
    }
  };

  // Firestoreにデータを保存する関数
  const saveActionsToFirestore = async (newActions) => {
    if (!currentUser) {
      console.error('ユーザーがログインしていません');
      return;
    }
    
    try {
      console.log('保存前のアクション数:', newActions.length);
      console.log('保存前のアクション:', newActions.map(a => ({ id: a.id, actionName: a.actionName, type: a.type })));
      
      // アクションを期間アクションのサブアクションとして自動分類
      const categorizedActions = categorizeActionsByPeriod(newActions);
      
      console.log('分類後のアクション数:', categorizedActions.length);
      console.log('分類後のアクション:', categorizedActions.map(a => ({ id: a.id, actionName: a.actionName, type: a.type })));
      
      // 番号を1から始まる連番に再割り当て（渡された順番を保持）
      const renumberedActions = categorizedActions.map((action, index) => ({
        ...action,
        number: index + 1
      }));
      
      console.log('保存するアクション数:', renumberedActions.length);
      console.log('保存するアクション:', renumberedActions.map(a => ({ id: a.id, actionName: a.actionName, type: a.type })));
      
      if (!ownerId) {
        console.error('ownerIdが設定されていません');
        return;
      }
      
      // 共有メンバーの場合、編集権限がない場合は保存できない
      if (isSharedMember && permission !== 'editor') {
        alert('共有メンバーは編集権限がありません。');
        throw new Error('編集権限がありません');
      }
      
      const actionsRef = doc(db, 'users', ownerId, 'data', 'actions');
      await setDoc(actionsRef, { actions: renumberedActions }, { merge: false });
      console.log('データを保存しました:', renumberedActions.length, '件のアクション');
    } catch (error) {
      console.error('データ保存エラー:', error);
      console.error('エラー詳細:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      alert(`データの保存に失敗しました: ${error.message}\n\nFirestoreのセキュリティルールを確認してください。`);
      throw error; // エラーを再スローして、呼び出し元で処理できるようにする
    }
  };

  const handleDelete = async (id) => {
    // 削除されるアクションのsystemIdを取得
    const deletedAction = actions.find(action => action.id === id);
    const systemId = deletedAction?.systemId;

    const newActions = actions.filter(action => action.id !== id);
    setActions(newActions);
    try {
      // 親アクションの削除時も、categorizeActionsByPeriodを呼び出さずに直接保存
      // 親アクションは期間アクションのサブアクションとして分類されるべきではない
      await saveActionsToFirestoreDirectly(newActions);
      
      // systemIdがある場合、addedSystemsからも削除
      if (systemId && currentUser) {
        try {
          const addedSystemsRef = doc(db, 'users', ownerId, 'data', 'addedSystems');
          const addedSystemsSnapshot = await getDoc(addedSystemsRef);
          if (addedSystemsSnapshot.exists()) {
            const data = addedSystemsSnapshot.data();
            const systemIds = (data.systemIds || []).filter(sid => sid !== systemId);
            await setDoc(addedSystemsRef, { systemIds }, { merge: true });
            console.log('addedSystemsから削除しました:', systemId);
          }
        } catch (error) {
          console.error('addedSystems削除エラー:', error);
        }
      }
    } catch (error) {
      // エラーが発生した場合は、元の状態に戻す
      setActions(actions);
    }
  };

  const handleDeleteAll = async () => {
    if (actions.length === 0) {
      alert('削除するアクションがありません。');
      return;
    }

    const confirmMessage = `すべてのアクション（${actions.length}件）を削除しますか？\n\nこの操作は取り消せません。`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const originalActions = actions;
    setActions([]);
    try {
      const actionsRef = doc(db, 'users', currentUser.uid, 'data', 'actions');
      await setDoc(actionsRef, { actions: [] }, { merge: false });
      
      // addedSystemsもクリア
      if (currentUser) {
        try {
          const addedSystemsRef = doc(db, 'users', ownerId, 'data', 'addedSystems');
          await setDoc(addedSystemsRef, { systemIds: [] }, { merge: true });
          console.log('すべてのアクションとaddedSystemsを削除しました');
        } catch (error) {
          console.error('addedSystems削除エラー:', error);
        }
      }
      
      alert('すべてのアクションを削除しました。');
    } catch (error) {
      // エラーが発生した場合は、元の状態に戻す
      setActions(originalActions);
      alert('アクションの削除に失敗しました。Firestoreのセキュリティルールを確認してください。');
      console.error('一括削除エラー:', error);
    }
  };

  const handleUpdate = async (updatedAction) => {
    console.log('handleUpdate called:', { 
      actionId: updatedAction.id, 
      actionName: updatedAction.actionName,
      status: updatedAction.status,
      hasSubActions: !!updatedAction.subActions,
      subActionsCount: updatedAction.subActions?.length || 0
    });
    
    // 最新のactions状態を使用するため、関数型更新を使用
    setActions(currentActions => {
      const existingAction = currentActions.find(a => a.id === updatedAction.id);
      if (!existingAction) {
        console.warn('更新対象のアクションが見つかりません:', updatedAction.id, 'Available actions:', currentActions.map(a => a.id));
        return currentActions;
      }
      
      const newActions = currentActions.map(action => {
        if (action.id === updatedAction.id) {
          // サブアクションの状態を保持するため、深いコピーを作成
          // updatedActionのサブアクションを使用（更新されたもの）
          const updatedSubActions = updatedAction.subActions 
            ? updatedAction.subActions.map(sa => {
                // 各サブアクションを完全に独立してコピー
                return {
                  ...sa,
                  // サブサブアクションも完全に独立してコピー
                  subActions: sa.subActions ? sa.subActions.map(ssa => ({ ...ssa })) : []
                };
              })
            : (existingAction.subActions 
                ? existingAction.subActions.map(sa => {
                    // 既存のサブアクションも完全に独立してコピー
                    return {
                      ...sa,
                      subActions: sa.subActions ? sa.subActions.map(ssa => ({ ...ssa })) : []
                    };
                  })
                : []);
          
          // 親アクションの状態を決定（updatedActionに明示的に指定されていない限り、既存の状態を保持）
          const finalStatus = updatedAction.status !== undefined 
            ? updatedAction.status 
            : existingAction.status;
          
          return {
            ...existingAction, // 既存のアクションのすべてのプロパティを保持
            ...updatedAction,  // updatedActionのプロパティで上書き
            status: finalStatus, // 状態は上記のロジックで決定
            subActions: updatedSubActions // サブアクションは更新されたものを使用
          };
        }
        // 他のアクションも深くコピーして状態を保持
        return {
          ...action,
          subActions: action.subActions ? action.subActions.map(sa => {
            return {
              ...sa,
              subActions: sa.subActions ? sa.subActions.map(ssa => ({ ...ssa })) : []
            };
          }) : []
        };
      });
      
      // 期間アクションの日付連動処理
      // 1. 妊娠期間の終了日が変更されたら、産褥期の開始日も同じ日付に更新
      if (updatedAction.actionName === '妊娠期間' && updatedAction.endDate) {
        const postpartumAction = newActions.find(a => a.actionName === '産褥期');
        if (postpartumAction && postpartumAction.startDate !== updatedAction.endDate) {
          const postpartumIndex = newActions.findIndex(a => a.id === postpartumAction.id);
          if (postpartumIndex !== -1) {
            newActions[postpartumIndex] = {
              ...postpartumAction,
              startDate: updatedAction.endDate
            };
            console.log('産褥期の開始日を妊娠期間の終了日に連動しました:', updatedAction.endDate);
          }
        }
      }
      
      // 2. 産褥期の終了日が変更されたら、授乳期の開始日も同じ日付に更新
      if (updatedAction.actionName === '産褥期' && updatedAction.endDate) {
        const breastfeedingAction = newActions.find(a => a.actionName === '授乳期');
        if (breastfeedingAction && breastfeedingAction.startDate !== updatedAction.endDate) {
          const breastfeedingIndex = newActions.findIndex(a => a.id === breastfeedingAction.id);
          if (breastfeedingIndex !== -1) {
            newActions[breastfeedingIndex] = {
              ...breastfeedingAction,
              startDate: updatedAction.endDate
            };
            console.log('授乳期の開始日を産褥期の終了日に連動しました:', updatedAction.endDate);
          }
        }
      }
      
      // 非同期で保存（状態更新は即座に反映）
      saveActionsToFirestoreDirectly(newActions).catch(error => {
        console.error('データ保存エラー:', error);
        // エラーが発生した場合は、元の状態に戻す
        setActions(currentActions);
      });
      
      return newActions;
    });
  };

  const handleAdd = async (newAction) => {
    const id = actions.length > 0 ? Math.max(...actions.map(a => a.id)) + 1 : 1;
    const nextNumber = actions.length > 0 ? Math.max(...actions.map(a => a.number)) + 1 : 1;
    const newActions = [...actions, { ...newAction, id, number: nextNumber, subActions: [] }];
    setActions(newActions);
    try {
      // 親アクションを追加する場合は、categorizeActionsByPeriodを呼び出さずに直接保存
      // 親アクションは期間アクションのサブアクションとして分類されるべきではない
      await saveActionsToFirestoreDirectly(newActions);
    } catch (error) {
      // エラーが発生した場合は、追加したアクションを削除
      setActions(actions);
      alert('アクションの追加に失敗しました。Firestoreのセキュリティルールを確認してください。');
    }
  };

  const handleAddSubAction = async (actionId, subAction) => {
    const originalActions = actions;
    const newActions = actions.map(action => {
      if (action.id === actionId) {
        const subActionId = action.subActions.length > 0 
          ? Math.max(...action.subActions.map(sa => sa.id)) + 1 
          : 1;
        return {
          ...action,
          subActions: [...action.subActions, { ...subAction, id: subActionId, parentActionId: actionId, subActions: [] }]
        };
      }
      return action;
    });
    setActions(newActions);
    try {
      // サブアクション追加時も、categorizeActionsByPeriodを呼び出さずに直接保存
      // 親アクションの位置を保持するため
      await saveActionsToFirestoreDirectly(newActions);
    } catch (error) {
      setActions(originalActions);
    }
  };

  const handleChangeSubActionParent = async (currentParentId, subActionId, newParentId) => {
    if (currentParentId === newParentId) {
      return; // 同じ親の場合は何もしない
    }

    console.log('handleChangeSubActionParent called:', { currentParentId, subActionId, newParentId });
    const originalActions = actions;
    
    // 現在の親アクションからサブアクションを取得
    const currentParentAction = actions.find(a => a.id === currentParentId);
    if (!currentParentAction || !currentParentAction.subActions) {
      console.error('現在の親アクションが見つかりません:', currentParentId);
      return;
    }

    const subAction = currentParentAction.subActions.find(sa => sa.id === subActionId);
    if (!subAction) {
      console.error('サブアクションが見つかりません:', subActionId);
      return;
    }

    console.log('移動するサブアクション:', subAction);

    // 新しい親アクションを取得
    const newParentAction = actions.find(a => a.id === newParentId);
    if (!newParentAction) {
      console.error('新しい親アクションが見つかりません:', newParentId);
      return;
    }

    console.log('現在の親アクション:', currentParentAction.actionName, 'サブアクション数:', currentParentAction.subActions.length);
    console.log('新しい親アクション:', newParentAction.actionName, 'サブアクション数:', (newParentAction.subActions || []).length);

    // サブアクションにparentActionIdを設定して移動
    // サブサブアクションのparentActionIdも更新
    const updatedSubAction = {
      ...subAction,
      parentActionId: newParentId,
      subActions: subAction.subActions ? subAction.subActions.map(ssa => ({
        ...ssa,
        parentActionId: newParentId,
        parentSubActionId: ssa.parentSubActionId || subAction.id // parentSubActionIdがない場合は現在のサブアクションIDを設定
      })) : []
    };

    // サブアクションを現在の親から削除し、新しい親に追加
    const newActions = actions.map(action => {
      if (action.id === currentParentId) {
        // 現在の親からサブアクションを削除
        const filteredSubActions = action.subActions.filter(sa => sa.id !== subActionId);
        console.log('現在の親から削除後:', filteredSubActions.length, '件のサブアクション');
        return {
          ...action,
          subActions: filteredSubActions
        };
      } else if (action.id === newParentId) {
        // 新しい親にサブアクションを追加（parentActionIdを設定）
        const newSubActions = [...(action.subActions || []), updatedSubAction];
        console.log('新しい親に追加後:', newSubActions.length, '件のサブアクション');
        return {
          ...action,
          subActions: newSubActions
        };
      }
      return action;
    });

    console.log('変更後のアクション数:', newActions.length);
    const updatedCurrentParent = newActions.find(a => a.id === currentParentId);
    const updatedNewParent = newActions.find(a => a.id === newParentId);
    console.log('変更後の現在の親:', updatedCurrentParent?.actionName, 'サブアクション数:', updatedCurrentParent?.subActions?.length);
    console.log('変更後の新しい親:', updatedNewParent?.actionName, 'サブアクション数:', updatedNewParent?.subActions?.length);

    setActions(newActions);
    try {
      await saveActionsToFirestoreDirectly(newActions);
      console.log('親アクションの変更が完了しました');
    } catch (error) {
      console.error('親アクションの変更エラー:', error);
      setActions(originalActions);
      alert('親アクションの変更に失敗しました。');
    }
  };

  const handleDeleteSubAction = async (actionId, subActionId) => {
    const originalActions = actions;
    const newActions = actions.map(action => {
      if (action.id === actionId) {
        return {
          ...action,
          subActions: action.subActions.filter(sa => sa.id !== subActionId)
        };
      }
      return action;
    });
    setActions(newActions);
    try {
      // サブアクション削除時も、categorizeActionsByPeriodを呼び出さずに直接保存
      // 親アクションの位置を保持するため
      await saveActionsToFirestoreDirectly(newActions);
    } catch (error) {
      setActions(originalActions);
    }
  };

  const handleAddSubSubAction = async (actionId, subActionId, subSubAction) => {
    const originalActions = actions;
    const newActions = actions.map(action => {
      if (action.id === actionId) {
        return {
          ...action,
          subActions: action.subActions.map(subAction => {
            if (subAction.id === subActionId) {
              const subSubActionId = (subAction.subActions && subAction.subActions.length > 0)
                ? Math.max(...subAction.subActions.map(ssa => ssa.id)) + 1
                : 1;
              return {
                ...subAction,
                subActions: [...(subAction.subActions || []), { 
                  ...subSubAction, 
                  id: subSubActionId,
                  parentSubActionId: subActionId,
                  parentActionId: actionId
                }]
              };
            }
            return subAction;
          })
        };
      }
      return action;
    });
    setActions(newActions);
    try {
      // サブサブアクション追加時も、categorizeActionsByPeriodを呼び出さずに直接保存
      // 親アクションの位置を保持するため
      await saveActionsToFirestoreDirectly(newActions);
    } catch (error) {
      setActions(originalActions);
    }
  };

  const handleDeleteSubSubAction = async (actionId, subActionId, subSubActionId) => {
    const originalActions = actions;
    const newActions = actions.map(action => {
      if (action.id === actionId) {
        return {
          ...action,
          subActions: action.subActions.map(subAction => {
            if (subAction.id === subActionId) {
              return {
                ...subAction,
                subActions: (subAction.subActions || []).filter(ssa => ssa.id !== subSubActionId)
              };
            }
            return subAction;
          })
        };
      }
      return action;
    });
    setActions(newActions);
    try {
      // サブサブアクション削除時も、categorizeActionsByPeriodを呼び出さずに直接保存
      // 親アクションの位置を保持するため
      await saveActionsToFirestoreDirectly(newActions);
    } catch (error) {
      setActions(originalActions);
    }
  };

  const handleReorder = async (reorderedActions) => {
    console.log('handleReorder - 並び替え後のアクション順番:');
    reorderedActions.forEach((action, index) => {
      console.log(`  [${index + 1}] ${action.actionName} (ID: ${action.id})`);
    });
    const originalActions = actions;
    setActions(reorderedActions);
    try {
      // 親アクションの並び替え時も、categorizeActionsByPeriodを呼び出さずに直接保存
      // 親アクションは期間アクションのサブアクションとして分類されるべきではない
      await saveActionsToFirestoreDirectly(reorderedActions);
    } catch (error) {
      setActions(originalActions);
    }
  };

  const handleReorderSubActions = async (actionId, reorderedSubActions) => {
    console.log(`handleReorderSubActions - アクションID: ${actionId}, 並び替え後のサブアクション順番:`);
    reorderedSubActions.forEach((subAction, index) => {
      console.log(`  [${index + 1}] ${subAction.actionName} (ID: ${subAction.id})`);
    });
    const originalActions = actions;
    const newActions = actions.map(action => {
      if (action.id === actionId) {
        return {
          ...action,
          subActions: reorderedSubActions
        };
      }
      return action;
    });
    setActions(newActions);
    try {
      // サブアクションの並び替え時も、categorizeActionsByPeriodを呼び出さずに直接保存
      // 親アクションの位置を保持するため
      await saveActionsToFirestoreDirectly(newActions);
    } catch (error) {
      setActions(originalActions);
    }
  };

  // SupportSystemsから遷移してきたときにアクションを追加
  useEffect(() => {
    if (location.state?.newAction && !loading) {
      const { newAction } = location.state;
      // 既に同じsystemIdのアクションがあるかチェック
      const existingAction = actions.find(a => a.systemId === newAction.systemId);
      if (!existingAction) {
        // 現在のactions配列をコピーして新しいアクションを追加
        setActions((currentActions) => {
          const id = currentActions.length > 0 ? Math.max(...currentActions.map(a => a.id)) + 1 : 1;
          const nextNumber = currentActions.length > 0 ? Math.max(...currentActions.map(a => a.number)) + 1 : 1;
          const newActions = [...currentActions, { ...newAction, id, number: nextNumber, subActions: [] }];
          // 非同期で保存
          saveActionsToFirestore(newActions).catch((error) => {
            console.error('アクション追加エラー:', error);
          });
          return newActions;
        });
        // 状態をクリアして再実行を防ぐ
        window.history.replaceState({}, document.title);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, loading]);

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="action-management-page">
        <div className="action-management-content-card">
          <div className="action-management-content">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div>データを読み込んでいます...</div>
              {error && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '12px', 
                  background: '#fee', 
                  color: '#c33', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="action-management-page">
      <div className="action-management-content-card">
        <div className="action-management-content">
        {error && (
          <div style={{ 
            margin: '20px', 
            padding: '12px', 
            background: '#fff3cd', 
            color: '#856404', 
            borderRadius: '6px',
            fontSize: '14px',
            border: '1px solid #ffc107'
          }}>
            ⚠️ {error}
          </div>
        )}
        <div id="overview" className="intro-section">
          <div className="intro-header">
            <div>
              <h2>アクション管理</h2>
              <p>
                妊娠期間から育児期までの診察、申請、報告などのアクションを一元管理できます。
                ガントチャートで期間を可視化し、スケジュールを効率的に進めましょう。
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                className="period-settings-button"
                onClick={() => {
                  setEditingDueDate(dueDate || '');
                  setShowPeriodSettings(true);
                }}
                title="種別の期間設定"
              >
                期間設定
              </button>
              <div className="view-mode-toggle">
                <button
                  className={`view-mode-button ${(searchParams.get('view') || 'table') === 'table' ? 'active' : ''}`}
                  onClick={() => {
                    setViewMode('table');
                    // URLパラメータを更新（既存のパラメータを保持）
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('view', 'table');
                    setSearchParams(newParams);
                  }}
                >
                  表形式
                </button>
                <button
                  className={`view-mode-button ${searchParams.get('view') === 'gantt' ? 'active' : ''}`}
                  onClick={() => {
                    setViewMode('gantt');
                    // URLパラメータを更新（既存のパラメータを保持）
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('view', 'gantt');
                    setSearchParams(newParams);
                  }}
                >
                  ガントチャート
                </button>
                <button
                  className={`view-mode-button ${searchParams.get('view') === 'calendar' ? 'active' : ''}`}
                  onClick={() => {
                    setViewMode('calendar');
                    // URLパラメータを更新（既存のパラメータを保持）
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('view', 'calendar');
                    setSearchParams(newParams);
                  }}
                >
                  カレンダー
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 期間設定モーダル */}
        {showPeriodSettings && createPortal(
          <div className="period-settings-modal" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPeriodSettings(false);
              setEditingDueDate('');
            }
          }}>
            <div className="period-settings-content" onClick={(e) => e.stopPropagation()}>
              <div className="period-settings-header">
                <h3>種別の期間設定</h3>
                <button 
                  className="period-settings-close-button"
                  onClick={() => {
                    setShowPeriodSettings(false);
                    setEditingDueDate('');
                  }}
                  title="閉じる"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="period-settings-body">
                <p className="period-settings-description">
                  各種別の期間を設定できます。親アクションを追加する際に、この設定に基づいて期間が自動的に設定されます。
                </p>
                <div className="period-due-date-section">
                  <label className="period-due-date-label">出産予定日</label>
                  <input
                    type="date"
                    className="period-due-date-input"
                    value={editingDueDate || dueDate || ''}
                    onChange={(e) => setEditingDueDate(e.target.value)}
                  />
                  {(editingDueDate || dueDate) && (
                    <div className="period-due-date-current">
                      現在の設定: {editingDueDate || dueDate}
                    </div>
                  )}
                </div>
                {['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].map(type => {
                  const setting = periodSettings[type] || {};
                  
                  // 実際の日付を計算（編集中の出産予定日を優先）
                  const calculateActualDates = () => {
                    const currentDueDate = editingDueDate || dueDate;
                    if (!currentDueDate) {
                      return { startDate: null, endDate: null };
                    }
                    
                    const formatDate = (date) => {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}年${month}月${day}日`;
                    };
                    
                    const due = new Date(currentDueDate);
                    let startDate, endDate;
                    
                    if (type === '妊娠期') {
                      startDate = new Date(due);
                      startDate.setDate(startDate.getDate() - (setting.startDaysBeforeDue || 280));
                      endDate = new Date(due);
                      endDate.setDate(endDate.getDate() + (setting.endDaysAfterDue || 0));
                    } else if (type === '産褥期') {
                      startDate = new Date(due);
                      startDate.setDate(startDate.getDate() + (setting.startDaysAfterDue || 0));
                      endDate = new Date(due);
                      endDate.setDate(endDate.getDate() + (setting.endDaysAfterDue || 56));
                    } else if (type === '授乳期') {
                      const postpartumEndDate = new Date(due);
                      postpartumEndDate.setDate(postpartumEndDate.getDate() + 56); // 産褥期の終了日
                      startDate = new Date(postpartumEndDate);
                      startDate.setDate(startDate.getDate() + (setting.startDaysAfterDue || 0));
                      endDate = new Date(due);
                      endDate.setDate(endDate.getDate() + (setting.endDaysAfterDue || 365));
                    } else {
                      // 育児期、復職期など
                      startDate = new Date(due);
                      startDate.setDate(startDate.getDate() + (setting.startDaysAfterDue || 365));
                      endDate = new Date(due);
                      endDate.setDate(endDate.getDate() + (setting.endDaysAfterDue || 730));
                    }
                    
                    return {
                      startDate: formatDate(startDate),
                      endDate: formatDate(endDate)
                    };
                  };
                  
                  const actualDates = calculateActualDates();
                  
                  return (
                    <div key={type} className="period-setting-item">
                      <label className="period-setting-label">{type}</label>
                      <div className="period-setting-inputs">
                        {type === '妊娠期' ? (
                          <>
                            <div className="period-input-group">
                              <label>開始日（出産予定日の何日前）</label>
                              <input
                                type="number"
                                value={setting.startDaysBeforeDue || 280}
                                onChange={(e) => {
                                  const newSettings = {
                                    ...periodSettings,
                                    [type]: {
                                      ...setting,
                                      startDaysBeforeDue: parseInt(e.target.value) || 0
                                    }
                                  };
                                  setPeriodSettings(newSettings);
                                }}
                                min="0"
                              />
                              {(editingDueDate || dueDate) && actualDates.startDate && (
                                <div className="period-date-display">
                                  開始日: {actualDates.startDate}
                                </div>
                              )}
                            </div>
                            <div className="period-input-group">
                              <label>終了日（出産予定日の何日後）</label>
                              <input
                                type="number"
                                value={setting.endDaysAfterDue || 0}
                                onChange={(e) => {
                                  const newSettings = {
                                    ...periodSettings,
                                    [type]: {
                                      ...setting,
                                      endDaysAfterDue: parseInt(e.target.value) || 0
                                    }
                                  };
                                  setPeriodSettings(newSettings);
                                }}
                                min="0"
                              />
                              {(editingDueDate || dueDate) && actualDates.endDate && (
                                <div className="period-date-display">
                                  終了日: {actualDates.endDate}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="period-input-group">
                              <label>開始日（出産予定日の何日後）</label>
                              <input
                                type="number"
                                value={setting.startDaysAfterDue || 0}
                                onChange={(e) => {
                                  const newSettings = {
                                    ...periodSettings,
                                    [type]: {
                                      ...setting,
                                      startDaysAfterDue: parseInt(e.target.value) || 0
                                    }
                                  };
                                  setPeriodSettings(newSettings);
                                }}
                                min="0"
                              />
                              {(editingDueDate || dueDate) && actualDates.startDate && (
                                <div className="period-date-display">
                                  開始日: {actualDates.startDate}
                                </div>
                              )}
                            </div>
                            <div className="period-input-group">
                              <label>終了日（出産予定日の何日後）</label>
                              <input
                                type="number"
                                value={setting.endDaysAfterDue || (type === '産褥期' ? 56 : type === '授乳期' ? 365 : 730)}
                                onChange={(e) => {
                                  const newSettings = {
                                    ...periodSettings,
                                    [type]: {
                                      ...setting,
                                      endDaysAfterDue: parseInt(e.target.value) || 0
                                    }
                                  };
                                  setPeriodSettings(newSettings);
                                }}
                                min="0"
                              />
                              {(editingDueDate || dueDate) && actualDates.endDate && (
                                <div className="period-date-display">
                                  終了日: {actualDates.endDate}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="period-settings-footer">
                <button 
                  className="period-settings-cancel-btn"
                  onClick={() => {
                    // 設定をリロードして元に戻す
                    const periodSettingsRef = doc(db, 'users', ownerId, 'data', 'periodSettings');
                    getDoc(periodSettingsRef)
                      .then((snapshot) => {
                        if (snapshot.exists()) {
                          const data = snapshot.data();
                          if (data.settings) {
                            setPeriodSettings(data.settings);
                          }
                        }
                        setShowPeriodSettings(false);
                      })
                      .catch((error) => {
                        console.error('期間設定読み込みエラー:', error);
                        setShowPeriodSettings(false);
                      });
                  }}
                >
                  キャンセル
                </button>
                <button 
                  className="period-settings-save-btn"
                  onClick={async () => {
                    try {
                      // 出産予定日が変更されている場合は保存
                      if (editingDueDate && editingDueDate !== dueDate) {
                        const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
                        await setDoc(userDataRef, { dueDate: editingDueDate }, { merge: true });
                        console.log('出産予定日を更新しました:', editingDueDate);
                      }
                      // 期間設定を保存
                      await savePeriodSettings(periodSettings);
                      setShowPeriodSettings(false);
                      setEditingDueDate('');
                    } catch (error) {
                      console.error('保存エラー:', error);
                      alert('設定の保存に失敗しました。');
                    }
                  }}
                >
                  保存
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {viewMode === 'table' && (
          <div id="table" className="actions-section">
            <ActionTable 
              actions={actions}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onAdd={handleAdd}
              onReorder={handleReorder}
              onAddSubAction={handleAddSubAction}
              onDeleteSubAction={handleDeleteSubAction}
              onChangeSubActionParent={handleChangeSubActionParent}
              onAddSubSubAction={handleAddSubSubAction}
              onDeleteSubSubAction={handleDeleteSubSubAction}
              onReorderSubActions={handleReorderSubActions}
              onDeleteAll={handleDeleteAll}
              dueDate={dueDate}
              calculatePeriodDates={calculatePeriodDates}
              isSharedMember={isSharedMember}
              permission={permission}
              showCompleted={showCompleted}
              onToggleShowCompleted={() => setShowCompleted(!showCompleted)}
              selectedTypes={selectedTypes}
              onToggleType={(type) => {
                const newSelectedTypes = new Set(selectedTypes);
                if (newSelectedTypes.has(type)) {
                  newSelectedTypes.delete(type);
                } else {
                  newSelectedTypes.add(type);
                }
                setSelectedTypes(newSelectedTypes);
              }}
              onClearFilter={() => {
                setSelectedTypes(new Set(allTypesArray));
              }}
              showTypeFilter={showTypeFilter}
              onToggleTypeFilter={() => setShowTypeFilter(!showTypeFilter)}
            />
          </div>
        )}

        {viewMode === 'gantt' && (
          <div id="gantt" className="actions-section">
            <GanttChart 
              actions={actions} 
              onUpdateAction={handleUpdate}
              onAdd={handleAdd}
              onAddSubAction={handleAddSubAction}
              onAddSubSubAction={handleAddSubSubAction}
              onReorder={handleReorder}
              onReorderSubActions={handleReorderSubActions}
              isSharedMember={isSharedMember}
              permission={permission}
              showCompleted={showCompleted}
              onToggleShowCompleted={() => setShowCompleted(!showCompleted)}
              selectedTypes={selectedTypes}
              onToggleType={(type) => {
                const newSelectedTypes = new Set(selectedTypes);
                if (newSelectedTypes.has(type)) {
                  newSelectedTypes.delete(type);
                } else {
                  newSelectedTypes.add(type);
                }
                setSelectedTypes(newSelectedTypes);
              }}
              onClearFilter={() => {
                setSelectedTypes(new Set(allTypesArray));
              }}
              showTypeFilter={showTypeFilter}
              onToggleTypeFilter={() => setShowTypeFilter(!showTypeFilter)}
              dueDate={dueDate}
              calculatePeriodDates={calculatePeriodDates}
            />
          </div>
        )}

        {viewMode === 'calendar' && (
          <div id="calendar" className="actions-section">
            <ActionCalendar 
              actions={actions} 
              onUpdateAction={handleUpdate}
              onAdd={handleAdd}
              onAddSubAction={handleAddSubAction}
              onAddSubSubAction={handleAddSubSubAction}
              onDeleteSubAction={handleDeleteSubAction}
              onDeleteSubSubAction={handleDeleteSubSubAction}
              isSharedMember={isSharedMember}
              permission={permission}
              showCompleted={showCompleted}
              onToggleShowCompleted={() => setShowCompleted(!showCompleted)}
              selectedTypes={selectedTypes}
              onToggleType={(type) => {
                const newSelectedTypes = new Set(selectedTypes);
                if (newSelectedTypes.has(type)) {
                  newSelectedTypes.delete(type);
                } else {
                  newSelectedTypes.add(type);
                }
                setSelectedTypes(newSelectedTypes);
              }}
              onClearFilter={() => {
                setSelectedTypes(new Set(allTypesArray));
              }}
              showTypeFilter={showTypeFilter}
              onToggleTypeFilter={() => setShowTypeFilter(!showTypeFilter)}
              dueDate={dueDate}
              calculatePeriodDates={calculatePeriodDates}
            />
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ActionManagement;
