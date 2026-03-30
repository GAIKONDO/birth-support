import { useState } from 'react';
import './Specification.css';

// 利用者向け補助金・助成金のデータ
const USER_SUBSIDIES_DATA = [
  // 中小企業向け
  {
    id: 'it-introduction-company',
    category: '中小企業',
    subCategory: 'IT・デジタル化',
    name: 'IT導入補助金（企業導入向け）',
    organization: '経済産業省',
    description: '中小企業・小規模事業者がITツールを導入する際の費用を補助する制度です。出産支援パーソナルアプリの導入費用にも適用可能です。',
    eligibility: [
      '中小企業・小規模事業者',
      'ITツール導入により業務効率化や売上向上が見込まれる事業者',
      '補助対象となるITツールを導入する事業者',
      '福利厚生アプリの導入を検討している企業'
    ],
    amount: {
      type: '補助率',
      value: '最大75%（上限450万円）',
      note: '導入するITツールの種類により異なる'
    },
    applicationPeriod: '年2回程度（時期は公表される）',
    applicationMethod: 'IT導入補助金ポータルサイトから申請',
    relevance: '高',
    relevanceNote: '出産支援パーソナルアプリを福利厚生として導入する際の費用に活用可能。従業員の満足度向上や離職率低下による生産性向上が期待できる',
    link: 'https://www.it-hojo.jp/',
    tags: ['IT導入', '福利厚生', 'デジタル化', 'DX', '従業員満足度']
  },
  {
    id: 'kurumin',
    category: '中小企業',
    subCategory: '子育て支援企業認定',
    name: 'くるみん助成金',
    organization: '厚生労働省',
    description: '次世代育成支援対策推進法に基づき、子育て支援に積極的に取り組む企業を認定する「くるみん認定」を取得した中小企業に対し、助成金が支給されます。',
    eligibility: [
      '中小企業',
      '次世代育成支援対策推進法に基づく行動計画を策定・実施する企業',
      'くるみん認定を取得する企業',
      '子育て支援に積極的に取り組む企業'
    ],
    amount: {
      type: '上限額',
      value: '最大50万円',
      note: '認定取得にかかった費用や取り組み内容に応じて異なる'
    },
    applicationPeriod: '随時',
    applicationMethod: '厚生労働省の窓口または都道府県労働局を通じて申請',
    relevance: '高',
    relevanceNote: '出産支援パーソナルアプリの導入は、子育て支援に積極的に取り組む企業として評価され、くるみん認定取得のための取り組みとして活用可能',
    link: 'https://www.mhlw.go.jp/',
    tags: ['くるみん認定', '子育て支援', '企業認定', '次世代育成支援', '中小企業']
  },
  // 大企業（上場）向け
  {
    id: 'work-life-balance-listed',
    category: '大企業（上場）',
    subCategory: '働き方改革・両立支援',
    name: '両立支援等助成金（出生時両立支援コース）',
    organization: '厚生労働省',
    description: '男性労働者の育児休業取得を促進するための取り組みを行った企業に対し、助成金が支給されます。出産支援アプリの導入も取り組みの一つとして認められる可能性があります。',
    eligibility: [
      '男性労働者の育児休業取得を促進する取り組みを行う企業',
      '育児と仕事の両立を支援する取り組みを行う企業',
      '子育て支援に取り組む企業'
    ],
    amount: {
      type: '助成額',
      value: '取り組み内容に応じて異なる',
      note: '具体的な助成額は公募要領を確認'
    },
    applicationPeriod: '随時',
    applicationMethod: '厚生労働省の窓口または都道府県労働局を通じて申請',
    relevance: '高',
    relevanceNote: '出産支援パーソナルアプリの導入は、従業員の育児と仕事の両立を支援する取り組みとして評価される可能性が高い。男性の育児参加促進にも貢献',
    link: 'https://www.mhlw.go.jp/',
    tags: ['働き方改革', '両立支援', '育児休業', '男性の育児参加', '子育て支援']
  },
  {
    id: 'femtech-company-listed',
    category: '大企業（上場）',
    subCategory: 'フェムテック・健康経営',
    name: 'フェムテック等サポートサービス実証事業費補助金（利用企業向け）',
    organization: '経済産業省',
    description: 'フェムテック製品やサービスを活用し、妊娠・出産などのライフイベントと仕事の両立、女性特有の健康課題解決を目的とした事業に対して経費の一部を補助する制度です。',
    eligibility: [
      'フェムテック製品やサービスを活用する企業',
      '妊娠・出産などのライフイベントと仕事の両立を支援する事業を行う企業',
      '女性特有の健康課題解決を目的とした事業を行う企業',
      '実証事業として実施する企業'
    ],
    amount: {
      type: '補助率・上限額',
      value: '事業により異なる（詳細は公募要領を確認）',
      note: '実証事業の内容により異なる'
    },
    applicationPeriod: '年1回程度（時期は公表される）',
    applicationMethod: '経済産業省の公募窓口から申請',
    relevance: '高',
    relevanceNote: '出産支援パーソナルアプリを福利厚生として導入する企業は、フェムテックサービスを活用した実証事業として申請可能。女性の健康課題解決や働き方改革に貢献',
    link: 'https://www.meti.go.jp/policy/economy/jinzai/diversity/femtech/femtech.html',
    tags: ['フェムテック', '健康経営', '女性支援', '実証事業', 'ライフイベント']
  },
  {
    id: 'health-management-listed',
    category: '大企業（上場）',
    subCategory: '健康経営',
    name: '健康経営優良法人認定制度',
    organization: '経済産業省',
    description: '従業員の健康管理を経営課題として捉え、戦略的に取り組む企業を認定する制度です。認定企業には様々な優遇措置があります。',
    eligibility: [
      '従業員の健康管理に取り組む企業',
      '健康経営に戦略的に取り組む企業',
      '健康経営優良法人の認定基準を満たす企業'
    ],
    amount: {
      type: '認定制度（補助金ではない）',
      value: '認定による優遇措置（金融機関の優遇金利、公共調達での優遇など）',
      note: '直接的な補助金ではないが、認定により様々な優遇措置が受けられる'
    },
    applicationPeriod: '年1回（時期は公表される）',
    applicationMethod: '健康経営優良法人認定制度のポータルサイトから申請',
    relevance: '中',
    relevanceNote: '出産支援パーソナルアプリの導入は、従業員の健康管理やライフイベント支援として評価され、健康経営優良法人認定の取得に貢献する可能性がある',
    link: 'https://www.meti.go.jp/',
    tags: ['健康経営', '企業認定', '従業員健康管理', '優遇措置', '戦略的経営']
  },
  // 大企業（非上場）向け
  {
    id: 'work-life-balance-unlisted',
    category: '大企業（非上場）',
    subCategory: '働き方改革・両立支援',
    name: '両立支援等助成金（出生時両立支援コース）',
    organization: '厚生労働省',
    description: '男性労働者の育児休業取得を促進するための取り組みを行った企業に対し、助成金が支給されます。出産支援アプリの導入も取り組みの一つとして認められる可能性があります。',
    eligibility: [
      '男性労働者の育児休業取得を促進する取り組みを行う企業',
      '育児と仕事の両立を支援する取り組みを行う企業',
      '子育て支援に取り組む企業'
    ],
    amount: {
      type: '助成額',
      value: '取り組み内容に応じて異なる',
      note: '具体的な助成額は公募要領を確認'
    },
    applicationPeriod: '随時',
    applicationMethod: '厚生労働省の窓口または都道府県労働局を通じて申請',
    relevance: '高',
    relevanceNote: '出産支援パーソナルアプリの導入は、従業員の育児と仕事の両立を支援する取り組みとして評価される可能性が高い。男性の育児参加促進にも貢献',
    link: 'https://www.mhlw.go.jp/',
    tags: ['働き方改革', '両立支援', '育児休業', '男性の育児参加', '子育て支援']
  },
  {
    id: 'femtech-company-unlisted',
    category: '大企業（非上場）',
    subCategory: 'フェムテック・健康経営',
    name: 'フェムテック等サポートサービス実証事業費補助金（利用企業向け）',
    organization: '経済産業省',
    description: 'フェムテック製品やサービスを活用し、妊娠・出産などのライフイベントと仕事の両立、女性特有の健康課題解決を目的とした事業に対して経費の一部を補助する制度です。',
    eligibility: [
      'フェムテック製品やサービスを活用する企業',
      '妊娠・出産などのライフイベントと仕事の両立を支援する事業を行う企業',
      '女性特有の健康課題解決を目的とした事業を行う企業',
      '実証事業として実施する企業'
    ],
    amount: {
      type: '補助率・上限額',
      value: '事業により異なる（詳細は公募要領を確認）',
      note: '実証事業の内容により異なる'
    },
    applicationPeriod: '年1回程度（時期は公表される）',
    applicationMethod: '経済産業省の公募窓口から申請',
    relevance: '高',
    relevanceNote: '出産支援パーソナルアプリを福利厚生として導入する企業は、フェムテックサービスを活用した実証事業として申請可能。女性の健康課題解決や働き方改革に貢献',
    link: 'https://www.meti.go.jp/policy/economy/jinzai/diversity/femtech/femtech.html',
    tags: ['フェムテック', '健康経営', '女性支援', '実証事業', 'ライフイベント']
  },
  {
    id: 'telework-unlisted',
    category: '大企業（非上場）',
    subCategory: '働き方改革・テレワーク',
    name: 'テレワーク導入助成金',
    organization: '厚生労働省',
    description: 'テレワークを導入する企業に対し、導入に必要な設備やツールの費用を補助する制度です。リモートワーク環境での育児支援アプリの導入にも関連します。',
    eligibility: [
      'テレワークを導入する企業',
      'テレワーク導入に必要な設備やツールを導入する企業',
      '働き方改革に取り組む企業'
    ],
    amount: {
      type: '助成額',
      value: '導入内容により異なる',
      note: '具体的な助成額は公募要領を確認'
    },
    applicationPeriod: '随時',
    applicationMethod: '厚生労働省の窓口または都道府県労働局を通じて申請',
    relevance: '中',
    relevanceNote: 'テレワーク環境での育児支援アプリの導入は、リモートワーク環境での従業員支援として評価される可能性がある',
    link: 'https://www.mhlw.go.jp/',
    tags: ['テレワーク', '働き方改革', 'リモートワーク', '設備投資', '従業員支援']
  },
  {
    id: 'health-management-unlisted',
    category: '大企業（非上場）',
    subCategory: '健康経営',
    name: '健康経営優良法人認定制度',
    organization: '経済産業省',
    description: '従業員の健康管理を経営課題として捉え、戦略的に取り組む企業を認定する制度です。認定企業には様々な優遇措置があります。',
    eligibility: [
      '従業員の健康管理に取り組む企業',
      '健康経営に戦略的に取り組む企業',
      '健康経営優良法人の認定基準を満たす企業'
    ],
    amount: {
      type: '認定制度（補助金ではない）',
      value: '認定による優遇措置（金融機関の優遇金利、公共調達での優遇など）',
      note: '直接的な補助金ではないが、認定により様々な優遇措置が受けられる'
    },
    applicationPeriod: '年1回（時期は公表される）',
    applicationMethod: '健康経営優良法人認定制度のポータルサイトから申請',
    relevance: '中',
    relevanceNote: '出産支援パーソナルアプリの導入は、従業員の健康管理やライフイベント支援として評価され、健康経営優良法人認定の取得に貢献する可能性がある',
    link: 'https://www.meti.go.jp/',
    tags: ['健康経営', '企業認定', '従業員健康管理', '優遇措置', '戦略的経営']
  }
];

