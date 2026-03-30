import { useState, useMemo } from 'react';
import './ActionCalendar.css';

const ActionCalendar = ({ 
  actions, 
  onUpdateAction, 
  onAdd, 
  onAddSubAction, 
  onAddSubSubAction,
  onDeleteSubAction,
  onDeleteSubSubAction,
  isSharedMember,
  permission,
  showCompleted,
  onToggleShowCompleted,
  selectedTypes,
  onToggleType,
  onClearFilter,
  showTypeFilter,
  onToggleTypeFilter,
  dueDate,
  calculatePeriodDates
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null); // {year, month} の形式
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'
  const [dateViewRange, setDateViewRange] = useState('day'); // 'day' | 'week' | 'month' - 日付選択時の表示範囲
  const [expandedSubActions, setExpandedSubActions] = useState(new Set()); // 展開されたサブアクションのID
  const [editingSubActionDates, setEditingSubActionDates] = useState(null); // 編集中のサブアクションID
  const [editingSubActionDatesData, setEditingSubActionDatesData] = useState({ actionName: '', startDate: '', endDate: '', remarks: '' });
  const [editingSubSubActionDates, setEditingSubSubActionDates] = useState(null); // 編集中のサブサブアクションID
  const [editingSubSubActionDatesData, setEditingSubSubActionDatesData] = useState({ actionName: '', startDate: '', endDate: '', remarks: '' });
  const [addingSubAction, setAddingSubAction] = useState(null); // 追加中のサブアクションの親アクションID
  const [addingSubSubAction, setAddingSubSubAction] = useState(null); // 追加中のサブサブアクションのキー（parentActionId-subActionId）
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

  // 現在の月の最初の日と最後の日を取得
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay(); // 0 (日曜日) から 6 (土曜日)

  // カレンダーの日付配列を生成
  const calendarDays = useMemo(() => {
    const days = [];
    
    // 前月の日付を追加（カレンダーの最初の週を埋めるため）
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // 今月の日付を追加
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }
    
    // 来月の日付を追加（カレンダーの最後の週を埋めるため）
    const remainingDays = 42 - days.length; // 6週間 × 7日 = 42日
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }
    
    return days;
  }, [year, month, firstDayOfWeek, lastDay]);

  // アクションを日付ごとにグループ化（サブアクション以下のみ）
  const actionsByDate = useMemo(() => {
    const grouped = {};
    
    const processAction = (action, parentPath = '', level = 0) => {
      const actionPath = parentPath ? `${parentPath} > ${action.actionName}` : action.actionName;
      
      // サブアクション以下（level >= 1）のみをプロット
      if (level >= 1) {
        // サブアクションのフィルタリング
        if (!showCompleted && action.status === 'completed') {
          // 完了済みはスキップ（ただし、サブサブアクションは処理する）
        } else if (!selectedTypes.has(action.type)) {
          // 選択されていない種別はスキップ（ただし、サブサブアクションは処理する）
        } else {
          // アクションの開始日と終了日を取得
          let startDate = null;
          let endDate = null;
          
          if (action.startDate) {
            // startDateが文字列形式（YYYY-MM-DD）の場合
            if (typeof action.startDate === 'string') {
              startDate = new Date(action.startDate + 'T00:00:00');
            } else {
              startDate = new Date(action.startDate);
            }
          }
          
          if (action.endDate) {
            // endDateが文字列形式（YYYY-MM-DD）の場合
            if (typeof action.endDate === 'string') {
              endDate = new Date(action.endDate + 'T00:00:00');
            } else {
              endDate = new Date(action.endDate);
            }
          }
          
          if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            // 期間内の各日付にアクションを追加
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              const dateKey = currentDate.toISOString().split('T')[0];
              if (!grouped[dateKey]) {
                grouped[dateKey] = [];
              }
              // 重複チェック（同じアクションが既に追加されているか）
              const exists = grouped[dateKey].some(a => a.id === action.id && a.displayPath === actionPath);
              if (!exists) {
                // 親アクションIDを取得（parentPathから親アクション名を取得し、actionsから親アクションを検索）
                let parentActionId = action.parentActionId;
                if (!parentActionId && parentPath) {
                  // parentPathから親アクション名を抽出（例: "妊娠期間"）
                  const parentName = parentPath.split(' > ')[0];
                  const parentAction = actions.find(a => a.actionName === parentName);
                  if (parentAction) {
                    parentActionId = parentAction.id;
                  }
                }
                
                grouped[dateKey].push({
                  ...action,
                  displayPath: actionPath,
                  level: level,
                  parentActionId: parentActionId || action.parentActionId
                });
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        }
      }
      
      // サブアクションを処理（親アクションから再帰的に処理）
      // フィルタリングに関係なく、すべてのサブアクションを処理（サブサブアクションも含む）
      if (action.subActions && action.subActions.length > 0) {
        action.subActions.forEach(subAction => {
          processAction(subAction, actionPath, level + 1);
        });
      }
    };
    
    actions.forEach(action => {
      // フィルタリング（親アクションのフィルタリング）
      // 親アクションがフィルタリングされていても、サブアクションは処理する
      // （親アクション自体はプロットしないが、サブアクションを処理するために呼び出す）
      processAction(action);
    });
    
    return grouped;
  }, [actions, showCompleted, selectedTypes]);

  // 月を変更
  const changeMonth = (delta) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  // 年を変更
  const changeYear = (delta) => {
    setCurrentDate(new Date(year + delta, month, 1));
  };

  // 今日に戻る
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 日付をクリック
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedMonth(null); // 日付選択時は月選択をクリア
    setDateViewRange('day'); // デフォルトは日表示
  };

  const handleMonthClick = (year, month) => {
    setSelectedMonth({ year, month });
    setSelectedDate(null); // 月選択時は日付選択をクリア
  };

  // 日付のアクション数を取得
  const getActionCount = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    return actionsByDate[dateKey]?.length || 0;
  };

  // 日付のアクションリストを取得
  const getActionsForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    return actionsByDate[dateKey] || [];
  };


  // 日付が今日かどうか
  const isToday = (date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  // 日付が選択されているかどうか
  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.getFullYear() === selectedDate.getFullYear() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getDate() === selectedDate.getDate();
  };

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // 12ヶ月分のカレンダーデータを生成
  const yearCalendarMonths = useMemo(() => {
    const months = [];
    const baseYear = currentDate.getFullYear();
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(baseYear, m, 1);
      const monthFirstDay = new Date(baseYear, m, 1);
      const monthLastDay = new Date(baseYear, m + 1, 0);
      const monthFirstDayOfWeek = monthFirstDay.getDay();
      
      const days = [];
      
      // 前月の日付を追加
      const prevMonthLastDay = new Date(baseYear, m, 0).getDate();
      for (let i = monthFirstDayOfWeek - 1; i >= 0; i--) {
        days.push({
          date: new Date(baseYear, m - 1, prevMonthLastDay - i),
          isCurrentMonth: false
        });
      }
      
      // 今月の日付を追加
      for (let day = 1; day <= monthLastDay.getDate(); day++) {
        days.push({
          date: new Date(baseYear, m, day),
          isCurrentMonth: true
        });
      }
      
      // 来月の日付を追加
      const remainingDays = 42 - days.length;
      for (let day = 1; day <= remainingDays; day++) {
        days.push({
          date: new Date(baseYear, m + 1, day),
          isCurrentMonth: false
        });
      }
      
      months.push({
        year: baseYear,
        month: m,
        days: days
      });
    }
    return months;
  }, [currentDate]);

  return (
    <div className="action-calendar">
      <div className="calendar-header">
        {viewMode === 'month' ? (
          <>
            <button className="calendar-nav-button" onClick={() => changeMonth(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h2 
              className="calendar-month-year calendar-month-year-clickable"
              onClick={() => handleMonthClick(year, month)}
              title="クリックして月のアクションを表示"
            >
              {year}年{monthNames[month]}
            </h2>
            <button className="calendar-nav-button" onClick={() => changeMonth(1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        ) : (
          <>
            <button className="calendar-nav-button" onClick={() => changeYear(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h2 className="calendar-month-year">
              {year}年
            </h2>
            <button className="calendar-nav-button" onClick={() => changeYear(1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}
        <div className="calendar-header-actions">
          <button className="calendar-view-toggle" onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}>
            {viewMode === 'month' ? '12ヶ月表示' : '1ヶ月表示'}
          </button>
          <button className="calendar-today-button" onClick={goToToday}>
            今日
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="calendar-grid">
          {/* 曜日ヘッダー */}
          <div className="calendar-weekdays">
            {weekDays.map(day => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>

          {/* カレンダーの日付 */}
          <div className="calendar-days">
            {calendarDays.map((day, index) => {
              const actionCount = getActionCount(day.date);
              const dayActions = getActionsForDate(day.date);
              const isCurrentDay = isToday(day.date);
              const isSelectedDay = isSelected(day.date);
              const maxDisplayActions = 2; // 表示するアクションの最大数
              const displayActions = dayActions.slice(0, maxDisplayActions);
              const remainingCount = actionCount - maxDisplayActions;
              
              return (
                <div
                  key={index}
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''} ${isSelectedDay ? 'selected' : ''} ${actionCount > 0 ? 'has-actions' : ''}`}
                  onClick={() => handleDateClick(day.date)}
                >
                  <div className="calendar-day-number">
                    {day.date.getDate()}
                  </div>
                  {actionCount > 0 && (
                    <div className="calendar-day-actions">
                      {displayActions.map((action, actionIndex) => {
                        const displayName = action.displayPath || action.actionName;
                        const shortName = displayName.length > 8 ? displayName.substring(0, 8) + '...' : displayName;
                        return (
                          <div key={actionIndex} className="calendar-day-action-item" title={displayName}>
                            <span 
                              className="calendar-day-action-type"
                              style={{
                                backgroundColor: action.type === '診察' ? '#dbeafe' :
                                                action.type === '申請' ? '#d1fae5' :
                                                action.type === '報告' ? '#fed7aa' :
                                                '#e5e7eb'
                              }}
                            >
                              {action.type}
                            </span>
                            <span className="calendar-day-action-name">{shortName}</span>
                          </div>
                        );
                      })}
                      {remainingCount > 0 && (
                        <div className="calendar-day-action-more">
                          +{remainingCount}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="calendar-year-view">
          {yearCalendarMonths.map((monthData, monthIndex) => (
            <div key={monthIndex} className="calendar-month-card">
              <h3 className="calendar-month-title">{monthData.year}年{monthNames[monthData.month]}</h3>
              <div className="calendar-grid-small">
                {/* 曜日ヘッダー */}
                <div className="calendar-weekdays-small">
                  {weekDays.map(day => (
                    <div key={day} className="calendar-weekday-small">
                      {day}
                    </div>
                  ))}
                </div>

                {/* カレンダーの日付 */}
                <div className="calendar-days-small">
                  {monthData.days.map((day, index) => {
                    const actionCount = getActionCount(day.date);
                    const dayActions = getActionsForDate(day.date);
                    const isCurrentDay = isToday(day.date);
                    const maxDisplayActions = 1; // 12ヶ月表示では1つだけ表示
                    const displayActions = dayActions.slice(0, maxDisplayActions);
                    const remainingCount = actionCount - maxDisplayActions;
                    
                    return (
                      <div
                        key={index}
                        className={`calendar-day-small ${!day.isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''} ${actionCount > 0 ? 'has-actions' : ''}`}
                        onClick={() => {
                          setCurrentDate(day.date);
                          setViewMode('month');
                          handleDateClick(day.date);
                        }}
                        title={day.isCurrentMonth ? `${monthData.year}年${monthData.month + 1}月${day.date.getDate()}日` : ''}
                      >
                        <div className="calendar-day-number-small">
                          {day.date.getDate()}
                        </div>
                        {actionCount > 0 && (
                          <div className="calendar-day-actions-small">
                            {displayActions.map((action, actionIndex) => {
                              const displayName = action.displayPath || action.actionName;
                              const shortName = displayName.length > 4 ? displayName.substring(0, 4) + '...' : displayName;
                              return (
                                <div key={actionIndex} className="calendar-day-action-item-small" title={displayName}>
                                  <span 
                                    className="calendar-day-action-type-small"
                                    style={{
                                      backgroundColor: action.type === '診察' ? '#dbeafe' :
                                                      action.type === '申請' ? '#d1fae5' :
                                                      action.type === '報告' ? '#fed7aa' :
                                                      '#e5e7eb'
                                    }}
                                  >
                                    {action.type}
                                  </span>
                                  <span className="calendar-day-action-name-small">{shortName}</span>
                                </div>
                              );
                            })}
                            {remainingCount > 0 && (
                              <div className="calendar-day-action-more-small">
                                +{remainingCount}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 選択された日付または月のアクション一覧 */}
      {(selectedDate || selectedMonth) && (
        <div className="calendar-actions-list">
          <div className="calendar-actions-header">
            <h3>
              {selectedDate 
                ? (() => {
                    if (dateViewRange === 'day') {
                      return `${selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}のアクション`;
                    } else if (dateViewRange === 'week') {
                      const selected = new Date(selectedDate);
                      const dayOfWeek = selected.getDay();
                      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                      const monday = new Date(selected);
                      monday.setDate(selected.getDate() + mondayOffset);
                      const sunday = new Date(monday);
                      sunday.setDate(monday.getDate() + 6);
                      return `${monday.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}～${sunday.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}のアクション`;
                    } else {
                      return `${selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}のアクション`;
                    }
                  })()
                : `${selectedMonth.year}年${monthNames[selectedMonth.month]}のアクション`
              }
            </h3>
            {selectedDate && (
              <div className="calendar-view-range-buttons">
                <button
                  className={`calendar-view-range-button ${dateViewRange === 'day' ? 'active' : ''}`}
                  onClick={() => setDateViewRange('day')}
                >
                  日
                </button>
                <button
                  className={`calendar-view-range-button ${dateViewRange === 'week' ? 'active' : ''}`}
                  onClick={() => setDateViewRange('week')}
                >
                  週
                </button>
                <button
                  className={`calendar-view-range-button ${dateViewRange === 'month' ? 'active' : ''}`}
                  onClick={() => setDateViewRange('month')}
                >
                  月
                </button>
              </div>
            )}
            <button className="calendar-close-button" onClick={() => {
              setSelectedDate(null);
              setSelectedMonth(null);
            }}>
              ×
            </button>
          </div>
          <div className="calendar-actions-content">
            {(() => {
              let dayActions = [];
              
              if (selectedDate) {
                // 日付選択の場合
                if (dateViewRange === 'day') {
                  // 日表示
                  const dateKey = selectedDate.toISOString().split('T')[0];
                  dayActions = actionsByDate[dateKey] || [];
                } else if (dateViewRange === 'week') {
                  // 週表示（選択日を含む週の月曜日から日曜日まで）
                  const selected = new Date(selectedDate);
                  const dayOfWeek = selected.getDay(); // 0 (日) から 6 (土)
                  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 月曜日までのオフセット
                  const monday = new Date(selected);
                  monday.setDate(selected.getDate() + mondayOffset);
                  
                  const weekActions = [];
                  for (let i = 0; i < 7; i++) {
                    const weekDate = new Date(monday);
                    weekDate.setDate(monday.getDate() + i);
                    const dateKey = weekDate.toISOString().split('T')[0];
                    const actionsForDay = actionsByDate[dateKey] || [];
                    weekActions.push(...actionsForDay);
                  }
                  
                  // 重複を除去
                  const uniqueActions = new Map();
                  weekActions.forEach(action => {
                    const key = `${action.parentActionId}-${action.id}`;
                    if (!uniqueActions.has(key)) {
                      uniqueActions.set(key, action);
                    }
                  });
                  dayActions = Array.from(uniqueActions.values());
                } else if (dateViewRange === 'month') {
                  // 月表示（選択日を含む月）
                  const selected = new Date(selectedDate);
                  const year = selected.getFullYear();
                  const month = selected.getMonth();
                  const monthEnd = new Date(year, month + 1, 0);
                  
                  const monthActions = [];
                  for (let day = 1; day <= monthEnd.getDate(); day++) {
                    const date = new Date(year, month, day);
                    const dateKey = date.toISOString().split('T')[0];
                    const actionsForDay = actionsByDate[dateKey] || [];
                    monthActions.push(...actionsForDay);
                  }
                  
                  // 重複を除去
                  const uniqueActions = new Map();
                  monthActions.forEach(action => {
                    const key = `${action.parentActionId}-${action.id}`;
                    if (!uniqueActions.has(key)) {
                      uniqueActions.set(key, action);
                    }
                  });
                  dayActions = Array.from(uniqueActions.values());
                }
              } else if (selectedMonth) {
                // 月選択の場合
                const { year, month } = selectedMonth;
                const monthEnd = new Date(year, month + 1, 0);
                
                // その月のすべてのアクションを収集
                const monthActions = [];
                for (let day = 1; day <= monthEnd.getDate(); day++) {
                  const date = new Date(year, month, day);
                  const dateKey = date.toISOString().split('T')[0];
                  const actionsForDay = actionsByDate[dateKey] || [];
                  monthActions.push(...actionsForDay);
                }
                
                // 重複を除去（同じアクションが複数の日に表示される可能性があるため）
                const uniqueActions = new Map();
                monthActions.forEach(action => {
                  const key = `${action.parentActionId}-${action.id}`;
                  if (!uniqueActions.has(key)) {
                    uniqueActions.set(key, action);
                  }
                });
                dayActions = Array.from(uniqueActions.values());
              }
              
              if (dayActions.length === 0) {
                return <p className="calendar-no-actions">
                  {selectedDate 
                    ? (dateViewRange === 'day' ? 'この日にアクションはありません' : 
                       dateViewRange === 'week' ? 'この週にアクションはありません' : 
                       'この月にアクションはありません')
                    : 'この月にアクションはありません'}
                </p>;
              }
              
              // 親アクションでグループ化
              const groupedByParent = {};
              dayActions.forEach(action => {
                const parentId = action.parentActionId || 'no-parent';
                const parentIdKey = String(parentId);
                
                if (!groupedByParent[parentIdKey]) {
                  // 親アクションを取得（IDの型を考慮）
                  const parentAction = actions.find(a => {
                  const aId = String(a.id);
                  const pId = String(parentId);
                  return aId === pId;
                });
                  groupedByParent[parentIdKey] = {
                    parentAction: parentAction || null,
                    subActions: []
                  };
                }
                groupedByParent[parentIdKey].subActions.push(action);
              });
              
              // 日付フォーマット関数
              const formatDate = (date) => {
                if (!date) return '';
                if (typeof date === 'string') {
                  return date;
                }
                const d = new Date(date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              };

              // サブアクションの編集ハンドラー
              const handleEditSubActionDates = (parentActionId, subAction) => {
                setEditingSubActionDates(`${parentActionId}-${subAction.id}`);
                setEditingSubActionDatesData({
                  actionName: subAction.actionName || '',
                  startDate: formatDate(subAction.startDate),
                  endDate: formatDate(subAction.endDate),
                  remarks: subAction.remarks || ''
                });
              };

              const handleSaveSubActionDates = (parentActionId, subActionId) => {
                const parentAction = actions.find(a => {
                  const aId = String(a.id);
                  const pId = String(parentActionId);
                  return aId === pId;
                });
                if (!parentAction) return;

                const updatedSubActions = parentAction.subActions.map(sa =>
                  sa.id === subActionId
                    ? { 
                        ...sa, 
                        actionName: editingSubActionDatesData.actionName,
                        startDate: editingSubActionDatesData.startDate, 
                        endDate: editingSubActionDatesData.endDate,
                        remarks: editingSubActionDatesData.remarks
                      }
                    : sa
                );

                if (onUpdateAction) {
                  onUpdateAction({
                    ...parentAction,
                    subActions: updatedSubActions
                  });
                }
                setEditingSubActionDates(null);
                setEditingSubActionDatesData({ actionName: '', startDate: '', endDate: '', remarks: '' });
              };

              const handleCancelSubActionDates = () => {
                setEditingSubActionDates(null);
                setEditingSubActionDatesData({ actionName: '', startDate: '', endDate: '', remarks: '' });
              };

              // サブサブアクションの編集ハンドラー
              const handleEditSubSubActionDates = (parentActionId, subActionId, subSubAction) => {
                setEditingSubSubActionDates(`${parentActionId}-${subActionId}-${subSubAction.id}`);
                setEditingSubSubActionDatesData({
                  actionName: subSubAction.actionName || '',
                  startDate: formatDate(subSubAction.startDate),
                  endDate: formatDate(subSubAction.endDate),
                  remarks: subSubAction.remarks || ''
                });
              };

              const handleSaveSubSubActionDates = (parentActionId, subActionId, subSubActionId) => {
                const parentAction = actions.find(a => {
                  const aId = String(a.id);
                  const pId = String(parentActionId);
                  return aId === pId;
                });
                if (!parentAction) return;

                const updatedSubActions = parentAction.subActions.map(sa => {
                  if (sa.id === subActionId) {
                    const updatedSubSubActions = sa.subActions ? sa.subActions.map(ssa =>
                      ssa.id === subSubActionId
                        ? { 
                            ...ssa, 
                            actionName: editingSubSubActionDatesData.actionName,
                            startDate: editingSubSubActionDatesData.startDate, 
                            endDate: editingSubSubActionDatesData.endDate,
                            remarks: editingSubSubActionDatesData.remarks
                          }
                        : ssa
                    ) : [];
                    return { ...sa, subActions: updatedSubSubActions };
                  }
                  return sa;
                });

                if (onUpdateAction) {
                  onUpdateAction({
                    ...parentAction,
                    subActions: updatedSubActions
                  });
                }
                setEditingSubSubActionDates(null);
                setEditingSubSubActionDatesData({ actionName: '', startDate: '', endDate: '', remarks: '' });
              };

              const handleCancelSubSubActionDates = () => {
                setEditingSubSubActionDates(null);
                setEditingSubSubActionDatesData({ actionName: '', startDate: '', endDate: '', remarks: '' });
              };

              // サブアクションのステータス切り替え
              const handleToggleSubActionStatus = (parentActionId, subActionId) => {
                const parentAction = actions.find(a => {
                  const aId = String(a.id);
                  const pId = String(parentActionId);
                  return aId === pId;
                });
                if (!parentAction || !parentAction.subActions) return;

                const subAction = parentAction.subActions.find(sa => sa.id === subActionId);
                if (!subAction) return;

                let newStatus;
                if (subAction.status === 'pending' || subAction.status === 'none') {
                  newStatus = 'in-progress';
                } else if (subAction.status === 'in-progress') {
                  newStatus = 'completed';
                } else {
                  newStatus = 'pending';
                }

                const updatedSubActions = parentAction.subActions.map(sa => {
                  if (sa.id === subActionId) {
                    return { 
                      ...sa, 
                      status: newStatus,
                      subActions: sa.subActions ? sa.subActions.map(ssa => ({ ...ssa })) : []
                    };
                  }
                  return { 
                    ...sa,
                    subActions: sa.subActions ? sa.subActions.map(ssa => ({ ...ssa })) : []
                  };
                });

                if (onUpdateAction) {
                  onUpdateAction({
                    ...parentAction,
                    status: parentAction.status,
                    subActions: updatedSubActions
                  });
                }
              };

              // サブサブアクションのステータス切り替え
              const handleToggleSubSubActionStatus = (parentActionId, subActionId, subSubActionId) => {
                const parentAction = actions.find(a => {
                  const aId = String(a.id);
                  const pId = String(parentActionId);
                  return aId === pId;
                });
                if (!parentAction || !parentAction.subActions) return;

                const subAction = parentAction.subActions.find(sa => sa.id === subActionId);
                if (!subAction || !subAction.subActions) return;

                const subSubAction = subAction.subActions.find(ssa => ssa.id === subSubActionId);
                if (!subSubAction) return;

                let newStatus;
                if (subSubAction.status === 'pending' || subSubAction.status === 'none') {
                  newStatus = 'in-progress';
                } else if (subSubAction.status === 'in-progress') {
                  newStatus = 'completed';
                } else {
                  newStatus = 'pending';
                }

                const updatedSubSubActions = subAction.subActions.map(ssa =>
                  ssa.id === subSubActionId ? { ...ssa, status: newStatus } : { ...ssa }
                );

                const updatedSubActions = parentAction.subActions.map(sa => {
                  if (sa.id === subActionId) {
                    return { 
                      ...sa, 
                      status: sa.status,
                      subActions: updatedSubSubActions 
                    };
                  }
                  return { 
                    ...sa,
                    subActions: sa.subActions ? sa.subActions.map(ssa => ({ ...ssa })) : []
                  };
                });

                if (onUpdateAction) {
                  onUpdateAction({
                    ...parentAction,
                    status: parentAction.status,
                    subActions: updatedSubActions
                  });
                }
              };

              // サブアクション追加ハンドラー
              const handleAddSubActionClick = (parentActionId) => {
                setAddingSubAction(parentActionId);
                setNewSubAction({
                  type: '診察',
                  actionName: '',
                  startDate: '',
                  endDate: '',
                  remarks: '',
                  status: 'pending'
                });
              };

              const handleSaveSubAction = (parentActionId) => {
                if (!newSubAction.actionName || !newSubAction.startDate || !newSubAction.endDate) {
                  alert('アクション名、開始日、終了日は必須です。');
                  return;
                }
                if (onAddSubAction) {
                  onAddSubAction(parentActionId, newSubAction);
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

              // サブサブアクション追加ハンドラー
              const handleAddSubSubActionClick = (parentActionId, subActionId) => {
                const key = `${parentActionId}-${subActionId}`;
                // サブアクションを展開状態にする
                const newExpanded = new Set(expandedSubActions);
                newExpanded.add(subActionId);
                setExpandedSubActions(newExpanded);
                // 追加フォームを表示
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

              const handleSaveSubSubAction = (parentActionId, subActionId) => {
                if (!newSubSubAction.actionName || !newSubSubAction.startDate || !newSubSubAction.endDate) {
                  alert('アクション名、開始日、終了日は必須です。');
                  return;
                }
                if (onAddSubSubAction) {
                  onAddSubSubAction(parentActionId, subActionId, newSubSubAction);
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

              // サブアクション備考編集ハンドラー
              const handleEditSubActionRemarks = (parentActionId, subActionId) => {
                const key = `${parentActionId}-${subActionId}`;
                const parentAction = actions.find(a => {
                  const aId = String(a.id);
                  const pId = String(parentActionId);
                  return aId === pId;
                });
                if (!parentAction || !parentAction.subActions) return;
                const subAction = parentAction.subActions.find(sa => sa.id === subActionId);
                if (!subAction) return;
                setEditingSubActionRemarks(key);
                setEditingSubActionRemarksData(subAction.remarks || '');
              };

              const handleSaveSubActionRemarks = (parentActionId, subActionId) => {
                const parentAction = actions.find(a => {
                  const aId = String(a.id);
                  const pId = String(parentActionId);
                  return aId === pId;
                });
                if (!parentAction || !parentAction.subActions) return;
                const subAction = parentAction.subActions.find(sa => sa.id === subActionId);
                if (!subAction) return;
                const updatedSubAction = {
                  ...subAction,
                  remarks: editingSubActionRemarksData
                };
                const updatedAction = {
                  ...parentAction,
                  subActions: parentAction.subActions.map(sa => 
                    sa.id === subActionId ? updatedSubAction : sa
                  )
                };
                if (onUpdateAction) {
                  onUpdateAction(updatedAction);
                }
                setEditingSubActionRemarks(null);
                setEditingSubActionRemarksData('');
              };

              const handleCancelSubActionRemarks = () => {
                setEditingSubActionRemarks(null);
                setEditingSubActionRemarksData('');
              };

              // サブサブアクション備考編集ハンドラー
              const handleEditSubSubActionRemarks = (parentActionId, subActionId, subSubActionId) => {
                const key = `${parentActionId}-${subActionId}-${subSubActionId}`;
                const parentAction = actions.find(a => {
                  const aId = String(a.id);
                  const pId = String(parentActionId);
                  return aId === pId;
                });
                if (!parentAction || !parentAction.subActions) return;
                const subAction = parentAction.subActions.find(sa => sa.id === subActionId);
                if (!subAction || !subAction.subActions) return;
                const subSubAction = subAction.subActions.find(ssa => ssa.id === subSubActionId);
                if (!subSubAction) return;
                setEditingSubSubActionRemarks(key);
                setEditingSubSubActionRemarksData(subSubAction.remarks || '');
              };

              const handleSaveSubSubActionRemarks = (parentActionId, subActionId, subSubActionId) => {
                const parentAction = actions.find(a => {
                  const aId = String(a.id);
                  const pId = String(parentActionId);
                  return aId === pId;
                });
                if (!parentAction || !parentAction.subActions) return;
                const subAction = parentAction.subActions.find(sa => sa.id === subActionId);
                if (!subAction || !subAction.subActions) return;
                const subSubAction = subAction.subActions.find(ssa => ssa.id === subSubActionId);
                if (!subSubAction) return;
                const updatedSubSubAction = {
                  ...subSubAction,
                  remarks: editingSubSubActionRemarksData
                };
                const updatedSubActions = subAction.subActions.map(ssa =>
                  ssa.id === subSubActionId ? updatedSubSubAction : ssa
                );
                const updatedAction = {
                  ...parentAction,
                  subActions: parentAction.subActions.map(sa => {
                    if (sa.id === subActionId) {
                      return { ...sa, subActions: updatedSubActions };
                    }
                    return sa;
                  })
                };
                if (onUpdateAction) {
                  onUpdateAction(updatedAction);
                }
                setEditingSubSubActionRemarks(null);
                setEditingSubSubActionRemarksData('');
              };

              const handleCancelSubSubActionRemarks = () => {
                setEditingSubSubActionRemarks(null);
                setEditingSubSubActionRemarksData('');
              };

              return (
                <ul className="calendar-actions-items">
                  {Object.values(groupedByParent).map((group, groupIndex) => {
                    const { parentAction, subActions } = group;
                    const parentName = parentAction ? parentAction.actionName : 'その他';
                    const parentActionId = parentAction ? parentAction.id : null;
                    
                    return (
                      <li key={groupIndex} className="calendar-action-group">
                        <div className="calendar-action-parent">
                          <div className="calendar-action-parent-name">{parentName}</div>
                          {(!isSharedMember || permission === 'editor') && (
                            <button
                              className="calendar-add-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddSubActionClick(parentActionId);
                              }}
                              aria-label="サブアクション追加"
                              title="サブアクションを追加"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </button>
                          )}
                        </div>
                        <ul className="calendar-action-sub-items">
                          {addingSubAction === parentActionId && (
                            <li className="calendar-action-item calendar-action-add-form">
                              <div className="calendar-add-form-content">
                                <div className="calendar-add-form-header">
                                  <h4 className="calendar-add-form-title">サブアクションを追加</h4>
                                  <div className="calendar-add-form-footer">
                                    <button
                                      className="calendar-add-form-cancel"
                                      onClick={handleCancelSubAction}
                                    >
                                      キャンセル
                                    </button>
                                    <button
                                      className="calendar-add-form-save"
                                      onClick={() => handleSaveSubAction(parentActionId)}
                                    >
                                      保存
                                    </button>
                                  </div>
                                </div>
                                <div className="calendar-add-form-body">
                                  <div className="calendar-add-form-row-inline">
                                    <div className="calendar-add-form-group-inline">
                                      <label className="calendar-add-form-label">
                                        タイプ<span className="required">*</span>
                                      </label>
                                      <select
                                        className="calendar-add-form-select"
                                        value={newSubAction.type}
                                        onChange={(e) => setNewSubAction({ ...newSubAction, type: e.target.value })}
                                      >
                                        <option value="診察">診察</option>
                                        <option value="申請">申請</option>
                                        <option value="報告">報告</option>
                                        <option value="その他">その他</option>
                                      </select>
                                    </div>
                                    <div className="calendar-add-form-group-inline calendar-add-form-group-flex">
                                      <label className="calendar-add-form-label">
                                        アクション名<span className="required">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        className="calendar-add-form-input"
                                        value={newSubAction.actionName}
                                        onChange={(e) => setNewSubAction({ ...newSubAction, actionName: e.target.value })}
                                        placeholder="アクション名を入力"
                                      />
                                    </div>
                                    <div className="calendar-add-form-group-inline">
                                      <label className="calendar-add-form-label">
                                        開始日<span className="required">*</span>
                                      </label>
                                      <input
                                        type="date"
                                        className="calendar-add-form-input"
                                        value={newSubAction.startDate}
                                        onChange={(e) => {
                                          const newStartDate = e.target.value;
                                          // 終了日が空または開始日より前の場合は、開始日と同じ日付を設定
                                          const shouldUpdateEndDate = !newSubAction.endDate || 
                                            (newSubAction.endDate && newSubAction.endDate < newStartDate);
                                          setNewSubAction({ 
                                            ...newSubAction, 
                                            startDate: newStartDate,
                                            endDate: shouldUpdateEndDate ? newStartDate : newSubAction.endDate
                                          });
                                        }}
                                      />
                                    </div>
                                    <div className="calendar-add-form-group-inline calendar-add-form-group-with-button">
                                      <label className="calendar-add-form-label">
                                        終了日<span className="required">*</span>
                                      </label>
                                      <div className="calendar-add-form-date-with-button">
                                        <input
                                          type="date"
                                          className="calendar-add-form-input"
                                          value={newSubAction.endDate}
                                          onChange={(e) => setNewSubAction({ ...newSubAction, endDate: e.target.value })}
                                          min={newSubAction.startDate || undefined}
                                        />
                                        <button
                                          type="button"
                                          className="calendar-add-form-same-day-button"
                                          onClick={() => {
                                            if (newSubAction.startDate) {
                                              setNewSubAction({ ...newSubAction, endDate: newSubAction.startDate });
                                            }
                                          }}
                                          disabled={!newSubAction.startDate}
                                          title="開始日と同じ日付に設定"
                                        >
                                          <span className="calendar-add-form-same-day-text">同</span>
                                          <span className="calendar-add-form-same-day-text">日</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          )}
                          {subActions.map((action, actionIndex) => {
                            const hasSubSubActions = action.subActions && action.subActions.length > 0;
                            const isExpanded = expandedSubActions.has(action.id);
                            const editingKey = `${parentActionId}-${action.id}`;
                            const isEditingDates = editingSubActionDates === editingKey;
                            
                            return (
                              <li key={actionIndex}>
                                <div 
                                  className={`calendar-action-item calendar-action-sub-item ${hasSubSubActions ? 'calendar-action-sub-item-expandable' : ''}`}
                                  onClick={(e) => {
                                    // 日付編集エリアのクリックは展開/折りたたみを無効化
                                    if (e.target.closest('.calendar-action-dates')) {
                                      return;
                                    }
                                    if (hasSubSubActions) {
                                      const newExpanded = new Set(expandedSubActions);
                                      if (isExpanded) {
                                        newExpanded.delete(action.id);
                                      } else {
                                        newExpanded.add(action.id);
                                      }
                                      setExpandedSubActions(newExpanded);
                                    }
                                  }}
                                  style={{ cursor: hasSubSubActions ? 'pointer' : 'default' }}
                                >
                                  <div className="calendar-action-expand-icon">
                                    {hasSubSubActions ? (
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
                                    ) : (
                                      <div style={{ width: '12px', height: '12px' }}></div>
                                    )}
                                  </div>
                                  {(!isSharedMember || permission === 'editor') && (
                                    <button
                                      className={`calendar-status-checkbox ${action.status === 'completed' ? 'checked' : ''} ${action.status === 'in-progress' ? 'in-progress' : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleSubActionStatus(parentActionId, action.id);
                                      }}
                                      aria-label={
                                        action.status === 'pending' || action.status === 'none' ? '未着手→着手' : 
                                        action.status === 'in-progress' ? '着手→完了' : 
                                        '完了→未着手'
                                      }
                                      title={
                                        action.status === 'pending' || action.status === 'none' ? '未着手→着手' : 
                                        action.status === 'in-progress' ? '着手→完了' : 
                                        '完了→未着手'
                                      }
                                      style={{ 
                                        background: action.status === 'in-progress' ? '#3b82f6' : action.status === 'completed' ? '#10b981' : 'none', 
                                        border: `2px solid ${action.status === 'in-progress' ? '#3b82f6' : action.status === 'completed' ? '#10b981' : '#ccc'}`, 
                                        borderRadius: '4px', 
                                        width: '20px', 
                                        height: '20px', 
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
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                          <circle cx="12" cy="12" r="10"></circle>
                                        </svg>
                                      )}
                                      {action.status === 'completed' && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      )}
                                    </button>
                                  )}
                                  <div className="calendar-action-type-badge" style={{
                                    backgroundColor: action.type === '診察' ? '#dbeafe' :
                                                    action.type === '申請' ? '#d1fae5' :
                                                    action.type === '報告' ? '#fed7aa' :
                                                    '#e5e7eb'
                                  }}>
                                    {action.type}
                                  </div>
                                  {isEditingDates ? (
                                    <>
                                      <input
                                        type="text"
                                        className="calendar-action-name-input"
                                        value={editingSubActionDatesData.actionName}
                                        onChange={(e) => setEditingSubActionDatesData({
                                          ...editingSubActionDatesData,
                                          actionName: e.target.value
                                        })}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="アクション名"
                                      />
                                      <div className="calendar-action-dates-edit-inline" onClick={(e) => e.stopPropagation()}>
                                        <div className="calendar-action-dates-inputs">
                                          <div className="calendar-action-date-input-group">
                                            <label>開始日:</label>
                                            <input
                                              type="date"
                                              value={editingSubActionDatesData.startDate}
                                              onChange={(e) => setEditingSubActionDatesData({
                                                ...editingSubActionDatesData,
                                                startDate: e.target.value
                                              })}
                                            />
                                          </div>
                                          <div className="calendar-action-date-input-group">
                                            <label>終了日:</label>
                                            <input
                                              type="date"
                                              value={editingSubActionDatesData.endDate}
                                              onChange={(e) => setEditingSubActionDatesData({
                                                ...editingSubActionDatesData,
                                                endDate: e.target.value
                                              })}
                                            />
                                          </div>
                                        </div>
                                        <div className="calendar-action-date-input-group">
                                          <label>備考:</label>
                                          <input
                                            type="text"
                                            value={editingSubActionDatesData.remarks}
                                            onChange={(e) => setEditingSubActionDatesData({
                                              ...editingSubActionDatesData,
                                              remarks: e.target.value
                                            })}
                                            placeholder="備考を入力"
                                          />
                                        </div>
                                        <div className="calendar-action-dates-buttons">
                                          <button
                                            className="calendar-action-dates-save"
                                            onClick={() => handleSaveSubActionDates(parentActionId, action.id)}
                                            disabled={isSharedMember && permission !== 'editor'}
                                          >
                                            保存
                                          </button>
                                          <button
                                            className="calendar-action-dates-cancel"
                                            onClick={handleCancelSubActionDates}
                                          >
                                            キャンセル
                                          </button>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="calendar-action-name">{action.actionName}</div>
                                      {action.startDate || action.endDate ? (
                                        <span className="calendar-action-dates-text">
                                          {action.startDate ? formatDate(action.startDate) : '未設定'} ～ {action.endDate ? formatDate(action.endDate) : '未設定'}
                                        </span>
                                      ) : (
                                        <span className="calendar-action-dates-text calendar-action-dates-empty">期間未設定</span>
                                      )}
                                      <span
                                        className="calendar-action-remarks"
                                        title={action.remarks || ""}
                                      >
                                        {action.remarks 
                                          ? (action.remarks.length > 25 ? action.remarks.substring(0, 25) + '...' : action.remarks)
                                          : ''}
                                      </span>
                                      {(!isSharedMember || permission === 'editor') && (
                                        <>
                                          <button
                                            className="calendar-action-dates-edit-button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditSubActionDates(parentActionId, action);
                                            }}
                                          >
                                            編集
                                          </button>
                                          <button
                                            className="calendar-add-button-small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAddSubSubActionClick(parentActionId, action.id);
                                            }}
                                            aria-label="サブサブアクション追加"
                                            title="サブサブアクションを追加"
                                          >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <line x1="12" y1="5" x2="12" y2="19"></line>
                                              <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                          </button>
                                          <button
                                            className="calendar-delete-button-small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (window.confirm('このサブアクションを削除しますか？')) {
                                                if (onDeleteSubAction) {
                                                  onDeleteSubAction(parentActionId, action.id);
                                                }
                                              }
                                            }}
                                            aria-label="サブアクション削除"
                                            title="サブアクションを削除"
                                          >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                  {action.status && (
                                    <div className={`calendar-action-status ${action.status}`}>
                                      {action.status === 'completed' ? '完了' : 
                                       action.status === 'in-progress' ? '進行中' : '未着手'}
                                    </div>
                                  )}
                                </div>
                                {(isExpanded || addingSubSubAction === `${parentActionId}-${action.id}`) && (
                                  <ul className="calendar-action-sub-sub-items">
                                    {addingSubSubAction === `${parentActionId}-${action.id}` && (
                                      <li className="calendar-action-item calendar-action-add-form">
                                        <div className="calendar-add-form-content">
                                          <div className="calendar-add-form-header">
                                            <h4 className="calendar-add-form-title">サブサブアクションを追加</h4>
                                            <div className="calendar-add-form-footer">
                                              <button
                                                className="calendar-add-form-cancel"
                                                onClick={handleCancelSubSubAction}
                                              >
                                                キャンセル
                                              </button>
                                              <button
                                                className="calendar-add-form-save"
                                                onClick={() => handleSaveSubSubAction(parentActionId, action.id)}
                                              >
                                                保存
                                              </button>
                                            </div>
                                          </div>
                                          <div className="calendar-add-form-body">
                                            <div className="calendar-add-form-row-inline">
                                              <div className="calendar-add-form-group-inline">
                                                <label className="calendar-add-form-label">
                                                  タイプ<span className="required">*</span>
                                                </label>
                                                <select
                                                  className="calendar-add-form-select"
                                                  value={newSubSubAction.type}
                                                  onChange={(e) => setNewSubSubAction({ ...newSubSubAction, type: e.target.value })}
                                                >
                                                  <option value="診察">診察</option>
                                                  <option value="申請">申請</option>
                                                  <option value="報告">報告</option>
                                                  <option value="その他">その他</option>
                                                </select>
                                              </div>
                                              <div className="calendar-add-form-group-inline calendar-add-form-group-flex">
                                                <label className="calendar-add-form-label">
                                                  アクション名<span className="required">*</span>
                                                </label>
                                                <input
                                                  type="text"
                                                  className="calendar-add-form-input"
                                                  value={newSubSubAction.actionName}
                                                  onChange={(e) => setNewSubSubAction({ ...newSubSubAction, actionName: e.target.value })}
                                                  placeholder="アクション名を入力"
                                                />
                                              </div>
                                              <div className="calendar-add-form-group-inline">
                                                <label className="calendar-add-form-label">
                                                  開始日<span className="required">*</span>
                                                </label>
                                                <input
                                                  type="date"
                                                  className="calendar-add-form-input"
                                                  value={newSubSubAction.startDate}
                                                  onChange={(e) => {
                                                    const newStartDate = e.target.value;
                                                    // 終了日が空または開始日より前の場合は、開始日と同じ日付を設定
                                                    const shouldUpdateEndDate = !newSubSubAction.endDate || 
                                                      (newSubSubAction.endDate && newSubSubAction.endDate < newStartDate);
                                                    setNewSubSubAction({ 
                                                      ...newSubSubAction, 
                                                      startDate: newStartDate,
                                                      endDate: shouldUpdateEndDate ? newStartDate : newSubSubAction.endDate
                                                    });
                                                  }}
                                                />
                                              </div>
                                              <div className="calendar-add-form-group-inline calendar-add-form-group-with-button">
                                                <label className="calendar-add-form-label">
                                                  終了日<span className="required">*</span>
                                                </label>
                                                <div className="calendar-add-form-date-with-button">
                                                  <input
                                                    type="date"
                                                    className="calendar-add-form-input"
                                                    value={newSubSubAction.endDate}
                                                    onChange={(e) => setNewSubSubAction({ ...newSubSubAction, endDate: e.target.value })}
                                                    min={newSubSubAction.startDate || undefined}
                                                  />
                                                  <button
                                                    type="button"
                                                    className="calendar-add-form-same-day-button"
                                                    onClick={() => {
                                                      if (newSubSubAction.startDate) {
                                                        setNewSubSubAction({ ...newSubSubAction, endDate: newSubSubAction.startDate });
                                                      }
                                                    }}
                                                    disabled={!newSubSubAction.startDate}
                                                    title="開始日と同じ日付に設定"
                                                  >
                                                    <span className="calendar-add-form-same-day-text">同</span>
                                                    <span className="calendar-add-form-same-day-text">日</span>
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    )}
                                    {action.subActions.map((subSubAction, subSubIndex) => {
                                      const editingSubSubKey = `${parentActionId}-${action.id}-${subSubAction.id}`;
                                      const isEditingSubSubDates = editingSubSubActionDates === editingSubSubKey;
                                      
                                      return (
                                        <li key={subSubIndex} className="calendar-action-item calendar-action-sub-sub-item">
                                          {(!isSharedMember || permission === 'editor') && (
                                            <button
                                              className={`calendar-status-checkbox ${subSubAction.status === 'completed' ? 'checked' : ''} ${subSubAction.status === 'in-progress' ? 'in-progress' : ''}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleSubSubActionStatus(parentActionId, action.id, subSubAction.id);
                                              }}
                                              aria-label={
                                                subSubAction.status === 'pending' || subSubAction.status === 'none' ? '未着手→着手' : 
                                                subSubAction.status === 'in-progress' ? '着手→完了' : 
                                                '完了→未着手'
                                              }
                                              title={
                                                subSubAction.status === 'pending' || subSubAction.status === 'none' ? '未着手→着手' : 
                                                subSubAction.status === 'in-progress' ? '着手→完了' : 
                                                '完了→未着手'
                                              }
                                              style={{ 
                                                background: subSubAction.status === 'in-progress' ? '#3b82f6' : subSubAction.status === 'completed' ? '#10b981' : 'none', 
                                                border: `2px solid ${subSubAction.status === 'in-progress' ? '#3b82f6' : subSubAction.status === 'completed' ? '#10b981' : '#ccc'}`, 
                                                borderRadius: '4px', 
                                                width: '20px', 
                                                height: '20px', 
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
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                  <circle cx="12" cy="12" r="10"></circle>
                                                </svg>
                                              )}
                                              {subSubAction.status === 'completed' && (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                  <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                              )}
                                            </button>
                                          )}
                                          <div className="calendar-action-type-badge" style={{
                                            backgroundColor: subSubAction.type === '診察' ? '#dbeafe' :
                                                            subSubAction.type === '申請' ? '#d1fae5' :
                                                            subSubAction.type === '報告' ? '#fed7aa' :
                                                            '#e5e7eb'
                                          }}>
                                            {subSubAction.type}
                                          </div>
                                          {isEditingSubSubDates ? (
                                            <>
                                              <input
                                                type="text"
                                                className="calendar-action-name-input"
                                                value={editingSubSubActionDatesData.actionName}
                                                onChange={(e) => setEditingSubSubActionDatesData({
                                                  ...editingSubSubActionDatesData,
                                                  actionName: e.target.value
                                                })}
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder="アクション名"
                                              />
                                              <div className="calendar-action-dates-edit-inline" onClick={(e) => e.stopPropagation()}>
                                                <div className="calendar-action-dates-inputs">
                                                  <div className="calendar-action-date-input-group">
                                                    <label>開始日:</label>
                                                    <input
                                                      type="date"
                                                      value={editingSubSubActionDatesData.startDate}
                                                      onChange={(e) => setEditingSubSubActionDatesData({
                                                        ...editingSubSubActionDatesData,
                                                        startDate: e.target.value
                                                      })}
                                                    />
                                                  </div>
                                                  <div className="calendar-action-date-input-group">
                                                    <label>終了日:</label>
                                                    <input
                                                      type="date"
                                                      value={editingSubSubActionDatesData.endDate}
                                                      onChange={(e) => setEditingSubSubActionDatesData({
                                                        ...editingSubSubActionDatesData,
                                                        endDate: e.target.value
                                                      })}
                                                    />
                                                  </div>
                                                </div>
                                                <div className="calendar-action-date-input-group">
                                                  <label>備考:</label>
                                                  <input
                                                    type="text"
                                                    value={editingSubSubActionDatesData.remarks}
                                                    onChange={(e) => setEditingSubSubActionDatesData({
                                                      ...editingSubSubActionDatesData,
                                                      remarks: e.target.value
                                                    })}
                                                    placeholder="備考を入力"
                                                  />
                                                </div>
                                                <div className="calendar-action-dates-buttons">
                                                  <button
                                                    className="calendar-action-dates-save"
                                                    onClick={() => handleSaveSubSubActionDates(parentActionId, action.id, subSubAction.id)}
                                                    disabled={isSharedMember && permission !== 'editor'}
                                                  >
                                                    保存
                                                  </button>
                                                  <button
                                                    className="calendar-action-dates-cancel"
                                                    onClick={handleCancelSubSubActionDates}
                                                  >
                                                    キャンセル
                                                  </button>
                                                </div>
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              <div className="calendar-action-name">{subSubAction.actionName}</div>
                                              {subSubAction.startDate || subSubAction.endDate ? (
                                                <span className="calendar-action-dates-text">
                                                  {subSubAction.startDate ? formatDate(subSubAction.startDate) : '未設定'} ～ {subSubAction.endDate ? formatDate(subSubAction.endDate) : '未設定'}
                                                </span>
                                              ) : (
                                                <span className="calendar-action-dates-text calendar-action-dates-empty">期間未設定</span>
                                              )}
                                              <span
                                                className="calendar-action-remarks"
                                                title={subSubAction.remarks || ""}
                                              >
                                                {subSubAction.remarks 
                                                  ? (subSubAction.remarks.length > 25 ? subSubAction.remarks.substring(0, 25) + '...' : subSubAction.remarks)
                                                  : ''}
                                              </span>
                                              {(!isSharedMember || permission === 'editor') && (
                                                <>
                                                  <button
                                                    className="calendar-action-dates-edit-button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleEditSubSubActionDates(parentActionId, action.id, subSubAction);
                                                    }}
                                                  >
                                                    編集
                                                  </button>
                                                  <button
                                                    className="calendar-delete-button-small"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (window.confirm('このサブサブアクションを削除しますか？')) {
                                                        if (onDeleteSubSubAction) {
                                                          onDeleteSubSubAction(parentActionId, action.id, subSubAction.id);
                                                        }
                                                      }
                                                    }}
                                                    aria-label="サブサブアクション削除"
                                                    title="サブサブアクションを削除"
                                                  >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                          {subSubAction.status && (
                                            <div className={`calendar-action-status ${subSubAction.status}`}>
                                              {subSubAction.status === 'completed' ? '完了' : 
                                               subSubAction.status === 'in-progress' ? '進行中' : '未着手'}
                                            </div>
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionCalendar;

