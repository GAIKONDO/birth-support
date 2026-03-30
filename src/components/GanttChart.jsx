import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './GanttChart.css';

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

const GanttChart = ({ actions, onUpdateAction, onAdd, onAddSubAction, onAddSubSubAction, onReorder, onReorderSubActions, isSharedMember, permission, showCompleted, onToggleShowCompleted, selectedTypes, onToggleType, onClearFilter, showTypeFilter, onToggleTypeFilter, dueDate, calculatePeriodDates }) => {
  const [expandedActions, setExpandedActions] = useState(new Set());
  const [expandedSubActions, setExpandedSubActions] = useState(new Set());
  const prevActionsRef = useRef([]);
  const [addingSubAction, setAddingSubAction] = useState(null);
  const [addingSubSubAction, setAddingSubSubAction] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newAction, setNewAction] = useState({
    type: '妊娠期',
    actionName: '',
    startDate: '',
    endDate: '',
    remarks: '',
    status: 'pending'
  });
  const [draggedActionId, setDraggedActionId] = useState(null);
  const [draggedSubAction, setDraggedSubAction] = useState(null); // {actionId, subActionId}
  const [editingActionDates, setEditingActionDates] = useState(null); // actionId
  const [editingSubActionDates, setEditingSubActionDates] = useState(null); // `${actionId}-${subActionId}`
  const [editingSubSubActionDates, setEditingSubSubActionDates] = useState(null); // `${actionId}-${subActionId}-${subSubActionId}`
  const [editingActionDatesData, setEditingActionDatesData] = useState({ startDate: '', endDate: '' });
  const [editingSubActionDatesData, setEditingSubActionDatesData] = useState({ startDate: '', endDate: '' });
  const [editingSubSubActionDatesData, setEditingSubSubActionDatesData] = useState({ startDate: '', endDate: '' });
  const [dragStartPos, setDragStartPos] = useState(null);
  const [newSubAction, setNewSubAction] = useState({
    type: '診察',
    actionName: '',
    startDate: '',
    endDate: '',
    remarks: '',
    status: 'pending'
  });
  const [newSubSubAction, setNewSubSubAction] = useState({
    type: '診察',
    actionName: '',
    startDate: '',
    endDate: '',
    remarks: '',
    status: 'pending'
  });

  // モーダル表示時にbodyのスクロールを無効化
  useDisableScroll(showTypeFilter || isAdding);

  // コンテナの参照を取得
  const containerRef = useRef(null);
  const headerControlsRef = useRef(null);
  const [headerTop, setHeaderTop] = useState(0);

  // ヘッダーコントロールの高さを取得して、ガントヘッダーのtop位置を設定
  useEffect(() => {
    const updateHeaderTop = () => {
      if (headerControlsRef.current) {
        const height = headerControlsRef.current.offsetHeight;
        setHeaderTop(height);
      }
    };

    updateHeaderTop();
    const resizeObserver = new ResizeObserver(updateHeaderTop);
    if (headerControlsRef.current) {
      resizeObserver.observe(headerControlsRef.current);
    }
    window.addEventListener('resize', updateHeaderTop);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderTop);
    };
  }, []);

  // スクロール位置を制御（アクション名列より左側にスクロールできないようにする）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollLeft < 0) {
        container.scrollLeft = 0;
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 選択されている種別のリスト（全種別から選択されているものを抽出）
  const allTypes = ['妊娠期', '産褥期', '授乳期', '育児期', '復職期', '診察', '申請', '報告', 'その他', '申請準備', 'MTG'];
  const selectedTypesList = allTypes.filter(type => selectedTypes.has(type));
  const isFilterActive = selectedTypesList.length < allTypes.length; // 全種別が選択されていない場合はフィルターが有効

  // 編集可能かどうかを判定（閲覧者の場合は編集不可）
  const canEdit = !isSharedMember || permission === 'editor';

  // 出産予定日を基準に実施期間を自動計算する関数
  const calculateActionDates = (actionName, type) => {
    // 親アクションの種別（妊娠期、産褥期、授乳期、育児期、復職期）の場合は、calculatePeriodDatesを使用
    if (['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(type) && calculatePeriodDates) {
      return calculatePeriodDates(type);
    }

    // それ以外の場合は従来のロジックを使用
    if (!dueDate) {
      // 出産予定日が設定されていない場合は、今日から1ヶ月後をデフォルトとする
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
    let startDate, endDate;

    // 種別に基づく期間設定
    if (type === '妊娠期') {
      startDate = new Date(due);
      startDate.setDate(startDate.getDate() - 280);
      endDate = new Date(due);
    } else if (type === '産褥期') {
      startDate = new Date(due);
      endDate = new Date(due);
      endDate.setDate(endDate.getDate() + 56);
    } else if (type === '授乳期') {
      const postpartumEndDate = new Date(due);
      postpartumEndDate.setDate(postpartumEndDate.getDate() + 56);
      startDate = new Date(postpartumEndDate);
      endDate = new Date(due);
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      // その他の種別：今日から1ヶ月後をデフォルトとする
      const today = new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      startDate = today;
      endDate = oneMonthLater;
    }

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  };

  const handleAdd = () => {
    if (!newAction.actionName || !newAction.startDate || !newAction.endDate) {
      alert('アクション名、開始日、終了日は必須です。');
      return;
    }
    
    onAdd(newAction);
    
    setNewAction({
      type: '妊娠期',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: '',
      status: 'pending'
    });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewAction({
      type: '妊娠期',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: '',
      status: 'pending'
    });
    setIsAdding(false);
  };

  // サブアクションを持つアクションをデフォルトで展開
  useEffect(() => {
    // 初回ロード時（リロード時を含む）は、すべてのサブアクションを持つアクションを展開
    if (prevActionsRef.current.length === 0) {
      const newExpandedActions = new Set();
      actions.forEach(action => {
        if (action.subActions && action.subActions.length > 0) {
          newExpandedActions.add(action.id);
        }
      });
      setExpandedActions(newExpandedActions);
      prevActionsRef.current = actions;
      return;
    }
    
    const prevActionIds = new Set(prevActionsRef.current.map(a => a.id));
    
    // 新しいアクションが追加されたか、既存のアクションにサブアクションが追加されたかをチェック
    const hasNewActions = actions.some(action => {
      const prevAction = prevActionsRef.current.find(a => a.id === action.id);
      const isNewAction = !prevActionIds.has(action.id);
      const hasNewSubActions = prevAction && 
        action.subActions && action.subActions.length > 0 && 
        (!prevAction.subActions || prevAction.subActions.length === 0);
      
      return isNewAction || hasNewSubActions;
    });
    
    if (hasNewActions) {
      setExpandedActions(prevExpanded => {
        const newExpandedActions = new Set(prevExpanded);
        actions.forEach(action => {
          if (action.subActions && action.subActions.length > 0) {
            newExpandedActions.add(action.id);
          }
        });
        return newExpandedActions;
      });
    }
    
    prevActionsRef.current = actions;
  }, [actions]);
  // フィルタリングされたアクション
  const filteredActions = useMemo(() => {
    // 種別でフィルタリングする関数
    const filterByType = (actionList) => {
      return actionList.filter(action => {
        // 期間アクションは常に表示
        if (['pregnancy-period', 'postpartum-period', 'breastfeeding-period'].includes(action.status)) {
          return true;
        }
        // 親アクションの種別をチェック
        if (!selectedTypes.has(action.type)) {
          // 親アクションが選択されていない場合、サブアクションに選択された種別があるかチェック
          if (action.subActions && action.subActions.length > 0) {
            const hasSelectedSubActions = action.subActions.some(subAction => {
              if (!selectedTypes.has(subAction.type)) {
                if (subAction.subActions && subAction.subActions.length > 0) {
                  return subAction.subActions.some(subSubAction => selectedTypes.has(subSubAction.type));
                }
                return false;
              }
              return true;
            });
            return hasSelectedSubActions;
          }
          return false;
        }
        return true;
      });
    };

    // 完了アクションをフィルタリングする関数
    const filterCompletedActions = (actionList) => {
      if (showCompleted) {
        return actionList;
      }
      return actionList.filter(action => {
        // 期間アクションは常に表示
        if (['pregnancy-period', 'postpartum-period', 'breastfeeding-period'].includes(action.status)) {
          return true;
        }
        // 完了アクションを除外
        if (action.status === 'completed') {
          return false;
        }
        // サブアクションに完了がある場合は、親アクションも表示
        if (action.subActions && action.subActions.length > 0) {
          const hasNonCompletedSubActions = action.subActions.some(subAction => {
            if (subAction.status === 'completed') {
              return false;
            }
            if (subAction.subActions && subAction.subActions.length > 0) {
              return subAction.subActions.some(subSubAction => subSubAction.status !== 'completed');
            }
            return true;
          });
          return hasNonCompletedSubActions;
        }
        return true;
      });
    };

    // サブアクションとサブサブアクションをフィルタリングする関数
    const filterSubActions = (subActions) => {
      if (!subActions || subActions.length === 0) {
        return [];
      }
      return subActions.filter(subAction => {
        // 種別フィルタリング
        if (!selectedTypes.has(subAction.type)) {
          // サブアクションの種別が選択されていない場合、サブサブアクションに選択された種別があるかチェック
          if (subAction.subActions && subAction.subActions.length > 0) {
            const hasSelectedSubSubActions = subAction.subActions.some(subSubAction => selectedTypes.has(subSubAction.type));
            if (!hasSelectedSubSubActions) {
              return false;
            }
          } else {
            return false;
          }
        }
        // 完了フィルタリング
        if (!showCompleted && subAction.status === 'completed') {
          return false;
        }
        if (subAction.subActions && subAction.subActions.length > 0) {
          const filteredSubSubActions = subAction.subActions.filter(subSubAction => {
            if (!selectedTypes.has(subSubAction.type)) {
              return false;
            }
            if (!showCompleted && subSubAction.status === 'completed') {
              return false;
            }
            return true;
          });
          return filteredSubSubActions.length > 0;
        }
        return true;
      }).map(subAction => {
        if (subAction.subActions && subAction.subActions.length > 0) {
          const filteredSubSubActions = subAction.subActions.filter(subSubAction => {
            if (!selectedTypes.has(subSubAction.type)) {
              return false;
            }
            if (!showCompleted && subSubAction.status === 'completed') {
              return false;
            }
            return true;
          });
          return { ...subAction, subActions: filteredSubSubActions };
        }
        return subAction;
      });
    };

    const uniqueActions = actions.filter((action, index, self) => 
      index === self.findIndex(a => a.id === action.id)
    ).map(action => {
      if (action.subActions && action.subActions.length > 0) {
        const uniqueSubActions = action.subActions.filter((subAction, subIndex, subSelf) =>
          subIndex === subSelf.findIndex(sa => sa.id === subAction.id)
        );
        const filteredSubActions = filterSubActions(uniqueSubActions);
        return { ...action, subActions: filteredSubActions };
      }
      return action;
    });
    return filterByType(filterCompletedActions(uniqueActions));
  }, [actions, showCompleted, selectedTypes]);

  // 日付範囲を計算（サブアクションとサブサブアクションも含む）
  const dateRange = useMemo(() => {
    if (filteredActions.length === 0) return { start: new Date(), end: new Date() };
    
    const allDates = filteredActions.flatMap(action => {
      const dates = [
        new Date(action.startDate),
        new Date(action.endDate)
      ];
      // サブアクションの日付も追加
      if (action.subActions && action.subActions.length > 0) {
        action.subActions.forEach(subAction => {
          dates.push(new Date(subAction.startDate));
          dates.push(new Date(subAction.endDate));
          // サブサブアクションの日付も追加
          if (subAction.subActions && subAction.subActions.length > 0) {
            subAction.subActions.forEach(subSubAction => {
              dates.push(new Date(subSubAction.startDate));
              dates.push(new Date(subSubAction.endDate));
            });
          }
        });
      }
      return dates;
    });
    
    const start = new Date(Math.min(...allDates));
    const end = new Date(Math.max(...allDates));
    
    // 開始月の1日00:00:00から、終了月の最終日23:59:59まで
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    
    // 終了日を含めるために、終了日の翌月の1日00:00:00を設定
    end.setMonth(end.getMonth() + 1);
    end.setDate(1);
    end.setHours(0, 0, 0, 0);
    
    return { start, end };
  }, [filteredActions]);

  // 月のリストを生成
  const months = useMemo(() => {
    const monthList = [];
    const current = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    while (current <= end) {
      monthList.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    
    return monthList;
  }, [dateRange]);

  // 年のリストを生成
  const years = useMemo(() => {
    const yearSet = new Set();
    months.forEach(month => yearSet.add(month.getFullYear()));
    return Array.from(yearSet).sort();
  }, [months]);

  // アクションの位置と幅を計算
  const getActionPosition = (action) => {
    // 開始日はその日の00:00:00として扱う
    const start = new Date(action.startDate);
    start.setHours(0, 0, 0, 0);
    
    // 終了日はその日の終わり（23:59:59）として扱うため、翌日の00:00:00として計算
    const end = new Date(action.endDate);
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1); // 終了日を含めるために翌日に
    
    // 開始日と終了日をミリ秒に変換
    const startMs = start.getTime();
    const endMs = end.getTime();
    const chartStartMs = dateRange.start.getTime();
    const chartEndMs = dateRange.end.getTime();
    const chartDurationMs = chartEndMs - chartStartMs;
    
    // チャート全体に対する相対位置を計算
    const leftPercent = ((startMs - chartStartMs) / chartDurationMs) * 100;
    const widthPercent = ((endMs - startMs) / chartDurationMs) * 100;
    
    return { 
      left: `${Math.max(0, leftPercent)}%`, 
      width: `${Math.max(2, widthPercent)}%` 
    };
  };

  // 今日の日付の位置を計算
  const getTodayPosition = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMs = today.getTime();
    const chartStartMs = dateRange.start.getTime();
    const chartEndMs = dateRange.end.getTime();
    const chartDurationMs = chartEndMs - chartStartMs;
    
    // 今日がチャートの範囲内にあるか確認
    if (todayMs < chartStartMs || todayMs > chartEndMs) {
      return null; // 範囲外の場合はnullを返す
    }
    
    const leftPercent = ((todayMs - chartStartMs) / chartDurationMs) * 100;
    return `${Math.max(0, Math.min(100, leftPercent))}%`;
  };

  const todayPosition = getTodayPosition();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#fbbf24';
      case 'in-progress':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'pregnancy-period':
      case 'postpartum-period':
      case 'breastfeeding-period':
        // 期間アクションは進行中として表示
        return '#3b82f6';
      default:
        return '#9ca3af';
    }
  };

  // 期間アクションのIDを取得
  const periodActionIds = useMemo(() => {
    return actions
      .filter(action => ['pregnancy-period', 'postpartum-period', 'breastfeeding-period'].includes(action.status))
      .map(action => action.id);
  }, [actions]);

  // 親アクションの種別（妊娠期、産褥期、授乳期、育児期、復職期）のIDを取得
  const parentActionTypeIds = useMemo(() => {
    return actions
      .filter(action => ['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type))
      .map(action => action.id);
  }, [actions]);

  // ステータスを3段階で切り替える関数
  const handleToggleStatus = (actionId, subActionId = null, subSubActionId = null) => {
    console.log('handleToggleStatus called:', { actionId, subActionId, subSubActionId, onUpdateAction: !!onUpdateAction });
    
    if (!onUpdateAction) {
      console.warn('onUpdateAction is not provided');
      return;
    }
    
    const action = actions.find(a => a.id === actionId);
    if (!action) {
      console.warn('Action not found:', actionId, 'Available actions:', actions.map(a => a.id));
      return;
    }

    // 期間アクションのメインアクション自体の状態変更は無効化
    // ただし、サブアクションやサブサブアクションの状態変更は許可する
    if (periodActionIds.includes(actionId) && !subActionId && !subSubActionId) {
      console.log('Period action status change is disabled:', actionId);
      return;
    }

    if (subSubActionId) {
      // サブサブアクションのステータス変更
      const subAction = action.subActions?.find(sa => sa.id === subActionId);
      if (!subAction || !subAction.subActions) return;
      
      const subSubAction = subAction.subActions.find(ssa => ssa.id === subSubActionId);
      if (!subSubAction) return;

      let newStatus;
      if (subSubAction.status === 'pending') {
        newStatus = 'in-progress';
      } else if (subSubAction.status === 'in-progress') {
        newStatus = 'completed';
      } else {
        newStatus = 'pending';
      }

      const updatedSubSubActions = subAction.subActions.map(ssa =>
        ssa.id === subSubActionId ? { ...ssa, status: newStatus } : ssa
      );

      const updatedSubActions = action.subActions.map(sa =>
        sa.id === subActionId ? { ...sa, subActions: updatedSubSubActions } : sa
      );

      console.log('Updating sub-sub-action status:', actionId, subActionId, subSubActionId, 'from', subSubAction.status, 'to', newStatus);
      onUpdateAction({
        ...action,
        subActions: updatedSubActions
      });
    } else if (subActionId) {
      // サブアクションのステータス変更
      const subAction = action.subActions?.find(sa => sa.id === subActionId);
      if (!subAction) return;

      let newStatus;
      if (subAction.status === 'pending') {
        newStatus = 'in-progress';
      } else if (subAction.status === 'in-progress') {
        newStatus = 'completed';
      } else {
        newStatus = 'pending';
      }

      const updatedSubActions = action.subActions.map(sa =>
        sa.id === subActionId ? { ...sa, status: newStatus } : sa
      );

      console.log('Updating sub-action status:', actionId, subActionId, 'from', subAction.status, 'to', newStatus);
      onUpdateAction({
        ...action,
        subActions: updatedSubActions
      });
    } else {
      // メインアクションのステータス変更
      let newStatus;
      if (action.status === 'pending') {
        newStatus = 'in-progress';
      } else if (action.status === 'in-progress') {
        newStatus = 'completed';
      } else {
        newStatus = 'pending';
      }

      console.log('Updating main action status:', actionId, 'from', action.status, 'to', newStatus);
      onUpdateAction({
        ...action,
        status: newStatus
      });
    }
  };

  // メインアクション用のドラッグ&ドロップハンドラー
  const handleActionDragStart = (e, actionId) => {
    // 期間アクションはドラッグできないようにする
    if (periodActionIds.includes(actionId)) {
      e.preventDefault();
      return;
    }
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDraggedActionId(actionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleActionDragOver = (e, actionId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedActionId && draggedActionId !== actionId && !periodActionIds.includes(actionId)) {
      e.currentTarget.style.backgroundColor = '#e0e7ff';
    }
  };

  const handleActionDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '';
  };

  const handleActionDrop = (e, dropActionId) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    
    if (!draggedActionId || draggedActionId === dropActionId || periodActionIds.includes(draggedActionId) || periodActionIds.includes(dropActionId)) {
      setDraggedActionId(null);
      return;
    }

    const draggedIndex = actions.findIndex(a => a.id === draggedActionId);
    const dropIndex = actions.findIndex(a => a.id === dropActionId);
    
    if (draggedIndex === -1 || dropIndex === -1) {
      setDraggedActionId(null);
      return;
    }

    const newActions = [...actions];
    const draggedItem = newActions[draggedIndex];
    
    // ドラッグしたアイテムを削除
    newActions.splice(draggedIndex, 1);
    
    // ドロップ位置に挿入
    newActions.splice(dropIndex, 0, draggedItem);
    
    // 番号を再計算
    const finalActions = newActions.map((action, index) => ({
      ...action,
      number: index + 1
    }));

    if (onReorder) {
      onReorder(finalActions);
    }
    setDraggedActionId(null);
  };

  const handleActionDragEnd = (e) => {
    e.currentTarget.style.opacity = '';
    setDraggedActionId(null);
    setDragStartPos(null);
  };

  // サブアクション用のドラッグ&ドロップハンドラー
  const handleSubActionDragStart = (e, actionId, subActionId) => {
    setDraggedSubAction({ actionId, subActionId });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleSubActionDragOver = (e, actionId, subActionId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedSubAction && 
        (draggedSubAction.actionId !== actionId || draggedSubAction.subActionId !== subActionId)) {
      e.currentTarget.style.backgroundColor = '#e0e7ff';
    }
  };

  const handleSubActionDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '';
  };

  const handleSubActionDrop = (e, actionId, dropSubActionId) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    
    if (!draggedSubAction || 
        draggedSubAction.actionId !== actionId || 
        draggedSubAction.subActionId === dropSubActionId) {
      setDraggedSubAction(null);
      return;
    }

    const action = actions.find(a => a.id === actionId);
    if (!action || !action.subActions) {
      setDraggedSubAction(null);
      return;
    }

    const draggedIndex = action.subActions.findIndex(sa => sa.id === draggedSubAction.subActionId);
    const dropIndex = action.subActions.findIndex(sa => sa.id === dropSubActionId);
    
    if (draggedIndex === -1 || dropIndex === -1) {
      setDraggedSubAction(null);
      return;
    }

    const newSubActions = [...action.subActions];
    const draggedItem = newSubActions[draggedIndex];
    
    // ドラッグしたアイテムを削除
    newSubActions.splice(draggedIndex, 1);
    
    // ドロップ位置に挿入
    newSubActions.splice(dropIndex, 0, draggedItem);

    if (onReorderSubActions) {
      onReorderSubActions(actionId, newSubActions);
    }
    setDraggedSubAction(null);
  };

  const handleSubActionDragEnd = (e) => {
    e.currentTarget.style.opacity = '';
    setDraggedSubAction(null);
  };

  // アクションの日付編集ハンドラー
  const handleEditActionDates = (action) => {
    // 親アクションの種別（妊娠期、産褥期、授乳期、育児期、復職期）の場合は編集不可
    if (['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type)) {
      return;
    }
    setEditingActionDates(action.id);
    setEditingActionDatesData({
      startDate: action.startDate,
      endDate: action.endDate
    });
  };

  const handleSaveActionDates = (actionId) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    if (onUpdateAction) {
      onUpdateAction({
        ...action,
        startDate: editingActionDatesData.startDate,
        endDate: editingActionDatesData.endDate
      });
    }
    setEditingActionDates(null);
    setEditingActionDatesData({ startDate: '', endDate: '' });
  };

  const handleCancelActionDates = () => {
    setEditingActionDates(null);
    setEditingActionDatesData({ startDate: '', endDate: '' });
  };

  // サブアクションの日付編集ハンドラー
  const handleEditSubActionDates = (actionId, subAction) => {
    setEditingSubActionDates(`${actionId}-${subAction.id}`);
    setEditingSubActionDatesData({
      startDate: subAction.startDate,
      endDate: subAction.endDate
    });
  };

  const handleSaveSubActionDates = (actionId, subActionId) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    const updatedSubActions = action.subActions.map(sa =>
      sa.id === subActionId
        ? { ...sa, startDate: editingSubActionDatesData.startDate, endDate: editingSubActionDatesData.endDate }
        : sa
    );

    if (onUpdateAction) {
      onUpdateAction({
        ...action,
        subActions: updatedSubActions
      });
    }
    setEditingSubActionDates(null);
    setEditingSubActionDatesData({ startDate: '', endDate: '' });
  };

  const handleCancelSubActionDates = () => {
    setEditingSubActionDates(null);
    setEditingSubActionDatesData({ startDate: '', endDate: '' });
  };

  // サブサブアクションの日付編集ハンドラー
  const handleEditSubSubActionDates = (actionId, subActionId, subSubAction) => {
    setEditingSubSubActionDates(`${actionId}-${subActionId}-${subSubAction.id}`);
    setEditingSubSubActionDatesData({
      startDate: subSubAction.startDate,
      endDate: subSubAction.endDate
    });
  };

  const handleSaveSubSubActionDates = (actionId, subActionId, subSubActionId) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    const updatedSubActions = action.subActions.map(sa =>
      sa.id === subActionId
        ? {
            ...sa,
            subActions: sa.subActions.map(ssa =>
              ssa.id === subSubActionId
                ? { ...ssa, startDate: editingSubSubActionDatesData.startDate, endDate: editingSubSubActionDatesData.endDate }
                : ssa
            )
          }
        : sa
    );

    if (onUpdateAction) {
      onUpdateAction({
        ...action,
        subActions: updatedSubActions
      });
    }
    setEditingSubSubActionDates(null);
    setEditingSubSubActionDatesData({ startDate: '', endDate: '' });
  };

  const handleCancelSubSubActionDates = () => {
    setEditingSubSubActionDates(null);
    setEditingSubSubActionDatesData({ startDate: '', endDate: '' });
  };

  const handleAddSubActionClick = (actionId) => {
    // アクションが展開されていない場合は自動的に展開
    if (!expandedActions.has(actionId)) {
      const newExpanded = new Set(expandedActions);
      newExpanded.add(actionId);
      setExpandedActions(newExpanded);
    }
    
    setAddingSubAction(actionId);
    setNewSubAction({
      type: '診察',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: '',
      status: 'pending'
    });
  };

  const handleSaveSubAction = (actionId) => {
    if (!newSubAction.actionName || !newSubAction.startDate || !newSubAction.endDate) {
      alert('アクション名、開始日、終了日は必須です。');
      return;
    }
    if (onAddSubAction) {
      onAddSubAction(actionId, newSubAction);
    }
    setNewSubAction({
      type: '診察',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: '',
      status: 'pending'
    });
    setAddingSubAction(null);
  };

  const handleCancelSubAction = () => {
    setNewSubAction({
      type: '診察',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: '',
      status: 'pending'
    });
    setAddingSubAction(null);
  };

  const handleAddSubSubActionClick = (actionId, subActionId) => {
    // サブアクションが展開されていない場合は自動的に展開
    const key = `${actionId}-${subActionId}`;
    if (!expandedSubActions.has(key)) {
      const newExpanded = new Set(expandedSubActions);
      newExpanded.add(key);
      setExpandedSubActions(newExpanded);
    }
    setAddingSubSubAction(key);
    setNewSubSubAction({
      type: '診察',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: '',
      status: 'pending'
    });
  };

  const handleSaveSubSubAction = (actionId, subActionId) => {
    if (!newSubSubAction.actionName || !newSubSubAction.startDate || !newSubSubAction.endDate) {
      alert('アクション名、開始日、終了日は必須です。');
      return;
    }
    if (onAddSubSubAction) {
      onAddSubSubAction(actionId, subActionId, newSubSubAction);
    }
    setNewSubSubAction({
      type: '診察',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: '',
      status: 'pending'
    });
    setAddingSubSubAction(null);
  };

  const handleCancelSubSubAction = () => {
    setNewSubSubAction({
      type: '診察',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: '',
      status: 'pending'
    });
    setAddingSubSubAction(null);
  };

  const toggleAction = (actionId) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(actionId)) {
      newExpanded.delete(actionId);
    } else {
      newExpanded.add(actionId);
    }
    setExpandedActions(newExpanded);
  };

  const toggleSubAction = (actionId, subActionId) => {
    const key = `${actionId}-${subActionId}`;
    const newExpanded = new Set(expandedSubActions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSubActions(newExpanded);
  };

  return (
    <div className="gantt-chart-container" ref={containerRef}>
      <div className="gantt-chart-header-controls" ref={headerControlsRef}>
        {isFilterActive && (
          <div className="gantt-active-filters">
            <span className="gantt-active-filters-label">表示中:</span>
            <div className="gantt-active-filters-badges">
              {selectedTypesList.map(type => (
                <span key={type} className="gantt-active-filter-badge">
                  {type}
                </span>
              ))}
            </div>
            {onClearFilter && (
              <button 
                className="gantt-clear-filter-button"
                onClick={onClearFilter}
                title="フィルターをクリア"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                クリア
              </button>
            )}
          </div>
        )}
        <div className="gantt-chart-header-buttons">
          <button 
            className={`gantt-toggle-completed-button ${showCompleted ? 'active' : ''}`}
            onClick={onToggleShowCompleted}
            title={showCompleted ? '完了アクションを非表示' : '完了アクションを表示'}
          >
            {showCompleted ? '完了を非表示' : '完了を表示'}
          </button>
          <button 
            className={`gantt-type-filter-button ${showTypeFilter ? 'active' : ''}`}
            onClick={onToggleTypeFilter}
            title="表示する種別を選択"
          >
            種別フィルタ
          </button>
          {canEdit && onAdd && (
            <button 
              className="gantt-add-button"
              onClick={() => {
                // 新しいアクションの初期値を設定
                const dates = calculateActionDates('', '妊娠期');
                setNewAction({
                  type: '妊娠期',
                  actionName: '',
                  startDate: dates.startDate,
                  endDate: dates.endDate,
                  remarks: '',
                  status: 'pending'
                });
                setIsAdding(true);
              }}
              title="新しい親アクションを追加"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              親アクション追加
            </button>
          )}
        </div>
      </div>
      {showTypeFilter && createPortal(
        <div className="type-filter-modal" onClick={(e) => {
          if (e.target === e.currentTarget) {
            onToggleTypeFilter();
          }
        }}>
          <div className="type-filter-content" onClick={(e) => e.stopPropagation()}>
            <div className="type-filter-header">
              <h5 className="type-filter-title">表示する種別を選択</h5>
              <button 
                className="type-filter-close-button"
                onClick={onToggleTypeFilter}
                title="閉じる"
                aria-label="閉じる"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="type-filter-body">
              <div className="type-filter-groups">
                <div className="type-filter-group">
                  <h6 className="type-filter-group-title">親アクション</h6>
                  <div className="type-filter-checkboxes">
                    {['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].map(type => (
                      <label key={type} className="type-filter-checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedTypes.has(type)}
                          onChange={() => onToggleType(type)}
                          className="type-filter-checkbox-input"
                        />
                        <span className="type-filter-checkbox-label">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="type-filter-group">
                  <h6 className="type-filter-group-title">サブアクション</h6>
                  <div className="type-filter-checkboxes">
                    {['診察', '申請', '報告', 'その他', '申請準備', 'MTG'].map(type => (
                      <label key={type} className="type-filter-checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedTypes.has(type)}
                          onChange={() => onToggleType(type)}
                          className="type-filter-checkbox-input"
                        />
                        <span className="type-filter-checkbox-label">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="type-filter-footer">
              <button className="type-filter-close-btn" onClick={onToggleTypeFilter}>
                閉じる
              </button>
            </div>
          </div>
          </div>,
          document.body
        )}
      {isAdding && createPortal(
        <div className="add-action-modal" onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCancel();
          }
        }}>
          <div className="add-action-content" onClick={(e) => e.stopPropagation()}>
            <div className="add-action-header">
              <h5 className="add-action-title">新しい親アクションを追加</h5>
              <button 
                className="add-action-close-button"
                onClick={handleCancel}
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
              <div className="add-action-form-group">
                <label className="add-action-label">種別</label>
                <select
                  className="add-action-select"
                  value={newAction.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    const dates = calculateActionDates(newAction.actionName || '', type);
                    setNewAction({ 
                      ...newAction, 
                      type,
                      startDate: dates.startDate,
                      endDate: dates.endDate
                    });
                  }}
                >
                  <option value="妊娠期">妊娠期</option>
                  <option value="産褥期">産褥期</option>
                  <option value="授乳期">授乳期</option>
                  <option value="育児期">育児期</option>
                  <option value="復職期">復職期</option>
                </select>
              </div>
              <div className="add-action-form-group">
                <label className="add-action-label">アクション名 <span className="required">*</span></label>
                <input
                  type="text"
                  className="add-action-input"
                  value={newAction.actionName}
                  onChange={(e) => {
                    const actionName = e.target.value;
                    const dates = calculateActionDates(actionName, newAction.type || '妊娠期');
                    setNewAction({ 
                      ...newAction, 
                      actionName,
                      startDate: dates.startDate,
                      endDate: dates.endDate
                    });
                  }}
                  placeholder="アクション名を入力"
                />
              </div>
              <div className="add-action-form-group">
                <label className="add-action-label">実施期間（開始） <span className="required">*</span></label>
                <input
                  type="date"
                  className="add-action-input"
                  value={newAction.startDate}
                  onChange={(e) => setNewAction({ ...newAction, startDate: e.target.value })}
                  disabled={['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(newAction.type)}
                  title={['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(newAction.type) ? "期間設定モーダルで設定された期間が自動的に適用されます" : ""}
                />
                {['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(newAction.type) && (
                  <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                    期間設定モーダルで設定された期間が自動的に適用されます
                  </span>
                )}
              </div>
              <div className="add-action-form-group">
                <label className="add-action-label">実施期間（終了） <span className="required">*</span></label>
                <input
                  type="date"
                  className="add-action-input"
                  value={newAction.endDate}
                  onChange={(e) => setNewAction({ ...newAction, endDate: e.target.value })}
                  min={newAction.startDate || undefined}
                  disabled={['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(newAction.type)}
                  title={['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(newAction.type) ? "期間設定モーダルで設定された期間が自動的に適用されます" : ""}
                />
              </div>
              <div className="add-action-form-group">
                <label className="add-action-label">備考</label>
                <input
                  type="text"
                  className="add-action-input"
                  value={newAction.remarks}
                  onChange={(e) => setNewAction({ ...newAction, remarks: e.target.value })}
                  placeholder="備考を入力（任意）"
                />
              </div>
            </div>
            <div className="add-action-footer">
              <button className="add-action-cancel-btn" onClick={handleCancel}>
                キャンセル
              </button>
              <button className="add-action-save-btn" onClick={handleAdd}>
                追加
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <div className="gantt-chart">
        <div className="gantt-header" style={{ width: `${200 + months.length * 60}px`, minWidth: `${200 + months.length * 60}px`, top: `${headerTop}px` }}>
          <div className="gantt-header-left">
            <div className="gantt-header-cell">アクション名</div>
          </div>
          <div className="gantt-header-right" style={{ width: `${months.length * 60}px`, minWidth: `${months.length * 60}px` }}>
            {years.map(year => {
              const yearMonths = months.filter(m => m.getFullYear() === year);
              return (
                <div 
                  key={year} 
                  className="gantt-year-container"
                  style={{ width: `${yearMonths.length * 60}px`, flex: 'none' }}
                >
                  <div className="gantt-year-header">
                    {year}年
                  </div>
                  <div className="gantt-year-months">
                    {yearMonths.map((month, index) => (
                      <div key={index} className="gantt-month-cell" style={{ width: '60px', flex: 'none' }}>
                        {month.getMonth() + 1}月
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="gantt-body">
          {filteredActions.length === 0 ? (
            <div className="gantt-empty">アクションがありません</div>
          ) : (
            filteredActions.sort((a, b) => {
              // 番号順のみ
              return (a.number || 0) - (b.number || 0);
            }).flatMap((action) => {
              const actionPosition = getActionPosition(action);
              const isExpanded = expandedActions.has(action.id);
              const hasSubActions = action.subActions && action.subActions.length > 0;
              
              const rows = [
                <div 
                  key={action.id} 
                  className="gantt-row"
                  draggable={canEdit && !periodActionIds.includes(action.id)}
                  onDragStart={canEdit && !periodActionIds.includes(action.id) ? (e) => handleActionDragStart(e, action.id) : undefined}
                  onDragOver={canEdit && !periodActionIds.includes(action.id) ? (e) => handleActionDragOver(e, action.id) : undefined}
                  onDragLeave={canEdit && !periodActionIds.includes(action.id) ? handleActionDragLeave : undefined}
                  onDrop={canEdit && !periodActionIds.includes(action.id) ? (e) => handleActionDrop(e, action.id) : undefined}
                  onDragEnd={canEdit && !periodActionIds.includes(action.id) ? handleActionDragEnd : undefined}
                  style={{ 
                    cursor: canEdit && !periodActionIds.includes(action.id) ? 'move' : 'default',
                    width: `${200 + months.length * 60}px`,
                    minWidth: `${200 + months.length * 60}px`
                  }}
                >
                  <div className="gantt-row-label">
                    {hasSubActions && (
                      <button 
                        className="gantt-expand-button"
                        onClick={() => toggleAction(action.id)}
                        aria-label={isExpanded ? '折りたたむ' : '展開'}
                      >
                        <svg 
                          width="12" 
                          height="12" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          style={{ 
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                          }}
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    )}
                    {!periodActionIds.includes(action.id) && !parentActionTypeIds.includes(action.id) && canEdit && (
                      <button
                        className={`gantt-status-checkbox ${action.status === 'completed' ? 'checked' : ''} ${action.status === 'in-progress' ? 'in-progress' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Checkbox clicked for action:', action.id, action.actionName);
                          handleToggleStatus(action.id);
                        }}
                        aria-label={
                          action.status === 'pending' ? '未着手→着手' : 
                          action.status === 'in-progress' ? '着手→完了' : 
                          '完了→未着手'
                        }
                        title={
                          action.status === 'pending' ? '未着手→着手' : 
                          action.status === 'in-progress' ? '着手→完了' : 
                          '完了→未着手'
                        }
                        style={{ 
                          background: action.status === 'in-progress' ? '#3b82f6' : action.status === 'completed' ? '#10b981' : 'none', 
                          border: `2px solid ${action.status === 'in-progress' ? '#3b82f6' : action.status === 'completed' ? '#10b981' : '#ccc'}`, 
                          borderRadius: '4px', 
                          width: '18px', 
                          height: '18px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          marginRight: '8px',
                          flexShrink: 0
                        }}
                      >
                        {action.status === 'in-progress' && (
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                        )}
                        {action.status === 'completed' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {action.actionName}
                      {canEdit && (
                        <button
                          className="gantt-add-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddSubActionClick(action.id);
                          }}
                          aria-label="サブアクション追加"
                          title="サブアクションを追加"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#667eea',
                            fontSize: '14px',
                            lineHeight: '1',
                            marginLeft: '4px'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="gantt-row-chart" style={{ width: `${months.length * 60}px`, minWidth: `${months.length * 60}px` }}>
                    {/* 今日の日付の縦線 */}
                    {todayPosition && (
                      <div 
                        className="gantt-today-line"
                        style={{
                          left: todayPosition
                        }}
                        title={`今日: ${new Date().toLocaleDateString('ja-JP', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric'
                        })}`}
                      />
                    )}
                    <div 
                      className="gantt-bar"
                      style={{
                        left: actionPosition.left,
                        width: actionPosition.width,
                        backgroundColor: ['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type) ? '#3b82f6' : getStatusColor(action.status),
                        cursor: canEdit && !['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type) ? 'pointer' : 'default'
                      }}
                      title={canEdit && !['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type) ? `クリックして期間を編集: ${action.actionName} (${action.startDate} - ${action.endDate})` : ['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type) ? "期間設定モーダルで変更できます" : `${action.actionName} (${action.startDate} - ${action.endDate})`}
                      onClick={canEdit && !['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type) ? (e) => {
                        // ドラッグが発生した場合はクリックイベントを無視
                        if (dragStartPos) {
                          const dragDistance = Math.sqrt(
                            Math.pow(e.clientX - dragStartPos.x, 2) + 
                            Math.pow(e.clientY - dragStartPos.y, 2)
                          );
                          if (dragDistance > 5) {
                            // 5px以上移動していたらドラッグとみなす
                            return;
                          }
                        }
                        e.stopPropagation();
                        handleEditActionDates(action);
                      } : undefined}
                      onMouseDown={(e) => {
                        if (canEdit) {
                          setDragStartPos({ x: e.clientX, y: e.clientY });
                        }
                      }}
                      onMouseUp={(e) => {
                        if (canEdit) {
                          // マウスアップ時にドラッグ開始位置をリセット
                          setTimeout(() => setDragStartPos(null), 0);
                        }
                      }}
                    >
                      <span className="gantt-bar-text">{action.actionName}</span>
                    </div>
                    {/* アクションの日付編集フォーム */}
                    {editingActionDates === action.id && (
                      <div className="gantt-add-form" style={{ position: 'absolute', top: '100%', left: actionPosition.left, width: '300px', zIndex: 100 }}>
                        <div className="gantt-add-form-content">
                          <div style={{ marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>
                            {action.actionName} の期間を編集
                          </div>
                          <div className="gantt-add-form-row">
                            <label style={{ fontSize: '12px', color: '#6b7280', minWidth: '60px' }}>開始日:</label>
                            <input
                              type="date"
                              value={editingActionDatesData.startDate}
                              onChange={(e) => setEditingActionDatesData({ ...editingActionDatesData, startDate: e.target.value })}
                            />
                          </div>
                          <div className="gantt-add-form-row">
                            <label style={{ fontSize: '12px', color: '#6b7280', minWidth: '60px' }}>終了日:</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="date"
                                value={editingActionDatesData.endDate}
                                onChange={(e) => setEditingActionDatesData({ ...editingActionDatesData, endDate: e.target.value })}
                                min={editingActionDatesData.startDate || undefined}
                              />
                              {editingActionDatesData.startDate && (
                                <button 
                                  onClick={() => setEditingActionDatesData({ ...editingActionDatesData, endDate: editingActionDatesData.startDate })}
                                  title="開始日と同じにする"
                                  style={{
                                    padding: '2px 6px',
                                    fontSize: '10px',
                                    background: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  同日
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="gantt-add-form-buttons">
                            <button
                              className="gantt-add-form-save-button"
                              onClick={() => handleSaveActionDates(action.id)}
                            >
                              保存
                            </button>
                            <button
                              className="gantt-add-form-cancel-button"
                              onClick={handleCancelActionDates}
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* サブアクションが閉じているとき、メインバーの上に重ねて表示 */}
                    {hasSubActions && !isExpanded && (() => {
                      // 重複を除去
                      const uniqueSubActions = action.subActions.filter((subAction, index, self) =>
                        index === self.findIndex(sa => sa.id === subAction.id)
                      );
                      return uniqueSubActions.map((subAction, overlayIndex) => {
                        const subPosition = getActionPosition(subAction);
                        return (
                          <div
                            key={`overlay-${action.id}-${subAction.id}-${overlayIndex}`}
                            className="gantt-bar-overlay"
                          style={{
                            left: subPosition.left,
                            width: subPosition.width,
                            backgroundColor: '#6b7280'
                          }}
                          title={`${subAction.actionName} (${subAction.startDate} - ${subAction.endDate})`}
                        />
                      );
                    });
                  })()}
                  {/* サブアクション追加フォーム */}
                  {addingSubAction === action.id && (
                    <div className="gantt-add-form">
                      <div className="gantt-add-form-content">
                        <div className="gantt-add-form-row">
                          <select
                            value={newSubAction.type}
                            onChange={(e) => setNewSubAction({ ...newSubAction, type: e.target.value })}
                          >
                            <option value="診察">診察</option>
                            <option value="申請">申請</option>
                            <option value="報告">報告</option>
                            <option value="その他">その他</option>
                          </select>
                          <input
                            type="text"
                            placeholder="アクション名"
                            value={newSubAction.actionName}
                            onChange={(e) => setNewSubAction({ ...newSubAction, actionName: e.target.value })}
                          />
                        </div>
                        <div className="gantt-add-form-row">
                          <input
                            type="date"
                            placeholder="開始日"
                            value={newSubAction.startDate}
                            onChange={(e) => setNewSubAction({ ...newSubAction, startDate: e.target.value })}
                          />
                          <input
                            type="date"
                            placeholder="終了日"
                            value={newSubAction.endDate}
                            onChange={(e) => setNewSubAction({ ...newSubAction, endDate: e.target.value })}
                            min={newSubAction.startDate || undefined}
                          />
                          <input
                            type="text"
                            placeholder="備考"
                            value={newSubAction.remarks}
                            onChange={(e) => setNewSubAction({ ...newSubAction, remarks: e.target.value })}
                          />
                        </div>
                        <div className="gantt-add-form-buttons">
                          <button
                            className="gantt-add-form-save-button"
                            onClick={() => handleSaveSubAction(action.id)}
                          >
                            保存
                          </button>
                          <button
                            className="gantt-add-form-cancel-button"
                            onClick={handleCancelSubAction}
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              ];
              
              // サブアクションが展開されているときのみ表示
              if (hasSubActions && isExpanded) {
                action.subActions.forEach((subAction) => {
                  const subPosition = getActionPosition(subAction);
                  const hasSubSubActions = subAction.subActions && subAction.subActions.length > 0;
                  const isSubExpanded = expandedSubActions.has(`${action.id}-${subAction.id}`);
                  
                  rows.push(
                    <div 
                      key={`sub-${action.id}-${subAction.id}`} 
                      className="gantt-row gantt-sub-row"
                      draggable={canEdit}
                      onDragStart={canEdit ? (e) => handleSubActionDragStart(e, action.id, subAction.id) : undefined}
                      onDragOver={canEdit ? (e) => handleSubActionDragOver(e, action.id, subAction.id) : undefined}
                      onDragLeave={canEdit ? handleSubActionDragLeave : undefined}
                      onDrop={canEdit ? (e) => handleSubActionDrop(e, action.id, subAction.id) : undefined}
                      onDragEnd={canEdit ? handleSubActionDragEnd : undefined}
                      style={{ 
                        cursor: canEdit ? 'move' : 'default',
                        width: `${200 + months.length * 60}px`,
                        minWidth: `${200 + months.length * 60}px`
                      }}
                    >
                      <div className="gantt-row-label">
                        {hasSubSubActions ? (
                          <button 
                            className="gantt-expand-button"
                            onClick={() => toggleSubAction(action.id, subAction.id)}
                            aria-label={isSubExpanded ? '折りたたむ' : '展開'}
                            style={{ marginLeft: '-10px', marginRight: '0' }}
                          >
                            <svg 
                              width="12" 
                              height="12" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2"
                              style={{ 
                                transform: isSubExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                              }}
                            >
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        ) : (
                          <div className="gantt-expand-button-placeholder" style={{ marginLeft: '-10px', marginRight: '0' }}></div>
                        )}
                        {canEdit && (
                          <button
                            className={`gantt-status-checkbox ${subAction.status === 'completed' ? 'checked' : ''} ${subAction.status === 'in-progress' ? 'in-progress' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Checkbox clicked for sub-action:', action.id, subAction.id, subAction.actionName);
                              handleToggleStatus(action.id, subAction.id);
                            }}
                            aria-label={
                              subAction.status === 'pending' ? '未着手→着手' : 
                              subAction.status === 'in-progress' ? '着手→完了' : 
                              '完了→未着手'
                            }
                            title={
                              subAction.status === 'pending' ? '未着手→着手' : 
                              subAction.status === 'in-progress' ? '着手→完了' : 
                              '完了→未着手'
                            }
                            style={{ 
                              background: subAction.status === 'in-progress' ? '#3b82f6' : subAction.status === 'completed' ? '#10b981' : 'none', 
                              border: `2px solid ${subAction.status === 'in-progress' ? '#3b82f6' : subAction.status === 'completed' ? '#10b981' : '#ccc'}`, 
                              borderRadius: '4px', 
                              width: '18px', 
                              height: '18px', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              marginRight: '0',
                              marginLeft: '0',
                              flexShrink: 0
                            }}
                          >
                            {subAction.status === 'in-progress' && (
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <circle cx="12" cy="12" r="10"></circle>
                              </svg>
                            )}
                            {subAction.status === 'completed' && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </button>
                        )}
                        <span className="sub-action-indicator">└</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {subAction.actionName}
                          {canEdit && (
                            <button
                              className="gantt-add-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddSubSubActionClick(action.id, subAction.id);
                              }}
                              aria-label="サブサブアクション追加"
                              title="サブサブアクションを追加"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#667eea',
                                fontSize: '12px',
                                lineHeight: '1',
                                marginLeft: '4px'
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </button>
                          )}
                        </span>
                      </div>
                      <div className="gantt-row-chart" style={{ width: `${months.length * 60}px`, minWidth: `${months.length * 60}px` }}>
                        {/* 今日の日付の縦線 */}
                        {todayPosition && (
                          <div 
                            className="gantt-today-line"
                            style={{
                              left: todayPosition
                            }}
                            title={`今日: ${new Date().toLocaleDateString('ja-JP', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric'
                            })}`}
                          />
                        )}
                        <div 
                          className="gantt-bar gantt-sub-bar"
                          style={{
                            left: subPosition.left,
                            width: subPosition.width,
                            backgroundColor: getStatusColor(subAction.status || 'pending'),
                            cursor: canEdit ? 'pointer' : 'default'
                          }}
                          title={canEdit ? `クリックして期間を編集: ${subAction.actionName} (${subAction.startDate} - ${subAction.endDate})` : `${subAction.actionName} (${subAction.startDate} - ${subAction.endDate})`}
                          onClick={canEdit ? (e) => {
                            // ドラッグが発生した場合はクリックイベントを無視
                            if (dragStartPos) {
                              const dragDistance = Math.sqrt(
                                Math.pow(e.clientX - dragStartPos.x, 2) + 
                                Math.pow(e.clientY - dragStartPos.y, 2)
                              );
                              if (dragDistance > 5) {
                                return;
                              }
                            }
                            e.stopPropagation();
                            handleEditSubActionDates(action.id, subAction);
                          } : undefined}
                          onMouseDown={(e) => {
                            if (canEdit) {
                              setDragStartPos({ x: e.clientX, y: e.clientY });
                            }
                          }}
                          onMouseUp={(e) => {
                            if (canEdit) {
                              setTimeout(() => setDragStartPos(null), 0);
                            }
                          }}
                        >
                          <span className="gantt-bar-text">{subAction.actionName}</span>
                        </div>
                        {/* サブアクションの日付編集フォーム */}
                        {editingSubActionDates === `${action.id}-${subAction.id}` && (
                          <div className="gantt-add-form" style={{ position: 'absolute', top: '100%', left: subPosition.left, width: '300px', zIndex: 100 }}>
                            <div className="gantt-add-form-content">
                              <div style={{ marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>
                                {subAction.actionName} の期間を編集
                              </div>
                              <div className="gantt-add-form-row">
                                <label style={{ fontSize: '12px', color: '#6b7280', minWidth: '60px' }}>開始日:</label>
                                <input
                                  type="date"
                                  value={editingSubActionDatesData.startDate}
                                  onChange={(e) => setEditingSubActionDatesData({ ...editingSubActionDatesData, startDate: e.target.value })}
                                />
                              </div>
                              <div className="gantt-add-form-row">
                                <label style={{ fontSize: '12px', color: '#6b7280', minWidth: '60px' }}>終了日:</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <input
                                    type="date"
                                    value={editingSubActionDatesData.endDate}
                                    onChange={(e) => setEditingSubActionDatesData({ ...editingSubActionDatesData, endDate: e.target.value })}
                                    min={editingSubActionDatesData.startDate || undefined}
                                  />
                                  {editingSubActionDatesData.startDate && (
                                    <button 
                                      onClick={() => setEditingSubActionDatesData({ ...editingSubActionDatesData, endDate: editingSubActionDatesData.startDate })}
                                      title="開始日と同じにする"
                                      style={{
                                        padding: '2px 6px',
                                        fontSize: '10px',
                                        background: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      同日
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="gantt-add-form-buttons">
                                <button
                                  className="gantt-add-form-save-button"
                                  onClick={() => handleSaveSubActionDates(action.id, subAction.id)}
                                >
                                  保存
                                </button>
                                <button
                                  className="gantt-add-form-cancel-button"
                                  onClick={handleCancelSubActionDates}
                                >
                                  キャンセル
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* サブサブアクション追加フォーム */}
                        {addingSubSubAction === `${action.id}-${subAction.id}` && (
                          <div className="gantt-add-form">
                            <div className="gantt-add-form-content">
                              <div className="gantt-add-form-row">
                                <select
                                  value={newSubSubAction.type}
                                  onChange={(e) => setNewSubSubAction({ ...newSubSubAction, type: e.target.value })}
                                >
                                  <option value="診察">診察</option>
                                  <option value="申請">申請</option>
                                  <option value="報告">報告</option>
                                  <option value="その他">その他</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="アクション名"
                                  value={newSubSubAction.actionName}
                                  onChange={(e) => setNewSubSubAction({ ...newSubSubAction, actionName: e.target.value })}
                                />
                              </div>
                              <div className="gantt-add-form-row">
                                <input
                                  type="date"
                                  placeholder="開始日"
                                  value={newSubSubAction.startDate}
                                  onChange={(e) => setNewSubSubAction({ ...newSubSubAction, startDate: e.target.value })}
                                />
                                <input
                                  type="date"
                                  placeholder="終了日"
                                  value={newSubSubAction.endDate}
                                  onChange={(e) => setNewSubSubAction({ ...newSubSubAction, endDate: e.target.value })}
                                  min={newSubSubAction.startDate || undefined}
                                />
                                <input
                                  type="text"
                                  placeholder="備考"
                                  value={newSubSubAction.remarks}
                                  onChange={(e) => setNewSubSubAction({ ...newSubSubAction, remarks: e.target.value })}
                                />
                              </div>
                              <div className="gantt-add-form-buttons">
                                <button
                                  className="gantt-add-form-save-button"
                                  onClick={() => handleSaveSubSubAction(action.id, subAction.id)}
                                >
                                  保存
                                </button>
                                <button
                                  className="gantt-add-form-cancel-button"
                                  onClick={handleCancelSubSubAction}
                                >
                                  キャンセル
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* サブサブアクションが閉じているとき、サブアクションバーの上に重ねて表示 */}
                        {hasSubSubActions && !isSubExpanded && (() => {
                          // 重複を除去
                          const uniqueSubSubActions = subAction.subActions.filter((subSubAction, index, self) =>
                            index === self.findIndex(ssa => ssa.id === subSubAction.id)
                          );
                          return uniqueSubSubActions.map((subSubAction, overlayIndex) => {
                            const subSubPosition = getActionPosition(subSubAction);
                            return (
                              <div
                                key={`overlay-subsub-${action.id}-${subAction.id}-${subSubAction.id}-${overlayIndex}`}
                                className="gantt-bar-overlay"
                                style={{
                                  left: subSubPosition.left,
                                  width: subSubPosition.width,
                                  backgroundColor: '#d1d5db',
                                  opacity: 0.8
                                }}
                                title={`${subSubAction.actionName} (${subSubAction.startDate} - ${subSubAction.endDate})`}
                              />
                            );
                          });
                        })()}
                      </div>
                    </div>
                  );
                  
                  // サブサブアクションが展開されているときのみ表示
                  if (hasSubSubActions && isSubExpanded) {
                    subAction.subActions.forEach((subSubAction) => {
                      const subSubPosition = getActionPosition(subSubAction);
                      rows.push(
                        <div key={`subsub-${action.id}-${subAction.id}-${subSubAction.id}`} className="gantt-row gantt-sub-sub-row" style={{ width: `${200 + months.length * 60}px`, minWidth: `${200 + months.length * 60}px` }}>
                          <div className="gantt-row-label">
                            {canEdit && (
                              <button
                                className={`gantt-status-checkbox ${subSubAction.status === 'completed' ? 'checked' : ''} ${subSubAction.status === 'in-progress' ? 'in-progress' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Checkbox clicked for sub-sub-action:', action.id, subAction.id, subSubAction.id, subSubAction.actionName);
                                  handleToggleStatus(action.id, subAction.id, subSubAction.id);
                                }}
                                aria-label={
                                  subSubAction.status === 'pending' ? '未着手→着手' : 
                                  subSubAction.status === 'in-progress' ? '着手→完了' : 
                                  '完了→未着手'
                                }
                                title={
                                  subSubAction.status === 'pending' ? '未着手→着手' : 
                                  subSubAction.status === 'in-progress' ? '着手→完了' : 
                                  '完了→未着手'
                                }
                                style={{ 
                                  background: subSubAction.status === 'in-progress' ? '#3b82f6' : subSubAction.status === 'completed' ? '#10b981' : 'none', 
                                  border: `2px solid ${subSubAction.status === 'in-progress' ? '#3b82f6' : subSubAction.status === 'completed' ? '#10b981' : '#ccc'}`, 
                                  borderRadius: '4px', 
                                  width: '18px', 
                                  height: '18px', 
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 0,
                                  marginRight: '8px',
                                  flexShrink: 0
                                }}
                              >
                                {subSubAction.status === 'in-progress' && (
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                    <circle cx="12" cy="12" r="10"></circle>
                                  </svg>
                                )}
                                {subSubAction.status === 'completed' && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </button>
                            )}
                            <span className="sub-action-indicator">└└</span>
                            {subSubAction.actionName}
                          </div>
                          <div className="gantt-row-chart" style={{ width: `${months.length * 60}px`, minWidth: `${months.length * 60}px` }}>
                            {/* 今日の日付の縦線 */}
                            {todayPosition && (
                              <div 
                                className="gantt-today-line"
                                style={{
                                  left: todayPosition
                                }}
                                title={`今日: ${new Date().toLocaleDateString('ja-JP', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric'
                                })}`}
                              />
                            )}
                            <div 
                              className="gantt-bar gantt-sub-sub-bar"
                              style={{
                                left: subSubPosition.left,
                                width: subSubPosition.width,
                                backgroundColor: getStatusColor(subSubAction.status || 'pending'),
                                cursor: canEdit ? 'pointer' : 'default'
                              }}
                              title={canEdit ? `クリックして期間を編集: ${subSubAction.actionName} (${subSubAction.startDate} - ${subSubAction.endDate})` : `${subSubAction.actionName} (${subSubAction.startDate} - ${subSubAction.endDate})`}
                              onClick={canEdit ? (e) => {
                                // ドラッグが発生した場合はクリックイベントを無視
                                if (dragStartPos) {
                                  const dragDistance = Math.sqrt(
                                    Math.pow(e.clientX - dragStartPos.x, 2) + 
                                    Math.pow(e.clientY - dragStartPos.y, 2)
                                  );
                                  if (dragDistance > 5) {
                                    return;
                                  }
                                }
                                e.stopPropagation();
                                handleEditSubSubActionDates(action.id, subAction.id, subSubAction);
                              } : undefined}
                              onMouseDown={(e) => {
                                if (canEdit) {
                                  setDragStartPos({ x: e.clientX, y: e.clientY });
                                }
                              }}
                              onMouseUp={(e) => {
                                if (canEdit) {
                                  setTimeout(() => setDragStartPos(null), 0);
                                }
                              }}
                            >
                              <span className="gantt-bar-text">{subSubAction.actionName}</span>
                            </div>
                            {/* サブサブアクションの日付編集フォーム */}
                            {editingSubSubActionDates === `${action.id}-${subAction.id}-${subSubAction.id}` && (
                              <div className="gantt-add-form" style={{ position: 'absolute', top: '100%', left: subSubPosition.left, width: '300px', zIndex: 100 }}>
                                <div className="gantt-add-form-content">
                                  <div style={{ marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>
                                    {subSubAction.actionName} の期間を編集
                                  </div>
                                  <div className="gantt-add-form-row">
                                    <label style={{ fontSize: '12px', color: '#6b7280', minWidth: '60px' }}>開始日:</label>
                                    <input
                                      type="date"
                                      value={editingSubSubActionDatesData.startDate}
                                      onChange={(e) => setEditingSubSubActionDatesData({ ...editingSubSubActionDatesData, startDate: e.target.value })}
                                    />
                                  </div>
                                  <div className="gantt-add-form-row">
                                    <label style={{ fontSize: '12px', color: '#6b7280', minWidth: '60px' }}>終了日:</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <input
                                        type="date"
                                        value={editingSubSubActionDatesData.endDate}
                                        onChange={(e) => setEditingSubSubActionDatesData({ ...editingSubSubActionDatesData, endDate: e.target.value })}
                                        min={editingSubSubActionDatesData.startDate || undefined}
                                      />
                                      {editingSubSubActionDatesData.startDate && (
                                        <button 
                                          onClick={() => setEditingSubSubActionDatesData({ ...editingSubSubActionDatesData, endDate: editingSubSubActionDatesData.startDate })}
                                          title="開始日と同じにする"
                                          style={{
                                            padding: '2px 6px',
                                            fontSize: '10px',
                                            background: '#667eea',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                          }}
                                        >
                                          同日
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="gantt-add-form-buttons">
                                    <button
                                      className="gantt-add-form-save-button"
                                      onClick={() => handleSaveSubSubActionDates(action.id, subAction.id, subSubAction.id)}
                                    >
                                      保存
                                    </button>
                                    <button
                                      className="gantt-add-form-cancel-button"
                                      onClick={handleCancelSubSubActionDates}
                                    >
                                      キャンセル
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  }
                });
              }
              
              return rows;
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;