const SpecificationUserSubsidies = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  // カテゴリー一覧を取得（順番を指定）
  const categories = ['all', '大企業（上場）', '大企業（非上場）', '中小企業'];
  
  // サブカテゴリー一覧を取得（選択されたカテゴリーに基づく）
  const subCategories = ['all', ...new Set(
    USER_SUBSIDIES_DATA
      .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
      .map(item => item.subCategory)
  )];

  // フィルタリングされたデータ
  const filteredData = USER_SUBSIDIES_DATA.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const subCategoryMatch = selectedSubCategory === 'all' || item.subCategory === selectedSubCategory;
    return categoryMatch && subCategoryMatch;
  });

  // 関連度でソート（高→中→低）
  const relevanceOrder = { '高': 1, '中': 2, '低': 3 };
  const sortedData = [...filteredData].sort((a, b) => {
    return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>利用者向け助成金</h1>
          </div>
          
          <div className="specification-section">
            <h2 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px', color: '#667eea' }}>概要</h2>
            <p style={{ margin: 0, lineHeight: '1.8', fontSize: '14px' }}>
              出産支援パーソナルアプリを採用・導入する企業が活用できる支援制度や助成金を調査・整理しました。
              企業規模別（大企業（上場）、大企業（非上場）、中小企業）に分類し、それぞれの企業規模に適した制度を掲載しています。
              アプリ導入費用の補助や、子育て支援企業としての認定・助成金、健康経営優良法人認定などが含まれます。
              各制度の申請条件や申請方法は変更される可能性があるため、最新の情報は各機関の公式サイトでご確認ください。
            </p>
          </div>

          {/* カテゴリーフィルターと表示形式切り替え */}
          <div className="specification-section">
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', marginRight: '8px' }}>カテゴリー:</span>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedSubCategory('all'); // カテゴリー変更時にサブカテゴリーをリセット
                      }}
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', marginRight: '8px', fontSize: '14px' }}>表示形式:</span>
                  <button
                    onClick={() => setViewMode('card')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      backgroundColor: viewMode === 'card' ? '#667eea' : '#fff',
                      color: viewMode === 'card' ? '#fff' : '#333',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: viewMode === 'card' ? '600' : '400',
                      transition: 'all 0.2s'
                    }}
                  >
                    カード
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      backgroundColor: viewMode === 'table' ? '#667eea' : '#fff',
                      color: viewMode === 'table' ? '#fff' : '#333',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: viewMode === 'table' ? '600' : '400',
                      transition: 'all 0.2s'
                    }}
                  >
                    表
                  </button>
                </div>
              </div>
              {selectedCategory !== 'all' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', marginRight: '8px' }}>サブカテゴリー:</span>
                  {subCategories.map(subCategory => (
                    <button
                      key={subCategory}
                      onClick={() => setSelectedSubCategory(subCategory)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: '1px solid #ddd',
                        backgroundColor: selectedSubCategory === subCategory ? '#667eea' : '#fff',
                        color: selectedSubCategory === subCategory ? '#fff' : '#333',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: selectedSubCategory === subCategory ? '600' : '400',
                        transition: 'all 0.2s'
                      }}
                    >
                      {subCategory === 'all' ? 'すべて' : subCategory}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 補助金・助成金一覧 */}
          <div className="specification-section">
            {viewMode === 'card' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sortedData.map((item) => (
                  <div
                    id={`user-subsidy-${item.id}`}
                    key={item.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* ヘッダー */}
                    <div
                      onClick={() => toggleExpand(item.id)}
                      style={{
                        padding: '16px 20px',
                        backgroundColor: expandedId === item.id ? '#f0f4ff' : '#f9fafb',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: expandedId === item.id ? '1px solid #667eea' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
                            {item.name}
                          </h3>
                          <span
                            style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: item.relevance === '高' ? '#10b981' : item.relevance === '中' ? '#f59e0b' : '#6b7280',
                              color: '#fff'
                            }}
                          >
                            関連度: {item.relevance}
                          </span>
                          <span
                            style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              backgroundColor: '#e5e7eb',
                              color: '#374151'
                            }}
                          >
                            {item.category}
                          </span>
                          <span
                            style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              backgroundColor: '#dbeafe',
                              color: '#1e40af'
                            }}
                          >
                            {item.subCategory}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          <span style={{ marginRight: '16px' }}>実施機関: {item.organization}</span>
                          <span>補助額・支給額: {item.amount.value}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '20px', color: '#667eea', fontWeight: 'bold' }}>
                        {expandedId === item.id ? '−' : '+'}
                      </div>
                    </div>

                    {/* 詳細内容 */}
                    {expandedId === item.id && (
                      <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                            概要
                          </h4>
                          <p style={{ margin: 0, lineHeight: '1.8', fontSize: '14px', color: '#4b5563' }}>
                            {item.description}
                          </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                            対象要件
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', fontSize: '14px', color: '#4b5563' }}>
                            {item.eligibility.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                            補助額・支給額
                          </h4>
                          <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#667eea', marginBottom: '4px' }}>
                              {item.amount.value}
                            </div>
                            {item.amount.note && (
                              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                                ※ {item.amount.note}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                            申請時期・申請方法
                          </h4>
                          <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                            <div style={{ marginBottom: '8px' }}>
                              <strong style={{ color: '#374151' }}>申請時期:</strong> {item.applicationPeriod}
                            </div>
                            <div>
                              <strong style={{ color: '#374151' }}>申請方法:</strong> {item.applicationMethod}
                            </div>
                          </div>
                        </div>

                        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fbbf24' }}>
                          <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', fontWeight: '600', color: '#92400e' }}>
                            アプリ利用者への適用可能性
                          </h4>
                          <p style={{ margin: 0, lineHeight: '1.8', fontSize: '14px', color: '#78350f' }}>
                            {item.relevanceNote}
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {item.tags.map((tag, index) => (
                            <span
                              key={index}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                backgroundColor: '#e5e7eb',
                                color: '#374151'
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {item.link && (
                          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: '#667eea',
                                color: '#fff',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                            >
                              <span>公式サイトを開く</span>
                              <span>→</span>
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #667eea' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '200px' }}>制度名</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '100px' }}>カテゴリー</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '120px' }}>サブカテゴリー</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '120px' }}>実施機関</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', border: '1px solid #ddd', minWidth: '150px' }}>補助額・支給額</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #ddd', minWidth: '80px' }}>関連度</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #ddd', minWidth: '100px' }}>詳細</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((item, index) => (
                      <tr 
                        key={item.id}
                        style={{ 
                          backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb',
                          borderBottom: '1px solid #e5e7eb',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f4ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f9fafb'}
                      >
                        <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: '600', color: '#333' }}>
                          {item.name}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              backgroundColor: '#e5e7eb',
                              color: '#374151'
                            }}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              backgroundColor: '#dbeafe',
                              color: '#1e40af'
                            }}
                          >
                            {item.subCategory}
                          </span>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563' }}>
                          {item.organization}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', color: '#667eea', fontWeight: '600' }}>
                          {item.amount.value}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: item.relevance === '高' ? '#10b981' : item.relevance === '中' ? '#f59e0b' : '#6b7280',
                              color: '#fff'
                            }}
                          >
                            {item.relevance}
                          </span>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setViewMode('card');
                              setExpandedId(item.id);
                              setTimeout(() => {
                                document.getElementById(`user-subsidy-${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 100);
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #667eea',
                              backgroundColor: '#fff',
                              color: '#667eea',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#667eea';
                              e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#fff';
                              e.target.style.color = '#667eea';
                            }}
                          >
                            詳細
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 注意事項 */}
          <div className="specification-section" style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5' }}>
            <h2 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px', color: '#dc2626' }}>注意事項</h2>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', fontSize: '14px', color: '#991b1b' }}>
              <li>補助金・助成金の制度内容や申請条件は変更される可能性があります。最新の情報は各機関の公式サイトでご確認ください。</li>
              <li>企業向けの補助金・助成金は、出産支援パーソナルアプリの導入が直接的な対象とならない場合もあります。各制度の詳細を確認し、導入目的や効果を明確に説明することが重要です。</li>
              <li>企業規模の定義は各制度により異なる場合があります。自社の企業規模を正確に把握し、該当する制度を確認してください。</li>
              <li>複数の補助金・助成金に重複申請できる場合とできない場合があります。申請前に各制度の重複申請可否を確認してください。</li>
              <li>補助金・助成金の申請には、事業計画書、見積書、その他必要な書類の提出が必要です。申請前に必要書類を確認してください。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationUserSubsidies;

