import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Specification.css';

const SpecificationBusinessPlanDetail = () => {
  const navigate = useNavigate();
  const [unitMode, setUnitMode] = useState('yen'); // 'yen', 'thousand', 'million'
  
  // 年を年目表記に変換する関数
  const getYearLabel = (year) => {
    return `${year - 2025}年目`;
  };
  
  // 年度配列（7年目まで）
  const years = [2026, 2027, 2028, 2029, 2030, 2031, 2032];
  const [expandedSections, setExpandedSections] = useState({
    personalUsers: false,
    personalFreeUsers: false,
    personalPremiumUsers: false,
    company: false,
    companyEmployees: false,
    municipality: false,
    municipalityUsers: false,
    referralRevenue: false, // 紹介手数料収入
    ecReferralRevenue: false, // EC/リファラル関連収入の内訳
    medicalRevenue: false, // 医療関連収入の内訳
    insuranceRevenue: false, // 保険関連収入の内訳
    renovationRevenue: false, // リフォーム関連収入の内訳
    albumRevenue: false, // アルバム関連収入の内訳
    certificationSupportKurumin: false, // くるみん認定取得支援の内訳
    certificationSupportHealthManagement: false, // 健康経営優良法人認定取得支援の内訳
    laborCost: false, // 人件費の内訳
    employeeBreakdown: false, // 従業員数の内訳
    revenueDetails: false, // 売上詳細項目の表示/非表示
    costDetails: false // 売上原価詳細項目の表示/非表示
  });
  // localStorageからシミュレーションパラメーターを読み込む
  const getInitialSimulationParams = () => {
    const saved = localStorage.getItem('businessPlanSimulationParams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse simulation params:', e);
      }
    }
    return {
    // 年度末の目標アクティブユーザー数
    yearlyTargets: {
      2026: 5000,
      2027: 50000,
      2028: 100000,
      2029: 200000,
      2030: 300000,
      2031: 400000,
      2032: 500000
    },
    // ユーザー構成比（年ごと）
    userRatios: {
      2026: { personalFree: 0.50, personalPremium: 0.05, municipality: 0.30, company: 0.15 },
      2027: { personalFree: 0.50, personalPremium: 0.05, municipality: 0.30, company: 0.15 },
      2028: { personalFree: 0.50, personalPremium: 0.05, municipality: 0.30, company: 0.15 },
      2029: { personalFree: 0.50, personalPremium: 0.05, municipality: 0.30, company: 0.15 },
      2030: { personalFree: 0.50, personalPremium: 0.05, municipality: 0.30, company: 0.15 },
      2031: { personalFree: 0.50, personalPremium: 0.05, municipality: 0.30, company: 0.15 },
      2032: { personalFree: 0.50, personalPremium: 0.05, municipality: 0.30, company: 0.15 }
    },
    // 解約率（年ごと、カテゴリーごと）
    churnRates: {
      2026: { personalFree: 0.24, personalPremium: 0.24, company: 0.02, municipality: 0.02 },
      2027: { personalFree: 0.24, personalPremium: 0.24, company: 0.02, municipality: 0.02 },
      2028: { personalFree: 0.24, personalPremium: 0.24, company: 0.02, municipality: 0.02 },
      2029: { personalFree: 0.24, personalPremium: 0.24, company: 0.02, municipality: 0.02 },
      2030: { personalFree: 0.24, personalPremium: 0.24, company: 0.02, municipality: 0.02 },
      2031: { personalFree: 0.24, personalPremium: 0.24, company: 0.02, municipality: 0.02 },
      2032: { personalFree: 0.24, personalPremium: 0.24, company: 0.02, municipality: 0.02 }
    },
    // 後方互換性のため残す（非推奨）
    churnRate: 0.24,
    companyChurnRate: 0.02,
    // 解約数の上限（年ごと、カテゴリーごと）
    maxChurnedCounts: {
      2026: { personalFree: null, personalPremium: null, company: 20, municipality: null },
      2027: { personalFree: null, personalPremium: null, company: 20, municipality: null },
      2028: { personalFree: null, personalPremium: null, company: 20, municipality: null },
      2029: { personalFree: null, personalPremium: null, company: 20, municipality: null },
      2030: { personalFree: null, personalPremium: null, company: 20, municipality: null }
    },
    // 後方互換性のため残す（非推奨）
    maxChurnedCompanyCountPerYear: 20,
    // 新規導入数の上限（年ごと、カテゴリーごと）
    maxNewCounts: {
      2026: { personalFree: null, personalPremium: null, company: 20, municipality: null },
      2027: { personalFree: null, personalPremium: null, company: 100, municipality: null },
      2028: { personalFree: null, personalPremium: null, company: 500, municipality: null },
      2029: { personalFree: null, personalPremium: null, company: null, municipality: null },
      2030: { personalFree: null, personalPremium: null, company: 1500, municipality: null }
    },
    // 後方互換性のため残す（非推奨）
    newCompanyCounts: {
      2026: 20,
      2027: 100,
      2028: 500,
      2030: 1500
    },
    // 従業員数の設定（年ごと、カテゴリーごと）
    employeeSettings: {
      2026: { regularEmployees: 1, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 },
      2027: { regularEmployees: 2, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 },
      2028: { regularEmployees: null, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 },
      2029: { regularEmployees: null, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 },
      2030: { regularEmployees: null, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 }
    },
    // 後方互換性のため残す（非推奨）
    regularEmployeeCounts: {
      2026: 1,
      2027: 2
    },
    maxEmployees: 12,
    maxRegularEmployees: 4,
    // 価格設定
    prices: {
      personalPremiumMonthly: 980, // 個人プレミアム月額（円）
      companyBaseAnnual: 50000, // 企業向けベース年間料金（円）
      companyMonthlyPerActiveUser: 500, // 企業向け月額/アクティブユーザー（円）
      // 後方互換性のため残す（非推奨）
      companyMonthlyPerEmployee: 500, // 企業向け月額/人（円）
      municipalityBaseAnnual: 100000, // 自治体向けベース年間料金（円）
      municipalityMonthlyPerActiveUser: 300, // 自治体向け月額/アクティブユーザー（円）
      // 後方互換性のため残す（非推奨）
      municipalityMonthlyPerUser: 300, // 自治体向け月額/人（円）
      advertisingMonthly: 100000, // 広告収入月額（円/広告主）
      applicationAgencyPerCase: 3000, // 申請代行サービス1件あたり（円）
      referralFeeLessons: 5000, // 習い事紹介手数料1件あたり（円）
      referralFeeChildModel: 1000, // 幼児モデル紹介手数料1件あたり（円）
      referralFeeHousekeeperMatching: 1000, // 家政婦マッチング紹介手数料1件あたり（円）
      referralFeeTeacherMatching: 1000, // 専門教師マッチング紹介手数料1件あたり（円）
      ecReferralBasePerUser: 30 // EC/リファラル関連収入基本単価（円/人/月）
    },
    // 紹介手数料の成約件数（年ごと、カテゴリーごと）
    maxReferralConversionCounts: {
      2026: { lessons: 0, childModel: 0, housekeeperMatching: 0, teacherMatching: 0 },
      2027: { lessons: 1000, childModel: 100, housekeeperMatching: 500, teacherMatching: 100 },
      2028: { lessons: 1000, childModel: 100, housekeeperMatching: 500, teacherMatching: 100 },
      2029: { lessons: 1000, childModel: 100, housekeeperMatching: 500, teacherMatching: 100 },
      2030: { lessons: 1000, childModel: 100, housekeeperMatching: 500, teacherMatching: 100 }
    },
    // ECリファラルの成約率（パーセンテージ）と単価（年ごと、カテゴリーごと）
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
    // 販管費の設定（年ごと）
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
    // システム利用料の設定（年ごと）
    systemUsageSettings: {
      2026: {
        baseMonthly: 50000,
        perUserMonthly: 5
      },
      2027: {
        baseMonthly: 50000,
        perUserMonthly: 5
      },
      2028: {
        baseMonthly: 50000,
        perUserMonthly: 5
      },
      2029: {
        baseMonthly: 50000,
        perUserMonthly: 5
      },
      2030: {
        baseMonthly: 50000,
        perUserMonthly: 5
      }
    },
    // 従業員年収の設定（年ごと）
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
  };

  const [simulationParams, setSimulationParams] = useState(getInitialSimulationParams);
  const [simulationKey, setSimulationKey] = useState(() => {
    const saved = localStorage.getItem('businessPlanSimulationKey');
    return saved ? parseInt(saved) : 0;
  }); // 再計算用のキー
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [showSnapshotSaveModal, setShowSnapshotSaveModal] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const snapshotButtonRef = useRef(null);
  const snapshotSaveButtonRef = useRef(null);
  const [snapshotModalPosition, setSnapshotModalPosition] = useState({ top: 0, left: 0 });
  const [snapshotSaveModalPosition, setSnapshotSaveModalPosition] = useState({ top: 0, left: 0 });

  // localStorageの変更を監視して再計算をトリガー
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('businessPlanSimulationKey');
      if (saved) {
        setSimulationKey(parseInt(saved));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // 同じウィンドウ内での変更も監視
    const interval = setInterval(() => {
      const saved = localStorage.getItem('businessPlanSimulationKey');
      if (saved && parseInt(saved) !== simulationKey) {
        setSimulationKey(parseInt(saved));
      }
    }, 100);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [simulationKey]);

  // サンプルデータ（アグレッシブな成長シミュレーション）
  const generateSampleData = (params = simulationParams) => {
    const data = [];
    
    // 年度末の目標アクティブユーザー数
    const yearlyTargets = params.yearlyTargets;
    
    // ユーザー構成比（年ごと）
    const userRatios = params.userRatios;
    
    let cumulativePersonalFreeUsers = 0;
    let cumulativePersonalPremiumUsers = 0;
    let cumulativeCompanyCount = 0;
    let cumulativeCompanyEmployees = 0;
    let cumulativeMunicipalityCount = 0;
    let cumulativeMunicipalityUsers = 0;
    let previousRegularEmployeeCount = 0; // 前年の正社員数を追跡
    let previousChurnedCompanyCount = 0; // 前年の企業解約数を追跡
    
    // 年単位でループ
    for (let year = 2026; year <= 2032; year++) {
      // 年度末の目標人数を取得
      const currentYearTarget = yearlyTargets[year] || yearlyTargets[2032];
      const prevYearTarget = yearlyTargets[year - 1] || 0;
      
      // 前年のアクティブユーザー数
      const prevActiveUsers = year === 2026 ? 0 : 
        (cumulativePersonalFreeUsers + cumulativePersonalPremiumUsers + 
         cumulativeCompanyEmployees + cumulativeMunicipalityUsers);
      
      // 年度末の目標人数
      const targetActiveUsers = currentYearTarget;
      
      // 目標との差分を計算
      const targetGrowth = Math.max(0, targetActiveUsers - prevActiveUsers);
      
      // その年のユーザー構成比を取得（デフォルト値を使用）
      const yearRatios = userRatios[year] || {
        personalFree: 0.50,
        personalPremium: 0.05,
        municipality: 0.30,
        company: 0.15
      };
      
      // 各カテゴリの目標人数を計算
      const targetPersonalFree = Math.floor(targetActiveUsers * yearRatios.personalFree);
      const targetPersonalPremium = Math.floor(targetActiveUsers * yearRatios.personalPremium);
      const targetMunicipality = Math.floor(targetActiveUsers * yearRatios.municipality);
      const targetCompany = Math.floor(targetActiveUsers * yearRatios.company);
      
      // 各カテゴリの現在の累計人数
      const currentPersonalFree = cumulativePersonalFreeUsers;
      const currentPersonalPremium = cumulativePersonalPremiumUsers;
      const currentMunicipality = cumulativeMunicipalityUsers;
      const currentCompany = cumulativeCompanyEmployees;
      
      // 各カテゴリの目標成長数
      const growthPersonalFree = Math.max(0, targetPersonalFree - currentPersonalFree);
      const growthPersonalPremium = Math.max(0, targetPersonalPremium - currentPersonalPremium);
      const growthMunicipality = Math.max(0, targetMunicipality - currentMunicipality);
      const growthCompany = Math.max(0, targetCompany - currentCompany);
      
      // 解約率を考慮（年間）- 年ごと、カテゴリーごと
      const yearChurnRates = params.churnRates?.[year] || {
        personalFree: params.churnRate || 0.24,
        personalPremium: params.churnRate || 0.24,
        company: params.companyChurnRate || 0.02,
        municipality: 0.02
      };
      
      // 解約上限を取得
      const yearMaxChurned = params.maxChurnedCounts?.[year] || {
        personalFree: null,
        personalPremium: null,
        company: params.maxChurnedCompanyCountPerYear || 20,
        municipality: null
      };
      
      // 新規導入上限を取得
      const yearMaxNew = params.maxNewCounts?.[year] || {
        personalFree: null,
        personalPremium: null,
        company: params.newCompanyCounts?.[year] || null,
        municipality: null
      };
      
      // 個人ユーザー（無料）
      let churnedPersonalFreeUsersRaw = Math.floor(cumulativePersonalFreeUsers * yearChurnRates.personalFree);
      const churnedPersonalFreeUsers = yearMaxChurned.personalFree !== null 
        ? Math.min(churnedPersonalFreeUsersRaw, yearMaxChurned.personalFree)
        : churnedPersonalFreeUsersRaw;
      let calculatedNewPersonalFreeUsers = Math.floor(growthPersonalFree + churnedPersonalFreeUsers);
      const maxNewPersonalFreeUsers = yearMaxNew.personalFree;
      const newPersonalFreeUsers = maxNewPersonalFreeUsers !== null 
        ? Math.min(calculatedNewPersonalFreeUsers, maxNewPersonalFreeUsers)
        : calculatedNewPersonalFreeUsers;
      cumulativePersonalFreeUsers = Math.max(0, cumulativePersonalFreeUsers + newPersonalFreeUsers - churnedPersonalFreeUsers);
      const personalFreeUsers = cumulativePersonalFreeUsers;
      
      // 個人ユーザー（プレミアム）
      let churnedPersonalPremiumUsersRaw = Math.floor(cumulativePersonalPremiumUsers * yearChurnRates.personalPremium);
      const churnedPersonalPremiumUsers = yearMaxChurned.personalPremium !== null 
        ? Math.min(churnedPersonalPremiumUsersRaw, yearMaxChurned.personalPremium)
        : churnedPersonalPremiumUsersRaw;
      let calculatedNewPersonalPremiumUsers = Math.floor(growthPersonalPremium + churnedPersonalPremiumUsers);
      const maxNewPersonalPremiumUsers = yearMaxNew.personalPremium;
      const newPersonalPremiumUsers = maxNewPersonalPremiumUsers !== null 
        ? Math.min(calculatedNewPersonalPremiumUsers, maxNewPersonalPremiumUsers)
        : calculatedNewPersonalPremiumUsers;
      cumulativePersonalPremiumUsers = Math.max(0, cumulativePersonalPremiumUsers + newPersonalPremiumUsers - churnedPersonalPremiumUsers);
      const personalPremiumUsers = cumulativePersonalPremiumUsers;
      
      // 個人ユーザー合計
      const personalUsers = personalFreeUsers + personalPremiumUsers;
      const personalRevenue = personalPremiumUsers * params.prices.personalPremiumMonthly * 12; // 月額 × 12ヶ月（プレミアムのみ）
      
      // 企業向け（ユーザー構成比から直接計算、1社あたり20人想定）
      // 目標企業従業員数をユーザー構成比から計算
      const targetCompanyEmployees = Math.floor(targetActiveUsers * yearRatios.company);
      // 目標企業数を計算（1社あたり20人）
      const targetCompanyCount = Math.ceil(targetCompanyEmployees / 20);
      
      // 企業解約率で計算、上限設定（年間）
      const maxChurnedCompanyCountPerYear = yearMaxChurned.company;
      let churnedCompanyCountRaw = Math.floor(cumulativeCompanyCount * yearChurnRates.company);
      let churnedCompanyCount; // 企業解約数
      // 前年の解約数が上限に達していたら横ばい
      if (maxChurnedCompanyCountPerYear !== null && previousChurnedCompanyCount >= maxChurnedCompanyCountPerYear) {
        churnedCompanyCount = maxChurnedCompanyCountPerYear; // 上限で横ばい
      } else {
        churnedCompanyCount = maxChurnedCompanyCountPerYear !== null ? Math.min(churnedCompanyCountRaw, maxChurnedCompanyCountPerYear) : churnedCompanyCountRaw;
      }
      // 次の年のために現在の値を保存
      previousChurnedCompanyCount = churnedCompanyCount;
      // 成長に必要な企業数（目標企業数 - 現在の累計社数）
      const growthCompanyCount = Math.max(0, targetCompanyCount - cumulativeCompanyCount);
      // 新規導入数 = 成長に必要な数 + 解約を補填する数
      // 上限が設定されている場合は上限を適用
      let calculatedNewCompanyCount = growthCompanyCount + churnedCompanyCount;
      const maxNewCompanyCount = yearMaxNew?.company;
      const newCompanyCount = maxNewCompanyCount !== null 
        ? Math.min(calculatedNewCompanyCount, maxNewCompanyCount)
        : calculatedNewCompanyCount;
      // 累計社数の更新：前の累計 + 新規導入 - 解約
      cumulativeCompanyCount = Math.max(0, cumulativeCompanyCount + newCompanyCount - churnedCompanyCount);
      const companyCount = cumulativeCompanyCount;
      
      // 企業向け従業員数（目標企業従業員数に基づいて計算、1社あたり20人）
      // ただし、実際の企業数に基づいて再計算（上限や解約率の影響を反映）
      const companyEmployees = companyCount * 20;
      const newCompanyEmployees = newCompanyCount * 20; // 新規導入企業数 × 20人
      const churnedCompanyEmployees = churnedCompanyCount * 20; // 解約企業数 × 20人
      cumulativeCompanyEmployees = companyEmployees;
      // 企業向け売上：ベース年間5万円×企業数 + アクティブユーザー数×月額500円×12ヶ月
      const companyRevenue = (companyCount * params.prices.companyBaseAnnual) + (companyEmployees * params.prices.companyMonthlyPerActiveUser * 12);
      
      // 自治体向け（ユーザー構成比から直接計算、1自治体あたり100名想定）
      // 目標自治体利用者数をユーザー構成比から計算
      const targetMunicipalityUsers = Math.floor(targetActiveUsers * yearRatios.municipality);
      // 目標自治体数を計算（1自治体あたり100名）
      const targetMunicipalityCount = Math.ceil(targetMunicipalityUsers / 100);
      const growthMunicipalityCount = Math.max(0, targetMunicipalityCount - cumulativeMunicipalityCount);
      let churnedMunicipalityCountRaw = Math.floor(cumulativeMunicipalityCount * yearChurnRates.municipality);
      const churnedMunicipalityCount = yearMaxChurned.municipality !== null 
        ? Math.min(churnedMunicipalityCountRaw, yearMaxChurned.municipality)
        : churnedMunicipalityCountRaw;
      let calculatedNewMunicipalityCount = Math.floor(growthMunicipalityCount + churnedMunicipalityCount);
      const maxNewMunicipalityCount = yearMaxNew.municipality;
      const newMunicipalityCount = maxNewMunicipalityCount !== null 
        ? Math.min(calculatedNewMunicipalityCount, maxNewMunicipalityCount)
        : calculatedNewMunicipalityCount;
      cumulativeMunicipalityCount = Math.max(0, cumulativeMunicipalityCount + newMunicipalityCount - churnedMunicipalityCount);
      const municipalityCount = cumulativeMunicipalityCount;
      
      // 自治体利用者の解約上限は自治体数ベースで計算（1自治体あたり100名と仮定）
      // 自治体数の上限から利用者数の上限を計算
      const maxChurnedMunicipalityUsers = yearMaxChurned.municipality !== null 
        ? yearMaxChurned.municipality * 100 
        : null;
      let churnedMunicipalityUsersRaw = Math.floor(cumulativeMunicipalityUsers * yearChurnRates.municipality);
      const churnedMunicipalityUsers = maxChurnedMunicipalityUsers !== null 
        ? Math.min(churnedMunicipalityUsersRaw, maxChurnedMunicipalityUsers)
        : churnedMunicipalityUsersRaw;
      // 自治体利用者の新規導入上限（1自治体あたり100名と仮定）
      const maxNewMunicipalityUsers = yearMaxNew.municipality !== null 
        ? yearMaxNew.municipality * 100 
        : null;
      let calculatedNewMunicipalityUsers = Math.floor(targetMunicipalityUsers - cumulativeMunicipalityUsers + churnedMunicipalityUsers);
      const newMunicipalityUsers = maxNewMunicipalityUsers !== null 
        ? Math.min(calculatedNewMunicipalityUsers, maxNewMunicipalityUsers)
        : calculatedNewMunicipalityUsers;
      cumulativeMunicipalityUsers = Math.max(0, cumulativeMunicipalityUsers + newMunicipalityUsers - churnedMunicipalityUsers);
      const municipalityUsers = cumulativeMunicipalityUsers;
      // 自治体向け売上：ベース年間料金×自治体数 + アクティブユーザー数×月額×12ヶ月
      const municipalityRevenue = (municipalityCount * params.prices.municipalityBaseAnnual) + (municipalityUsers * params.prices.municipalityMonthlyPerActiveUser * 12);
      
      // アクティブユーザー数
      const activeUsers = personalUsers + companyEmployees + municipalityUsers;
      
      // EC/リファラル関連収入（成約率パーセンテージと単価ベース）
      // ECサイトへのリンクからのアフィリエイト手数料など
      const yearEcReferralSettings = params.ecReferralSettings?.[year] || {
        conversionRates: {
          essentials: null,
          educationalGoods: null,
          healthFood: null,
          healthGoods: null,
          maternityGoods: null,
          medicine: null,
          vaccination: null,
          allergyTest: null,
          geneticTest: null,
          infantChildInsurance: null,
          studentInsurance: null,
          educationExpenseInsurance: null
        },
        prices: {
          essentials: 1000,
          educationalGoods: 2000,
          healthFood: 3000,
          healthGoods: 1500,
          maternityGoods: 2500,
          medicine: 1000,
          vaccination: 1000,
          allergyTest: 1000,
          geneticTest: 1000,
          infantChildInsurance: 1000,
          studentInsurance: 1000,
          educationExpenseInsurance: 1000
        }
      };
      
      // 成約件数の計算（パーセンテージから算出）
      // 各カテゴリーごとに個別にチェック
      let ecConversionEssentials, ecConversionEducationalGoods, ecConversionHealthFood, ecConversionHealthGoods, ecConversionMaternityGoods;
      let ecConversionMedicine, ecConversionVaccination, ecConversionAllergyTest, ecConversionGeneticTest;
      let ecConversionInfantChildInsurance, ecConversionStudentInsurance, ecConversionEducationExpenseInsurance;
      
      // 自動計算用のロジック（パーセンテージが設定されていないカテゴリー用）
      // 成約率（アクティブユーザーのうち、年間に1回以上成約する割合）
      // ユーザー数が増えると成約率も上がる（スケールメリット）
      let defaultEcConversionRate = 0.20; // 基本成約率：20%（年間）
      if (activeUsers > 200000) {
        defaultEcConversionRate = 0.30; // 20万人超：30%（年間）
      } else if (activeUsers > 100000) {
        defaultEcConversionRate = 0.28; // 10-20万人：28%（年間）
      } else if (activeUsers > 50000) {
        defaultEcConversionRate = 0.25; // 5-10万人：25%（年間）
      } else if (activeUsers > 10000) {
        defaultEcConversionRate = 0.22; // 1-5万人：22%（年間）
      }
      
      // 各カテゴリーの成約件数の比率
      const essentialsRatio = 0.20; // おむつなどの必需品：20%
      const educationalGoodsRatio = 0.15; // 知育グッズ：15%
      const healthFoodRatio = 0.15; // 健康食品・サプリ：15%
      const healthGoodsRatio = 0.10; // 健康グッズ：10%
      const maternityGoodsRatio = 0.10; // マタニティグッズ：10%
      // 医療関連の比率
      const medicineRatio = 0.05; // 薬：5%
      const vaccinationRatio = 0.05; // 予防接種：5%
      const allergyTestRatio = 0.03; // アレルギー検査：3%
      const geneticTestRatio = 0.02; // 遺伝子DNA検査：2%
      // 保険関連の比率
      const infantChildInsuranceRatio = 0.08; // 乳児・児童保険：8%
      const studentInsuranceRatio = 0.05; // 学生保険：5%
      const educationExpenseInsuranceRatio = 0.02; // 学業費用保険：2%
      
      // 各カテゴリーの成約件数（パーセンテージがあればそれを使用、なければ自動計算）
      // パーセンテージは0-100の値として入力される
      if (yearEcReferralSettings.conversionRates.essentials !== null && yearEcReferralSettings.conversionRates.essentials !== undefined) {
        // パーセンテージから成約件数を計算（アクティブユーザー数 × パーセンテージ / 100）
        ecConversionEssentials = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.essentials / 100);
      } else {
        // 自動計算（従来のロジック）
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionEssentials = Math.floor(totalEcConversionCountBase * essentialsRatio);
        if (year === 2026) ecConversionEssentials = 0;
      }
      
      if (yearEcReferralSettings.conversionRates.educationalGoods !== null && yearEcReferralSettings.conversionRates.educationalGoods !== undefined) {
        ecConversionEducationalGoods = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.educationalGoods / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionEducationalGoods = Math.floor(totalEcConversionCountBase * educationalGoodsRatio);
        if (year === 2026) ecConversionEducationalGoods = 0;
      }
      
      if (yearEcReferralSettings.conversionRates.healthFood !== null && yearEcReferralSettings.conversionRates.healthFood !== undefined) {
        ecConversionHealthFood = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.healthFood / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionHealthFood = Math.floor(totalEcConversionCountBase * healthFoodRatio);
        if (year === 2026) ecConversionHealthFood = 0;
      }
      
      if (yearEcReferralSettings.conversionRates.healthGoods !== null && yearEcReferralSettings.conversionRates.healthGoods !== undefined) {
        ecConversionHealthGoods = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.healthGoods / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionHealthGoods = Math.floor(totalEcConversionCountBase * healthGoodsRatio);
        if (year === 2026) ecConversionHealthGoods = 0;
      }
      
      if (yearEcReferralSettings.conversionRates.maternityGoods !== null && yearEcReferralSettings.conversionRates.maternityGoods !== undefined) {
        ecConversionMaternityGoods = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.maternityGoods / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionMaternityGoods = Math.floor(totalEcConversionCountBase * maternityGoodsRatio);
        if (year === 2026) ecConversionMaternityGoods = 0;
      }
      
      // 医療関連の計算
      if (yearEcReferralSettings.conversionRates.medicine !== null && yearEcReferralSettings.conversionRates.medicine !== undefined) {
        ecConversionMedicine = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.medicine / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionMedicine = Math.floor(totalEcConversionCountBase * medicineRatio);
        if (year === 2026) ecConversionMedicine = 0;
      }
      
      if (yearEcReferralSettings.conversionRates.vaccination !== null && yearEcReferralSettings.conversionRates.vaccination !== undefined) {
        ecConversionVaccination = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.vaccination / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionVaccination = Math.floor(totalEcConversionCountBase * vaccinationRatio);
        if (year === 2026) ecConversionVaccination = 0;
      }
      
      if (yearEcReferralSettings.conversionRates.allergyTest !== null && yearEcReferralSettings.conversionRates.allergyTest !== undefined) {
        ecConversionAllergyTest = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.allergyTest / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionAllergyTest = Math.floor(totalEcConversionCountBase * allergyTestRatio);
        if (year === 2026) ecConversionAllergyTest = 0;
      }
      
      if (yearEcReferralSettings.conversionRates.geneticTest !== null && yearEcReferralSettings.conversionRates.geneticTest !== undefined) {
        ecConversionGeneticTest = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.geneticTest / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionGeneticTest = Math.floor(totalEcConversionCountBase * geneticTestRatio);
        if (year === 2026) ecConversionGeneticTest = 0;
      }
      
      // 保険関連の計算
      if (yearEcReferralSettings.conversionRates.infantChildInsurance !== null && yearEcReferralSettings.conversionRates.infantChildInsurance !== undefined) {
        ecConversionInfantChildInsurance = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.infantChildInsurance / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionInfantChildInsurance = Math.floor(totalEcConversionCountBase * infantChildInsuranceRatio);
        if (year === 2026) ecConversionInfantChildInsurance = 0;
      }
      
      if (yearEcReferralSettings.conversionRates.studentInsurance !== null && yearEcReferralSettings.conversionRates.studentInsurance !== undefined) {
        ecConversionStudentInsurance = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.studentInsurance / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionStudentInsurance = Math.floor(totalEcConversionCountBase * studentInsuranceRatio);
        if (year === 2026) ecConversionStudentInsurance = 0;
      }
      
      if (yearEcReferralSettings.conversionRates.educationExpenseInsurance !== null && yearEcReferralSettings.conversionRates.educationExpenseInsurance !== undefined) {
        ecConversionEducationExpenseInsurance = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.educationExpenseInsurance / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionEducationExpenseInsurance = Math.floor(totalEcConversionCountBase * educationExpenseInsuranceRatio);
        if (year === 2026) ecConversionEducationExpenseInsurance = 0;
      }
      
      // リフォーム関連の計算
      let ecConversionRenovation = 0;
      const renovationRatio = 0.03;
      if (yearEcReferralSettings.conversionRates.renovation !== null && yearEcReferralSettings.conversionRates.renovation !== undefined) {
        ecConversionRenovation = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.renovation / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionRenovation = Math.floor(totalEcConversionCountBase * renovationRatio);
        if (year === 2026) ecConversionRenovation = 0;
      }
      
      // アルバム関連の計算
      let ecConversionAlbum = 0;
      const albumRatio = 0.03;
      if (yearEcReferralSettings.conversionRates.album !== null && yearEcReferralSettings.conversionRates.album !== undefined) {
        ecConversionAlbum = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.album / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionAlbum = Math.floor(totalEcConversionCountBase * albumRatio);
        if (year === 2026) ecConversionAlbum = 0;
      }
      
      let ecConversionMaternityPhoto = 0;
      const maternityPhotoRatio = 0.015;
      if (yearEcReferralSettings.conversionRates.maternityPhoto !== null && yearEcReferralSettings.conversionRates.maternityPhoto !== undefined) {
        ecConversionMaternityPhoto = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.maternityPhoto / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionMaternityPhoto = Math.floor(totalEcConversionCountBase * maternityPhotoRatio);
        if (year === 2026) ecConversionMaternityPhoto = 0;
      }
      
      let ecConversionPrint = 0;
      const printRatio = 0.005;
      if (yearEcReferralSettings.conversionRates.print !== null && yearEcReferralSettings.conversionRates.print !== undefined) {
        ecConversionPrint = Math.floor(activeUsers * yearEcReferralSettings.conversionRates.print / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionPrint = Math.floor(totalEcConversionCountBase * printRatio);
        if (year === 2026) ecConversionPrint = 0;
      }
      
      // EC/リファラル関連収入の計算（成約件数 × 単価）
      const ecReferralEssentials = ecConversionEssentials * yearEcReferralSettings.prices.essentials;
      const ecReferralEducationalGoods = ecConversionEducationalGoods * yearEcReferralSettings.prices.educationalGoods;
      const ecReferralHealthFood = ecConversionHealthFood * yearEcReferralSettings.prices.healthFood;
      const ecReferralHealthGoods = ecConversionHealthGoods * yearEcReferralSettings.prices.healthGoods;
      const ecReferralMaternityGoods = ecConversionMaternityGoods * yearEcReferralSettings.prices.maternityGoods;
      const ecReferralMedicine = ecConversionMedicine * yearEcReferralSettings.prices.medicine;
      const ecReferralVaccination = ecConversionVaccination * yearEcReferralSettings.prices.vaccination;
      const ecReferralAllergyTest = ecConversionAllergyTest * yearEcReferralSettings.prices.allergyTest;
      const ecReferralGeneticTest = ecConversionGeneticTest * yearEcReferralSettings.prices.geneticTest;
      const ecReferralInfantChildInsurance = ecConversionInfantChildInsurance * yearEcReferralSettings.prices.infantChildInsurance;
      const ecReferralStudentInsurance = ecConversionStudentInsurance * yearEcReferralSettings.prices.studentInsurance;
      const ecReferralEducationExpenseInsurance = ecConversionEducationExpenseInsurance * yearEcReferralSettings.prices.educationExpenseInsurance;
      const ecReferralRenovation = ecConversionRenovation * (yearEcReferralSettings.prices.renovation || 50000);
      const ecReferralAlbum = ecConversionAlbum * (yearEcReferralSettings.prices.album || 3000);
      const ecReferralMaternityPhoto = ecConversionMaternityPhoto * (yearEcReferralSettings.prices.maternityPhoto || 1000);
      const ecReferralPrint = ecConversionPrint * (yearEcReferralSettings.prices.print || 100);
      // EC/リファラル関連収入（商品カテゴリーのみ）
      const ecReferralRevenue = ecReferralEssentials + ecReferralEducationalGoods + ecReferralHealthFood + ecReferralHealthGoods + ecReferralMaternityGoods;
      
      // 医療関連収入（独立した売上項目）
      const medicalRevenue = ecReferralMedicine + ecReferralVaccination + ecReferralAllergyTest + ecReferralGeneticTest;
      
      // 保険関連収入（独立した売上項目）
      const insuranceRevenue = ecReferralInfantChildInsurance + ecReferralStudentInsurance + ecReferralEducationExpenseInsurance;
      
      // リフォーム関連収入（独立した売上項目）
      const renovationRevenue = ecReferralRenovation;
      
      // アルバム関連収入（独立した売上項目）
      const albumRevenue = ecReferralAlbum + ecReferralMaternityPhoto + ecReferralPrint;
      
      // 紹介手数料の内訳（アクティブユーザー1人あたり月額50円と仮定、メイン収入源として拡大）
      // ユーザー数に応じて単価が上がる
      let referralRevenuePerUser = 30; // 基本単価：月額30円/人
      if (activeUsers > 200000) {
        referralRevenuePerUser = 100; // 20万人超：月額100円/人
      } else if (activeUsers > 100000) {
        referralRevenuePerUser = 80; // 10-20万人：月額80円/人
      } else if (activeUsers > 50000) {
        referralRevenuePerUser = 60; // 5-10万人：月額60円/人
      } else if (activeUsers > 10000) {
        referralRevenuePerUser = 45; // 1-5万人：月額45円/人
      }
      
      // 2年目以降（2027年以降）は紹介手数料の単価も5分の1に調整（成約件数の減少に合わせて）
      if (year >= 2027) {
        referralRevenuePerUser = referralRevenuePerUser / 5;
      }
      
      // 成約率（アクティブユーザーのうち、年間に1回以上成約する割合）
      // ユーザー数が増えると成約率も上がる（スケールメリット）
      let conversionRate = 0.08; // 基本成約率：8%（年間）
      if (activeUsers > 200000) {
        conversionRate = 0.32; // 20万人超：32%（年間）
      } else if (activeUsers > 100000) {
        conversionRate = 0.24; // 10-20万人：24%（年間）
      } else if (activeUsers > 50000) {
        conversionRate = 0.16; // 5-10万人：16%（年間）
      } else if (activeUsers > 10000) {
        conversionRate = 0.12; // 1-5万人：12%（年間）
      }
      
      // 2年目以降（2027年以降）は成約率を5分の1に調整
      if (year >= 2027) {
        conversionRate = conversionRate / 5;
      }
      
      // 成約件数の計算（アクティブユーザー数 × 成約率）
      // 注意: この値は後で上限適用後の各項目の合計で上書きされる
      const totalConversionCountBase = Math.floor(activeUsers * conversionRate);
      
      // 紹介手数料の内訳（習い事40%、幼児モデル30%、家政婦マッチング15%、専門教師マッチング15%）
      const referralLessonsRatio = 0.40; // 習い事：40%
      const referralChildModelRatio = 0.30; // 幼児モデル：30%
      const referralHousekeeperMatchingRatio = 0.15; // 家政婦マッチング：15%
      const referralTeacherMatchingRatio = 0.15; // 専門教師マッチング：15%
      
      // 成約件数の内訳（年度によって変動）
      let conversionLessonsRatio, conversionChildModelRatio, conversionHousekeeperMatchingRatio, conversionTeacherMatchingRatio;
      
      // 1-2年目の基準比率
      const baseConversionLessonsRatio = 0.40; // 習い事：40%
      const baseConversionChildModelRatio = 0.30; // 幼児モデル：30%
      const baseConversionHousekeeperMatchingRatio = 0.15; // 家政婦マッチング：15%
      const baseConversionTeacherMatchingRatio = 0.15; // 専門教師マッチング：15%
      
      if (year >= 2029) {
        // 4年目（2029年）、5年目（2030年）
        conversionLessonsRatio = baseConversionLessonsRatio / 2; // 習い事：20%（40%の2分の1）
        conversionChildModelRatio = baseConversionChildModelRatio; // 幼児モデル：30%
        conversionHousekeeperMatchingRatio = baseConversionHousekeeperMatchingRatio; // 家政婦マッチング：15%
        conversionTeacherMatchingRatio = baseConversionTeacherMatchingRatio; // 専門教師マッチング：15%
      } else if (year >= 2028) {
        // 3年目（2028年）
        conversionLessonsRatio = baseConversionLessonsRatio / 2; // 習い事：20%（40%の2分の1）
        conversionChildModelRatio = baseConversionChildModelRatio; // 幼児モデル：30%
        conversionHousekeeperMatchingRatio = baseConversionHousekeeperMatchingRatio; // 家政婦マッチング：15%
        conversionTeacherMatchingRatio = baseConversionTeacherMatchingRatio; // 専門教師マッチング：15%
      } else {
        // 1-2年目（2026-2027年）
        conversionLessonsRatio = baseConversionLessonsRatio; // 習い事：40%
        conversionChildModelRatio = baseConversionChildModelRatio; // 幼児モデル：30%
        conversionHousekeeperMatchingRatio = baseConversionHousekeeperMatchingRatio; // 家政婦マッチング：15%
        conversionTeacherMatchingRatio = baseConversionTeacherMatchingRatio; // 専門教師マッチング：15%
      }
      
      // 残りを調整（合計を100%にする）
      const totalRatio = conversionLessonsRatio + conversionChildModelRatio + conversionHousekeeperMatchingRatio + conversionTeacherMatchingRatio;
      const conversionLessonsRatioAdjusted = totalRatio > 0 ? conversionLessonsRatio / totalRatio : 0;
      const conversionChildModelRatioAdjusted = totalRatio > 0 ? conversionChildModelRatio / totalRatio : 0;
      const conversionHousekeeperMatchingRatioAdjusted = totalRatio > 0 ? conversionHousekeeperMatchingRatio / totalRatio : 0;
      const conversionTeacherMatchingRatioAdjusted = totalRatio > 0 ? conversionTeacherMatchingRatio / totalRatio : 0;
      
      let conversionLessonsRaw = Math.floor(totalConversionCountBase * conversionLessonsRatioAdjusted); // 習い事成約件数（計算値）
      let conversionChildModelRaw = Math.floor(totalConversionCountBase * conversionChildModelRatioAdjusted); // 幼児モデル成約件数（計算値）
      let conversionHousekeeperMatchingRaw = Math.floor(totalConversionCountBase * conversionHousekeeperMatchingRatioAdjusted); // 家政婦マッチング成約件数（計算値）
      let conversionTeacherMatchingRaw = Math.floor(totalConversionCountBase * conversionTeacherMatchingRatioAdjusted); // 専門教師マッチング成約件数（計算値）
      
      // 初年度（2026年）はすべての紹介項目を0件に固定
      if (year === 2026) {
        conversionLessonsRaw = 0;
        conversionChildModelRaw = 0;
        conversionHousekeeperMatchingRaw = 0;
        conversionTeacherMatchingRaw = 0;
      }
      
      // 成約件数の上限設定（年間の上限）- 年ごと、カテゴリーごと
      const yearMaxReferralConversions = params.maxReferralConversionCounts?.[year] || {
        lessons: 1000,
        childModel: 100,
        housekeeperMatching: 500,
        teacherMatching: 100
      };
      const conversionLessons = Math.min(conversionLessonsRaw, yearMaxReferralConversions.lessons);
      const conversionChildModel = Math.min(conversionChildModelRaw, yearMaxReferralConversions.childModel);
      const conversionHousekeeperMatching = Math.min(conversionHousekeeperMatchingRaw, yearMaxReferralConversions.housekeeperMatching);
      const conversionTeacherMatching = Math.min(conversionTeacherMatchingRaw, yearMaxReferralConversions.teacherMatching);
      
      // 合計成約件数は上限適用後の各項目の合計
      const totalConversionCount = conversionLessons + conversionChildModel + conversionHousekeeperMatching + conversionTeacherMatching;
      
      // 1件あたりの手数料（固定単価）
      const referralFeePerConversionLessons = params.prices.referralFeeLessons; // 習い事
      const referralFeePerConversionChildModel = params.prices.referralFeeChildModel; // 幼児モデル
      const referralFeePerConversionHousekeeperMatching = params.prices.referralFeeHousekeeperMatching; // 家政婦マッチング
      const referralFeePerConversionTeacherMatching = params.prices.referralFeeTeacherMatching; // 専門教師マッチング
      
      // 紹介手数料の計算（成約件数 × 1件あたりの手数料）
      const referralLessons = conversionLessons * referralFeePerConversionLessons; // 習い事紹介手数料
      const referralChildModel = conversionChildModel * referralFeePerConversionChildModel; // 幼児モデル紹介手数料
      const referralHousekeeperMatching = conversionHousekeeperMatching * referralFeePerConversionHousekeeperMatching; // 家政婦マッチング紹介手数料
      const referralTeacherMatching = conversionTeacherMatching * referralFeePerConversionTeacherMatching; // 専門教師マッチング紹介手数料
      const referralRevenue = referralLessons + referralChildModel + referralHousekeeperMatching + referralTeacherMatching; // 合計
      
      // 広告収入（広告主からの月額、企業数やユーザー数に応じて増加）
      // 初年度（2026年）は0
      let advertisingRevenue = 0;
      if (year > 2026 && activeUsers > 0) {
        // 基本広告主数：企業数の10%（広告を出す企業の割合）
        const advertiserCount = Math.max(1, Math.floor(companyCount * 0.1));
        // 基本広告収入：広告主数 × 月額 × 3ヶ月
        advertisingRevenue = advertiserCount * params.prices.advertisingMonthly * 3;
        // ユーザー数に応じて追加広告収入（1万人あたり月額5万円）
        const additionalAdvertisingRevenue = Math.floor(activeUsers / 10000) * 50000 * 3;
        advertisingRevenue += additionalAdvertisingRevenue;
        // 10分の1に調整
        advertisingRevenue = Math.floor(advertisingRevenue / 10);
      }
      
      // 申請代行サービス収入（自治体・企業向け）
      // 初年度（2026年）は0
      let applicationAgencyCases = 0;
      let applicationAgencyRevenue = 0;
      if (year > 2026) {
        // 申請件数は企業数と自治体数に基づいて計算
        applicationAgencyCases = Math.floor((companyCount * 2) + (municipalityCount * 5)); // 企業1社あたり2件、自治体1件あたり5件
        applicationAgencyRevenue = applicationAgencyCases * params.prices.applicationAgencyPerCase; // 1件あたり
      }
      
      // 認定取得支援収入
      const yearCertificationCounts = params.certificationSupportCounts?.[year] || { kurumin: 0, healthManagement: 0 };
      const certificationSupportKuruminCases = yearCertificationCounts.kurumin || 0;
      const certificationSupportHealthManagementCases = yearCertificationCounts.healthManagement || 0;
      const certificationSupportRevenue = 
        (certificationSupportKuruminCases * params.prices.certificationSupportKurumin) +
        (certificationSupportHealthManagementCases * params.prices.certificationSupportHealthManagement);
      
      // 売上合計
      const totalRevenue = (personalRevenue || 0) + (companyRevenue || 0) + (municipalityRevenue || 0) + (ecReferralRevenue || 0) + (medicalRevenue || 0) + (insuranceRevenue || 0) + (renovationRevenue || 0) + (albumRevenue || 0) + (referralRevenue || 0) + (advertisingRevenue || 0) + (applicationAgencyRevenue || 0) + (certificationSupportRevenue || 0);
      
      // 売上原価（ユーザー数に応じてスケール）
      // 従業員数の計算（ユーザー数に応じて段階的に増加、最大12人）
      // 1万人以下: 4人、1-5万人: 6人、5-10万人: 8人、10-20万人: 10人、20万人以上: 12人
      let calculatedEmployeeCount = 4; // 基本4人
      if (activeUsers > 200000) {
        calculatedEmployeeCount = 12; // 20万人以上: 12人
      } else if (activeUsers > 100000) {
        calculatedEmployeeCount = 10; // 10-20万人: 10人
      } else if (activeUsers > 50000) {
        calculatedEmployeeCount = 8; // 5-10万人: 8人
      } else if (activeUsers > 10000) {
        calculatedEmployeeCount = 6; // 1-5万人: 6人
      }
      
      // 従業員数の設定を取得
      const yearEmployeeSettings = params.employeeSettings?.[year] || {};
      
      // 上限を撤廃：calculatedEmployeeCountをそのまま使用
      const employeeCount = calculatedEmployeeCount;
      
      // 従業員数の内訳（正社員、契約社員、派遣、業務委託）
      // 手入力値が設定されている場合はそれを使用、そうでなければ自動計算
      let regularEmployeeCount;
      if (yearEmployeeSettings.regularEmployees !== null && yearEmployeeSettings.regularEmployees !== undefined) {
        regularEmployeeCount = yearEmployeeSettings.regularEmployees;
      } else {
        // 前年の正社員数を参照して、増加させる
        regularEmployeeCount = Math.max(previousRegularEmployeeCount, Math.floor(employeeCount * 0.60));
      }
      // 次の四半期のために現在の値を保存
      previousRegularEmployeeCount = regularEmployeeCount;
      
      // 契約社員、派遣、業務委託の計算
      let contractEmployeeCount, dispatchedEmployeeCount, outsourcedEmployeeCount;
      const remainingEmployees = employeeCount - regularEmployeeCount; // 正社員以外の従業員数
      
      // すべて手入力されている場合
      if (yearEmployeeSettings.contractEmployees !== null && yearEmployeeSettings.dispatchedEmployees !== null && yearEmployeeSettings.outsourcedEmployees !== null) {
        // すべて手入力されている場合はそのまま使用
        contractEmployeeCount = yearEmployeeSettings.contractEmployees;
        dispatchedEmployeeCount = yearEmployeeSettings.dispatchedEmployees;
        outsourcedEmployeeCount = yearEmployeeSettings.outsourcedEmployees;
      } else {
        // 一部または全部が未設定の場合は自動計算
        if (yearEmployeeSettings.contractEmployees !== null) {
          contractEmployeeCount = yearEmployeeSettings.contractEmployees;
          const remainingAfterContract = remainingEmployees - contractEmployeeCount;
          if (yearEmployeeSettings.dispatchedEmployees !== null) {
            dispatchedEmployeeCount = yearEmployeeSettings.dispatchedEmployees;
            outsourcedEmployeeCount = remainingAfterContract - dispatchedEmployeeCount;
          } else if (yearEmployeeSettings.outsourcedEmployees !== null) {
            outsourcedEmployeeCount = yearEmployeeSettings.outsourcedEmployees;
            dispatchedEmployeeCount = remainingAfterContract - outsourcedEmployeeCount;
          } else {
            dispatchedEmployeeCount = Math.floor(remainingAfterContract * 0.25);
            outsourcedEmployeeCount = remainingAfterContract - dispatchedEmployeeCount;
          }
        } else if (yearEmployeeSettings.dispatchedEmployees !== null) {
          dispatchedEmployeeCount = yearEmployeeSettings.dispatchedEmployees;
          const remainingAfterDispatched = remainingEmployees - dispatchedEmployeeCount;
          if (yearEmployeeSettings.outsourcedEmployees !== null) {
            outsourcedEmployeeCount = yearEmployeeSettings.outsourcedEmployees;
            contractEmployeeCount = remainingAfterDispatched - outsourcedEmployeeCount;
          } else {
            contractEmployeeCount = Math.floor(remainingAfterDispatched * 0.50);
            outsourcedEmployeeCount = remainingAfterDispatched - contractEmployeeCount;
          }
        } else if (yearEmployeeSettings.outsourcedEmployees !== null) {
          outsourcedEmployeeCount = yearEmployeeSettings.outsourcedEmployees;
          const remainingAfterOutsourced = remainingEmployees - outsourcedEmployeeCount;
          contractEmployeeCount = Math.floor(remainingAfterOutsourced * 0.50);
          dispatchedEmployeeCount = remainingAfterOutsourced - contractEmployeeCount;
        } else {
          // すべて未設定の場合は自動計算（従来のロジック）
          contractEmployeeCount = Math.floor(remainingEmployees * 0.50); // 契約社員（残りの50%）
          dispatchedEmployeeCount = Math.floor(remainingEmployees * 0.25); // 派遣（残りの25%）
          outsourcedEmployeeCount = remainingEmployees - contractEmployeeCount - dispatchedEmployeeCount; // 業務委託（残り）
        }
      }
      
      // 従業員数合計は内訳の合計として計算
      const actualEmployeeCount = regularEmployeeCount + contractEmployeeCount + dispatchedEmployeeCount + outsourcedEmployeeCount;
      
      // 人件費の計算（各雇用形態の給与に基づいて計算）
      // シミュレーションパラメーターから年収設定を取得
      const yearSalarySettings = params.employeeSalarySettings?.[year] || {
        regularEmployeeAnnualSalary: 10000000,
        contractEmployeeAnnualSalary: 4000000,
        dispatchedEmployeeAnnualSalary: 3000000,
        outsourcedEmployeeAnnualSalary: 2500000
      };
      const regularEmployeeAnnualSalary = yearSalarySettings.regularEmployeeAnnualSalary || 10000000;
      const contractEmployeeAnnualSalary = yearSalarySettings.contractEmployeeAnnualSalary || 4000000;
      const dispatchedEmployeeAnnualSalary = yearSalarySettings.dispatchedEmployeeAnnualSalary || 3000000;
      const outsourcedEmployeeAnnualSalary = yearSalarySettings.outsourcedEmployeeAnnualSalary || 2500000;
      
      const laborCost = Math.floor(
        regularEmployeeCount * regularEmployeeAnnualSalary +
        contractEmployeeCount * contractEmployeeAnnualSalary +
        dispatchedEmployeeCount * dispatchedEmployeeAnnualSalary +
        outsourcedEmployeeCount * outsourcedEmployeeAnnualSalary
      );
      
      // EC/リファラル関連費用（紹介手数料収入の15%として計算）
      // ECサイトへのリンク設置・管理費用、リファラルプログラムの運営費用など
      const referralCost = Math.floor(referralRevenue * 0.15);
      
      // 売上原価の計算
      const yearCogsSettings = params.cogsSettings?.[year] || {
        ecReferralRevenueRate: 50,
        medicalRevenueRate: 50,
        insuranceRevenueRate: 50,
        renovationRevenueRate: 50,
        albumRevenueRate: 50,
        referralRevenueRate: 50
      };
      const ecReferralCogs = Math.floor(ecReferralRevenue * yearCogsSettings.ecReferralRevenueRate / 100);
      const medicalCogs = Math.floor(medicalRevenue * yearCogsSettings.medicalRevenueRate / 100);
      const insuranceCogs = Math.floor(insuranceRevenue * yearCogsSettings.insuranceRevenueRate / 100);
      const renovationCogs = Math.floor(renovationRevenue * yearCogsSettings.renovationRevenueRate / 100);
      const albumCogs = Math.floor(albumRevenue * yearCogsSettings.albumRevenueRate / 100);
      const referralCogs = Math.floor(referralRevenue * yearCogsSettings.referralRevenueRate / 100);
      const totalCogs = ecReferralCogs + medicalCogs + insuranceCogs + renovationCogs + albumCogs + referralCogs;
      
      // システム利用料（Google Cloud）
      // シミュレーションパラメーターから設定を取得
      const yearSystemUsageSettings = params.systemUsageSettings?.[year] || {
        baseMonthly: 50000,
        perUserMonthly: 5
      };
      const baseMonthly = yearSystemUsageSettings.baseMonthly || 50000;
      const perUserMonthly = yearSystemUsageSettings.perUserMonthly || 5;
      const perUserCost = Math.floor(activeUsers * perUserMonthly); // 月額/人
      const systemUsageCostTotal = Math.floor((baseMonthly + perUserCost) * 12); // 年間分
      
      const totalCost = laborCost + referralCost + systemUsageCostTotal + totalCogs;
      
      // 売上総利益
      const grossProfit = totalRevenue - totalCost;
      
      // 販管費の内訳
      // シミュレーションパラメーターから設定を取得
      const yearSgaSettings = params.sgaSettings?.[year] || {
        backOfficeLaborCost: 5000000,
        entertainmentCost: year === 2026 ? 0 : 1000000,
        advertisingCostRate: 2,
        transportationCost: 500000,
        otherSGA: 500000,
        depreciation: Math.floor(2000000 * Math.pow(0.9, year - 2026))
      };
      const backOfficeLaborCost = yearSgaSettings.backOfficeLaborCost || 5000000;
      const entertainmentCost = yearSgaSettings.entertainmentCost !== undefined ? yearSgaSettings.entertainmentCost : (year === 2026 ? 0 : 1000000);
      const advertisingCostRate = yearSgaSettings.advertisingCostRate || 2;
      const advertisingCost = Math.floor(totalRevenue * advertisingCostRate / 100);
      const transportationCost = yearSgaSettings.transportationCost || 500000;
      const otherSGA = yearSgaSettings.otherSGA || 500000;
      const depreciation = yearSgaSettings.depreciation !== undefined ? yearSgaSettings.depreciation : Math.floor(2000000 * Math.pow(0.9, year - 2026));
      
      const totalSGA = backOfficeLaborCost + entertainmentCost + advertisingCost + transportationCost + otherSGA + depreciation;
      
      // 営業利益
      const operatingProfit = grossProfit - totalSGA;
      
      // 税金（法人税率30%と仮定、営業利益がマイナスの場合は0）
      const tax = operatingProfit > 0 ? Math.floor(operatingProfit * 0.3) : 0;
      
      // 税後利益
      const netProfit = operatingProfit - tax;
      
      // 事業計画の表はブランクにする（シミュレーションの数値が反映されるまで）
      data.push({
        quarter: getYearLabel(year),
        // 個人ユーザー（無料）
        personalFreeUsers: null, // 累計
        newPersonalFreeUsers: null, // 新規加入数
        churnedPersonalFreeUsers: null, // 解約数
        // 個人ユーザー（プレミアム）
        personalPremiumUsers: null, // 累計
        newPersonalPremiumUsers: null, // 新規加入数
        churnedPersonalPremiumUsers: null, // 解約数
        // 個人ユーザー合計
        personalUsers: null, // 累計
        personalRevenue: null,
        // 企業向け
        companyCount: null, // 累計
        newCompanyCount: null, // 新規導入数
        churnedCompanyCount: null, // 解約数
        companyEmployees: null, // 累計
        newCompanyEmployees: null, // 新規従業員数
        churnedCompanyEmployees: null, // 解約従業員数
        companyRevenue: null,
        // 自治体向け
        municipalityCount: null, // 累計
        newMunicipalityCount: null, // 新規加入数
        churnedMunicipalityCount: null, // 解約数
        municipalityUsers: null, // 累計
        newMunicipalityUsers: null, // 新規利用者数
        churnedMunicipalityUsers: null, // 解約利用者数
        municipalityRevenue: null,
        activeUsers: null,
        ecReferralRevenue: null, // EC/リファラル関連収入（合計）
        ecReferralEssentials: null, // おむつなどの必需品
        ecReferralEducationalGoods: null, // 知育グッズ
        ecReferralHealthFood: null, // 健康食品・サプリ
        ecReferralHealthGoods: null, // 健康グッズ
        ecReferralMaternityGoods: null, // マタニティグッズ
        medicalRevenue: null, // 医療関連収入（合計）
        ecReferralMedicine: null, // 薬
        ecReferralVaccination: null, // 予防接種
        ecReferralAllergyTest: null, // アレルギー検査
        ecReferralGeneticTest: null, // 遺伝子DNA検査
        insuranceRevenue: null, // 保険関連収入（合計）
        renovationRevenue: null, // リフォーム関連収入（合計）
        albumRevenue: null, // アルバム関連収入（合計）
        ecReferralInfantChildInsurance: null, // 乳児・児童保険
        ecReferralStudentInsurance: null, // 学生保険
        ecReferralEducationExpenseInsurance: null, // 学業費用保険
        ecConversionEssentials: null, // おむつなどの必需品成約件数
        ecConversionEducationalGoods: null, // 知育グッズ成約件数
        ecConversionHealthFood: null, // 健康食品・サプリ成約件数
        ecConversionHealthGoods: null, // 健康グッズ成約件数
        ecConversionMaternityGoods: null, // マタニティグッズ成約件数
        ecConversionMedicine: null, // 薬成約件数
        ecConversionVaccination: null, // 予防接種成約件数
        ecConversionAllergyTest: null, // アレルギー検査成約件数
        ecConversionGeneticTest: null, // 遺伝子DNA検査成約件数
        ecConversionInfantChildInsurance: null, // 乳児・児童保険成約件数
        ecConversionStudentInsurance: null, // 学生保険成約件数
        ecConversionEducationExpenseInsurance: null, // 学業費用保険成約件数
        ecReferralRenovation: null, // 子育て対応リフォーム
        ecConversionRenovation: null, // 子育て対応リフォーム成約件数
        ecReferralAlbum: null, // アルバム制作
        ecConversionAlbum: null, // アルバム制作成約件数
        ecReferralMaternityPhoto: null, // マタニティフォト
        ecConversionMaternityPhoto: null, // マタニティフォト成約件数
        ecReferralPrint: null, // プリント印刷
        ecConversionPrint: null, // プリント印刷成約件数
        referralRevenue: null,
        referralLessons: null, // 習い事紹介手数料
        referralChildModel: null, // 幼児モデル紹介手数料
        referralHousekeeperMatching: null, // 家政婦マッチング紹介手数料
        referralTeacherMatching: null, // 専門教師マッチング紹介手数料
        conversionLessons: null, // 習い事成約件数
        conversionChildModel: null, // 幼児モデル成約件数
        conversionHousekeeperMatching: null, // 家政婦マッチング成約件数
        conversionTeacherMatching: null, // 専門教師マッチング成約件数
        totalConversionCount: null, // 合計成約件数
        advertisingRevenue: null, // 広告収入
        applicationAgencyRevenue: null, // 申請代行サービス収入
        applicationAgencyCases: null, // 申請代行サービス件数
        certificationSupportRevenue: null, // 認定取得支援収入
        certificationSupportKuruminCases: null, // くるみん認定取得支援件数
        certificationSupportHealthManagementCases: null, // 健康経営優良法人認定取得支援件数
        totalRevenue: null,
        laborCost: null,
        employeeCount: null, // 従業員数
        regularEmployeeCount: null, // 正社員数
        contractEmployeeCount: null, // 契約社員数
        dispatchedEmployeeCount: null, // 派遣社員数
        outsourcedEmployeeCount: null, // 業務委託社員数
        referralCost: null, // EC/リファラル関連費用
        ecReferralCogs: null, // EC/リファラル関連収入の売上原価
        medicalCogs: null, // 医療関連収入の売上原価
        insuranceCogs: null, // 保険関連収入の売上原価
        renovationCogs: null, // リフォーム関連収入の売上原価
        albumCogs: null, // アルバム関連収入の売上原価
        referralCogs: null, // 紹介手数料収入の売上原価
        totalCogs: null, // 売上原価合計
        systemUsageCost: null, // システム利用料（Google Cloud）
        totalCost: null,
        grossProfit: null,
        backOfficeLaborCost: null, // 人件費（バックオフィス）
        entertainmentCost: null, // 交際費
        advertisingCost: null, // 広告費
        transportationCost: null, // 交通費
        otherSGA: null, // その他
        depreciation: null, // 減価償却
        totalSGA: null,
        operatingProfit: null,
        tax: null,
        netProfit: null
      });
    }
    
    return data;
  };

  // シミュレーションの計算結果を読み込む（予測値プレビュー用）
  const getSimulationResults = () => {
    const saved = localStorage.getItem('businessPlanSimulationResults');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse simulation results:', e);
      }
    }
    return null;
  };

  const simulationResults = getSimulationResults();
  
  // シミュレーションの結果がある場合はそれを使用、ない場合はブランクデータを使用
  const financialData = useMemo(() => {
    if (simulationResults) {
      // シミュレーションの結果を事業計画のデータ形式に変換
      return simulationResults.map(result => ({
        quarter: result.quarter || getYearLabel(result.year),
        personalFreeUsers: result.personalFreeUsers,
        newPersonalFreeUsers: result.newPersonalFreeUsers,
        churnedPersonalFreeUsers: result.churnedPersonalFreeUsers,
        personalPremiumUsers: result.personalPremiumUsers,
        newPersonalPremiumUsers: result.newPersonalPremiumUsers,
        churnedPersonalPremiumUsers: result.churnedPersonalPremiumUsers,
        personalUsers: result.personalUsers,
        personalRevenue: result.personalRevenue,
        companyCount: result.companyCount,
        newCompanyCount: result.newCompanyCount,
        churnedCompanyCount: result.churnedCompanyCount,
        companyEmployees: result.companyEmployees,
        newCompanyEmployees: result.newCompanyEmployees,
        churnedCompanyEmployees: result.churnedCompanyEmployees,
        companyRevenue: result.companyRevenue,
        municipalityCount: result.municipalityCount,
        newMunicipalityCount: result.newMunicipalityCount,
        churnedMunicipalityCount: result.churnedMunicipalityCount,
        municipalityUsers: result.municipalityUsers,
        newMunicipalityUsers: result.newMunicipalityUsers,
        churnedMunicipalityUsers: result.churnedMunicipalityUsers,
        municipalityRevenue: result.municipalityRevenue,
        activeUsers: result.activeUsers,
        ecReferralRevenue: result.ecReferralRevenue,
        ecReferralEssentials: result.ecReferralEssentials,
        ecReferralEducationalGoods: result.ecReferralEducationalGoods,
        ecReferralHealthFood: result.ecReferralHealthFood,
        ecReferralHealthGoods: result.ecReferralHealthGoods,
        ecReferralMaternityGoods: result.ecReferralMaternityGoods,
        medicalRevenue: result.medicalRevenue,
        ecReferralMedicine: result.ecReferralMedicine,
        ecReferralVaccination: result.ecReferralVaccination,
        ecReferralAllergyTest: result.ecReferralAllergyTest,
        ecReferralGeneticTest: result.ecReferralGeneticTest,
        insuranceRevenue: result.insuranceRevenue,
        ecReferralInfantChildInsurance: result.ecReferralInfantChildInsurance,
        ecReferralStudentInsurance: result.ecReferralStudentInsurance,
        ecReferralEducationExpenseInsurance: result.ecReferralEducationExpenseInsurance,
        renovationRevenue: result.renovationRevenue,
        ecReferralRenovation: result.ecReferralRenovation,
        ecConversionRenovation: result.ecConversionRenovation,
        albumRevenue: result.albumRevenue,
        ecReferralAlbum: result.ecReferralAlbum,
        ecConversionAlbum: result.ecConversionAlbum,
        ecReferralMaternityPhoto: result.ecReferralMaternityPhoto,
        ecConversionMaternityPhoto: result.ecConversionMaternityPhoto,
        ecReferralPrint: result.ecReferralPrint,
        ecConversionPrint: result.ecConversionPrint,
        ecConversionEssentials: result.ecConversionEssentials,
        ecConversionEducationalGoods: result.ecConversionEducationalGoods,
        ecConversionHealthFood: result.ecConversionHealthFood,
        ecConversionHealthGoods: result.ecConversionHealthGoods,
        ecConversionMaternityGoods: result.ecConversionMaternityGoods,
        ecConversionMedicine: result.ecConversionMedicine,
        ecConversionVaccination: result.ecConversionVaccination,
        ecConversionAllergyTest: result.ecConversionAllergyTest,
        ecConversionGeneticTest: result.ecConversionGeneticTest,
        ecConversionInfantChildInsurance: result.ecConversionInfantChildInsurance,
        ecConversionStudentInsurance: result.ecConversionStudentInsurance,
        ecConversionEducationExpenseInsurance: result.ecConversionEducationExpenseInsurance,
        referralRevenue: result.referralRevenue,
        referralLessons: result.referralLessons,
        referralChildModel: result.referralChildModel,
        referralHousekeeperMatching: result.referralHousekeeperMatching,
        referralTeacherMatching: result.referralTeacherMatching,
        conversionLessons: result.conversionLessons,
        conversionChildModel: result.conversionChildModel,
        conversionHousekeeperMatching: result.conversionHousekeeperMatching,
        conversionTeacherMatching: result.conversionTeacherMatching,
        totalConversionCount: result.totalConversionCount,
        advertisingRevenue: result.advertisingRevenue,
        applicationAgencyRevenue: result.applicationAgencyRevenue,
        applicationAgencyCases: result.applicationAgencyCases,
        certificationSupportRevenue: result.certificationSupportRevenue,
        certificationSupportKuruminCases: result.certificationSupportKuruminCases,
        certificationSupportHealthManagementCases: result.certificationSupportHealthManagementCases,
        totalRevenue: result.totalRevenue,
        laborCost: result.laborCost,
        employeeCount: result.employeeCount,
        regularEmployeeCount: result.regularEmployeeCount,
        contractEmployeeCount: result.contractEmployeeCount,
        dispatchedEmployeeCount: result.dispatchedEmployeeCount,
        outsourcedEmployeeCount: result.outsourcedEmployeeCount,
        referralCost: result.referralCost,
        ecReferralCogs: result.ecReferralCogs,
        medicalCogs: result.medicalCogs,
        insuranceCogs: result.insuranceCogs,
        renovationCogs: result.renovationCogs,
        albumCogs: result.albumCogs,
        referralCogs: result.referralCogs,
        totalCogs: result.totalCogs,
        systemUsageCost: result.systemUsageCost,
        totalCost: result.totalCost,
        grossProfit: result.grossProfit,
        backOfficeLaborCost: result.backOfficeLaborCost,
        entertainmentCost: result.entertainmentCost,
        advertisingCost: result.advertisingCost,
        transportationCost: result.transportationCost,
        otherSGA: result.otherSGA,
        depreciation: result.depreciation,
        totalSGA: result.totalSGA,
        operatingProfit: result.operatingProfit,
        tax: result.tax,
        netProfit: result.netProfit
      }));
    } else {
      // シミュレーション結果がない場合はブランクデータを返す
      return generateSampleData(simulationParams);
    }
  }, [simulationParams, simulationKey, simulationResults]);

  // スナップショットをJSON形式でダウンロード
  const downloadSnapshotAsJSON = (snapshot, e) => {
    if (e) e.stopPropagation();
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

  // スナップショットを保存
  const handleSaveSnapshot = () => {
    if (!snapshotName.trim()) {
      alert('スナップショット名を入力してください。');
      return;
    }
    
    if (!simulationResults || simulationResults.length === 0) {
      alert('シミュレーション結果がありません。先にシミュレーションを実行してください。');
      return;
    }
    
    const snapshot = {
      id: Date.now().toString(),
      name: snapshotName.trim(),
      createdAt: new Date().toISOString(),
      params: JSON.parse(JSON.stringify(simulationParams)),
      results: JSON.parse(JSON.stringify(simulationResults))
    };
    
    // JSONファイルとしてダウンロード
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
    
    // 既存のスナップショットを取得
    const existingSnapshots = JSON.parse(localStorage.getItem('businessPlanSnapshots') || '[]');
    existingSnapshots.push(snapshot);
    
    // スナップショットを保存（最新20件まで）
    const sortedSnapshots = existingSnapshots
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
    
    localStorage.setItem('businessPlanSnapshots', JSON.stringify(sortedSnapshots));
    
    setSnapshotName('');
    setShowSnapshotSaveModal(false);
    alert('スナップショットをJSONファイルとして保存しました。');
  };

  // 表示用データ（年間のみ、既に年単位で生成されているのでそのまま使用）
  const displayData = useMemo(() => {
    return financialData;
  }, [financialData]);

  // 合計行を計算
  // 各セクションの行数を計算（展開状態を考慮）
  // rowspanは「その行を含む行数」なので、最初の行も含めて計算する
  const sectionRowCounts = useMemo(() => {
    // 売上セクションの行数（最初の行「個人ユーザー売上」を含む）
    let revenueRows = 1; // 個人ユーザー売上（rowspanの最初の行）
    if (expandedSections.revenueDetails) {
      revenueRows += 1; // 個人ユーザー加入数
      if (expandedSections.personalUsers) {
        revenueRows += 1; // 無料ユーザー
        if (expandedSections.personalFreeUsers) {
          revenueRows += 2; // 新規加入数、解約数
        }
        revenueRows += 1; // プレミアムユーザー
        if (expandedSections.personalPremiumUsers) {
          revenueRows += 2; // 新規加入数、解約数
        }
      }
    }
    revenueRows += 1; // 企業向け売上
    if (expandedSections.revenueDetails) {
      revenueRows += 1; // 企業向け導入数
      if (expandedSections.company) {
        revenueRows += 2; // 新規導入数、解約数
      }
      revenueRows += 1; // 企業向け従業員数
      if (expandedSections.companyEmployees) {
        revenueRows += 2; // 新規従業員数、解約従業員数
      }
    }
    revenueRows += 1; // 認定取得支援収入
    if (expandedSections.revenueDetails) {
      revenueRows += 1; // くるみん認定取得支援
      if (expandedSections.certificationSupportKurumin) {
        revenueRows += 1; // くるみん認定取得支援件数
      }
      revenueRows += 1; // 健康経営優良法人認定取得支援
      if (expandedSections.certificationSupportHealthManagement) {
        revenueRows += 1; // 健康経営優良法人認定取得支援件数
      }
    }
    revenueRows += 1; // 申請代行サービス収入
    revenueRows += 1; // 自治体向け売上
    if (expandedSections.revenueDetails) {
      revenueRows += 1; // 自治体加入数
      if (expandedSections.municipality) {
        revenueRows += 2; // 新規加入数、解約数
      }
      revenueRows += 1; // 自治体利用者数
      if (expandedSections.municipalityUsers) {
        revenueRows += 2; // 新規利用者数、解約利用者数
      }
    }
    revenueRows += 1; // トータルアクティブユーザー数
    if (expandedSections.revenueDetails) {
      revenueRows += 1; // EC/リファラル関連収入
      if (expandedSections.ecReferralRevenue) {
        revenueRows += 5; // 内訳5項目
      }
      revenueRows += 1; // 医療関連収入
      if (expandedSections.medicalRevenue) {
        revenueRows += 4; // 内訳4項目
      }
      revenueRows += 1; // 保険関連収入
      if (expandedSections.insuranceRevenue) {
        revenueRows += 3; // 内訳3項目
      }
      revenueRows += 1; // リフォーム関連収入
      if (expandedSections.renovationRevenue) {
        revenueRows += 1; // 内訳1項目
      }
      revenueRows += 1; // アルバム関連収入
      if (expandedSections.albumRevenue) {
        revenueRows += 3; // 内訳3項目
      }
      revenueRows += 1; // 紹介手数料収入
      if (expandedSections.referralRevenue) {
        revenueRows += 9; // 内訳9行
      }
      revenueRows += 1; // 広告収入
    }
    revenueRows += 1; // 関連収入合計
    revenueRows += 1; // 売上合計

    // 売上原価セクションの行数（最初の行「人件費（開発、運用）」を含む）
    let costRows = 1; // 人件費（開発、運用）（rowspanの最初の行）
    costRows += 1; // 従業員数
    if (expandedSections.employeeBreakdown) {
      costRows += 4; // 正社員、契約社員、派遣、業務委託
    }
    if (expandedSections.costDetails) {
      costRows += 1; // EC/リファラル関連収入の売上原価
      costRows += 1; // 医療関連収入の売上原価
      costRows += 1; // 保険関連収入の売上原価
      costRows += 1; // リフォーム関連収入の売上原価
      costRows += 1; // アルバム関連収入の売上原価
      costRows += 1; // 紹介手数料収入の売上原価
    }
    costRows += 1; // システム利用料
    costRows += 1; // 関連収入原価合計
    costRows += 1; // 売上原価合計

    // 販管費セクションの行数（最初の行「人件費（バックオフィス）」を含む）
    let sgaRows = 1; // 人件費（バックオフィス）（rowspanの最初の行）
    sgaRows += 1; // 交際費
    sgaRows += 1; // 広告費
    sgaRows += 1; // 交通費
    sgaRows += 1; // その他
    sgaRows += 1; // 減価償却
    sgaRows += 1; // 販管費合計

    return {
      revenue: revenueRows,
      cost: costRows,
      sga: sgaRows
    };
  }, [expandedSections]);

  const totals = useMemo(() => {
    // 累計値の項目リスト（最後の年の値をそのまま使用）
    const cumulativeFields = [
      'personalFreeUsers',
      'personalPremiumUsers',
      'personalUsers',
      'companyCount',
      'companyEmployees',
      'municipalityCount',
      'municipalityUsers',
      'activeUsers',
      'employeeCount',
      'regularEmployeeCount',
      'contractEmployeeCount',
      'dispatchedEmployeeCount',
      'outsourcedEmployeeCount'
    ];
    
    const result = displayData.reduce((acc, row) => {
      Object.keys(row).forEach(key => {
        if (key !== 'quarter') {
          const value = row[key];
          // null や undefined を 0 として扱う
          const numValue = (value === null || value === undefined) ? 0 : (typeof value === 'number' ? value : 0);
          if (numValue !== 0 || typeof value === 'number') {
          // 累計値の場合は合計せず、最後の値で上書き
          if (cumulativeFields.includes(key)) {
              acc[key] = numValue;
          } else {
              acc[key] = (acc[key] || 0) + numValue;
            }
          }
        }
      });
      return acc;
    }, {});
    
    // totalRevenueは各年の合計として計算（累計値ではない）
    result.totalRevenue = displayData.reduce((sum, row) => {
      const value = row.totalRevenue;
      const numValue = (value === null || value === undefined) ? 0 : (typeof value === 'number' ? value : 0);
      return sum + numValue;
    }, 0);
    
    // 関連収入合計（EC/リファラル関連収入、医療関連収入、保険関連収入、リフォーム関連収入、アルバム関連収入、紹介手数料収入、広告収入の合計）
    result.relatedRevenueTotal = displayData.reduce((sum, row) => {
      const ecReferral = (row.ecReferralRevenue === null || row.ecReferralRevenue === undefined) ? 0 : (typeof row.ecReferralRevenue === 'number' ? row.ecReferralRevenue : 0);
      const medical = (row.medicalRevenue === null || row.medicalRevenue === undefined) ? 0 : (typeof row.medicalRevenue === 'number' ? row.medicalRevenue : 0);
      const insurance = (row.insuranceRevenue === null || row.insuranceRevenue === undefined) ? 0 : (typeof row.insuranceRevenue === 'number' ? row.insuranceRevenue : 0);
      const renovation = (row.renovationRevenue === null || row.renovationRevenue === undefined) ? 0 : (typeof row.renovationRevenue === 'number' ? row.renovationRevenue : 0);
      const album = (row.albumRevenue === null || row.albumRevenue === undefined) ? 0 : (typeof row.albumRevenue === 'number' ? row.albumRevenue : 0);
      const referral = (row.referralRevenue === null || row.referralRevenue === undefined) ? 0 : (typeof row.referralRevenue === 'number' ? row.referralRevenue : 0);
      const advertising = (row.advertisingRevenue === null || row.advertisingRevenue === undefined) ? 0 : (typeof row.advertisingRevenue === 'number' ? row.advertisingRevenue : 0);
      return sum + ecReferral + medical + insurance + renovation + album + referral + advertising;
    }, 0);
    
    // 関連収入原価合計（EC/リファラル関連収入の売上原価、医療関連収入の売上原価、保険関連収入の売上原価、リフォーム関連収入の売上原価、アルバム関連収入の売上原価、紹介手数料収入の売上原価の合計）
    result.relatedCogsTotal = displayData.reduce((sum, row) => {
      const ecReferralCogs = (row.ecReferralCogs === null || row.ecReferralCogs === undefined) ? 0 : (typeof row.ecReferralCogs === 'number' ? row.ecReferralCogs : 0);
      const medicalCogs = (row.medicalCogs === null || row.medicalCogs === undefined) ? 0 : (typeof row.medicalCogs === 'number' ? row.medicalCogs : 0);
      const insuranceCogs = (row.insuranceCogs === null || row.insuranceCogs === undefined) ? 0 : (typeof row.insuranceCogs === 'number' ? row.insuranceCogs : 0);
      const renovationCogs = (row.renovationCogs === null || row.renovationCogs === undefined) ? 0 : (typeof row.renovationCogs === 'number' ? row.renovationCogs : 0);
      const albumCogs = (row.albumCogs === null || row.albumCogs === undefined) ? 0 : (typeof row.albumCogs === 'number' ? row.albumCogs : 0);
      const referralCogs = (row.referralCogs === null || row.referralCogs === undefined) ? 0 : (typeof row.referralCogs === 'number' ? row.referralCogs : 0);
      return sum + ecReferralCogs + medicalCogs + insuranceCogs + renovationCogs + albumCogs + referralCogs;
    }, 0);
    
    return result;
  }, [displayData]);

  // 単位変換関数（金額のみ）
  const convertUnit = (num) => {
    if (num === null || num === undefined) return 0;
    switch (unitMode) {
      case 'million':
        return num / 1000000;
      case 'thousand':
        return num / 1000;
      case 'yen':
      default:
        return num;
    }
  };

  // 単位ラベルを取得
  const getUnitLabel = (isCurrency = false) => {
    if (!isCurrency) return '';
    switch (unitMode) {
      case 'million':
        return '（百万円）';
      case 'thousand':
        return '（千円）';
      case 'yen':
      default:
        return '（円）';
    }
  };

  // 数値を3桁区切りでフォーマット（金額ではない項目用、単位変換なし）
  const formatNumber = (num, isNegative = false, unit = '') => {
    if (num === null || num === undefined) return '-';
    const formatted = new Intl.NumberFormat('ja-JP').format(Math.floor(num));
    let result = formatted;
    if (isNegative) {
      result = `▲${formatted}`;
    }
    if (unit) {
      result = `${result}${unit}`;
    }
    return result;
  };

  // 数値を通貨形式でフォーマット（金額項目用、単位変換あり）
  const formatCurrency = (num, isNegative = false) => {
    if (num === null || num === undefined) return '-';
    const converted = convertUnit(num);
    const prefix = '¥';
    let formatted;
    if (unitMode === 'million') {
      formatted = `${prefix}${new Intl.NumberFormat('ja-JP', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }).format(converted)}`;
    } else if (unitMode === 'thousand') {
      formatted = `${prefix}${new Intl.NumberFormat('ja-JP', { 
        minimumFractionDigits: 1, 
        maximumFractionDigits: 1 
      }).format(converted)}`;
    } else {
      formatted = `${prefix}${new Intl.NumberFormat('ja-JP').format(Math.floor(converted))}`;
    }
    if (isNegative) {
      return `▲${formatted}`;
    }
    return formatted;
  };

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>事業計画</h1>
            <p className="specification-description">
              7年間の年間損益計算書（PL）を表示します。
            </p>
          </div>

          <div className="specification-section">
            <h2>損益計算書（PL）</h2>
            <p>
              1年目から7年目までの7年間の財務計画です。
            </p>
          </div>

          <div className="specification-section" style={{ overflowX: 'auto', position: 'relative' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ 
                display: 'flex', 
                gap: '12px',
                alignItems: 'center'
              }}>
                <button
                  className="toggle-button"
                  onClick={() => navigate('/specification/business-plan-simulation')}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#10b981';
                  }}
                >
                  シミュレーション
                </button>
                <button
                  ref={snapshotSaveButtonRef}
                  className="toggle-button"
                  onClick={(e) => {
                    const buttonRect = e.currentTarget.getBoundingClientRect();
                    const modalWidth = 500;
                    const modalLeft = Math.max(16, Math.min(buttonRect.left, window.innerWidth - modalWidth - 16));
                    setSnapshotSaveModalPosition({
                      top: buttonRect.bottom + 8,
                      left: modalLeft + (modalWidth / 2)
                    });
                    setShowSnapshotSaveModal(true);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#10b981';
                  }}
                >
                  スナップショットを保存
                </button>
                <button
                  ref={snapshotButtonRef}
                  className="toggle-button"
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
                <button
                  className="toggle-button"
                  onClick={() => {
                    const allExpanded = Object.values(expandedSections).every(v => v);
                    setExpandedSections({
                      personalUsers: !allExpanded,
                      personalFreeUsers: !allExpanded,
                      personalPremiumUsers: !allExpanded,
                      company: !allExpanded,
                      companyEmployees: !allExpanded,
                      municipality: !allExpanded,
                      municipalityUsers: !allExpanded,
                      referralRevenue: !allExpanded,
                      ecReferralRevenue: !allExpanded,
                      medicalRevenue: !allExpanded,
                      insuranceRevenue: !allExpanded,
                      renovationRevenue: !allExpanded,
                      albumRevenue: !allExpanded,
                      certificationSupportKurumin: !allExpanded,
                      certificationSupportHealthManagement: !allExpanded,
                      laborCost: !allExpanded,
                      employeeBreakdown: !allExpanded,
                      revenueDetails: !allExpanded
                    });
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#5568d3';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#667eea';
                  }}
                >
                  {Object.values(expandedSections).every(v => v) ? 'すべて折りたたむ' : 'すべて展開'}
                </button>
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '12px',
                padding: '8px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <div className="diagram-toggle">
                  <button
                    className={`toggle-button ${unitMode === 'yen' ? 'active' : ''}`}
                    onClick={() => setUnitMode('yen')}
                  >
                    1円単位
                  </button>
                  <button
                    className={`toggle-button ${unitMode === 'thousand' ? 'active' : ''}`}
                    onClick={() => setUnitMode('thousand')}
                  >
                    千円単位
                  </button>
                  <button
                    className={`toggle-button ${unitMode === 'million' ? 'active' : ''}`}
                    onClick={() => setUnitMode('million')}
                  >
                    百万単位
                  </button>
                </div>
              </div>
            </div>
            <table className="financial-table">
              <thead>
                <tr>
                  <th className="sticky-column section-column"></th>
                  <th className="sticky-column">項目{getUnitLabel(true)}</th>
                  {displayData.map((row, index) => (
                    <th key={index} className="quarter-header">{row.quarter}</th>
                  ))}
                  <th className="total-column">合計</th>
                </tr>
              </thead>
              <tbody>
                {/* 売上セクション */}
                {/* 個人ユーザー */}
                <tr>
                  <td 
                    rowSpan={sectionRowCounts.revenue} 
                    className="section-label-vertical" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpandedSections({ ...expandedSections, revenueDetails: !expandedSections.revenueDetails })}
                  >
                    <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                      {expandedSections.revenueDetails ? '▼' : '▶'}
                    </span>
                    <strong>売上</strong>
                  </td>
                  <td className="indent">個人ユーザー売上</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell">{formatCurrency(row.personalRevenue)}</td>
                  ))}
                  <td className="number-cell total-cell">{formatCurrency(totals.personalRevenue)}</td>
                </tr>
                {expandedSections.revenueDetails && (
                  <>
                    <tr>
                      <td className="indent" style={{ cursor: 'pointer' }} onClick={() => setExpandedSections({ ...expandedSections, personalUsers: !expandedSections.personalUsers })}>
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.personalUsers ? '▼' : '▶'}
                        </span>
                        個人ユーザー加入数（累計・人）
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatNumber(row.personalUsers, false, '人')}</td>
                      ))}
                      <td className="number-cell total-cell">{formatNumber(totals.personalUsers, false, '人')}</td>
                    </tr>
                    {expandedSections.personalUsers && (
                      <>
                        {/* 無料ユーザー */}
                        <tr>
                          <td className="indent" style={{ paddingLeft: '40px', cursor: 'pointer' }} onClick={() => setExpandedSections({ ...expandedSections, personalFreeUsers: !expandedSections.personalFreeUsers })}>
                            <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                              {expandedSections.personalFreeUsers ? '▼' : '▶'}
                            </span>
                            無料ユーザー（累計・人）
                          </td>
                          {displayData.map((row, index) => (
                            <td key={index} className="number-cell">{formatNumber(row.personalFreeUsers, false, '人')}</td>
                          ))}
                          <td className="number-cell total-cell">{formatNumber(totals.personalFreeUsers, false, '人')}</td>
                        </tr>
                        {expandedSections.personalFreeUsers && (
                          <>
                            <tr>
                              <td className="indent" style={{ paddingLeft: '60px' }}>新規加入数（人）</td>
                              {displayData.map((row, index) => (
                                <td key={index} className="number-cell">{formatNumber(row.newPersonalFreeUsers, false, '人')}</td>
                              ))}
                              <td className="number-cell total-cell">{formatNumber(totals.newPersonalFreeUsers, false, '人')}</td>
                            </tr>
                            <tr>
                              <td className="indent" style={{ paddingLeft: '60px' }}>解約数（人）</td>
                              {displayData.map((row, index) => (
                                <td key={index} className="number-cell negative-value">{formatNumber(row.churnedPersonalFreeUsers, true, '人')}</td>
                              ))}
                              <td className="number-cell total-cell negative-value">{formatNumber(totals.churnedPersonalFreeUsers, true, '人')}</td>
                            </tr>
                          </>
                        )}
                        {/* プレミアムユーザー */}
                        <tr>
                          <td className="indent" style={{ paddingLeft: '40px', cursor: 'pointer' }} onClick={() => setExpandedSections({ ...expandedSections, personalPremiumUsers: !expandedSections.personalPremiumUsers })}>
                            <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                              {expandedSections.personalPremiumUsers ? '▼' : '▶'}
                            </span>
                            プレミアムユーザー（累計・人）
                          </td>
                          {displayData.map((row, index) => (
                            <td key={index} className="number-cell">{formatNumber(row.personalPremiumUsers, false, '人')}</td>
                          ))}
                          <td className="number-cell total-cell">{formatNumber(totals.personalPremiumUsers, false, '人')}</td>
                        </tr>
                        {expandedSections.personalPremiumUsers && (
                          <>
                            <tr>
                              <td className="indent" style={{ paddingLeft: '60px' }}>新規加入数（人）</td>
                              {displayData.map((row, index) => (
                                <td key={index} className="number-cell">{formatNumber(row.newPersonalPremiumUsers, false, '人')}</td>
                              ))}
                              <td className="number-cell total-cell">{formatNumber(totals.newPersonalPremiumUsers, false, '人')}</td>
                            </tr>
                            <tr>
                              <td className="indent" style={{ paddingLeft: '60px' }}>解約数（人）</td>
                              {displayData.map((row, index) => (
                                <td key={index} className="number-cell negative-value">{formatNumber(row.churnedPersonalPremiumUsers, true, '人')}</td>
                              ))}
                              <td className="number-cell total-cell negative-value">{formatNumber(totals.churnedPersonalPremiumUsers, true, '人')}</td>
                            </tr>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
                {/* 企業向け */}
                <tr>
                  <td className="indent">企業向け売上</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell">{formatCurrency(row.companyRevenue)}</td>
                  ))}
                  <td className="number-cell total-cell">{formatCurrency(totals.companyRevenue)}</td>
                </tr>
                {expandedSections.revenueDetails && (
                  <>
                    <tr>
                      <td className="indent" style={{ cursor: 'pointer' }} onClick={() => setExpandedSections({ ...expandedSections, company: !expandedSections.company })}>
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.company ? '▼' : '▶'}
                        </span>
                        企業向け導入数（累計・社）
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatNumber(row.companyCount, false, '社')}</td>
                      ))}
                      <td className="number-cell total-cell">{formatNumber(totals.companyCount, false, '社')}</td>
                    </tr>
                    {expandedSections.company && (
                      <>
                        <tr>
                          <td className="indent" style={{ paddingLeft: '40px' }}>新規導入数（社）</td>
                          {displayData.map((row, index) => (
                            <td key={index} className="number-cell">{formatNumber(row.newCompanyCount, false, '社')}</td>
                          ))}
                          <td className="number-cell total-cell">{formatNumber(totals.newCompanyCount, false, '社')}</td>
                        </tr>
                        <tr>
                          <td className="indent" style={{ paddingLeft: '40px' }}>解約数（社）</td>
                          {displayData.map((row, index) => (
                            <td key={index} className="number-cell negative-value">{formatNumber(row.churnedCompanyCount, true, '社')}</td>
                          ))}
                          <td className="number-cell total-cell negative-value">{formatNumber(totals.churnedCompanyCount, true, '社')}</td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td className="indent" style={{ cursor: 'pointer' }} onClick={() => setExpandedSections({ ...expandedSections, companyEmployees: !expandedSections.companyEmployees })}>
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.companyEmployees ? '▼' : '▶'}
                        </span>
                        企業向け従業員数（累計・人）
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatNumber(row.companyEmployees, false, '人')}</td>
                      ))}
                      <td className="number-cell total-cell">{formatNumber(totals.companyEmployees, false, '人')}</td>
                    </tr>
                    {expandedSections.companyEmployees && (
                      <>
                        <tr>
                          <td className="indent" style={{ paddingLeft: '40px' }}>新規従業員数（人）</td>
                          {displayData.map((row, index) => (
                            <td key={index} className="number-cell">{formatNumber(row.newCompanyEmployees, false, '人')}</td>
                          ))}
                          <td className="number-cell total-cell">{formatNumber(totals.newCompanyEmployees, false, '人')}</td>
                        </tr>
                        <tr>
                          <td className="indent" style={{ paddingLeft: '40px' }}>解約従業員数（人）</td>
                          {displayData.map((row, index) => (
                            <td key={index} className="number-cell negative-value">{formatNumber(row.churnedCompanyEmployees, true, '人')}</td>
                          ))}
                          <td className="number-cell total-cell negative-value">{formatNumber(totals.churnedCompanyEmployees, true, '人')}</td>
                        </tr>
                      </>
                    )}
                  </>
                )}
                <tr>
                  <td className="indent">認定取得支援収入</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell">{formatCurrency(row.certificationSupportRevenue || 0)}</td>
                  ))}
                  <td className="number-cell total-cell">{formatCurrency(totals.certificationSupportRevenue || 0)}</td>
                </tr>
                {expandedSections.revenueDetails && (
                  <>
                    <tr className="collapsible-row" onClick={() => setExpandedSections({ ...expandedSections, certificationSupportKurumin: !expandedSections.certificationSupportKurumin })}>
                      <td className="indent">
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.certificationSupportKurumin ? '▼' : '▶'}
                        </span>くるみん認定取得支援件数（件）
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatNumber(row.certificationSupportKuruminCases || 0, false, '件')}</td>
                      ))}
                      <td className="number-cell total-cell">{formatNumber(totals.certificationSupportKuruminCases || 0, false, '件')}</td>
                    </tr>
                    {expandedSections.certificationSupportKurumin && (
                      <tr>
                        <td className="indent" style={{ paddingLeft: '40px' }}>くるみん認定取得支援</td>
                        {displayData.map((row, index) => {
                          const kuruminRevenue = (row.certificationSupportKuruminCases || 0) * (simulationParams.prices?.certificationSupportKurumin || 100000);
                          return (
                            <td key={index} className="number-cell">{formatCurrency(kuruminRevenue)}</td>
                          );
                        })}
                        <td className="number-cell total-cell">{formatCurrency((totals.certificationSupportKuruminCases || 0) * (simulationParams.prices?.certificationSupportKurumin || 100000))}</td>
                      </tr>
                    )}
                    <tr className="collapsible-row" onClick={() => setExpandedSections({ ...expandedSections, certificationSupportHealthManagement: !expandedSections.certificationSupportHealthManagement })}>
                      <td className="indent">
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.certificationSupportHealthManagement ? '▼' : '▶'}
                        </span>健康経営優良法人認定取得支援件数（件）
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatNumber(row.certificationSupportHealthManagementCases || 0, false, '件')}</td>
                      ))}
                      <td className="number-cell total-cell">{formatNumber(totals.certificationSupportHealthManagementCases || 0, false, '件')}</td>
                    </tr>
                    {expandedSections.certificationSupportHealthManagement && (
                      <tr>
                        <td className="indent" style={{ paddingLeft: '40px' }}>健康経営優良法人認定取得支援</td>
                        {displayData.map((row, index) => {
                          const healthManagementRevenue = (row.certificationSupportHealthManagementCases || 0) * (simulationParams.prices?.certificationSupportHealthManagement || 100000);
                          return (
                            <td key={index} className="number-cell">{formatCurrency(healthManagementRevenue)}</td>
                          );
                        })}
                        <td className="number-cell total-cell">{formatCurrency((totals.certificationSupportHealthManagementCases || 0) * (simulationParams.prices?.certificationSupportHealthManagement || 100000))}</td>
                      </tr>
                    )}
                  </>
                )}
                <tr>
                  <td className="indent">申請代行サービス収入</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell">{formatCurrency(row.applicationAgencyRevenue)}</td>
                  ))}
                  <td className="number-cell total-cell">{formatCurrency(totals.applicationAgencyRevenue)}</td>
                </tr>
                {/* 自治体向け */}
                <tr>
                  <td className="indent">自治体向け売上</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell">{formatCurrency(row.municipalityRevenue)}</td>
                  ))}
                  <td className="number-cell total-cell">{formatCurrency(totals.municipalityRevenue)}</td>
                </tr>
                {expandedSections.revenueDetails && (
                  <>
                    <tr>
                      <td className="indent" style={{ cursor: 'pointer' }} onClick={() => setExpandedSections({ ...expandedSections, municipality: !expandedSections.municipality })}>
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.municipality ? '▼' : '▶'}
                        </span>
                        自治体加入数（累計・件）
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatNumber(row.municipalityCount, false, '件')}</td>
                      ))}
                      <td className="number-cell total-cell">{formatNumber(totals.municipalityCount, false, '件')}</td>
                    </tr>
                    {expandedSections.municipality && (
                      <>
                        <tr>
                          <td className="indent" style={{ paddingLeft: '40px' }}>新規加入数（件）</td>
                          {displayData.map((row, index) => (
                            <td key={index} className="number-cell">{formatNumber(row.newMunicipalityCount, false, '件')}</td>
                          ))}
                          <td className="number-cell total-cell">{formatNumber(totals.newMunicipalityCount, false, '件')}</td>
                        </tr>
                        <tr>
                          <td className="indent" style={{ paddingLeft: '40px' }}>解約数（件）</td>
                          {displayData.map((row, index) => (
                            <td key={index} className="number-cell negative-value">{formatNumber(row.churnedMunicipalityCount, true, '件')}</td>
                          ))}
                          <td className="number-cell total-cell negative-value">{formatNumber(totals.churnedMunicipalityCount, true, '件')}</td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td className="indent" style={{ cursor: 'pointer' }} onClick={() => setExpandedSections({ ...expandedSections, municipalityUsers: !expandedSections.municipalityUsers })}>
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.municipalityUsers ? '▼' : '▶'}
                        </span>
                        自治体利用者数（累計・人）
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatNumber(row.municipalityUsers, false, '人')}</td>
                      ))}
                      <td className="number-cell total-cell">{formatNumber(totals.municipalityUsers, false, '人')}</td>
                    </tr>
                    {expandedSections.municipalityUsers && (
                      <>
                        <tr>
                          <td className="indent" style={{ paddingLeft: '40px' }}>新規利用者数（人）</td>
                          {displayData.map((row, index) => (
                            <td key={index} className="number-cell">{formatNumber(row.newMunicipalityUsers, false, '人')}</td>
                          ))}
                          <td className="number-cell total-cell">{formatNumber(totals.newMunicipalityUsers, false, '人')}</td>
                        </tr>
                        <tr>
                          <td className="indent" style={{ paddingLeft: '40px' }}>解約利用者数（人）</td>
                          {displayData.map((row, index) => (
                            <td key={index} className="number-cell negative-value">{formatNumber(row.churnedMunicipalityUsers, true, '人')}</td>
                          ))}
                          <td className="number-cell total-cell negative-value">{formatNumber(totals.churnedMunicipalityUsers, true, '人')}</td>
                        </tr>
                      </>
                    )}
                  </>
                )}
                <tr>
                  <td className="indent highlight">トータルアクティブユーザー数（人）</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell highlight">{formatNumber(row.activeUsers, false, '人')}</td>
                  ))}
                  <td className="number-cell total-cell highlight">{formatNumber(totals.activeUsers, false, '人')}</td>
                </tr>
                {expandedSections.revenueDetails && (
                  <>
                    <tr className="collapsible-row" onClick={() => setExpandedSections({ ...expandedSections, ecReferralRevenue: !expandedSections.ecReferralRevenue })}>
                      <td className="indent">
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.ecReferralRevenue ? '▼' : '▶'}
                        </span>EC/リファラル関連収入
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralRevenue)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralRevenue)}</td>
                    </tr>
                    {expandedSections.ecReferralRevenue && (
                  <>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>おむつなどの必需品</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralEssentials)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralEssentials)}</td>
                    </tr>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>知育グッズ</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralEducationalGoods)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralEducationalGoods)}</td>
                    </tr>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>健康食品・サプリ</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralHealthFood)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralHealthFood)}</td>
                    </tr>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>健康グッズ</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralHealthGoods)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralHealthGoods)}</td>
                    </tr>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>マタニティグッズ</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralMaternityGoods)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralMaternityGoods)}</td>
                    </tr>
                    </>
                  )}
                    <tr className="collapsible-row" onClick={() => setExpandedSections({ ...expandedSections, medicalRevenue: !expandedSections.medicalRevenue })}>
                      <td className="indent">
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.medicalRevenue ? '▼' : '▶'}
                        </span>医療関連収入
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.medicalRevenue || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.medicalRevenue || 0)}</td>
                    </tr>
                    {expandedSections.medicalRevenue && (
                  <>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>薬</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralMedicine || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralMedicine || 0)}</td>
                    </tr>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>予防接種</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralVaccination || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralVaccination || 0)}</td>
                    </tr>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>アレルギー検査</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralAllergyTest || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralAllergyTest || 0)}</td>
                    </tr>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>遺伝子DNA検査</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralGeneticTest || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralGeneticTest || 0)}</td>
                    </tr>
                    </>
                  )}
                    <tr className="collapsible-row" onClick={() => setExpandedSections({ ...expandedSections, insuranceRevenue: !expandedSections.insuranceRevenue })}>
                      <td className="indent">
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.insuranceRevenue ? '▼' : '▶'}
                        </span>保険関連収入
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.insuranceRevenue || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.insuranceRevenue || 0)}</td>
                    </tr>
                    {expandedSections.insuranceRevenue && (
                  <>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>乳児・児童保険</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralInfantChildInsurance || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralInfantChildInsurance || 0)}</td>
                    </tr>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>学生保険</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralStudentInsurance || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralStudentInsurance || 0)}</td>
                    </tr>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>学業費用保険</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralEducationExpenseInsurance || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralEducationExpenseInsurance || 0)}</td>
                    </tr>
                    </>
                  )}
                    <tr className="collapsible-row" onClick={() => setExpandedSections({ ...expandedSections, renovationRevenue: !expandedSections.renovationRevenue })}>
                      <td className="indent">
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.renovationRevenue ? '▼' : '▶'}
                        </span>リフォーム関連収入
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.renovationRevenue || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.renovationRevenue || 0)}</td>
                    </tr>
                    {expandedSections.renovationRevenue && (
                  <>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>子育て対応リフォーム</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralRenovation || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralRenovation || 0)}</td>
                    </tr>
                    </>
                  )}
                    <tr className="collapsible-row" onClick={() => setExpandedSections({ ...expandedSections, albumRevenue: !expandedSections.albumRevenue })}>
                      <td className="indent">
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.albumRevenue ? '▼' : '▶'}
                        </span>アルバム関連収入
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.albumRevenue || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.albumRevenue || 0)}</td>
                    </tr>
                    {expandedSections.albumRevenue && (
                  <>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>アルバム制作</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralAlbum || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralAlbum || 0)}</td>
                    </tr>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>マタニティフォト</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralMaternityPhoto || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralMaternityPhoto || 0)}</td>
                    </tr>
                    <tr>
                      <td className="indent sub-item" style={{ paddingLeft: '40px' }}>プリント印刷</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.ecReferralPrint || 0)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.ecReferralPrint || 0)}</td>
                    </tr>
                    </>
                  )}
                    <tr>
                      <td className="indent" style={{ cursor: 'pointer' }} onClick={() => setExpandedSections({ ...expandedSections, referralRevenue: !expandedSections.referralRevenue })}>
                        <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                          {expandedSections.referralRevenue ? '▼' : '▶'}
                        </span>紹介手数料収入
                      </td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.referralRevenue)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.referralRevenue)}</td>
                    </tr>
                    {expandedSections.referralRevenue && (
                  <>
                    <tr>
                      <td className="indent" style={{ paddingLeft: '40px' }}>習い事紹介手数料</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.referralLessons)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.referralLessons)}</td>
                    </tr>
                    <tr>
                      <td className="indent" style={{ paddingLeft: '60px', fontStyle: 'italic', color: '#666' }}>習い事成約件数（件）</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(row.conversionLessons, false, '件')}</td>
                      ))}
                      <td className="number-cell total-cell" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(totals.conversionLessons, false, '件')}</td>
                    </tr>
                    <tr>
                      <td className="indent" style={{ paddingLeft: '40px' }}>幼児モデル紹介手数料</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.referralChildModel)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.referralChildModel)}</td>
                    </tr>
                    <tr>
                      <td className="indent" style={{ paddingLeft: '60px', fontStyle: 'italic', color: '#666' }}>幼児モデル成約件数（件）</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(row.conversionChildModel, false, '件')}</td>
                      ))}
                      <td className="number-cell total-cell" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(totals.conversionChildModel, false, '件')}</td>
                    </tr>
                    <tr>
                      <td className="indent" style={{ paddingLeft: '40px' }}>家政婦マッチング紹介手数料</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.referralHousekeeperMatching)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.referralHousekeeperMatching)}</td>
                    </tr>
                    <tr>
                      <td className="indent" style={{ paddingLeft: '60px', fontStyle: 'italic', color: '#666' }}>家政婦マッチング成約件数（件）</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(row.conversionHousekeeperMatching, false, '件')}</td>
                      ))}
                      <td className="number-cell total-cell" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(totals.conversionHousekeeperMatching, false, '件')}</td>
                    </tr>
                    <tr>
                      <td className="indent" style={{ paddingLeft: '40px' }}>専門教師マッチング紹介手数料</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.referralTeacherMatching)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.referralTeacherMatching)}</td>
                    </tr>
                    <tr>
                      <td className="indent" style={{ paddingLeft: '60px', fontStyle: 'italic', color: '#666' }}>専門教師マッチング成約件数（件）</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(row.conversionTeacherMatching, false, '件')}</td>
                      ))}
                      <td className="number-cell total-cell" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(totals.conversionTeacherMatching, false, '件')}</td>
                    </tr>
                    <tr>
                      <td className="indent" style={{ paddingLeft: '40px', fontWeight: 'bold' }}>合計成約件数（件）</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell" style={{ fontWeight: 'bold' }}>{formatNumber(row.totalConversionCount, false, '件')}</td>
                      ))}
                      <td className="number-cell total-cell" style={{ fontWeight: 'bold' }}>{formatNumber(totals.totalConversionCount, false, '件')}</td>
                    </tr>
                    </>
                  )}
                    <tr>
                      <td className="indent">広告収入</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell">{formatCurrency(row.advertisingRevenue)}</td>
                      ))}
                      <td className="number-cell total-cell">{formatCurrency(totals.advertisingRevenue)}</td>
                    </tr>
                  </>
                )}
                <tr className="subtotal-row" style={{ backgroundColor: '#f0f0f0' }}>
                  <td><strong>関連収入合計</strong></td>
                  {displayData.map((row, index) => {
                    const relatedTotal = (row.ecReferralRevenue || 0) + (row.medicalRevenue || 0) + (row.insuranceRevenue || 0) + (row.renovationRevenue || 0) + (row.albumRevenue || 0) + (row.referralRevenue || 0) + (row.advertisingRevenue || 0);
                    return (
                      <td key={index} className="number-cell"><strong>{formatCurrency(relatedTotal)}</strong></td>
                    );
                  })}
                  <td className="number-cell total-cell"><strong>{formatCurrency(totals.relatedRevenueTotal)}</strong></td>
                </tr>
                <tr className="subtotal-row">
                  <td><strong>売上合計</strong></td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell"><strong>{formatCurrency(row.totalRevenue)}</strong></td>
                  ))}
                  <td className="number-cell total-cell"><strong>{formatCurrency(totals.totalRevenue)}</strong></td>
                </tr>

                {/* 売上原価セクション */}
                <tr>
                  <td 
                    rowSpan={sectionRowCounts.cost} 
                    className="section-label-vertical" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpandedSections({ ...expandedSections, costDetails: !expandedSections.costDetails })}
                  >
                    <span style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                      {expandedSections.costDetails ? '▼' : '▶'}
                    </span>
                    <strong>売上原価</strong>
                  </td>
                  <td className="indent">人件費（開発、運用）</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell negative-value">{formatCurrency(row.laborCost, true)}</td>
                  ))}
                  <td className="number-cell total-cell negative-value">{formatCurrency(totals.laborCost, true)}</td>
                </tr>
                <tr className="collapsible-row" onClick={() => setExpandedSections({ ...expandedSections, employeeBreakdown: !expandedSections.employeeBreakdown })}>
                  <td className="indent employee-count-note" style={{ paddingLeft: '20px', fontStyle: 'italic', color: '#666', cursor: 'pointer' }}>
                    <span className="toggle-icon" style={{ marginRight: '8px', display: 'inline-block', width: '16px' }}>
                      {expandedSections.employeeBreakdown ? '▼' : '▶'}
                    </span>
                    従業員数（人）
                  </td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell employee-count-note" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(row.employeeCount, false, '人')}</td>
                  ))}
                  <td className="number-cell total-cell employee-count-note" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(totals.employeeCount, false, '人')}</td>
                </tr>
                {expandedSections.employeeBreakdown && (
                  <>
                    <tr>
                      <td className="indent employee-count-note" style={{ paddingLeft: '40px', fontStyle: 'italic', color: '#666' }}>正社員（人）</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell employee-count-note" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(row.regularEmployeeCount, false, '人')}</td>
                      ))}
                      <td className="number-cell total-cell employee-count-note" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(totals.regularEmployeeCount, false, '人')}</td>
                    </tr>
                    <tr>
                      <td className="indent employee-count-note" style={{ paddingLeft: '40px', fontStyle: 'italic', color: '#666' }}>契約社員（人）</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell employee-count-note" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(row.contractEmployeeCount, false, '人')}</td>
                      ))}
                      <td className="number-cell total-cell employee-count-note" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(totals.contractEmployeeCount, false, '人')}</td>
                    </tr>
                    <tr>
                      <td className="indent employee-count-note" style={{ paddingLeft: '40px', fontStyle: 'italic', color: '#666' }}>派遣（人）</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell employee-count-note" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(row.dispatchedEmployeeCount, false, '人')}</td>
                      ))}
                      <td className="number-cell total-cell employee-count-note" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(totals.dispatchedEmployeeCount, false, '人')}</td>
                    </tr>
                    <tr>
                      <td className="indent employee-count-note" style={{ paddingLeft: '40px', fontStyle: 'italic', color: '#666' }}>業務委託（人）</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell employee-count-note" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(row.outsourcedEmployeeCount, false, '人')}</td>
                      ))}
                      <td className="number-cell total-cell employee-count-note" style={{ fontStyle: 'italic', color: '#666' }}>{formatNumber(totals.outsourcedEmployeeCount, false, '人')}</td>
                    </tr>
                  </>
                )}
                {expandedSections.costDetails && (
                  <>
                    <tr>
                      <td className="indent">EC/リファラル関連収入の売上原価</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell negative-value">{formatCurrency(row.ecReferralCogs || 0, true)}</td>
                      ))}
                      <td className="number-cell total-cell negative-value">{formatCurrency(totals.ecReferralCogs || 0, true)}</td>
                    </tr>
                    <tr>
                      <td className="indent">医療関連収入の売上原価</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell negative-value">{formatCurrency(row.medicalCogs || 0, true)}</td>
                      ))}
                      <td className="number-cell total-cell negative-value">{formatCurrency(totals.medicalCogs || 0, true)}</td>
                    </tr>
                    <tr>
                      <td className="indent">保険関連収入の売上原価</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell negative-value">{formatCurrency(row.insuranceCogs || 0, true)}</td>
                      ))}
                      <td className="number-cell total-cell negative-value">{formatCurrency(totals.insuranceCogs || 0, true)}</td>
                    </tr>
                    <tr>
                      <td className="indent">リフォーム関連収入の売上原価</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell negative-value">{formatCurrency(row.renovationCogs || 0, true)}</td>
                      ))}
                      <td className="number-cell total-cell negative-value">{formatCurrency(totals.renovationCogs || 0, true)}</td>
                    </tr>
                    <tr>
                      <td className="indent">アルバム関連収入の売上原価</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell negative-value">{formatCurrency(row.albumCogs || 0, true)}</td>
                      ))}
                      <td className="number-cell total-cell negative-value">{formatCurrency(totals.albumCogs || 0, true)}</td>
                    </tr>
                    <tr>
                      <td className="indent">紹介手数料収入の売上原価</td>
                      {displayData.map((row, index) => (
                        <td key={index} className="number-cell negative-value">{formatCurrency(row.referralCogs || 0, true)}</td>
                      ))}
                      <td className="number-cell total-cell negative-value">{formatCurrency(totals.referralCogs || 0, true)}</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td className="indent">システム利用料（Google Cloud）</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell negative-value">{formatCurrency(row.systemUsageCost, true)}</td>
                  ))}
                  <td className="number-cell total-cell negative-value">{formatCurrency(totals.systemUsageCost, true)}</td>
                </tr>
                <tr className="subtotal-row" style={{ backgroundColor: '#f0f0f0' }}>
                  <td><strong>関連収入原価合計</strong></td>
                  {displayData.map((row, index) => {
                    const relatedCogsTotal = (row.ecReferralCogs || 0) + (row.medicalCogs || 0) + (row.insuranceCogs || 0) + (row.renovationCogs || 0) + (row.albumCogs || 0) + (row.referralCogs || 0);
                    return (
                      <td key={index} className="number-cell negative-value"><strong>{formatCurrency(relatedCogsTotal, true)}</strong></td>
                    );
                  })}
                  <td className="number-cell total-cell negative-value"><strong>{formatCurrency(totals.relatedCogsTotal, true)}</strong></td>
                </tr>
                <tr className="subtotal-row">
                  <td><strong>売上原価合計</strong></td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell"><strong>{formatCurrency(row.totalCost)}</strong></td>
                  ))}
                  <td className="number-cell total-cell"><strong>{formatCurrency(totals.totalCost)}</strong></td>
                </tr>

                {/* 売上総利益 */}
                <tr className="profit-row">
                  <td></td>
                  <td><strong>売上総利益</strong></td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell"><strong>{formatCurrency(row.grossProfit)}</strong></td>
                  ))}
                  <td className="number-cell total-cell"><strong>{formatCurrency(totals.grossProfit)}</strong></td>
                </tr>

                {/* 販管費セクション */}
                <tr>
                  <td rowSpan={sectionRowCounts.sga} className="section-label-vertical"><strong>販管費</strong></td>
                  <td className="indent">人件費（バックオフィス）</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell negative-value">{formatCurrency(row.backOfficeLaborCost, true)}</td>
                  ))}
                  <td className="number-cell total-cell negative-value">{formatCurrency(totals.backOfficeLaborCost, true)}</td>
                </tr>
                <tr>
                  <td className="indent">交際費</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell negative-value">{formatCurrency(row.entertainmentCost, true)}</td>
                  ))}
                  <td className="number-cell total-cell negative-value">{formatCurrency(totals.entertainmentCost, true)}</td>
                </tr>
                <tr>
                  <td className="indent">広告費</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell negative-value">{formatCurrency(row.advertisingCost, true)}</td>
                  ))}
                  <td className="number-cell total-cell negative-value">{formatCurrency(totals.advertisingCost, true)}</td>
                </tr>
                <tr>
                  <td className="indent">交通費</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell negative-value">{formatCurrency(row.transportationCost, true)}</td>
                  ))}
                  <td className="number-cell total-cell negative-value">{formatCurrency(totals.transportationCost, true)}</td>
                </tr>
                <tr>
                  <td className="indent">その他</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell negative-value">{formatCurrency(row.otherSGA, true)}</td>
                  ))}
                  <td className="number-cell total-cell negative-value">{formatCurrency(totals.otherSGA, true)}</td>
                </tr>
                <tr>
                  <td className="indent">減価償却</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell negative-value">{formatCurrency(row.depreciation, true)}</td>
                  ))}
                  <td className="number-cell total-cell negative-value">{formatCurrency(totals.depreciation, true)}</td>
                </tr>
                <tr className="subtotal-row">
                  <td><strong>販管費合計</strong></td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell negative-value"><strong>{formatCurrency(row.totalSGA, true)}</strong></td>
                  ))}
                  <td className="number-cell total-cell negative-value"><strong>{formatCurrency(totals.totalSGA, true)}</strong></td>
                </tr>

                {/* 営業利益 */}
                <tr className="profit-row">
                  <td></td>
                  <td><strong>営業利益</strong></td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell"><strong>{formatCurrency(row.operatingProfit)}</strong></td>
                  ))}
                  <td className="number-cell total-cell"><strong>{formatCurrency(totals.operatingProfit)}</strong></td>
                </tr>

                {/* 税金 */}
                <tr>
                  <td></td>
                  <td>税金（法人税等）</td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell negative-value">{formatCurrency(row.tax, true)}</td>
                  ))}
                  <td className="number-cell total-cell negative-value">{formatCurrency(totals.tax, true)}</td>
                </tr>

                {/* 税後利益 */}
                <tr className="net-profit-row">
                  <td></td>
                  <td><strong>税後利益</strong></td>
                  {displayData.map((row, index) => (
                    <td key={index} className="number-cell"><strong>{formatCurrency(row.netProfit)}</strong></td>
                  ))}
                  <td className="number-cell total-cell"><strong>{formatCurrency(totals.netProfit)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="specification-section">
            <div className="specification-section-header">
              <h2>加入数推移</h2>
            </div>
            <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
              <ResponsiveContainer>
                <ComposedChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="quarter" 
                    angle={0}
                    textAnchor="middle"
                    height={60}
                    interval={0}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    label={{ value: '人数', angle: -90, position: 'insideLeft' }}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === '個人ユーザー加入数' || name === '企業向け従業員数' || name === '自治体利用者数' || name === 'トータルアクティブユーザー数') {
                        return [formatNumber(value) + '人', name];
                      }
                      return [formatNumber(value), name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="personalUsers" 
                    name="個人ユーザー加入数" 
                    fill="#f59e0b" 
                    stackId="users"
                  />
                  <Bar 
                    dataKey="companyEmployees" 
                    name="企業向け従業員数" 
                    fill="#3b82f6" 
                    stackId="users"
                  />
                  <Bar 
                    dataKey="municipalityUsers" 
                    name="自治体利用者数" 
                    fill="#10b981" 
                    stackId="users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeUsers" 
                    name="トータルアクティブユーザー数" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="specification-section">
            <div className="specification-section-header">
              <h2>売上推移</h2>
              <div className="diagram-controls-top-right">
                <div className="diagram-toggle">
                  <button
                    className={`toggle-button ${unitMode === 'yen' ? 'active' : ''}`}
                    onClick={() => setUnitMode('yen')}
                  >
                    1円単位
                  </button>
                  <button
                    className={`toggle-button ${unitMode === 'thousand' ? 'active' : ''}`}
                    onClick={() => setUnitMode('thousand')}
                  >
                    千円単位
                  </button>
                  <button
                    className={`toggle-button ${unitMode === 'million' ? 'active' : ''}`}
                    onClick={() => setUnitMode('million')}
                  >
                    百万単位
                  </button>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
              <ResponsiveContainer>
                <ComposedChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="quarter" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    label={{ value: `金額${getUnitLabel(true)}`, angle: -90, position: 'insideLeft' }}
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => {
                      const converted = convertUnit(value);
                      if (unitMode === 'million') {
                        return new Intl.NumberFormat('ja-JP', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(Math.abs(converted));
                      } else if (unitMode === 'thousand') {
                        return new Intl.NumberFormat('ja-JP', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(Math.abs(converted));
                      } else {
                        return new Intl.NumberFormat('ja-JP').format(Math.abs(Math.floor(converted)));
                      }
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar 
                    dataKey="personalRevenue" 
                    name="個人ユーザー売上" 
                    fill="#f59e0b" 
                    stackId="revenue"
                  />
                  <Bar 
                    dataKey="companyRevenue" 
                    name="企業向け売上" 
                    fill="#3b82f6" 
                    stackId="revenue"
                  />
                  <Bar 
                    dataKey="municipalityRevenue" 
                    name="自治体向け売上" 
                    fill="#10b981" 
                    stackId="revenue"
                  />
                  <Bar 
                    dataKey="ecReferralRevenue" 
                    name="EC/リファラル関連収入" 
                    fill="#ec4899" 
                    stackId="revenue"
                  />
                  <Bar 
                    dataKey="medicalRevenue" 
                    name="医療関連収入" 
                    fill="#a855f7" 
                    stackId="revenue"
                  />
                  <Bar 
                    dataKey="insuranceRevenue" 
                    name="保険関連収入" 
                    fill="#6366f1" 
                    stackId="revenue"
                  />
                  <Bar 
                    dataKey="referralRevenue" 
                    name="紹介手数料収入" 
                    fill="#f97316" 
                    stackId="revenue"
                  />
                  <Bar 
                    dataKey="advertisingRevenue" 
                    name="広告収入" 
                    fill="#14b8a6" 
                    stackId="revenue"
                  />
                  <Bar 
                    dataKey="applicationAgencyRevenue" 
                    name="申請代行サービス収入" 
                    fill="#06b6d4" 
                    stackId="revenue"
                  />
                  <Bar 
                    dataKey="certificationSupportRevenue" 
                    name="認定取得支援収入" 
                    fill="#84cc16" 
                    stackId="revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalRevenue" 
                    name="売上合計" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="specification-section">
            <div className="specification-section-header">
              <h2>売上総利益推移</h2>
              <div className="diagram-controls-top-right">
                <div className="diagram-toggle">
                  <button
                    className={`toggle-button ${unitMode === 'yen' ? 'active' : ''}`}
                    onClick={() => setUnitMode('yen')}
                  >
                    1円単位
                  </button>
                  <button
                    className={`toggle-button ${unitMode === 'thousand' ? 'active' : ''}`}
                    onClick={() => setUnitMode('thousand')}
                  >
                    千円単位
                  </button>
                  <button
                    className={`toggle-button ${unitMode === 'million' ? 'active' : ''}`}
                    onClick={() => setUnitMode('million')}
                  >
                    百万単位
                  </button>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
              <ResponsiveContainer>
                <LineChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="quarter" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    label={{ value: `金額${getUnitLabel(true)}`, angle: -90, position: 'insideLeft' }}
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => {
                      const converted = convertUnit(value);
                      if (unitMode === 'million') {
                        return new Intl.NumberFormat('ja-JP', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(Math.abs(converted));
                      } else if (unitMode === 'thousand') {
                        return new Intl.NumberFormat('ja-JP', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(Math.abs(converted));
                      } else {
                        return new Intl.NumberFormat('ja-JP').format(Math.abs(Math.floor(converted)));
                      }
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="grossProfit" 
                    name="売上総利益" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="specification-section">
            <div className="specification-section-header">
              <h2>税後利益推移</h2>
              <div className="diagram-controls-top-right">
                <div className="diagram-toggle">
                  <button
                    className={`toggle-button ${unitMode === 'yen' ? 'active' : ''}`}
                    onClick={() => setUnitMode('yen')}
                  >
                    1円単位
                  </button>
                  <button
                    className={`toggle-button ${unitMode === 'thousand' ? 'active' : ''}`}
                    onClick={() => setUnitMode('thousand')}
                  >
                    千円単位
                  </button>
                  <button
                    className={`toggle-button ${unitMode === 'million' ? 'active' : ''}`}
                    onClick={() => setUnitMode('million')}
                  >
                    百万単位
                  </button>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
              <ResponsiveContainer>
                <LineChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="quarter" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    label={{ value: `金額${getUnitLabel(true)}`, angle: -90, position: 'insideLeft' }}
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => {
                      const converted = convertUnit(value);
                      if (unitMode === 'million') {
                        return new Intl.NumberFormat('ja-JP', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(Math.abs(converted));
                      } else if (unitMode === 'thousand') {
                        return new Intl.NumberFormat('ja-JP', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(Math.abs(converted));
                      } else {
                        return new Intl.NumberFormat('ja-JP').format(Math.abs(Math.floor(converted)));
                      }
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="netProfit" 
                    name="税後利益" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="specification-section">
            <h2>主要指標の説明</h2>
            <ul>
              <li><strong>個人ユーザー加入数</strong>：プレミアムプランに加入している個人ユーザー数</li>
              <li><strong>企業向け導入数</strong>：福利厚生として導入している企業数</li>
              <li><strong>自治体加入数</strong>：住民向けサービスとして導入している自治体数</li>
              <li><strong>トータルアクティブユーザー数</strong>：個人ユーザー、企業従業員、自治体住民の合計</li>
              <li><strong>EC/リファラル関連収入</strong>：ECサイトへのリンクからのアフィリエイト手数料など</li>
              <li><strong>紹介手数料収入</strong>：知育・塾パートナーからの紹介手数料</li>
            </ul>
          </div>
        </div>
      </div>

      {showSimulationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #eee'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>シミュレーションパラメーター</h2>
              <button
                onClick={() => setShowSimulationModal(false)}
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

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '24px',
              overflowY: 'auto',
              flex: 1,
              paddingRight: '8px'
            }}>
              {/* 年度末の目標アクティブユーザー数 */}
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>年度末の目標アクティブユーザー数</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
                  {years.map(year => (
                    <div key={year}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                        {getYearLabel(year)}
                      </label>
                      <input
                        type="number"
                        value={simulationParams.yearlyTargets[year]}
                        onChange={(e) => setSimulationParams({
                          ...simulationParams,
                          yearlyTargets: {
                            ...simulationParams.yearlyTargets,
                            [year]: parseInt(e.target.value) || 0
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ユーザー構成比 */}
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>ユーザー構成比（合計が1.0になるように設定）</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>カテゴリ</th>
                        {years.map(year => (
                          <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'personalFree', label: '個人無料 (%)' },
                        { key: 'personalPremium', label: '個人プレミアム (%)' },
                        { key: 'company', label: '企業 (%)' },
                        { key: 'municipality', label: '自治体 (%)' }
                      ].map((category, categoryIndex) => (
                        <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                          <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                          {years.map(year => {
                            const yearRatios = simulationParams.userRatios[year] || {
                              personalFree: 0.50,
                              personalPremium: 0.05,
                              municipality: 0.30,
                              company: 0.15
                            };
                            return (
                              <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={(yearRatios[category.key] * 100).toFixed(1)}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) / 100 || 0;
                                    setSimulationParams({
                                      ...simulationParams,
                                      userRatios: {
                                        ...simulationParams.userRatios,
                                        [year]: {
                                          ...yearRatios,
                                          [category.key]: val
                                        }
                                      }
                                    });
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '4px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    textAlign: 'center'
                                  }}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#f3f4f6', fontWeight: '600' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '600' }}>合計 (%)</td>
                            {years.map(year => {
                          const yearRatios = simulationParams.userRatios[year] || {
                            personalFree: 0.50,
                            personalPremium: 0.05,
                            municipality: 0.30,
                            company: 0.15
                          };
                          const total = (yearRatios.personalFree + yearRatios.personalPremium + yearRatios.municipality + yearRatios.company) * 100;
                          return (
                            <td key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600', color: total === 100 ? '#000' : '#dc2626' }}>
                              {total.toFixed(1)}%
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* アクティブユーザー数プレビュー */}
              <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>アクティブユーザー数プレビュー</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>カテゴリ</th>
                        {years.map(year => (
                          <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'personalFree', label: '個人無料（人）' },
                        { key: 'personalPremium', label: '個人プレミアム（人）' },
                        { key: 'companyCount', label: '導入企業数（社）' },
                        { key: 'company', label: '企業従業員数（人）' },
                        { key: 'municipalityCount', label: '自治体数（件）' },
                        { key: 'municipality', label: '自治体利用者数（人）' },
                        { key: 'total', label: '合計アクティブユーザー数（人）', isTotal: true }
                      ].map((category, categoryIndex) => (
                        <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                          <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: category.isTotal ? '600' : '500' }}>{category.label}</td>
                          {years.map(year => {
                            // 目標アクティブユーザー数を取得
                            const targetActiveUsers = simulationParams.yearlyTargets[year] || 0;
                            
                            // その年のユーザー構成比を取得
                            const yearRatios = simulationParams.userRatios?.[year] || {
                              personalFree: 0.50,
                              personalPremium: 0.05,
                              municipality: 0.30,
                              company: 0.15
                            };
                            
                            let value;
                            if (category.key === 'total') {
                              // 合計は各カテゴリーの合計
                              const personalFree = Math.floor(targetActiveUsers * yearRatios.personalFree);
                              const personalPremium = Math.floor(targetActiveUsers * yearRatios.personalPremium);
                              const company = Math.floor(targetActiveUsers * yearRatios.company);
                              const municipality = Math.floor(targetActiveUsers * yearRatios.municipality);
                              value = personalFree + personalPremium + company + municipality;
                            } else if (category.key === 'companyCount') {
                              // 導入企業数 = 企業従業員数 ÷ 20（切り上げ）
                              const companyEmployees = Math.floor(targetActiveUsers * yearRatios.company);
                              value = Math.ceil(companyEmployees / 20);
                            } else if (category.key === 'municipalityCount') {
                              // 自治体数 = 自治体利用者数 ÷ 100（切り上げ）
                              const municipalityUsers = Math.floor(targetActiveUsers * yearRatios.municipality);
                              value = Math.ceil(municipalityUsers / 100);
                            } else {
                              // 各カテゴリーは目標アクティブユーザー数 × 構成比
                              value = Math.floor(targetActiveUsers * yearRatios[category.key]);
                            }
                            
                            return (
                              <td key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: category.isTotal ? '600' : 'normal' }}>
                                {value.toLocaleString()}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 解約率 */}
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>解約率（年間）</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>カテゴリ</th>
                        {years.map(year => (
                          <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'personalFree', label: '個人無料 (%)' },
                        { key: 'personalPremium', label: '個人プレミアム (%)' },
                        { key: 'company', label: '企業 (%)' },
                        { key: 'municipality', label: '自治体 (%)' }
                      ].map((category, categoryIndex) => (
                        <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                          <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                          {years.map(year => {
                            const yearChurnRates = simulationParams.churnRates?.[year] || {
                              personalFree: simulationParams.churnRate || 0.24,
                              personalPremium: simulationParams.churnRate || 0.24,
                              company: simulationParams.companyChurnRate || 0.02,
                              municipality: 0.02
                            };
                            return (
                              <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="100"
                                  value={(yearChurnRates[category.key] * 100).toFixed(1)}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val) && val >= 0 && val <= 100) {
                                      setSimulationParams({
                                        ...simulationParams,
                                        churnRates: {
                                          ...(simulationParams.churnRates || {}),
                                          [year]: {
                                            ...yearChurnRates,
                                            [category.key]: val / 100
                                          }
                                        }
                                      });
                                    } else if (e.target.value === '') {
                                      setSimulationParams({
                                        ...simulationParams,
                                        churnRates: {
                                          ...(simulationParams.churnRates || {}),
                                          [year]: {
                                            ...yearChurnRates,
                                            [category.key]: 0
                                          }
                                        }
                                      });
                                    }
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '4px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    textAlign: 'center'
                                  }}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 解約数の上限 */}
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>解約数の上限（年間）</h3>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                  未設定（null）の場合は上限なし。企業は社数、その他は人数/件数で設定してください。
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>カテゴリ</th>
                        {years.map(year => (
                          <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'personalFree', label: '個人無料（人）' },
                        { key: 'personalPremium', label: '個人プレミアム（人）' },
                        { key: 'company', label: '企業（社）' },
                        { key: 'municipality', label: '自治体（件）' }
                      ].map((category, categoryIndex) => (
                        <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                          <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                          {years.map(year => {
                            const yearMaxChurned = simulationParams.maxChurnedCounts?.[year] || {
                              personalFree: null,
                              personalPremium: null,
                              company: simulationParams.maxChurnedCompanyCountPerYear || 20,
                              municipality: null
                            };
                            return (
                              <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="上限なし"
                                  value={yearMaxChurned[category.key] === null ? '' : yearMaxChurned[category.key]}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? null : parseInt(e.target.value) || 0;
                                    setSimulationParams({
                                      ...simulationParams,
                                      maxChurnedCounts: {
                                        ...(simulationParams.maxChurnedCounts || {}),
                                        [year]: {
                                          ...yearMaxChurned,
                                          [category.key]: val
                                        }
                                      }
                                    });
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '4px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    textAlign: 'center'
                                  }}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 従業員数の設定 */}
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>従業員数の設定</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>カテゴリ</th>
                        {years.map(year => (
                          <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'regularEmployees', label: '正社員数（人）' },
                        { key: 'contractEmployees', label: '契約社員数（人）' },
                        { key: 'dispatchedEmployees', label: '派遣数（人）' },
                        { key: 'outsourcedEmployees', label: '業務委託数（人）' }
                      ].map((category, categoryIndex) => (
                        <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                          <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                          {years.map(year => {
                            const yearSettings = simulationParams.employeeSettings?.[year] || {
                              regularEmployees: simulationParams.regularEmployeeCounts?.[year] || null,
                              contractEmployees: null,
                              dispatchedEmployees: null,
                              outsourcedEmployees: null
                            };
                            const isNullable = ['regularEmployees', 'contractEmployees', 'dispatchedEmployees', 'outsourcedEmployees'].includes(category.key);
                            return (
                              <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder={isNullable ? '未設定' : '0'}
                                    value={yearSettings[category.key] === null ? '' : yearSettings[category.key]}
                                    onChange={(e) => {
                                      const val = isNullable
                                        ? (e.target.value === '' ? null : parseInt(e.target.value) || 0)
                                        : parseInt(e.target.value) || 0;
                                      setSimulationParams({
                                        ...simulationParams,
                                        employeeSettings: {
                                          ...(simulationParams.employeeSettings || {}),
                                          [year]: {
                                            ...yearSettings,
                                            [category.key]: val
                                          }
                                        }
                                      });
                                    }}
                                    style={{
                                      flex: 1,
                                      padding: '4px',
                                      border: '1px solid #ddd',
                                      borderRadius: '4px',
                                      fontSize: '14px',
                                      textAlign: 'right'
                                    }}
                                  />
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentValue = yearSettings[category.key] === null ? 0 : yearSettings[category.key];
                                        const newValue = currentValue + 1;
                                        setSimulationParams({
                                          ...simulationParams,
                                          employeeSettings: {
                                            ...(simulationParams.employeeSettings || {}),
                                            [year]: {
                                              ...yearSettings,
                                              [category.key]: isNullable ? newValue : newValue
                                            }
                                          }
                                        });
                                      }}
                                      style={{
                                        padding: '2px 4px',
                                        border: '1px solid #ddd',
                                        borderRadius: '2px',
                                        backgroundColor: '#f9fafb',
                                        cursor: 'pointer',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: '#666',
                                        lineHeight: '1',
                                        minWidth: '20px'
                                      }}
                                    >
                                      ▲
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentValue = yearSettings[category.key] === null ? 0 : yearSettings[category.key];
                                        const newValue = Math.max(0, currentValue - 1);
                                        setSimulationParams({
                                          ...simulationParams,
                                          employeeSettings: {
                                            ...(simulationParams.employeeSettings || {}),
                                            [year]: {
                                              ...yearSettings,
                                              [category.key]: isNullable && newValue === 0 ? null : newValue
                                            }
                                          }
                                        });
                                      }}
                                      style={{
                                        padding: '2px 4px',
                                        border: '1px solid #ddd',
                                        borderRadius: '2px',
                                        backgroundColor: '#f9fafb',
                                        cursor: 'pointer',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: '#666',
                                        lineHeight: '1',
                                        minWidth: '20px'
                                      }}
                                    >
                                      ▼
                                    </button>
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 価格設定 */}
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>価格設定</h3>
                
                {/* サブスクリプション料金 */}
                <div style={{ marginBottom: '20px', maxWidth: '600px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '500', color: '#555' }}>サブスクリプション料金</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* 個人 */}
                    <div>
                      <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#666' }}>個人</h5>
                      <div style={{ maxWidth: '300px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                          個人プレミアム月額（円）
                        </label>
                        <input
                          type="number"
                          value={simulationParams.prices.personalPremiumMonthly}
                          onChange={(e) => setSimulationParams({
                            ...simulationParams,
                            prices: {
                              ...simulationParams.prices,
                              personalPremiumMonthly: parseInt(e.target.value) || 0
                            }
                          })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* 企業 */}
                    <div>
                      <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#666' }}>企業</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                            企業向けベース年間料金（円）
                          </label>
                          <input
                            type="number"
                            value={simulationParams.prices.companyBaseAnnual || 50000}
                            onChange={(e) => setSimulationParams({
                              ...simulationParams,
                              prices: {
                                ...simulationParams.prices,
                                companyBaseAnnual: parseInt(e.target.value) || 0
                              }
                            })}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                            企業向け月額/アクティブユーザー（円）
                          </label>
                          <input
                            type="number"
                            value={simulationParams.prices.companyMonthlyPerActiveUser || 500}
                            onChange={(e) => setSimulationParams({
                              ...simulationParams,
                              prices: {
                                ...simulationParams.prices,
                                companyMonthlyPerActiveUser: parseInt(e.target.value) || 0
                              }
                            })}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* 自治体 */}
                    <div>
                      <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#666' }}>自治体</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                            自治体向けベース年間料金（円）
                          </label>
                          <input
                            type="number"
                            value={simulationParams.prices.municipalityBaseAnnual || 100000}
                            onChange={(e) => setSimulationParams({
                              ...simulationParams,
                              prices: {
                                ...simulationParams.prices,
                                municipalityBaseAnnual: parseInt(e.target.value) || 0
                              }
                            })}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                            自治体向け月額/アクティブユーザー（円）
                          </label>
                          <input
                            type="number"
                            value={simulationParams.prices.municipalityMonthlyPerActiveUser || 300}
                            onChange={(e) => setSimulationParams({
                              ...simulationParams,
                              prices: {
                                ...simulationParams.prices,
                                municipalityMonthlyPerActiveUser: parseInt(e.target.value) || 0
                              }
                            })}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 広告・申請代行 */}
                <div style={{ marginBottom: '20px', maxWidth: '600px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '500', color: '#555' }}>広告・申請代行</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                        広告収入月額（円/広告主）
                      </label>
                      <input
                        type="number"
                        value={simulationParams.prices.advertisingMonthly}
                        onChange={(e) => setSimulationParams({
                          ...simulationParams,
                          prices: {
                            ...simulationParams.prices,
                            advertisingMonthly: parseInt(e.target.value) || 0
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                        申請代行サービス1件あたり（円）
                      </label>
                      <input
                        type="number"
                        value={simulationParams.prices.applicationAgencyPerCase}
                        onChange={(e) => setSimulationParams({
                          ...simulationParams,
                          prices: {
                            ...simulationParams.prices,
                            applicationAgencyPerCase: parseInt(e.target.value) || 0
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 紹介手数料 */}
                <div style={{ marginBottom: '20px', maxWidth: '600px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '500', color: '#555' }}>紹介手数料（1件あたり）</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                        習い事（円）
                      </label>
                      <input
                        type="number"
                        value={simulationParams.prices.referralFeeLessons}
                        onChange={(e) => setSimulationParams({
                          ...simulationParams,
                          prices: {
                            ...simulationParams.prices,
                            referralFeeLessons: parseInt(e.target.value) || 0
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                        幼児モデル（円）
                      </label>
                      <input
                        type="number"
                        value={simulationParams.prices.referralFeeChildModel}
                        onChange={(e) => setSimulationParams({
                          ...simulationParams,
                          prices: {
                            ...simulationParams.prices,
                            referralFeeChildModel: parseInt(e.target.value) || 0
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                        家政婦マッチング（円）
                      </label>
                      <input
                        type="number"
                        value={simulationParams.prices.referralFeeHousekeeperMatching}
                        onChange={(e) => setSimulationParams({
                          ...simulationParams,
                          prices: {
                            ...simulationParams.prices,
                            referralFeeHousekeeperMatching: parseInt(e.target.value) || 0
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                        専門教師マッチング（円）
                      </label>
                      <input
                        type="number"
                        value={simulationParams.prices.referralFeeTeacherMatching}
                        onChange={(e) => setSimulationParams({
                          ...simulationParams,
                          prices: {
                            ...simulationParams.prices,
                            referralFeeTeacherMatching: parseInt(e.target.value) || 0
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 紹介手数料の成約件数 */}
                <div>
                  <h4 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '500', color: '#555' }}>紹介手数料の成約件数（年間）</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>カテゴリ</th>
                          {years.map(year => (
                            <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'lessons', label: '習い事（件）' },
                          { key: 'childModel', label: '幼児モデル（件）' },
                          { key: 'housekeeperMatching', label: '家政婦マッチング（件）' },
                          { key: 'teacherMatching', label: '専門教師マッチング（件）' }
                        ].map((category, categoryIndex) => (
                          <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                            {years.map(year => {
                              const yearMaxConversions = simulationParams.maxReferralConversionCounts?.[year] || {
                                lessons: year === 2026 ? 0 : 1000,
                                childModel: year === 2026 ? 0 : 100,
                                housekeeperMatching: year === 2026 ? 0 : 500,
                                teacherMatching: year === 2026 ? 0 : 100
                              };
                              return (
                                <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <input
                                      type="number"
                                      min="0"
                                      value={yearMaxConversions[category.key]}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setSimulationParams({
                                          ...simulationParams,
                                          maxReferralConversionCounts: {
                                            ...(simulationParams.maxReferralConversionCounts || {}),
                                            [year]: {
                                              ...yearMaxConversions,
                                              [category.key]: val
                                            }
                                          }
                                        });
                                      }}
                                      style={{
                                        flex: 1,
                                        padding: '4px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        textAlign: 'right'
                                      }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentValue = yearMaxConversions[category.key] || 0;
                                          const newValue = currentValue + 10;
                                          setSimulationParams({
                                            ...simulationParams,
                                            maxReferralConversionCounts: {
                                              ...(simulationParams.maxReferralConversionCounts || {}),
                                              [year]: {
                                                ...yearMaxConversions,
                                                [category.key]: newValue
                                              }
                                            }
                                          });
                                        }}
                                        style={{
                                          padding: '2px 4px',
                                          border: '1px solid #ddd',
                                          borderRadius: '2px',
                                          backgroundColor: '#f9fafb',
                                          cursor: 'pointer',
                                          fontSize: '10px',
                                          fontWeight: '600',
                                          color: '#666',
                                          lineHeight: '1',
                                          minWidth: '20px'
                                        }}
                                      >
                                        ▲
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentValue = yearMaxConversions[category.key] || 0;
                                          const newValue = Math.max(0, currentValue - 10);
                                          setSimulationParams({
                                            ...simulationParams,
                                            maxReferralConversionCounts: {
                                              ...(simulationParams.maxReferralConversionCounts || {}),
                                              [year]: {
                                                ...yearMaxConversions,
                                                [category.key]: newValue
                                              }
                                            }
                                          });
                                        }}
                                        style={{
                                          padding: '2px 4px',
                                          border: '1px solid #ddd',
                                          borderRadius: '2px',
                                          backgroundColor: '#f9fafb',
                                          cursor: 'pointer',
                                          fontSize: '10px',
                                          fontWeight: '600',
                                          color: '#666',
                                          lineHeight: '1',
                                          minWidth: '20px'
                                        }}
                                      >
                                        ▼
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ECリファラルの成約率（パーセンテージ） */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '500', color: '#555' }}>ECリファラルの成約率（アクティブユーザー数に対する％）</h4>
                  <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                    未設定（空欄）の場合は自動計算されます。成約件数は予測プレビューで確認できます。
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>カテゴリ</th>
                          {years.map(year => (
                            <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'essentials', label: 'おむつなどの必需品（％）' },
                          { key: 'educationalGoods', label: '知育グッズ（％）' },
                          { key: 'healthFood', label: '健康食品・サプリ（％）' },
                          { key: 'healthGoods', label: '健康グッズ（％）' },
                          { key: 'maternityGoods', label: 'マタニティグッズ（％）' }
                        ].map((category, categoryIndex) => (
                          <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                            {years.map(year => {
                              const yearSettings = simulationParams.ecReferralSettings?.[year] || {
                                conversionRates: {
                                  essentials: null,
                                  educationalGoods: null,
                                  healthFood: null,
                                  healthGoods: null,
                                  maternityGoods: null
                                },
                                prices: {
                                  essentials: 1000,
                                  educationalGoods: 2000,
                                  healthFood: 3000,
                                  healthGoods: 1500,
                                  maternityGoods: 2500
                                }
                              };
                              return (
                                <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="自動計算"
                                    value={yearSettings.conversionRates[category.key] === null ? '' : yearSettings.conversionRates[category.key]}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? null : parseFloat(e.target.value) || 0;
                                      setSimulationParams({
                                        ...simulationParams,
                                        ecReferralSettings: {
                                          ...(simulationParams.ecReferralSettings || {}),
                                          [year]: {
                                            ...yearSettings,
                                            conversionRates: {
                                              ...yearSettings.conversionRates,
                                              [category.key]: val
                                            }
                                          }
                                        }
                                      });
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '4px',
                                      border: '1px solid #ddd',
                                      borderRadius: '4px',
                                      fontSize: '14px',
                                      textAlign: 'center'
                                    }}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ECリファラル成約件数プレビュー */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '500', color: '#555' }}>ECリファラル成約件数プレビュー</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>カテゴリ</th>
                          {years.map(year => (
                            <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'essentials', label: 'おむつなどの必需品（件）' },
                          { key: 'educationalGoods', label: '知育グッズ（件）' },
                          { key: 'healthFood', label: '健康食品・サプリ（件）' },
                          { key: 'healthGoods', label: '健康グッズ（件）' },
                          { key: 'maternityGoods', label: 'マタニティグッズ（件）' }
                        ].map((category, categoryIndex) => (
                          <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                            {years.map(year => {
                              // 目標アクティブユーザー数を取得
                              const targetActiveUsers = simulationParams.yearlyTargets[year] || 0;
                              
                              // その年のユーザー構成比を取得
                              const yearRatios = simulationParams.userRatios?.[year] || {
                                personalFree: 0.50,
                                personalPremium: 0.05,
                                municipality: 0.30,
                                company: 0.15
                              };
                              
                              // 合計アクティブユーザー数を計算
                              const personalFree = Math.floor(targetActiveUsers * yearRatios.personalFree);
                              const personalPremium = Math.floor(targetActiveUsers * yearRatios.personalPremium);
                              const company = Math.floor(targetActiveUsers * yearRatios.company);
                              const municipality = Math.floor(targetActiveUsers * yearRatios.municipality);
                              const totalActiveUsers = personalFree + personalPremium + company + municipality;
                              
                              // ECリファラルの成約率を取得
                              const yearEcReferralSettings = simulationParams.ecReferralSettings?.[year] || {
                                conversionRates: {
                                  essentials: 1,
                                  educationalGoods: 1,
                                  healthFood: 1,
                                  healthGoods: 1,
                                  maternityGoods: 1
                                },
                                prices: {
                                  essentials: 1000,
                                  educationalGoods: 2000,
                                  healthFood: 3000,
                                  healthGoods: 1500,
                                  maternityGoods: 2500
                                }
                              };
                              
                              // 成約件数 = アクティブユーザー数 × 成約率（％） / 100
                              const conversionRate = yearEcReferralSettings.conversionRates[category.key] || 0;
                              const conversionCount = Math.floor(totalActiveUsers * conversionRate / 100);
                              
                              return (
                                <td key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                                  {conversionCount.toLocaleString()}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ECリファラルの単価 */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '500', color: '#555' }}>ECリファラルの単価（1件あたり）</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>カテゴリ</th>
                          {years.map(year => (
                            <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'essentials', label: 'おむつなどの必需品（円）' },
                          { key: 'educationalGoods', label: '知育グッズ（円）' },
                          { key: 'healthFood', label: '健康食品・サプリ（円）' },
                          { key: 'healthGoods', label: '健康グッズ（円）' },
                          { key: 'maternityGoods', label: 'マタニティグッズ（円）' }
                        ].map((category, categoryIndex) => (
                          <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                            {years.map(year => {
                              const yearSettings = simulationParams.ecReferralSettings?.[year] || {
                                conversions: {
                                  essentials: null,
                                  educationalGoods: null,
                                  healthFood: null,
                                  healthGoods: null,
                                  maternityGoods: null
                                },
                                prices: {
                                  essentials: 1000,
                                  educationalGoods: 2000,
                                  healthFood: 3000,
                                  healthGoods: 1500,
                                  maternityGoods: 2500
                                }
                              };
                              return (
                                <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={yearSettings.prices[category.key]}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setSimulationParams({
                                          ...simulationParams,
                                          ecReferralSettings: {
                                            ...(simulationParams.ecReferralSettings || {}),
                                            [year]: {
                                              ...yearSettings,
                                              prices: {
                                                ...yearSettings.prices,
                                                [category.key]: val
                                              }
                                            }
                                          }
                                        });
                                      }}
                                      style={{
                                        flex: 1,
                                        padding: '4px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        textAlign: 'right'
                                      }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentValue = yearSettings.prices[category.key] || 0;
                                          const newValue = currentValue + 100;
                                          setSimulationParams({
                                            ...simulationParams,
                                            ecReferralSettings: {
                                              ...(simulationParams.ecReferralSettings || {}),
                                              [year]: {
                                                ...yearSettings,
                                                prices: {
                                                  ...yearSettings.prices,
                                                  [category.key]: newValue
                                                }
                                              }
                                            }
                                          });
                                        }}
                                        style={{
                                          padding: '2px 4px',
                                          border: '1px solid #ddd',
                                          borderRadius: '2px',
                                          backgroundColor: '#f9fafb',
                                          cursor: 'pointer',
                                          fontSize: '10px',
                                          fontWeight: '600',
                                          color: '#666',
                                          lineHeight: '1',
                                          minWidth: '20px'
                                        }}
                                      >
                                        ▲
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentValue = yearSettings.prices[category.key] || 0;
                                          const newValue = Math.max(0, currentValue - 100);
                                          setSimulationParams({
                                            ...simulationParams,
                                            ecReferralSettings: {
                                              ...(simulationParams.ecReferralSettings || {}),
                                              [year]: {
                                                ...yearSettings,
                                                prices: {
                                                  ...yearSettings.prices,
                                                  [category.key]: newValue
                                                }
                                              }
                                            }
                                          });
                                        }}
                                        style={{
                                          padding: '2px 4px',
                                          border: '1px solid #ddd',
                                          borderRadius: '2px',
                                          backgroundColor: '#f9fafb',
                                          cursor: 'pointer',
                                          fontSize: '10px',
                                          fontWeight: '600',
                                          color: '#666',
                                          lineHeight: '1',
                                          minWidth: '20px'
                                        }}
                                      >
                                        ▼
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid #eee'
            }}>
              <button
                onClick={() => setShowSimulationModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  setSimulationKey(prev => prev + 1);
                  setShowSimulationModal(false);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#5568d3';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#667eea';
                }}
              >
                計算して反映
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* スナップショット保存モーダル */}
      {showSnapshotSaveModal && (
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
            onClick={() => {
              setShowSnapshotSaveModal(false);
              setSnapshotName('');
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: `${snapshotSaveModalPosition.top}px`,
              left: `${snapshotSaveModalPosition.left}px`,
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '400px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              transform: 'translateX(-50%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
              スナップショットを保存
            </h3>
            <input
              type="text"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              placeholder="スナップショット名を入力"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '16px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveSnapshot();
                }
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowSnapshotSaveModal(false);
                  setSnapshotName('');
                }}
                style={{
                  padding: '8px 16px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveSnapshot}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                保存
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpecificationBusinessPlanDetail;

