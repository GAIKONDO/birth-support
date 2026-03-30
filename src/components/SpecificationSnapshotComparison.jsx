import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './Specification.css';

const SpecificationSnapshotComparison = () => {
  const navigate = useNavigate();
  const radarChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const activeUsersChartRef = useRef(null);
  const [chartSize, setChartSize] = useState({ width: 800, height: 600 });

  // localStorageからスナップショットを読み込む
  const [snapshots, setSnapshots] = useState(() => {
    const saved = localStorage.getItem('businessPlanSnapshots');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedSnapshotIds, setSelectedSnapshotIds] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({ type: null, message: '' });
  const fileInputRef = useRef(null);
  const [editingSnapshotId, setEditingSnapshotId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // 選択されたスナップショットを取得
  const selectedSnapshots = useMemo(() => {
    return snapshots.filter(s => selectedSnapshotIds.includes(s.id));
  }, [snapshots, selectedSnapshotIds]);

  // チャートサイズを計算
  useEffect(() => {
    const updateChartSize = () => {
      const container = radarChartRef.current?.parentElement;
      if (container) {
        const width = Math.min(container.offsetWidth - 60, 800);
        const height = width * 0.75; // アスペクト比を維持
        setChartSize({ width, height });
      }
    };

    updateChartSize();
    window.addEventListener('resize', updateChartSize);
    return () => window.removeEventListener('resize', updateChartSize);
  }, [selectedSnapshotIds]);

  // リスク評価を計算する関数（SpecificationRiskAssessment.jsxから移植）
  const calculateRiskAssessment = (simulationResults, simulationParams) => {
    const assessments = {
      financial: { items: [] },
      market: { items: [] },
      technical: { items: [] },
      operational: { items: [] },
      privacy: { items: [] },
      competition: { items: [] }
    };

    const totalRevenue = simulationResults.reduce((sum, r) => sum + (r.totalRevenue || 0), 0);
    const totalCost = simulationResults.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    const totalSGA = simulationResults.reduce((sum, r) => sum + (r.totalSGA || 0), 0);
    const totalNetProfit = simulationResults.reduce((sum, r) => sum + (r.netProfit || 0), 0);
    const finalYearRevenue = simulationResults[simulationResults.length - 1]?.totalRevenue || 0;
    const finalYearNetProfit = simulationResults[simulationResults.length - 1]?.netProfit || 0;
    const finalYearActiveUsers = simulationResults[simulationResults.length - 1]?.activeUsers || 0;
    const targetActiveUsers = simulationParams.yearlyTargets?.[2030] || 0;

    // 売上成長率の評価
    const revenueGrowth = simulationResults.map((r, i) => {
      if (i === 0) return 0;
      const prevRevenue = simulationResults[i - 1].totalRevenue || 0;
      const currentRevenue = r.totalRevenue || 0;
      return prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    });
    const avgRevenueGrowth = revenueGrowth.slice(1).reduce((sum, g) => sum + g, 0) / (revenueGrowth.length - 1);
    
    if (avgRevenueGrowth > 100) {
      assessments.financial.items.push({ item: '売上成長率が非常に高い', risk: '高', score: 2, maxScore: 5 });
    } else if (avgRevenueGrowth > 50) {
      assessments.financial.items.push({ item: '売上成長率が高い', risk: '中', score: 3, maxScore: 5 });
    } else {
      assessments.financial.items.push({ item: '売上成長率は現実的', risk: '低', score: 4, maxScore: 5 });
    }

    // 利益率の評価
    const profitMargin = finalYearRevenue > 0 ? (finalYearNetProfit / finalYearRevenue) * 100 : 0;
    if (profitMargin < 0) {
      assessments.financial.items.push({ item: '5年目で赤字', risk: '高', score: 1, maxScore: 5 });
    } else if (profitMargin < 5) {
      assessments.financial.items.push({ item: '利益率が低い', risk: '中', score: 2, maxScore: 5 });
    } else if (profitMargin < 15) {
      assessments.financial.items.push({ item: '利益率は適切', risk: '低', score: 4, maxScore: 5 });
    } else {
      assessments.financial.items.push({ item: '利益率が高い', risk: '低', score: 5, maxScore: 5 });
    }

    // コスト構造の評価
    const costRatio = finalYearRevenue > 0 ? (totalCost / finalYearRevenue) * 100 : 0;
    if (costRatio > 90) {
      assessments.financial.items.push({ item: 'コスト比率が非常に高い', risk: '高', score: 1, maxScore: 5 });
    } else if (costRatio > 70) {
      assessments.financial.items.push({ item: 'コスト比率が高い', risk: '中', score: 2, maxScore: 5 });
    } else {
      assessments.financial.items.push({ item: 'コスト比率は適切', risk: '低', score: 4, maxScore: 5 });
    }

    // ユーザー獲得目標の評価
    const userAchievementRate = targetActiveUsers > 0 ? (finalYearActiveUsers / targetActiveUsers) * 100 : 0;
    if (userAchievementRate < 80) {
      assessments.market.items.push({ item: 'ユーザー獲得目標の達成が困難', risk: '高', score: 2, maxScore: 5 });
    } else if (userAchievementRate < 95) {
      assessments.market.items.push({ item: 'ユーザー獲得目標は達成可能', risk: '中', score: 3, maxScore: 5 });
    } else {
      assessments.market.items.push({ item: 'ユーザー獲得目標は現実的', risk: '低', score: 4, maxScore: 5 });
    }

    // 顧客単価の評価
    const arpu = finalYearActiveUsers > 0 ? (finalYearRevenue / finalYearActiveUsers) : 0;
    if (arpu < 10000) {
      assessments.market.items.push({ item: '顧客単価が低い', risk: '高', score: 2, maxScore: 5 });
    } else if (arpu < 30000) {
      assessments.market.items.push({ item: '顧客単価は適切', risk: '低', score: 4, maxScore: 5 });
    } else {
      assessments.market.items.push({ item: '顧客単価が高い', risk: '低', score: 5, maxScore: 5 });
    }

    // 解約率の評価
    const avgChurnRate = 0.24; // 簡略化
    if (avgChurnRate > 0.3) {
      assessments.market.items.push({ item: '解約率が高い', risk: '高', score: 2, maxScore: 5 });
    } else if (avgChurnRate > 0.2) {
      assessments.market.items.push({ item: '解約率は適切', risk: '中', score: 3, maxScore: 5 });
    } else {
      assessments.market.items.push({ item: '解約率が低い', risk: '低', score: 4, maxScore: 5 });
    }

    // システム利用料の評価
    const systemUsageCost = simulationResults.reduce((sum, r) => sum + (r.systemUsageCost || 0), 0);
    const systemUsageRatio = finalYearRevenue > 0 ? (systemUsageCost / finalYearRevenue) * 100 : 0;
    if (systemUsageRatio > 20) {
      assessments.technical.items.push({ item: 'システム利用料が高い', risk: '高', score: 2, maxScore: 5 });
    } else if (systemUsageRatio > 10) {
      assessments.technical.items.push({ item: 'システム利用料は適切', risk: '中', score: 3, maxScore: 5 });
    } else {
      assessments.technical.items.push({ item: 'システム利用料が低い', risk: '低', score: 4, maxScore: 5 });
    }

    // スケーラビリティの評価
    if (finalYearActiveUsers > 200000) {
      assessments.technical.items.push({ item: '大規模スケールが必要', risk: '中', score: 3, maxScore: 5 });
    } else if (finalYearActiveUsers > 100000) {
      assessments.technical.items.push({ item: '中規模スケール', risk: '低', score: 4, maxScore: 5 });
    } else {
      assessments.technical.items.push({ item: '小規模スケール', risk: '低', score: 5, maxScore: 5 });
    }

    // 人件費の評価
    const laborCost = simulationResults.reduce((sum, r) => sum + (r.laborCost || 0), 0);
    const laborCostRatio = finalYearRevenue > 0 ? (laborCost / finalYearRevenue) * 100 : 0;
    if (laborCostRatio > 50) {
      assessments.operational.items.push({ item: '人件費比率が高い', risk: '高', score: 2, maxScore: 5 });
    } else if (laborCostRatio > 30) {
      assessments.operational.items.push({ item: '人件費比率は適切', risk: '中', score: 3, maxScore: 5 });
    } else {
      assessments.operational.items.push({ item: '人件費比率が低い', risk: '低', score: 4, maxScore: 5 });
    }

    // 従業員数の評価
    const finalYearEmployeeCount = simulationResults[simulationResults.length - 1]?.employeeCount || 0;
    if (finalYearEmployeeCount > 15) {
      assessments.operational.items.push({ item: '従業員数が過剰', risk: '中', score: 3, maxScore: 5 });
    } else if (finalYearEmployeeCount > 8) {
      assessments.operational.items.push({ item: '従業員数は適切', risk: '低', score: 4, maxScore: 5 });
    } else {
      assessments.operational.items.push({ item: '従業員数が少ない', risk: '低', score: 5, maxScore: 5 });
    }

    // 累積利益の評価
    if (totalNetProfit < 0) {
      assessments.operational.items.push({ item: '累積利益が少ない', risk: '高', score: 1, maxScore: 5 });
    } else if (totalNetProfit < 100000000) {
      assessments.operational.items.push({ item: '累積利益は適切', risk: '中', score: 3, maxScore: 5 });
    } else {
      assessments.operational.items.push({ item: '累積利益が高い', risk: '低', score: 5, maxScore: 5 });
    }

    // 個人情報の取扱規模の評価
    if (finalYearActiveUsers > 200000) {
      assessments.privacy.items.push({ item: '個人情報の取扱規模が大きい', risk: '中', score: 3, maxScore: 5 });
    } else {
      assessments.privacy.items.push({ item: '個人情報の取扱規模は適切', risk: '低', score: 4, maxScore: 5 });
    }

    // セキュリティ投資の評価
    const securityInvestment = 5000000; // 簡略化
    if (securityInvestment < 3000000) {
      assessments.privacy.items.push({ item: 'セキュリティ投資が不足', risk: '高', score: 2, maxScore: 5 });
    } else {
      assessments.privacy.items.push({ item: 'セキュリティ投資は適切', risk: '低', score: 4, maxScore: 5 });
    }

    // コンプライアンス対応の評価
    assessments.privacy.items.push({ item: 'コンプライアンス対応が必要', risk: '中', score: 3, maxScore: 5 });

    // 市場参入障壁の評価
    assessments.competition.items.push({ item: '市場参入障壁が低い', risk: '中', score: 3, maxScore: 5 });

    // 顧客リテンション率の評価
    const retentionRate = 1 - avgChurnRate;
    if (retentionRate < 0.7) {
      assessments.competition.items.push({ item: '顧客リテンション率が低い', risk: '高', score: 2, maxScore: 5 });
    } else {
      assessments.competition.items.push({ item: '顧客リテンション率は適切', risk: '低', score: 4, maxScore: 5 });
    }

    // 市場シェアの評価
    assessments.competition.items.push({ item: '市場シェアが小さい', risk: '中', score: 3, maxScore: 5 });

    // 総合スコアを計算
    let totalScore = 0;
    let maxScore = 0;
    
    assessments.financial.items.forEach(item => {
      totalScore += item.score;
      maxScore += item.maxScore;
    });
    assessments.market.items.forEach(item => {
      totalScore += item.score;
      maxScore += item.maxScore;
    });
    assessments.technical.items.forEach(item => {
      totalScore += item.score;
      maxScore += item.maxScore;
    });
    assessments.operational.items.forEach(item => {
      totalScore += item.score;
      maxScore += item.maxScore;
    });
    assessments.privacy.items.forEach(item => {
      totalScore += item.score;
      maxScore += item.maxScore;
    });
    assessments.competition.items.forEach(item => {
      totalScore += item.score;
      maxScore += item.maxScore;
    });

    const overallScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    let overallLevel = '';
    if (overallScore >= 80) {
      overallLevel = '優秀';
    } else if (overallScore >= 65) {
      overallLevel = '良好';
    } else if (overallScore >= 50) {
      overallLevel = '要改善';
    } else {
      overallLevel = '要再検討';
    }

    assessments.overall = {
      score: overallScore,
      level: overallLevel,
      totalScore: totalScore,
      maxScore: maxScore
    };

    return assessments;
  };

  // レーダーチャート用のデータを生成
  const radarData = useMemo(() => {
    // 選択されたスナップショットがない場合は空を返す
    if (selectedSnapshots.length === 0) return [];
    const snapshotsToUse = selectedSnapshots;

    // 固定された評価軸を定義（すべての可能な評価項目を固定順序で）
    const fixedAxes = [
      // 財務リスク（条件分岐により1つだけ評価される）
      { item: '売上成長率が非常に高い', category: '財務', group: 'revenueGrowth' },
      { item: '売上成長率が高い', category: '財務', group: 'revenueGrowth' },
      { item: '売上成長率は現実的', category: '財務', group: 'revenueGrowth' },
      { item: '5年目で赤字', category: '財務', group: 'profitMargin' },
      { item: '利益率が低い', category: '財務', group: 'profitMargin' },
      { item: '利益率は適切', category: '財務', group: 'profitMargin' },
      { item: '利益率が高い', category: '財務', group: 'profitMargin' },
      { item: 'コスト比率が非常に高い', category: '財務', group: 'costRatio' },
      { item: 'コスト比率が高い', category: '財務', group: 'costRatio' },
      { item: 'コスト比率は適切', category: '財務', group: 'costRatio' },
      // 市場リスク（条件分岐により1つだけ評価される）
      { item: 'ユーザー獲得目標の達成が困難', category: '市場', group: 'userTarget' },
      { item: 'ユーザー獲得目標は達成可能', category: '市場', group: 'userTarget' },
      { item: 'ユーザー獲得目標は現実的', category: '市場', group: 'userTarget' },
      { item: '顧客単価が低い', category: '市場', group: 'arpu' },
      { item: '顧客単価は適切', category: '市場', group: 'arpu' },
      { item: '顧客単価が高い', category: '市場', group: 'arpu' },
      { item: '解約率が高い', category: '市場', group: 'churnRate' },
      { item: '解約率は適切', category: '市場', group: 'churnRate' },
      { item: '解約率が低い', category: '市場', group: 'churnRate' },
      // 技術リスク（条件分岐により1つだけ評価される）
      { item: 'システム利用料が高い', category: '技術', group: 'systemUsage' },
      { item: 'システム利用料は適切', category: '技術', group: 'systemUsage' },
      { item: 'システム利用料が低い', category: '技術', group: 'systemUsage' },
      { item: '大規模スケールが必要', category: '技術', group: 'scale' },
      { item: '中規模スケール', category: '技術', group: 'scale' },
      { item: '小規模スケール', category: '技術', group: 'scale' },
      // 運営リスク（条件分岐により1つだけ評価される）
      { item: '人件費比率が高い', category: '運営', group: 'laborCostRatio' },
      { item: '人件費比率は適切', category: '運営', group: 'laborCostRatio' },
      { item: '人件費比率が低い', category: '運営', group: 'laborCostRatio' },
      { item: '従業員数が過剰', category: '運営', group: 'employeeCount' },
      { item: '従業員数は適切', category: '運営', group: 'employeeCount' },
      { item: '従業員数が少ない', category: '運営', group: 'employeeCount' },
      { item: '累積利益が少ない', category: '運営', group: 'accumulatedProfit' },
      { item: '累積利益は適切', category: '運営', group: 'accumulatedProfit' },
      { item: '累積利益が高い', category: '運営', group: 'accumulatedProfit' },
      // 個人情報・コンプライアンスリスク（条件分岐により1つだけ評価される）
      { item: '個人情報の取扱規模が大きい', category: '個人情報・コンプライアンス', group: 'dataScale' },
      { item: '個人情報の取扱規模は適切', category: '個人情報・コンプライアンス', group: 'dataScale' },
      { item: 'セキュリティ投資が不足', category: '個人情報・コンプライアンス', group: 'security' },
      { item: 'セキュリティ投資は適切', category: '個人情報・コンプライアンス', group: 'security' },
      { item: 'コンプライアンス対応が必要', category: '個人情報・コンプライアンス', group: 'compliance' },
      // 競合リスク（固定）
      { item: '市場参入障壁が低い', category: '競合', group: 'barriers' },
      { item: '顧客リテンション率が低い', category: '競合', group: 'retention' },
      { item: '顧客リテンション率は適切', category: '競合', group: 'retention' },
      { item: '市場シェアが小さい', category: '競合', group: 'marketShare' }
    ];

    // 各スナップショットのデータを固定軸にマッピング
    const radarDataArray = fixedAxes.map(axis => {
      const dataPoint = {
        item: axis.item,
        category: axis.category
      };
      
      snapshotsToUse.forEach((snapshot) => {
        const riskAssessment = calculateRiskAssessment(snapshot.results, snapshot.params);
        
        // すべての評価項目を収集
        const allCategoryItems = [
          ...riskAssessment.financial.items,
          ...riskAssessment.market.items,
          ...riskAssessment.technical.items,
          ...riskAssessment.operational.items,
          ...riskAssessment.privacy.items,
          ...riskAssessment.competition.items
        ];

        // 完全一致する項目を探す
        let matchingItem = allCategoryItems.find(i => i.item === axis.item);
        
        // 完全一致がない場合、同じグループの項目を探す（条件分岐により異なる項目が評価される場合）
        if (!matchingItem && axis.group) {
          // グループごとのマッピング
          const groupMappings = {
            'revenueGrowth': ['売上成長率が非常に高い', '売上成長率が高い', '売上成長率は現実的'],
            'profitMargin': ['5年目で赤字', '利益率が低い', '利益率は適切', '利益率が高い'],
            'costRatio': ['コスト比率が非常に高い', 'コスト比率が高い', 'コスト比率は適切'],
            'userTarget': ['ユーザー獲得目標の達成が困難', 'ユーザー獲得目標は達成可能', 'ユーザー獲得目標は現実的'],
            'arpu': ['顧客単価が低い', '顧客単価は適切', '顧客単価が高い'],
            'churnRate': ['解約率が高い', '解約率は適切', '解約率が低い'],
            'systemUsage': ['システム利用料が高い', 'システム利用料は適切', 'システム利用料が低い'],
            'scale': ['大規模スケールが必要', '中規模スケール', '小規模スケール'],
            'laborCostRatio': ['人件費比率が高い', '人件費比率は適切', '人件費比率が低い'],
            'employeeCount': ['従業員数が過剰', '従業員数は適切', '従業員数が少ない'],
            'accumulatedProfit': ['累積利益が少ない', '累積利益は適切', '累積利益が高い'],
            'dataScale': ['個人情報の取扱規模が大きい', '個人情報の取扱規模は適切'],
            'security': ['セキュリティ投資が不足', 'セキュリティ投資は適切'],
            'compliance': ['コンプライアンス対応が必要'],
            'barriers': ['市場参入障壁が低い'],
            'retention': ['顧客リテンション率が低い', '顧客リテンション率は適切'],
            'marketShare': ['市場シェアが小さい']
          };
          
          const groupItems = groupMappings[axis.group] || [];
          matchingItem = allCategoryItems.find(i => groupItems.includes(i.item));
        }

        if (matchingItem) {
          dataPoint[snapshot.id] = (matchingItem.score / matchingItem.maxScore) * 100;
        } else {
          // 項目が見つからない場合は0を設定
          dataPoint[snapshot.id] = 0;
        }
      });
      
      return dataPoint;
    });

    // グループごとに1つだけ表示するようにフィルタリング（評価軸の増殖を防ぐ）
    const groupedData = {};
    radarDataArray.forEach(dataPoint => {
      const axis = fixedAxes.find(a => a.item === dataPoint.item);
      if (axis && axis.group) {
        if (!groupedData[axis.group]) {
          groupedData[axis.group] = [];
        }
        groupedData[axis.group].push({ ...dataPoint, axis });
      } else {
        // グループがない項目はそのまま追加
        if (!groupedData[dataPoint.item]) {
          groupedData[dataPoint.item] = [];
        }
        groupedData[dataPoint.item].push({ ...dataPoint, axis: null });
      }
    });

    // 各グループから、少なくとも1つのスナップショットで値が0より大きい項目を1つ選択
    const filteredData = [];
    Object.keys(groupedData).forEach(groupKey => {
      const groupItems = groupedData[groupKey];
      // 少なくとも1つのスナップショットで値が0より大きい項目を探す
      const validItem = groupItems.find(item => {
        return snapshotsToUse.some(snapshot => item[snapshot.id] > 0);
      });
      // 有効な項目があればそれを使用、なければ最初の項目を使用
      if (validItem || groupItems[0]) {
        const selectedItem = validItem || groupItems[0];
        // axis情報を削除して返す
        const { axis, ...dataPoint } = selectedItem;
        filteredData.push(dataPoint);
      }
    });

    return filteredData;
  }, [selectedSnapshots, snapshots]);

  // 評価スコアデータを生成（テーブル表示用）
  const scoreTableData = useMemo(() => {
    if (selectedSnapshots.length === 0) return { items: [], overallScores: {} };

    const allItems = [];
    const overallScores = {};

    selectedSnapshots.forEach((snapshot) => {
      const riskAssessment = calculateRiskAssessment(snapshot.results, snapshot.params);
      
      // 総合スコアを保存
      if (riskAssessment.overall) {
        overallScores[snapshot.name] = {
          score: riskAssessment.overall.score,
          level: riskAssessment.overall.level,
          totalScore: riskAssessment.overall.totalScore,
          maxScore: riskAssessment.overall.maxScore
        };
      }
      
      // すべての評価項目を収集
      const items = [
        ...riskAssessment.financial.items.map(item => ({ ...item, category: '財務', snapshotName: snapshot.name })),
        ...riskAssessment.market.items.map(item => ({ ...item, category: '市場', snapshotName: snapshot.name })),
        ...riskAssessment.technical.items.map(item => ({ ...item, category: '技術', snapshotName: snapshot.name })),
        ...riskAssessment.operational.items.map(item => ({ ...item, category: '運営', snapshotName: snapshot.name })),
        ...riskAssessment.privacy.items.map(item => ({ ...item, category: '個人情報・コンプライアンス', snapshotName: snapshot.name })),
        ...riskAssessment.competition.items.map(item => ({ ...item, category: '競合', snapshotName: snapshot.name }))
      ];

      items.forEach(item => {
        const existing = allItems.find(i => i.item === item.item && i.category === item.category);
        if (!existing) {
          allItems.push({
            item: item.item,
            category: item.category,
            [snapshot.name]: `${item.score}/${item.maxScore}`,
            risk: item.risk
          });
        } else {
          existing[snapshot.name] = `${item.score}/${item.maxScore}`;
        }
      });
    });

    // カテゴリごとにグループ化
    const categoryOrder = ['財務', '市場', '技術', '運営', '個人情報・コンプライアンス', '競合'];
    const groupedByCategory = {};
    allItems.forEach(item => {
      if (!groupedByCategory[item.category]) {
        groupedByCategory[item.category] = [];
      }
      groupedByCategory[item.category].push(item);
    });

    // カテゴリ順に並べ替え
    const sortedItems = [];
    categoryOrder.forEach(category => {
      if (groupedByCategory[category]) {
        sortedItems.push(...groupedByCategory[category]);
      }
    });

    return { items: sortedItems, overallScores };
  }, [selectedSnapshots]);

  // 売上推移データを生成
  const revenueData = useMemo(() => {
    if (selectedSnapshots.length === 0) return [];

    const years = ['1年目', '2年目', '3年目', '4年目', '5年目', '6年目', '7年目'];
    return years.map((year, index) => {
      const dataPoint = { year };
      selectedSnapshots.forEach(snapshot => {
        if (snapshot.results[index]) {
          dataPoint[snapshot.name] = snapshot.results[index].totalRevenue || 0;
        }
      });
      return dataPoint;
    });
  }, [selectedSnapshots]);

  // アクティブユーザー推移データを生成
  const activeUsersData = useMemo(() => {
    if (selectedSnapshots.length === 0) return [];

    const years = ['1年目', '2年目', '3年目', '4年目', '5年目', '6年目', '7年目'];
    return years.map((year, index) => {
      const dataPoint = { year };
      selectedSnapshots.forEach(snapshot => {
        if (snapshot.results[index]) {
          dataPoint[snapshot.name] = snapshot.results[index].activeUsers || 0;
        }
      });
      return dataPoint;
    });
  }, [selectedSnapshots]);

  // 営業原価推移データを生成
  const costData = useMemo(() => {
    if (selectedSnapshots.length === 0) return [];

    const years = ['1年目', '2年目', '3年目', '4年目', '5年目', '6年目', '7年目'];
    return years.map((year, index) => {
      const dataPoint = { year };
      selectedSnapshots.forEach(snapshot => {
        if (snapshot.results[index]) {
          dataPoint[snapshot.name] = snapshot.results[index].totalCost || 0;
        }
      });
      return dataPoint;
    });
  }, [selectedSnapshots]);

  // 販管費推移データを生成
  const sgaData = useMemo(() => {
    if (selectedSnapshots.length === 0) return [];

    const years = ['1年目', '2年目', '3年目', '4年目', '5年目', '6年目', '7年目'];
    return years.map((year, index) => {
      const dataPoint = { year };
      selectedSnapshots.forEach(snapshot => {
        if (snapshot.results[index]) {
          dataPoint[snapshot.name] = snapshot.results[index].totalSGA || 0;
        }
      });
      return dataPoint;
    });
  }, [selectedSnapshots]);

  const grossProfitData = useMemo(() => {
    if (selectedSnapshots.length === 0) return [];

    const years = ['1年目', '2年目', '3年目', '4年目', '5年目', '6年目', '7年目'];
    return years.map((year, index) => {
      const dataPoint = { year };
      selectedSnapshots.forEach(snapshot => {
        if (snapshot.results[index]) {
          dataPoint[snapshot.name] = snapshot.results[index].grossProfit || 0;
        }
      });
      return dataPoint;
    });
  }, [selectedSnapshots]);

  const netProfitData = useMemo(() => {
    if (selectedSnapshots.length === 0) return [];

    const years = ['1年目', '2年目', '3年目', '4年目', '5年目', '6年目', '7年目'];
    return years.map((year, index) => {
      const dataPoint = { year };
      selectedSnapshots.forEach(snapshot => {
        if (snapshot.results[index]) {
          dataPoint[snapshot.name] = snapshot.results[index].netProfit || 0;
        }
      });
      return dataPoint;
    });
  }, [selectedSnapshots]);

  // スナップショットの選択を切り替え
  const toggleSnapshot = (id) => {
    setSelectedSnapshotIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(sId => sId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // スナップショットをJSON形式でダウンロード
  const downloadSnapshotAsJSON = (snapshot, e) => {
    e.stopPropagation();
    const jsonString = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `snapshot_${snapshot.name}_${snapshot.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ファイルを処理する共通関数
  const processFile = (file) => {
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
      setUploadStatus({ type: 'error', message: 'JSONファイルを選択してください。' });
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
      return;
    }

    setUploadStatus({ type: 'loading', message: 'ファイルを読み込んでいます...' });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // スナップショットの形式を確認
        if (!jsonData.params || !jsonData.results) {
          setUploadStatus({ type: 'error', message: '無効なスナップショットファイルです。paramsとresultsが必要です。' });
          setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
          return;
        }

        // IDがなければ生成
        if (!jsonData.id) {
          jsonData.id = `uploaded_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        // 名前がなければ生成
        if (!jsonData.name) {
          jsonData.name = `アップロード_${new Date().toLocaleString('ja-JP')}`;
        }

        // createdAtがなければ生成
        if (!jsonData.createdAt) {
          jsonData.createdAt = new Date().toISOString();
        }

        // 既存のスナップショットを取得
        const existingSnapshots = JSON.parse(localStorage.getItem('businessPlanSnapshots') || '[]');
        
        // 同じIDのスナップショットが既に存在するかチェック
        const existingIndex = existingSnapshots.findIndex(s => s.id === jsonData.id);
        
        if (existingIndex >= 0) {
          // 既に存在する場合は更新
          existingSnapshots[existingIndex] = jsonData;
        } else {
          // 存在しない場合は追加
          existingSnapshots.push(jsonData);
        }
        
        // スナップショットを保存（最新20件まで）
        const sortedSnapshots = existingSnapshots
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 20);
        
        localStorage.setItem('businessPlanSnapshots', JSON.stringify(sortedSnapshots));
        
        // ローカルステートも更新
        setSnapshots(sortedSnapshots);
        
        setUploadStatus({ type: 'success', message: `「${jsonData.name}」を読み込み、スナップショットとして保存しました。` });
        setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
      } catch (error) {
        console.error('JSONファイルの読み込みエラー:', error);
        setUploadStatus({ type: 'error', message: 'JSONファイルの読み込みに失敗しました。ファイル形式を確認してください。' });
        setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
      }
    };
    reader.readAsText(file);
  };

  // JSONファイルをアップロード
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    processFile(file);
    
    // ファイル入力のリセット
    if (event.target) {
    event.target.value = '';
    }
  };


  // スナップショットを削除
  const deleteSnapshot = (id, e) => {
    e.stopPropagation();
    if (window.confirm('このスナップショットを削除しますか？')) {
      // localStorageのスナップショットかアップロードされたスナップショットかを判定
      if (snapshots.some(s => s.id === id)) {
        const updatedSnapshots = snapshots.filter(s => s.id !== id);
        localStorage.setItem('businessPlanSnapshots', JSON.stringify(updatedSnapshots));
        setSnapshots(updatedSnapshots);
      } else {
        setUploadedSnapshots(prev => prev.filter(s => s.id !== id));
      }
      // 選択からも削除
      setSelectedSnapshotIds(prev => prev.filter(sId => sId !== id));
    }
  };

  const startEditing = (snapshot, e) => {
    e.stopPropagation();
    setEditingSnapshotId(snapshot.id);
    setEditingName(snapshot.name);
  };

  const saveEditing = (id, e) => {
    e.stopPropagation();
    if (editingName.trim() === '') {
      alert('名前を入力してください。');
      return;
    }
    
    const updatedSnapshots = snapshots.map(s => 
      s.id === id ? { ...s, name: editingName.trim() } : s
    );
    localStorage.setItem('businessPlanSnapshots', JSON.stringify(updatedSnapshots));
    setSnapshots(updatedSnapshots);
    
    setEditingSnapshotId(null);
    setEditingName('');
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingSnapshotId(null);
    setEditingName('');
  };

  // 色の配列
  const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>スナップショット比較</h1>
            <p className="specification-description">
              保存されたスナップショットを選択して比較できます。JSONファイルをアップロードして比較することもできます。
            </p>
          </div>

          {/* JSONファイルアップロード */}
          <div className="specification-section">
            <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
              JSONファイルをアップロード
            </h2>
            <div style={{ marginBottom: '16px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  width: 0,
                  height: 0,
                  opacity: 0,
                  pointerEvents: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5568d3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#667eea';
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                ファイルを選択
              </button>
              <p style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
                JSON形式のスナップショットファイルを選択してください。
              </p>
            </div>
            
            {/* アップロードステータス */}
            {uploadStatus.type && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  backgroundColor:
                    uploadStatus.type === 'success'
                      ? '#d1fae5'
                      : uploadStatus.type === 'error'
                      ? '#fee2e2'
                      : '#dbeafe',
                  color:
                    uploadStatus.type === 'success'
                      ? '#065f46'
                      : uploadStatus.type === 'error'
                      ? '#991b1b'
                      : '#1e40af',
                  border: `1px solid ${
                    uploadStatus.type === 'success'
                      ? '#a7f3d0'
                      : uploadStatus.type === 'error'
                      ? '#fecaca'
                      : '#bfdbfe'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
              >
                {uploadStatus.type === 'loading' && (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #1e40af',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                )}
                {uploadStatus.type === 'success' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {uploadStatus.type === 'error' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
                <span>{uploadStatus.message}</span>
              </div>
            )}
          </div>

          {/* スナップショット一覧 */}
          <div className="specification-section">
            <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
              スナップショット一覧
            </h2>
            {snapshots.length === 0 ? (
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                スナップショットがありません。シミュレーションページでスナップショットを保存するか、JSONファイルをアップロードしてください。
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {snapshots.map((snapshot, index) => (
                  <label
                    key={snapshot.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      border: selectedSnapshotIds.includes(snapshot.id) ? '2px solid #667eea' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: selectedSnapshotIds.includes(snapshot.id) ? '#f0f4ff' : 'white'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSnapshotIds.includes(snapshot.id)}
                      onChange={() => toggleSnapshot(snapshot.id)}
                      style={{ marginRight: '12px', width: '18px', height: '18px' }}
                    />
                    <div style={{ flex: 1 }}>
                      {editingSnapshotId === snapshot.id ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveEditing(snapshot.id, e);
                              } else if (e.key === 'Escape') {
                                cancelEditing(e);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              border: '1px solid #667eea',
                              borderRadius: '4px',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}
                            autoFocus
                          />
                          <button
                            onClick={(e) => saveEditing(snapshot.id, e)}
                            style={{
                              padding: '4px 8px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#059669';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#10b981';
                            }}
                          >
                            保存
                          </button>
                          <button
                            onClick={cancelEditing}
                            style={{
                              padding: '4px 8px',
                              background: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#4b5563';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#6b7280';
                            }}
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{snapshot.name}</div>
                      )}
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {new Date(snapshot.createdAt).toLocaleString('ja-JP')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {editingSnapshotId !== snapshot.id && (
                        <button
                          onClick={(e) => startEditing(snapshot, e)}
                          style={{
                            padding: '4px 8px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#5568d3';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#667eea';
                          }}
                        >
                          編集
                        </button>
                      )}
                      <button
                        onClick={(e) => downloadSnapshotAsJSON(snapshot, e)}
                        style={{
                          padding: '4px 8px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#059669';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#10b981';
                        }}
                      >
                        JSON
                      </button>
                      <button
                        onClick={(e) => deleteSnapshot(snapshot.id, e)}
                        style={{
                          padding: '4px 8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#ef4444';
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* レーダーチャート比較 */}
          <div className="specification-section">
            <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
              リスク評価比較（レーダーチャート）
            </h2>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              {/* レーダーチャート */}
              <div ref={radarChartRef} style={{ flex: '1', height: `${chartSize.height}px`, position: 'relative', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData.length > 0 ? radarData : []} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="item"
                      tick={{ fontSize: 11, fill: '#374151', fontWeight: '600' }}
                      tickLine={{ stroke: '#9ca3af' }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickCount={6}
                      tickFormatter={(value) => `${value}%`}
                    />
                    {selectedSnapshots.map((snapshot, index) => (
                      <Radar
                        key={snapshot.id}
                        name={snapshot.name}
                        dataKey={snapshot.id}
                        stroke={colors[index % colors.length]}
                        fill={colors[index % colors.length]}
                        fillOpacity={0.3}
                        strokeWidth={2}
                        dot={{ r: 4, fill: colors[index % colors.length] }}
                      />
                    ))}
                    <Legend
                      wrapperStyle={{ paddingTop: '20px', textAlign: 'center' }}
                      iconType="circle"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* 評価スコアテーブル */}
              {selectedSnapshots.length > 0 && scoreTableData.items && scoreTableData.items.length > 0 && (
                <div style={{ flex: '0 0 400px', maxHeight: `${chartSize.height}px`, overflowY: 'auto' }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                      評価スコア
                    </h3>
                    
                    {/* 総合スコア */}
                    {Object.keys(scoreTableData.overallScores).length > 0 && (
                      <div style={{
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                          総合スコア
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '6px', textAlign: 'left', fontWeight: '600', color: '#6b7280', fontSize: '11px' }}>
                                スナップショット
                              </th>
                              <th style={{ padding: '6px', textAlign: 'center', fontWeight: '600', color: '#6b7280', fontSize: '11px' }}>
                                スコア
                              </th>
                              <th style={{ padding: '6px', textAlign: 'center', fontWeight: '600', color: '#6b7280', fontSize: '11px' }}>
                                評価
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedSnapshots.map((snapshot, index) => {
                              const overall = scoreTableData.overallScores[snapshot.name];
                              if (!overall) return null;
                              
                              const getLevelColor = (level) => {
                                switch (level) {
                                  case '優秀': return '#10b981';
                                  case '良好': return '#3b82f6';
                                  case '要改善': return '#f59e0b';
                                  case '要再検討': return '#ef4444';
                                  default: return '#6b7280';
                                }
                              };

                              return (
                                <tr key={snapshot.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                  <td style={{ padding: '6px', fontWeight: '600', color: colors[index % colors.length] }}>
                                    {snapshot.name}
                                  </td>
                                  <td style={{ padding: '6px', textAlign: 'center', fontWeight: '700', color: getLevelColor(overall.level) }}>
                                    {overall.score.toFixed(1)}点
                                  </td>
                                  <td style={{ padding: '6px', textAlign: 'center' }}>
                                    <span style={{
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      backgroundColor: getLevelColor(overall.level) + '20',
                                      color: getLevelColor(overall.level),
                                      fontSize: '11px',
                                      fontWeight: '600'
                                    }}>
                                      {overall.level}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#374151', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                            カテゴリ
                          </th>
                          <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#374151', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                            評価項目
                          </th>
                          {selectedSnapshots.map((snapshot, index) => (
                            <th
                              key={snapshot.id}
                              style={{
                                padding: '8px',
                                textAlign: 'center',
                                fontWeight: '600',
                                color: colors[index % colors.length],
                                position: 'sticky',
                                top: 0,
                                backgroundColor: 'white',
                                zIndex: 10
                              }}
                            >
                              {snapshot.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const categoryCounts = {};
                          scoreTableData.items.forEach(item => {
                            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
                          });

                          let currentCategory = '';
                          let categoryRowIndex = 0;

                          return scoreTableData.items.map((item, index) => {
                            const isFirstInCategory = item.category !== currentCategory;
                            if (isFirstInCategory) {
                              currentCategory = item.category;
                              categoryRowIndex = 0;
                            } else {
                              categoryRowIndex++;
                            }

                            const rowspan = categoryCounts[item.category];

                            return (
                              <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                {isFirstInCategory && (
                                  <td
                                    rowSpan={rowspan}
                                    style={{
                                      padding: '8px',
                                      fontWeight: '600',
                                      color: '#667eea',
                                      verticalAlign: 'top',
                                      borderRight: '2px solid #e5e7eb',
                                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                                    }}
                                  >
                                    {item.category}
                                  </td>
                                )}
                                <td style={{ padding: '8px', color: '#374151', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                                  {item.item}
                                </td>
                                {selectedSnapshots.map((snapshot, snapshotIndex) => (
                                  <td
                                    key={snapshot.id}
                                    style={{
                                      padding: '8px',
                                      textAlign: 'center',
                                      fontWeight: '600',
                                      color: colors[snapshotIndex % colors.length],
                                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                                    }}
                                  >
                                    {item[snapshot.name] || '-'}
                                  </td>
                                ))}
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 推移比較グラフ */}
          {selectedSnapshots.length > 0 && (
            <div className="specification-section">
              <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
                推移比較
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* 売上推移比較 */}
                <div>
                  <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                    売上推移比較
                  </h3>
                  <div ref={revenueChartRef} style={{ width: '100%', height: '300px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip
                          formatter={(value) => `${(value / 1000000).toFixed(2)}百万円`}
                          labelStyle={{ color: '#374151' }}
                        />
                        {selectedSnapshots.map((snapshot, index) => (
                          <Line
                            key={snapshot.id}
                            type="monotone"
                            dataKey={snapshot.name}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* アクティブユーザー推移比較 */}
                <div>
                  <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                    アクティブユーザー推移比較
                  </h3>
                  <div ref={activeUsersChartRef} style={{ width: '100%', height: '300px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activeUsersData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip
                          formatter={(value) => `${value.toLocaleString()}人`}
                          labelStyle={{ color: '#374151' }}
                        />
                        {selectedSnapshots.map((snapshot, index) => (
                          <Line
                            key={snapshot.id}
                            type="monotone"
                            dataKey={snapshot.name}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 営業原価推移比較 */}
                <div>
                  <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                    営業原価推移比較
                  </h3>
                  <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={costData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip
                          formatter={(value) => `${(value / 1000000).toFixed(2)}百万円`}
                          labelStyle={{ color: '#374151' }}
                        />
                        {selectedSnapshots.map((snapshot, index) => (
                          <Line
                            key={snapshot.id}
                            type="monotone"
                            dataKey={snapshot.name}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 販管費推移比較 */}
                <div>
                  <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                    販管費推移比較
                  </h3>
                  <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sgaData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip
                          formatter={(value) => `${(value / 1000000).toFixed(2)}百万円`}
                          labelStyle={{ color: '#374151' }}
                        />
                        {selectedSnapshots.map((snapshot, index) => (
                          <Line
                            key={snapshot.id}
                            type="monotone"
                            dataKey={snapshot.name}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 売上総利益推移比較 */}
                <div>
                  <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                    売上総利益推移比較
                  </h3>
                  <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={grossProfitData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip
                          formatter={(value) => `${(value / 1000000).toFixed(2)}百万円`}
                          labelStyle={{ color: '#374151' }}
                        />
                        {selectedSnapshots.map((snapshot, index) => (
                          <Line
                            key={snapshot.id}
                            type="monotone"
                            dataKey={snapshot.name}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 税後利益推移比較 */}
                <div>
                  <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                    税後利益推移比較
                  </h3>
                  <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={netProfitData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip
                          formatter={(value) => `${(value / 1000000).toFixed(2)}百万円`}
                          labelStyle={{ color: '#374151' }}
                        />
                        {selectedSnapshots.map((snapshot, index) => (
                          <Line
                            key={snapshot.id}
                            type="monotone"
                            dataKey={snapshot.name}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecificationSnapshotComparison;

