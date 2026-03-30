import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Specification.css';

// 企業向けケーススタディデータ
const ENTERPRISE_CASE_STUDIES = [
  {
    id: 'challenge-4',
    category: '企業の課題',
    title: '国への報告業務が煩雑',
    description: '次世代育成支援対策推進法に基づく行動計画の策定・実施報告や、健康経営優良法人認定の申請など、国への報告業務が煩雑で、担当者の負担が大きい。',
    impact: '報告業務に時間がかかる、報告漏れのリスクがある、担当者の負担が大きい',
    solution: '出産支援パーソナルアプリの利用状況レポートにより、報告に必要なデータを自動的に集計・可視化し、報告業務を効率化する',
    effect: '報告業務の時間を大幅に短縮でき、報告漏れのリスクがなくなる。担当者の負担が軽減され、他の業務に集中できる',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/government-reporting'
  },
  {
    id: 'challenge-5',
    category: '企業の課題',
    title: '男性の育児休業取得率が極めて低い',
    description: '男性の育児休業取得率が極めて低く、育児と仕事の両立支援が不十分。男性の育児参加を促進する仕組みが必要。',
    impact: '男性の育児参加が進まない、女性の育児負担が大きい、働き方改革が進まない',
    solution: '出産支援パーソナルアプリの導入により、男性従業員も育児休業や育児支援制度を利用しやすくする。また、両立支援等助成金（出生時両立支援コース）の申請により、企業も助成金を受けられる',
    effect: '男性の育児休業取得率が向上し、育児と仕事の両立が進む。企業も助成金を受けられ、従業員の満足度が向上する',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/male-childcare-leave'
  },
  {
    id: 'challenge-1',
    category: '企業の課題',
    title: '従業員の育児と仕事の両立支援が不十分',
    description: '育児休業取得率が低く、特に男性の育児休業取得率が極めて低い。育児と仕事の両立を支援する仕組みが不十分で、従業員の離職や転職を招いている。',
    impact: '優秀な人材の離職、採用コストの増加、企業の生産性低下',
    solution: '出産支援パーソナルアプリを福利厚生として導入し、従業員の育児と仕事の両立を包括的に支援する',
    effect: '育児休業取得率の向上、従業員の満足度向上、離職率の低下、企業の生産性向上',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/work-life-balance'
  },
  {
    id: 'challenge-2',
    category: '企業の課題',
    title: '子育て支援施策の効果が見えない',
    description: '子育て支援に取り組んでいるが、その効果が可視化できず、経営層への説明が難しい。従業員のニーズも把握できていない。',
    impact: '子育て支援施策への投資対効果が不明確、経営層の理解が得られにくい',
    solution: 'アプリの利用状況レポートにより、従業員の利用状況やニーズを可視化し、施策の効果を定量的に示す',
    effect: '施策の効果を定量的に把握でき、経営層への説明が容易になる。従業員のニーズに基づいた施策改善が可能になる',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/policy-effectiveness'
  },
  {
    id: 'challenge-3',
    category: '企業の課題',
    title: '健康経営や働き方改革への取り組みが不十分',
    description: '健康経営優良法人認定やくるみん認定の取得を目指しているが、具体的な取り組みが不足している。',
    impact: '企業の社会的評価が向上しない、優秀な人材の採用が困難',
    solution: '出産支援パーソナルアプリの導入により、従業員の健康管理やライフイベント支援を実現し、認定取得に貢献する',
    effect: '健康経営優良法人認定やくるみん認定の取得に貢献し、企業の社会的評価が向上する',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/health-management'
  },
  {
    id: 'benefit-1',
    category: '企業が得られるメリット',
    title: '離職率の低下と採用コストの削減',
    description: '従業員の育児と仕事の両立を支援することで、離職率が低下し、採用コストを削減できる。',
    metrics: '離職率10%低下、採用コスト年間500万円削減（従業員100名規模の場合）',
    evidence: '育児支援施策を実施している企業では、離職率が平均10%低下する傾向がある（厚生労働省調査）',
    roi: '投資対効果：導入費用の3倍以上の効果が期待できる',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/turnover-reduction'
  },
  {
    id: 'benefit-2',
    category: '企業が得られるメリット',
    title: '従業員の満足度向上と生産性向上',
    description: '従業員の満足度が向上し、仕事への集中力や生産性が向上する。',
    metrics: '従業員満足度15%向上、生産性5%向上（従業員100名規模の場合）',
    evidence: '福利厚生が充実している企業では、従業員の満足度が高く、生産性も高い傾向がある（経済産業省調査）',
    roi: '投資対効果：従業員1人あたり月額500円の投資で、年間6,000円以上の生産性向上効果が期待できる',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/employee-satisfaction'
  },
  {
    id: 'benefit-3',
    category: '企業が得られるメリット',
    title: '企業の社会的評価の向上',
    description: '健康経営優良法人認定やくるみん認定の取得により、企業の社会的評価が向上する。',
    metrics: '健康経営優良法人認定取得、くるみん認定取得、ESG評価の向上',
    evidence: '健康経営優良法人認定企業は、金融機関からの優遇金利や公共調達での優遇措置を受けられる',
    roi: '投資対効果：認定取得により、金融機関からの優遇金利や公共調達での優遇措置により、年間数百万円の効果が期待できる',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/social-evaluation'
  },
  {
    id: 'employee-benefit-1',
    category: '従業員が得られるメリット',
    title: '育児と仕事の両立が容易になる',
    description: '支援制度の情報を一元管理でき、申請手続きが簡単になることで、育児と仕事の両立が容易になる。',
    impact: '育児休業の取得がしやすくなる、申請手続きの負担が軽減される、育児の不安が解消される',
    example: '育児休業給付金の申請手続きが分かりやすくなり、申請の成功率が向上する。申請期限を逃すリスクがなくなる。',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/employee-work-life-balance'
  },
  {
    id: 'employee-benefit-2',
    category: '従業員が得られるメリット',
    title: '経済的な負担が軽減される',
    description: '受給可能な支援制度の全体像と支給金額の合計を把握でき、経済的な見通しを立てやすくなる。',
    impact: '出産・育児にかかる費用の見通しが立てやすくなる、支援制度を最大限に活用できる',
    example: '出産育児一時金、育児休業給付金、児童手当など、複数の支援制度から受給できる金額の合計を把握でき、経済的な不安が軽減される。',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/employee-financial-relief'
  },
  {
    id: 'employee-benefit-3',
    category: '従業員が得られるメリット',
    title: '育児に関する不安が解消される',
    description: 'AIアシスタント機能により、24時間365日いつでも育児に関する相談やアドバイスを受けられる。',
    impact: '育児の不安が即座に解消される、専門知識に基づいた適切な判断ができる、育児の負担が軽減される',
    example: '夜中に子どもの体調不良で不安になったときでも、AIアシスタントに相談でき、適切なアドバイスを受けられる。',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/employee-childcare-support'
  }
];

