import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOwnerId } from '../hooks/useOwnerId';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { initialSupportSystemsData, categoryLabels } from '../utils/supportSystemsData';
import './Statistics.css';

const Statistics = () => {
  const { currentUser } = useAuth();
  const { ownerId, loading: ownerIdLoading } = useOwnerId();
  const [expandedCategoriesMother, setExpandedCategoriesMother] = useState(new Set());
  const [expandedCategoriesFather, setExpandedCategoriesFather] = useState(new Set());
  const [basicInfo, setBasicInfo] = useState(null);

  // 支給金額から数値を抽出する関数（万円単位）
  const extractAmount = (amountStr) => {
    if (!amountStr) return null;
    
    // 「50万円」のような形式から数値を抽出
    const match = amountStr.match(/(\d+(?:\.\d+)?)\s*万円/);
    if (match) {
      return parseFloat(match[1]);
    }
    
    // 「15,000円」のような形式から数値を抽出（万円に変換）
    const yenMatch = amountStr.match(/(\d{1,3}(?:,\d{3})*)\s*円/);
    if (yenMatch) {
      const yenValue = parseInt(yenMatch[1].replace(/,/g, ''), 10);
      return yenValue / 10000; // 万円に変換
    }
    
    return null; // 計算式など、数値が抽出できない場合はnull
  };

  // 育児休業給付金の概算を計算する関数
  const calculateChildcareLeaveBenefit = (annualIncome, leaveDays = 180) => {
    if (!annualIncome || annualIncome === '') return null;
    
    const annualIncomeNum = parseInt(annualIncome, 10);
    if (isNaN(annualIncomeNum) || annualIncomeNum <= 0) return null;
    
    // 年収から月収を計算（万円単位）
    const monthlyIncome = annualIncomeNum / 12;
    // 月収から日給を計算（万円単位、1ヶ月=30日として計算）
    const dailyIncome = monthlyIncome / 30;
    
    // 育児休業給付金の計算
    // 最初の6ヶ月（180日）は67%、それ以降は50%
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

  // 休業手当に関連する制度を判定する関数
  const isLeaveBenefitSystem = (system) => {
    const title = system.title || '';
    const description = system.description || '';
    const tags = system.tags || [];
    
    // 育児休業、産後パパ育休、出生後休業支援、育児時短、出産手当金など
    return title.includes('育児休業') ||
           title.includes('産後パパ育休') ||
           title.includes('出生後休業支援') ||
           title.includes('育児時短') ||
           title.includes('出産手当金') ||
           description.includes('育児休業') ||
           description.includes('休業') ||
           tags.some(tag => tag.includes('育児休業') || tag.includes('休業'));
  };

  // 母親向けの制度を判定する関数
  const isMotherSystem = (system) => {
    const title = system.title || '';
    const description = system.description || '';
    const tags = system.tags || [];
    const targetAudience = system.targetAudience || [];
    
    // 産後パパ育休は父親向けなので除外
    if (title.includes('産後パパ育休') || title.includes('パパ育休') || description.includes('父親')) {
      return false;
    }
    
    // 妊婦向け、出産手当金、母親向けの制度
    return targetAudience.includes('pregnant') ||
           title.includes('出産手当金') ||
           title.includes('出産育児一時金') ||
           description.includes('妊婦') ||
           description.includes('出産') ||
           tags.some(tag => tag.includes('妊婦') || tag.includes('出産'));
  };

  // 父親向けの制度を判定する関数
  const isFatherSystem = (system) => {
    const title = system.title || '';
    const description = system.description || '';
    const tags = system.tags || [];
    
    // 産後パパ育休、父親向けの制度
    return title.includes('産後パパ育休') ||
           title.includes('パパ育休') ||
           title.includes('出生時育児休業') ||
           description.includes('父親') ||
           tags.some(tag => tag.includes('父親') || tag.includes('パパ'));
  };

  // 夫婦で1カウントの制度を判定する関数（父親の制度一覧でグレーアウト対象）
  const isCoupleOneCountSystem = (system) => {
    const title = system.title || '';
    const description = system.description || '';
    
    // 児童手当、出産育児一時金、出産手当金など、世帯単位または出産した人が申請する制度
    return title.includes('児童手当') ||
           title.includes('出産育児一時金') ||
           title.includes('出産手当金') ||
           description.includes('世帯') ||
           description.includes('出産した人');
  };

  // 父親が1人で育てる場合かを判定する関数
  const isSingleFather = () => {
    // 母親の年収が設定されていない、または母親の情報がない場合
    return !basicInfo || !basicInfo.annualIncome || basicInfo.annualIncome === '';
  };

  // 母親向けの統計情報
  const motherStatistics = useMemo(() => {
    const activeSystems = initialSupportSystemsData.filter(system => 
      system.isActive !== false &&
      system.category !== 'company' &&
      !system.targetAudience?.includes('company')
    );
    
    const stats = {
      national: { count: 0, totalAmount: 0, systems: [], hasLeaveBenefit: false },
      prefecture: { count: 0, totalAmount: 0, systems: [], hasLeaveBenefit: false },
      municipality: { count: 0, totalAmount: 0, systems: [], hasLeaveBenefit: false },
      private: { count: 0, totalAmount: 0, systems: [], hasLeaveBenefit: false },
      company: { count: 0, totalAmount: 0, systems: [], hasLeaveBenefit: false }
    };

    activeSystems.forEach(system => {
      const category = system.category;
      if (!category || stats[category] === undefined) return;

      let shouldInclude = false;

      // カテゴリごとのフィルタリングロジック
      switch (category) {
        case 'national':
          shouldInclude = true;
          break;
        
        case 'prefecture':
          if (basicInfo && basicInfo.prefecture) {
            if (system.prefectureName === basicInfo.prefecture) {
              shouldInclude = true;
            }
          } else {
            shouldInclude = false;
          }
          break;
        
        case 'municipality':
          if (basicInfo && basicInfo.city && system.municipalityName) {
            if (system.municipalityName === basicInfo.city) {
              shouldInclude = true;
            } else {
              const cityWithoutPrefecture = basicInfo.city.replace(/^[^都道府県]*[都道府県]/, '').trim();
              if (cityWithoutPrefecture && system.municipalityName === cityWithoutPrefecture) {
                shouldInclude = true;
              } else if (basicInfo.city.includes(system.municipalityName) || 
                         system.municipalityName.includes(basicInfo.city)) {
                shouldInclude = true;
              }
            }
          } else {
            shouldInclude = false;
          }
          break;
        
        case 'private':
          shouldInclude = true;
          break;
        
        case 'company':
          if (basicInfo && basicInfo.companyName) {
            if (system.organizationName === basicInfo.companyName ||
                system.companyName === basicInfo.companyName) {
              shouldInclude = true;
            }
          } else {
            shouldInclude = false;
          }
          break;
        
        default:
          shouldInclude = false;
      }

      if (shouldInclude) {
        const isMother = isMotherSystem(system);
        const isFather = isFatherSystem(system);
        const isBoth = !isMother && !isFather;
        
        if (isMother || isBoth) {
        stats[category].count++;
        stats[category].systems.push(system);
        
          if (isLeaveBenefitSystem(system)) {
            stats[category].hasLeaveBenefit = true;
          }
          
        const amount = extractAmount(system.amount);
        if (amount !== null) {
          stats[category].totalAmount += amount;
          }
        }
      }
    });

    return stats;
  }, [basicInfo]);

  // 父親向けの統計情報
  const fatherStatistics = useMemo(() => {
    const activeSystems = initialSupportSystemsData.filter(system => 
      system.isActive !== false &&
      system.category !== 'company' &&
      !system.targetAudience?.includes('company')
    );
    
    const stats = {
      national: { count: 0, totalAmount: 0, systems: [], hasLeaveBenefit: false },
      prefecture: { count: 0, totalAmount: 0, systems: [], hasLeaveBenefit: false },
      municipality: { count: 0, totalAmount: 0, systems: [], hasLeaveBenefit: false },
      private: { count: 0, totalAmount: 0, systems: [], hasLeaveBenefit: false },
      company: { count: 0, totalAmount: 0, systems: [], hasLeaveBenefit: false }
    };

    activeSystems.forEach(system => {
      const category = system.category;
      if (!category || stats[category] === undefined) return;

      let shouldInclude = false;

      // カテゴリごとのフィルタリングロジック
      switch (category) {
        case 'national':
          shouldInclude = true;
          break;
        
        case 'prefecture':
          if (basicInfo && basicInfo.prefecture) {
            if (system.prefectureName === basicInfo.prefecture) {
              shouldInclude = true;
            }
          } else {
            shouldInclude = false;
          }
          break;
        
        case 'municipality':
          if (basicInfo && basicInfo.city && system.municipalityName) {
            if (system.municipalityName === basicInfo.city) {
              shouldInclude = true;
            } else {
              const cityWithoutPrefecture = basicInfo.city.replace(/^[^都道府県]*[都道府県]/, '').trim();
              if (cityWithoutPrefecture && system.municipalityName === cityWithoutPrefecture) {
                shouldInclude = true;
              } else if (basicInfo.city.includes(system.municipalityName) || 
                         system.municipalityName.includes(basicInfo.city)) {
                shouldInclude = true;
              }
            }
          } else {
            shouldInclude = false;
          }
          break;
        
        case 'private':
          shouldInclude = true;
          break;
        
        case 'company':
          if (basicInfo && basicInfo.companyName) {
            if (system.organizationName === basicInfo.companyName ||
                system.companyName === basicInfo.companyName) {
              shouldInclude = true;
            }
          } else {
            shouldInclude = false;
          }
          break;
        
        default:
          shouldInclude = false;
      }

      if (shouldInclude) {
        const isMother = isMotherSystem(system);
        const isFather = isFatherSystem(system);
        const isBoth = !isMother && !isFather;
        
        if (isFather || isBoth) {
          stats[category].count++;
          stats[category].systems.push(system);
          
          if (isLeaveBenefitSystem(system)) {
            stats[category].hasLeaveBenefit = true;
          }
          
          const amount = extractAmount(system.amount);
          if (amount !== null) {
            stats[category].totalAmount += amount;
          }
        }
      }
    });

    return stats;
  }, [basicInfo]);

  // カテゴリの順序
  const categoryOrder = ['national', 'prefecture', 'municipality', 'private', 'company'];

  // 統計テーブルをレンダリングする関数
  const renderStatisticsTable = (statistics, title, isForMother) => {
    const expandedCategories = isForMother ? expandedCategoriesMother : expandedCategoriesFather;
    const setExpandedCategories = isForMother ? setExpandedCategoriesMother : setExpandedCategoriesFather;

  return (
      <div className="statistics-section">
        <h3 className="statistics-section-title">{title}</h3>
        {(!basicInfo || (isForMother && !basicInfo.annualIncome) || (!isForMother && !basicInfo.fatherAnnualIncome)) && (
          <div className="statistics-info-message" style={{ 
            padding: '16px', 
            backgroundColor: '#fef3c7', 
            border: '1px solid #f59e0b', 
            borderRadius: '8px', 
            marginBottom: '24px',
            color: '#92400e'
          }}>
            <strong>基本情報の入力が必要です</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
              {isForMother 
                ? '母親の年収をマイページで設定すると、該当する制度と休業手当の概算が表示されます。'
                : '父親の年収をマイページで設定すると、該当する制度と休業手当の概算が表示されます。'}
            </p>
          </div>
        )}
          <div className="statistics-table-container">
            <table className="statistics-table">
              <thead>
                <tr>
                  <th className="category-column">カテゴリ</th>
                  <th className="count-column">制度件数</th>
                  <th className="amount-column">支給金額合計</th>
                <th className="leave-benefit-column">休業手当（概算）</th>
                </tr>
              </thead>
              <tbody>
                {categoryOrder.map(category => {
                  const stat = statistics[category];
                if (!stat) return null;
                  const label = categoryLabels[category] || category;
                  
                  // カテゴリごとのアイコンと色
                  const categoryConfig = {
                    national: { icon: '🏛️', color: '#667eea', bgColor: '#eef2ff' },
                    prefecture: { icon: '🗾', color: '#10b981', bgColor: '#ecfdf5' },
                    municipality: { icon: '🏘️', color: '#f59e0b', bgColor: '#fffbeb' },
                    private: { icon: '🏢', color: '#8b5cf6', bgColor: '#f5f3ff' },
                    company: { icon: '💼', color: '#ec4899', bgColor: '#fdf2f8' }
                  };
                  
                  // 勤務先カテゴリは基本情報に勤務先がない場合は表示しない
                  if (category === 'company' && (!basicInfo || !basicInfo.companyName)) {
                    return null;
                  }
                  
                  const config = categoryConfig[category] || { icon: '📊', color: '#6b7280', bgColor: '#f9fafb' };
                  
                  const isExpanded = expandedCategories.has(category);
                  
                  const toggleCategory = () => {
                    const newExpanded = new Set(expandedCategories);
                    if (isExpanded) {
                      newExpanded.delete(category);
                    } else {
                      newExpanded.add(category);
                    }
                    setExpandedCategories(newExpanded);
                  };
                  
                  return (
                    <>
                      <tr 
                        key={category} 
                        className={`statistics-table-row ${isExpanded ? 'expanded' : ''}`}
                        onClick={toggleCategory}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="category-cell">
                          <div className="category-info">
                            <span className="category-icon" style={{ backgroundColor: config.bgColor }}>
                              {config.icon}
                            </span>
                            <span className="category-label">{label}</span>
                            <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                              ▼
                            </span>
                          </div>
                        </td>
                        <td className="count-cell">
                          <span className="count-value" style={{ color: config.color }}>
                            {stat.count}
                          </span>
                          <span className="count-unit">件</span>
                        </td>
                        <td className="amount-cell">
                          {stat.totalAmount > 0 ? (
                            <>
                              <span className="amount-value">
                                {stat.totalAmount.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}
                              </span>
                              <span className="amount-unit">万円</span>
                            </>
                          ) : (
                            <span className="amount-unavailable">計算不可</span>
                          )}
                        </td>
                        <td className="leave-benefit-cell">
                          {(() => {
                            // そのカテゴリに休業手当に関連する制度がある場合のみ計算
                            if (!stat.hasLeaveBenefit) {
                              return <span className="amount-unavailable">該当なし</span>;
                            }
                            
                            // 母親または父親の年収を取得
                            const income = isForMother 
                              ? basicInfo?.annualIncome 
                              : basicInfo?.fatherAnnualIncome;
                            
                            // 育児休業給付金の概算を計算
                            const calculateForIncome = (income, days) => {
                              const result = calculateChildcareLeaveBenefit(income, days);
                              return result ? result.amount : null;
                            };
                            
                            // 180日の場合
                            const total180 = calculateForIncome(income, 180) || 0;
                            
                            // 365日の場合も計算
                            const total365 = calculateForIncome(income, 365) || 0;
                            
                            if (total180 > 0) {
                              return (
                                <div className="leave-benefit-content">
                                  <div className="leave-benefit-amount-row">
                                    <div className="leave-benefit-amount">
                                      <span className="amount-value" style={{ color: '#10b981' }}>
                                        {total180.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}
                                      </span>
                                      <span className="amount-unit">万円</span>
                                    </div>
                                    <div className="leave-benefit-note">
                                      （180日休業時）
                                    </div>
                                    {total365 > total180 && (
                                      <div className="leave-benefit-note">
                                        （365日休業時: {total365.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円）
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <span className="amount-unavailable">年収未設定</span>
                              );
                            }
                          })()}
                        </td>
                      </tr>
                      {isExpanded && stat.systems.length > 0 && (
                        <tr className="systems-detail-row">
                          <td colSpan={4} className="systems-detail-cell">
                            <div className="systems-table-wrapper">
                              <table className="systems-table">
                                <thead>
                                  <tr>
                                    <th className="system-title-header">制度名</th>
                                    <th className="system-amount-header">支給金額</th>
                                    <th className="system-target-header">妊娠前</th>
                                    <th className="system-target-header">妊婦</th>
                                    <th className="system-target-header">0-1歳</th>
                                    <th className="system-target-header">1-2歳</th>
                                    <th className="system-target-header">2-3歳</th>
                                    <th className="system-target-header">3-6歳</th>
                                    <th className="system-target-header">6歳以上</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {stat.systems.map(system => {
                                    const targetAudience = system.targetAudience || [];
                                    // 妊娠前の判定：不妊治療や生殖補助医療などの制度を対象とする
                                    const isPrePregnant = system.title?.includes('不妊治療') || 
                                                         system.title?.includes('生殖補助') || 
                                                         system.title?.includes('凍結卵子') ||
                                                         system.description?.includes('不妊治療') ||
                                                         system.description?.includes('生殖補助') ||
                                                         system.tags?.some(tag => tag.includes('不妊治療') || tag.includes('生殖補助'));
                                    
                                    // 父親の制度一覧で、夫婦で1カウントの制度をグレーアウト（1人で育てる場合は除外）
                                    const shouldGrayOut = !isForMother && isCoupleOneCountSystem(system) && !isSingleFather();
                                    
                                    return (
                                      <tr 
                                        key={system.id} 
                                        className={`system-row ${shouldGrayOut ? 'grayed-out' : ''}`}
                                      >
                                        <td className="system-title-cell">{system.title}</td>
                                        <td className="system-amount-cell">
                                          {system.amount || '-'}
                                        </td>
                                        <td className="system-target-cell" style={{ color: isPrePregnant ? '#10b981' : '#d1d5db' }}>
                                          {isPrePregnant ? '◯' : '-'}
                                        </td>
                                        <td className="system-target-cell" style={{ color: targetAudience.includes('pregnant') ? '#10b981' : '#d1d5db' }}>
                                          {targetAudience.includes('pregnant') ? '◯' : '-'}
                                        </td>
                                        <td className="system-target-cell" style={{ color: targetAudience.includes('parent-0-1') ? '#10b981' : '#d1d5db' }}>
                                          {targetAudience.includes('parent-0-1') ? '◯' : '-'}
                                        </td>
                                        <td className="system-target-cell" style={{ color: targetAudience.includes('parent-1-2') ? '#10b981' : '#d1d5db' }}>
                                          {targetAudience.includes('parent-1-2') ? '◯' : '-'}
                                        </td>
                                        <td className="system-target-cell" style={{ color: targetAudience.includes('parent-2-3') ? '#10b981' : '#d1d5db' }}>
                                          {targetAudience.includes('parent-2-3') ? '◯' : '-'}
                                        </td>
                                        <td className="system-target-cell" style={{ color: targetAudience.includes('parent-3-6') ? '#10b981' : '#d1d5db' }}>
                                          {targetAudience.includes('parent-3-6') ? '◯' : '-'}
                                        </td>
                                        <td className="system-target-cell" style={{ color: targetAudience.includes('parent-6-plus') ? '#10b981' : '#d1d5db' }}>
                                          {targetAudience.includes('parent-6-plus') ? '◯' : '-'}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                              {/* 父親の制度一覧で、グレーアウトされている制度がある場合に注意事項を表示 */}
                              {!isForMother && stat.systems.some(s => isCoupleOneCountSystem(s) && !isSingleFather()) && (
                                <div className="grayed-out-notice" style={{
                                  marginTop: '16px',
                                  padding: '12px',
                                  backgroundColor: '#f3f4f6',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  color: '#6b7280',
                                  lineHeight: '1.6'
                                }}>
                                  <strong style={{ color: '#374151' }}>※ 注意事項</strong>
                                  <p style={{ margin: '8px 0 0 0' }}>
                                    グレーアウトされている制度は、世帯単位で申請する制度（両親のどちらか一方が申請者）です。
                                    通常は母親が申請するため、父親の制度一覧ではグレーアウト表示しています。
                                    父親が1人で育てる場合は、これらの制度も申請可能です。
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
    );
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="statistics-page">
      <div className="statistics-content-card">
        <div className="statistics-content">
          <div className="intro-section">
            <div className="intro-header">
              <div>
                <h2>該当制度</h2>
                <p>
                  マイページの基本情報（住所・勤務先など）に基づいて、あなたに該当する出産支援制度を確認できます。
                  {basicInfo ? (
                    <span style={{ display: 'block', marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                      ※ 基本情報に基づいて、該当する制度のみを表示しています。
                    </span>
                  ) : (
                    <span style={{ display: 'block', marginTop: '8px', fontSize: '14px', color: '#f59e0b' }}>
                      ※ マイページで基本情報を設定すると、該当する制度のみが表示されます。
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 母親の該当制度セクション */}
          {renderStatisticsTable(motherStatistics, '母親の該当制度', true)}

          {/* 父親の該当制度セクション */}
          {renderStatisticsTable(fatherStatistics, '父親の該当制度', false)}
        </div>
      </div>
    </div>
  );
};

export default Statistics;

