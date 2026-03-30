import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOwnerId } from '../hooks/useOwnerId';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, ComposedChart } from 'recharts';
import './NecessaryExpenses.css';

const NecessaryExpenses = () => {
  const { currentUser } = useAuth();
  const { ownerId, loading: ownerIdLoading } = useOwnerId();
  const [basicInfo, setBasicInfo] = useState(null);
  const [displayPeriod, setDisplayPeriod] = useState('year'); // 'month', 'quarter', 'year'
  const [displayStartYear, setDisplayStartYear] = useState(0); // 表示開始年（0=出産時、1=1年目）
  const [displayEndYear, setDisplayEndYear] = useState(6); // 表示終了年（6=6年目）

  // Firestoreから基本情報を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
    
    const unsubscribe = onSnapshot(userDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.basicInfo) {
          setBasicInfo(data.basicInfo);
        } else {
          setBasicInfo(null);
        }
      } else {
        setBasicInfo(null);
      }
    }, (error) => {
      console.error('基本情報読み込みエラー:', error);
      setBasicInfo(null);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);

  // 必要経費のカテゴリと項目
  const expenseCategories = useMemo(() => {
    return [
      {
        id: 'baby-goods',
        name: 'ベビーグッズ',
        items: [
          { id: 'stroller', name: 'ベビーカー', amount: 30000, period: 'one-time', description: '新生児用から幼児用まで' },
          { id: 'crib', name: 'ベビーベッド', amount: 20000, period: 'one-time', description: '安全基準を満たしたもの' },
          { id: 'car-seat', name: 'チャイルドシート', amount: 25000, period: 'one-time', description: '新生児用から幼児用まで' },
          { id: 'baby-clothes', name: 'ベビー服', amount: 5000, period: 'monthly', description: '成長に合わせて買い替え' },
          { id: 'diapers', name: 'おむつ', amount: 5000, period: 'monthly', description: '月齢に応じてサイズ変更' },
          { id: 'baby-bath', name: 'ベビーバス', amount: 3000, period: 'one-time', description: '沐浴用' },
          { id: 'baby-monitor', name: 'ベビーモニター', amount: 15000, period: 'one-time', description: '見守り用' },
        ]
      },
      {
        id: 'milk',
        name: 'ミルク・離乳食',
        items: [
          { id: 'formula', name: '粉ミルク', amount: 8000, period: 'monthly', description: '0-1歳' },
          { id: 'baby-food', name: '離乳食', amount: 5000, period: 'monthly', description: '5-12ヶ月' },
          { id: 'bottles', name: '哺乳瓶', amount: 3000, period: 'one-time', description: '複数本必要' },
        ]
      },
      {
        id: 'medical',
        name: '医療・検診',
        items: [
          { id: 'vaccination', name: '予防接種', amount: 15000, period: 'yearly', description: '定期接種（無料）+ 任意接種' },
          { id: 'health-check', name: '乳幼児健診', amount: 0, period: 'yearly', description: '公費負担（無料）' },
          { id: 'medical-expenses', name: '医療費', amount: 20000, period: 'yearly', description: '風邪や怪我など' },
        ]
      },
      {
        id: 'childcare',
        name: '保育施設',
        items: [
          { id: 'nursery', name: '認可保育園', amount: 20000, period: 'monthly', description: '所得に応じて変動' },
          { id: 'private-nursery', name: '認可外保育園', amount: 50000, period: 'monthly', description: '施設により異なる' },
          { id: 'baby-sitter', name: 'ベビーシッター', amount: 3000, period: 'hourly', description: '1時間あたり' },
        ]
      },
      {
        id: 'education',
        name: '知育・教育',
        items: [
          { id: 'toys', name: 'おもちゃ', amount: 3000, period: 'monthly', description: '年齢に応じたおもちゃ' },
          { id: 'books', name: '絵本・図鑑', amount: 2000, period: 'monthly', description: '読み聞かせ用' },
          { id: 'classes', name: '習い事', amount: 8000, period: 'monthly', description: '3歳以降' },
        ]
      },
      {
        id: 'insurance',
        name: '保険',
        items: [
          { id: 'child-insurance', name: '学資保険', amount: 10000, period: 'monthly', description: '将来の教育費に備える' },
          { id: 'medical-insurance', name: '医療保険', amount: 3000, period: 'monthly', description: '子供用' },
        ]
      },
      {
        id: 'housing',
        name: '住居関連',
        items: [
          { id: 'moving', name: '引っ越し費用', amount: 300000, period: 'one-time', description: '家族が増える場合' },
          { id: 'room-renovation', name: '部屋のリフォーム', amount: 500000, period: 'one-time', description: '子供部屋の準備' },
          { id: 'furniture', name: '家具・収納', amount: 100000, period: 'one-time', description: 'ベビー用品の収納など' },
        ]
      },
      {
        id: 'other',
        name: 'その他',
        items: [
          { id: 'photography', name: '写真撮影', amount: 30000, period: 'yearly', description: '七五三など' },
          { id: 'travel', name: '旅行・レジャー', amount: 50000, period: 'yearly', description: '家族旅行など' },
        ]
      }
    ];
  }, []);

  // 期間別の合計を計算
  const calculateTotals = useMemo(() => {
    const totals = {
      oneTime: 0,
      monthly: 0,
      yearly: 0,
      hourly: 0
    };

    expenseCategories.forEach(category => {
      category.items.forEach(item => {
        if (item.period === 'one-time') {
          totals.oneTime += item.amount;
        } else if (item.period === 'monthly') {
          totals.monthly += item.amount;
        } else if (item.period === 'yearly') {
          totals.yearly += item.amount;
        } else if (item.period === 'hourly') {
          totals.hourly += item.amount;
        }
      });
    });

    return totals;
  }, [expenseCategories]);

  // グラフ用のデータ（カテゴリ別月額）
  const chartData = useMemo(() => {
    return expenseCategories.map(category => {
      const categoryTotal = category.items.reduce((sum, item) => {
        if (item.period === 'monthly') {
          return sum + item.amount;
        }
        return sum;
      }, 0);
      return {
        name: category.name,
        value: categoryTotal
      };
    }).filter(item => item.value > 0);
  }, [expenseCategories]);

  // カテゴリ別の月額支出を計算
  const categoryMonthlyTotals = useMemo(() => {
    const totals = {};
    expenseCategories.forEach(category => {
      const categoryTotal = category.items.reduce((sum, item) => {
        if (item.period === 'monthly') {
          return sum + item.amount;
        } else if (item.period === 'yearly') {
          return sum + (item.amount / 12); // 年間支出を月額に換算
        }
        return sum;
      }, 0);
      if (categoryTotal > 0) {
        totals[category.id] = {
          name: category.name,
          amount: categoryTotal
        };
      }
    });
    return totals;
  }, [expenseCategories]);

  // 各月ごとのカテゴリ別支出を計算する関数
  const calculateMonthlyCategoryExpenses = (monthIndex) => {
    const categoryExpenses = {};
    
    expenseCategories.forEach(category => {
      let categoryTotal = 0;
      
      category.items.forEach(item => {
        if (item.period === 'monthly') {
          // 月額支出は毎月発生（産後から）
          if (monthIndex >= 0) {
            categoryTotal += item.amount;
          }
        } else if (item.period === 'yearly') {
          // 年間支出は月額換算で毎月発生
          categoryTotal += item.amount / 12;
        } else if (item.period === 'one-time') {
          // 一時的な支出は産後1ヶ月目に発生
          if (monthIndex === 1) {
            categoryTotal += item.amount;
          }
        }
      });
      
      categoryExpenses[category.id] = Math.round(categoryTotal);
    });
    
    return categoryExpenses;
  };

  // 時系列での支出累計データ（月ごと、妊娠期間含む）
  const monthlyExpenseData = useMemo(() => {
    const data = [];
    let cumulative = 0;
    
    // 妊娠期間（-9ヶ月から-1ヶ月まで）
    for (let i = -9; i <= -1; i++) {
      // 妊娠期間中のカテゴリ別支出を計算（この月の支出）
      const categoryExpenses = calculateMonthlyCategoryExpenses(i);
      
      // 月額合計を計算（この月の支出）
      const monthlyTotal = Object.values(categoryExpenses).reduce((sum, val) => sum + val, 0);
      
      // 累計に加算
      cumulative += monthlyTotal;
      
      const monthData = {
        month: i === -9 ? '妊娠9ヶ月' : i === -6 ? '妊娠6ヶ月' : i === -3 ? '妊娠3ヶ月' : `妊娠${Math.abs(i)}ヶ月`,
        monthIndex: i,
        cumulative: Math.round(cumulative),
        ...categoryExpenses // 各月のカテゴリ別支出（積み上げエリア用）
      };
      
      data.push(monthData);
    }
    
    // 0ヶ月目（出産時）
    const categoryExpenses0 = calculateMonthlyCategoryExpenses(0);
    const monthlyTotal0 = Object.values(categoryExpenses0).reduce((sum, val) => sum + val, 0);
    cumulative += monthlyTotal0;
    
    const month0Data = {
      month: '出産時',
      monthIndex: 0,
      cumulative: Math.round(cumulative),
      ...categoryExpenses0 // 各月のカテゴリ別支出（積み上げエリア用）
    };
    data.push(month0Data);
    
    // 1ヶ月目から72ヶ月目（6年）まで
    for (let i = 1; i <= 72; i++) {
      // 各月のカテゴリ別支出を計算（この月の支出）
      const categoryExpenses = calculateMonthlyCategoryExpenses(i);
      
      // 月額合計を計算（この月の支出）
      const monthlyTotal = Object.values(categoryExpenses).reduce((sum, val) => sum + val, 0);
      
      // 累計に加算
      cumulative += monthlyTotal;
      
      const monthData = {
        month: `${i}ヶ月`,
        monthIndex: i,
        cumulative: Math.round(cumulative),
        ...categoryExpenses // 各月のカテゴリ別支出（積み上げエリア用）
      };
      
      data.push(monthData);
    }
    
    return data;
  }, [expenseCategories]);

  // 表示単位に応じてデータを集計
  const cumulativeExpenseData = useMemo(() => {
    if (displayPeriod === 'month') {
      return monthlyExpenseData;
    }

    const aggregatedData = [];
    let cumulative = 0;

    if (displayPeriod === 'quarter') {
      // 四半期単位で集計
      // 妊娠期間を四半期ごとに集計
      const pregnancyQuarters = [];
      for (let i = -9; i <= -1; i += 3) {
        const quarterData = {
          categoryExpenses: {},
          monthIndices: []
        };
        for (let j = i; j < Math.min(i + 3, 0); j++) {
          if (j < 0) {
            const expenses = calculateMonthlyCategoryExpenses(j);
            expenseCategories.forEach(category => {
              if (!quarterData.categoryExpenses[category.id]) {
                quarterData.categoryExpenses[category.id] = 0;
              }
              quarterData.categoryExpenses[category.id] += expenses[category.id] || 0;
            });
            quarterData.monthIndices.push(j);
          }
        }
        if (quarterData.monthIndices.length > 0) {
          pregnancyQuarters.push(quarterData);
        }
      }

      // 妊娠期間の四半期データを追加
      pregnancyQuarters.forEach((quarter, idx) => {
        const quarterTotal = Object.values(quarter.categoryExpenses).reduce((sum, val) => sum + val, 0);
        cumulative += quarterTotal;
        
        const quarterLabel = idx === 0 ? '妊娠9-7ヶ月' : idx === 1 ? '妊娠6-4ヶ月' : '妊娠3-1ヶ月';
        aggregatedData.push({
          month: quarterLabel,
          monthIndex: quarter.monthIndices[0],
          cumulative: Math.round(cumulative),
          ...quarter.categoryExpenses
        });
      });

      // 出産時
      const birthExpenses = calculateMonthlyCategoryExpenses(0);
      const birthTotal = Object.values(birthExpenses).reduce((sum, val) => sum + val, 0);
      cumulative += birthTotal;
      aggregatedData.push({
        month: '出産時',
        monthIndex: 0,
        cumulative: Math.round(cumulative),
        ...birthExpenses
      });

      // 産後を四半期ごとに集計
      const startMonth = displayStartYear === 0 ? 0 : (displayStartYear - 1) * 12 + 1;
      const endMonth = displayEndYear * 12;
      for (let quarterStart = 1; quarterStart <= endMonth; quarterStart += 3) {
        if (quarterStart < startMonth) continue;
        const quarterEnd = Math.min(quarterStart + 2, endMonth);
        const quarterData = {
          categoryExpenses: {}
        };
        
        for (let i = quarterStart; i <= quarterEnd; i++) {
          const expenses = calculateMonthlyCategoryExpenses(i);
          expenseCategories.forEach(category => {
            if (!quarterData.categoryExpenses[category.id]) {
              quarterData.categoryExpenses[category.id] = 0;
            }
            quarterData.categoryExpenses[category.id] += expenses[category.id] || 0;
          });
        }
        
        const quarterTotal = Object.values(quarterData.categoryExpenses).reduce((sum, val) => sum + val, 0);
        cumulative += quarterTotal;
        
        const quarterLabel = quarterStart === quarterEnd 
          ? `${quarterStart}ヶ月` 
          : `${quarterStart}-${quarterEnd}ヶ月`;
        
        aggregatedData.push({
          month: quarterLabel,
          monthIndex: quarterStart,
          cumulative: Math.round(cumulative),
          ...quarterData.categoryExpenses
        });
      }
    } else if (displayPeriod === 'year') {
      // 年単位で集計
      // 累計を正しく計算するため、開始年より前の期間も計算
      let baseCumulative = 0;
      
      // 妊娠期間を1年として集計
      const pregnancyYearData = {
        categoryExpenses: {}
      };
      
      for (let i = -9; i <= -1; i++) {
        const expenses = calculateMonthlyCategoryExpenses(i);
        expenseCategories.forEach(category => {
          if (!pregnancyYearData.categoryExpenses[category.id]) {
            pregnancyYearData.categoryExpenses[category.id] = 0;
          }
          pregnancyYearData.categoryExpenses[category.id] += expenses[category.id] || 0;
        });
      }
      
      const pregnancyTotal = Object.values(pregnancyYearData.categoryExpenses).reduce((sum, val) => sum + val, 0);
      baseCumulative += pregnancyTotal;

      // 出産時
      const birthExpenses = calculateMonthlyCategoryExpenses(0);
      const birthTotal = Object.values(birthExpenses).reduce((sum, val) => sum + val, 0);
      baseCumulative += birthTotal;

      // 開始年より前の期間の累計を計算
      const startYearNumber = displayStartYear === 0 ? 0 : displayStartYear;
      for (let yearNumber = 1; yearNumber < startYearNumber; yearNumber++) {
        const yearStart = (yearNumber - 1) * 12 + 1;
        const yearEnd = Math.min(yearStart + 11, yearNumber * 12);
        for (let i = yearStart; i <= yearEnd; i++) {
          const expenses = calculateMonthlyCategoryExpenses(i);
          const monthlyTotal = Object.values(expenses).reduce((sum, val) => sum + val, 0);
          baseCumulative += monthlyTotal;
        }
      }

      // 表示する期間のデータを集計
      cumulative = baseCumulative;
      
      // 妊娠期間と出産時を表示範囲に含める場合のみ追加
      if (displayStartYear === 0) {
        aggregatedData.push({
          month: '妊娠期間',
          monthIndex: -9,
          cumulative: Math.round(pregnancyTotal),
          ...pregnancyYearData.categoryExpenses
        });
        aggregatedData.push({
          month: '出産時',
          monthIndex: 0,
          cumulative: Math.round(baseCumulative),
          ...birthExpenses
        });
      }

      // 産後を1年ごとに集計
      const endYearNumber = displayEndYear;
      for (let yearNumber = startYearNumber === 0 ? 1 : startYearNumber; yearNumber <= endYearNumber; yearNumber++) {
        const yearStart = (yearNumber - 1) * 12 + 1;
        const yearEnd = Math.min(yearStart + 11, yearNumber * 12);
        const yearData = {
          categoryExpenses: {}
        };
        
        for (let i = yearStart; i <= yearEnd; i++) {
          const expenses = calculateMonthlyCategoryExpenses(i);
          expenseCategories.forEach(category => {
            if (!yearData.categoryExpenses[category.id]) {
              yearData.categoryExpenses[category.id] = 0;
            }
            yearData.categoryExpenses[category.id] += expenses[category.id] || 0;
          });
        }
        
        const yearTotal = Object.values(yearData.categoryExpenses).reduce((sum, val) => sum + val, 0);
        cumulative += yearTotal;
        
        aggregatedData.push({
          month: `${yearNumber}年目`,
          monthIndex: yearStart,
          cumulative: Math.round(cumulative),
          ...yearData.categoryExpenses
        });
      }
    }

    // 表示期間でフィルタリング
    if (displayPeriod === 'month') {
      const startMonth = displayStartYear === 0 ? 0 : (displayStartYear - 1) * 12 + 1;
      const endMonth = displayEndYear * 12;
      return monthlyExpenseData.filter(item => {
        if (item.monthIndex < 0) return true; // 妊娠期間は常に表示
        if (item.monthIndex === 0) {
          return displayStartYear === 0; // 出産時は開始年が0の場合のみ表示
        }
        return item.monthIndex >= startMonth && item.monthIndex <= endMonth;
      });
    }

    // 四半期・年単位の場合もフィルタリング
    const startMonth = displayStartYear === 0 ? 0 : (displayStartYear - 1) * 12 + 1;
    const endMonth = displayEndYear * 12;
    return aggregatedData.filter(item => {
      if (item.monthIndex < 0) return true; // 妊娠期間は常に表示
      if (item.monthIndex === 0) {
        return displayStartYear === 0; // 出産時は開始年が0の場合のみ表示
      }
      return item.monthIndex >= startMonth && item.monthIndex <= endMonth;
    });
  }, [monthlyExpenseData, displayPeriod, displayStartYear, displayEndYear, expenseCategories]);

  return (
    <div className="necessary-expenses-page">
      <div className="necessary-expenses-content-card">
        <div className="necessary-expenses-content">
          <div className="intro-section">
            <div className="intro-header">
              <div>
                <h2>必要経費概算</h2>
                <p>
                  出産・育児に伴う必要な支出を一覧でご確認いただけます。
                  ベビーグッズ、ミルク、予防接種、保育施設、知育、保険など、様々な支出項目をカテゴリ別に表示しています。
                </p>
              </div>
            </div>
          </div>

          {/* 合計表示 */}
          <div className="summary-section" style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              支出の合計（概算）
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>一時的な支出</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  {calculateTotals.oneTime.toLocaleString('ja-JP')}円
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>月額支出</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  {calculateTotals.monthly.toLocaleString('ja-JP')}円
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>年間支出</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  {calculateTotals.yearly.toLocaleString('ja-JP')}円
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '2px solid #3b82f6' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  累積金額（{displayStartYear === 0 ? '出産時' : `${displayStartYear}年目`}〜{displayEndYear}年目）
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                  {cumulativeExpenseData.length > 0 
                    ? `${(cumulativeExpenseData[cumulativeExpenseData.length - 1].cumulative / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`
                    : '0万円'}
                </div>
              </div>
            </div>
          </div>

          {/* 時系列での支出累計グラフ（累計線 + カテゴリ別積み上げ） */}
          <div className="chart-section" style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  時系列での支出累計とカテゴリ別の月次支出（概算）
                </h3>
                <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                  妊娠期間（-9ヶ月）から産後{displayStartYear === 0 ? '出産時' : `${displayStartYear}年目`}〜{displayEndYear}年目までの累計支出と、各{displayPeriod === 'month' ? '月' : displayPeriod === 'quarter' ? '四半期' : '年'}のカテゴリ別支出を表示しています。
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>表示単位:</label>
                  <select
                    value={displayPeriod}
                    onChange={(e) => setDisplayPeriod(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="month">月</option>
                    <option value="quarter">四半期</option>
                    <option value="year">年</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>開始年:</label>
                  <select
                    value={displayStartYear}
                    onChange={(e) => {
                      const start = Number(e.target.value);
                      setDisplayStartYear(start);
                      if (start > displayEndYear) {
                        setDisplayEndYear(start);
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="0">出産時</option>
                    <option value="1">1年目</option>
                    <option value="2">2年目</option>
                    <option value="3">3年目</option>
                    <option value="4">4年目</option>
                    <option value="5">5年目</option>
                    <option value="6">6年目</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>終了年:</label>
                  <select
                    value={displayEndYear}
                    onChange={(e) => {
                      const end = Number(e.target.value);
                      setDisplayEndYear(end);
                      if (end < displayStartYear) {
                        setDisplayStartYear(end);
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="0">出産時</option>
                    <option value="1">1年目</option>
                    <option value="2">2年目</option>
                    <option value="3">3年目</option>
                    <option value="4">4年目</option>
                    <option value="5">5年目</option>
                    <option value="6">6年目</option>
                  </select>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={500}>
              <ComposedChart data={cumulativeExpenseData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#374151', fontWeight: '500' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 13, fill: '#6b7280', fontWeight: '400' }}
                  tickFormatter={(value) => `${(value / 10000).toLocaleString('ja-JP')}万円`}
                  label={{ value: '支出（万円）', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151', fontSize: '14px', fontWeight: '500' } }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'cumulative') {
                      return [`${(value / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`, '累計支出'];
                    }
                    return [`${(value / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`, categoryMonthlyTotals[name]?.name || name];
                  }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ color: '#1f2937', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => {
                    if (value === 'cumulative') return '累計支出';
                    return categoryMonthlyTotals[value]?.name || value;
                  }}
                />
                {/* カテゴリ別の積み上げバー */}
                {expenseCategories.map((category, index) => {
                  if (!categoryMonthlyTotals[category.id]) return null;
                  const colors = ['#93c5fd', '#c4b5fd', '#fbcfe8', '#fecaca', '#fde68a', '#d1fae5', '#bfdbfe', '#e9d5ff'];
                  return (
                    <Bar
                      key={category.id}
                      yAxisId="left"
                      dataKey={category.id}
                      stackId="monthly"
                      fill={colors[index % colors.length]}
                      name={category.name}
                    />
                  );
                })}
                {/* 累計支出の線 */}
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  dot={{ fill: '#667eea', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="累計支出"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* カテゴリ別月額支出（概算）グラフ */}
          <div className="chart-section" style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              カテゴリ別月額支出（概算）
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 13, fill: '#374151', fontWeight: '500' }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  tick={{ fontSize: 13, fill: '#6b7280', fontWeight: '400' }}
                  label={{ value: '金額（円）', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151', fontSize: '14px', fontWeight: '500' } }}
                />
                <Tooltip 
                  formatter={(value) => `${value.toLocaleString('ja-JP')}円`}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#667eea" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* カテゴリ別の詳細 */}
          {expenseCategories.map(category => (
            <div key={category.id} className="category-section" style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                {category.name}
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>項目</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>金額</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>期間</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{item.name}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626' }}>
                          {item.amount.toLocaleString('ja-JP')}円
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {item.period === 'one-time' && '一時的'}
                          {item.period === 'monthly' && '月額'}
                          {item.period === 'yearly' && '年間'}
                          {item.period === 'hourly' && '時間あたり'}
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NecessaryExpenses;

