import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Specification.css';

// 都道府県別の市区町村数と人口データ（2024年推計）
const PREFECTURE_DATA = [
  { prefecture: '北海道', municipalities: 179, population: 5188441, region: '北海道' },
  { prefecture: '青森県', municipalities: 33, population: 1207483, region: '東北' },
  { prefecture: '岩手県', municipalities: 33, population: 1206214, region: '東北' },
  { prefecture: '宮城県', municipalities: 35, population: 2301996, region: '東北' },
  { prefecture: '秋田県', municipalities: 25, population: 959502, region: '東北' },
  { prefecture: '山形県', municipalities: 35, population: 1072733, region: '東北' },
  { prefecture: '福島県', municipalities: 59, population: 1833152, region: '東北' },
  { prefecture: '茨城県', municipalities: 44, population: 2867009, region: '関東' },
  { prefecture: '栃木県', municipalities: 25, population: 1933140, region: '関東' },
  { prefecture: '群馬県', municipalities: 35, population: 1939110, region: '関東' },
  { prefecture: '埼玉県', municipalities: 63, population: 7344765, region: '関東' },
  { prefecture: '千葉県', municipalities: 54, population: 6284480, region: '関東' },
  { prefecture: '東京都', municipalities: 62, population: 14047594, region: '関東' },
  { prefecture: '神奈川県', municipalities: 33, population: 9237337, region: '関東' },
  { prefecture: '新潟県', municipalities: 30, population: 2201272, region: '中部' },
  { prefecture: '富山県', municipalities: 15, population: 1034814, region: '中部' },
  { prefecture: '石川県', municipalities: 19, population: 1132525, region: '中部' },
  { prefecture: '福井県', municipalities: 17, population: 767559, region: '中部' },
  { prefecture: '山梨県', municipalities: 27, population: 809974, region: '中部' },
  { prefecture: '長野県', municipalities: 77, population: 2048011, region: '中部' },
  { prefecture: '岐阜県', municipalities: 42, population: 1978742, region: '中部' },
  { prefecture: '静岡県', municipalities: 35, population: 3633202, region: '中部' },
  { prefecture: '愛知県', municipalities: 54, population: 7542415, region: '中部' },
  { prefecture: '三重県', municipalities: 29, population: 1770254, region: '中部' },
  { prefecture: '滋賀県', municipalities: 19, population: 1412916, region: '関西' },
  { prefecture: '京都府', municipalities: 26, population: 2583140, region: '関西' },
  { prefecture: '大阪府', municipalities: 43, population: 8809536, region: '関西' },
  { prefecture: '兵庫県', municipalities: 41, population: 5465002, region: '関西' },
  { prefecture: '奈良県', municipalities: 39, population: 1324477, region: '関西' },
  { prefecture: '和歌山県', municipalities: 30, population: 922584, region: '関西' },
  { prefecture: '鳥取県', municipalities: 19, population: 553407, region: '中国' },
  { prefecture: '島根県', municipalities: 19, population: 671126, region: '中国' },
  { prefecture: '岡山県', municipalities: 27, population: 1888432, region: '中国' },
  { prefecture: '広島県', municipalities: 23, population: 2803949, region: '中国' },
  { prefecture: '山口県', municipalities: 19, population: 1342059, region: '中国' },
  { prefecture: '徳島県', municipalities: 24, population: 720043, region: '四国' },
  { prefecture: '香川県', municipalities: 17, population: 950244, region: '四国' },
  { prefecture: '愛媛県', municipalities: 20, population: 1334841, region: '四国' },
  { prefecture: '高知県', municipalities: 34, population: 691527, region: '四国' },
  { prefecture: '福岡県', municipalities: 60, population: 5135214, region: '九州' },
  { prefecture: '佐賀県', municipalities: 20, population: 811442, region: '九州' },
  { prefecture: '長崎県', municipalities: 21, population: 1312317, region: '九州' },
  { prefecture: '熊本県', municipalities: 45, population: 1738301, region: '九州' },
  { prefecture: '大分県', municipalities: 18, population: 1123852, region: '九州' },
  { prefecture: '宮崎県', municipalities: 26, population: 1069576, region: '九州' },
  { prefecture: '鹿児島県', municipalities: 43, population: 1588256, region: '九州' },
  { prefecture: '沖縄県', municipalities: 41, population: 1467480, region: '沖縄' }
];

// 企業数の推定（従業員数ベース）
const estimateCompanyCount = (population) => {
  // 人口10万人あたり約500社（中小企業中心）と仮定
  return Math.floor((population / 100000) * 500);
};

// 日本の総人口（2024年推計、約1.24億人）
// 出典：総務省統計局「人口推計」
const TOTAL_JAPAN_POPULATION = 124000000;

// 2024年の全国出生数（厚生労働省「人口動態統計」、68万6061人）
// 出典：https://www.mhlw.go.jp/toukei/saikin/hw/jinkou/geppo/nengai24/dl/gaikyouR6.pdf
const ANNUAL_BIRTHS_2024 = 686061;

// 過去7年間の平均出生数（2018-2024年）
// 実際のデータでは年次変動があるが、簡略化のため平均を使用
// 2018-2024年の平均出生数は約80万人前後（実際の統計データに基づく）
// より正確な推定には各年の出生数データが必要
const AVERAGE_ANNUAL_BIRTHS = 800000;

// 2023年の全国出生数（約77万人）
const ANNUAL_BIRTHS_2023 = 770000;

// 2022年の全国出生数（約77万人）
const ANNUAL_BIRTHS_2022 = 770000;

// ターゲット人口の推定
const estimateTargetPopulation = (population) => {
  // 人口比率（都道府県人口 / 全国人口）
  const populationRatio = population / TOTAL_JAPAN_POPULATION;
  
  // 妊婦の推定（2024年の出生数68万人を基準に、同時期の妊婦数を推定）
  // 年間出生数から同時期の妊婦数 = 年間出生数 × (平均妊娠期間10ヶ月 / 12ヶ月)
  const annualBirthsForRegion = Math.floor(ANNUAL_BIRTHS_2024 * populationRatio);
  const pregnantWomen = Math.floor(annualBirthsForRegion * (10 / 12));
  
  // 0-6歳児の推定（過去7年間の出生数の合計から推定）
  // 各年齢層の出生数を簡略化して推定
  // 実際のデータでは年次変動があるが、平均出生数を使用
  const averageAnnualBirthsForRegion = Math.floor(AVERAGE_ANNUAL_BIRTHS * populationRatio);
  
  // 2024年の出生数（最新データ）
  const annualBirths2024ForRegion = Math.floor(ANNUAL_BIRTHS_2024 * populationRatio);
  
  // 年齢層別の推定（出生数の年次変動を考慮）
  // 0-1歳：1年間の出生数（2024年出生数）
  const children0to1 = annualBirths2024ForRegion;
  
  // 1-2歳：1年間の出生数（2023年出生数）
  const births2023ForRegion = Math.floor(ANNUAL_BIRTHS_2023 * populationRatio);
  const children1to2 = births2023ForRegion;
  
  // 2-3歳：1年間の出生数（2022年出生数）
  const births2022ForRegion = Math.floor(ANNUAL_BIRTHS_2022 * populationRatio);
  const children2to3 = births2022ForRegion;
  
  // 3-6歳：3年間の出生数の合計（2019-2021年の出生数、やや減少傾向を考慮）
  // 平均出生数から推定
  const children3to6 = Math.floor(averageAnnualBirthsForRegion * 3 * 0.95);
  
  const children0to6 = children0to1 + children1to2 + children2to3 + children3to6;
  
  // 各年齢層の親（夫婦で1カウント）
  const parents0to1 = children0to1;
  const parents1to2 = children1to2;
  const parents2to3 = children2to3;
  const parents3to6 = children3to6;
  
  // ターゲット人口の合計（妊婦と0-6歳児の親の合計）
  const totalTarget = pregnantWomen + parents0to1 + parents1to2 + parents2to3 + parents3to6;
  
  return {
    children0to6,
    children0to1,
    children1to2,
    children2to3,
    children3to6,
    pregnantWomen,
    parents0to1,
    parents1to2,
    parents2to3,
    parents3to6,
    parentsWithChildren: parents0to1 + parents1to2 + parents2to3 + parents3to6,
    totalTarget
  };
};

