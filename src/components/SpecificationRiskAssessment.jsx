import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import './Specification.css';

const SpecificationRiskAssessment = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const snapshotButtonRef = useRef(null);
  const [snapshotModalPosition, setSnapshotModalPosition] = useState({ top: 0, left: 0 });

  // localStorageからシミュレーション結果を読み込む（最新の値を確実に読み込むため、refreshKeyで再読み込みをトリガー）
  const simulationResults = useMemo(() => {
    const saved = localStorage.getItem('businessPlanSimulationResults');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse simulation results:', e);
      }
    }
    return null;
  }, [refreshKey]);

  const simulationParams = useMemo(() => {
    const saved = localStorage.getItem('businessPlanSimulationParams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse simulation params:', e);
      }
    }
    return null;
  }, [refreshKey]);

  // localStorageの変更を監視して再評価をトリガー
  useEffect(() => {
    let lastSimulationKey = localStorage.getItem('businessPlanSimulationKey') || '0';
    let lastResultsString = localStorage.getItem('businessPlanSimulationResults') || '';
    
    const checkForUpdates = () => {
      const currentKey = localStorage.getItem('businessPlanSimulationKey') || '0';
      const currentResults = localStorage.getItem('businessPlanSimulationResults') || '';
      
      // シミュレーションキーが変更された場合
      if (currentKey !== lastSimulationKey) {
        lastSimulationKey = currentKey;
        lastResultsString = currentResults;
        setRefreshKey(prev => prev + 1);
        return;
      }
      
      // シミュレーション結果の内容が変更された場合
      if (currentResults !== lastResultsString) {
        lastResultsString = currentResults;
        setRefreshKey(prev => prev + 1);
      }
    };
    
    // 初回読み込み時に最新データを確実に読み込む
    checkForUpdates();
    
    const handleStorageChange = () => {
      checkForUpdates();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // 同じウィンドウ内での変更も監視（より頻繁にチェック）
    const interval = setInterval(checkForUpdates, 300);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // リスク評価の計算
  const riskAssessment = useMemo(() => {
    if (!simulationResults || !simulationParams) {
      return null;
    }

    const assessments = {
      financial: {
        title: '財務リスク',
        items: []
      },
      market: {
        title: '市場リスク',
        items: []
      },
      technical: {
        title: '技術リスク',
        items: []
      },
      operational: {
        title: '運営リスク',
        items: []
      },
      privacy: {
        title: '個人情報・コンプライアンスリスク',
        items: []
      },
      competition: {
        title: '競合リスク',
        items: []
      },
      overall: {
        title: '総合評価',
        score: 0,
        level: '',
        message: ''
      }
    };

    let totalScore = 0;
    let maxScore = 0;

    // 財務リスク評価
    const totalRevenue = simulationResults.reduce((sum, r) => sum + (r.totalRevenue || 0), 0);
    const totalCost = simulationResults.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    const totalSGA = simulationResults.reduce((sum, r) => sum + (r.totalSGA || 0), 0);
    const totalNetProfit = simulationResults.reduce((sum, r) => sum + (r.netProfit || 0), 0);
    const finalYearRevenue = simulationResults[simulationResults.length - 1]?.totalRevenue || 0;
    const finalYearNetProfit = simulationResults[simulationResults.length - 1]?.netProfit || 0;
    const finalYearActiveUsers = simulationResults[simulationResults.length - 1]?.activeUsers || 0;
    const targetActiveUsers = simulationParams.yearlyTargets?.[2030] || 0;

    // 1. 売上成長率の評価
    const revenueGrowth = simulationResults.map((r, i) => {
      if (i === 0) return 0;
      const prevRevenue = simulationResults[i - 1].totalRevenue || 0;
      const currentRevenue = r.totalRevenue || 0;
      return prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    });
    const avgRevenueGrowth = revenueGrowth.slice(1).reduce((sum, g) => sum + g, 0) / (revenueGrowth.length - 1);
    
    if (avgRevenueGrowth > 100) {
      assessments.financial.items.push({
        item: '売上成長率が非常に高い',
        risk: '高',
        score: 2,
        maxScore: 5,
        message: `平均成長率${avgRevenueGrowth.toFixed(1)}%は非常に高い目標です。市場拡大のペースが追いつかない可能性があります。`,
        recommendation: '成長率を段階的に設定し、各段階での達成状況を確認しながら進めることを推奨します。'
      });
    } else if (avgRevenueGrowth > 50) {
      assessments.financial.items.push({
        item: '売上成長率が高い',
        risk: '中',
        score: 3,
        maxScore: 5,
        message: `平均成長率${avgRevenueGrowth.toFixed(1)}%は高い目標ですが、達成可能な範囲です。`,
        recommendation: 'マーケティング戦略と顧客獲得コストを慎重に管理する必要があります。'
      });
    } else {
      assessments.financial.items.push({
        item: '売上成長率は現実的',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `平均成長率${avgRevenueGrowth.toFixed(1)}%は現実的な目標です。`,
        recommendation: '計画通りに進めることができそうです。'
      });
    }
    totalScore += assessments.financial.items[0].score;
    maxScore += assessments.financial.items[0].maxScore;

    // 2. 利益率の評価
    const profitMargin = finalYearRevenue > 0 ? (finalYearNetProfit / finalYearRevenue) * 100 : 0;
    if (profitMargin < 0) {
      assessments.financial.items.push({
        item: '5年目で赤字',
        risk: '高',
        score: 1,
        maxScore: 5,
        message: `5年目でも赤字（利益率${profitMargin.toFixed(1)}%）となっています。`,
        recommendation: 'コスト削減または売上向上の施策が必要です。'
      });
    } else if (profitMargin < 5) {
      assessments.financial.items.push({
        item: '利益率が低い',
        risk: '中',
        score: 2,
        maxScore: 5,
        message: `5年目の利益率${profitMargin.toFixed(1)}%は低めです。`,
        recommendation: '効率化や価格戦略の見直しを検討してください。'
      });
    } else if (profitMargin < 15) {
      assessments.financial.items.push({
        item: '利益率は適切',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `5年目の利益率${profitMargin.toFixed(1)}%は適切な水準です。`,
        recommendation: '現状の計画で問題ありません。'
      });
    } else {
      assessments.financial.items.push({
        item: '利益率が高い',
        risk: '低',
        score: 5,
        maxScore: 5,
        message: `5年目の利益率${profitMargin.toFixed(1)}%は良好です。`,
        recommendation: '計画は健全です。'
      });
    }
    totalScore += assessments.financial.items[1].score;
    maxScore += assessments.financial.items[1].maxScore;

    // 3. コスト構造の評価
    const costRatio = finalYearRevenue > 0 ? (totalCost / finalYearRevenue) * 100 : 0;
    const sgaRatio = finalYearRevenue > 0 ? (totalSGA / finalYearRevenue) * 100 : 0;
    if (costRatio > 90) {
      assessments.financial.items.push({
        item: 'コスト比率が非常に高い',
        risk: '高',
        score: 1,
        maxScore: 5,
        message: `コスト比率${costRatio.toFixed(1)}%は非常に高く、収益性に懸念があります。`,
        recommendation: 'コスト構造の見直しが急務です。'
      });
    } else if (costRatio > 70) {
      assessments.financial.items.push({
        item: 'コスト比率が高い',
        risk: '中',
        score: 2,
        maxScore: 5,
        message: `コスト比率${costRatio.toFixed(1)}%は高めです。`,
        recommendation: '効率化を進める必要があります。'
      });
    } else {
      assessments.financial.items.push({
        item: 'コスト比率は適切',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `コスト比率${costRatio.toFixed(1)}%は適切な水準です。`,
        recommendation: '現状のコスト構造で問題ありません。'
      });
    }
    totalScore += assessments.financial.items[2].score;
    maxScore += assessments.financial.items[2].maxScore;

    // 市場リスク評価
    // 1. ユーザー獲得目標の評価
    const userGrowthRate = targetActiveUsers > 0 ? ((finalYearActiveUsers - (simulationResults[0]?.activeUsers || 0)) / targetActiveUsers) * 100 : 0;
    const userAchievementRate = targetActiveUsers > 0 ? (finalYearActiveUsers / targetActiveUsers) * 100 : 0;
    
    if (userAchievementRate < 80) {
      assessments.market.items.push({
        item: 'ユーザー獲得目標の達成が困難',
        risk: '高',
        score: 2,
        maxScore: 5,
        message: `目標ユーザー数${targetActiveUsers.toLocaleString()}人に対し、達成率${userAchievementRate.toFixed(1)}%です。`,
        recommendation: 'マーケティング戦略の強化と顧客獲得チャネルの多様化が必要です。'
      });
    } else if (userAchievementRate < 95) {
      assessments.market.items.push({
        item: 'ユーザー獲得目標は達成可能',
        risk: '中',
        score: 3,
        maxScore: 5,
        message: `目標ユーザー数${targetActiveUsers.toLocaleString()}人に対し、達成率${userAchievementRate.toFixed(1)}%です。`,
        recommendation: 'マーケティング施策を強化することで達成可能です。'
      });
    } else {
      assessments.market.items.push({
        item: 'ユーザー獲得目標は現実的',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `目標ユーザー数${targetActiveUsers.toLocaleString()}人に対し、達成率${userAchievementRate.toFixed(1)}%です。`,
        recommendation: '計画通りに進めることができそうです。'
      });
    }
    totalScore += assessments.market.items[0].score;
    maxScore += assessments.market.items[0].maxScore;

    // 2. 顧客単価の評価
    const arpu = finalYearActiveUsers > 0 ? (finalYearRevenue / finalYearActiveUsers) : 0;
    if (arpu < 10000) {
      assessments.market.items.push({
        item: '顧客単価が低い',
        risk: '高',
        score: 2,
        maxScore: 5,
        message: `顧客単価${arpu.toLocaleString()}円は低めです。収益性に懸念があります。`,
        recommendation: 'プレミアムプランの推進や付加価値サービスの提供を検討してください。'
      });
    } else if (arpu < 30000) {
      assessments.market.items.push({
        item: '顧客単価は適切',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `顧客単価${arpu.toLocaleString()}円は適切な水準です。`,
        recommendation: '現状の価格戦略で問題ありません。'
      });
    } else {
      assessments.market.items.push({
        item: '顧客単価が高い',
        risk: '低',
        score: 5,
        maxScore: 5,
        message: `顧客単価${arpu.toLocaleString()}円は良好です。`,
        recommendation: '計画は健全です。'
      });
    }
    totalScore += assessments.market.items[1].score;
    maxScore += assessments.market.items[1].maxScore;

    // 3. 解約率の評価
    const avgChurnRate = simulationParams.churnRates ? 
      Object.values(simulationParams.churnRates).reduce((sum, yearRates) => {
        if (!yearRates) return sum;
        const rates = Object.values(yearRates).filter(r => r !== null);
        return sum + (rates.reduce((s, r) => s + r, 0) / rates.length);
      }, 0) / Object.keys(simulationParams.churnRates).length : 0.15;
    
    if (avgChurnRate > 0.3) {
      assessments.market.items.push({
        item: '解約率が高い',
        risk: '高',
        score: 2,
        maxScore: 5,
        message: `平均解約率${(avgChurnRate * 100).toFixed(1)}%は高めです。`,
        recommendation: '顧客満足度向上とリテンション施策が急務です。'
      });
    } else if (avgChurnRate > 0.2) {
      assessments.market.items.push({
        item: '解約率は中程度',
        risk: '中',
        score: 3,
        maxScore: 5,
        message: `平均解約率${(avgChurnRate * 100).toFixed(1)}%は中程度です。`,
        recommendation: 'リテンション施策の強化を検討してください。'
      });
    } else {
      assessments.market.items.push({
        item: '解約率は適切',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `平均解約率${(avgChurnRate * 100).toFixed(1)}%は適切な水準です。`,
        recommendation: '現状のリテンション戦略で問題ありません。'
      });
    }
    totalScore += assessments.market.items[2].score;
    maxScore += assessments.market.items[2].maxScore;

    // 技術リスク評価
    // 1. システム利用料の評価
    const systemUsageCost = simulationResults.reduce((sum, r) => sum + (r.systemUsageCost || 0), 0);
    const systemCostRatio = totalRevenue > 0 ? (systemUsageCost / totalRevenue) * 100 : 0;
    
    if (systemCostRatio > 10) {
      assessments.technical.items.push({
        item: 'システム利用料が高い',
        risk: '中',
        score: 2,
        maxScore: 5,
        message: `システム利用料の売上比率${systemCostRatio.toFixed(1)}%は高めです。`,
        recommendation: 'インフラコストの最適化を検討してください。'
      });
    } else {
      assessments.technical.items.push({
        item: 'システム利用料は適切',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `システム利用料の売上比率${systemCostRatio.toFixed(1)}%は適切です。`,
        recommendation: '現状のインフラ構成で問題ありません。'
      });
    }
    totalScore += assessments.technical.items[0].score;
    maxScore += assessments.technical.items[0].maxScore;

    // 2. スケーラビリティの評価
    const maxUsers = Math.max(...simulationResults.map(r => r.activeUsers || 0));
    if (maxUsers > 500000) {
      assessments.technical.items.push({
        item: '大規模スケールが必要',
        risk: '中',
        score: 3,
        maxScore: 5,
        message: `最大${maxUsers.toLocaleString()}人のユーザーを想定しています。`,
        recommendation: 'インフラのスケーラビリティ設計が重要です。'
      });
    } else if (maxUsers > 100000) {
      assessments.technical.items.push({
        item: '中規模スケール',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `最大${maxUsers.toLocaleString()}人のユーザーを想定しています。`,
        recommendation: '適切なスケーリング計画で対応可能です。'
      });
    } else {
      assessments.technical.items.push({
        item: '小規模スケール',
        risk: '低',
        score: 5,
        maxScore: 5,
        message: `最大${maxUsers.toLocaleString()}人のユーザーを想定しています。`,
        recommendation: '現状の技術スタックで対応可能です。'
      });
    }
    totalScore += assessments.technical.items[1].score;
    maxScore += assessments.technical.items[1].maxScore;

    // 運営リスク評価
    // 1. 人件費の評価
    const laborCost = simulationResults.reduce((sum, r) => sum + (r.laborCost || 0), 0);
    const laborCostRatio = totalRevenue > 0 ? (laborCost / totalRevenue) * 100 : 0;
    
    if (laborCostRatio > 50) {
      assessments.operational.items.push({
        item: '人件費比率が高い',
        risk: '高',
        score: 2,
        maxScore: 5,
        message: `人件費比率${laborCostRatio.toFixed(1)}%は高めです。`,
        recommendation: '人件費の最適化と業務効率化が必要です。'
      });
    } else if (laborCostRatio > 30) {
      assessments.operational.items.push({
        item: '人件費比率は適切',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `人件費比率${laborCostRatio.toFixed(1)}%は適切な水準です。`,
        recommendation: '現状の人件費構造で問題ありません。'
      });
    } else {
      assessments.operational.items.push({
        item: '人件費比率が低い',
        risk: '低',
        score: 5,
        maxScore: 5,
        message: `人件費比率${laborCostRatio.toFixed(1)}%は良好です。`,
        recommendation: '計画は健全です。'
      });
    }
    totalScore += assessments.operational.items[0].score;
    maxScore += assessments.operational.items[0].maxScore;

    // 2. 従業員数の評価
    const maxEmployees = Math.max(...simulationResults.map(r => r.employeeCount || 0));
    const employeePerUser = finalYearActiveUsers > 0 ? (maxEmployees / finalYearActiveUsers) * 10000 : 0;
    
    if (employeePerUser > 5) {
      assessments.operational.items.push({
        item: '従業員数が過剰',
        risk: '中',
        score: 2,
        maxScore: 5,
        message: `1万人あたり${employeePerUser.toFixed(1)}人の従業員は多めです。`,
        recommendation: '業務効率化と自動化を進める必要があります。'
      });
    } else if (employeePerUser > 2) {
      assessments.operational.items.push({
        item: '従業員数は適切',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `1万人あたり${employeePerUser.toFixed(1)}人の従業員は適切です。`,
        recommendation: '現状の人員計画で問題ありません。'
      });
    } else {
      assessments.operational.items.push({
        item: '従業員数が少ない',
        risk: '中',
        score: 3,
        maxScore: 5,
        message: `1万人あたり${employeePerUser.toFixed(1)}人の従業員は少なめです。`,
        recommendation: 'サービス品質の維持に注意が必要です。'
      });
    }
    totalScore += assessments.operational.items[1].score;
    maxScore += assessments.operational.items[1].maxScore;

    // 3. キャッシュフローの評価
    const cumulativeNetProfit = simulationResults.reduce((sum, r, i) => {
      return sum + (r.netProfit || 0);
    }, 0);
    
    if (cumulativeNetProfit < 0) {
      assessments.operational.items.push({
        item: '累積利益がマイナス',
        risk: '高',
        score: 1,
        maxScore: 5,
        message: `5年間の累積利益が${cumulativeNetProfit.toLocaleString()}円とマイナスです。`,
        recommendation: '資金調達計画の見直しが急務です。'
      });
    } else if (cumulativeNetProfit < 100000000) {
      assessments.operational.items.push({
        item: '累積利益が少ない',
        risk: '中',
        score: 3,
        maxScore: 5,
        message: `5年間の累積利益${cumulativeNetProfit.toLocaleString()}円は少なめです。`,
        recommendation: '収益性の向上が必要です。'
      });
    } else {
      assessments.operational.items.push({
        item: '累積利益は適切',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `5年間の累積利益${cumulativeNetProfit.toLocaleString()}円は適切です。`,
        recommendation: '計画は健全です。'
      });
    }
    totalScore += assessments.operational.items[2].score;
    maxScore += assessments.operational.items[2].maxScore;

    // 個人情報・コンプライアンスリスク評価
    // 1. 個人情報の取扱規模の評価
    const maxUserData = Math.max(...simulationResults.map(r => r.activeUsers || 0));
    if (maxUserData > 500000) {
      assessments.privacy.items.push({
        item: '個人情報の取扱規模が非常に大きい',
        risk: '高',
        score: 2,
        maxScore: 5,
        message: `最大${maxUserData.toLocaleString()}人の個人情報を扱うため、データ保護の重要性が非常に高いです。`,
        recommendation: 'GDPRや個人情報保護法への完全な準拠、セキュリティ対策の強化、定期的な監査が必須です。'
      });
    } else if (maxUserData > 100000) {
      assessments.privacy.items.push({
        item: '個人情報の取扱規模が大きい',
        risk: '中',
        score: 3,
        maxScore: 5,
        message: `最大${maxUserData.toLocaleString()}人の個人情報を扱うため、適切なデータ保護対策が必要です。`,
        recommendation: '個人情報保護法への準拠、セキュリティ対策の実施、プライバシーポリシーの整備が必要です。'
      });
    } else {
      assessments.privacy.items.push({
        item: '個人情報の取扱規模は適切',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `最大${maxUserData.toLocaleString()}人の個人情報を扱う規模です。`,
        recommendation: '基本的な個人情報保護対策を実施すれば問題ありません。'
      });
    }
    totalScore += assessments.privacy.items[0].score;
    maxScore += assessments.privacy.items[0].maxScore;

    // 2. データセキュリティ対策の評価
    // systemUsageCostは技術リスク評価で既に計算済み
    const securityInvestmentRatio = totalRevenue > 0 ? (systemUsageCost * 0.2 / totalRevenue) * 100 : 0;
    
    if (securityInvestmentRatio < 0.5) {
      assessments.privacy.items.push({
        item: 'セキュリティ投資が不足',
        risk: '高',
        score: 2,
        maxScore: 5,
        message: `セキュリティ関連の投資が売上の${securityInvestmentRatio.toFixed(2)}%と低めです。`,
        recommendation: 'セキュリティ対策への投資を増やし、定期的な脆弱性診断やセキュリティ監査を実施してください。'
      });
    } else if (securityInvestmentRatio < 1.0) {
      assessments.privacy.items.push({
        item: 'セキュリティ投資は適切',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `セキュリティ関連の投資が売上の${securityInvestmentRatio.toFixed(2)}%です。`,
        recommendation: '現状のセキュリティ投資で問題ありませんが、継続的な見直しが必要です。'
      });
    } else {
      assessments.privacy.items.push({
        item: 'セキュリティ投資が十分',
        risk: '低',
        score: 5,
        maxScore: 5,
        message: `セキュリティ関連の投資が売上の${securityInvestmentRatio.toFixed(2)}%と適切です。`,
        recommendation: '計画は健全です。'
      });
    }
    totalScore += assessments.privacy.items[1].score;
    maxScore += assessments.privacy.items[1].maxScore;

    // 3. コンプライアンス対応の評価
    const hasComplianceRisk = maxUserData > 100000;
    if (hasComplianceRisk) {
      assessments.privacy.items.push({
        item: 'コンプライアンス対応が必要',
        risk: '中',
        score: 3,
        maxScore: 5,
        message: `大規模な個人情報取扱いのため、個人情報保護法、GDPR等への対応が必須です。`,
        recommendation: 'コンプライアンス体制の構築、プライバシーポリシーの整備、定期的な法改正への対応が必要です。'
      });
    } else {
      assessments.privacy.items.push({
        item: 'コンプライアンス対応は基本的で十分',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `個人情報保護法への基本的な対応で問題ありません。`,
        recommendation: '基本的なプライバシーポリシーの整備と個人情報保護方針の策定を実施してください。'
      });
    }
    totalScore += assessments.privacy.items[2].score;
    maxScore += assessments.privacy.items[2].maxScore;

    // 競合リスク評価
    // 1. 市場参入障壁の評価
    const marketEntryBarrier = finalYearRevenue > 1000000000 ? '高' : finalYearRevenue > 500000000 ? '中' : '低';
    if (marketEntryBarrier === '低') {
      assessments.competition.items.push({
        item: '市場参入障壁が低い',
        risk: '高',
        score: 2,
        maxScore: 5,
        message: `5年目の売上${finalYearRevenue.toLocaleString()}円は競合が参入しやすい規模です。`,
        recommendation: '差別化要因の強化、ブランド力の向上、顧客ロイヤルティの構築が急務です。'
      });
    } else if (marketEntryBarrier === '中') {
      assessments.competition.items.push({
        item: '市場参入障壁は中程度',
        risk: '中',
        score: 3,
        maxScore: 5,
        message: `5年目の売上${finalYearRevenue.toLocaleString()}円は一定の参入障壁があります。`,
        recommendation: '継続的な差別化と顧客満足度の向上が必要です。'
      });
    } else {
      assessments.competition.items.push({
        item: '市場参入障壁が高い',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `5年目の売上${finalYearRevenue.toLocaleString()}円は高い参入障壁があります。`,
        recommendation: '現状の市場ポジションを維持できそうです。'
      });
    }
    totalScore += assessments.competition.items[0].score;
    maxScore += assessments.competition.items[0].maxScore;

    // 2. 競合優位性の評価
    const userRetentionRate = 1 - (simulationParams.churnRates ? 
      Object.values(simulationParams.churnRates).reduce((sum, yearRates) => {
        if (!yearRates) return sum;
        const rates = Object.values(yearRates).filter(r => r !== null);
        return sum + (rates.reduce((s, r) => s + r, 0) / rates.length);
      }, 0) / Object.keys(simulationParams.churnRates).length : 0.15);
    
    if (userRetentionRate < 0.7) {
      assessments.competition.items.push({
        item: '顧客リテンション率が低い',
        risk: '高',
        score: 2,
        maxScore: 5,
        message: `顧客リテンション率${(userRetentionRate * 100).toFixed(1)}%は低めで、競合への流出リスクがあります。`,
        recommendation: '顧客満足度の向上、付加価値サービスの提供、ロイヤルティプログラムの導入が必要です。'
      });
    } else if (userRetentionRate < 0.85) {
      assessments.competition.items.push({
        item: '顧客リテンション率は中程度',
        risk: '中',
        score: 3,
        maxScore: 5,
        message: `顧客リテンション率${(userRetentionRate * 100).toFixed(1)}%は中程度です。`,
        recommendation: 'リテンション施策の強化を検討してください。'
      });
    } else {
      assessments.competition.items.push({
        item: '顧客リテンション率が高い',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `顧客リテンション率${(userRetentionRate * 100).toFixed(1)}%は良好です。`,
        recommendation: '現状の顧客満足度維持施策で問題ありません。'
      });
    }
    totalScore += assessments.competition.items[1].score;
    maxScore += assessments.competition.items[1].maxScore;

    // 3. 市場シェアの評価
    const marketShareEstimate = finalYearActiveUsers / 10000000; // 仮に市場規模を1000万人と想定
    if (marketShareEstimate < 0.01) {
      assessments.competition.items.push({
        item: '市場シェアが小さい',
        risk: '中',
        score: 3,
        maxScore: 5,
        message: `推定市場シェア${(marketShareEstimate * 100).toFixed(2)}%は小さいため、競合の影響を受けやすいです。`,
        recommendation: '市場シェア拡大のためのマーケティング戦略とブランド認知度向上が必要です。'
      });
    } else if (marketShareEstimate < 0.05) {
      assessments.competition.items.push({
        item: '市場シェアは中程度',
        risk: '低',
        score: 4,
        maxScore: 5,
        message: `推定市場シェア${(marketShareEstimate * 100).toFixed(2)}%は中程度です。`,
        recommendation: '継続的な成長戦略で市場シェアを拡大してください。'
      });
    } else {
      assessments.competition.items.push({
        item: '市場シェアが大きい',
        risk: '低',
        score: 5,
        maxScore: 5,
        message: `推定市場シェア${(marketShareEstimate * 100).toFixed(2)}%は良好です。`,
        recommendation: '計画は健全です。'
      });
    }
    totalScore += assessments.competition.items[2].score;
    maxScore += assessments.competition.items[2].maxScore;

    // 総合評価
    const overallScore = (totalScore / maxScore) * 100;
    assessments.overall.score = overallScore;
    assessments.overall.totalScore = totalScore;
    assessments.overall.maxScore = maxScore;
    
    if (overallScore >= 80) {
      assessments.overall.level = '優秀';
      assessments.overall.message = '事業計画は非常に健全で、実現可能性が高いです。計画通りに進めることで成功が見込めます。';
    } else if (overallScore >= 65) {
      assessments.overall.level = '良好';
      assessments.overall.message = '事業計画は良好です。いくつかの改善点がありますが、実現可能性は高いです。';
    } else if (overallScore >= 50) {
      assessments.overall.level = '要改善';
      assessments.overall.message = '事業計画には改善の余地があります。リスク要因を特定し、対策を講じる必要があります。';
    } else {
      assessments.overall.level = '要再検討';
      assessments.overall.message = '事業計画には重大なリスクがあります。計画の見直しが強く推奨されます。';
    }

    return assessments;
  }, [simulationResults, simulationParams, refreshKey]);

  const getRiskColor = (risk) => {
    switch (risk) {
      case '高': return '#ef4444';
      case '中': return '#f59e0b';
      case '低': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getScoreColor = (score, maxScore) => {
    const ratio = score / maxScore;
    if (ratio >= 0.8) return '#10b981';
    if (ratio >= 0.65) return '#3b82f6';
    if (ratio >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  const getOverallLevelColor = (level) => {
    switch (level) {
      case '優秀': return '#10b981';
      case '良好': return '#3b82f6';
      case '要改善': return '#f59e0b';
      case '要再検討': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>リスク評価</h1>
            <p className="specification-description">
              事業計画のシミュレーション結果を基に、財務・市場・技術・運営・個人情報・競合の各観点からリスクを評価し、実現可能性を分析します。
            </p>
            {simulationResults && simulationParams && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                border: '1px solid #3b82f6',
                fontSize: '14px',
                color: '#1e40af'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                  評価対象データ
                </div>
                <div style={{ fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                  {(() => {
                    // スナップショットから反映されたかどうかを確認
                    const snapshots = JSON.parse(localStorage.getItem('businessPlanSnapshots') || '[]');
                    const matchingSnapshot = snapshots.find(s => {
                      // スナップショットの結果と現在の結果を比較（簡易比較）
                      if (!s.results || s.results.length !== simulationResults.length) return false;
                      // 最初と最後の年の売上を比較
                      const sFirstRevenue = s.results[0]?.totalRevenue || 0;
                      const sLastRevenue = s.results[s.results.length - 1]?.totalRevenue || 0;
                      const currentFirstRevenue = simulationResults[0]?.totalRevenue || 0;
                      const currentLastRevenue = simulationResults[simulationResults.length - 1]?.totalRevenue || 0;
                      return sFirstRevenue === currentFirstRevenue && sLastRevenue === currentLastRevenue;
                    });
                    
                    if (matchingSnapshot) {
                      return `スナップショット: ${matchingSnapshot.name} (${new Date(matchingSnapshot.createdAt).toLocaleString('ja-JP')})`;
                    } else {
                      return `最新のシミュレーション結果`;
                    }
                  })()}
                </div>
                {(() => {
                  // 売上成長率を計算して表示
                  const revenueGrowth = simulationResults.map((r, i) => {
                    if (i === 0) return 0;
                    const prevRevenue = simulationResults[i - 1].totalRevenue || 0;
                    const currentRevenue = r.totalRevenue || 0;
                    return prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
                  });
                  const avgRevenueGrowth = revenueGrowth.slice(1).reduce((sum, g) => sum + g, 0) / (revenueGrowth.length - 1);
                  const finalYearRevenue = simulationResults[simulationResults.length - 1]?.totalRevenue || 0;
                  const finalYearNetProfit = simulationResults[simulationResults.length - 1]?.netProfit || 0;
                  const profitMargin = finalYearRevenue > 0 ? (finalYearNetProfit / finalYearRevenue) * 100 : 0;
                  
                  return (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #cbd5e1' }}>
                      <div>平均売上成長率: {avgRevenueGrowth.toFixed(1)}%</div>
                      <div>5年目売上: {finalYearRevenue.toLocaleString()}円</div>
                      <div>5年目利益率: {profitMargin.toFixed(1)}%</div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {!simulationResults || !simulationParams ? (
            <div className="specification-section">
              <p style={{ color: '#ef4444', fontSize: '16px', fontWeight: '500' }}>
                シミュレーション結果が見つかりません。まず「シミュレーション」ページで事業計画のパラメーターを設定し、「計算して反映」ボタンを押してください。
              </p>
              <button
                onClick={() => navigate('/specification/business-plan-simulation')}
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                シミュレーションページへ
              </button>
            </div>
          ) : riskAssessment ? (
            <>
              {/* 総合評価 */}
              <div className="specification-section">
                <h2 style={{ marginBottom: '32px', fontSize: '28px', fontWeight: '700', color: '#1f2937', borderBottom: '3px solid #667eea', paddingBottom: '12px' }}>
                  総合評価
                </h2>
                <div style={{ marginBottom: '16px' }}>
                  <button
                    ref={snapshotButtonRef}
                    onClick={(e) => {
                      const buttonRect = e.currentTarget.getBoundingClientRect();
                      const modalWidth = 400;
                      const modalLeft = Math.max(16, Math.min(buttonRect.left, window.innerWidth - modalWidth - 16));
                      setSnapshotModalPosition({
                        top: buttonRect.bottom + 8,
                        left: modalLeft + (modalWidth / 2)
                      });
                      setShowSnapshotModal(true);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#7c3aed';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#8b5cf6';
                    }}
                  >
                    スナップショットから反映
                  </button>
                </div>
                <div style={{
                  padding: '40px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${getOverallLevelColor(riskAssessment.overall.level)}20 0%, ${getOverallLevelColor(riskAssessment.overall.level)}08 100%)`,
                  border: `3px solid ${getOverallLevelColor(riskAssessment.overall.level)}`,
                  marginBottom: '24px',
                  boxShadow: `0 8px 24px ${getOverallLevelColor(riskAssessment.overall.level)}30`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${getOverallLevelColor(riskAssessment.overall.level)} 0%, ${getOverallLevelColor(riskAssessment.overall.level)}cc 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${getOverallLevelColor(riskAssessment.overall.level)}50`
                      }}>
                        <div style={{
                          fontSize: '36px',
                          fontWeight: '700',
                          color: 'white'
                        }}>
                          {riskAssessment.overall.score.toFixed(0)}
                        </div>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: getOverallLevelColor(riskAssessment.overall.level), marginBottom: '8px' }}>
                          {riskAssessment.overall.level}
                        </h3>
                        <div style={{ fontSize: '18px', color: '#6b7280', fontWeight: '500' }}>
                          {riskAssessment.overall.score.toFixed(1)}点 / 100点
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* プログレスバー */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{
                      width: '100%',
                      height: '16px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        width: `${riskAssessment.overall.score}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${getOverallLevelColor(riskAssessment.overall.level)} 0%, ${getOverallLevelColor(riskAssessment.overall.level)}cc 100%)`,
                        borderRadius: '8px',
                        transition: 'width 0.5s ease',
                        boxShadow: `0 2px 8px ${getOverallLevelColor(riskAssessment.overall.level)}50`
                      }} />
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    borderLeft: `6px solid ${getOverallLevelColor(riskAssessment.overall.level)}`
                  }}>
                    <p style={{ margin: 0, fontSize: '18px', lineHeight: '1.8', color: '#374151', fontWeight: '500' }}>
                      {riskAssessment.overall.message}
                    </p>
                  </div>
                </div>

                {/* レーダーチャート */}
                <div style={{
                  marginTop: '40px',
                  padding: '32px',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ marginBottom: '24px', fontSize: '22px', fontWeight: '700', color: '#1f2937', textAlign: 'center' }}>
                    全評価項目スコア
                  </h3>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                  {(() => {
                    // すべての評価項目をレーダーチャートのデータとして作成
                    const radarData = [];
                    
                    // AI活用により改善される項目を判定する関数
                    const getAIImprovedScore = (item, category) => {
                      const currentScore = (item.score / item.maxScore) * 100;
                      // AI活用により改善される項目を判定
                      const aiImprovableItems = [
                        // 運営リスク
                        '人件費比率が高い',
                        '人件費比率は適切',
                        '人件費比率が低い',
                        '従業員数が過剰',
                        '従業員数は適切',
                        '累積利益が少ない',
                        // 技術リスク
                        'システム利用料が高い',
                        'システム利用料は適切',
                        '大規模スケールが必要',
                        '中規模スケール',
                        // 個人情報・コンプライアンスリスク
                        'セキュリティ投資が不足',
                        'セキュリティ投資は適切',
                        'コンプライアンス対応が必要',
                        // 財務リスク
                        'コスト比率が非常に高い',
                        'コスト比率が高い',
                        'コスト比率は適切'
                      ];
                      
                      if (aiImprovableItems.includes(item.item)) {
                        // AI活用により10-30%改善（リスクが高いほど改善幅が大きい）
                        const improvementRate = item.risk === '高' ? 0.30 : item.risk === '中' ? 0.20 : 0.10;
                        return Math.min(100, currentScore + (100 - currentScore) * improvementRate);
                      }
                      return currentScore; // 改善されない項目は現在のスコアを返す
                    };
                    
                    // 財務リスクの項目
                    riskAssessment.financial.items.forEach((item) => {
                      radarData.push({
                        category: item.item,
                        score: (item.score / item.maxScore) * 100,
                        aiScore: getAIImprovedScore(item, 'financial'),
                        fullMark: 100,
                        risk: item.risk
                      });
                    });
                    
                    // 市場リスクの項目
                    riskAssessment.market.items.forEach((item) => {
                      radarData.push({
                        category: item.item,
                        score: (item.score / item.maxScore) * 100,
                        aiScore: getAIImprovedScore(item, 'market'),
                        fullMark: 100,
                        risk: item.risk
                      });
                    });
                    
                    // 技術リスクの項目
                    riskAssessment.technical.items.forEach((item) => {
                      radarData.push({
                        category: item.item,
                        score: (item.score / item.maxScore) * 100,
                        aiScore: getAIImprovedScore(item, 'technical'),
                        fullMark: 100,
                        risk: item.risk
                      });
                    });
                    
                    // 運営リスクの項目
                    riskAssessment.operational.items.forEach((item) => {
                      radarData.push({
                        category: item.item,
                        score: (item.score / item.maxScore) * 100,
                        aiScore: getAIImprovedScore(item, 'operational'),
                        fullMark: 100,
                        risk: item.risk
                      });
                    });
                    
                    // 個人情報・コンプライアンスリスクの項目
                    riskAssessment.privacy.items.forEach((item) => {
                      radarData.push({
                        category: item.item,
                        score: (item.score / item.maxScore) * 100,
                        aiScore: getAIImprovedScore(item, 'privacy'),
                        fullMark: 100,
                        risk: item.risk
                      });
                    });
                    
                    // 競合リスクの項目
                    riskAssessment.competition.items.forEach((item) => {
                      radarData.push({
                        category: item.item,
                        score: (item.score / item.maxScore) * 100,
                        aiScore: getAIImprovedScore(item, 'competition'),
                        fullMark: 100,
                        risk: item.risk
                      });
                    });

                    // カテゴリごとに色分け
                    const getCategoryColor = (category) => {
                      if (riskAssessment.financial.items.some(item => item.item === category)) {
                        return '#667eea'; // 財務: 紫
                      } else if (riskAssessment.market.items.some(item => item.item === category)) {
                        return '#10b981'; // 市場: 緑
                      } else if (riskAssessment.technical.items.some(item => item.item === category)) {
                        return '#f59e0b'; // 技術: オレンジ
                      } else if (riskAssessment.operational.items.some(item => item.item === category)) {
                        return '#3b82f6'; // 運営: 青
                      } else if (riskAssessment.privacy.items.some(item => item.item === category)) {
                        return '#8b5cf6'; // 個人情報: 紫
                      } else if (riskAssessment.competition.items.some(item => item.item === category)) {
                        return '#ec4899'; // 競合: ピンク
                      }
                      return '#6b7280';
                    };

                    return (
                      <ResponsiveContainer width="100%" height={600}>
                        <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis
                            dataKey="category"
                            tick={{ fontSize: 12, fill: '#374151', fontWeight: '600' }}
                            tickLine={{ stroke: '#9ca3af' }}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            tickCount={6}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Radar
                            name="現在のスコア"
                            dataKey="score"
                            stroke={getOverallLevelColor(riskAssessment.overall.level)}
                            fill={getOverallLevelColor(riskAssessment.overall.level)}
                            fillOpacity={0.3}
                            strokeWidth={2}
                            dot={{ r: 4, fill: getOverallLevelColor(riskAssessment.overall.level) }}
                          />
                          <Radar
                            name="AI活用後のスコア"
                            dataKey="aiScore"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.5}
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#10b981' }}
                          />
                          <Legend
                            wrapperStyle={{ paddingTop: '20px', textAlign: 'center' }}
                            iconType="circle"
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                    </div>

                    {/* 評価スコアテーブル */}
                    <div style={{ flex: '0 0 400px', maxHeight: '600px', overflowY: 'auto' }}>
                      <div style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        padding: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                          評価スコア
                        </h3>
                        
                        {/* 総合スコア */}
                        <div style={{
                          marginBottom: '16px',
                          padding: '12px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            総合スコア
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '4px'
                          }}>
                            <div style={{
                              fontSize: '24px',
                              fontWeight: '700',
                              color: getOverallLevelColor(riskAssessment.overall.level)
                            }}>
                              {riskAssessment.overall.score.toFixed(1)}点
                            </div>
                            <div>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: getOverallLevelColor(riskAssessment.overall.level),
                                marginBottom: '4px'
                              }}>
                                {riskAssessment.overall.level}
                              </div>
                              <div style={{
                                fontSize: '11px',
                                color: '#6b7280'
                              }}>
                                {riskAssessment.overall.totalScore}/{riskAssessment.overall.maxScore}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 評価項目テーブル */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                              <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#374151', position: 'sticky', top: 0, backgroundColor: '#f9fafb', zIndex: 10 }}>
                                カテゴリ
                              </th>
                              <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#374151', position: 'sticky', top: 0, backgroundColor: '#f9fafb', zIndex: 10 }}>
                                評価項目
                              </th>
                              <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: '#374151', position: 'sticky', top: 0, backgroundColor: '#f9fafb', zIndex: 10 }}>
                                スコア
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const allItems = [
                                ...riskAssessment.financial.items.map(item => ({ ...item, category: '財務' })),
                                ...riskAssessment.market.items.map(item => ({ ...item, category: '市場' })),
                                ...riskAssessment.technical.items.map(item => ({ ...item, category: '技術' })),
                                ...riskAssessment.operational.items.map(item => ({ ...item, category: '運営' })),
                                ...riskAssessment.privacy.items.map(item => ({ ...item, category: '個人情報・コンプライアンス' })),
                                ...riskAssessment.competition.items.map(item => ({ ...item, category: '競合' }))
                              ];

                              const categoryCounts = {};
                              allItems.forEach(item => {
                                categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
                              });

                              const categoryOrder = ['財務', '市場', '技術', '運営', '個人情報・コンプライアンス', '競合'];
                              const groupedByCategory = {};
                              allItems.forEach(item => {
                                if (!groupedByCategory[item.category]) {
                                  groupedByCategory[item.category] = [];
                                }
                                groupedByCategory[item.category].push(item);
                              });

                              const sortedItems = [];
                              categoryOrder.forEach(category => {
                                if (groupedByCategory[category]) {
                                  sortedItems.push(...groupedByCategory[category]);
                                }
                              });

                              let currentCategory = '';
                              let categoryRowIndex = 0;

                              return sortedItems.map((item, index) => {
                                const isFirstInCategory = item.category !== currentCategory;
                                if (isFirstInCategory) {
                                  currentCategory = item.category;
                                  categoryRowIndex = 0;
                                } else {
                                  categoryRowIndex++;
                                }

                                const rowspan = categoryCounts[item.category];

                                const getCategoryColor = (category) => {
                                  switch (category) {
                                    case '財務': return '#667eea';
                                    case '市場': return '#10b981';
                                    case '技術': return '#f59e0b';
                                    case '運営': return '#3b82f6';
                                    case '個人情報・コンプライアンス': return '#8b5cf6';
                                    case '競合': return '#ec4899';
                                    default: return '#6b7280';
                                  }
                                };

                                const getRiskColor = (risk) => {
                                  switch (risk) {
                                    case '高': return '#ef4444';
                                    case '中': return '#f59e0b';
                                    case '低': return '#10b981';
                                    default: return '#6b7280';
                                  }
                                };

                                return (
                                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    {isFirstInCategory && (
                                      <td
                                        rowSpan={rowspan}
                                        style={{
                                          padding: '8px',
                                          fontWeight: '600',
                                          color: getCategoryColor(item.category),
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
                                    <td style={{
                                      padding: '8px',
                                      textAlign: 'center',
                                      fontWeight: '600',
                                      color: getRiskColor(item.risk),
                                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                                    }}>
                                      {item.score}/{item.maxScore}
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 特記事項 */}
              <div className="specification-section">
                <h2 style={{ marginBottom: '32px', fontSize: '28px', fontWeight: '700', color: '#1f2937', borderBottom: '3px solid #667eea', paddingBottom: '12px' }}>
                  特記事項
                </h2>
                <div style={{
                  padding: '24px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '12px',
                  border: '2px solid #3b82f6',
                  borderLeft: '6px solid #3b82f6'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700', color: '#1e40af' }}>
                    🤖 AIネイティブ運営について
                  </h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '16px', lineHeight: '1.8', color: '#374151' }}>
                    本サービスは、運営・改修・サポートをAIを活用しながら行うAIネイティブ会社として運営する予定です。
                  </p>
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                      AI活用により改善が見込まれる領域：
                    </h4>
                    <ul style={{ margin: '0', paddingLeft: '24px', color: '#374151', lineHeight: '1.8' }}>
                      <li>運営リスク：AIによる業務自動化により人件費の最適化と効率化が可能</li>
                      <li>技術リスク：AIによる自動監視・自動対応によりシステム運用コストの削減</li>
                      <li>個人情報・コンプライアンスリスク：AIによる自動監視とコンプライアンスチェックの実現</li>
                      <li>財務リスク：AIによる業務効率化によりコスト構造の改善が期待できる</li>
                    </ul>
                  </div>
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        // 現在のパラメーターをバックアップとして保存
                        localStorage.setItem('businessPlanSimulationParamsBackup', JSON.stringify(simulationParams));
                        
                        // AIネイティブ運営を反映したシミュレーションパラメーターを生成
                        const aiOptimizedParams = JSON.parse(JSON.stringify(simulationParams)); // 深いコピー
                        
                        // 売上成長率を50%以下に調整（スコア4を達成）
                        // 目標アクティブユーザー数を段階的に調整
                        const baseTargets = aiOptimizedParams.yearlyTargets;
                        const optimizedTargets = {
                          2026: baseTargets[2026] || 5000,
                          2027: Math.floor((baseTargets[2026] || 5000) * 1.5), // 50%成長
                          2028: Math.floor((baseTargets[2026] || 5000) * 2.25), // 50%成長
                          2029: Math.floor((baseTargets[2026] || 5000) * 3.375), // 50%成長
                          2030: Math.floor((baseTargets[2026] || 5000) * 5.0625) // 50%成長
                        };
                        aiOptimizedParams.yearlyTargets = optimizedTargets;
                        
                        // AI活用により人件費を削減（従業員数を削減、年収を削減）
                        // 従業員数の設定を最適化
                        for (let year = 2026; year <= 2030; year++) {
                          if (!aiOptimizedParams.employeeSettings) {
                            aiOptimizedParams.employeeSettings = {};
                          }
                          if (!aiOptimizedParams.employeeSettings[year]) {
                            aiOptimizedParams.employeeSettings[year] = {};
                          }
                          // AI活用により従業員数を20-30%削減
                          const currentRegular = aiOptimizedParams.employeeSettings[year].regularEmployees;
                          if (currentRegular !== null && currentRegular !== undefined) {
                            aiOptimizedParams.employeeSettings[year].regularEmployees = Math.max(1, Math.floor(currentRegular * 0.7));
                          }
                          const currentContract = aiOptimizedParams.employeeSettings[year].contractEmployees;
                          if (currentContract !== null && currentContract !== undefined) {
                            aiOptimizedParams.employeeSettings[year].contractEmployees = Math.max(0, Math.floor(currentContract * 0.7));
                          }
                          const currentDispatched = aiOptimizedParams.employeeSettings[year].dispatchedEmployees;
                          if (currentDispatched !== null && currentDispatched !== undefined) {
                            aiOptimizedParams.employeeSettings[year].dispatchedEmployees = Math.max(0, Math.floor(currentDispatched * 0.7));
                          }
                          const currentOutsourced = aiOptimizedParams.employeeSettings[year].outsourcedEmployees;
                          if (currentOutsourced !== null && currentOutsourced !== undefined) {
                            aiOptimizedParams.employeeSettings[year].outsourcedEmployees = Math.max(0, Math.floor(currentOutsourced * 0.7));
                          }
                        }
                        
                        // 従業員年収の設定を最適化（AI活用により効率化）
                        for (let year = 2026; year <= 2030; year++) {
                          if (!aiOptimizedParams.employeeSalarySettings) {
                            aiOptimizedParams.employeeSalarySettings = {};
                          }
                          if (!aiOptimizedParams.employeeSalarySettings[year]) {
                            aiOptimizedParams.employeeSalarySettings[year] = {};
                          }
                          // AI活用により年収を10-15%削減（効率化による）
                          const currentRegularSalary = aiOptimizedParams.employeeSalarySettings[year].regularEmployeeAnnualSalary || 10000000;
                          aiOptimizedParams.employeeSalarySettings[year].regularEmployeeAnnualSalary = Math.floor(currentRegularSalary * 0.9);
                          const currentContractSalary = aiOptimizedParams.employeeSalarySettings[year].contractEmployeeAnnualSalary || 4000000;
                          aiOptimizedParams.employeeSalarySettings[year].contractEmployeeAnnualSalary = Math.floor(currentContractSalary * 0.9);
                          const currentDispatchedSalary = aiOptimizedParams.employeeSalarySettings[year].dispatchedEmployeeAnnualSalary || 3000000;
                          aiOptimizedParams.employeeSalarySettings[year].dispatchedEmployeeAnnualSalary = Math.floor(currentDispatchedSalary * 0.9);
                          const currentOutsourcedSalary = aiOptimizedParams.employeeSalarySettings[year].outsourcedEmployeeAnnualSalary || 2500000;
                          aiOptimizedParams.employeeSalarySettings[year].outsourcedEmployeeAnnualSalary = Math.floor(currentOutsourcedSalary * 0.9);
                        }
                        
                        // システム利用料の設定を最適化（AI活用により自動化）
                        for (let year = 2026; year <= 2030; year++) {
                          if (!aiOptimizedParams.systemUsageSettings) {
                            aiOptimizedParams.systemUsageSettings = {};
                          }
                          if (!aiOptimizedParams.systemUsageSettings[year]) {
                            aiOptimizedParams.systemUsageSettings[year] = {};
                          }
                          // AI活用によりシステム利用料を20-30%削減
                          const currentBase = aiOptimizedParams.systemUsageSettings[year].baseMonthly || 50000;
                          aiOptimizedParams.systemUsageSettings[year].baseMonthly = Math.floor(currentBase * 0.75);
                          const currentPerUser = aiOptimizedParams.systemUsageSettings[year].perUserMonthly || 5;
                          aiOptimizedParams.systemUsageSettings[year].perUserMonthly = Math.floor(currentPerUser * 0.8);
                        }
                        
                        // 販管費の設定を最適化（AI活用により業務効率化）
                        for (let year = 2026; year <= 2030; year++) {
                          if (!aiOptimizedParams.sgaSettings) {
                            aiOptimizedParams.sgaSettings = {};
                          }
                          if (!aiOptimizedParams.sgaSettings[year]) {
                            aiOptimizedParams.sgaSettings[year] = {};
                          }
                          // AI活用により販管費を15-25%削減
                          const currentBackOffice = aiOptimizedParams.sgaSettings[year].backOfficeLaborCost || 5000000;
                          aiOptimizedParams.sgaSettings[year].backOfficeLaborCost = Math.floor(currentBackOffice * 0.8);
                          const currentTransportation = aiOptimizedParams.sgaSettings[year].transportationCost || 500000;
                          aiOptimizedParams.sgaSettings[year].transportationCost = Math.floor(currentTransportation * 0.7);
                          const currentOther = aiOptimizedParams.sgaSettings[year].otherSGA || 500000;
                          aiOptimizedParams.sgaSettings[year].otherSGA = Math.floor(currentOther * 0.8);
                        }
                        
                        // パラメーターをlocalStorageに保存
                        localStorage.setItem('businessPlanSimulationParams', JSON.stringify(aiOptimizedParams));
                        
                        // シミュレーションページに遷移して再計算を促す
                        alert('AIネイティブ運営を反映したシミュレーションパラメーターを生成しました。\nシミュレーションページで「計算して反映」ボタンを押してください。');
                        window.location.href = '/specification/business-plan-simulation';
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#059669';
                        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#10b981';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                    >
                      🤖 AIネイティブ運営を反映したシミュレーションを生成
                    </button>
                    <button
                      onClick={() => {
                        // バックアップから元のパラメーターを復元
                        const backup = localStorage.getItem('businessPlanSimulationParamsBackup');
                        if (backup) {
                          localStorage.setItem('businessPlanSimulationParams', backup);
                          alert('元のシミュレーションパラメーターを復元しました。\nシミュレーションページで「計算して反映」ボタンを押してください。');
                          window.location.href = '/specification/business-plan-simulation';
                        } else {
                          alert('バックアップが見つかりませんでした。\nデフォルト値に戻します。');
                          // デフォルト値を取得して設定
                          const defaultParams = {
                            yearlyTargets: {
                              2026: 5000,
                              2027: 50000,
                              2028: 100000,
                              2029: 200000,
                              2030: 300000
                            },
                            userRatios: {
                              2026: { personalFree: 0.50, personalPremium: 0.05, municipality: 0.30, company: 0.15 },
                              2027: { personalFree: 0.50, personalPremium: 0.05, municipality: 0.30, company: 0.15 },
                              2028: { personalFree: 0.50, personalPremium: 0.05, municipality: 0.30, company: 0.15 },
                              2029: { personalFree: 0.50, personalPremium: 0.05, municipality: 0.30, company: 0.15 },
                              2030: { personalFree: 0.50, personalPremium: 0.05, municipality: 0.30, company: 0.15 }
                            },
                            churnRates: {
                              2026: { personalFree: 0.24, personalPremium: 0.24, company: 0.02, municipality: 0.02 },
                              2027: { personalFree: 0.24, personalPremium: 0.24, company: 0.02, municipality: 0.02 },
                              2028: { personalFree: 0.24, personalPremium: 0.24, company: 0.02, municipality: 0.02 },
                              2029: { personalFree: 0.24, personalPremium: 0.24, company: 0.02, municipality: 0.02 },
                              2030: { personalFree: 0.24, personalPremium: 0.24, company: 0.02, municipality: 0.02 }
                            },
                            maxChurnedCounts: {
                              2026: { personalFree: null, personalPremium: null, company: 20, municipality: null },
                              2027: { personalFree: null, personalPremium: null, company: 20, municipality: null },
                              2028: { personalFree: null, personalPremium: null, company: 20, municipality: null },
                              2029: { personalFree: null, personalPremium: null, company: 20, municipality: null },
                              2030: { personalFree: null, personalPremium: null, company: 20, municipality: null }
                            },
                            employeeSettings: {
                              2026: { regularEmployees: 1, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 },
                              2027: { regularEmployees: 2, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 },
                              2028: { regularEmployees: null, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 },
                              2029: { regularEmployees: null, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 },
                              2030: { regularEmployees: null, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 }
                            },
                            prices: {
                              personalPremiumMonthly: 980,
                              companyBaseAnnual: 50000,
                              companyMonthlyPerActiveUser: 500,
                              municipalityBaseAnnual: 100000,
                              municipalityMonthlyPerActiveUser: 300,
                              advertisingMonthly: 100000,
                              applicationAgencyPerCase: 3000,
                              referralFeeLessons: 5000,
                              referralFeeChildModel: 1000,
                              referralFeeHousekeeperMatching: 1000,
                              referralFeeTeacherMatching: 1000
                            },
                            maxReferralConversionCounts: {
                              2026: { lessons: 0, childModel: 0, housekeeperMatching: 0, teacherMatching: 0 },
                              2027: { lessons: 1000, childModel: 100, housekeeperMatching: 500, teacherMatching: 100 },
                              2028: { lessons: 1000, childModel: 100, housekeeperMatching: 500, teacherMatching: 100 },
                              2029: { lessons: 1000, childModel: 100, housekeeperMatching: 500, teacherMatching: 100 },
                              2030: { lessons: 1000, childModel: 100, housekeeperMatching: 500, teacherMatching: 100 }
                            },
                            ecReferralSettings: {
                              2026: {
                                conversionRates: { essentials: 1, educationalGoods: 1, healthFood: 1, healthGoods: 1, maternityGoods: 1 },
                                prices: { essentials: 1000, educationalGoods: 2000, healthFood: 3000, healthGoods: 1500, maternityGoods: 2500 }
                              },
                              2027: {
                                conversionRates: { essentials: 1, educationalGoods: 1, healthFood: 1, healthGoods: 1, maternityGoods: 1 },
                                prices: { essentials: 1000, educationalGoods: 2000, healthFood: 3000, healthGoods: 1500, maternityGoods: 2500 }
                              },
                              2028: {
                                conversionRates: { essentials: 1, educationalGoods: 1, healthFood: 1, healthGoods: 1, maternityGoods: 1 },
                                prices: { essentials: 1000, educationalGoods: 2000, healthFood: 3000, healthGoods: 1500, maternityGoods: 2500 }
                              },
                              2029: {
                                conversionRates: { essentials: 1, educationalGoods: 1, healthFood: 1, healthGoods: 1, maternityGoods: 1 },
                                prices: { essentials: 1000, educationalGoods: 2000, healthFood: 3000, healthGoods: 1500, maternityGoods: 2500 }
                              },
                              2030: {
                                conversionRates: { essentials: 1, educationalGoods: 1, healthFood: 1, healthGoods: 1, maternityGoods: 1 },
                                prices: { essentials: 1000, educationalGoods: 2000, healthFood: 3000, healthGoods: 1500, maternityGoods: 2500 }
                              }
                            },
                            sgaSettings: {
                              2026: {
                                backOfficeLaborCost: 5000000,
                                entertainmentCost: 0,
                                advertisingCostRate: 2,
                                transportationCost: 500000,
                                otherSGA: 500000,
                                depreciation: 2000000
                              },
                              2027: {
                                backOfficeLaborCost: 5000000,
                                entertainmentCost: 1000000,
                                advertisingCostRate: 2,
                                transportationCost: 500000,
                                otherSGA: 500000,
                                depreciation: 1800000
                              },
                              2028: {
                                backOfficeLaborCost: 5000000,
                                entertainmentCost: 1000000,
                                advertisingCostRate: 2,
                                transportationCost: 500000,
                                otherSGA: 500000,
                                depreciation: 1620000
                              },
                              2029: {
                                backOfficeLaborCost: 5000000,
                                entertainmentCost: 1000000,
                                advertisingCostRate: 2,
                                transportationCost: 500000,
                                otherSGA: 500000,
                                depreciation: 1458000
                              },
                              2030: {
                                backOfficeLaborCost: 5000000,
                                entertainmentCost: 1000000,
                                advertisingCostRate: 2,
                                transportationCost: 500000,
                                otherSGA: 500000,
                                depreciation: 1312200
                              }
                            },
                            systemUsageSettings: {
                              2026: { baseMonthly: 50000, perUserMonthly: 5 },
                              2027: { baseMonthly: 50000, perUserMonthly: 5 },
                              2028: { baseMonthly: 50000, perUserMonthly: 5 },
                              2029: { baseMonthly: 50000, perUserMonthly: 5 },
                              2030: { baseMonthly: 50000, perUserMonthly: 5 }
                            },
                            employeeSalarySettings: {
                              2026: {
                                regularEmployeeAnnualSalary: 10000000,
                                contractEmployeeAnnualSalary: 4000000,
                                dispatchedEmployeeAnnualSalary: 3000000,
                                outsourcedEmployeeAnnualSalary: 2500000
                              },
                              2027: {
                                regularEmployeeAnnualSalary: 10000000,
                                contractEmployeeAnnualSalary: 4000000,
                                dispatchedEmployeeAnnualSalary: 3000000,
                                outsourcedEmployeeAnnualSalary: 2500000
                              },
                              2028: {
                                regularEmployeeAnnualSalary: 10000000,
                                contractEmployeeAnnualSalary: 4000000,
                                dispatchedEmployeeAnnualSalary: 3000000,
                                outsourcedEmployeeAnnualSalary: 2500000
                              },
                              2029: {
                                regularEmployeeAnnualSalary: 10000000,
                                contractEmployeeAnnualSalary: 4000000,
                                dispatchedEmployeeAnnualSalary: 3000000,
                                outsourcedEmployeeAnnualSalary: 2500000
                              },
                              2030: {
                                regularEmployeeAnnualSalary: 10000000,
                                contractEmployeeAnnualSalary: 4000000,
                                dispatchedEmployeeAnnualSalary: 3000000,
                                outsourcedEmployeeAnnualSalary: 2500000
                              }
                            }
                          };
                          localStorage.setItem('businessPlanSimulationParams', JSON.stringify(defaultParams));
                          window.location.href = '/specification/business-plan-simulation';
                        }
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#4b5563';
                        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#6b7280';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                    >
                      ↩️ 元のシミュレーション数値に戻す
                    </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 全評価項目一覧 */}
              <div className="specification-section">
                <h2 style={{ marginBottom: '32px', fontSize: '28px', fontWeight: '700', color: '#1f2937', borderBottom: '3px solid #667eea', paddingBottom: '12px' }}>
                  評価項目一覧
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table className="financial-table" style={{ marginTop: '16px' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '12%', textAlign: 'left' }}>カテゴリ</th>
                        <th style={{ width: '20%', textAlign: 'left' }}>評価項目</th>
                        <th style={{ width: '10%' }}>リスクレベル</th>
                        <th style={{ width: '12%' }}>スコア</th>
                        <th style={{ width: '28%', textAlign: 'left' }}>評価内容</th>
                        <th style={{ width: '18%', textAlign: 'left' }}>推奨事項</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const allItems = [
                          ...riskAssessment.financial.items.map((item, idx) => ({ ...item, category: '💰 財務', categoryIndex: 0, itemIndex: idx })),
                          ...riskAssessment.market.items.map((item, idx) => ({ ...item, category: '📊 市場', categoryIndex: 1, itemIndex: idx })),
                          ...riskAssessment.technical.items.map((item, idx) => ({ ...item, category: '⚙️ 技術', categoryIndex: 2, itemIndex: idx })),
                          ...riskAssessment.operational.items.map((item, idx) => ({ ...item, category: '👥 運営', categoryIndex: 3, itemIndex: idx })),
                          ...riskAssessment.privacy.items.map((item, idx) => ({ ...item, category: '🔒 個人情報・コンプライアンス', categoryIndex: 4, itemIndex: idx })),
                          ...riskAssessment.competition.items.map((item, idx) => ({ ...item, category: '🏆 競合', categoryIndex: 5, itemIndex: idx }))
                        ];

                        const categoryCounts = {
                          0: riskAssessment.financial.items.length,
                          1: riskAssessment.market.items.length,
                          2: riskAssessment.technical.items.length,
                          3: riskAssessment.operational.items.length,
                          4: riskAssessment.privacy.items.length,
                          5: riskAssessment.competition.items.length
                        };

                        return allItems.map((item, index) => {
                          const scoreRatio = (item.score / item.maxScore) * 100;
                          const isFirstInCategory = item.itemIndex === 0;
                          const rowspan = categoryCounts[item.categoryIndex];
                          const rowIndex = allItems.slice(0, index).filter(i => i.categoryIndex === item.categoryIndex).length;
                          const isEvenRow = rowIndex % 2 === 0;

                          return (
                            <tr key={index} style={{ backgroundColor: isEvenRow ? '#ffffff' : '#f9fafb' }}>
                              {isFirstInCategory && (
                                <td 
                                  rowSpan={rowspan} 
                                  style={{ 
                                    padding: '12px 16px', 
                                    fontWeight: '600', 
                                    color: '#667eea',
                                    verticalAlign: 'middle',
                                    borderRight: '2px solid #e5e7eb'
                                  }}
                                >
                                  {item.category}
                                </td>
                              )}
                              <td style={{ padding: '10px 16px', fontWeight: '600', color: '#1f2937' }}>
                                {item.item}
                              </td>
                              <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  backgroundColor: getRiskColor(item.risk),
                                  color: 'white',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  display: 'inline-block'
                                }}>
                                  {item.risk}リスク
                                </span>
                              </td>
                              <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                <div style={{
                                  fontSize: '18px',
                                  fontWeight: '700',
                                  color: getScoreColor(item.score, item.maxScore)
                                }}>
                                  {item.score}/{item.maxScore}
                                </div>
                              </td>
                              <td style={{ padding: '10px 16px', color: '#6b7280', lineHeight: '1.5', fontSize: '14px' }}>
                                {item.message}
                              </td>
                              <td style={{ padding: '10px 16px', color: '#374151', lineHeight: '1.5', fontSize: '14px' }}>
                                {item.recommendation}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* スナップショット選択モーダル */}
      {showSnapshotModal && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999
            }}
            onClick={() => setShowSnapshotModal(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: `${snapshotModalPosition.top}px`,
              left: `${snapshotModalPosition.left}px`,
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '400px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              transform: 'translateX(-50%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>スナップショットから反映</h2>
              <button
                onClick={() => setShowSnapshotModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            {(() => {
              const snapshots = JSON.parse(localStorage.getItem('businessPlanSnapshots') || '[]');
              if (snapshots.length === 0) {
                return (
                  <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                    スナップショットがありません。シミュレーションページでスナップショットを保存してください。
                  </p>
                );
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {snapshots.map((snapshot) => (
                    <div
                      key={snapshot.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                      onClick={() => {
                        // スナップショットのパラメーターと結果を反映
                        localStorage.setItem('businessPlanSimulationParams', JSON.stringify(snapshot.params));
                        localStorage.setItem('businessPlanSimulationResults', JSON.stringify(snapshot.results));
                        localStorage.setItem('businessPlanSimulationKey', String(Date.now()));
                        setShowSnapshotModal(false);
                        // ページをリロードして反映
                        window.location.reload();
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{snapshot.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {new Date(snapshot.createdAt).toLocaleString('ja-JP')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={(e) => {
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
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('このスナップショットを削除しますか？')) {
                              const updatedSnapshots = snapshots.filter(s => s.id !== snapshot.id);
                              localStorage.setItem('businessPlanSnapshots', JSON.stringify(updatedSnapshots));
                              setShowSnapshotModal(false);
                              // ページをリロードして反映
                              window.location.reload();
                            }
                          }}
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
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
};

export default SpecificationRiskAssessment;

