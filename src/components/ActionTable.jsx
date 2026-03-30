import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './ActionTable.css';

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

const ActionTable = ({ actions, onDelete, onUpdate, onAdd, onReorder, onAddSubAction, onDeleteSubAction, onChangeSubActionParent, onAddSubSubAction, onDeleteSubSubAction, onReorderSubActions, onDeleteAll, dueDate, calculatePeriodDates, isSharedMember, permission, showCompleted, onToggleShowCompleted, selectedTypes, onToggleType, onClearFilter, showTypeFilter, onToggleTypeFilter }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedSubAction, setDraggedSubAction] = useState(null); // {actionId, subActionIndex}
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [expandedSubActions, setExpandedSubActions] = useState(new Set());
  const prevActionsRef = useRef([]);

  // サブアクションを持つアクションをデフォルトで展開
  useEffect(() => {
    // すべてのサブアクションを持つアクションを展開（常に最新の状態を反映）
    console.log('ActionTable - サブアクション展開チェック:');
    const newExpandedRows = new Set();
    actions.forEach(action => {
      const hasSubActions = action.subActions && action.subActions.length > 0;
      console.log(`  ${action.actionName} (ID: ${action.id}): ${action.subActions?.length || 0}件のサブアクション - ${hasSubActions ? '展開' : '閉じる'}`);
      if (hasSubActions) {
        newExpandedRows.add(action.id);
      }
    });
    console.log('ActionTable - 展開するアクションID:', Array.from(newExpandedRows));
    // 既存のexpandedRowsを保持しつつ、新しいサブアクションを持つアクションを追加
    // ただし、サブアクションがなくなったアクションは削除
    setExpandedRows(prevExpandedRows => {
      const finalExpandedRows = new Set(prevExpandedRows);
      actions.forEach(action => {
        const hasSubActions = action.subActions && action.subActions.length > 0;
        if (hasSubActions) {
          finalExpandedRows.add(action.id);
        } else {
          finalExpandedRows.delete(action.id);
        }
      });
      return finalExpandedRows;
    });
    prevActionsRef.current = actions;
  }, [actions]);
  const [addingSubAction, setAddingSubAction] = useState(null);
  const [addingSubSubAction, setAddingSubSubAction] = useState(null);
  const [editingAction, setEditingAction] = useState(null);
  const [editingActionType, setEditingActionType] = useState(null);
  const [editingSubAction, setEditingSubAction] = useState(null);
  const [editingSubActionType, setEditingSubActionType] = useState(null);
  const [editingActionRemarks, setEditingActionRemarks] = useState(null);
  const [editingSubActionRemarks, setEditingSubActionRemarks] = useState(null);
  const [changingParentFor, setChangingParentFor] = useState(null); // {actionId, subActionId}
  // 状態管理機能は一旦削除（作り直し予定）
  // const [editingActionStatus, setEditingActionStatus] = useState(null);
  // const [editingSubActionStatus, setEditingSubActionStatus] = useState(null);
  // const [editingSubSubActionStatus, setEditingSubSubActionStatus] = useState(null);
  const [newAction, setNewAction] = useState({
    type: '妊娠期',
    actionName: '',
    startDate: '',
    endDate: '',
    remarks: '',
    status: 'pending'
  });
  const [newSubAction, setNewSubAction] = useState({
    type: '診察',
    actionName: '',
    startDate: '',
    endDate: '',
    remarks: ''
  });
  const [newSubSubAction, setNewSubSubAction] = useState({
    type: '診察',
    actionName: '',
    startDate: '',
    endDate: '',
    remarks: ''
  });
  const [editingActionData, setEditingActionData] = useState({});
  const [editingActionTypeData, setEditingActionTypeData] = useState('');
  const [editingSubActionData, setEditingSubActionData] = useState({});
  const [editingSubActionTypeData, setEditingSubActionTypeData] = useState('');
  const [editingActionRemarksData, setEditingActionRemarksData] = useState('');
  const [editingSubActionRemarksData, setEditingSubActionRemarksData] = useState('');

  // モーダル表示時にbodyのスクロールを無効化
  useDisableScroll(showTypeFilter || isAdding);

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

    // アクション名や種別から適切な期間を判定
    const actionNameLower = actionName.toLowerCase();
    const typeLower = type.toLowerCase();

    // 出産前の手続き（申請系）
    if (actionNameLower.includes('申請') || actionNameLower.includes('手続き')) {
      // 出産予定日の1ヶ月前から1週間前
      startDate = new Date(due);
      startDate.setMonth(startDate.getMonth() - 1);
      endDate = new Date(due);
      endDate.setDate(endDate.getDate() - 7);
    }
    // 出産後の手続き（給付系）
    else if (actionNameLower.includes('給付') || actionNameLower.includes('受け取り')) {
      // 出産予定日の1週間後から2ヶ月後
      startDate = new Date(due);
      startDate.setDate(startDate.getDate() + 7);
      endDate = new Date(due);
      endDate.setMonth(endDate.getMonth() + 2);
    }
    // 出産前後の手続き（一時金など）
    else if (actionNameLower.includes('一時金') || actionNameLower.includes('手当')) {
      // 出産予定日の2週間前から1ヶ月後
      startDate = new Date(due);
      startDate.setDate(startDate.getDate() - 14);
      endDate = new Date(due);
      endDate.setMonth(endDate.getMonth() + 1);
    }
    // デフォルト：出産予定日の前後1ヶ月
    else {
      startDate = new Date(due);
      startDate.setMonth(startDate.getMonth() - 1);
      endDate = new Date(due);
      endDate.setMonth(endDate.getMonth() + 1);
    }

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  };

  const handleDelete = (id) => {
    if (window.confirm('このアクションを削除しますか？')) {
      onDelete(id);
    }
  };

  const handleAdd = () => {
    if (!newAction.actionName || !newAction.startDate || !newAction.endDate) {
      alert('アクション名、開始日、終了日は必須です。');
      return;
    }
    
    const nextNumber = actions.length > 0 
      ? Math.max(...actions.map(a => a.number)) + 1 
      : 1;
    
    onAdd({
      ...newAction,
      number: nextNumber
    });
    
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

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const draggedOverRow = e.currentTarget;
    if (draggedIndex !== null && draggedIndex !== index) {
      draggedOverRow.style.backgroundColor = '#e0e7ff';
    }
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newActions = [...actions];
    const draggedItem = newActions[draggedIndex];
    
    // 番号を更新
    const reorderedActions = newActions.map((action, index) => ({
      ...action,
      number: index + 1
    }));

    // ドラッグしたアイテムを削除
    reorderedActions.splice(draggedIndex, 1);
    
    // ドロップ位置に挿入
    reorderedActions.splice(dropIndex, 0, draggedItem);
    
    // 番号を再計算
    const finalActions = reorderedActions.map((action, index) => ({
      ...action,
      number: index + 1
    }));

    onReorder(finalActions);
    setDraggedIndex(null);
  };

  // サブアクション用のドラッグ&ドロップハンドラー
  const handleSubActionDragStart = (e, actionId, subActionIndex) => {
    setDraggedSubAction({ actionId, subActionIndex });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleSubActionDragOver = (e, actionId, subActionIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedSubAction && 
        (draggedSubAction.actionId !== actionId || draggedSubAction.subActionIndex !== subActionIndex)) {
      const draggedOverRow = e.currentTarget;
      draggedOverRow.style.backgroundColor = '#e0e7ff';
    }
  };

  const handleSubActionDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '';
  };

  const handleSubActionDrop = (e, actionId, dropSubActionIndex) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    
    if (!draggedSubAction || 
        draggedSubAction.actionId !== actionId || 
        draggedSubAction.subActionIndex === dropSubActionIndex) {
      setDraggedSubAction(null);
      return;
    }

    const action = actions.find(a => a.id === actionId);
    if (!action || !action.subActions) {
      setDraggedSubAction(null);
      return;
    }

    const newSubActions = [...action.subActions];
    const draggedItem = newSubActions[draggedSubAction.subActionIndex];
    
    // ドラッグしたアイテムを削除
    newSubActions.splice(draggedSubAction.subActionIndex, 1);
    
    // ドロップ位置に挿入
    newSubActions.splice(dropSubActionIndex, 0, draggedItem);

    // 親アクションを更新
    const updatedAction = {
      ...action,
      subActions: newSubActions
    };

    onReorderSubActions(actionId, newSubActions);
    setDraggedSubAction(null);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '';
    setDraggedIndex(null);
  };

  const toggleRow = (actionId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(actionId)) {
      newExpanded.delete(actionId);
    } else {
      newExpanded.add(actionId);
    }
    setExpandedRows(newExpanded);
  };

  const toggleSubActionRow = (actionId, subActionId) => {
    const key = `${actionId}-${subActionId}`;
    const newExpanded = new Set(expandedSubActions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSubActions(newExpanded);
  };

  const handleAddSubActionClick = (actionId) => {
    // 行が展開されていない場合は自動的に展開
    if (!expandedRows.has(actionId)) {
      const newExpanded = new Set(expandedRows);
      newExpanded.add(actionId);
      setExpandedRows(newExpanded);
    }
    
    setAddingSubAction(actionId);
    setNewSubAction({
      type: '診察',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: ''
    });
  };

  const handleSaveSubAction = (actionId) => {
    if (!newSubAction.actionName || !newSubAction.startDate || !newSubAction.endDate) {
      alert('アクション名、開始日、終了日は必須です。');
      return;
    }
    onAddSubAction(actionId, newSubAction);
    setNewSubAction({
      type: '診察',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: ''
    });
    setAddingSubAction(null);
  };

  const handleCancelSubAction = () => {
    setNewSubAction({
      type: '診察',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: ''
    });
    setAddingSubAction(null);
  };

  const handleEditAction = (action) => {
    // 親アクションの種別（妊娠期、産褥期、授乳期、育児期、復職期）の場合は編集不可
    if (['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type)) {
      return;
    }
    setEditingAction(action.id);
    setEditingActionData({
      startDate: action.startDate,
      endDate: action.endDate
    });
  };

  const handleSaveAction = (actionId) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      onUpdate({
        ...action,
        startDate: editingActionData.startDate,
        endDate: editingActionData.endDate
      });
    }
    setEditingAction(null);
    setEditingActionData({});
  };

  const handleCancelEditAction = () => {
    setEditingAction(null);
    setEditingActionData({});
  };

  const handleEditSubAction = (actionId, subAction) => {
    setEditingSubAction(`${actionId}-${subAction.id}`);
    setEditingSubActionData({
      startDate: subAction.startDate,
      endDate: subAction.endDate
    });
  };

  const handleSaveSubActionEdit = (actionId, subActionId) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      const subAction = action.subActions.find(sa => sa.id === subActionId);
      if (subAction) {
        const updatedSubAction = {
          ...subAction,
          startDate: editingSubActionData.startDate,
          endDate: editingSubActionData.endDate
        };
        const updatedAction = {
          ...action,
          subActions: action.subActions.map(sa => 
            sa.id === subActionId ? updatedSubAction : sa
          )
        };
        onUpdate(updatedAction);
      }
    }
    setEditingSubAction(null);
    setEditingSubActionData({});
  };

  const handleCancelEditSubAction = () => {
    setEditingSubAction(null);
    setEditingSubActionData({});
  };

  const handleEditActionType = (action) => {
    setEditingActionType(action.id);
    setEditingActionTypeData(action.type);
  };

  const handleSaveActionType = (actionId) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      onUpdate({
        ...action,
        type: editingActionTypeData
      });
    }
    setEditingActionType(null);
    setEditingActionTypeData('');
  };

  const handleCancelEditActionType = () => {
    setEditingActionType(null);
    setEditingActionTypeData('');
  };

  const handleEditSubActionType = (actionId, subAction) => {
    setEditingSubActionType(`${actionId}-${subAction.id}`);
    setEditingSubActionTypeData(subAction.type || '診察');
  };

  const handleSaveSubActionType = (actionId, subActionId) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      const subAction = action.subActions.find(sa => sa.id === subActionId);
      if (subAction) {
        const updatedSubAction = {
          ...subAction,
          type: editingSubActionTypeData
        };
        const updatedAction = {
          ...action,
          subActions: action.subActions.map(sa => 
            sa.id === subActionId ? updatedSubAction : sa
          )
        };
        onUpdate(updatedAction);
      }
    }
    setEditingSubActionType(null);
    setEditingSubActionTypeData('');
  };

  const handleCancelEditSubActionType = () => {
    setEditingSubActionType(null);
    setEditingSubActionTypeData('');
  };

  const handleEditActionRemarks = (action) => {
    setEditingActionRemarks(action.id);
    setEditingActionRemarksData(action.remarks || '');
  };

  const handleSaveActionRemarks = (actionId) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      onUpdate({
        ...action,
        remarks: editingActionRemarksData
      });
    }
    setEditingActionRemarks(null);
    setEditingActionRemarksData('');
  };

  const handleCancelEditActionRemarks = () => {
    setEditingActionRemarks(null);
    setEditingActionRemarksData('');
  };

  const handleEditSubActionRemarks = (actionId, subAction) => {
    setEditingSubActionRemarks(`${actionId}-${subAction.id}`);
    setEditingSubActionRemarksData(subAction.remarks || '');
  };

  const handleSaveSubActionRemarks = (actionId, subActionId) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      const subAction = action.subActions.find(sa => sa.id === subActionId);
      if (subAction) {
        const updatedSubAction = {
          ...subAction,
          remarks: editingSubActionRemarksData
        };
        const updatedAction = {
          ...action,
          subActions: action.subActions.map(sa => 
            sa.id === subActionId ? updatedSubAction : sa
          )
        };
        onUpdate(updatedAction);
      }
    }
    setEditingSubActionRemarks(null);
    setEditingSubActionRemarksData('');
  };

  const handleCancelEditSubActionRemarks = () => {
    setEditingSubActionRemarks(null);
    setEditingSubActionRemarksData('');
  };

  const handleAddSubSubActionClick = (actionId, subActionId) => {
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
      remarks: ''
    });
  };

  const handleSaveSubSubAction = (actionId, subActionId) => {
    if (!newSubSubAction.actionName || !newSubSubAction.startDate || !newSubSubAction.endDate) {
      alert('アクション名、開始日、終了日は必須です。');
      return;
    }
    onAddSubSubAction(actionId, subActionId, newSubSubAction);
    setNewSubSubAction({
      type: '診察',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: ''
    });
    setAddingSubSubAction(null);
  };

  const handleCancelSubSubAction = () => {
    setNewSubSubAction({
      type: '診察',
      actionName: '',
      startDate: '',
      endDate: '',
      remarks: ''
    });
    setAddingSubSubAction(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#fff3cd';
      case 'in-progress':
        return '#cfe2ff';
      case 'completed':
        return '#d1e7dd';
      case 'pregnancy-period':
        return '#e0e7ff';
      case 'postpartum-period':
        return '#fce7f3';
      case 'breastfeeding-period':
        return '#fef3c7';
      default:
        return '#f3f4f6';
    }
  };

  // 種別に応じた色を返す関数
  const getTypeColor = (type) => {
    switch (type) {
      case '診察':
        return '#dbeafe'; // 青系
      case '申請':
        return '#d1fae5'; // 緑系
      case '報告':
        return '#fed7aa'; // オレンジ系
      case 'その他':
        return '#e5e7eb'; // グレー系
      case '妊娠期':
      case '産褥期':
      case '授乳期':
      case '育児期':
      case '復職期':
        return '#e9d5ff'; // 濃い紫系
      default:
        return '#f3f4f6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '未着手';
      case 'in-progress':
        return '着手';
      case 'completed':
        return '完了';
      case 'pregnancy-period':
        return '妊娠期間';
      case 'postpartum-period':
        return '産褥期';
      case 'breastfeeding-period':
        return '授乳期';
      default:
        return status;
    }
  };

  // 期間アクションのIDを取得
  const periodActionNames = ['妊娠期間', '産褥期', '授乳期'];
  const periodActionIds = actions
    .filter(a => periodActionNames.includes(a.actionName))
    .map(a => a.id);
  
  // 親アクションの種別（妊娠期、産褥期、授乳期、育児期、復職期）のIDを取得
  const parentActionTypeIds = actions
    .filter(a => ['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(a.type))
    .map(a => a.id);

  // このuseEffectは削除（31-46行目のuseEffectで統合）

  // チェックボックスで完了状態を切り替える関数
  const handleToggleComplete = (actionId) => {
    // 期間アクションと親アクション種別の状態変更は無効化
    if (periodActionIds.includes(actionId) || parentActionTypeIds.includes(actionId)) {
      return;
    }
    
    const action = actions.find(a => a.id === actionId);
    if (action) {
      // 3段階で切り替え: pending → in-progress → completed → pending
      let newStatus;
      if (action.status === 'pending') {
        newStatus = 'in-progress';
      } else if (action.status === 'in-progress') {
        newStatus = 'completed';
      } else {
        newStatus = 'pending';
      }
      
      onUpdate({
        ...action,
        status: newStatus
      });
    }
  };

  const handleToggleSubActionComplete = (actionId, subActionId) => {
    // 最新のactions状態を使用するため、actions配列から直接取得
    const action = actions.find(a => a.id === actionId);
    if (!action || !action.subActions) {
      console.warn('アクションまたはサブアクションが見つかりません:', actionId);
      return;
    }
    
    // 各サブアクションを完全に独立してコピー
    const updatedSubActions = action.subActions.map(sa => {
      if (sa.id === subActionId) {
        // 対象のサブアクションのみ状態を変更（3段階で切り替え）
        let newStatus;
        if (sa.status === 'pending') {
          newStatus = 'in-progress';
        } else if (sa.status === 'in-progress') {
          newStatus = 'completed';
        } else {
          newStatus = 'pending';
        }
        
        return { 
          ...sa, 
          status: newStatus,
          // サブサブアクションも完全にコピー
          subActions: sa.subActions ? sa.subActions.map(ssa => ({ ...ssa })) : []
        };
      }
      // 他のサブアクションは完全に独立してコピー（状態を保持）
      return { 
        ...sa,
        // サブサブアクションも完全にコピー
        subActions: sa.subActions ? sa.subActions.map(ssa => ({ ...ssa })) : []
      };
    });
    
    // 親アクションの状態を変更せず、サブアクションのみ更新
    onUpdate({
      ...action,
      status: action.status, // 親アクションの状態を明示的に保持
      subActions: updatedSubActions
    });
  };

  const handleToggleSubSubActionComplete = (actionId, subActionId, subSubActionId) => {
    // 最新のactions状態を使用するため、actions配列から直接取得
    const action = actions.find(a => a.id === actionId);
    if (!action || !action.subActions) {
      console.warn('アクションまたはサブアクションが見つかりません:', actionId);
      return;
    }
    
    const subAction = action.subActions.find(sa => sa.id === subActionId);
    if (!subAction || !subAction.subActions) {
      console.warn('サブアクションまたはサブサブアクションが見つかりません:', subActionId);
      return;
    }
    
    // サブサブアクションのみ更新
    const updatedSubSubActions = subAction.subActions.map(ssa => {
      if (ssa.id === subSubActionId) {
        // 対象のサブサブアクションのみ状態を変更（3段階で切り替え）
        let newStatus;
        if (ssa.status === 'pending') {
          newStatus = 'in-progress';
        } else if (ssa.status === 'in-progress') {
          newStatus = 'completed';
        } else {
          newStatus = 'pending';
        }
        return { ...ssa, status: newStatus };
      }
      // 他のサブサブアクションは完全にコピーして状態を保持
      return { ...ssa };
    });
    
    // 親サブアクションの状態を保持し、サブサブアクションのみ更新
    const updatedSubActions = action.subActions.map(sa => {
      if (sa.id === subActionId) {
        return { 
          ...sa, 
          status: sa.status, // サブアクションの状態を明示的に保持
          subActions: updatedSubSubActions 
        };
      }
      // 他のサブアクションは完全に独立してコピー（状態を保持）
      return { 
        ...sa,
        // サブサブアクションも完全にコピー
        subActions: sa.subActions ? sa.subActions.map(ssa => ({ ...ssa })) : []
      };
    });
    
    // 親アクションの状態を変更せず、サブアクションのみ更新
    onUpdate({
      ...action,
      status: action.status, // 親アクションの状態を明示的に保持
      subActions: updatedSubActions
    });
  };

  // 状態管理機能は一旦削除（作り直し予定）
  /*
  const handleToggleStatus = (actionId) => {
    // 期間アクションの状態変更は無効化
    if (periodActionIds.includes(actionId)) {
      return;
    }
    
    const action = actions.find(a => a.id === actionId);
    if (action) {
      let newStatus;
      if (action.status === 'completed') {
        newStatus = 'pending';
      } else if (action.status === 'pending') {
        newStatus = 'in-progress';
      } else {
        newStatus = 'completed';
      }
      onUpdate({
        ...action,
        status: newStatus
      });
    }
  };

  const handleEditStatus = (action) => {
    // 期間アクションの状態編集は無効化
    if (periodActionIds.includes(action.id)) {
      return;
    }
    setEditingActionStatus(action.id);
  };

  const handleSaveStatus = (actionId, newStatus) => {
    // 期間アクションの状態保存は無効化
    if (periodActionIds.includes(actionId)) {
      setEditingActionStatus(null);
      return;
    }
    
    const action = actions.find(a => a.id === actionId);
    if (action) {
      onUpdate({
        ...action,
        status: newStatus
      });
    }
    setEditingActionStatus(null);
  };

  const handleCancelEditStatus = () => {
    setEditingActionStatus(null);
  };

  // サブアクションの状態管理
  const handleToggleSubActionStatus = (actionId, subActionId) => {
    const action = actions.find(a => a.id === actionId);
    if (action && action.subActions) {
      const subAction = action.subActions.find(sa => sa.id === subActionId);
      if (subAction) {
        let newStatus;
        if (subAction.status === 'completed') {
          newStatus = 'pending';
        } else if (subAction.status === 'pending') {
          newStatus = 'in-progress';
        } else {
          newStatus = 'completed';
        }
        
        // サブアクションを深くコピーして、指定されたIDのものだけ状態を更新
        const updatedSubActions = action.subActions.map(sa => {
          if (sa.id === subActionId) {
            return { ...sa, status: newStatus };
          }
          // 他のサブアクションは完全にコピーして状態を保持
          return { ...sa };
        });
        
        onUpdate({
          ...action,
          subActions: updatedSubActions
        });
      }
    }
  };

  const handleEditSubActionStatus = (actionId, subAction) => {
    setEditingSubActionStatus(`${actionId}-${subAction.id}`);
  };

  const handleSaveSubActionStatus = (actionId, subActionId, newStatus) => {
    const action = actions.find(a => a.id === actionId);
    if (action && action.subActions) {
      // サブアクションを深くコピーして、指定されたIDのものだけ状態を更新
      const updatedSubActions = action.subActions.map(sa => {
        if (sa.id === subActionId) {
          return { ...sa, status: newStatus };
        }
        // 他のサブアクションは完全にコピーして状態を保持
        return { ...sa };
      });
      
      onUpdate({
        ...action,
        subActions: updatedSubActions
      });
    }
    setEditingSubActionStatus(null);
  };

  const handleCancelEditSubActionStatus = () => {
    setEditingSubActionStatus(null);
  };

  // サブサブアクションの状態管理
  const handleToggleSubSubActionStatus = (actionId, subActionId, subSubActionId) => {
    const action = actions.find(a => a.id === actionId);
    if (action && action.subActions) {
      const subAction = action.subActions.find(sa => sa.id === subActionId);
      if (subAction && subAction.subActions) {
        const subSubAction = subAction.subActions.find(ssa => ssa.id === subSubActionId);
        if (subSubAction) {
          let newStatus;
          if (subSubAction.status === 'completed') {
            newStatus = 'pending';
          } else if (subSubAction.status === 'pending') {
            newStatus = 'in-progress';
          } else {
            newStatus = 'completed';
          }
          
          const updatedSubSubActions = subAction.subActions.map(ssa =>
            ssa.id === subSubActionId ? { ...ssa, status: newStatus } : ssa
          );
          
          const updatedSubActions = action.subActions.map(sa =>
            sa.id === subActionId ? { ...sa, subActions: updatedSubSubActions } : sa
          );
          
          onUpdate({
            ...action,
            subActions: updatedSubActions
          });
        }
      }
    }
  };

  const handleEditSubSubActionStatus = (actionId, subActionId, subSubAction) => {
    setEditingSubSubActionStatus(`${actionId}-${subActionId}-${subSubAction.id}`);
  };

  const handleSaveSubSubActionStatus = (actionId, subActionId, subSubActionId, newStatus) => {
    const action = actions.find(a => a.id === actionId);
    if (action && action.subActions) {
      const subAction = action.subActions.find(sa => sa.id === subActionId);
      if (subAction && subAction.subActions) {
        const updatedSubSubActions = subAction.subActions.map(ssa =>
          ssa.id === subSubActionId ? { ...ssa, status: newStatus } : ssa
        );
        
        const updatedSubActions = action.subActions.map(sa =>
          sa.id === subActionId ? { ...sa, subActions: updatedSubSubActions } : sa
        );
        
        onUpdate({
          ...action,
          subActions: updatedSubActions
        });
      }
    }
    setEditingSubSubActionStatus(null);
  };

  const handleCancelEditSubSubActionStatus = () => {
    setEditingSubSubActionStatus(null);
  };
  */

  // アクションを「未着手」「進行中」「完了」に分ける
  // アクションをソートする関数（番号順のみ、順番を保持）
  const sortActions = (actionList) => {
    return [...actionList].sort((a, b) => {
      // 番号順のみ
      return (a.number || 0) - (b.number || 0);
    });
  };

  // すべてのアクションを1つのリストに統合（妊娠期間を最初に）
  // 重複を除去してからソート（アクションとサブアクションの両方で重複を除去）
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

  const uniqueActions = filterByType(
    filterCompletedActions(
      actions.filter((action, index, self) => 
        index === self.findIndex(a => a.id === action.id)
      )
    )
  ).map(action => {
    // サブアクション内の重複も除去し、完了アクションと種別をフィルタリング
    if (action.subActions && action.subActions.length > 0) {
      const uniqueSubActions = action.subActions.filter((subAction, subIndex, subSelf) =>
        subIndex === subSelf.findIndex(sa => sa.id === subAction.id)
      );
      const filteredSubActions = filterSubActions(uniqueSubActions);
      return { ...action, subActions: filteredSubActions };
    }
    return action;
  });
  const allActions = sortActions(uniqueActions);
  const pendingActions = sortActions(actions.filter(action => action.status === 'pending'));
  const inProgressActions = sortActions(actions.filter(action => action.status === 'in-progress'));
  const completedActions = sortActions(actions.filter(action => action.status === 'completed'));

  // アクション行をレンダリングする関数
  const renderActionRows = (actionList, startIndex = 0) => {
    return actionList.flatMap((action, relativeIndex) => {
      const index = startIndex + relativeIndex;
      return [
              <tr 
                key={action.id} 
                draggable={canEdit}
                onDragStart={canEdit ? (e) => handleDragStart(e, index) : undefined}
                onDragOver={canEdit ? (e) => handleDragOver(e, index) : undefined}
                onDragLeave={canEdit ? handleDragLeave : undefined}
                onDrop={canEdit ? (e) => handleDrop(e, index) : undefined}
                onDragEnd={canEdit ? handleDragEnd : undefined}
                style={{ 
                  cursor: canEdit ? 'move' : 'default'
                }}
                className={`draggable-row parent-action-row ${action.status === 'completed' ? 'completed-row' : ''}`}
              >
                <td>
                  <div className="drag-handle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      className="expand-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRow(action.id);
                      }}
                      aria-label={expandedRows.has(action.id) ? '折りたたむ' : '展開'}
                    >
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        style={{ 
                          transform: expandedRows.has(action.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                    {!periodActionIds.includes(action.id) && !parentActionTypeIds.includes(action.id) && (
                      <button
                        className={`status-checkbox ${action.status === 'completed' ? 'checked' : ''} ${action.status === 'in-progress' ? 'in-progress' : ''}`}
                        onClick={canEdit ? (e) => {
                          e.stopPropagation();
                          handleToggleComplete(action.id);
                        } : undefined}
                        aria-label={
                          action.status === 'pending' ? '未着手→着手' : 
                          action.status === 'in-progress' ? '着手→完了' : 
                          '完了→未着手'
                        }
                        title={canEdit ? (
                          action.status === 'pending' ? '未着手→着手' : 
                          action.status === 'in-progress' ? '着手→完了' : 
                          '完了→未着手'
                        ) : ''}
                        disabled={!canEdit}
                        style={{ 
                          background: action.status === 'in-progress' ? '#3b82f6' : action.status === 'completed' ? '#10b981' : 'none', 
                          border: `2px solid ${action.status === 'in-progress' ? '#3b82f6' : action.status === 'completed' ? '#10b981' : '#ccc'}`, 
                          borderRadius: '4px', 
                          width: '20px', 
                          height: '20px', 
                          cursor: canEdit ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          opacity: canEdit ? 1 : 0.5
                        }}
                      >
                        {action.status === 'in-progress' && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                        )}
                        {action.status === 'completed' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    )}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="12" r="1"></circle>
                      <circle cx="9" cy="5" r="1"></circle>
                      <circle cx="9" cy="19" r="1"></circle>
                      <circle cx="15" cy="12" r="1"></circle>
                      <circle cx="15" cy="5" r="1"></circle>
                      <circle cx="15" cy="19" r="1"></circle>
                    </svg>
                    {action.number}
                  </div>
                </td>
                <td>
                  {editingActionType === action.id ? (
                    <div className="edit-type-cell">
                      <select
                        className="type-select"
                        value={editingActionTypeData}
                        onChange={(e) => setEditingActionTypeData(e.target.value)}
                      >
                        <option value="妊娠期">妊娠期</option>
                        <option value="産褥期">産褥期</option>
                        <option value="授乳期">授乳期</option>
                        <option value="育児期">育児期</option>
                        <option value="復職期">復職期</option>
                      </select>
                      <div className="edit-buttons-inline">
                        <button className="save-button-small" onClick={() => handleSaveActionType(action.id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                        <button className="cancel-button-small" onClick={handleCancelEditActionType}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span 
                      className={`type-badge ${canEdit ? 'editable-type' : ''}`}
                      style={{ backgroundColor: getTypeColor(action.type) }}
                      onClick={canEdit ? () => handleEditActionType(action) : undefined}
                      title={canEdit ? "クリックして編集" : ""}
                    >
                      {action.type}
                    </span>
                  )}
                </td>
                <td>{action.actionName}</td>
                <td>
                  {editingAction === action.id ? (
                    <div className="edit-date-cell">
                      <input
                        type="date"
                        className="date-input-small"
                        value={editingActionData.startDate}
                        onChange={(e) => setEditingActionData({ ...editingActionData, startDate: e.target.value })}
                      />
                      <div className="edit-buttons-inline">
                        <button className="save-button-small" onClick={() => handleSaveAction(action.id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                        <button className="cancel-button-small" onClick={handleCancelEditAction}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span 
                      className={canEdit && !['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type) ? "editable-date" : ""}
                      onClick={canEdit && !['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type) ? () => handleEditAction(action) : undefined}
                      title={canEdit && !['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type) ? "クリックして編集" : "期間設定モーダルで変更できます"}
                    >
                      {action.startDate}
                    </span>
                  )}
                </td>
                <td>
                  {editingAction === action.id ? (
                    <div className="edit-date-cell">
                      <input
                        type="date"
                        className="date-input-small"
                        value={editingActionData.endDate}
                        onChange={(e) => setEditingActionData({ ...editingActionData, endDate: e.target.value })}
                        min={editingActionData.startDate || undefined}
                      />
                      {editingActionData.startDate && (
                        <button 
                          className="same-date-button"
                          onClick={() => setEditingActionData({ ...editingActionData, endDate: editingActionData.startDate })}
                          title="開始日と同じにする"
                          style={{
                            marginLeft: '4px',
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
                      <div className="edit-buttons-inline">
                        <button className="save-button-small" onClick={() => handleSaveAction(action.id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                        <button className="cancel-button-small" onClick={handleCancelEditAction}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span 
                      className={canEdit && !['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type) ? "editable-date" : ""}
                      onClick={canEdit && !['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type) ? () => handleEditAction(action) : undefined}
                      title={canEdit && !['妊娠期', '産褥期', '授乳期', '育児期', '復職期'].includes(action.type) ? "クリックして編集" : "期間設定モーダルで変更できます"}
                    >
                      {action.endDate}
                    </span>
                  )}
                </td>
                <td>
                  {editingActionRemarks === action.id ? (
                    <div className="edit-remarks-cell">
                      <input
                        type="text"
                        className="remarks-input-small"
                        value={editingActionRemarksData}
                        onChange={(e) => setEditingActionRemarksData(e.target.value)}
                        placeholder="備考を入力"
                        autoFocus
                      />
                      <div className="edit-buttons-inline">
                        <button className="save-button-small" onClick={() => handleSaveActionRemarks(action.id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                        <button className="cancel-button-small" onClick={handleCancelEditActionRemarks}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span 
                      className={`remarks-text ${canEdit ? 'editable-remarks' : ''}`}
                      onClick={canEdit ? () => handleEditActionRemarks(action) : undefined}
                      title={canEdit ? "クリックして編集" : ""}
                    >
                      {action.remarks || (canEdit ? 'クリックして編集' : '')}
                    </span>
                  )}
                </td>
                <td>
                  {canEdit && (
                    <div className="action-buttons-row">
                      <button 
                        className="add-sub-action-button"
                        onClick={() => handleAddSubActionClick(action.id)}
                        aria-label="サブアクション追加"
                        title="サブアクションを追加"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDelete(action.id)}
                        aria-label="削除"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>,
              ...(expandedRows.has(action.id) ? [
                ...(action.subActions && action.subActions.length > 0 ? action.subActions.flatMap((subAction, subActionIndex) => [
                  <tr 
                    key={`sub-${action.id}-${subAction.id}`} 
                    className={`sub-action-row ${subAction.status === 'completed' ? 'completed-row' : ''}`}
                    draggable={canEdit}
                    onDragStart={canEdit ? (e) => handleSubActionDragStart(e, action.id, subActionIndex) : undefined}
                    onDragOver={canEdit ? (e) => handleSubActionDragOver(e, action.id, subActionIndex) : undefined}
                    onDragLeave={canEdit ? handleSubActionDragLeave : undefined}
                    onDrop={canEdit ? (e) => handleSubActionDrop(e, action.id, subActionIndex) : undefined}
                    onDragEnd={canEdit ? (e) => {
                      e.target.style.opacity = '';
                      setDraggedSubAction(null);
                    } : undefined}
                  >
                    <td>
                      <div className="drag-handle" style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                        {(subAction.subActions && subAction.subActions.length > 0) || addingSubSubAction === `${action.id}-${subAction.id}` ? (
                          <button
                            className="expand-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubActionRow(action.id, subAction.id);
                            }}
                            aria-label={expandedSubActions.has(`${action.id}-${subAction.id}`) ? '折りたたむ' : '展開'}
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
                                transform: expandedSubActions.has(`${action.id}-${subAction.id}`) ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                              }}
                            >
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        ) : (
                          <span className="expand-button-placeholder" style={{ marginLeft: '-10px', marginRight: '0' }}></span>
                        )}
                        <button
                          className={`status-checkbox ${subAction.status === 'completed' ? 'checked' : ''} ${subAction.status === 'in-progress' ? 'in-progress' : ''}`}
                          onClick={canEdit ? (e) => {
                            e.stopPropagation();
                            handleToggleSubActionComplete(action.id, subAction.id);
                          } : undefined}
                          aria-label={
                            subAction.status === 'pending' ? '未着手→着手' : 
                            subAction.status === 'in-progress' ? '着手→完了' : 
                            '完了→未着手'
                          }
                          title={canEdit ? (
                            subAction.status === 'pending' ? '未着手→着手' : 
                            subAction.status === 'in-progress' ? '着手→完了' : 
                            '完了→未着手'
                          ) : ''}
                          disabled={!canEdit}
                          style={{ 
                            background: subAction.status === 'in-progress' ? '#3b82f6' : subAction.status === 'completed' ? '#10b981' : 'none', 
                            border: `2px solid ${subAction.status === 'in-progress' ? '#3b82f6' : subAction.status === 'completed' ? '#10b981' : '#ccc'}`, 
                            borderRadius: '4px', 
                            width: '20px', 
                            height: '20px', 
                            cursor: canEdit ? 'pointer' : 'default',
                            opacity: canEdit ? 1 : 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          {subAction.status === 'in-progress' && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <circle cx="12" cy="12" r="10"></circle>
                            </svg>
                          )}
                          {subAction.status === 'completed' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </button>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="9" cy="12" r="1"></circle>
                          <circle cx="9" cy="5" r="1"></circle>
                          <circle cx="9" cy="19" r="1"></circle>
                          <circle cx="15" cy="12" r="1"></circle>
                          <circle cx="15" cy="5" r="1"></circle>
                          <circle cx="15" cy="19" r="1"></circle>
                        </svg>
                        {action.number}-{subActionIndex + 1}
                      </div>
                    </td>
                    <td>
                      <span className="sub-action-indicator">└</span>
                      {editingSubActionType === `${action.id}-${subAction.id}` ? (
                        <div className="edit-type-cell">
                          <select
                            className="type-select"
                            value={editingSubActionTypeData}
                            onChange={(e) => setEditingSubActionTypeData(e.target.value)}
                          >
                            <option value="診察">診察</option>
                            <option value="申請">申請</option>
                            <option value="報告">報告</option>
                            <option value="その他">その他</option>
                          </select>
                          <div className="edit-buttons-inline">
                            <button className="save-button-small" onClick={() => handleSaveSubActionType(action.id, subAction.id)}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>
                            <button className="cancel-button-small" onClick={handleCancelEditSubActionType}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span 
                          className={`type-badge ${canEdit ? 'editable-type' : ''}`}
                          style={{ backgroundColor: getTypeColor(subAction.type || '診察') }}
                          onClick={canEdit ? () => handleEditSubActionType(action.id, subAction) : undefined}
                          title={canEdit ? "クリックして編集" : ""}
                        >
                          {subAction.type || '診察'}
                        </span>
                      )}
                    </td>
                    <td>{subAction.actionName}</td>
                    <td>
                      {editingSubAction === `${action.id}-${subAction.id}` ? (
                        <div className="edit-date-cell">
                          <input
                            type="date"
                            className="date-input-small"
                            value={editingSubActionData.startDate}
                            onChange={(e) => setEditingSubActionData({ ...editingSubActionData, startDate: e.target.value })}
                          />
                          <div className="edit-buttons-inline">
                            <button className="save-button-small" onClick={() => handleSaveSubActionEdit(action.id, subAction.id)}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>
                            <button className="cancel-button-small" onClick={handleCancelEditSubAction}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span 
                          className={canEdit ? "editable-date" : ""}
                          onClick={canEdit ? () => handleEditSubAction(action.id, subAction) : undefined}
                          title={canEdit ? "クリックして編集" : ""}
                        >
                          {subAction.startDate}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingSubAction === `${action.id}-${subAction.id}` ? (
                        <div className="edit-date-cell">
                          <input
                            type="date"
                            className="date-input-small"
                            value={editingSubActionData.endDate}
                            onChange={(e) => setEditingSubActionData({ ...editingSubActionData, endDate: e.target.value })}
                            min={editingSubActionData.startDate || undefined}
                          />
                          {editingSubActionData.startDate && (
                            <button 
                              className="same-date-button"
                              onClick={() => setEditingSubActionData({ ...editingSubActionData, endDate: editingSubActionData.startDate })}
                              title="開始日と同じにする"
                              style={{
                                marginLeft: '4px',
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
                          <div className="edit-buttons-inline">
                            <button className="save-button-small" onClick={() => handleSaveSubActionEdit(action.id, subAction.id)}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>
                            <button className="cancel-button-small" onClick={handleCancelEditSubAction}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span 
                          className={canEdit ? "editable-date" : ""}
                          onClick={canEdit ? () => handleEditSubAction(action.id, subAction) : undefined}
                          title={canEdit ? "クリックして編集" : ""}
                        >
                          {subAction.endDate}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingSubActionRemarks === `${action.id}-${subAction.id}` ? (
                        <div className="edit-remarks-cell">
                          <input
                            type="text"
                            className="remarks-input-small"
                            value={editingSubActionRemarksData}
                            onChange={(e) => setEditingSubActionRemarksData(e.target.value)}
                            placeholder="備考を入力"
                            autoFocus
                          />
                          <div className="edit-buttons-inline">
                            <button className="save-button-small" onClick={() => handleSaveSubActionRemarks(action.id, subAction.id)}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>
                            <button className="cancel-button-small" onClick={handleCancelEditSubActionRemarks}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span 
                          className={`remarks-text ${canEdit ? 'editable-remarks' : ''}`}
                          onClick={canEdit ? () => handleEditSubActionRemarks(action.id, subAction) : undefined}
                          title={canEdit ? "クリックして編集" : ""}
                        >
                          {subAction.remarks || (canEdit ? 'クリックして編集' : '')}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons-row">
                        {canEdit && (
                          <>
                            {changingParentFor?.actionId === action.id && changingParentFor?.subActionId === subAction.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <select
                                  className="parent-select"
                                  value={action.id}
                                  onChange={(e) => {
                                    const newParentId = parseInt(e.target.value);
                                    if (newParentId !== action.id && onChangeSubActionParent) {
                                      // 新しい親アクションの行を展開
                                      if (!expandedRows.has(newParentId)) {
                                        setExpandedRows(prev => new Set([...prev, newParentId]));
                                      }
                                      onChangeSubActionParent(action.id, subAction.id, newParentId);
                                    }
                                    setChangingParentFor(null);
                                  }}
                                  autoFocus
                                  onBlur={() => setChangingParentFor(null)}
                                  style={{ fontSize: '12px', padding: '2px 4px' }}
                                >
                                  {actions.map(parentAction => (
                                    <option key={parentAction.id} value={parentAction.id}>
                                      {parentAction.number}. {parentAction.actionName}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  className="cancel-button-small"
                                  onClick={() => setChangingParentFor(null)}
                                  title="キャンセル"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  className="change-parent-button"
                                  onClick={() => setChangingParentFor({ actionId: action.id, subActionId: subAction.id })}
                                  aria-label="親アクション変更"
                                  title="親アクションを変更"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                  </svg>
                                </button>
                                <button
                                  className="add-sub-action-button"
                                  onClick={() => handleAddSubSubActionClick(action.id, subAction.id)}
                                  aria-label="サブサブアクション追加"
                                  title="サブサブアクションを追加"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                  </svg>
                                </button>
                                <button 
                                  className="delete-button"
                                  onClick={() => onDeleteSubAction(action.id, subAction.id)}
                                  aria-label="サブアクション削除"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                  </svg>
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>,
                  ...(expandedSubActions.has(`${action.id}-${subAction.id}`) ? [
                    ...(subAction.subActions && subAction.subActions.length > 0 ? subAction.subActions.map((subSubAction, subSubActionIndex) => (
                      <tr key={`subsub-${action.id}-${subAction.id}-${subSubAction.id}`} className={`sub-sub-action-row ${subSubAction.status === 'completed' ? 'completed-row' : ''}`}>
                        <td>
                          <div className="drag-handle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              className={`status-checkbox ${subSubAction.status === 'completed' ? 'checked' : ''} ${subSubAction.status === 'in-progress' ? 'in-progress' : ''}`}
                              onClick={canEdit ? (e) => {
                                e.stopPropagation();
                                handleToggleSubSubActionComplete(action.id, subAction.id, subSubAction.id);
                              } : undefined}
                              aria-label={
                                subSubAction.status === 'pending' ? '未着手→着手' : 
                                subSubAction.status === 'in-progress' ? '着手→完了' : 
                                '完了→未着手'
                              }
                              title={canEdit ? (
                                subSubAction.status === 'pending' ? '未着手→着手' : 
                                subSubAction.status === 'in-progress' ? '着手→完了' : 
                                '完了→未着手'
                              ) : ''}
                              disabled={!canEdit}
                              style={{ 
                                background: subSubAction.status === 'in-progress' ? '#3b82f6' : subSubAction.status === 'completed' ? '#10b981' : 'none',
                                border: `2px solid ${subSubAction.status === 'in-progress' ? '#3b82f6' : subSubAction.status === 'completed' ? '#10b981' : '#ccc'}`, 
                                borderRadius: '4px', 
                                width: '20px', 
                                height: '20px', 
                                cursor: canEdit ? 'pointer' : 'default',
                                opacity: canEdit ? 1 : 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0
                              }}
                            >
                              {subSubAction.status === 'in-progress' && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                  <circle cx="12" cy="12" r="10"></circle>
                                </svg>
                              )}
                              {subSubAction.status === 'completed' && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </button>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="9" cy="12" r="1"></circle>
                              <circle cx="9" cy="5" r="1"></circle>
                              <circle cx="9" cy="19" r="1"></circle>
                              <circle cx="15" cy="12" r="1"></circle>
                              <circle cx="15" cy="5" r="1"></circle>
                              <circle cx="15" cy="19" r="1"></circle>
                            </svg>
                            {action.number}-{subActionIndex + 1}-{subSubActionIndex + 1}
                          </div>
                        </td>
                        <td>
                          <span className="sub-action-indicator">└└</span>
                          <span 
                            className="type-badge editable-type" 
                            style={{ backgroundColor: getTypeColor(subSubAction.type || '診察') }}
                            title="種別"
                          >
                            {subSubAction.type || '診察'}
                          </span>
                        </td>
                        <td>{subSubAction.actionName}</td>
                        <td>{subSubAction.startDate}</td>
                        <td>{subSubAction.endDate}</td>
                        <td>
                          <span className="remarks-text" title={subSubAction.remarks}>
                            {subSubAction.remarks || '-'}
                          </span>
                        </td>
                        <td>
                          {canEdit && (
                            <button 
                              className="delete-button"
                              onClick={() => onDeleteSubSubAction(action.id, subAction.id, subSubAction.id)}
                              aria-label="サブサブアクション削除"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    )) : []),
                    ...(addingSubSubAction === `${action.id}-${subAction.id}` ? [
                      <tr key={`add-subsub-${action.id}-${subAction.id}`} className="add-sub-sub-action-row">
                        <td>
                          <div className="drag-handle" style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                            <span className="expand-button-placeholder" style={{ marginLeft: '-10px', marginRight: '0' }}></span>
                            <span className="sub-action-indicator">└└</span>
                          </div>
                        </td>
                        <td>
                          <span className="sub-action-indicator"></span>
                          <select
                            className="type-select"
                            value={newSubSubAction.type}
                            onChange={(e) => setNewSubSubAction({ ...newSubSubAction, type: e.target.value })}
                          >
                            <option value="診察">診察</option>
                            <option value="申請">申請</option>
                            <option value="報告">報告</option>
                            <option value="その他">その他</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="action-name-input"
                            value={newSubSubAction.actionName}
                            onChange={(e) => setNewSubSubAction({ ...newSubSubAction, actionName: e.target.value })}
                            placeholder="サブサブアクション名を入力"
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            className="date-input"
                            value={newSubSubAction.startDate}
                            onChange={(e) => setNewSubSubAction({ ...newSubSubAction, startDate: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            className="date-input"
                            value={newSubSubAction.endDate}
                            onChange={(e) => setNewSubSubAction({ ...newSubSubAction, endDate: e.target.value })}
                            min={newSubSubAction.startDate || undefined}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="remarks-input"
                            value={newSubSubAction.remarks}
                            onChange={(e) => setNewSubSubAction({ ...newSubSubAction, remarks: e.target.value })}
                            placeholder="備考を入力"
                          />
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="save-button" onClick={() => handleSaveSubSubAction(action.id, subAction.id)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>
                            <button className="cancel-button" onClick={handleCancelSubSubAction}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ] : [])
                  ] : [])
                ]) : []),
                ...(addingSubAction === action.id ? [
                  <tr key={`add-sub-${action.id}`} className="add-sub-action-row">
                    <td>
                      <div className="drag-handle" style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                        <span className="expand-button-placeholder" style={{ marginLeft: '-10px', marginRight: '0' }}></span>
                        <span className="sub-action-indicator">└</span>
                      </div>
                    </td>
                    <td>
                      <span className="sub-action-indicator"></span>
                      <select
                        className="type-select"
                        value={newSubAction.type}
                        onChange={(e) => setNewSubAction({ ...newSubAction, type: e.target.value })}
                      >
                        <option value="申請">申請</option>
                        <option value="申請準備">申請準備</option>
                        <option value="MTG">MTG</option>
                        <option value="その他">その他</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="action-name-input"
                        value={newSubAction.actionName}
                        onChange={(e) => setNewSubAction({ ...newSubAction, actionName: e.target.value })}
                        placeholder="サブアクション名を入力"
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="date-input"
                        value={newSubAction.startDate}
                        onChange={(e) => setNewSubAction({ ...newSubAction, startDate: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="date-input"
                        value={newSubAction.endDate}
                        onChange={(e) => setNewSubAction({ ...newSubAction, endDate: e.target.value })}
                        min={newSubAction.startDate || undefined}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="remarks-input"
                        value={newSubAction.remarks}
                        onChange={(e) => setNewSubAction({ ...newSubAction, remarks: e.target.value })}
                        placeholder="備考を入力"
                      />
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="save-button" onClick={() => handleSaveSubAction(action.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                        <button className="cancel-button" onClick={handleCancelSubAction}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ] : [])
              ] : [])
            ];
    });
  };

  return (
    <div className="action-table-container">
      {/* 未着手のアクション */}
      <div className="action-section">
        <div className="table-header-controls">
          {isFilterActive && (
            <div className="active-filters">
              <span className="active-filters-label">表示中:</span>
              <div className="active-filters-badges">
                {selectedTypesList.map(type => (
                  <span key={type} className="active-filter-badge">
                    {type}
                  </span>
                ))}
              </div>
              {onClearFilter && (
                <button 
                  className="clear-filter-button"
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
          <div className="table-header-buttons">
            <button 
              className={`toggle-completed-button ${showCompleted ? 'active' : ''}`}
              onClick={onToggleShowCompleted}
              title={showCompleted ? '完了アクションを非表示' : '完了アクションを表示'}
            >
              {showCompleted ? '完了を非表示' : '完了を表示'}
            </button>
            <button 
              className={`type-filter-button ${showTypeFilter ? 'active' : ''}`}
              onClick={onToggleTypeFilter}
              title="表示する種別を選択"
            >
              種別フィルタ
            </button>
            {canEdit && (
              <button className="add-button" onClick={() => {
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
              }}>
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
        
        <table className="action-table">
          <thead>
            <tr>
              <th>番号</th>
              <th>種別</th>
              <th>アクション名</th>
              <th>実施期間（開始）</th>
              <th>実施期間（終了）</th>
              <th>備考</th>
              <th 
                className="operation-header" 
                onClick={canEdit ? onDeleteAll : undefined}
                style={{ cursor: canEdit ? 'pointer' : 'default', userSelect: 'none' }}
                title={canEdit ? "クリックしてすべてのアクションを削除" : ""}
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {allActions.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  アクションがありません
                </td>
              </tr>
            ) : (
              renderActionRows(allActions)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActionTable;