// 自治体導入後のユーザー数算出（各カテゴリー別の獲得率）
const estimateMunicipalityUsers = (population, acquisitionRates = {}) => {
  const {
    pregnantRate = 0.05,
    parents0to1Rate = 0.05,
    parents1to2Rate = 0.05,
    parents2to3Rate = 0.05,
    parents3to6Rate = 0.05
  } = acquisitionRates;
  
  const target = estimateTargetPopulation(population);
  
  // 各カテゴリー別の獲得ユーザー数
  const acquiredPregnant = Math.floor(target.pregnantWomen * pregnantRate);
  const acquiredParents0to1 = Math.floor(target.parents0to1 * parents0to1Rate);
  const acquiredParents1to2 = Math.floor(target.parents1to2 * parents1to2Rate);
  const acquiredParents2to3 = Math.floor(target.parents2to3 * parents2to3Rate);
  const acquiredParents3to6 = Math.floor(target.parents3to6 * parents3to6Rate);
  
  const totalAcquiredUsers = acquiredPregnant + acquiredParents0to1 + acquiredParents1to2 + acquiredParents2to3 + acquiredParents3to6;
  
  return {
    ...target,
    targetPopulation: target.totalTarget,
    acquiredUsers: totalAcquiredUsers,
    acquiredPregnant,
    acquiredParents0to1,
    acquiredParents1to2,
    acquiredParents2to3,
    acquiredParents3to6
  };
};

const SpecificationMarketSize = () => {
  const [selectedRegions, setSelectedRegions] = useState([]); // 複数選択可能な地域フィルター
  const [pregnantRate, setPregnantRate] = useState(30); // 妊婦の獲得率（%）
  const [parents0to1Rate, setParents0to1Rate] = useState(20); // 0-1歳の親の獲得率（%）
  const [parents1to2Rate, setParents1to2Rate] = useState(10); // 1-2歳の親の獲得率（%）
  const [parents2to3Rate, setParents2to3Rate] = useState(5); // 2-3歳の親の獲得率（%）
  const [parents3to6Rate, setParents3to6Rate] = useState(1); // 3-6歳の親の獲得率（%）

  // 地域選択のハンドラー
  const handleRegionToggle = (region) => {
    setSelectedRegions(prev => {
      if (prev.includes(region)) {
        return prev.filter(r => r !== region);
      } else {
        return [...prev, region];
      }
    });
  };
  
  // 獲得率オブジェクト
  const acquisitionRates = useMemo(() => ({
    pregnantRate: pregnantRate / 100,
    parents0to1Rate: parents0to1Rate / 100,
    parents1to2Rate: parents1to2Rate / 100,
    parents2to3Rate: parents2to3Rate / 100,
    parents3to6Rate: parents3to6Rate / 100
  }), [pregnantRate, parents0to1Rate, parents1to2Rate, parents2to3Rate, parents3to6Rate]);

  // 地域別データ
  const regionData = useMemo(() => {
    const regions = {};
    PREFECTURE_DATA.forEach(pref => {
      if (!regions[pref.region]) {
        regions[pref.region] = {
          region: pref.region,
          municipalities: 0,
          population: 0,
          companies: 0,
          targetPopulation: 0,
          acquiredUsers: 0
        };
      }
      const userData = estimateMunicipalityUsers(pref.population, acquisitionRates);
      regions[pref.region].municipalities += pref.municipalities;
      regions[pref.region].population += pref.population;
      regions[pref.region].companies += estimateCompanyCount(pref.population);
      regions[pref.region].targetPopulation += userData.targetPopulation;
      regions[pref.region].acquiredUsers += userData.acquiredUsers;
    });
    return Object.values(regions);
  }, [acquisitionRates]);

  // フィルタリングされた都道府県データ
  const filteredPrefectureData = useMemo(() => {
    let data = PREFECTURE_DATA.map(pref => {
      const userData = estimateMunicipalityUsers(pref.population, acquisitionRates);
      return {
        ...pref,
        companies: estimateCompanyCount(pref.population),
        ...userData
      };
    });

    if (selectedRegions.length > 0) {
      data = data.filter(pref => {
        // 九州を選択した場合、沖縄も含める
        if (selectedRegions.includes('九州')) {
          return selectedRegions.includes(pref.region) || pref.region === '沖縄';
        }
        return selectedRegions.includes(pref.region);
      });
    }

    // 獲得ユーザー数でソート
    return data.sort((a, b) => b.acquiredUsers - a.acquiredUsers);
  }, [selectedRegions, acquisitionRates]);

  // 総計（全地域）
  const totals = useMemo(() => {
    let totalTarget = 0;
    let totalAcquired = 0;
    let totalChildren0to6 = 0;
    let totalChildren0to1 = 0;
    let totalChildren1to2 = 0;
    let totalChildren2to3 = 0;
    let totalChildren3to6 = 0;
    let totalPregnant = 0;
    let totalParents0to1 = 0;
    let totalParents1to2 = 0;
    let totalParents2to3 = 0;
    let totalParents3to6 = 0;
    let totalAcquiredPregnant = 0;
    let totalAcquiredParents0to1 = 0;
    let totalAcquiredParents1to2 = 0;
    let totalAcquiredParents2to3 = 0;
    let totalAcquiredParents3to6 = 0;

    PREFECTURE_DATA.forEach(pref => {
      const userData = estimateMunicipalityUsers(pref.population, acquisitionRates);
      totalTarget += userData.targetPopulation;
      totalAcquired += userData.acquiredUsers;
      totalChildren0to6 += userData.children0to6;
      totalChildren0to1 += userData.children0to1;
      totalChildren1to2 += userData.children1to2;
      totalChildren2to3 += userData.children2to3;
      totalChildren3to6 += userData.children3to6;
      totalPregnant += userData.pregnantWomen;
      totalParents0to1 += userData.parents0to1;
      totalParents1to2 += userData.parents1to2;
      totalParents2to3 += userData.parents2to3;
      totalParents3to6 += userData.parents3to6;
      totalAcquiredPregnant += userData.acquiredPregnant;
      totalAcquiredParents0to1 += userData.acquiredParents0to1;
      totalAcquiredParents1to2 += userData.acquiredParents1to2;
      totalAcquiredParents2to3 += userData.acquiredParents2to3;
      totalAcquiredParents3to6 += userData.acquiredParents3to6;
    });

    return {
      municipalities: PREFECTURE_DATA.reduce((sum, pref) => sum + pref.municipalities, 0),
      population: PREFECTURE_DATA.reduce((sum, pref) => sum + pref.population, 0),
      companies: PREFECTURE_DATA.reduce((sum, pref) => sum + estimateCompanyCount(pref.population), 0),
      targetPopulation: totalTarget,
      acquiredUsers: totalAcquired,
      children0to6: totalChildren0to6,
      children0to1: totalChildren0to1,
      children1to2: totalChildren1to2,
      children2to3: totalChildren2to3,
      children3to6: totalChildren3to6,
      pregnantWomen: totalPregnant,
      parents0to1: totalParents0to1,
      parents1to2: totalParents1to2,
      parents2to3: totalParents2to3,
      parents3to6: totalParents3to6,
      parentsWithChildren: totalParents0to1 + totalParents1to2 + totalParents2to3 + totalParents3to6,
      acquiredPregnant: totalAcquiredPregnant,
      acquiredParents0to1: totalAcquiredParents0to1,
      acquiredParents1to2: totalAcquiredParents1to2,
      acquiredParents2to3: totalAcquiredParents2to3,
      acquiredParents3to6: totalAcquiredParents3to6
    };
  }, [acquisitionRates]);

  // フィルター適用後の総計（選択された地域の合計）
  const filteredTotals = useMemo(() => {
    if (selectedRegions.length === 0) {
      return null; // 地域が選択されていない場合はnullを返す
    }

    let totalTarget = 0;
    let totalAcquired = 0;
    let totalPregnant = 0;
    let totalParents0to1 = 0;
    let totalParents1to2 = 0;
    let totalParents2to3 = 0;
    let totalParents3to6 = 0;
    let totalAcquiredPregnant = 0;
    let totalAcquiredParents0to1 = 0;
    let totalAcquiredParents1to2 = 0;
    let totalAcquiredParents2to3 = 0;
    let totalAcquiredParents3to6 = 0;
    let totalMunicipalities = 0;
    let totalPopulation = 0;
    let totalCompanies = 0;

    const filteredData = PREFECTURE_DATA.filter(pref => {
      // 九州を選択した場合、沖縄も含める
      if (selectedRegions.includes('九州')) {
        return selectedRegions.includes(pref.region) || pref.region === '沖縄';
      }
      return selectedRegions.includes(pref.region);
    });

    filteredData.forEach(pref => {
      const userData = estimateMunicipalityUsers(pref.population, acquisitionRates);
      totalTarget += userData.targetPopulation;
      totalAcquired += userData.acquiredUsers;
      totalPregnant += userData.pregnantWomen;
      totalParents0to1 += userData.parents0to1;
      totalParents1to2 += userData.parents1to2;
      totalParents2to3 += userData.parents2to3;
      totalParents3to6 += userData.parents3to6;
      totalAcquiredPregnant += userData.acquiredPregnant;
      totalAcquiredParents0to1 += userData.acquiredParents0to1;
      totalAcquiredParents1to2 += userData.acquiredParents1to2;
      totalAcquiredParents2to3 += userData.acquiredParents2to3;
      totalAcquiredParents3to6 += userData.acquiredParents3to6;
      totalMunicipalities += pref.municipalities;
      totalPopulation += pref.population;
      totalCompanies += estimateCompanyCount(pref.population);
    });

    return {
      municipalities: totalMunicipalities,
      population: totalPopulation,
      companies: totalCompanies,
      targetPopulation: totalTarget,
      acquiredUsers: totalAcquired,
      pregnantWomen: totalPregnant,
      parents0to1: totalParents0to1,
      parents1to2: totalParents1to2,
      parents2to3: totalParents2to3,
      parents3to6: totalParents3to6,
      parentsWithChildren: totalParents0to1 + totalParents1to2 + totalParents2to3 + totalParents3to6,
      acquiredPregnant: totalAcquiredPregnant,
      acquiredParents0to1: totalAcquiredParents0to1,
      acquiredParents1to2: totalAcquiredParents1to2,
      acquiredParents2to3: totalAcquiredParents2to3,
      acquiredParents3to6: totalAcquiredParents3to6,
      selectedRegions: selectedRegions
    };
  }, [selectedRegions, acquisitionRates]);

  // 地域別の円グラフデータ
  const regionChartData = useMemo(() => {
    return regionData.map(region => ({
      name: region.region,
      value: region.acquiredUsers
    }));
  }, [regionData]);

  // ターゲット人口の内訳データ（詳細の項目と一致）
  const targetBreakdownData = useMemo(() => {
    return [
      { name: '妊婦', value: totals.pregnantWomen },
      { name: '0-1歳の親', value: totals.parents0to1 },
      { name: '1-2歳の親', value: totals.parents1to2 },
      { name: '2-3歳の親', value: totals.parents2to3 },
      { name: '3-6歳の親', value: totals.parents3to6 }
    ];
  }, [totals]);


  // トップ10都道府県
  const top10Prefectures = useMemo(() => {
    return filteredPrefectureData.slice(0, 10);
  }, [filteredPrefectureData]);

  const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>市場規模</h1>
            <p className="specification-description">
              出産支援・育児支援サービスの市場規模と成長性について分析します。獲得できるユーザー数のポテンシャル、自治体数、企業数を可視化します。
            </p>
          </div>

          {/* 総計サマリー */}
          <div className="specification-section">
            <h2>市場規模サマリー</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '20px' }}>
              <div style={{ padding: '20px', backgroundColor: '#f0f4ff', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#667eea', marginBottom: '8px' }}>
                  {totals.municipalities.toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>自治体数</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                  {(totals.population / 1000000).toFixed(1)}M
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>総人口</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
                  {totals.companies.toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>推定企業数</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fce7f3', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#ec4899', marginBottom: '8px' }}>
                  {totals.acquiredUsers.toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>獲得ユーザー数</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  (各カテゴリー別獲得率適用)
                </div>
              </div>
            </div>
          </div>

          {/* ターゲット人口の内訳 */}
          <div className="specification-section">
            <h2>ターゲット人口の内訳</h2>
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0f4ff', borderRadius: '6px', fontSize: '13px', color: '#6b7280' }}>
              <strong>算出方法：</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li><strong>妊婦数：</strong>2024年の出生数（68万6061人）を基準に、平均妊娠期間10ヶ月を考慮して算出（年間出生数 × 10/12）</li>
                <li><strong>0-1歳の親：</strong>1年間の出生数（2024年出生数：68万6061人）と同数（夫婦で1カウント）</li>
                <li><strong>1-2歳の親：</strong>1年間の出生数（2023年出生数：約77万人）と同数（夫婦で1カウント）</li>
                <li><strong>2-3歳の親：</strong>1年間の出生数（2022年出生数：約77万人）と同数（夫婦で1カウント）</li>
                <li><strong>3-6歳の親：</strong>3年間の出生数の合計（2019-2021年の出生数）から推定した3-6歳児の数と同数（夫婦で1カウント、年次変動を考慮）</li>
              </ul>
              <div style={{ marginTop: '8px' }}>
                <strong>エビデンス：</strong>
                <a 
                  href="https://www.mhlw.go.jp/toukei/saikin/hw/jinkou/geppo/nengai24/dl/gaikyouR6.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#667eea', textDecoration: 'underline', marginLeft: '8px' }}
                >
                  厚生労働省「人口動態統計（令和6年）」
                </a>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginTop: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                  ターゲット人口の構成
                  <a 
                    href="https://www.mhlw.go.jp/toukei/saikin/hw/jinkou/geppo/nengai24/dl/gaikyouR6.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: '#667eea', textDecoration: 'none', marginLeft: '8px' }}
                    title="データ出典：厚生労働省「人口動態統計（令和6年）」"
                  >
                    📊
                  </a>
                </h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={targetBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {targetBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => {
                          const itemName = props.payload?.name || '';
                          const unit = itemName.includes('親') ? '組' : '人';
                          return `${value.toLocaleString()}${unit}`;
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>ターゲット人口の詳細</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>カテゴリー</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>ターゲット人口</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>獲得率</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>獲得数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>妊婦</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{totals.pregnantWomen.toLocaleString()}人</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{pregnantRate}%</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>{totals.acquiredPregnant.toLocaleString()}人</td>
                      </tr>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>0-1歳の親（夫婦で1カウント）</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{totals.parents0to1.toLocaleString()}組</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{parents0to1Rate}%</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>{totals.acquiredParents0to1.toLocaleString()}組</td>
                      </tr>
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>1-2歳の親（夫婦で1カウント）</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{totals.parents1to2.toLocaleString()}組</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{parents1to2Rate}%</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', color: '#f59e0b' }}>{totals.acquiredParents1to2.toLocaleString()}組</td>
                      </tr>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>2-3歳の親（夫婦で1カウント）</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{totals.parents2to3.toLocaleString()}組</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{parents2to3Rate}%</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', color: '#8b5cf6' }}>{totals.acquiredParents2to3.toLocaleString()}組</td>
                      </tr>
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>3-6歳の親（夫婦で1カウント）</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{totals.parents3to6.toLocaleString()}組</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{parents3to6Rate}%</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', color: '#ec4899' }}>{totals.acquiredParents3to6.toLocaleString()}組</td>
                      </tr>
                      <tr style={{ backgroundColor: '#f0f4ff', fontWeight: '700', borderTop: '2px solid #667eea' }}>
                        <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: '600' }}>合計</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>{totals.targetPopulation.toLocaleString()}人</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>-</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>{totals.acquiredUsers.toLocaleString()}人</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* パラメータ設定 */}
          <div className="specification-section">
            <h2>パラメータ設定</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '20px' }}>
              {/* 妊婦の獲得率 */}
              <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#065f46' }}>
                  妊婦の獲得率（%）
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={pregnantRate}
                  onChange={(e) => setPregnantRate(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                  {pregnantRate}%
                </div>
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                  ターゲット: {totals.pregnantWomen.toLocaleString()}人<br />
                  獲得: {totals.acquiredPregnant.toLocaleString()}人
                </div>
              </div>

              {/* 0-1歳の親の獲得率 */}
              <div style={{ padding: '16px', backgroundColor: '#f0f4ff', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#3730a3' }}>
                  0-1歳の親の獲得率（%）
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={parents0to1Rate}
                  onChange={(e) => setParents0to1Rate(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: '700', color: '#667eea' }}>
                  {parents0to1Rate}%
                </div>
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                  ターゲット: {totals.parents0to1.toLocaleString()}組<br />
                  獲得: {totals.acquiredParents0to1.toLocaleString()}組
                </div>
              </div>

              {/* 1-2歳の親の獲得率 */}
              <div style={{ padding: '16px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                  1-2歳の親の獲得率（%）
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={parents1to2Rate}
                  onChange={(e) => setParents1to2Rate(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: '700', color: '#f59e0b' }}>
                  {parents1to2Rate}%
                </div>
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                  ターゲット: {totals.parents1to2.toLocaleString()}組<br />
                  獲得: {totals.acquiredParents1to2.toLocaleString()}組
                </div>
              </div>

              {/* 2-3歳の親の獲得率 */}
              <div style={{ padding: '16px', backgroundColor: '#f3e8ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#6b21a8' }}>
                  2-3歳の親の獲得率（%）
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={parents2to3Rate}
                  onChange={(e) => setParents2to3Rate(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: '700', color: '#8b5cf6' }}>
                  {parents2to3Rate}%
                </div>
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                  ターゲット: {totals.parents2to3.toLocaleString()}組<br />
                  獲得: {totals.acquiredParents2to3.toLocaleString()}組
                </div>
              </div>

              {/* 3-6歳の親の獲得率 */}
              <div style={{ padding: '16px', backgroundColor: '#fdf2f8', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#9f1239' }}>
                  3-6歳の親の獲得率（%）
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={parents3to6Rate}
                  onChange={(e) => setParents3to6Rate(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: '700', color: '#ec4899' }}>
                  {parents3to6Rate}%
                </div>
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                  ターゲット: {totals.parents3to6.toLocaleString()}組<br />
                  獲得: {totals.acquiredParents3to6.toLocaleString()}組
                </div>
              </div>
            </div>
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0f4ff', borderRadius: '8px', border: '2px solid #667eea' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#3730a3' }}>
                提供地域フィルター（複数選択可能）
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '6px' }}>
                {['北海道', '東北', '関東', '中部', '関西', '中国', '四国', '九州'].map(region => (
                  <label
                    key={region}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 10px',
                      backgroundColor: selectedRegions.includes(region) ? '#e0e7ff' : 'white',
                      border: `1px solid ${selectedRegions.includes(region) ? '#667eea' : '#d1d5db'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: selectedRegions.includes(region) ? '600' : '400',
                      color: selectedRegions.includes(region) ? '#3730a3' : '#6b7280',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes(region)}
                      onChange={() => handleRegionToggle(region)}
                      style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    {region}{region === '九州' && <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>（沖縄含む）</span>}
                  </label>
                ))}
              </div>
            </div>

          {/* 地域別結果テーブル */}
          <div className="specification-section">
            <h2>地域別結果</h2>
            <div style={{ marginTop: '16px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>地域</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>自治体数</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>ターゲット人口</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>獲得ユーザー数</th>
                    {selectedRegions.length > 0 && (
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', backgroundColor: '#fef3c7' }}>
                        選択地域合計
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {regionData.map((region, index) => {
                    const isSelected = selectedRegions.length > 0 && selectedRegions.includes(region.region);
                    return (
                      <tr 
                        key={region.region} 
                        style={{ 
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                          fontWeight: isSelected ? '600' : '400'
                        }}
                      >
                        <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: '500' }}>
                          {region.region}
                          {region.region === '九州' && <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>（沖縄含む）</span>}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>
                          {region.municipalities.toLocaleString()}件
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '500' }}>
                          {region.targetPopulation.toLocaleString()}人
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>
                          {region.acquiredUsers.toLocaleString()}人
                        </td>
                        {selectedRegions.length > 0 && (
                          <td style={{ 
                            padding: '12px', 
                            border: '1px solid #ddd', 
                            textAlign: 'right', 
                            fontWeight: isSelected ? '700' : '400',
                            backgroundColor: isSelected ? '#fef3c7' : 'transparent',
                            color: isSelected ? '#92400e' : '#6b7280'
                          }}>
                            {isSelected ? '✓' : '-'}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {/* 合計行 */}
                  <tr style={{ backgroundColor: '#f0f4ff', fontWeight: '700', borderTop: '2px solid #667eea' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: '600' }}>全国合計</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>
                      {totals.municipalities.toLocaleString()}件
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>
                      {totals.targetPopulation.toLocaleString()}人
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>
                      {totals.acquiredUsers.toLocaleString()}人
                    </td>
                    {selectedRegions.length > 0 && filteredTotals && (
                      <td style={{ 
                        padding: '12px', 
                        border: '1px solid #ddd', 
                        textAlign: 'right', 
                        fontWeight: '700',
                        backgroundColor: '#fef3c7',
                        color: '#92400e'
                      }}>
                        {filteredTotals.acquiredUsers.toLocaleString()}人
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          </div>

          {/* 地域別ポテンシャル */}
          <div className="specification-section">
            <h2>地域別獲得ユーザー数</h2>
            <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
              <ResponsiveContainer>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" tick={{ fontSize: '12px' }} />
                  <YAxis
                    tick={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'acquiredUsers') {
                        return [`${value.toLocaleString()}人`, '獲得ユーザー数'];
                      }
                      return [`${value.toLocaleString()}人`, 'ターゲット人口'];
                    }}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend />
                  <Bar dataKey="targetPopulation" name="ターゲット人口" fill="#cbd5e1" />
                  <Bar dataKey="acquiredUsers" name="獲得ユーザー数" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 地域別分布（円グラフ） */}
          <div className="specification-section">
            <h2>地域別分布</h2>
            <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={regionChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {regionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()}人`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 都道府県別詳細 */}
          <div className="specification-section">
            <h2>都道府県別詳細データ</h2>
            <div style={{ marginTop: '16px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>都道府県</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>自治体数</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>人口</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>推定企業数</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>妊婦</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>0-1歳の親</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>1-2歳の親</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>2-3歳の親</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>3-6歳の親</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>ターゲット人口</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>獲得ユーザー数</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600' }}>獲得率</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrefectureData.map((pref, index) => {
                    const acquisitionRatePercent = ((pref.acquiredUsers / pref.targetPopulation) * 100).toFixed(1);
                    return (
                      <tr key={pref.prefecture} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                        <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: '500' }}>{pref.prefecture}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>{pref.municipalities.toLocaleString()}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>{pref.population.toLocaleString()}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>{pref.companies.toLocaleString()}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '13px' }}>{pref.pregnantWomen.toLocaleString()}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '13px' }}>{pref.parents0to1.toLocaleString()}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '13px' }}>{pref.parents1to2.toLocaleString()}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '13px' }}>{pref.parents2to3.toLocaleString()}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '13px' }}>{pref.parents3to6.toLocaleString()}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '500' }}>{pref.targetPopulation.toLocaleString()}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>
                          {pref.acquiredUsers.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '13px', color: '#6b7280' }}>
                          {acquisitionRatePercent}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* トップ10都道府県 */}
          <div className="specification-section">
            <h2>獲得ユーザー数 トップ10都道府県</h2>
            <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
              <ResponsiveContainer>
                <BarChart data={top10Prefectures} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <YAxis
                    type="category"
                    dataKey="prefecture"
                    tick={{ fontSize: '12px' }}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'acquiredUsers') {
                        return [`${value.toLocaleString()}人`, '獲得ユーザー数'];
                      }
                      return [`${value.toLocaleString()}人`, name === 'targetPopulation' ? 'ターゲット人口' : name];
                    }}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend />
                  <Bar dataKey="targetPopulation" name="ターゲット人口" fill="#cbd5e1" />
                  <Bar dataKey="acquiredUsers" name="獲得ユーザー数" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ターゲット自治体の分析 */}
          <div className="specification-section">
            <h2>ターゲット自治体の分析</h2>
            <p style={{ marginTop: '16px', lineHeight: '1.6' }}>
              以下の基準でターゲット自治体を選定しています：
            </p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px', lineHeight: '1.8' }}>
              <li>人口10万人以上の都市（中核市・特例市・政令指定都市）</li>
              <li>ポテンシャルユーザー数が5,000人以上の自治体</li>
              <li>少子化対策に積極的な自治体</li>
            </ul>
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0f4ff', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>優先ターゲット自治体</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {filteredPrefectureData
                  .filter(pref => pref.acquiredUsers >= 5000)
                  .slice(0, 20)
                  .map(pref => {
                    const acquisitionRatePercent = ((pref.acquiredUsers / pref.targetPopulation) * 100).toFixed(1);
                    return (
                      <div
                        key={pref.prefecture}
                        style={{
                          padding: '12px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>{pref.prefecture}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                          ターゲット人口: {pref.targetPopulation.toLocaleString()}人
                        </div>
                        <div style={{ fontSize: '12px', color: '#667eea', fontWeight: '600', marginBottom: '2px' }}>
                          獲得ユーザー数: {pref.acquiredUsers.toLocaleString()}人
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                          獲得率: {acquisitionRatePercent}%
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          自治体数: {pref.municipalities}件
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationMarketSize;
