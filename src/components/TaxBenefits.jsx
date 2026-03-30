import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOwnerId } from '../hooks/useOwnerId';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './TaxBenefits.css';

const TaxBenefits = () => {
  const { currentUser } = useAuth();
  const { ownerId, loading: ownerIdLoading } = useOwnerId();
  const [basicInfo, setBasicInfo] = useState(null);

  // Firestoreから基本情報を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
    
    const unsubscribe = onSnapshot(userDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.basicInfo) {
          setBasicInfo(data.basicInfo);
          // デバッグ用: 基本情報をコンソールに出力
          console.log('基本情報読み込み:', data.basicInfo);
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

  // 扶養控除の計算
  const calculateDependentDeduction = (age, isLivingTogether = true) => {
    if (age < 16) return 0; // 0-15歳: 対象外
    if (age < 19) return 38; // 16-18歳: 38万円
    if (age < 23) return 63; // 19-22歳: 63万円（特定扶養親族）
    if (age < 70) return 38; // 23-69歳: 38万円
    // 70歳以上
    return isLivingTogether ? 58 : 48; // 70歳以上（同居）: 58万円、70歳以上（別居）: 48万円
  };

  // 社会保険料控除の計算（雇用形態に応じて）
  const calculateSocialInsuranceDeduction = (income, employmentType, isSelfEmployed) => {
    if (!income || income <= 0) return 0;
    
    // 自営業の場合
    if (isSelfEmployed) {
      // 国民健康保険料: 年収の約8-10%（所得割）
      // 国民年金: 約20万円/年（固定）
      // 合計: 年収の約10-12%程度
      return Math.floor(income * 0.11) + 200000; // 概算
    }
    
    // 雇用形態に応じた社会保険料率
    if (['正社員', '契約社員'].includes(employmentType)) {
      // 健康保険: 約5%、厚生年金: 約9%、雇用保険: 約0.3%、合計約14-15%
      return Math.floor(income * 0.15);
    } else if (['パート', 'アルバイト'].includes(employmentType)) {
      // パート・アルバイトの場合、条件によって社会保険に加入しない場合もある
      // 加入している場合: 約10-12%、加入していない場合: 国民健康保険・国民年金で約10-11%
      return Math.floor(income * 0.11);
    }
    
    // その他の場合（デフォルト）
    return Math.floor(income * 0.12);
  };

  // 所得税の計算（簡易版）
  const calculateIncomeTax = (taxableIncome) => {
    if (taxableIncome <= 1950000) return Math.floor(taxableIncome * 0.05);
    if (taxableIncome <= 3300000) return Math.floor(97500 + (taxableIncome - 1950000) * 0.10);
    if (taxableIncome <= 6950000) return Math.floor(232500 + (taxableIncome - 3300000) * 0.20);
    if (taxableIncome <= 9000000) return Math.floor(962500 + (taxableIncome - 6950000) * 0.23);
    if (taxableIncome <= 18000000) return Math.floor(1437500 + (taxableIncome - 9000000) * 0.33);
    if (taxableIncome <= 40000000) return Math.floor(4400000 + (taxableIncome - 18000000) * 0.40);
    return Math.floor(13200000 + (taxableIncome - 40000000) * 0.45);
  };

  // 住民税の計算（簡易版）
  const calculateResidentTax = (taxableIncome) => {
    // 所得割: 課税所得の10%（都道府県民税4% + 市区町村民税6%）
    return Math.floor(taxableIncome * 0.10);
  };

  // 税金優遇の計算
  const taxBenefits = useMemo(() => {
    if (!basicInfo) return null;

    const motherIncome = parseInt(basicInfo.annualIncome || 0, 10) * 10000; // 万円を円に変換
    const fatherIncome = parseInt(basicInfo.fatherAnnualIncome || 0, 10) * 10000;
    const children = basicInfo.children || [];
    
    // 年収が0の場合は計算しない
    if (motherIncome === 0 && fatherIncome === 0) return null;
    
    // 子供の年齢を設定（デフォルトは0歳）
    const childrenAges = children.map((child, index) => {
      if (child.age !== undefined) return child.age;
      // 年齢が設定されていない場合は、出産から経過した年数で推定
      return 0; // デフォルトは0歳
    });

    // 扶養控除額の計算
    let totalDependentDeduction = 0;
    childrenAges.forEach(age => {
      // 子供は通常同居していると仮定
      totalDependentDeduction += calculateDependentDeduction(age, true);
    });

    // 基礎控除: 48万円
    const basicDeduction = 480000;
    
    // 社会保険料控除（雇用形態に応じて計算）
    const motherSocialInsurance = calculateSocialInsuranceDeduction(
      motherIncome,
      basicInfo.employmentType || '',
      basicInfo.isSelfEmployed || false
    );
    const fatherSocialInsurance = calculateSocialInsuranceDeduction(
      fatherIncome,
      basicInfo.fatherEmploymentType || '',
      basicInfo.fatherIsSelfEmployed || false
    );

    // 控除後の所得（子供がいる場合）
    // 16歳未満の子供でも、配偶者控除やその他の控除を考慮する必要があるが、
    // 現在の計算では扶養控除のみを考慮している
    const motherTaxableIncome = Math.max(0, motherIncome - basicDeduction - motherSocialInsurance - (totalDependentDeduction * 10000 / 2)); // 扶養控除は半分ずつ
    const fatherTaxableIncome = Math.max(0, fatherIncome - basicDeduction - fatherSocialInsurance - (totalDependentDeduction * 10000 / 2));

    // 子供がいない場合の税金（比較用）
    // ただし、実際には配偶者がいる場合は配偶者控除が適用されるが、ここでは簡略化
    const motherTaxableIncomeWithoutChildren = Math.max(0, motherIncome - basicDeduction - motherSocialInsurance);
    const fatherTaxableIncomeWithoutChildren = Math.max(0, fatherIncome - basicDeduction - fatherSocialInsurance);

    // 所得税の計算
    const motherIncomeTaxWithChildren = calculateIncomeTax(motherTaxableIncome);
    const fatherIncomeTaxWithChildren = calculateIncomeTax(fatherTaxableIncome);
    const motherIncomeTaxWithoutChildren = calculateIncomeTax(motherTaxableIncomeWithoutChildren);
    const fatherIncomeTaxWithoutChildren = calculateIncomeTax(fatherTaxableIncomeWithoutChildren);

    // 住民税の計算
    const motherResidentTaxWithChildren = calculateResidentTax(motherTaxableIncome);
    const fatherResidentTaxWithChildren = calculateResidentTax(fatherTaxableIncome);
    const motherResidentTaxWithoutChildren = calculateResidentTax(motherTaxableIncomeWithoutChildren);
    const fatherResidentTaxWithoutChildren = calculateResidentTax(fatherTaxableIncomeWithoutChildren);

    // 税金優遇額の計算
    const motherIncomeTaxBenefit = motherIncomeTaxWithoutChildren - motherIncomeTaxWithChildren;
    const fatherIncomeTaxBenefit = fatherIncomeTaxWithoutChildren - fatherIncomeTaxWithChildren;
    const motherResidentTaxBenefit = motherResidentTaxWithoutChildren - motherResidentTaxWithChildren;
    const fatherResidentTaxBenefit = fatherResidentTaxWithoutChildren - fatherResidentTaxWithChildren;

    const totalIncomeTaxBenefit = motherIncomeTaxBenefit + fatherIncomeTaxBenefit;
    const totalResidentTaxBenefit = motherResidentTaxBenefit + fatherResidentTaxBenefit;
    const totalTaxBenefit = totalIncomeTaxBenefit + totalResidentTaxBenefit;

    // デバッグ用: 計算結果をコンソールに出力
    console.log('税金優遇計算結果:', {
      motherIncome,
      fatherIncome,
      childrenAges,
      totalDependentDeduction,
      motherSocialInsurance,
      fatherSocialInsurance,
      motherTaxableIncome,
      fatherTaxableIncome,
      motherTaxableIncomeWithoutChildren,
      fatherTaxableIncomeWithoutChildren,
      motherIncomeTaxBenefit,
      fatherIncomeTaxBenefit,
      motherResidentTaxBenefit,
      fatherResidentTaxBenefit,
      totalTaxBenefit
    });

    return {
      dependentDeduction: totalDependentDeduction * 10000, // 万円を円に変換
      mother: {
        incomeTax: {
          withChildren: motherIncomeTaxWithChildren,
          withoutChildren: motherIncomeTaxWithoutChildren,
          benefit: motherIncomeTaxBenefit
        },
        residentTax: {
          withChildren: motherResidentTaxWithChildren,
          withoutChildren: motherResidentTaxWithoutChildren,
          benefit: motherResidentTaxBenefit
        }
      },
      father: {
        incomeTax: {
          withChildren: fatherIncomeTaxWithChildren,
          withoutChildren: fatherIncomeTaxWithoutChildren,
          benefit: fatherIncomeTaxBenefit
        },
        residentTax: {
          withChildren: fatherResidentTaxWithChildren,
          withoutChildren: fatherResidentTaxWithoutChildren,
          benefit: fatherResidentTaxBenefit
        }
      },
      total: {
        incomeTaxBenefit: totalIncomeTaxBenefit,
        residentTaxBenefit: totalResidentTaxBenefit,
        totalBenefit: totalTaxBenefit
      }
    };
  }, [basicInfo]);

  // グラフ用のデータ
  const chartData = useMemo(() => {
    if (!taxBenefits) return [];

    return [
      {
        name: '母親',
        '所得税優遇': taxBenefits.mother.incomeTax.benefit / 10000,
        '住民税優遇': taxBenefits.mother.residentTax.benefit / 10000
      },
      {
        name: '父親',
        '所得税優遇': taxBenefits.father.incomeTax.benefit / 10000,
        '住民税優遇': taxBenefits.father.residentTax.benefit / 10000
      },
      {
        name: '合計',
        '所得税優遇': taxBenefits.total.incomeTaxBenefit / 10000,
        '住民税優遇': taxBenefits.total.residentTaxBenefit / 10000
      }
    ];
  }, [taxBenefits]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="tax-benefits-page">
      <div className="tax-benefits-content-card">
        <div className="tax-benefits-content">
          <div className="intro-section">
            <div className="intro-header">
              <div>
                <h2>税金優遇概算</h2>
                <p>
                  子供が生まれることで受けられる税金の優遇措置を概算でご確認いただけます。
                  扶養控除や各種控除により、所得税・住民税が軽減されます。
                </p>
              </div>
            </div>
          </div>

          {!basicInfo ? (
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '16px' }}>
                マイページで基本情報を設定してください。
              </p>
            </div>
          ) : (!basicInfo.annualIncome && !basicInfo.fatherAnnualIncome) ? (
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '16px' }}>
                マイページで年収を設定してください。
              </p>
            </div>
          ) : !taxBenefits ? (
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '16px' }}>
                年収が設定されていないため、計算できません。
              </p>
            </div>
          ) : (
            <>
              {/* 税金優遇の合計表示 */}
              <div className="summary-section">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  年間の税金優遇額（概算）
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ 
                    padding: '16px', 
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    borderRadius: '12px', 
                    border: '1px solid #3b82f6',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>所得税優遇</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                      {taxBenefits ? `${(taxBenefits.total.incomeTaxBenefit / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円` : '0万円'}
                    </div>
                  </div>
                  <div style={{ 
                    padding: '16px', 
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    borderRadius: '12px', 
                    border: '1px solid #10b981',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>住民税優遇</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#065f46' }}>
                      {taxBenefits ? `${(taxBenefits.total.residentTaxBenefit / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円` : '0万円'}
                    </div>
                  </div>
                  <div style={{ 
                    padding: '16px', 
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: '12px', 
                    border: '1px solid #f59e0b',
                    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.1)'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>合計優遇額</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#92400e' }}>
                      {taxBenefits ? `${(taxBenefits.total.totalBenefit / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円` : '0万円'}
                    </div>
                  </div>
                </div>
                
                {/* 該当がなく金額が0の場合の注意事項 */}
                {taxBenefits && taxBenefits.total && taxBenefits.total.totalBenefit === 0 && (
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#fef3c7', 
                    borderRadius: '8px', 
                    border: '1px solid #fbbf24',
                    marginTop: '24px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '8px' }}>
                      【注意事項】
                    </div>
                    <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
                      <p style={{ margin: '0 0 12px 0' }}>
                        表示される金額は概算であり、実際の優遇額とは異なる場合があります。
                        個別の状況（社会保険料、各種控除、配偶者控除など）によって変動するため、詳細は税務署や税理士にご確認ください。
                      </p>
                      <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                        社会保険料控除の計算方法（雇用形態別）:
                      </p>
                      <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
                        <li>正社員・契約社員: 年収の約15%（健康保険・厚生年金・雇用保険など）</li>
                        <li>パート・アルバイト: 年収の約11%（社会保険加入状況により異なる）</li>
                        <li>自営業: 年収の約11% + 20万円（国民健康保険・国民年金など）</li>
                      </ul>
                      <p style={{ margin: '0 0 8px 0' }}>
                        16歳未満の子供は扶養控除の対象外ですが、児童手当の対象となります。
                      </p>
                      <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                        所得税の扶養控除額（年齢別）:
                      </p>
                      <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
                        <li>0-15歳: 対象外</li>
                        <li>16-18歳: 38万円</li>
                        <li>19-22歳（特定扶養親族）: 63万円</li>
                        <li>23-69歳: 38万円</li>
                        <li>70歳以上（同居）: 58万円</li>
                        <li>70歳以上（別居）: 48万円</li>
                      </ul>
                      <p style={{ margin: '0 0 12px 0' }}>
                        なお、住民税の扶養控除額は所得税とは異なる場合があります。詳細は税務署や税理士にご確認ください。
                      </p>
                      <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                        子育て世帯向けの住宅ローン控除・リフォーム控除:
                      </p>
                      <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
                        <li>子育て世帯向け住宅ローン控除の拡充: 2024年の税制改正により、子育て世帯が一定の要件を満たす住宅を取得した場合、控除期間や控除額が増加する特例が適用されます</li>
                        <li>子育て対応リフォーム控除: 子育て世帯が住宅内での子供の安全性や利便性を向上させるためのリフォームを行う場合、工事費用の10％が所得税から控除されます（工事費用の限度額250万円、最大控除額25万円）</li>
                      </ul>
                      <p style={{ margin: 0 }}>
                        住宅ローン控除やリフォーム控除の適用には、省エネ性能や取得時期などの要件を満たす必要があります。詳細は税務署や税理士にご確認ください。
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* グラフ表示 */}
              <div className="chart-section">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  所得税・住民税の優遇額（概算）
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 13, fill: '#374151', fontWeight: '500' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 13, fill: '#6b7280', fontWeight: '400' }}
                      tickFormatter={(value) => `${value}万円`}
                      label={{ value: '優遇額（万円）', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151', fontSize: '14px', fontWeight: '500' } }}
                    />
                    <Tooltip 
                      formatter={(value) => `${value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`}
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="所得税優遇" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="住民税優遇" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 詳細情報 */}
              <div className="details-section">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  税金優遇の詳細
                </h3>
                
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                    基本情報
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ 
                      padding: '12px', 
                      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>母親の年収</div>
                      <div style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                        {basicInfo.annualIncome ? `${basicInfo.annualIncome}万円` : '未設定'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        {basicInfo.employmentType || '雇用形態未設定'}
                        {basicInfo.isSelfEmployed ? '（自営業）' : ''}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>父親の年収</div>
                      <div style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                        {basicInfo.fatherAnnualIncome ? `${basicInfo.fatherAnnualIncome}万円` : '未設定'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        {basicInfo.fatherEmploymentType || '雇用形態未設定'}
                        {basicInfo.fatherIsSelfEmployed ? '（自営業）' : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                    扶養控除
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>
                    16歳以上の子供を扶養している場合、扶養控除が適用されます。
                  </p>
                  <div style={{ 
                    padding: '16px', 
                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                    borderRadius: '12px',
                    border: '1px solid #d1d5db'
                  }}>
                    <div style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                      扶養控除額: {taxBenefits ? `${(taxBenefits.dependentDeduction / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円` : '0万円'}
                    </div>
                    {basicInfo.children && basicInfo.children.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                        子供の数: {basicInfo.children.length}人
                        {basicInfo.children.some(child => {
                          const age = child.age !== undefined ? child.age : 0;
                          return age >= 16;
                        }) ? '（16歳以上: 扶養控除対象）' : '（16歳未満: 扶養控除対象外）'}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                    母親の税金優遇
                  </h4>
                  {basicInfo.annualIncome ? (
                    <>
                      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>
                        <strong>年収:</strong> {basicInfo.annualIncome}万円
                        {basicInfo.employmentType && ` / 雇用形態: ${basicInfo.employmentType}`}
                        {basicInfo.isSelfEmployed && '（自営業）'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                        <div style={{ 
                          padding: '16px', 
                          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                          borderRadius: '12px',
                          border: '1px solid #3b82f6',
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
                        }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>所得税優遇</div>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af' }}>
                            {taxBenefits ? `${(taxBenefits.mother.incomeTax.benefit / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円` : '0万円'}
                          </div>
                        </div>
                        <div style={{ 
                          padding: '16px', 
                          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                          borderRadius: '12px',
                          border: '1px solid #10b981',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
                        }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>住民税優遇</div>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#065f46' }}>
                            {taxBenefits ? `${(taxBenefits.mother.residentTax.benefit / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円` : '0万円'}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '16px', background: '#f3f4f6', borderRadius: '8px', color: '#6b7280', fontSize: '14px' }}>
                      年収が設定されていないため、計算できません。
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                    父親の税金優遇
                  </h4>
                  {basicInfo.fatherAnnualIncome ? (
                    <>
                      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>
                        <strong>年収:</strong> {basicInfo.fatherAnnualIncome}万円
                        {basicInfo.fatherEmploymentType && ` / 雇用形態: ${basicInfo.fatherEmploymentType}`}
                        {basicInfo.fatherIsSelfEmployed && '（自営業）'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                        <div style={{ 
                          padding: '16px', 
                          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                          borderRadius: '12px',
                          border: '1px solid #3b82f6',
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
                        }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>所得税優遇</div>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af' }}>
                            {taxBenefits ? `${(taxBenefits.father.incomeTax.benefit / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円` : '0万円'}
                          </div>
                        </div>
                        <div style={{ 
                          padding: '16px', 
                          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                          borderRadius: '12px',
                          border: '1px solid #10b981',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
                        }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>住民税優遇</div>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#065f46' }}>
                            {taxBenefits ? `${(taxBenefits.father.residentTax.benefit / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円` : '0万円'}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '16px', background: '#f3f4f6', borderRadius: '8px', color: '#6b7280', fontSize: '14px' }}>
                      年収が設定されていないため、計算できません。
                    </div>
                  )}
                </div>

                {/* 該当がある場合の注意事項（詳細情報セクションの最後） */}
                {taxBenefits && taxBenefits.total && taxBenefits.total.totalBenefit > 0 && (
                  <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                    <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '8px' }}>
                      【注意事項】
                    </div>
                    <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
                      <p style={{ margin: '0 0 12px 0' }}>
                        表示される金額は概算であり、実際の優遇額とは異なる場合があります。
                        個別の状況（社会保険料、各種控除、配偶者控除など）によって変動するため、詳細は税務署や税理士にご確認ください。
                      </p>
                      <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                        社会保険料控除の計算方法（雇用形態別）:
                      </p>
                      <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
                        <li>正社員・契約社員: 年収の約15%（健康保険・厚生年金・雇用保険など）</li>
                        <li>パート・アルバイト: 年収の約11%（社会保険加入状況により異なる）</li>
                        <li>自営業: 年収の約11% + 20万円（国民健康保険・国民年金など）</li>
                      </ul>
                      <p style={{ margin: '0 0 8px 0' }}>
                        16歳未満の子供は扶養控除の対象外ですが、児童手当の対象となります。
                      </p>
                      <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                        所得税の扶養控除額（年齢別）:
                      </p>
                      <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
                        <li>0-15歳: 対象外</li>
                        <li>16-18歳: 38万円</li>
                        <li>19-22歳（特定扶養親族）: 63万円</li>
                        <li>23-69歳: 38万円</li>
                        <li>70歳以上（同居）: 58万円</li>
                        <li>70歳以上（別居）: 48万円</li>
                      </ul>
                      <p style={{ margin: '0 0 12px 0' }}>
                        なお、住民税の扶養控除額は所得税とは異なる場合があります。詳細は税務署や税理士にご確認ください。
                      </p>
                      <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                        子育て世帯向けの住宅ローン控除・リフォーム控除:
                      </p>
                      <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
                        <li>子育て世帯向け住宅ローン控除の拡充: 2024年の税制改正により、子育て世帯が一定の要件を満たす住宅を取得した場合、控除期間や控除額が増加する特例が適用されます</li>
                        <li>子育て対応リフォーム控除: 子育て世帯が住宅内での子供の安全性や利便性を向上させるためのリフォームを行う場合、工事費用の10％が所得税から控除されます（工事費用の限度額250万円、最大控除額25万円）</li>
                      </ul>
                      <p style={{ margin: 0 }}>
                        住宅ローン控除やリフォーム控除の適用には、省エネ性能や取得時期などの要件を満たす必要があります。詳細は税務署や税理士にご確認ください。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxBenefits;

