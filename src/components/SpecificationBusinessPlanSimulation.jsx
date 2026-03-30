import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Specification.css';

const SpecificationBusinessPlanSimulation = () => {
  const navigate = useNavigate();
  
  // localStorageから初期値を読み込む関数
  const getInitialSimulationParams = () => {
    const saved = localStorage.getItem('businessPlanSimulationParams');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 新しいフィールドが存在しない場合はデフォルト値をマージ
        return {
          ...getDefaultSimulationParams(),
          ...parsed,
          // ネストされたオブジェクトもマージ
          yearlyTargets: { ...getDefaultSimulationParams().yearlyTargets, ...(parsed.yearlyTargets || {}) },
          userRatios: { ...getDefaultSimulationParams().userRatios, ...(parsed.userRatios || {}) },
          churnRates: { ...getDefaultSimulationParams().churnRates, ...(parsed.churnRates || {}) },
          maxChurnedCounts: { ...getDefaultSimulationParams().maxChurnedCounts, ...(parsed.maxChurnedCounts || {}) },
          maxNewCounts: { ...getDefaultSimulationParams().maxNewCounts, ...(parsed.maxNewCounts || {}) },
          employeeSettings: { ...getDefaultSimulationParams().employeeSettings, ...(parsed.employeeSettings || {}) },
          prices: { ...getDefaultSimulationParams().prices, ...(parsed.prices || {}) },
          maxReferralConversionCounts: { ...getDefaultSimulationParams().maxReferralConversionCounts, ...(parsed.maxReferralConversionCounts || {}) },
          certificationSupportCounts: { ...getDefaultSimulationParams().certificationSupportCounts, ...(parsed.certificationSupportCounts || {}) },
          ecReferralSettings: { ...getDefaultSimulationParams().ecReferralSettings, ...(parsed.ecReferralSettings || {}) },
          sgaSettings: { ...getDefaultSimulationParams().sgaSettings, ...(parsed.sgaSettings || {}) },
          systemUsageSettings: { ...getDefaultSimulationParams().systemUsageSettings, ...(parsed.systemUsageSettings || {}) },
          employeeSalarySettings: { ...getDefaultSimulationParams().employeeSalarySettings, ...(parsed.employeeSalarySettings || {}) }
        };
      } catch (e) {
        console.error('Failed to parse simulation params:', e);
        return getDefaultSimulationParams();
      }
    }
    return getDefaultSimulationParams();
  };

  // デフォルト値を返す関数
  const getDefaultSimulationParams = () => ({
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
      2030: { personalFree: null, personalPremium: null, company: 20, municipality: null },
      2031: { personalFree: null, personalPremium: null, company: 20, municipality: null },
      2032: { personalFree: null, personalPremium: null, company: 20, municipality: null }
    },
    // 後方互換性のため残す（非推奨）
    maxChurnedCompanyCountPerYear: 20,
    // 新規導入数の上限（年ごと、カテゴリーごと）
    maxNewCounts: {
      2026: { personalFree: null, personalPremium: null, company: 20, municipality: null },
      2027: { personalFree: null, personalPremium: null, company: 100, municipality: null },
      2028: { personalFree: null, personalPremium: null, company: 500, municipality: null },
      2029: { personalFree: null, personalPremium: null, company: null, municipality: null },
      2030: { personalFree: null, personalPremium: null, company: 1500, municipality: null },
      2031: { personalFree: null, personalPremium: null, company: null, municipality: null },
      2032: { personalFree: null, personalPremium: null, company: null, municipality: null }
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
      2030: { regularEmployees: null, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 },
      2031: { regularEmployees: null, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 },
      2032: { regularEmployees: null, contractEmployees: null, dispatchedEmployees: null, outsourcedEmployees: null, maxEmployees: 12, maxRegularEmployees: 4 }
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
      certificationSupportKurumin: 100000, // くるみん認定取得支援（円/件）
      certificationSupportHealthManagement: 100000, // 健康経営優良法人認定取得支援（円/件）
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
      2030: { lessons: 1000, childModel: 100, housekeeperMatching: 500, teacherMatching: 100 },
      2031: { lessons: 1000, childModel: 100, housekeeperMatching: 500, teacherMatching: 100 },
      2032: { lessons: 1000, childModel: 100, housekeeperMatching: 500, teacherMatching: 100 }
    },
    // 認定取得支援の成約件数（年ごと）
    certificationSupportCounts: {
      2026: { kurumin: 0, healthManagement: 0 },
      2027: { kurumin: 10, healthManagement: 10 },
      2028: { kurumin: 20, healthManagement: 20 },
      2029: { kurumin: 30, healthManagement: 30 },
      2030: { kurumin: 40, healthManagement: 40 },
      2031: { kurumin: 50, healthManagement: 50 },
      2032: { kurumin: 60, healthManagement: 60 }
    },
    // ECリファラルの成約率（パーセンテージ）と単価（年ごと、カテゴリーごと）
    ecReferralSettings: {
      2026: {
        conversionRates: { 
          essentials: 1, educationalGoods: 1, healthFood: 1, healthGoods: 1, maternityGoods: 1,
          medicine: 1, vaccination: 1, allergyTest: 1, geneticTest: 1,
          infantChildInsurance: 1, studentInsurance: 1, educationExpenseInsurance: 1,
          renovation: 0.5, album: 0.3, maternityPhoto: 0.15, print: 0.05
        },
        prices: { 
          essentials: 1000, educationalGoods: 2000, healthFood: 3000, healthGoods: 1500, maternityGoods: 2500,
          medicine: 1000, vaccination: 1000, allergyTest: 1000, geneticTest: 1000,
          infantChildInsurance: 1000, studentInsurance: 1000, educationExpenseInsurance: 1000,
          renovation: 50000, album: 3000, maternityPhoto: 1000, print: 100
        }
      },
      2027: {
        conversionRates: { 
          essentials: 1, educationalGoods: 1, healthFood: 1, healthGoods: 1, maternityGoods: 1,
          medicine: 1, vaccination: 1, allergyTest: 1, geneticTest: 1,
          infantChildInsurance: 1, studentInsurance: 1, educationExpenseInsurance: 1,
          renovation: 0.5, album: 0.3, maternityPhoto: 0.15, print: 0.05
        },
        prices: { 
          essentials: 1000, educationalGoods: 2000, healthFood: 3000, healthGoods: 1500, maternityGoods: 2500,
          medicine: 1000, vaccination: 1000, allergyTest: 1000, geneticTest: 1000,
          infantChildInsurance: 1000, studentInsurance: 1000, educationExpenseInsurance: 1000,
          renovation: 50000, album: 3000, maternityPhoto: 1000, print: 100
        }
      },
      2028: {
        conversionRates: { 
          essentials: 1, educationalGoods: 1, healthFood: 1, healthGoods: 1, maternityGoods: 1,
          medicine: 1, vaccination: 1, allergyTest: 1, geneticTest: 1,
          infantChildInsurance: 1, studentInsurance: 1, educationExpenseInsurance: 1,
          renovation: 0.5, album: 0.3, maternityPhoto: 0.15, print: 0.05
        },
        prices: { 
          essentials: 1000, educationalGoods: 2000, healthFood: 3000, healthGoods: 1500, maternityGoods: 2500,
          medicine: 1000, vaccination: 1000, allergyTest: 1000, geneticTest: 1000,
          infantChildInsurance: 1000, studentInsurance: 1000, educationExpenseInsurance: 1000,
          renovation: 50000, album: 3000, maternityPhoto: 1000, print: 100
        }
      },
      2029: {
        conversionRates: { 
          essentials: 1, educationalGoods: 1, healthFood: 1, healthGoods: 1, maternityGoods: 1,
          medicine: 1, vaccination: 1, allergyTest: 1, geneticTest: 1,
          infantChildInsurance: 1, studentInsurance: 1, educationExpenseInsurance: 1,
          renovation: 0.5, album: 0.3, maternityPhoto: 0.15, print: 0.05
        },
        prices: { 
          essentials: 1000, educationalGoods: 2000, healthFood: 3000, healthGoods: 1500, maternityGoods: 2500,
          medicine: 1000, vaccination: 1000, allergyTest: 1000, geneticTest: 1000,
          infantChildInsurance: 1000, studentInsurance: 1000, educationExpenseInsurance: 1000,
          renovation: 50000, album: 3000, maternityPhoto: 1000, print: 100
        }
      },
      2030: {
        conversionRates: { 
          essentials: 1, educationalGoods: 1, healthFood: 1, healthGoods: 1, maternityGoods: 1,
          medicine: 1, vaccination: 1, allergyTest: 1, geneticTest: 1,
          infantChildInsurance: 1, studentInsurance: 1, educationExpenseInsurance: 1,
          renovation: 0.5, album: 0.3, maternityPhoto: 0.15, print: 0.05
        },
        prices: { 
          essentials: 1000, educationalGoods: 2000, healthFood: 3000, healthGoods: 1500, maternityGoods: 2500,
          medicine: 1000, vaccination: 1000, allergyTest: 1000, geneticTest: 1000,
          infantChildInsurance: 1000, studentInsurance: 1000, educationExpenseInsurance: 1000,
          renovation: 50000, album: 3000, maternityPhoto: 1000, print: 100
        }
      },
      2031: {
        conversionRates: { 
          essentials: 1, educationalGoods: 1, healthFood: 1, healthGoods: 1, maternityGoods: 1,
          medicine: 1, vaccination: 1, allergyTest: 1, geneticTest: 1,
          infantChildInsurance: 1, studentInsurance: 1, educationExpenseInsurance: 1,
          renovation: 0.5, album: 0.3, maternityPhoto: 0.15, print: 0.05
        },
        prices: { 
          essentials: 1000, educationalGoods: 2000, healthFood: 3000, healthGoods: 1500, maternityGoods: 2500,
          medicine: 1000, vaccination: 1000, allergyTest: 1000, geneticTest: 1000,
          infantChildInsurance: 1000, studentInsurance: 1000, educationExpenseInsurance: 1000,
          renovation: 50000, album: 3000, maternityPhoto: 1000, print: 100
        }
      },
      2032: {
        conversionRates: { 
          essentials: 1, educationalGoods: 1, healthFood: 1, healthGoods: 1, maternityGoods: 1,
          medicine: 1, vaccination: 1, allergyTest: 1, geneticTest: 1,
          infantChildInsurance: 1, studentInsurance: 1, educationExpenseInsurance: 1,
          renovation: 0.5, album: 0.3, maternityPhoto: 0.15, print: 0.05
        },
        prices: { 
          essentials: 1000, educationalGoods: 2000, healthFood: 3000, healthGoods: 1500, maternityGoods: 2500,
          medicine: 1000, vaccination: 1000, allergyTest: 1000, geneticTest: 1000,
          infantChildInsurance: 1000, studentInsurance: 1000, educationExpenseInsurance: 1000,
          renovation: 50000, album: 3000, maternityPhoto: 1000, print: 100
        }
      }
    },
    // 売上原価率の設定（年ごと、収入カテゴリーごと）
    cogsSettings: {
      2026: {
        ecReferralRevenueRate: 50, // EC/リファラル関連収入の原価率（%）
        medicalRevenueRate: 50, // 医療関連収入の原価率（%）
        insuranceRevenueRate: 50, // 保険関連収入の原価率（%）
        renovationRevenueRate: 50, // リフォーム関連収入の原価率（%）
        albumRevenueRate: 50, // アルバム関連収入の原価率（%）
        referralRevenueRate: 50 // 紹介手数料収入の原価率（%）
      },
      2027: {
        ecReferralRevenueRate: 50,
        medicalRevenueRate: 50,
        insuranceRevenueRate: 50,
        renovationRevenueRate: 50,
        albumRevenueRate: 50,
        referralRevenueRate: 50
      },
      2028: {
        ecReferralRevenueRate: 50,
        medicalRevenueRate: 50,
        insuranceRevenueRate: 50,
        renovationRevenueRate: 50,
        albumRevenueRate: 50,
        referralRevenueRate: 50
      },
      2029: {
        ecReferralRevenueRate: 50,
        medicalRevenueRate: 50,
        insuranceRevenueRate: 50,
        renovationRevenueRate: 50,
        albumRevenueRate: 50,
        referralRevenueRate: 50
      },
      2030: {
        ecReferralRevenueRate: 50,
        medicalRevenueRate: 50,
        insuranceRevenueRate: 50,
        renovationRevenueRate: 50,
        albumRevenueRate: 50,
        referralRevenueRate: 50
      },
      2031: {
        ecReferralRevenueRate: 50,
        medicalRevenueRate: 50,
        insuranceRevenueRate: 50,
        renovationRevenueRate: 50,
        albumRevenueRate: 50,
        referralRevenueRate: 50
      },
      2032: {
        ecReferralRevenueRate: 50,
        medicalRevenueRate: 50,
        insuranceRevenueRate: 50,
        renovationRevenueRate: 50,
        albumRevenueRate: 50,
        referralRevenueRate: 50
      }
    },
    // 販管費の設定（年ごと）
    sgaSettings: {
      2026: {
        backOfficeLaborCost: 5000000, // 人件費（バックオフィス）
        entertainmentCost: 0, // 交際費
        advertisingCostRate: 2, // 広告費（売上の%）
        transportationCost: 500000, // 交通費
        otherSGA: 500000, // その他
        depreciation: 2000000 // 減価償却
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
      },
      2031: {
        backOfficeLaborCost: 5000000,
        entertainmentCost: 1000000,
        advertisingCostRate: 2,
        transportationCost: 500000,
        otherSGA: 500000,
        depreciation: 1180980
      },
      2032: {
        backOfficeLaborCost: 5000000,
        entertainmentCost: 1000000,
        advertisingCostRate: 2,
        transportationCost: 500000,
        otherSGA: 500000,
        depreciation: 1062882
      }
    },
    // システム利用料の設定（年ごと）
    systemUsageSettings: {
      2026: {
        baseMonthly: 50000, // 基本料金（月額）
        perUserMonthly: 5 // 1人あたり月額
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
      },
      2031: {
        baseMonthly: 50000,
        perUserMonthly: 5
      },
      2032: {
        baseMonthly: 50000,
        perUserMonthly: 5
      }
    },
    // 従業員年収の設定（年ごと）
    employeeSalarySettings: {
      2026: {
        regularEmployeeAnnualSalary: 10000000, // 正社員: 1000万円/年
        contractEmployeeAnnualSalary: 4000000, // 契約社員: 400万円/年
        dispatchedEmployeeAnnualSalary: 3000000, // 派遣: 300万円/年
        outsourcedEmployeeAnnualSalary: 2500000 // 業務委託: 250万円/年
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
  });

  const [simulationParams, setSimulationParams] = useState(() => getInitialSimulationParams());
  const [simulationKey, setSimulationKey] = useState(() => {
    const saved = localStorage.getItem('businessPlanSimulationKey');
    return saved ? parseInt(saved) : 0;
  }); // 再計算用のキー
  const [editingYearlyTarget, setEditingYearlyTarget] = useState(null); // 編集中の年度
  const [showSnapshotModal, setShowSnapshotModal] = useState(false); // スナップショット保存モーダル
  const [showSnapshotLoadModal, setShowSnapshotLoadModal] = useState(false); // スナップショット読み込みモーダル
  const [snapshotName, setSnapshotName] = useState(''); // スナップショット名

  // simulationParamsが変更されるたびにlocalStorageに保存
  useEffect(() => {
    try {
      localStorage.setItem('businessPlanSimulationParams', JSON.stringify(simulationParams));
    } catch (e) {
      console.error('Failed to save simulation params:', e);
    }
  }, [simulationParams]);

  // 年を年目表記に変換する関数
  const getYearLabel = (year) => {
    return `${year - 2025}年目`;
  };
  
  // 年度配列（7年目まで）
  const years = [2026, 2027, 2028, 2029, 2030, 2031, 2032];

  // 事業計画の完全な計算結果を生成（事業計画側の計算ロジックを使用）
  const generateBusinessPlanData = useMemo(() => {
    const data = [];
    const params = simulationParams;
    
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
    let previousRegularEmployeeCount = 0;
    let previousChurnedCompanyCount = 0;
    
    // 年単位でループ
    for (let year = 2026; year <= 2032; year++) {
      const currentYearTarget = yearlyTargets[year] || yearlyTargets[2032];
      const prevYearTarget = yearlyTargets[year - 1] || 0;
      
      const prevActiveUsers = year === 2026 ? 0 : 
        (cumulativePersonalFreeUsers + cumulativePersonalPremiumUsers + 
         cumulativeCompanyEmployees + cumulativeMunicipalityUsers);
      
      const targetActiveUsers = currentYearTarget;
      const targetGrowth = Math.max(0, targetActiveUsers - prevActiveUsers);
      
      const yearRatios = userRatios[year] || {
        personalFree: 0.50,
        personalPremium: 0.05,
        municipality: 0.30,
        company: 0.15
      };
      
      const targetPersonalFree = Math.floor(targetActiveUsers * yearRatios.personalFree);
      const targetPersonalPremium = Math.floor(targetActiveUsers * yearRatios.personalPremium);
      const targetMunicipality = Math.floor(targetActiveUsers * yearRatios.municipality);
      const targetCompany = Math.floor(targetActiveUsers * yearRatios.company);
      
      const currentPersonalFree = cumulativePersonalFreeUsers;
      const currentPersonalPremium = cumulativePersonalPremiumUsers;
      const currentMunicipality = cumulativeMunicipalityUsers;
      const currentCompany = cumulativeCompanyEmployees;
      
      const growthPersonalFree = Math.max(0, targetPersonalFree - currentPersonalFree);
      const growthPersonalPremium = Math.max(0, targetPersonalPremium - currentPersonalPremium);
      const growthMunicipality = Math.max(0, targetMunicipality - currentMunicipality);
      const growthCompany = Math.max(0, targetCompany - currentCompany);
      
      const yearChurnRates = params.churnRates?.[year] || {
        personalFree: params.churnRate || 0.24,
        personalPremium: params.churnRate || 0.24,
        company: params.companyChurnRate || 0.02,
        municipality: 0.02
      };
      
      const yearMaxChurned = params.maxChurnedCounts?.[year] || {
        personalFree: null,
        personalPremium: null,
        company: params.maxChurnedCompanyCountPerYear || 20,
        municipality: null
      };
      
      const yearMaxNew = params.maxNewCounts?.[year] || {
        personalFree: null,
        personalPremium: null,
        company: params.newCompanyCounts?.[year] || null,
        municipality: null
      };
      
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
      
      const personalUsers = personalFreeUsers + personalPremiumUsers;
      const personalRevenue = personalPremiumUsers * params.prices.personalPremiumMonthly * 12;
      
      const targetCompanyEmployees = Math.floor(targetActiveUsers * yearRatios.company);
      const targetCompanyCount = Math.ceil(targetCompanyEmployees / 20);
      
      const maxChurnedCompanyCountPerYear = yearMaxChurned.company;
      let churnedCompanyCountRaw = Math.floor(cumulativeCompanyCount * yearChurnRates.company);
      let churnedCompanyCount;
      if (maxChurnedCompanyCountPerYear !== null && previousChurnedCompanyCount >= maxChurnedCompanyCountPerYear) {
        churnedCompanyCount = maxChurnedCompanyCountPerYear;
      } else {
        churnedCompanyCount = maxChurnedCompanyCountPerYear !== null ? Math.min(churnedCompanyCountRaw, maxChurnedCompanyCountPerYear) : churnedCompanyCountRaw;
      }
      previousChurnedCompanyCount = churnedCompanyCount;
      
      const growthCompanyCount = Math.max(0, targetCompanyCount - cumulativeCompanyCount);
      let calculatedNewCompanyCount = growthCompanyCount + churnedCompanyCount;
      const maxNewCompanyCount = yearMaxNew?.company;
      const newCompanyCount = maxNewCompanyCount !== null 
        ? Math.min(calculatedNewCompanyCount, maxNewCompanyCount)
        : calculatedNewCompanyCount;
      cumulativeCompanyCount = Math.max(0, cumulativeCompanyCount + newCompanyCount - churnedCompanyCount);
      const companyCount = cumulativeCompanyCount;
      
      const companyEmployees = companyCount * 20;
      const newCompanyEmployees = newCompanyCount * 20;
      const churnedCompanyEmployees = churnedCompanyCount * 20;
      cumulativeCompanyEmployees = companyEmployees;
      const companyRevenue = (companyCount * params.prices.companyBaseAnnual) + (companyEmployees * params.prices.companyMonthlyPerActiveUser * 12);
      
      const targetMunicipalityUsers = Math.floor(targetActiveUsers * yearRatios.municipality);
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
      
      const maxChurnedMunicipalityUsers = yearMaxChurned.municipality !== null 
        ? yearMaxChurned.municipality * 100 
        : null;
      let churnedMunicipalityUsersRaw = Math.floor(cumulativeMunicipalityUsers * yearChurnRates.municipality);
      const churnedMunicipalityUsers = maxChurnedMunicipalityUsers !== null 
        ? Math.min(churnedMunicipalityUsersRaw, maxChurnedMunicipalityUsers)
        : churnedMunicipalityUsersRaw;
      const maxNewMunicipalityUsers = yearMaxNew.municipality !== null 
        ? yearMaxNew.municipality * 100 
        : null;
      let calculatedNewMunicipalityUsers = Math.floor(targetMunicipalityUsers - cumulativeMunicipalityUsers + churnedMunicipalityUsers);
      const newMunicipalityUsers = maxNewMunicipalityUsers !== null 
        ? Math.min(calculatedNewMunicipalityUsers, maxNewMunicipalityUsers)
        : calculatedNewMunicipalityUsers;
      cumulativeMunicipalityUsers = Math.max(0, cumulativeMunicipalityUsers + newMunicipalityUsers - churnedMunicipalityUsers);
      const municipalityUsers = cumulativeMunicipalityUsers;
      const municipalityRevenue = (municipalityCount * params.prices.municipalityBaseAnnual) + (municipalityUsers * params.prices.municipalityMonthlyPerActiveUser * 12);
      
      const activeUsers = personalUsers + companyEmployees + municipalityUsers;
      
      const yearEcReferralSettings = params.ecReferralSettings?.[year] || {};
      const defaultConversionRates = {
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
        educationExpenseInsurance: null,
        renovation: null,
        album: null,
        maternityPhoto: null,
        print: null
      };
      const defaultPrices = {
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
        educationExpenseInsurance: 1000,
        renovation: 50000,
        album: 3000,
        maternityPhoto: 1000,
        print: 100
      };
      const conversionRates = {
        ...defaultConversionRates,
        ...(yearEcReferralSettings.conversionRates || {})
      };
      const prices = {
        ...defaultPrices,
        ...(yearEcReferralSettings.prices || {})
      };
      const finalYearEcReferralSettings = {
        conversionRates,
        prices
      };
      
      let ecConversionEssentials, ecConversionEducationalGoods, ecConversionHealthFood, ecConversionHealthGoods, ecConversionMaternityGoods;
      let ecConversionMedicine, ecConversionVaccination, ecConversionAllergyTest, ecConversionGeneticTest;
      let ecConversionInfantChildInsurance, ecConversionStudentInsurance, ecConversionEducationExpenseInsurance;
      let ecConversionRenovation;
      let ecConversionAlbum, ecConversionMaternityPhoto, ecConversionPrint;
      
      let defaultEcConversionRate = 0.20;
      if (activeUsers > 200000) {
        defaultEcConversionRate = 0.30;
      } else if (activeUsers > 100000) {
        defaultEcConversionRate = 0.28;
      } else if (activeUsers > 50000) {
        defaultEcConversionRate = 0.25;
      } else if (activeUsers > 10000) {
        defaultEcConversionRate = 0.22;
      }
      
      const essentialsRatio = 0.20;
      const educationalGoodsRatio = 0.15;
      const healthFoodRatio = 0.15;
      const healthGoodsRatio = 0.10;
      const maternityGoodsRatio = 0.10;
      // 医療関連の比率
      const medicineRatio = 0.05;
      const vaccinationRatio = 0.05;
      const allergyTestRatio = 0.03;
      const geneticTestRatio = 0.02;
      // 保険関連の比率
      const infantChildInsuranceRatio = 0.08;
      const studentInsuranceRatio = 0.05;
      const educationExpenseInsuranceRatio = 0.02;
      // リフォーム関連の比率
      const renovationRatio = 0.03;
      // アルバム関連の比率
      const albumRatio = 0.03;
      const maternityPhotoRatio = 0.015;
      const printRatio = 0.005;
      
      if (finalYearEcReferralSettings.conversionRates.essentials !== null && finalYearEcReferralSettings.conversionRates.essentials !== undefined) {
        ecConversionEssentials = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.essentials / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionEssentials = Math.floor(totalEcConversionCountBase * essentialsRatio);
        if (year === 2026) ecConversionEssentials = 0;
      }
      
      if (finalYearEcReferralSettings.conversionRates.educationalGoods !== null && finalYearEcReferralSettings.conversionRates.educationalGoods !== undefined) {
        ecConversionEducationalGoods = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.educationalGoods / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionEducationalGoods = Math.floor(totalEcConversionCountBase * educationalGoodsRatio);
        if (year === 2026) ecConversionEducationalGoods = 0;
      }
      
      if (finalYearEcReferralSettings.conversionRates.healthFood !== null && finalYearEcReferralSettings.conversionRates.healthFood !== undefined) {
        ecConversionHealthFood = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.healthFood / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionHealthFood = Math.floor(totalEcConversionCountBase * healthFoodRatio);
        if (year === 2026) ecConversionHealthFood = 0;
      }
      
      if (finalYearEcReferralSettings.conversionRates.healthGoods !== null && finalYearEcReferralSettings.conversionRates.healthGoods !== undefined) {
        ecConversionHealthGoods = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.healthGoods / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionHealthGoods = Math.floor(totalEcConversionCountBase * healthGoodsRatio);
        if (year === 2026) ecConversionHealthGoods = 0;
      }
      
      if (finalYearEcReferralSettings.conversionRates.maternityGoods !== null && finalYearEcReferralSettings.conversionRates.maternityGoods !== undefined) {
        ecConversionMaternityGoods = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.maternityGoods / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionMaternityGoods = Math.floor(totalEcConversionCountBase * maternityGoodsRatio);
        if (year === 2026) ecConversionMaternityGoods = 0;
      }
      
      // 医療関連の計算
      if (finalYearEcReferralSettings.conversionRates.medicine !== null && finalYearEcReferralSettings.conversionRates.medicine !== undefined) {
        ecConversionMedicine = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.medicine / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionMedicine = Math.floor(totalEcConversionCountBase * medicineRatio);
        if (year === 2026) ecConversionMedicine = 0;
      }
      
      if (finalYearEcReferralSettings.conversionRates.vaccination !== null && finalYearEcReferralSettings.conversionRates.vaccination !== undefined) {
        ecConversionVaccination = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.vaccination / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionVaccination = Math.floor(totalEcConversionCountBase * vaccinationRatio);
        if (year === 2026) ecConversionVaccination = 0;
      }
      
      if (finalYearEcReferralSettings.conversionRates.allergyTest !== null && finalYearEcReferralSettings.conversionRates.allergyTest !== undefined) {
        ecConversionAllergyTest = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.allergyTest / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionAllergyTest = Math.floor(totalEcConversionCountBase * allergyTestRatio);
        if (year === 2026) ecConversionAllergyTest = 0;
      }
      
      if (finalYearEcReferralSettings.conversionRates.geneticTest !== null && finalYearEcReferralSettings.conversionRates.geneticTest !== undefined) {
        ecConversionGeneticTest = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.geneticTest / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionGeneticTest = Math.floor(totalEcConversionCountBase * geneticTestRatio);
        if (year === 2026) ecConversionGeneticTest = 0;
      }
      
      // 保険関連の計算
      if (finalYearEcReferralSettings.conversionRates.infantChildInsurance !== null && finalYearEcReferralSettings.conversionRates.infantChildInsurance !== undefined) {
        ecConversionInfantChildInsurance = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.infantChildInsurance / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionInfantChildInsurance = Math.floor(totalEcConversionCountBase * infantChildInsuranceRatio);
        if (year === 2026) ecConversionInfantChildInsurance = 0;
      }
      
      if (finalYearEcReferralSettings.conversionRates.studentInsurance !== null && finalYearEcReferralSettings.conversionRates.studentInsurance !== undefined) {
        ecConversionStudentInsurance = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.studentInsurance / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionStudentInsurance = Math.floor(totalEcConversionCountBase * studentInsuranceRatio);
        if (year === 2026) ecConversionStudentInsurance = 0;
      }
      
      if (finalYearEcReferralSettings.conversionRates.educationExpenseInsurance !== null && finalYearEcReferralSettings.conversionRates.educationExpenseInsurance !== undefined) {
        ecConversionEducationExpenseInsurance = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.educationExpenseInsurance / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionEducationExpenseInsurance = Math.floor(totalEcConversionCountBase * educationExpenseInsuranceRatio);
        if (year === 2026) ecConversionEducationExpenseInsurance = 0;
      }
      
      // リフォーム関連の計算
      if (finalYearEcReferralSettings.conversionRates.renovation !== null && finalYearEcReferralSettings.conversionRates.renovation !== undefined) {
        ecConversionRenovation = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.renovation / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionRenovation = Math.floor(totalEcConversionCountBase * renovationRatio);
        if (year === 2026) ecConversionRenovation = 0;
      }
      
      // アルバム関連の計算
      if (finalYearEcReferralSettings.conversionRates.album !== null && finalYearEcReferralSettings.conversionRates.album !== undefined) {
        ecConversionAlbum = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.album / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionAlbum = Math.floor(totalEcConversionCountBase * albumRatio);
        if (year === 2026) ecConversionAlbum = 0;
      }
      
      if (finalYearEcReferralSettings.conversionRates.maternityPhoto !== null && finalYearEcReferralSettings.conversionRates.maternityPhoto !== undefined) {
        ecConversionMaternityPhoto = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.maternityPhoto / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionMaternityPhoto = Math.floor(totalEcConversionCountBase * maternityPhotoRatio);
        if (year === 2026) ecConversionMaternityPhoto = 0;
      }
      
      if (finalYearEcReferralSettings.conversionRates.print !== null && finalYearEcReferralSettings.conversionRates.print !== undefined) {
        ecConversionPrint = Math.floor(activeUsers * finalYearEcReferralSettings.conversionRates.print / 100);
      } else {
        const totalEcConversionCountBase = Math.floor(activeUsers * defaultEcConversionRate);
        ecConversionPrint = Math.floor(totalEcConversionCountBase * printRatio);
        if (year === 2026) ecConversionPrint = 0;
      }
      
      const ecReferralEssentials = ecConversionEssentials * finalYearEcReferralSettings.prices.essentials;
      const ecReferralEducationalGoods = ecConversionEducationalGoods * finalYearEcReferralSettings.prices.educationalGoods;
      const ecReferralHealthFood = ecConversionHealthFood * finalYearEcReferralSettings.prices.healthFood;
      const ecReferralHealthGoods = ecConversionHealthGoods * finalYearEcReferralSettings.prices.healthGoods;
      const ecReferralMaternityGoods = ecConversionMaternityGoods * finalYearEcReferralSettings.prices.maternityGoods;
      const ecReferralMedicine = ecConversionMedicine * finalYearEcReferralSettings.prices.medicine;
      const ecReferralVaccination = ecConversionVaccination * finalYearEcReferralSettings.prices.vaccination;
      const ecReferralAllergyTest = ecConversionAllergyTest * finalYearEcReferralSettings.prices.allergyTest;
      const ecReferralGeneticTest = ecConversionGeneticTest * finalYearEcReferralSettings.prices.geneticTest;
      const ecReferralInfantChildInsurance = ecConversionInfantChildInsurance * finalYearEcReferralSettings.prices.infantChildInsurance;
      const ecReferralStudentInsurance = ecConversionStudentInsurance * finalYearEcReferralSettings.prices.studentInsurance;
      const ecReferralEducationExpenseInsurance = ecConversionEducationExpenseInsurance * finalYearEcReferralSettings.prices.educationExpenseInsurance;
      const ecReferralRenovation = ecConversionRenovation * (finalYearEcReferralSettings.prices.renovation || 50000);
      const ecReferralAlbum = ecConversionAlbum * (finalYearEcReferralSettings.prices.album || 3000);
      const ecReferralMaternityPhoto = ecConversionMaternityPhoto * (finalYearEcReferralSettings.prices.maternityPhoto || 1000);
      const ecReferralPrint = ecConversionPrint * (finalYearEcReferralSettings.prices.print || 100);
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
      
      let referralRevenuePerUser = 30;
      if (activeUsers > 200000) {
        referralRevenuePerUser = 100;
      } else if (activeUsers > 100000) {
        referralRevenuePerUser = 80;
      } else if (activeUsers > 50000) {
        referralRevenuePerUser = 60;
      } else if (activeUsers > 10000) {
        referralRevenuePerUser = 45;
      }
      
      if (year >= 2027) {
        referralRevenuePerUser = referralRevenuePerUser / 5;
      }
      
      let conversionRate = 0.08;
      if (activeUsers > 200000) {
        conversionRate = 0.32;
      } else if (activeUsers > 100000) {
        conversionRate = 0.24;
      } else if (activeUsers > 50000) {
        conversionRate = 0.16;
      } else if (activeUsers > 10000) {
        conversionRate = 0.12;
      }
      
      if (year >= 2027) {
        conversionRate = conversionRate / 5;
      }
      
      const totalConversionCountBase = Math.floor(activeUsers * conversionRate);
      
      const referralLessonsRatio = 0.40;
      const referralChildModelRatio = 0.30;
      const referralHousekeeperMatchingRatio = 0.15;
      const referralTeacherMatchingRatio = 0.15;
      
      let conversionLessonsRatio, conversionChildModelRatio, conversionHousekeeperMatchingRatio, conversionTeacherMatchingRatio;
      
      const baseConversionLessonsRatio = 0.40;
      const baseConversionChildModelRatio = 0.30;
      const baseConversionHousekeeperMatchingRatio = 0.15;
      const baseConversionTeacherMatchingRatio = 0.15;
      
      if (year >= 2029) {
        conversionLessonsRatio = baseConversionLessonsRatio / 2;
        conversionChildModelRatio = baseConversionChildModelRatio;
        conversionHousekeeperMatchingRatio = baseConversionHousekeeperMatchingRatio;
        conversionTeacherMatchingRatio = baseConversionTeacherMatchingRatio;
      } else if (year >= 2028) {
        conversionLessonsRatio = baseConversionLessonsRatio / 2;
        conversionChildModelRatio = baseConversionChildModelRatio;
        conversionHousekeeperMatchingRatio = baseConversionHousekeeperMatchingRatio;
        conversionTeacherMatchingRatio = baseConversionTeacherMatchingRatio;
      } else {
        conversionLessonsRatio = baseConversionLessonsRatio;
        conversionChildModelRatio = baseConversionChildModelRatio;
        conversionHousekeeperMatchingRatio = baseConversionHousekeeperMatchingRatio;
        conversionTeacherMatchingRatio = baseConversionTeacherMatchingRatio;
      }
      
      const totalRatio = conversionLessonsRatio + conversionChildModelRatio + conversionHousekeeperMatchingRatio + conversionTeacherMatchingRatio;
      const conversionLessonsRatioAdjusted = totalRatio > 0 ? conversionLessonsRatio / totalRatio : 0;
      const conversionChildModelRatioAdjusted = totalRatio > 0 ? conversionChildModelRatio / totalRatio : 0;
      const conversionHousekeeperMatchingRatioAdjusted = totalRatio > 0 ? conversionHousekeeperMatchingRatio / totalRatio : 0;
      const conversionTeacherMatchingRatioAdjusted = totalRatio > 0 ? conversionTeacherMatchingRatio / totalRatio : 0;
      
      let conversionLessonsRaw = Math.floor(totalConversionCountBase * conversionLessonsRatioAdjusted);
      let conversionChildModelRaw = Math.floor(totalConversionCountBase * conversionChildModelRatioAdjusted);
      let conversionHousekeeperMatchingRaw = Math.floor(totalConversionCountBase * conversionHousekeeperMatchingRatioAdjusted);
      let conversionTeacherMatchingRaw = Math.floor(totalConversionCountBase * conversionTeacherMatchingRatioAdjusted);
      
      if (year === 2026) {
        conversionLessonsRaw = 0;
        conversionChildModelRaw = 0;
        conversionHousekeeperMatchingRaw = 0;
        conversionTeacherMatchingRaw = 0;
      }
      
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
      
      const totalConversionCount = conversionLessons + conversionChildModel + conversionHousekeeperMatching + conversionTeacherMatching;
      
      const referralFeePerConversionLessons = params.prices.referralFeeLessons;
      const referralFeePerConversionChildModel = params.prices.referralFeeChildModel;
      const referralFeePerConversionHousekeeperMatching = params.prices.referralFeeHousekeeperMatching;
      const referralFeePerConversionTeacherMatching = params.prices.referralFeeTeacherMatching;
      
      const referralLessons = conversionLessons * referralFeePerConversionLessons;
      const referralChildModel = conversionChildModel * referralFeePerConversionChildModel;
      const referralHousekeeperMatching = conversionHousekeeperMatching * referralFeePerConversionHousekeeperMatching;
      const referralTeacherMatching = conversionTeacherMatching * referralFeePerConversionTeacherMatching;
      const referralRevenue = referralLessons + referralChildModel + referralHousekeeperMatching + referralTeacherMatching;
      
      let advertisingRevenue = 0;
      if (year > 2026 && activeUsers > 0) {
        const advertiserCount = Math.max(1, Math.floor(companyCount * 0.1));
        advertisingRevenue = advertiserCount * params.prices.advertisingMonthly * 3;
        const additionalAdvertisingRevenue = Math.floor(activeUsers / 10000) * 50000 * 3;
        advertisingRevenue += additionalAdvertisingRevenue;
        advertisingRevenue = Math.floor(advertisingRevenue / 10);
      }
      
      let applicationAgencyCases = 0;
      let applicationAgencyRevenue = 0;
      if (year > 2026) {
        applicationAgencyCases = Math.floor((companyCount * 2) + (municipalityCount * 5));
        applicationAgencyRevenue = applicationAgencyCases * params.prices.applicationAgencyPerCase;
      }
      
      // 認定取得支援収入
      const yearCertificationCounts = params.certificationSupportCounts?.[year] || { kurumin: 0, healthManagement: 0 };
      const certificationSupportKuruminCases = yearCertificationCounts.kurumin || 0;
      const certificationSupportHealthManagementCases = yearCertificationCounts.healthManagement || 0;
      const certificationSupportRevenue = 
        (certificationSupportKuruminCases * params.prices.certificationSupportKurumin) +
        (certificationSupportHealthManagementCases * params.prices.certificationSupportHealthManagement);
      
      const totalRevenue = personalRevenue + companyRevenue + municipalityRevenue + ecReferralRevenue + medicalRevenue + insuranceRevenue + renovationRevenue + albumRevenue + referralRevenue + advertisingRevenue + applicationAgencyRevenue + certificationSupportRevenue;
      
      let calculatedEmployeeCount = 4;
      if (activeUsers > 200000) {
        calculatedEmployeeCount = 12;
      } else if (activeUsers > 100000) {
        calculatedEmployeeCount = 10;
      } else if (activeUsers > 50000) {
        calculatedEmployeeCount = 8;
      } else if (activeUsers > 10000) {
        calculatedEmployeeCount = 6;
      }
      
      const yearEmployeeSettings = params.employeeSettings?.[year] || {};
      
      // 上限を撤廃：calculatedEmployeeCountをそのまま使用
      const employeeCount = calculatedEmployeeCount;
      
      let regularEmployeeCount;
      if (yearEmployeeSettings.regularEmployees !== null && yearEmployeeSettings.regularEmployees !== undefined) {
        regularEmployeeCount = yearEmployeeSettings.regularEmployees;
      } else {
        // 前年の正社員数を参照して、増加させる
        regularEmployeeCount = Math.max(previousRegularEmployeeCount, Math.floor(employeeCount * 0.60));
      }
      previousRegularEmployeeCount = regularEmployeeCount;
      
      let contractEmployeeCount, dispatchedEmployeeCount, outsourcedEmployeeCount;
      const remainingEmployees = employeeCount - regularEmployeeCount;
      
      if (yearEmployeeSettings.contractEmployees !== null && yearEmployeeSettings.dispatchedEmployees !== null && yearEmployeeSettings.outsourcedEmployees !== null) {
        // すべて手入力されている場合はそのまま使用
        contractEmployeeCount = yearEmployeeSettings.contractEmployees;
        dispatchedEmployeeCount = yearEmployeeSettings.dispatchedEmployees;
        outsourcedEmployeeCount = yearEmployeeSettings.outsourcedEmployees;
      } else {
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
          contractEmployeeCount = Math.floor(remainingEmployees * 0.50);
          dispatchedEmployeeCount = Math.floor(remainingEmployees * 0.25);
          outsourcedEmployeeCount = remainingEmployees - contractEmployeeCount - dispatchedEmployeeCount;
        }
      }
      
      // 従業員数合計は内訳の合計として計算
      const actualEmployeeCount = regularEmployeeCount + contractEmployeeCount + dispatchedEmployeeCount + outsourcedEmployeeCount;
      
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
      
      const yearSystemUsageSettings = params.systemUsageSettings?.[year] || {
        baseMonthly: 50000,
        perUserMonthly: 5
      };
      const baseMonthly = yearSystemUsageSettings.baseMonthly || 50000;
      const perUserMonthly = yearSystemUsageSettings.perUserMonthly || 5;
      const perUserCost = Math.floor(activeUsers * perUserMonthly);
      const systemUsageCostTotal = Math.floor((baseMonthly + perUserCost) * 12);
      
      const totalCost = laborCost + referralCost + systemUsageCostTotal + totalCogs;
      
      const grossProfit = totalRevenue - totalCost;
      
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
      
      const operatingProfit = grossProfit - totalSGA;
      
      const tax = operatingProfit > 0 ? Math.floor(operatingProfit * 0.3) : 0;
      
      const netProfit = operatingProfit - tax;
      
      data.push({
        year: year,
        quarter: getYearLabel(year),
        personalFreeUsers: personalFreeUsers,
        newPersonalFreeUsers: newPersonalFreeUsers,
        churnedPersonalFreeUsers: churnedPersonalFreeUsers,
        personalPremiumUsers: personalPremiumUsers,
        newPersonalPremiumUsers: newPersonalPremiumUsers,
        churnedPersonalPremiumUsers: churnedPersonalPremiumUsers,
        personalUsers: personalUsers,
        personalRevenue: personalRevenue,
        companyCount: companyCount,
        newCompanyCount: newCompanyCount,
        churnedCompanyCount: churnedCompanyCount,
        companyEmployees: companyEmployees,
        newCompanyEmployees: newCompanyEmployees,
        churnedCompanyEmployees: churnedCompanyEmployees,
        companyRevenue: companyRevenue,
        municipalityCount: municipalityCount,
        newMunicipalityCount: newMunicipalityCount,
        churnedMunicipalityCount: churnedMunicipalityCount,
        municipalityUsers: municipalityUsers,
        newMunicipalityUsers: newMunicipalityUsers,
        churnedMunicipalityUsers: churnedMunicipalityUsers,
        municipalityRevenue: municipalityRevenue,
        activeUsers: activeUsers,
        ecReferralRevenue: ecReferralRevenue,
        ecReferralEssentials: ecReferralEssentials,
        ecReferralEducationalGoods: ecReferralEducationalGoods,
        ecReferralHealthFood: ecReferralHealthFood,
        ecReferralHealthGoods: ecReferralHealthGoods,
        ecReferralMaternityGoods: ecReferralMaternityGoods,
        medicalRevenue: medicalRevenue,
        ecReferralMedicine: ecReferralMedicine,
        ecReferralVaccination: ecReferralVaccination,
        ecReferralAllergyTest: ecReferralAllergyTest,
        ecReferralGeneticTest: ecReferralGeneticTest,
        insuranceRevenue: insuranceRevenue,
        ecReferralInfantChildInsurance: ecReferralInfantChildInsurance,
        ecReferralStudentInsurance: ecReferralStudentInsurance,
        ecReferralEducationExpenseInsurance: ecReferralEducationExpenseInsurance,
        renovationRevenue: renovationRevenue,
        ecReferralRenovation: ecReferralRenovation,
        ecConversionRenovation: ecConversionRenovation,
        albumRevenue: albumRevenue,
        ecReferralAlbum: ecReferralAlbum,
        ecConversionAlbum: ecConversionAlbum,
        ecReferralMaternityPhoto: ecReferralMaternityPhoto,
        ecConversionMaternityPhoto: ecConversionMaternityPhoto,
        ecReferralPrint: ecReferralPrint,
        ecConversionPrint: ecConversionPrint,
        ecConversionEssentials: ecConversionEssentials,
        ecConversionEducationalGoods: ecConversionEducationalGoods,
        ecConversionHealthFood: ecConversionHealthFood,
        ecConversionHealthGoods: ecConversionHealthGoods,
        ecConversionMaternityGoods: ecConversionMaternityGoods,
        ecConversionMedicine: ecConversionMedicine,
        ecConversionVaccination: ecConversionVaccination,
        ecConversionAllergyTest: ecConversionAllergyTest,
        ecConversionGeneticTest: ecConversionGeneticTest,
        ecConversionInfantChildInsurance: ecConversionInfantChildInsurance,
        ecConversionStudentInsurance: ecConversionStudentInsurance,
        ecConversionEducationExpenseInsurance: ecConversionEducationExpenseInsurance,
        referralRevenue: referralRevenue,
        referralLessons: referralLessons,
        referralChildModel: referralChildModel,
        referralHousekeeperMatching: referralHousekeeperMatching,
        referralTeacherMatching: referralTeacherMatching,
        conversionLessons: conversionLessons,
        conversionChildModel: conversionChildModel,
        conversionHousekeeperMatching: conversionHousekeeperMatching,
        conversionTeacherMatching: conversionTeacherMatching,
        totalConversionCount: totalConversionCount,
        advertisingRevenue: advertisingRevenue,
        applicationAgencyRevenue: applicationAgencyRevenue,
        applicationAgencyCases: applicationAgencyCases,
        certificationSupportRevenue: certificationSupportRevenue,
        certificationSupportKuruminCases: certificationSupportKuruminCases,
        certificationSupportHealthManagementCases: certificationSupportHealthManagementCases,
        totalRevenue: totalRevenue,
        ecReferralCogs: ecReferralCogs,
        medicalCogs: medicalCogs,
        insuranceCogs: insuranceCogs,
        renovationCogs: renovationCogs,
        albumCogs: albumCogs,
        referralCogs: referralCogs,
        totalCogs: totalCogs,
        laborCost: laborCost,
        employeeCount: actualEmployeeCount,
        regularEmployeeCount: regularEmployeeCount,
        contractEmployeeCount: contractEmployeeCount,
        dispatchedEmployeeCount: dispatchedEmployeeCount,
        outsourcedEmployeeCount: outsourcedEmployeeCount,
        referralCost: referralCost,
        systemUsageCost: systemUsageCostTotal,
        totalCost: totalCost,
        grossProfit: grossProfit,
        backOfficeLaborCost: backOfficeLaborCost,
        entertainmentCost: entertainmentCost,
        advertisingCost: advertisingCost,
        transportationCost: transportationCost,
        otherSGA: otherSGA,
        depreciation: depreciation,
        totalSGA: totalSGA,
        operatingProfit: operatingProfit,
        tax: tax,
        netProfit: netProfit
      });
    }
    
    return data;
  }, [simulationParams]);

  // パラメーターと計算結果をlocalStorageに保存して事業計画ページに渡す
  const handleApply = () => {
    localStorage.setItem('businessPlanSimulationParams', JSON.stringify(simulationParams));
    localStorage.setItem('businessPlanSimulationResults', JSON.stringify(generateBusinessPlanData));
    localStorage.setItem('businessPlanSimulationKey', String(simulationKey + 1));
    navigate('/specification/business-plan-detail');
  };

  // スナップショットを保存
  const handleSaveSnapshot = () => {
    if (!snapshotName.trim()) {
      alert('スナップショット名を入力してください。');
      return;
    }
    
    const snapshot = {
      id: Date.now().toString(),
      name: snapshotName.trim(),
      createdAt: new Date().toISOString(),
      params: JSON.parse(JSON.stringify(simulationParams)),
      results: JSON.parse(JSON.stringify(generateBusinessPlanData))
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
    setShowSnapshotModal(false);
    alert('スナップショットをJSONファイルとして保存しました。');
  };

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>事業計画シミュレーション</h1>
            <p className="specification-description">
              事業計画のパラメーターを調整して、財務計画をシミュレーションできます。
            </p>
          </div>

          <div className="specification-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* スナップショット操作ボタン */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <button
                onClick={() => setShowSnapshotLoadModal(true)}
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

            {/* 年度末の目標アクティブユーザー数 */}
            <div>
              <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>年度末の目標アクティブユーザー数</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px' }}>
                {years.map(year => (
                  <div key={year} style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>
                      {getYearLabel(year)}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <input
                        type="text"
                        value={editingYearlyTarget === year 
                          ? (simulationParams.yearlyTargets[year] || 0).toString()
                          : (simulationParams.yearlyTargets[year] || 0).toLocaleString()}
                        onFocus={() => setEditingYearlyTarget(year)}
                        onBlur={(e) => {
                          const inputValue = e.target.value.replace(/,/g, '');
                          const val = inputValue === '' ? 0 : parseInt(inputValue) || 0;
                          setSimulationParams({
                            ...simulationParams,
                            yearlyTargets: {
                              ...simulationParams.yearlyTargets,
                              [year]: val
                            }
                          });
                          setEditingYearlyTarget(null);
                        }}
                        onChange={(e) => {
                          const inputValue = e.target.value.replace(/,/g, '');
                          if (inputValue === '') {
                            setSimulationParams({
                              ...simulationParams,
                              yearlyTargets: {
                                ...simulationParams.yearlyTargets,
                                [year]: 0
                              }
                            });
                          } else {
                            const val = parseInt(inputValue) || 0;
                            setSimulationParams({
                              ...simulationParams,
                              yearlyTargets: {
                                ...simulationParams.yearlyTargets,
                                [year]: val
                              }
                            });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            const currentValue = simulationParams.yearlyTargets[year] || 0;
                            const newValue = currentValue + 100;
                            setSimulationParams({
                              ...simulationParams,
                              yearlyTargets: {
                                ...simulationParams.yearlyTargets,
                                [year]: newValue
                              }
                            });
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            const currentValue = simulationParams.yearlyTargets[year] || 0;
                            const newValue = Math.max(0, currentValue - 100);
                            setSimulationParams({
                              ...simulationParams,
                              yearlyTargets: {
                                ...simulationParams.yearlyTargets,
                                [year]: newValue
                              }
                            });
                          }
                        }}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          maxWidth: '100px',
                          padding: '6px 8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '13px',
                          textAlign: 'right'
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const currentValue = simulationParams.yearlyTargets[year] || 0;
                            const newValue = currentValue + 100;
                            setSimulationParams({
                              ...simulationParams,
                              yearlyTargets: {
                                ...simulationParams.yearlyTargets,
                                [year]: newValue
                              }
                            });
                          }}
                          style={{
                            padding: '3px 6px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#f9fafb',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#666',
                            minWidth: '24px',
                            width: '24px'
                          }}
                        >
                          ＋
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const currentValue = simulationParams.yearlyTargets[year] || 0;
                            const newValue = Math.max(0, currentValue - 100);
                            setSimulationParams({
                              ...simulationParams,
                              yearlyTargets: {
                                ...simulationParams.yearlyTargets,
                                [year]: newValue
                              }
                            });
                          }}
                          style={{
                            padding: '3px 6px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#f9fafb',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#666',
                            minWidth: '24px',
                            width: '24px'
                          }}
                        >
                          −
                        </button>
                      </div>
                      <span style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>人</span>
                    </div>
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                    flex: 1,
                                    padding: '4px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    textAlign: 'right'
                                  }}
                                />
                                <span style={{ fontSize: '14px', color: '#666' }}>%</span>
                              </div>
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                    flex: 1,
                                    padding: '4px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    textAlign: 'right'
                                  }}
                                />
                                <span style={{ fontSize: '14px', color: '#666' }}>%</span>
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
                                type="text"
                                placeholder="上限なし"
                                value={yearMaxChurned[category.key] === null ? '' : yearMaxChurned[category.key].toLocaleString()}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? null : parseInt(e.target.value.replace(/,/g, '')) || 0;
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
                                  textAlign: 'right'
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
                            outsourcedEmployees: null,
                            maxEmployees: simulationParams.maxEmployees || 12,
                            maxRegularEmployees: simulationParams.maxRegularEmployees || 4
                          };
                          const isNullable = ['regularEmployees', 'contractEmployees', 'dispatchedEmployees', 'outsourcedEmployees'].includes(category.key);
                          return (
                            <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <input
                                  type="text"
                                  placeholder={isNullable ? '未設定' : '0'}
                                  value={yearSettings[category.key] === null ? '' : yearSettings[category.key].toLocaleString()}
                                  onChange={(e) => {
                                    const val = isNullable
                                      ? (e.target.value === '' ? null : parseInt(e.target.value.replace(/,/g, '')) || 0)
                                      : parseInt(e.target.value.replace(/,/g, '')) || 0;
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

            {/* 従業員年収の設定 */}
            <div>
              <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>従業員年収の設定（年間）</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>雇用形態</th>
                      {years.map(year => (
                        <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'regularEmployeeAnnualSalary', label: '正社員（円）' },
                      { key: 'contractEmployeeAnnualSalary', label: '契約社員（円）' },
                      { key: 'dispatchedEmployeeAnnualSalary', label: '派遣（円）' },
                      { key: 'outsourcedEmployeeAnnualSalary', label: '業務委託（円）' }
                    ].map((item, itemIndex) => (
                      <tr key={item.key} style={{ backgroundColor: itemIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{item.label}</td>
                        {years.map(year => {
                          const yearSettings = simulationParams.employeeSalarySettings?.[year] || {
                            regularEmployeeAnnualSalary: 10000000,
                            contractEmployeeAnnualSalary: 4000000,
                            dispatchedEmployeeAnnualSalary: 3000000,
                            outsourcedEmployeeAnnualSalary: 2500000
                          };
                          return (
                            <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                                <input
                                  type="text"
                                  value={yearSettings[item.key] === null ? '' : yearSettings[item.key].toLocaleString()}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                                    setSimulationParams({
                                      ...simulationParams,
                                      employeeSalarySettings: {
                                        ...(simulationParams.employeeSalarySettings || {}),
                                        [year]: {
                                          ...yearSettings,
                                          [item.key]: val
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                        <input
                          type="text"
                          value={simulationParams.prices.personalPremiumMonthly.toLocaleString()}
                          onChange={(e) => {
                            const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                            setSimulationParams({
                              ...simulationParams,
                              prices: {
                                ...simulationParams.prices,
                                personalPremiumMonthly: val
                              }
                            });
                          }}
                          style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            textAlign: 'right'
                          }}
                        />
                      </div>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                          <input
                            type="text"
                            value={(simulationParams.prices.companyBaseAnnual || 50000).toLocaleString()}
                            onChange={(e) => {
                              const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                              setSimulationParams({
                                ...simulationParams,
                                prices: {
                                  ...simulationParams.prices,
                                  companyBaseAnnual: val
                                }
                              });
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              textAlign: 'right'
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                          企業向け月額/アクティブユーザー（円）
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                          <input
                            type="text"
                            value={(simulationParams.prices.companyMonthlyPerActiveUser || 500).toLocaleString()}
                            onChange={(e) => {
                              const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                              setSimulationParams({
                                ...simulationParams,
                                prices: {
                                  ...simulationParams.prices,
                                  companyMonthlyPerActiveUser: val
                                }
                              });
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              textAlign: 'right'
                            }}
                          />
                        </div>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                          <input
                            type="text"
                            value={(simulationParams.prices.municipalityBaseAnnual || 100000).toLocaleString()}
                            onChange={(e) => {
                              const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                              setSimulationParams({
                                ...simulationParams,
                                prices: {
                                  ...simulationParams.prices,
                                  municipalityBaseAnnual: val
                                }
                              });
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              textAlign: 'right'
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                          自治体向け月額/アクティブユーザー（円）
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                          <input
                            type="text"
                            value={(simulationParams.prices.municipalityMonthlyPerActiveUser || 300).toLocaleString()}
                            onChange={(e) => {
                              const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                              setSimulationParams({
                                ...simulationParams,
                                prices: {
                                  ...simulationParams.prices,
                                  municipalityMonthlyPerActiveUser: val
                                }
                              });
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              textAlign: 'right'
                            }}
                          />
                        </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                      <input
                        type="text"
                        value={simulationParams.prices.advertisingMonthly.toLocaleString()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                          setSimulationParams({
                            ...simulationParams,
                            prices: {
                              ...simulationParams.prices,
                              advertisingMonthly: val
                            }
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          textAlign: 'right'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                      申請代行サービス1件あたり（円）
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                      <input
                        type="text"
                        value={simulationParams.prices.applicationAgencyPerCase.toLocaleString()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                          setSimulationParams({
                            ...simulationParams,
                            prices: {
                              ...simulationParams.prices,
                              applicationAgencyPerCase: val
                            }
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          textAlign: 'right'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 認定取得支援 */}
              <div style={{ marginBottom: '20px', maxWidth: '600px' }}>
                <h4 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '500', color: '#555' }}>認定取得支援（1件あたり）</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                      くるみん認定取得支援（円）
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                      <input
                        type="text"
                        value={simulationParams.prices.certificationSupportKurumin.toLocaleString()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                          setSimulationParams({
                            ...simulationParams,
                            prices: {
                              ...simulationParams.prices,
                              certificationSupportKurumin: val
                            }
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          textAlign: 'right'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                      健康経営優良法人認定取得支援（円）
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                      <input
                        type="text"
                        value={simulationParams.prices.certificationSupportHealthManagement.toLocaleString()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                          setSimulationParams({
                            ...simulationParams,
                            prices: {
                              ...simulationParams.prices,
                              certificationSupportHealthManagement: val
                            }
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          textAlign: 'right'
                        }}
                      />
                    </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                      <input
                        type="text"
                        value={simulationParams.prices.referralFeeLessons.toLocaleString()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                          setSimulationParams({
                            ...simulationParams,
                            prices: {
                              ...simulationParams.prices,
                              referralFeeLessons: val
                            }
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          textAlign: 'right'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                      幼児モデル（円）
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                      <input
                        type="text"
                        value={simulationParams.prices.referralFeeChildModel.toLocaleString()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                          setSimulationParams({
                            ...simulationParams,
                            prices: {
                              ...simulationParams.prices,
                              referralFeeChildModel: val
                            }
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          textAlign: 'right'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                      家政婦マッチング（円）
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                      <input
                        type="text"
                        value={simulationParams.prices.referralFeeHousekeeperMatching.toLocaleString()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                          setSimulationParams({
                            ...simulationParams,
                            prices: {
                              ...simulationParams.prices,
                              referralFeeHousekeeperMatching: val
                            }
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          textAlign: 'right'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                      専門教師マッチング（円）
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                      <input
                        type="text"
                        value={simulationParams.prices.referralFeeTeacherMatching.toLocaleString()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                          setSimulationParams({
                            ...simulationParams,
                            prices: {
                              ...simulationParams.prices,
                              referralFeeTeacherMatching: val
                            }
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          textAlign: 'right'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 紹介手数料の成約件数 */}
              <div style={{ marginBottom: '20px' }}>
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
                                    type="text"
                                    value={yearMaxConversions[category.key].toLocaleString()}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
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
                                        padding: '1px 3px',
                                        border: '1px solid #ddd',
                                        borderRadius: '2px',
                                        backgroundColor: '#f9fafb',
                                        cursor: 'pointer',
                                        fontSize: '9px',
                                        fontWeight: '600',
                                        color: '#666',
                                        lineHeight: '1',
                                        minWidth: '16px',
                                        width: '16px'
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

              {/* 認定取得支援の成約件数 */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '500', color: '#555' }}>認定取得支援の成約件数（年間）</h4>
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
                        { key: 'kurumin', label: 'くるみん認定取得支援（件）' },
                        { key: 'healthManagement', label: '健康経営優良法人認定取得支援（件）' }
                      ].map((category, categoryIndex) => (
                        <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                          <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                          {years.map(year => {
                            const yearCertificationCounts = simulationParams.certificationSupportCounts?.[year] || {
                              kurumin: year === 2026 ? 0 : 10,
                              healthManagement: year === 2026 ? 0 : 10
                            };
                            return (
                              <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <input
                                    type="text"
                                    value={yearCertificationCounts[category.key].toLocaleString()}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                                      setSimulationParams({
                                        ...simulationParams,
                                        certificationSupportCounts: {
                                          ...(simulationParams.certificationSupportCounts || {}),
                                          [year]: {
                                            ...yearCertificationCounts,
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
                                        const currentValue = yearCertificationCounts[category.key] || 0;
                                        const newValue = currentValue + 1;
                                        setSimulationParams({
                                          ...simulationParams,
                                          certificationSupportCounts: {
                                            ...(simulationParams.certificationSupportCounts || {}),
                                            [year]: {
                                              ...yearCertificationCounts,
                                              [category.key]: newValue
                                            }
                                          }
                                        });
                                      }}
                                      style={{
                                        padding: '1px 3px',
                                        border: '1px solid #ddd',
                                        borderRadius: '2px',
                                        backgroundColor: '#f9fafb',
                                        cursor: 'pointer',
                                        fontSize: '9px',
                                        fontWeight: '600',
                                        color: '#666',
                                        lineHeight: '1',
                                        minWidth: '16px',
                                        width: '16px'
                                      }}
                                    >
                                      ▲
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentValue = yearCertificationCounts[category.key] || 0;
                                        const newValue = Math.max(0, currentValue - 1);
                                        setSimulationParams({
                                          ...simulationParams,
                                          certificationSupportCounts: {
                                            ...(simulationParams.certificationSupportCounts || {}),
                                            [year]: {
                                              ...yearCertificationCounts,
                                              [category.key]: newValue
                                            }
                                          }
                                        });
                                      }}
                                      style={{
                                        padding: '1px 3px',
                                        border: '1px solid #ddd',
                                        borderRadius: '2px',
                                        backgroundColor: '#f9fafb',
                                        cursor: 'pointer',
                                        fontSize: '9px',
                                        fontWeight: '600',
                                        color: '#666',
                                        lineHeight: '1',
                                        minWidth: '16px',
                                        width: '16px'
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
                
                {/* 既存カテゴリー */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>商品カテゴリー</h5>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                      flex: 1,
                                      padding: '4px',
                                      border: '1px solid #ddd',
                                      borderRadius: '4px',
                                      fontSize: '14px',
                                      textAlign: 'right'
                                    }}
                                  />
                                  <span style={{ fontSize: '14px', color: '#666' }}>%</span>
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
                
                {/* 医療関連カテゴリー */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>医療関連</h5>
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
                          { key: 'medicine', label: '薬（％）' },
                          { key: 'vaccination', label: '予防接種（％）' },
                          { key: 'allergyTest', label: 'アレルギー検査（％）' },
                          { key: 'geneticTest', label: '遺伝子DNA検査（％）' }
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
                                  maternityGoods: null,
                                  medicine: null,
                                  vaccination: null,
                                  allergyTest: null,
                                  geneticTest: null,
                                  infantChildInsurance: null,
                                  studentInsurance: null,
                                  educationExpenseInsurance: null,
                                  renovation: null
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
                                  educationExpenseInsurance: 1000,
                                  renovation: 50000
                                }
                              };
                              return (
                                <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                        flex: 1,
                                        padding: '4px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        textAlign: 'right'
                                      }}
                                    />
                                    <span style={{ fontSize: '14px', color: '#666' }}>%</span>
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
                
                {/* 保険関連カテゴリー */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>保険関連</h5>
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
                          { key: 'infantChildInsurance', label: '乳児・児童保険（％）' },
                          { key: 'studentInsurance', label: '学生保険（％）' },
                          { key: 'educationExpenseInsurance', label: '学業費用保険（％）' }
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
                                  maternityGoods: null,
                                  medicine: null,
                                  vaccination: null,
                                  allergyTest: null,
                                  geneticTest: null,
                                  infantChildInsurance: null,
                                  studentInsurance: null,
                                  educationExpenseInsurance: null,
                                  renovation: null
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
                                  educationExpenseInsurance: 1000,
                                  renovation: 50000
                                }
                              };
                              return (
                                <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                        flex: 1,
                                        padding: '4px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        textAlign: 'right'
                                      }}
                                    />
                                    <span style={{ fontSize: '14px', color: '#666' }}>%</span>
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
                
                {/* リフォーム関連カテゴリー */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>リフォーム関連</h5>
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
                          { key: 'renovation', label: '子育て対応リフォーム（％）' }
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
                                  maternityGoods: null,
                                  medicine: null,
                                  vaccination: null,
                                  allergyTest: null,
                                  geneticTest: null,
                                  infantChildInsurance: null,
                                  studentInsurance: null,
                                  educationExpenseInsurance: null,
                                  renovation: null
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
                                  educationExpenseInsurance: 1000,
                                  renovation: 50000
                                }
                              };
                              return (
                                <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                        flex: 1,
                                        padding: '4px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        textAlign: 'right'
                                      }}
                                    />
                                    <span style={{ fontSize: '14px', color: '#666' }}>%</span>
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
                
                {/* アルバム関連カテゴリー */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>アルバム関連</h5>
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
                          { key: 'album', label: 'アルバム制作（％）' },
                          { key: 'maternityPhoto', label: 'マタニティフォト（％）' },
                          { key: 'print', label: 'プリント印刷（％）' }
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
                                  maternityGoods: null,
                                  medicine: null,
                                  vaccination: null,
                                  allergyTest: null,
                                  geneticTest: null,
                                  infantChildInsurance: null,
                                  studentInsurance: null,
                                  educationExpenseInsurance: null,
                                  renovation: null,
                                  album: null
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
                                  educationExpenseInsurance: 1000,
                                  renovation: 50000,
                                  album: 30000
                                }
                              };
                              return (
                                <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                        flex: 1,
                                        padding: '4px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        textAlign: 'right'
                                      }}
                                    />
                                    <span style={{ fontSize: '14px', color: '#666' }}>%</span>
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

              {/* ECリファラル成約件数プレビュー */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '500', color: '#555' }}>ECリファラル成約件数プレビュー</h4>
                
                {/* 既存カテゴリー */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>商品カテゴリー</h5>
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
                                maternityGoods: 1,
                                medicine: 1,
                                vaccination: 1,
                                allergyTest: 1,
                                geneticTest: 1,
                                infantChildInsurance: 1,
                                studentInsurance: 1,
                                educationExpenseInsurance: 1,
                                renovation: 0.5
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
                                educationExpenseInsurance: 1000,
                                renovation: 50000
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

                {/* 医療関連カテゴリー */}
              <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>医療関連</h5>
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
                          { key: 'medicine', label: '薬（件）' },
                          { key: 'vaccination', label: '予防接種（件）' },
                          { key: 'allergyTest', label: 'アレルギー検査（件）' },
                          { key: 'geneticTest', label: '遺伝子DNA検査（件）' }
                        ].map((category, categoryIndex) => (
                          <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                            {years.map(year => {
                              const targetActiveUsers = simulationParams.yearlyTargets[year] || 0;
                              const yearRatios = simulationParams.userRatios?.[year] || {
                                personalFree: 0.50,
                                personalPremium: 0.05,
                                municipality: 0.30,
                                company: 0.15
                              };
                              const personalFree = Math.floor(targetActiveUsers * yearRatios.personalFree);
                              const personalPremium = Math.floor(targetActiveUsers * yearRatios.personalPremium);
                              const company = Math.floor(targetActiveUsers * yearRatios.company);
                              const municipality = Math.floor(targetActiveUsers * yearRatios.municipality);
                              const totalActiveUsers = personalFree + personalPremium + company + municipality;
                              const yearEcReferralSettings = simulationParams.ecReferralSettings?.[year] || {
                                conversionRates: {
                                  essentials: 1,
                                  educationalGoods: 1,
                                  healthFood: 1,
                                  healthGoods: 1,
                                  maternityGoods: 1,
                                  medicine: 1,
                                  vaccination: 1,
                                  allergyTest: 1,
                                  geneticTest: 1,
                                  infantChildInsurance: 1,
                                  studentInsurance: 1,
                                  educationExpenseInsurance: 1
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
                
                {/* 保険関連カテゴリー */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>保険関連</h5>
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
                          { key: 'infantChildInsurance', label: '乳児・児童保険（件）' },
                          { key: 'studentInsurance', label: '学生保険（件）' },
                          { key: 'educationExpenseInsurance', label: '学業費用保険（件）' }
                        ].map((category, categoryIndex) => (
                          <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                            {years.map(year => {
                              const targetActiveUsers = simulationParams.yearlyTargets[year] || 0;
                              const yearRatios = simulationParams.userRatios?.[year] || {
                                personalFree: 0.50,
                                personalPremium: 0.05,
                                municipality: 0.30,
                                company: 0.15
                              };
                              const personalFree = Math.floor(targetActiveUsers * yearRatios.personalFree);
                              const personalPremium = Math.floor(targetActiveUsers * yearRatios.personalPremium);
                              const company = Math.floor(targetActiveUsers * yearRatios.company);
                              const municipality = Math.floor(targetActiveUsers * yearRatios.municipality);
                              const totalActiveUsers = personalFree + personalPremium + company + municipality;
                              const yearEcReferralSettings = simulationParams.ecReferralSettings?.[year] || {
                                conversionRates: {
                                  essentials: 1,
                                  educationalGoods: 1,
                                  healthFood: 1,
                                  healthGoods: 1,
                                  maternityGoods: 1,
                                  medicine: 1,
                                  vaccination: 1,
                                  allergyTest: 1,
                                  geneticTest: 1,
                                  infantChildInsurance: 1,
                                  studentInsurance: 1,
                                  educationExpenseInsurance: 1
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
                
                {/* リフォーム関連カテゴリー（成約件数） */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>リフォーム関連</h5>
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
                          { key: 'renovation', label: '子育て対応リフォーム（件）' }
                        ].map((category, categoryIndex) => (
                          <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                            {years.map(year => {
                              const targetActiveUsers = simulationParams.yearlyTargets[year] || 0;
                              const yearRatios = simulationParams.userRatios?.[year] || {
                                personalFree: 0.50,
                                personalPremium: 0.05,
                                municipality: 0.30,
                                company: 0.15
                              };
                              const personalFree = Math.floor(targetActiveUsers * yearRatios.personalFree);
                              const personalPremium = Math.floor(targetActiveUsers * yearRatios.personalPremium);
                              const company = Math.floor(targetActiveUsers * yearRatios.company);
                              const municipality = Math.floor(targetActiveUsers * yearRatios.municipality);
                              const totalActiveUsers = personalFree + personalPremium + company + municipality;
                              const yearEcReferralSettings = simulationParams.ecReferralSettings?.[year] || {
                                conversionRates: {
                                  essentials: 1,
                                  educationalGoods: 1,
                                  healthFood: 1,
                                  healthGoods: 1,
                                  maternityGoods: 1,
                                  medicine: 1,
                                  vaccination: 1,
                                  allergyTest: 1,
                                  geneticTest: 1,
                                  infantChildInsurance: 1,
                                  studentInsurance: 1,
                                  educationExpenseInsurance: 1,
                                  renovation: 0.5
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
                                  educationExpenseInsurance: 1000,
                                  renovation: 50000
                                }
                              };
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
                
                {/* アルバム関連カテゴリー（成約件数） */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>アルバム関連</h5>
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
                          { key: 'album', label: 'アルバム制作（件）' },
                          { key: 'maternityPhoto', label: 'マタニティフォト（件）' },
                          { key: 'print', label: 'プリント印刷（件）' }
                        ].map((category, categoryIndex) => (
                          <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{category.label}</td>
                            {years.map(year => {
                              const targetActiveUsers = simulationParams.yearlyTargets[year] || 0;
                              const yearRatios = simulationParams.userRatios?.[year] || {
                                personalFree: 0.50,
                                personalPremium: 0.05,
                                municipality: 0.30,
                                company: 0.15
                              };
                              const personalFree = Math.floor(targetActiveUsers * yearRatios.personalFree);
                              const personalPremium = Math.floor(targetActiveUsers * yearRatios.personalPremium);
                              const company = Math.floor(targetActiveUsers * yearRatios.company);
                              const municipality = Math.floor(targetActiveUsers * yearRatios.municipality);
                              const totalActiveUsers = personalFree + personalPremium + company + municipality;
                              const yearEcReferralSettings = simulationParams.ecReferralSettings?.[year] || {
                                conversionRates: {
                                  essentials: 1,
                                  educationalGoods: 1,
                                  healthFood: 1,
                                  healthGoods: 1,
                                  maternityGoods: 1,
                                  medicine: 1,
                                  vaccination: 1,
                                  allergyTest: 1,
                                  geneticTest: 1,
                                  infantChildInsurance: 1,
                                  studentInsurance: 1,
                                  educationExpenseInsurance: 1,
                                  renovation: 0.5,
                                  album: 0.3,
                                  maternityPhoto: 0.15,
                                  print: 0.05
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
                                  educationExpenseInsurance: 1000,
        renovation: 50000,
        album: 3000,
        maternityPhoto: 1000,
        print: 100
                                }
                              };
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
              </div>

              {/* ECリファラルの単価 */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '500', color: '#555' }}>ECリファラルの単価（1件あたり）</h4>
                
                {/* 既存カテゴリー */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>商品カテゴリー</h5>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <th style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '140px' }}>カテゴリ</th>
                          {years.map(year => (
                            <th key={year} style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600', fontSize: '12px', width: '100px' }}>{getYearLabel(year)}</th>
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
                          <td style={{ padding: '6px', border: '1px solid #ddd', fontWeight: '500', fontSize: '12px', width: '140px' }}>{category.label}</td>
                            {years.map(year => {
                            const yearSettings = simulationParams.ecReferralSettings?.[year] || {
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
                            return (
                              <td key={year} style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', width: '100px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <span style={{ fontSize: '11px', color: '#666' }}>￥</span>
                                  <input
                                    type="text"
                                    min="0"
                                    value={(yearSettings.prices[category.key] || 1000).toLocaleString()}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                                      setSimulationParams({
                                        ...simulationParams,
                                        ecReferralSettings: {
                                          ...(simulationParams.ecReferralSettings || {}),
                                          [year]: {
                                            ...yearSettings,
                                            prices: {
                                              ...(yearSettings.prices || {}),
                                              [category.key]: val
                                            }
                                          }
                                        }
                                      });
                                    }}
                                    style={{
                                      flex: 1,
                                      minWidth: 0,
                                      maxWidth: '70px',
                                      padding: '3px 4px',
                                      border: '1px solid #ddd',
                                      borderRadius: '4px',
                                      fontSize: '11px',
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
                                        padding: '1px 3px',
                                        border: '1px solid #ddd',
                                        borderRadius: '2px',
                                        backgroundColor: '#f9fafb',
                                        cursor: 'pointer',
                                        fontSize: '9px',
                                        fontWeight: '600',
                                        color: '#666',
                                        lineHeight: '1',
                                        minWidth: '16px',
                                        width: '16px'
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
                                        padding: '1px 3px',
                                        border: '1px solid #ddd',
                                        borderRadius: '2px',
                                        backgroundColor: '#f9fafb',
                                        cursor: 'pointer',
                                        fontSize: '9px',
                                        fontWeight: '600',
                                        color: '#666',
                                        lineHeight: '1',
                                        minWidth: '16px',
                                        width: '16px'
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
                
                {/* 医療関連カテゴリー */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>医療関連</h5>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <th style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '140px' }}>カテゴリ</th>
                          {years.map(year => (
                            <th key={year} style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600', fontSize: '12px', width: '100px' }}>{getYearLabel(year)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'medicine', label: '薬（円）' },
                          { key: 'vaccination', label: '予防接種（円）' },
                          { key: 'allergyTest', label: 'アレルギー検査（円）' },
                          { key: 'geneticTest', label: '遺伝子DNA検査（円）' }
                        ].map((category, categoryIndex) => (
                          <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td style={{ padding: '6px', border: '1px solid #ddd', fontWeight: '500', fontSize: '12px', width: '140px' }}>{category.label}</td>
                            {years.map(year => {
                              const yearSettings = simulationParams.ecReferralSettings?.[year] || {
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
                                  educationExpenseInsurance: null,
                                  renovation: null
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
                                  educationExpenseInsurance: 1000,
                                  renovation: 50000
                                }
                              };
                              return (
                                <td key={year} style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', width: '100px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <span style={{ fontSize: '11px', color: '#666' }}>￥</span>
                                    <input
                                      type="text"
                                      min="0"
                                      value={(yearSettings.prices[category.key] || 1000).toLocaleString()}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                                        setSimulationParams({
                                          ...simulationParams,
                                          ecReferralSettings: {
                                            ...(simulationParams.ecReferralSettings || {}),
                                            [year]: {
                                              ...yearSettings,
                                              prices: {
                                                ...(yearSettings.prices || {}),
                                              [category.key]: val
                                            }
                                          }
                                        }
                                      });
                                    }}
                                    style={{
                                      flex: 1,
                                        minWidth: 0,
                                        maxWidth: '70px',
                                        padding: '3px 4px',
                                      border: '1px solid #ddd',
                                      borderRadius: '4px',
                                        fontSize: '11px',
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
                                          padding: '1px 3px',
                                        border: '1px solid #ddd',
                                        borderRadius: '2px',
                                        backgroundColor: '#f9fafb',
                                        cursor: 'pointer',
                                          fontSize: '9px',
                                        fontWeight: '600',
                                        color: '#666',
                                        lineHeight: '1',
                                          minWidth: '16px',
                                          width: '16px'
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
                                          padding: '1px 3px',
                                        border: '1px solid #ddd',
                                        borderRadius: '2px',
                                        backgroundColor: '#f9fafb',
                                        cursor: 'pointer',
                                          fontSize: '9px',
                                        fontWeight: '600',
                                        color: '#666',
                                        lineHeight: '1',
                                          minWidth: '16px',
                                          width: '16px'
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
                
                {/* 保険関連カテゴリー */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>保険関連</h5>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <th style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '140px' }}>カテゴリ</th>
                          {years.map(year => (
                            <th key={year} style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600', fontSize: '12px', width: '100px' }}>{getYearLabel(year)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'infantChildInsurance', label: '乳児・児童保険（円）' },
                          { key: 'studentInsurance', label: '学生保険（円）' },
                          { key: 'educationExpenseInsurance', label: '学業費用保険（円）' }
                        ].map((category, categoryIndex) => (
                          <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td style={{ padding: '6px', border: '1px solid #ddd', fontWeight: '500', fontSize: '12px', width: '140px' }}>{category.label}</td>
                            {years.map(year => {
                              const yearSettings = simulationParams.ecReferralSettings?.[year] || {
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
                                  educationExpenseInsurance: null,
                                  renovation: null
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
                                  educationExpenseInsurance: 1000,
                                  renovation: 50000
                                }
                              };
                              return (
                                <td key={year} style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', width: '100px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <span style={{ fontSize: '11px', color: '#666' }}>￥</span>
                                    <input
                                      type="text"
                                      min="0"
                                      value={(yearSettings.prices[category.key] || 1000).toLocaleString()}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                                        setSimulationParams({
                                          ...simulationParams,
                                          ecReferralSettings: {
                                            ...(simulationParams.ecReferralSettings || {}),
                                            [year]: {
                                              ...yearSettings,
                                              prices: {
                                                ...(yearSettings.prices || {}),
                                                [category.key]: val
                                              }
                                            }
                                          }
                                        });
                                      }}
                                      style={{
                                        flex: 1,
                                        minWidth: 0,
                                        maxWidth: '70px',
                                        padding: '3px 4px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '11px',
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
                                          padding: '1px 3px',
                                          border: '1px solid #ddd',
                                          borderRadius: '2px',
                                          backgroundColor: '#f9fafb',
                                          cursor: 'pointer',
                                          fontSize: '9px',
                                          fontWeight: '600',
                                          color: '#666',
                                          lineHeight: '1',
                                          minWidth: '16px',
                                          width: '16px'
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
                                          padding: '1px 3px',
                                          border: '1px solid #ddd',
                                          borderRadius: '2px',
                                          backgroundColor: '#f9fafb',
                                          cursor: 'pointer',
                                          fontSize: '9px',
                                          fontWeight: '600',
                                          color: '#666',
                                          lineHeight: '1',
                                          minWidth: '16px',
                                          width: '16px'
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
                
                {/* リフォーム関連カテゴリー（単価） */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>リフォーム関連</h5>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <th style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '140px' }}>カテゴリ</th>
                          {years.map(year => (
                            <th key={year} style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600', fontSize: '12px', width: '100px' }}>{getYearLabel(year)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'renovation', label: '子育て対応リフォーム（円）' }
                        ].map((category, categoryIndex) => (
                          <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td style={{ padding: '6px', border: '1px solid #ddd', fontWeight: '500', fontSize: '12px', width: '140px' }}>{category.label}</td>
                            {years.map(year => {
                              const yearSettings = simulationParams.ecReferralSettings?.[year] || {
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
                                  educationExpenseInsurance: null,
                                  renovation: null
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
                                  educationExpenseInsurance: 1000,
                                  renovation: 50000
                                }
                              };
                              return (
                                <td key={year} style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', width: '100px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <span style={{ fontSize: '11px', color: '#666' }}>￥</span>
                                    <input
                                      type="text"
                                      min="0"
                                      value={(yearSettings.prices[category.key] || 50000).toLocaleString()}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                                        setSimulationParams({
                                          ...simulationParams,
                                          ecReferralSettings: {
                                            ...(simulationParams.ecReferralSettings || {}),
                                            [year]: {
                                              ...yearSettings,
                                              prices: {
                                                ...(yearSettings.prices || {}),
                                                [category.key]: val
                                              }
                                            }
                                          }
                                        });
                                      }}
                                      style={{
                                        flex: 1,
                                        minWidth: 0,
                                        maxWidth: '70px',
                                        padding: '3px 4px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        textAlign: 'right'
                                      }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentValue = yearSettings.prices[category.key] || 0;
                                          const newValue = currentValue + 1000;
                                          setSimulationParams({
                                            ...simulationParams,
                                            ecReferralSettings: {
                                              ...(simulationParams.ecReferralSettings || {}),
                                              [year]: {
                                                ...yearSettings,
                                                prices: {
                                                  ...(yearSettings.prices || {}),
                                                  [category.key]: newValue
                                                }
                                              }
                                            }
                                          });
                                        }}
                                        style={{
                                          width: '16px',
                                          height: '10px',
                                          padding: 0,
                                          border: '1px solid #ccc',
                                          borderRadius: '2px',
                                          fontSize: '8px',
                                          cursor: 'pointer',
                                          backgroundColor: '#f9fafb'
                                        }}
                                      >+</button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentValue = yearSettings.prices[category.key] || 0;
                                          const newValue = Math.max(0, currentValue - 1000);
                                          setSimulationParams({
                                            ...simulationParams,
                                            ecReferralSettings: {
                                              ...(simulationParams.ecReferralSettings || {}),
                                              [year]: {
                                                ...yearSettings,
                                                prices: {
                                                  ...(yearSettings.prices || {}),
                                                  [category.key]: newValue
                                                }
                                              }
                                            }
                                          });
                                        }}
                                        style={{
                                          width: '16px',
                                          height: '10px',
                                          padding: 0,
                                          border: '1px solid #ccc',
                                          borderRadius: '2px',
                                          fontSize: '8px',
                                          cursor: 'pointer',
                                          backgroundColor: '#f9fafb'
                                        }}
                                      >-</button>
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
                
                {/* アルバム関連カテゴリー（単価） */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#666' }}>アルバム関連</h5>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <th style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '140px' }}>カテゴリ</th>
                          {years.map(year => (
                            <th key={year} style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600', fontSize: '12px', width: '100px' }}>{getYearLabel(year)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'album', label: 'アルバム制作（円）' },
                          { key: 'maternityPhoto', label: 'マタニティフォト（円）' },
                          { key: 'print', label: 'プリント印刷（円）' }
                        ].map((category, categoryIndex) => (
                          <tr key={category.key} style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td style={{ padding: '6px', border: '1px solid #ddd', fontWeight: '500', fontSize: '12px', width: '140px' }}>{category.label}</td>
                            {years.map(year => {
                              const yearSettings = simulationParams.ecReferralSettings?.[year] || {
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
                                  educationExpenseInsurance: null,
                                  renovation: null,
                                  album: null,
                                  maternityPhoto: null,
                                  print: null
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
                                  educationExpenseInsurance: 1000,
        renovation: 50000,
        album: 3000,
        maternityPhoto: 1000,
        print: 100
                                }
                              };
                              const defaultPrice = category.key === 'album' ? 3000 : category.key === 'maternityPhoto' ? 1000 : 100;
                              return (
                                <td key={year} style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', width: '100px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <span style={{ fontSize: '11px', color: '#666' }}>￥</span>
                                    <input
                                      type="text"
                                      min="0"
                                      value={(yearSettings.prices[category.key] || defaultPrice).toLocaleString()}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                                        setSimulationParams({
                                          ...simulationParams,
                                          ecReferralSettings: {
                                            ...(simulationParams.ecReferralSettings || {}),
                                            [year]: {
                                              ...yearSettings,
                                              prices: {
                                                ...(yearSettings.prices || {}),
                                                [category.key]: val
                                              }
                                            }
                                          }
                                        });
                                      }}
                                      style={{
                                        flex: 1,
                                        minWidth: 0,
                                        maxWidth: '70px',
                                        padding: '3px 4px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        textAlign: 'right'
                                      }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentValue = yearSettings.prices[category.key] || 0;
                                          const newValue = currentValue + 1000;
                                          setSimulationParams({
                                            ...simulationParams,
                                            ecReferralSettings: {
                                              ...(simulationParams.ecReferralSettings || {}),
                                              [year]: {
                                                ...yearSettings,
                                                prices: {
                                                  ...(yearSettings.prices || {}),
                                                  [category.key]: newValue
                                                }
                                              }
                                            }
                                          });
                                        }}
                                        style={{
                                          width: '16px',
                                          height: '10px',
                                          padding: 0,
                                          border: '1px solid #ccc',
                                          borderRadius: '2px',
                                          fontSize: '8px',
                                          cursor: 'pointer',
                                          backgroundColor: '#f9fafb'
                                        }}
                                      >+</button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentValue = yearSettings.prices[category.key] || 0;
                                          const newValue = Math.max(0, currentValue - 1000);
                                          setSimulationParams({
                                            ...simulationParams,
                                            ecReferralSettings: {
                                              ...(simulationParams.ecReferralSettings || {}),
                                              [year]: {
                                                ...yearSettings,
                                                prices: {
                                                  ...(yearSettings.prices || {}),
                                                  [category.key]: newValue
                                                }
                                              }
                                            }
                                          });
                                        }}
                                        style={{
                                          width: '16px',
                                          height: '10px',
                                          padding: 0,
                                          border: '1px solid #ccc',
                                          borderRadius: '2px',
                                          fontSize: '8px',
                                          cursor: 'pointer',
                                          backgroundColor: '#f9fafb'
                                        }}
                                      >-</button>
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
            </div>

          <div className="specification-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 売上原価率の設定 */}
            <div>
              <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>売上原価率の設定（年間）</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>項目</th>
                      {years.map(year => (
                        <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'ecReferralRevenueRate', label: 'EC/リファラル関連収入（%）' },
                      { key: 'medicalRevenueRate', label: '医療関連収入（%）' },
                      { key: 'insuranceRevenueRate', label: '保険関連収入（%）' },
                      { key: 'renovationRevenueRate', label: 'リフォーム関連収入（%）' },
                      { key: 'albumRevenueRate', label: 'アルバム関連収入（%）' },
                      { key: 'referralRevenueRate', label: '紹介手数料収入（%）' }
                    ].map((item, itemIndex) => (
                      <tr key={item.key} style={{ backgroundColor: itemIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{item.label}</td>
                        {years.map(year => {
                          const yearCogsSettings = simulationParams.cogsSettings?.[year] || {
                            ecReferralRevenueRate: 50,
                            medicalRevenueRate: 50,
                            insuranceRevenueRate: 50,
                            renovationRevenueRate: 50,
                            albumRevenueRate: 50,
                            referralRevenueRate: 50
                          };
                          return (
                            <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={yearCogsSettings[item.key] || 50}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setSimulationParams({
                                      ...simulationParams,
                                      cogsSettings: {
                                        ...(simulationParams.cogsSettings || {}),
                                        [year]: {
                                          ...yearCogsSettings,
                                          [item.key]: val
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
                                <span style={{ fontSize: '14px', color: '#666' }}>%</span>
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
            
            {/* 販管費の設定 */}
            <div>
              <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>販管費の設定（年間）</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>項目</th>
                      {years.map(year => (
                        <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'backOfficeLaborCost', label: '人件費（バックオフィス）（円）' },
                      { key: 'entertainmentCost', label: '交際費（円）' },
                      { key: 'advertisingCostRate', label: '広告費（売上の%）' },
                      { key: 'transportationCost', label: '交通費（円）' },
                      { key: 'otherSGA', label: 'その他（円）' },
                      { key: 'depreciation', label: '減価償却（円）' }
                    ].map((item, itemIndex) => (
                      <tr key={item.key} style={{ backgroundColor: itemIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{item.label}</td>
                        {years.map(year => {
                          const yearSettings = simulationParams.sgaSettings?.[year] || {
                            backOfficeLaborCost: year === 2026 ? 5000000 : 5000000,
                            entertainmentCost: year === 2026 ? 0 : 1000000,
                            advertisingCostRate: 2,
                            transportationCost: 500000,
                            otherSGA: 500000,
                            depreciation: Math.floor(2000000 * Math.pow(0.9, year - 2026))
                          };
                          const isPercentage = item.key === 'advertisingCostRate';
                          return (
                            <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {!isPercentage && (
                                  <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                                )}
                                <input
                                  type="text"
                                  value={yearSettings[item.key] === null ? '' : isPercentage 
                                    ? yearSettings[item.key].toString()
                                    : yearSettings[item.key].toLocaleString()}
                                  onChange={(e) => {
                                    const val = isPercentage
                                      ? parseFloat(e.target.value) || 0
                                      : parseInt(e.target.value.replace(/,/g, '')) || 0;
                                    setSimulationParams({
                                      ...simulationParams,
                                      sgaSettings: {
                                        ...(simulationParams.sgaSettings || {}),
                                        [year]: {
                                          ...yearSettings,
                                          [item.key]: val
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
                                {isPercentage && (
                                  <span style={{ fontSize: '14px', color: '#666' }}>%</span>
                                )}
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

            {/* システム利用料の設定 */}
            <div>
              <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>自社システム利用料（Google Cloudなど）</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>項目</th>
                      {years.map(year => (
                        <th key={year} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600' }}>{getYearLabel(year)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'baseMonthly', label: '基本料金（月額・円）' },
                      { key: 'perUserMonthly', label: '1人あたり月額（円）' }
                    ].map((item, itemIndex) => (
                      <tr key={item.key} style={{ backgroundColor: itemIndex % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{item.label}</td>
                        {years.map(year => {
                          const yearSettings = simulationParams.systemUsageSettings?.[year] || {
                            baseMonthly: 50000,
                            perUserMonthly: 5
                          };
                          return (
                            <td key={year} style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '14px', color: '#666' }}>￥</span>
                                <input
                                  type="text"
                                  value={yearSettings[item.key] === null ? '' : yearSettings[item.key].toLocaleString()}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value.replace(/,/g, '')) || 0;
                                    setSimulationParams({
                                      ...simulationParams,
                                      systemUsageSettings: {
                                        ...(simulationParams.systemUsageSettings || {}),
                                        [year]: {
                                          ...yearSettings,
                                          [item.key]: val
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

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #eee'
          }}>
            <button
              onClick={() => navigate('/specification/business-plan-detail')}
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
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowSnapshotModal(true)}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                スナップショットを保存
              </button>
              <button
                onClick={handleApply}
                style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                計算して反映
              </button>
            </div>
          </div>

          {/* スナップショット保存モーダル */}
          {showSnapshotModal && (
            <div
              style={{
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
              }}
              onClick={() => {
                setShowSnapshotModal(false);
                setSnapshotName('');
              }}
            >
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '8px',
                  maxWidth: '500px',
                  width: '90%',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
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
                      setShowSnapshotModal(false);
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
            </div>
          )}

          {/* スナップショット読み込みモーダル */}
          {showSnapshotLoadModal && (
            <div
              style={{
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
              }}
              onClick={() => {
                setShowSnapshotLoadModal(false);
              }}
            >
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '8px',
                  maxWidth: '600px',
                  width: '90%',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>スナップショットから反映</h2>
                  <button
                    onClick={() => setShowSnapshotLoadModal(false)}
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
                        スナップショットがありません。先にスナップショットを保存してください。
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
                            // スナップショットのパラメーターを反映
                            if (snapshot.params) {
                              setSimulationParams(snapshot.params);
                              localStorage.setItem('businessPlanSimulationParams', JSON.stringify(snapshot.params));
                            }
                            setShowSnapshotLoadModal(false);
                            alert('スナップショットを反映しました。');
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
                                  setShowSnapshotLoadModal(false);
                                  alert('スナップショットを削除しました。');
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecificationBusinessPlanSimulation;


