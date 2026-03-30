import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOwnerId } from '../hooks/useOwnerId';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { initialSupportSystemsData } from '../utils/supportSystemsData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart, Cell, LabelList } from 'recharts';
import './PaymentAmount.css';

const PaymentAmount = () => {
  const { currentUser } = useAuth();
  const { ownerId, loading: ownerIdLoading } = useOwnerId();
  const [basicInfo, setBasicInfo] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(12); // 表示期間（月）
  
  // 休業期間の設定
  const [maternityLeaveStart, setMaternityLeaveStart] = useState(0); // 産休開始月（出産前、0ヶ月前から）
  const [maternityLeaveDuration, setMaternityLeaveDuration] = useState(3); // 産休期間（月、出産前1ヶ月+出産後2ヶ月）
  const [motherChildcareLeaveStart, setMotherChildcareLeaveStart] = useState(2); // 母親の育児休業開始月（産休後）
  const [motherChildcareLeaveDuration, setMotherChildcareLeaveDuration] = useState(6); // 母親の育児休業期間（月）
  const [fatherChildcareLeaveStart, setFatherChildcareLeaveStart] = useState(0); // 父親の育児休業開始月
  const [fatherChildcareLeaveDuration, setFatherChildcareLeaveDuration] = useState(0); // 父親の育児休業期間（月）
  const [benefitChartMode, setBenefitChartMode] = useState('combined'); // 'positive', 'negative', 'combined'

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

  // 支給金額から数値を抽出する関数（万円単位）
  const extractAmount = (amountStr) => {
    if (!amountStr) return null;
    
    const match = amountStr.match(/(\d+(?:\.\d+)?)\s*万円/);
    if (match) {
      return parseFloat(match[1]);
    }
    
    const yenMatch = amountStr.match(/(\d{1,3}(?:,\d{3})*)\s*円/);
    if (yenMatch) {
      const yenValue = parseInt(yenMatch[1].replace(/,/g, ''), 10);
      return yenValue / 10000;
    }
    
    return null;
  };

  // 出産手当金の概算を計算する関数（産休期間中）
  const calculateMaternityAllowance = (annualIncome, leaveMonths) => {
    if (!annualIncome || annualIncome === '' || leaveMonths <= 0) return null;
    
    const annualIncomeNum = parseInt(annualIncome, 10);
    if (isNaN(annualIncomeNum) || annualIncomeNum <= 0) return null;
    
    const monthlyIncome = annualIncomeNum / 12;
    // 出産手当金は標準報酬日額の2/3
    const dailyAllowance = (monthlyIncome / 30) * (2 / 3);
    const totalDays = leaveMonths * 30;
    
    return {
      amount: dailyAllowance * totalDays,
      days: totalDays
    };
  };

  // 育児休業給付金の概算を計算する関数
  const calculateChildcareLeaveBenefit = (annualIncome, leaveMonths) => {
    if (!annualIncome || annualIncome === '' || leaveMonths <= 0) return null;
    
    const annualIncomeNum = parseInt(annualIncome, 10);
    if (isNaN(annualIncomeNum) || annualIncomeNum <= 0) return null;
    
    const monthlyIncome = annualIncomeNum / 12;
    const dailyIncome = monthlyIncome / 30;
    
    const leaveDays = leaveMonths * 30;
    const first6MonthsDays = Math.min(leaveDays, 180);
    const after6MonthsDays = Math.max(0, leaveDays - 180);
    
    const first6MonthsBenefit = dailyIncome * first6MonthsDays * 0.67;
    const after6MonthsBenefit = dailyIncome * after6MonthsDays * 0.50;
    
    const totalBenefit = first6MonthsBenefit + after6MonthsBenefit;
    
    return {
      amount: totalBenefit,
      days: leaveDays
    };
  };

  // 月別の収支データを計算
  const monthlyData = useMemo(() => {
    if (!basicInfo) return [];

    const motherIncome = parseInt(basicInfo.annualIncome || 0, 10);
    const fatherIncome = parseInt(basicInfo.fatherAnnualIncome || 0, 10);
    const monthlyMotherIncome = motherIncome / 12;
    const monthlyFatherIncome = fatherIncome / 12;

    const data = [];
    
    // 出産育児一時金（出産時のみ、0ヶ月目）
    const lumpSum = 50; // 万円
    
    // 児童手当（毎月、出産後から）
    const childAllowance = 1.5; // 0-3歳未満の場合、万円
    
    // 産休期間の計算（出産前maternityLeaveStartヶ月から出産後maternityLeaveDurationヶ月まで）
    const maternityLeaveEndMonth = maternityLeaveDuration;
    
    // 母親の育児休業期間の計算
    const motherChildcareLeaveEndMonth = motherChildcareLeaveStart + motherChildcareLeaveDuration;
    
    // 父親の育児休業期間の計算
    const fatherChildcareLeaveEndMonth = fatherChildcareLeaveStart + fatherChildcareLeaveDuration;
    
    // 産休手当の計算
    const maternityAllowance = calculateMaternityAllowance(motherIncome, maternityLeaveDuration);
    const maternityAllowanceMonthly = maternityAllowance ? maternityAllowance.amount / maternityLeaveDuration : 0;
    
    // 母親の育児休業給付金の計算
    const motherLeaveBenefit = calculateChildcareLeaveBenefit(motherIncome, motherChildcareLeaveDuration);
    const motherLeaveBenefitMonthly = motherLeaveBenefit && motherChildcareLeaveDuration > 0 
      ? motherLeaveBenefit.amount / motherChildcareLeaveDuration 
      : 0;
    
    // 父親の育児休業給付金の計算
    const fatherLeaveBenefit = calculateChildcareLeaveBenefit(fatherIncome, fatherChildcareLeaveDuration);
    const fatherLeaveBenefitMonthly = fatherLeaveBenefit && fatherChildcareLeaveDuration > 0 
      ? fatherLeaveBenefit.amount / fatherChildcareLeaveDuration 
      : 0;

    for (let month = 0; month < selectedPeriod; month++) {
      const monthLabel = `${month + 1}ヶ月目`;
      
      // 通常の収入
      let normalIncome = monthlyMotherIncome + monthlyFatherIncome;
      
      // 休業中の収入減少
      let incomeReduction = 0;
      let leaveBenefit = 0;
      let maternityAllowancePayment = 0;
      
      // 産休期間（出産前maternityLeaveStartヶ月から出産後maternityLeaveDurationヶ月まで）
      if (month >= maternityLeaveStart && month < maternityLeaveEndMonth) {
        incomeReduction += monthlyMotherIncome;
        maternityAllowancePayment = maternityAllowanceMonthly;
      }
      
      // 母親の育児休業期間
      if (month >= motherChildcareLeaveStart && month < motherChildcareLeaveEndMonth) {
        // 産休と重複しない場合のみ収入減少を追加
        if (!(month >= maternityLeaveStart && month < maternityLeaveEndMonth)) {
          incomeReduction += monthlyMotherIncome;
        }
        leaveBenefit += motherLeaveBenefitMonthly;
      }
      
      // 父親の育児休業期間
      if (month >= fatherChildcareLeaveStart && month < fatherChildcareLeaveEndMonth) {
        incomeReduction += monthlyFatherIncome;
        leaveBenefit += fatherLeaveBenefitMonthly;
      }
      
      // 出産育児一時金（0ヶ月目のみ）
      const lumpSumPayment = month === 0 ? lumpSum : 0;
      
      // 児童手当（出産後から毎月）
      const childAllowancePayment = month >= 0 ? childAllowance : 0;
      
      // 支給金額合計
      const totalBenefits = leaveBenefit + maternityAllowancePayment + lumpSumPayment + childAllowancePayment;
      
      // 実質収入（通常収入 - 収入減少 + 支給金額）
      const actualIncome = normalIncome - incomeReduction + totalBenefits;
      
      // 収支（実質収入 - 通常収入）
      const balance = actualIncome - normalIncome;

      data.push({
        month: monthLabel,
        monthIndex: month,
        normalIncome: Math.round(normalIncome),
        incomeReduction: Math.round(incomeReduction),
        maternityAllowancePayment: Math.round(maternityAllowancePayment * 10) / 10,
        leaveBenefit: Math.round(leaveBenefit * 10) / 10,
        lumpSumPayment: Math.round(lumpSumPayment * 10) / 10,
        childAllowancePayment: Math.round(childAllowancePayment * 10) / 10,
        totalBenefits: Math.round(totalBenefits * 10) / 10,
        actualIncome: Math.round(actualIncome),
        balance: Math.round(balance * 10) / 10
      });
    }

    return data;
  }, [basicInfo, selectedPeriod, maternityLeaveStart, maternityLeaveDuration, motherChildcareLeaveStart, motherChildcareLeaveDuration, fatherChildcareLeaveStart, fatherChildcareLeaveDuration]);

  // 1つのグラフ用のデータ（世帯共通、母親、父親を横並びで表示）
  const combinedChartData = useMemo(() => {
    if (!basicInfo) return [];

    const motherIncome = parseInt(basicInfo.annualIncome || 0, 10);
    const fatherIncome = parseInt(basicInfo.fatherAnnualIncome || 0, 10);
    const monthlyMotherIncome = motherIncome / 12;
    const monthlyFatherIncome = fatherIncome / 12;
    
    const maternityAllowance = calculateMaternityAllowance(motherIncome, maternityLeaveDuration);
    const motherLeaveBenefit = calculateChildcareLeaveBenefit(motherIncome, motherChildcareLeaveDuration);
    const fatherLeaveBenefit = calculateChildcareLeaveBenefit(fatherIncome, fatherChildcareLeaveDuration);
    
    // データオブジェクトを作成（各カテゴリごとに）
    const data = [];
    
    // 世帯共通
    const householdData = { category: '世帯共通' };
    householdData['出産育児一時金'] = 50;
    householdData['児童手当（年間）'] = 1.5 * 12;
    // 合計値を計算
    let householdTotal = 0;
    Object.keys(householdData).forEach(key => {
      if (key !== 'category' && householdData[key] !== undefined && householdData[key] !== null) {
        householdTotal += householdData[key];
      }
    });
    householdData.total = householdTotal;
    data.push(householdData);
    
    // 母親
    const motherData = { category: '母親' };
    if (maternityAllowance && maternityLeaveDuration > 0) {
      motherData['出産手当金'] = Math.round(maternityAllowance.amount * 10) / 10;
    }
    if (motherLeaveBenefit && motherChildcareLeaveDuration > 0) {
      motherData['育児休業給付金'] = Math.round(motherLeaveBenefit.amount * 10) / 10;
    }
    if (maternityLeaveDuration > 0 && motherIncome > 0) {
      motherData['産休による収入減少'] = -Math.round(monthlyMotherIncome * maternityLeaveDuration * 10) / 10;
    }
    if (motherChildcareLeaveDuration > 0 && motherIncome > 0) {
      const overlapStart = Math.max(maternityLeaveStart, motherChildcareLeaveStart);
      const overlapEnd = Math.min(maternityLeaveStart + maternityLeaveDuration, motherChildcareLeaveStart + motherChildcareLeaveDuration);
      const overlapMonths = Math.max(0, overlapEnd - overlapStart);
      const effectiveMonths = motherChildcareLeaveDuration - overlapMonths;
      if (effectiveMonths > 0) {
        motherData['育児休業による収入減少'] = -Math.round(monthlyMotherIncome * effectiveMonths * 10) / 10;
      }
    }
    // 合計値を計算
    let motherTotal = 0;
    Object.keys(motherData).forEach(key => {
      if (key !== 'category' && motherData[key] !== undefined && motherData[key] !== null) {
        motherTotal += motherData[key];
      }
    });
    motherData.total = motherTotal;
    data.push(motherData);
    
    // 父親
    const fatherData = { category: '父親' };
    if (fatherLeaveBenefit && fatherChildcareLeaveDuration > 0) {
      fatherData['育児休業給付金'] = Math.round(fatherLeaveBenefit.amount * 10) / 10;
    }
    if (fatherChildcareLeaveDuration > 0 && fatherIncome > 0) {
      fatherData['育児休業による収入減少'] = -Math.round(monthlyFatherIncome * fatherChildcareLeaveDuration * 10) / 10;
    }
    // 合計値を計算
    let fatherTotal = 0;
    Object.keys(fatherData).forEach(key => {
      if (key !== 'category' && fatherData[key] !== undefined && fatherData[key] !== null) {
        fatherTotal += fatherData[key];
      }
    });
    fatherData.total = fatherTotal;
    data.push(fatherData);
    
    return data;
  }, [basicInfo, maternityLeaveDuration, motherChildcareLeaveDuration, fatherChildcareLeaveDuration, maternityLeaveStart, motherChildcareLeaveStart, fatherChildcareLeaveStart]);
  
  // グラフに表示する項目のリスト（全てのカテゴリから収集）
  const allChartKeys = useMemo(() => {
    const keys = new Set();
    combinedChartData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'category' && key !== 'total') {
          keys.add(key);
        }
      });
    });
    return Array.from(keys);
  }, [combinedChartData]);
  
  // 表示モードに応じてフィルタリングされた項目のリスト
  const chartKeys = useMemo(() => {
    return allChartKeys.filter(key => {
      const isPositive = !key.includes('収入減少');
      const isNegative = key.includes('収入減少');
      
      if (benefitChartMode === 'positive' && !isPositive) return false;
      if (benefitChartMode === 'negative' && !isNegative) return false;
      return true;
    });
  }, [allChartKeys, benefitChartMode]);
  
  // 各項目の色を定義
  const keyColors = {
    '出産育児一時金': '#667eea',
    '児童手当（年間）': '#10b981',
    '出産手当金': '#ec4899',
    '育児休業給付金': '#f59e0b',
    '産休による収入減少': '#dc2626',
    '育児休業による収入減少': '#ef4444'
  };
  


  // 累積収支データ
  const cumulativeData = useMemo(() => {
    if (!monthlyData.length) return [];
    
    let cumulativeBalance = 0;
    return monthlyData.map(item => {
      cumulativeBalance += item.balance;
      return {
        ...item,
        cumulativeBalance: Math.round(cumulativeBalance * 10) / 10
      };
    });
  }, [monthlyData]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="payment-amount-page">
      <div className="payment-amount-content-card">
        <div className="payment-amount-content">
          <div className="intro-section">
            <div className="intro-header">
              <div>
                <h2>収支概算</h2>
                <p>
                  出産・育児に伴う収入と支出の概算を確認できます。
                  各支援制度の支給金額と収入減少を可視化し、経済的な見通しを立てることができます。
                </p>
                {!basicInfo || (!basicInfo.annualIncome && !basicInfo.fatherAnnualIncome) ? (
                  <div className="info-message" style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#92400e'
                  }}>
                    <strong>基本情報の入力が必要です</strong>
                    <p style={{ margin: '8px 0 0 0' }}>
                      マイページで年収を設定すると、より正確な収支シミュレーションが表示されます。
                    </p>
                  </div>
                ) : (
                  <div className="info-message" style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#065f46'
                  }}>
                    <strong>収支シミュレーション</strong>
                    <p style={{ margin: '8px 0 0 0' }}>
                      母親年収: {basicInfo.annualIncome ? `${basicInfo.annualIncome}万円` : '未設定'} / 
                      父親年収: {basicInfo.fatherAnnualIncome ? `${basicInfo.fatherAnnualIncome}万円` : '未設定'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {basicInfo && (basicInfo.annualIncome || basicInfo.fatherAnnualIncome) && (
            <>
              {/* 期間選択と休業期間設定 */}
              <div className="settings-section" style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  シミュレーション設定
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  {/* 表示期間 */}
                  <div className="setting-item">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                      表示期間
                    </label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(parseInt(e.target.value, 10))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value={6}>6ヶ月</option>
                      <option value={12}>12ヶ月</option>
                      <option value={18}>18ヶ月</option>
                      <option value={24}>24ヶ月</option>
                    </select>
                  </div>

                  {/* 産休期間 */}
                  <div className="setting-item">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                      産休期間（月）
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={maternityLeaveDuration}
                      onChange={(e) => setMaternityLeaveDuration(parseInt(e.target.value, 10) || 1)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px'
                      }}
                    />
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                      出産前1ヶ月 + 出産後{maternityLeaveDuration - 1}ヶ月
                    </p>
                  </div>

                  {/* 母親の育児休業期間 */}
                  <div className="setting-item">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                      母親の育児休業期間（月）
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#6b7280' }}>開始月</label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={motherChildcareLeaveStart}
                          onChange={(e) => setMotherChildcareLeaveStart(parseInt(e.target.value, 10) || 0)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#6b7280' }}>期間</label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={motherChildcareLeaveDuration}
                          onChange={(e) => setMotherChildcareLeaveDuration(parseInt(e.target.value, 10) || 0)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 父親の育児休業期間 */}
                  <div className="setting-item">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                      父親の育児休業期間（月）
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#6b7280' }}>開始月</label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={fatherChildcareLeaveStart}
                          onChange={(e) => setFatherChildcareLeaveStart(parseInt(e.target.value, 10) || 0)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#6b7280' }}>期間</label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={fatherChildcareLeaveDuration}
                          onChange={(e) => setFatherChildcareLeaveDuration(parseInt(e.target.value, 10) || 0)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 支給金額の内訳（積み上げ棒グラフ） */}
              <div className="chart-section" style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                    支給金額と収入減少の内訳
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setBenefitChartMode('positive')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        backgroundColor: benefitChartMode === 'positive' ? '#667eea' : '#ffffff',
                        color: benefitChartMode === 'positive' ? '#ffffff' : '#374151',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: benefitChartMode === 'positive' ? '600' : '500',
                        transition: 'all 0.2s ease',
                        boxShadow: benefitChartMode === 'positive' ? '0 2px 4px rgba(102, 126, 234, 0.2)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (benefitChartMode !== 'positive') {
                          e.target.style.backgroundColor = '#f3f4f6';
                          e.target.style.borderColor = '#9ca3af';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (benefitChartMode !== 'positive') {
                          e.target.style.backgroundColor = '#ffffff';
                          e.target.style.borderColor = '#d1d5db';
                        }
                      }}
                    >
                      プラスのみ
                    </button>
                    <button
                      onClick={() => setBenefitChartMode('negative')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        backgroundColor: benefitChartMode === 'negative' ? '#dc2626' : '#ffffff',
                        color: benefitChartMode === 'negative' ? '#ffffff' : '#374151',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: benefitChartMode === 'negative' ? '600' : '500',
                        transition: 'all 0.2s ease',
                        boxShadow: benefitChartMode === 'negative' ? '0 2px 4px rgba(220, 38, 38, 0.2)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (benefitChartMode !== 'negative') {
                          e.target.style.backgroundColor = '#f3f4f6';
                          e.target.style.borderColor = '#9ca3af';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (benefitChartMode !== 'negative') {
                          e.target.style.backgroundColor = '#ffffff';
                          e.target.style.borderColor = '#d1d5db';
                        }
                      }}
                    >
                      マイナスのみ
                    </button>
                    <button
                      onClick={() => setBenefitChartMode('combined')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        backgroundColor: benefitChartMode === 'combined' ? '#667eea' : '#ffffff',
                        color: benefitChartMode === 'combined' ? '#ffffff' : '#374151',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: benefitChartMode === 'combined' ? '600' : '500',
                        transition: 'all 0.2s ease',
                        boxShadow: benefitChartMode === 'combined' ? '0 2px 4px rgba(102, 126, 234, 0.2)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (benefitChartMode !== 'combined') {
                          e.target.style.backgroundColor = '#f3f4f6';
                          e.target.style.borderColor = '#9ca3af';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (benefitChartMode !== 'combined') {
                          e.target.style.backgroundColor = '#ffffff';
                          e.target.style.borderColor = '#d1d5db';
                        }
                      }}
                    >
                      合算表記
                    </button>
                  </div>
                </div>
                
                {/* 1つのグラフで3つのカテゴリを横並びで表示 */}
                <ResponsiveContainer width="100%" height={benefitChartMode === 'negative' ? 450 : 400}>
                  <BarChart 
                    data={combinedChartData} 
                    margin={{ 
                      top: 30, 
                      right: 30, 
                      left: 20, 
                      bottom: benefitChartMode === 'negative' ? 80 : 10 
                    }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#e5e7eb"
                      strokeOpacity={0.5}
                    />
                    <XAxis 
                      dataKey="category" 
                      tick={{ 
                        fontSize: 14, 
                        fill: '#374151',
                        fontWeight: '500'
                      }}
                      axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      tickLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      tick={{ 
                        fontSize: 13, 
                        fill: '#6b7280',
                        fontWeight: '400'
                      }}
                      axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      tickLine={{ stroke: '#d1d5db' }}
                      domain={benefitChartMode === 'negative' ? ['dataMin - 50', 'dataMax + 10'] : ['auto', 'auto']}
                      label={{ 
                        value: '金額（万円）', 
                        angle: -90, 
                        position: 'insideLeft', 
                        style: { 
                          textAnchor: 'middle', 
                          fill: '#374151',
                          fontSize: '14px',
                          fontWeight: '500'
                        } 
                      }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (value === undefined || value === null) return '';
                        return [`${value >= 0 ? '+' : ''}${value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`, name];
                      }}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '12px 16px'
                      }}
                      labelStyle={{ 
                        color: '#1f2937',
                        fontWeight: '600',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}
                      itemStyle={{ 
                        color: '#374151',
                        fontSize: '13px',
                        padding: '4px 0'
                      }}
                      separator=": "
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '24px',
                        paddingBottom: '8px'
                      }}
                      iconType="square"
                      iconSize={12}
                      formatter={(value) => {
                        // 収入減少の項目は特別な表示
                        if (value.includes('収入減少')) {
                          return value;
                        }
                        return value;
                      }}
                      style={{ 
                        fontSize: '12px',
                        color: '#374151',
                        fontWeight: '400'
                      }}
                    />
                    {chartKeys.map((key, index) => {
                      // 最後のバー（最上部）かどうかを判定
                      const isLastBar = index === chartKeys.length - 1;
                      
                      return (
                        <Bar 
                          key={key}
                          dataKey={key} 
                          stackId="stack"
                          fill={keyColors[key] || '#9ca3af'}
                          name={key}
                          radius={isLastBar ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                        >
                          {combinedChartData.map((entry, entryIndex) => {
                            const value = entry[key];
                            // 値が0またはundefinedの場合は透明にする
                            if (value === undefined || value === null || value === 0) {
                              return <Cell key={`cell-${entryIndex}`} fill="transparent" />;
                            }
                            return (
                              <Cell 
                                key={`cell-${entryIndex}`} 
                                fill={keyColors[key] || '#9ca3af'}
                                style={{ 
                                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                                }}
                              />
                            );
                          })}
                          {isLastBar && (
                            <LabelList
                              dataKey={(entry) => {
                                // 表示モードに応じて、表示されている項目だけの合計を計算
                                let displayTotal = 0;
                                Object.keys(entry).forEach(key => {
                                  if (key !== 'category' && key !== 'total') {
                                    const itemValue = entry[key];
                                    if (itemValue !== undefined && itemValue !== null && itemValue !== 0) {
                                      const isPositive = !key.includes('収入減少');
                                      const isNegative = key.includes('収入減少');
                                      
                                      // モードに応じてフィルタリング
                                      if (benefitChartMode === 'positive' && isPositive) {
                                        displayTotal += itemValue;
                                      } else if (benefitChartMode === 'negative' && isNegative) {
                                        displayTotal += itemValue;
                                      } else if (benefitChartMode === 'combined') {
                                        displayTotal += itemValue;
                                      }
                                    }
                                  }
                                });
                                return displayTotal;
                              }}
                              position={benefitChartMode === 'negative' ? 'bottom' : 'top'}
                              formatter={(value) => {
                                if (value === undefined || value === null || value === 0) return '';
                                return `${value >= 0 ? '+' : ''}${value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`;
                              }}
                              content={(props) => {
                                const { x, y, width, value } = props;
                                if (value === undefined || value === null || value === 0 || value === '') return null;
                                
                                // valueが数値の場合は文字列に変換
                                const numValue = typeof value === 'number' ? value : parseFloat(value);
                                if (isNaN(numValue)) return null;
                                
                                const isPositive = numValue >= 0;
                                const fillColor = isPositive ? '#10b981' : '#dc2626';
                                const bgColor = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(220, 38, 38, 0.1)';
                                const displayValue = `${isPositive ? '+' : ''}${numValue.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`;
                                
                                // マイナスモードの場合は、ラベルをバーのすぐ下に配置
                                // yはバーの下端の位置（負の値）なので、そのすぐ下（少し下に移動）に配置
                                // X軸のカテゴリラベルとの間に適切なスペースを確保しつつ、グラフに近づける
                                const labelY = benefitChartMode === 'negative' ? y + 8 : y - 28;
                                
                                return (
                                  <g>
                                    <rect
                                      x={x + width / 2 - 50}
                                      y={labelY}
                                      width={100}
                                      height={24}
                                      rx={12}
                                      fill={bgColor}
                                      stroke={fillColor}
                                      strokeWidth={2}
                                    />
                                    <text
                                      x={x + width / 2}
                                      y={labelY + 16}
                                      textAnchor="middle"
                                      fill={fillColor}
                                      fontSize="14"
                                      fontWeight="700"
                                      style={{
                                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                      }}
                                    >
                                      {displayValue}
                                    </text>
                                  </g>
                                );
                              }}
                            />
                          )}
                        </Bar>
                      );
                    })}
                  </BarChart>
                </ResponsiveContainer>
                
                {/* 計算の詳細 */}
                <div style={{
                  marginTop: '32px',
                  padding: '20px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ 
                    margin: '0 0 16px 0', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    borderBottom: '2px solid #e5e7eb',
                    paddingBottom: '8px'
                  }}>
                    計算の詳細
                  </h4>
                  
                  {combinedChartData.map((categoryData, categoryIndex) => {
                    const category = categoryData.category;
                    const positiveItems = [];
                    const negativeItems = [];
                    
                    // プラスとマイナスの項目を分類
                    Object.keys(categoryData).forEach(key => {
                      if (key !== 'category') {
                        const value = categoryData[key];
                        if (value !== undefined && value !== null && value !== 0) {
                          if (value > 0) {
                            positiveItems.push({ name: key, value });
                          } else {
                            negativeItems.push({ name: key, value: Math.abs(value) });
                          }
                        }
                      }
                    });
                    
                    if (positiveItems.length === 0 && negativeItems.length === 0) {
                      return null;
                    }
                    
                    return (
                      <div key={categoryIndex} style={{ marginBottom: '24px' }}>
                        <h5 style={{ 
                          margin: '0 0 12px 0', 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#374151'
                        }}>
                          {category}
                        </h5>
                        
                        {/* プラス項目とマイナス項目を左右に配置 */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '24px',
                          flexWrap: 'wrap'
                        }}>
                          {/* 左側: プラス項目 */}
                          <div style={{ 
                            flex: '1',
                            minWidth: '300px'
                          }}>
                            {positiveItems.length > 0 ? (
                              <>
                                <div style={{ 
                                  fontSize: '13px', 
                                  fontWeight: '600', 
                                  color: '#10b981',
                                  marginBottom: '8px'
                                }}>
                                  ＋（支給金額）
                                </div>
                                <ul style={{ 
                                  margin: 0, 
                                  paddingLeft: '20px',
                                  fontSize: '12px',
                                  color: '#4b5563',
                                  lineHeight: '1.8'
                                }}>
                                  {positiveItems.map((item, index) => {
                                    // 計算方法を表示
                                    let calculationMethod = '';
                                    const motherIncome = parseInt(basicInfo?.annualIncome || 0, 10);
                                    const fatherIncome = parseInt(basicInfo?.fatherAnnualIncome || 0, 10);
                                    
                                    if (item.name === '出産育児一時金') {
                                      calculationMethod = `（固定額: 50万円）`;
                                    } else if (item.name === '児童手当（年間）') {
                                      calculationMethod = `（固定額: 1.5万円/月 × 12ヶ月 = 18万円）`;
                                    } else if (item.name === '出産手当金') {
                                      const monthlyIncome = motherIncome / 12;
                                      const dailyIncome = monthlyIncome / 30;
                                      const dailyAllowance = dailyIncome * (2 / 3);
                                      const totalDays = maternityLeaveDuration * 30;
                                      calculationMethod = `（計算式: (年収${motherIncome}万円 ÷ 12ヶ月 ÷ 30日) × (2/3) × ${totalDays}日 = ${item.value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円）`;
                                    } else if (item.name === '育児休業給付金') {
                                      if (category === '母親') {
                                        const monthlyIncome = motherIncome / 12;
                                        const dailyIncome = monthlyIncome / 30;
                                        const leaveDays = motherChildcareLeaveDuration * 30;
                                        const first6MonthsDays = Math.min(leaveDays, 180);
                                        const after6MonthsDays = Math.max(0, leaveDays - 180);
                                        const first6MonthsBenefit = dailyIncome * first6MonthsDays * 0.67;
                                        const after6MonthsBenefit = dailyIncome * after6MonthsDays * 0.50;
                                        calculationMethod = `（計算式: (年収${motherIncome}万円 ÷ 12ヶ月 ÷ 30日) × 0.67 × ${first6MonthsDays}日 + (年収${motherIncome}万円 ÷ 12ヶ月 ÷ 30日) × 0.50 × ${after6MonthsDays}日 = ${item.value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円）`;
                                      } else if (category === '父親') {
                                        const monthlyIncome = fatherIncome / 12;
                                        const dailyIncome = monthlyIncome / 30;
                                        const leaveDays = fatherChildcareLeaveDuration * 30;
                                        const first6MonthsDays = Math.min(leaveDays, 180);
                                        const after6MonthsDays = Math.max(0, leaveDays - 180);
                                        calculationMethod = `（計算式: (年収${fatherIncome}万円 ÷ 12ヶ月 ÷ 30日) × 0.67 × ${first6MonthsDays}日 + (年収${fatherIncome}万円 ÷ 12ヶ月 ÷ 30日) × 0.50 × ${after6MonthsDays}日 = ${item.value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円）`;
                                      }
                                    }
                                    
                                    return (
                                      <li key={index} style={{ marginBottom: '8px' }}>
                                        <strong>{item.name}</strong>: {item.value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円
                                        {calculationMethod && (
                                          <span style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginTop: '2px' }}>{calculationMethod}</span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </>
                            ) : (
                              <div style={{ 
                                fontSize: '12px', 
                                color: '#9ca3af',
                                fontStyle: 'italic'
                              }}>
                                該当なし
                              </div>
                            )}
                          </div>
                          
                          {/* 右側: マイナス項目 */}
                          <div style={{ 
                            flex: '1',
                            minWidth: '300px'
                          }}>
                            {negativeItems.length > 0 ? (
                              <>
                                <div style={{ 
                                  fontSize: '13px', 
                                  fontWeight: '600', 
                                  color: '#dc2626',
                                  marginBottom: '8px'
                                }}>
                                  −（収入減少）
                                </div>
                                <ul style={{ 
                                  margin: 0, 
                                  paddingLeft: '20px',
                                  fontSize: '12px',
                                  color: '#4b5563',
                                  lineHeight: '1.8'
                                }}>
                                  {negativeItems.map((item, index) => {
                                    // 計算方法を表示
                                    let calculationMethod = '';
                                    const motherIncome = parseInt(basicInfo?.annualIncome || 0, 10);
                                    const fatherIncome = parseInt(basicInfo?.fatherAnnualIncome || 0, 10);
                                    
                                    if (item.name === '産休による収入減少') {
                                      const monthlyIncome = motherIncome / 12;
                                      calculationMethod = `（計算式: 年収${motherIncome}万円 ÷ 12ヶ月 × ${maternityLeaveDuration}ヶ月 = ${item.value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円）`;
                                    } else if (item.name === '育児休業による収入減少') {
                                      if (category === '母親') {
                                        const monthlyIncome = motherIncome / 12;
                                        const overlapStart = Math.max(maternityLeaveStart, motherChildcareLeaveStart);
                                        const overlapEnd = Math.min(maternityLeaveStart + maternityLeaveDuration, motherChildcareLeaveStart + motherChildcareLeaveDuration);
                                        const overlapMonths = Math.max(0, overlapEnd - overlapStart);
                                        const effectiveMonths = motherChildcareLeaveDuration - overlapMonths;
                                        calculationMethod = `（計算式: 年収${motherIncome}万円 ÷ 12ヶ月 × ${effectiveMonths}ヶ月（育児休業${motherChildcareLeaveDuration}ヶ月 - 産休との重複${overlapMonths}ヶ月）= ${item.value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円）`;
                                      } else if (category === '父親') {
                                        const monthlyIncome = fatherIncome / 12;
                                        calculationMethod = `（計算式: 年収${fatherIncome}万円 ÷ 12ヶ月 × ${fatherChildcareLeaveDuration}ヶ月 = ${item.value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円）`;
                                      }
                                    }
                                    
                                    return (
                                      <li key={index} style={{ marginBottom: '8px' }}>
                                        <strong>{item.name}</strong>: {item.value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円
                                        {calculationMethod && (
                                          <span style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginTop: '2px' }}>{calculationMethod}</span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </>
                            ) : (
                              <div style={{ 
                                fontSize: '12px', 
                                color: '#9ca3af',
                                fontStyle: 'italic'
                              }}>
                                該当なし
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* 計算方法の説明 */}
                  <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '6px',
                    border: '1px solid #bfdbfe'
                  }}>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#1e40af',
                      marginBottom: '6px'
                    }}>
                      計算方法の説明
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#1e3a8a',
                      lineHeight: '1.6'
                    }}>
                      <p style={{ margin: '4px 0' }}>
                        <strong>【支給金額の計算】</strong>
                      </p>
                      <ul style={{ margin: '4px 0 8px 0', paddingLeft: '20px' }}>
                        <li><strong>出産育児一時金:</strong> 固定額50万円（健康保険から支給）</li>
                        <li><strong>児童手当:</strong> 固定額1.5万円/月 × 12ヶ月 = 18万円/年（0-3歳未満の場合）</li>
                        <li><strong>出産手当金:</strong> (年収 ÷ 12ヶ月 ÷ 30日) × (2/3) × 産休日数（標準報酬日額の2/3）</li>
                        <li><strong>育児休業給付金:</strong> 
                          <ul style={{ margin: '2px 0', paddingLeft: '16px' }}>
                            <li>最初の180日: (年収 ÷ 12ヶ月 ÷ 30日) × 0.67 × 日数（休業開始前賃金の67%）</li>
                            <li>180日以降: (年収 ÷ 12ヶ月 ÷ 30日) × 0.50 × 日数（休業開始前賃金の50%）</li>
                          </ul>
                        </li>
                      </ul>
                      <p style={{ margin: '4px 0' }}>
                        <strong>【収入減少の計算】</strong>
                      </p>
                      <ul style={{ margin: '4px 0 8px 0', paddingLeft: '20px' }}>
                        <li><strong>産休による収入減少:</strong> 年収 ÷ 12ヶ月 × 産休期間（月数）</li>
                        <li><strong>育児休業による収入減少:</strong> 年収 ÷ 12ヶ月 × 有効な育児休業期間（月数）</li>
                        <li><strong>母親の育児休業:</strong> 産休と育児休業が重複する期間は、収入減少の計算から除外しています。</li>
                      </ul>
                      <p style={{ margin: '4px 0', fontSize: '10px', color: '#64748b' }}>
                        ※ 計算は概算です。実際の支給額は勤務先や保険組合によって異なる場合があります。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 月別収支表 */}
              <div className="table-section" style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  月別収支表
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="monthly-balance-table" style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>月</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>通常収入</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#dc2626' }}>収入減少</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#ec4899' }}>出産手当金</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>休業手当</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>出産育児一時金</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>児童手当</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>支給金額合計</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>実質収入</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>収支</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.map((row, index) => (
                        <tr key={index} style={{
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: row.balance >= 0 ? '#f0fdf4' : '#fef2f2'
                        }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{row.month}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{row.normalIncome}万円</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626' }}>-{row.incomeReduction}万円</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#ec4899' }}>{row.maternityAllowancePayment.toFixed(1)}万円</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#10b981' }}>{row.leaveBenefit.toFixed(1)}万円</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#10b981' }}>{row.lumpSumPayment.toFixed(1)}万円</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#10b981' }}>{row.childAllowancePayment.toFixed(1)}万円</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#10b981', fontWeight: '600' }}>{row.totalBenefits.toFixed(1)}万円</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>{row.actualIncome}万円</td>
                          <td style={{
                            padding: '12px',
                            textAlign: 'right',
                            fontWeight: '600',
                            color: row.balance >= 0 ? '#10b981' : '#dc2626'
                          }}>
                            {row.balance >= 0 ? '+' : ''}{row.balance.toFixed(1)}万円
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 収支の推移（折れ線グラフ） */}
              <div className="chart-section" style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  収支の推移
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart 
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#e5e7eb" 
                      strokeOpacity={0.5}
                    />
                    <XAxis 
                      dataKey="month" 
                      tick={{ 
                        fontSize: 13, 
                        fill: '#374151',
                        fontWeight: '500'
                      }}
                      axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      tickLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      tick={{ 
                        fontSize: 13, 
                        fill: '#6b7280',
                        fontWeight: '400'
                      }}
                      axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      tickLine={{ stroke: '#d1d5db' }}
                      label={{ 
                        value: '金額（万円）', 
                        angle: -90, 
                        position: 'insideLeft', 
                        style: { 
                          textAnchor: 'middle', 
                          fill: '#374151',
                          fontSize: '14px',
                          fontWeight: '500'
                        } 
                      }}
                    />
                    <Tooltip 
                      formatter={(value) => `${value}万円`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '12px'
                      }}
                      labelStyle={{ 
                        color: '#374151',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="normalIncome" 
                      fill="#e5e7eb" 
                      fillOpacity={0.6}
                      stroke="#9ca3af" 
                      strokeWidth={2}
                      name="通常収入" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="actualIncome" 
                      fill="#93c5fd" 
                      fillOpacity={0.6}
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="実質収入" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="maternityAllowancePayment" 
                      stroke="#ec4899" 
                      strokeWidth={3}
                      dot={{ fill: '#ec4899', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="出産手当金" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="leaveBenefit" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="休業手当" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#10b981" 
                      strokeWidth={4}
                      dot={{ fill: '#10b981', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="収支" 
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* 累積収支の推移 */}
              <div className="chart-section" style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  累積収支の推移
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart 
                    data={cumulativeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#e5e7eb" 
                      strokeOpacity={0.5}
                    />
                    <XAxis 
                      dataKey="month" 
                      tick={{ 
                        fontSize: 13, 
                        fill: '#374151',
                        fontWeight: '500'
                      }}
                      axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      tickLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      tick={{ 
                        fontSize: 13, 
                        fill: '#6b7280',
                        fontWeight: '400'
                      }}
                      axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      tickLine={{ stroke: '#d1d5db' }}
                      label={{ 
                        value: '金額（万円）', 
                        angle: -90, 
                        position: 'insideLeft', 
                        style: { 
                          textAnchor: 'middle', 
                          fill: '#374151',
                          fontSize: '14px',
                          fontWeight: '500'
                        } 
                      }}
                    />
                    <Tooltip 
                      formatter={(value) => `${value}万円`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '12px'
                      }}
                      labelStyle={{ 
                        color: '#374151',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulativeBalance"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#colorGradient)"
                      fillOpacity={0.6}
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="累積収支"
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#d1fae5" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentAmount;