// 個人ユーザー向けケーススタディデータ
const INDIVIDUAL_CASE_STUDIES = [
  {
    id: 'pregnancy-anxiety-1',
    category: '妊娠期の不安',
    title: '支援制度の情報が分からない',
    description: '妊娠が分かってから、どのような支援制度があるのか、どこで申請すればいいのか分からない。情報が分散していて、必要な情報を見つけるのに時間がかかる。',
    pain: '情報収集に時間がかかる、必要な支援制度を見逃してしまう可能性がある、申請手続きが分からない',
    solution: '出産支援パーソナルアプリにより、支援制度の情報を一元管理し、検索・閲覧できるようにする',
    benefit: '必要な支援制度を効率的に発見できる、申請手続きが分かりやすくなる、支援制度を見逃すリスクがなくなる',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/pregnancy-information'
  },
  {
    id: 'pregnancy-anxiety-2',
    category: '妊娠期の不安',
    title: '申請期限を逃してしまう不安',
    description: '出産育児一時金や出産手当金など、申請期限がある支援制度を逃してしまうのではないかと不安になる。',
    pain: '申請期限を忘れてしまう、複数の申請を同時に管理するのが難しい、申請手続きが複雑で分からない',
    solution: 'アクション管理機能により、申請予定の制度を管理し、申請期限を設定することで、期限を逃さないようサポートする',
    benefit: '申請期限を逃すリスクが大幅に低減する、複数の申請を同時に管理できる、効率的な申請スケジュールを組める',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/pregnancy-deadline'
  },
  {
    id: 'pregnancy-anxiety-3',
    category: '妊娠期の不安',
    title: '経済的な不安',
    description: '出産・育児にかかる費用がどのくらいになるのか分からず、経済的な不安を感じる。',
    pain: '出産・育児にかかる費用の見通しが立てられない、どのくらいの支援を受けられるのか分からない',
    solution: '統計情報の表示により、カテゴリ別の支援制度の件数や支給金額の合計を表示し、全体像を把握できるようにする',
    benefit: '受給可能な支援制度の全体像と支給金額の合計を把握できる、経済的な見通しを立てやすくなる、安心して出産・育児に臨める',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/pregnancy-financial'
  },
  {
    id: 'pregnancy-anxiety-4',
    category: '妊娠期の不安',
    title: '健診記録の管理が煩雑',
    description: '妊婦健診の記録を紙の母子手帳で管理するのが煩雑で、失くしてしまうリスクがある。',
    pain: '紙の母子手帳を失くすリスクがある、健診記録を確認するのに時間がかかる、医療機関への持参が面倒',
    solution: '電子母子手帳機能により、妊婦健診の記録を電子化し、いつでも確認できるようにする',
    benefit: '紙の母子手帳を失くすリスクがなくなる、いつでもどこでも記録を確認できる、医療機関への持参も不要で、データの共有も容易になる',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/pregnancy-medical-record'
  },
  {
    id: 'postpartum-anxiety-1',
    category: '出産後の不安',
    title: '育児に関する疑問や不安',
    description: '出産後、育児に関する疑問や不安が多く、すぐに相談できる人がいない。',
    pain: '育児の疑問や不安をすぐに解決したい、専門的なアドバイスが欲しい、24時間いつでも相談したい',
    solution: 'AIアシスタント機能により、24時間365日いつでも育児に関する相談やアドバイスを受けられる伴走型育児支援を提供する',
    benefit: 'いつでも気軽に相談でき、育児の不安を解消できる、専門知識に基づいたアドバイスにより、適切な判断ができる',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/postpartum-childcare-anxiety'
  },
  {
    id: 'postpartum-anxiety-2',
    category: '出産後の不安',
    title: '育児休業の申請手続きが複雑',
    description: '育児休業給付金の申請手続きが複雑で、必要な書類や手続きが分からない。',
    pain: '申請手続きが複雑で分からない、必要な書類が分からない、申請期限を逃してしまうリスクがある',
    solution: '支援制度の詳細情報表示により、必要な書類や手続きを明確に示す。AIアシスタント機能により、疑問に即座に回答する',
    benefit: '申請に必要な情報を正確に把握でき、申請の成功率が向上する、申請期限を逃すリスクがなくなる',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/postpartum-leave-application'
  },
  {
    id: 'postpartum-anxiety-3',
    category: '出産後の不安',
    title: '家族で情報を共有したい',
    description: 'パートナーと育児に関する情報を共有したいが、紙の書類では共有しにくい。',
    pain: '家族間で情報を共有したい、申請手続きを分担したい、育児の負担を分散したい',
    solution: 'アカウント共有機能により、家族やパートナーとアカウントを共有し、申請手続きや記録を共同で管理できる',
    benefit: '家族間で情報を共有でき、申請手続きを分担できる、パートナーも同じ情報にアクセスできるため、育児の負担を分散できる',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/postpartum-family-sharing'
  },
  {
    id: 'postpartum-anxiety-4',
    category: '出産後の不安',
    title: '子どもの医療費負担',
    description: '子どもの医療費がどのくらいかかるのか分からず、経済的な不安を感じる。',
    pain: '子どもの医療費負担が分からない、医療費助成制度の申請手続きが分からない',
    solution: '乳幼児医療費助成制度の情報を提供し、申請手続きをサポートする',
    benefit: '医療費負担を軽減できる、申請手続きが分かりやすくなる、経済的な不安が軽減される',
    hasDetailPage: true,
    detailPagePath: '/specification/case-study/postpartum-medical-cost'
  }
];

const SpecificationCaseStudy = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // カテゴリー一覧を取得
  const categories = ['all', '企業向け', '個人向け'];

  // フィルタリングされたデータ
  const filteredData = selectedCategory === 'all' 
    ? [...ENTERPRISE_CASE_STUDIES, ...INDIVIDUAL_CASE_STUDIES]
    : selectedCategory === '企業向け'
    ? ENTERPRISE_CASE_STUDIES
    : INDIVIDUAL_CASE_STUDIES;

  const handleCardClick = (item) => {
    if (item.hasDetailPage && item.detailPagePath) {
      navigate(item.detailPagePath);
    }
  };

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>ケーススタディ</h1>
            <p className="specification-description">
              出産支援パーソナルアプリケーションの導入効果や、ユーザーが直面する課題と解決策について、
              具体的なケーススタディを通じて説明します。
            </p>
          </div>

          {/* カテゴリーフィルター */}
          <div className="specification-section">
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', marginRight: '8px' }}>カテゴリー:</span>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '1px solid #ddd',
                      backgroundColor: selectedCategory === category ? '#667eea' : '#fff',
                      color: selectedCategory === category ? '#fff' : '#333',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: selectedCategory === category ? '600' : '400',
                      transition: 'all 0.2s'
                    }}
                  >
                    {category === 'all' ? 'すべて' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 企業向けケーススタディ */}
          {(selectedCategory === 'all' || selectedCategory === '企業向け') && (
            <div className="specification-section">
              <h2>企業向けケーススタディ</h2>
              
              <h3 style={{ marginTop: '24px', marginBottom: '16px', fontSize: '18px', color: '#667eea' }}>企業が持つ課題</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {ENTERPRISE_CASE_STUDIES.filter(item => item.category === '企業の課題').map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      cursor: item.hasDetailPage ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => {
                      if (item.hasDetailPage) {
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = '#667eea';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#ddd';
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '20px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7f32' : '#667eea',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '700',
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div
                      style={{
                        padding: '16px 20px 16px 80px',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        cursor: item.hasDetailPage ? 'pointer' : 'default'
                      }}
                      onClick={() => handleCardClick(item)}
                      onMouseEnter={(e) => {
                        if (item.hasDetailPage) {
                          e.currentTarget.style.backgroundColor = '#f0f4ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                    >
                      <div 
                        style={{ 
                          flex: 1, 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                          {item.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                          {item.description}
                        </p>
                      </div>
                      {item.hasDetailPage && (
                        <div style={{ marginLeft: '16px', fontSize: '20px', color: '#667eea' }}>
                          →
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginTop: '32px', marginBottom: '16px', fontSize: '18px', color: '#667eea' }}>企業が得られるメリット</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {ENTERPRISE_CASE_STUDIES.filter(item => item.category === '企業が得られるメリット').map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      cursor: item.hasDetailPage ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => {
                      if (item.hasDetailPage) {
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = '#667eea';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#ddd';
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '20px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7f32' : '#667eea',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '700',
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div
                      style={{
                        padding: '16px 20px 16px 80px',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        cursor: item.hasDetailPage ? 'pointer' : 'default'
                      }}
                      onClick={() => handleCardClick(item)}
                      onMouseEnter={(e) => {
                        if (item.hasDetailPage) {
                          e.currentTarget.style.backgroundColor = '#f0f4ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                    >
                      <div 
                        style={{ 
                          flex: 1, 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                          {item.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                          {item.description}
                        </p>
                      </div>
                      {item.hasDetailPage && (
                        <div style={{ marginLeft: '16px', fontSize: '20px', color: '#667eea' }}>
                          →
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginTop: '32px', marginBottom: '16px', fontSize: '18px', color: '#667eea' }}>従業員が得られるメリット</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {ENTERPRISE_CASE_STUDIES.filter(item => item.category === '従業員が得られるメリット').map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      cursor: item.hasDetailPage ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => {
                      if (item.hasDetailPage) {
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = '#667eea';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#ddd';
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '20px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7f32' : '#667eea',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '700',
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div
                      style={{
                        padding: '16px 20px 16px 80px',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        cursor: item.hasDetailPage ? 'pointer' : 'default'
                      }}
                      onClick={() => handleCardClick(item)}
                      onMouseEnter={(e) => {
                        if (item.hasDetailPage) {
                          e.currentTarget.style.backgroundColor = '#f0f4ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                    >
                      <div 
                        style={{ 
                          flex: 1, 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                          {item.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                          {item.description}
                        </p>
                      </div>
                      {item.hasDetailPage && (
                        <div style={{ marginLeft: '16px', fontSize: '20px', color: '#667eea' }}>
                          →
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 個人ユーザー向けケーススタディ */}
          {(selectedCategory === 'all' || selectedCategory === '個人向け') && (
            <div className="specification-section" style={{ marginTop: selectedCategory === 'all' ? '32px' : '0' }}>
              <h2>個人ユーザー向けケーススタディ</h2>
              
              <h3 style={{ marginTop: '24px', marginBottom: '16px', fontSize: '18px', color: '#667eea' }}>妊娠期の不安と課題</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {INDIVIDUAL_CASE_STUDIES.filter(item => item.category === '妊娠期の不安').map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      cursor: item.hasDetailPage ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => {
                      if (item.hasDetailPage) {
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = '#667eea';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#ddd';
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '20px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7f32' : '#667eea',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '700',
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div
                      style={{
                        padding: '16px 20px 16px 80px',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        cursor: item.hasDetailPage ? 'pointer' : 'default'
                      }}
                      onClick={() => handleCardClick(item)}
                      onMouseEnter={(e) => {
                        if (item.hasDetailPage) {
                          e.currentTarget.style.backgroundColor = '#f0f4ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                    >
                      <div 
                        style={{ 
                          flex: 1, 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                          {item.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                          {item.description}
                        </p>
                      </div>
                      {item.hasDetailPage && (
                        <div style={{ marginLeft: '16px', fontSize: '20px', color: '#667eea' }}>
                          →
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginTop: '32px', marginBottom: '16px', fontSize: '18px', color: '#667eea' }}>出産後の不安と課題</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {INDIVIDUAL_CASE_STUDIES.filter(item => item.category === '出産後の不安').map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      cursor: item.hasDetailPage ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => {
                      if (item.hasDetailPage) {
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = '#667eea';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#ddd';
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '20px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7f32' : '#667eea',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '700',
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div
                      style={{
                        padding: '16px 20px 16px 80px',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        cursor: item.hasDetailPage ? 'pointer' : 'default'
                      }}
                      onClick={() => handleCardClick(item)}
                      onMouseEnter={(e) => {
                        if (item.hasDetailPage) {
                          e.currentTarget.style.backgroundColor = '#f0f4ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                    >
                      <div 
                        style={{ 
                          flex: 1, 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                          {item.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                          {item.description}
                        </p>
                      </div>
                      {item.hasDetailPage && (
                        <div style={{ marginLeft: '16px', fontSize: '20px', color: '#667eea' }}>
                          →
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecificationCaseStudy;

