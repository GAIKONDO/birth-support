import { useState } from 'react';
import './Specification.css';

// 補助金・助成金のデータ
const SUBSIDIES_DATA = [
  {
    id: 'startup-support',
    category: '創業支援',
    name: '創業支援補助金（起業支援補助金）',
    organization: '経済産業省',
    description: '新規事業を開始する事業者を対象とした補助金制度。起業から事業開始までの初期費用を支援します。',
    eligibility: [
      '起業から事業開始後5年以内の事業者',
      '新規事業を開始する事業者',
      '雇用創出が見込まれる事業',
      '地域経済への貢献が見込まれる事業'
    ],
    amount: {
      type: '上限額',
      value: '200万円～500万円',
      note: '事業内容や規模により異なる'
    },
    applicationPeriod: '年1回（時期は都道府県により異なる）',
    applicationMethod: '都道府県の窓口または商工会議所・商工会を通じて申請',
    relevance: '高',
    relevanceNote: '新規事業開始時の初期費用（システム開発、マーケティング、人件費など）に活用可能',
    link: 'https://www.meti.go.jp/',
    tags: ['創業', '起業', '初期費用', '雇用創出']
  },
  {
    id: 'it-introduction',
    category: 'IT・デジタル化',
    name: 'IT導入補助金',
    organization: '経済産業省',
    description: '中小企業・小規模事業者のITツール導入を支援する補助金。デジタル化による業務効率化や売上向上を目的としています。',
    eligibility: [
      '中小企業・小規模事業者',
      'ITツール導入により業務効率化や売上向上が見込まれる事業者',
      '補助対象となるITツールを導入する事業者'
    ],
    amount: {
      type: '補助率',
      value: '最大75%（上限450万円）',
      note: '導入するITツールの種類により異なる'
    },
    applicationPeriod: '年2回程度（時期は公表される）',
    applicationMethod: 'IT導入補助金ポータルサイトから申請',
    relevance: '高',
    relevanceNote: 'アプリ開発・運用に必要なクラウドサービス、開発ツール、セキュリティツールなどの導入費用に活用可能',
    link: 'https://www.it-hojo.jp/',
    tags: ['IT', 'デジタル化', 'DX', 'クラウド', 'セキュリティ']
  },
  {
    id: 'monozukuri',
    category: 'ものづくり・サービス開発',
    name: 'ものづくり補助金',
    organization: '経済産業省',
    description: 'ものづくり・サービス開発を行う事業者を対象とした補助金。新製品・新サービスの開発や設備投資を支援します。',
    eligibility: [
      '中小企業・小規模事業者',
      '新製品・新サービスの開発を行う事業者',
      '設備投資を行う事業者',
      '雇用創出が見込まれる事業'
    ],
    amount: {
      type: '補助率',
      value: '最大2/3（上限1,000万円）',
      note: '事業内容により異なる'
    },
    applicationPeriod: '年1回程度（時期は公表される）',
    applicationMethod: 'ものづくり補助金ポータルサイトから申請',
    relevance: '中',
    relevanceNote: 'アプリ開発・サービス開発の費用に活用可能。ただし、IT導入補助金との重複申請は不可',
    link: 'https://www.monodukuri-hojo.jp/',
    tags: ['ものづくり', 'サービス開発', '新製品', '設備投資']
  },
  {
    id: 'small-business',
    category: '事業継続支援',
    name: '小規模事業者持続化補助金',
    organization: '経済産業省',
    description: '小規模事業者の事業継続・発展を支援する補助金。経営改善や新商品・新サービスの開発を支援します。',
    eligibility: [
      '小規模事業者（従業員5人以下（商業・サービス業は5人以下、製造業等は20人以下））',
      '事業継続・発展を目指す事業者',
      '経営改善計画を策定する事業者'
    ],
    amount: {
      type: '上限額',
      value: '50万円',
      note: '経営改善計画に基づく事業内容により異なる'
    },
    applicationPeriod: '年1回程度（時期は都道府県により異なる）',
    applicationMethod: '商工会議所・商工会を通じて申請',
    relevance: '中',
    relevanceNote: '小規模事業者として起業する場合、経営改善や新サービス開発の費用に活用可能',
    link: 'https://www.chusho.meti.go.jp/',
    tags: ['小規模事業者', '経営改善', '事業継続', '新サービス']
  },
  {
    id: 'regional-revitalization',
    category: '地域創生',
    name: '地域創生推進事業費補助金',
    organization: '内閣府',
    description: '地域の課題解決や活性化を目的とした事業を支援する補助金。地域の特性を活かした事業を支援します。',
    eligibility: [
      '地方公共団体、民間事業者、NPO法人等',
      '地域の課題解決や活性化を目的とした事業',
      '地域の特性を活かした事業'
    ],
    amount: {
      type: '補助率',
      value: '最大2/3（上限額は事業により異なる）',
      note: '事業内容により異なる'
    },
    applicationPeriod: '年1回程度（時期は公表される）',
    applicationMethod: '内閣府の窓口または都道府県を通じて申請',
    relevance: '中',
    relevanceNote: '自治体向けの出産支援アプリ提供事業として、地域の子育て支援に貢献する事業として申請可能',
    link: 'https://www.cao.go.jp/',
    tags: ['地域創生', '地方創生', '地域活性化', '自治体連携']
  },
  {
    id: 'childcare-support-local',
    category: '子育て支援（自治体）',
    name: '子育て支援事業補助金（自治体独自）',
    organization: '各自治体',
    description: '各自治体が独自に実施している子育て支援事業への補助金。自治体により制度内容が異なります。',
    eligibility: [
      '自治体により異なる',
      '子育て支援に関連する事業を行う事業者',
      '自治体の子育て支援施策に貢献する事業'
    ],
    amount: {
      type: '自治体により異なる',
      value: '10万円～500万円程度',
      note: '自治体により大きく異なる'
    },
    applicationPeriod: '自治体により異なる',
    applicationMethod: '各自治体の窓口に問い合わせ',
    relevance: '高',
    relevanceNote: '自治体向けの出産支援アプリ提供事業として、各自治体の子育て支援施策に貢献する事業として申請可能。自治体との連携により申請しやすい',
    link: '各自治体の公式サイト',
    tags: ['子育て支援', '自治体', '地域連携', '出産支援']
  },
  {
    id: 'innovation-support',
    category: 'イノベーション支援',
    name: 'スタートアップ支援事業',
    organization: '経済産業省・各自治体',
    description: 'スタートアップ企業の成長を支援する事業。事業開発、資金調達、人材確保などを支援します。',
    eligibility: [
      'スタートアップ企業',
      'イノベーション創出が見込まれる事業',
      '成長が見込まれる事業'
    ],
    amount: {
      type: '事業により異なる',
      value: '50万円～1,000万円程度',
      note: '事業内容により異なる'
    },
    applicationPeriod: '事業により異なる',
    applicationMethod: '各事業の窓口に問い合わせ',
    relevance: '中',
    relevanceNote: 'スタートアップ企業として、事業開発や人材確保の費用に活用可能',
    link: 'https://www.meti.go.jp/',
    tags: ['スタートアップ', 'イノベーション', '事業開発', '人材確保']
  },
  {
    id: 'employment-support',
    category: '雇用創出支援',
    name: '特定求職者雇用開発助成金',
    organization: '厚生労働省',
    description: '特定の求職者（若者、女性、高齢者など）を雇用する事業者を支援する助成金。雇用創出を促進します。',
    eligibility: [
      '特定の求職者を雇用する事業者',
      '雇用創出が見込まれる事業者',
      '継続雇用が見込まれる事業者'
    ],
    amount: {
      type: '助成率',
      value: '最大3/4（上限額は雇用形態により異なる）',
      note: '雇用形態により異なる'
    },
    applicationPeriod: '随時',
    applicationMethod: 'ハローワークを通じて申請',
    relevance: '低',
    relevanceNote: '人材採用時の助成金として活用可能。ただし、補助金とは異なり、雇用後に支給される',
    link: 'https://www.mhlw.go.jp/',
    tags: ['雇用創出', '人材採用', '助成金', 'ハローワーク']
  },
  {
    id: 'femtech-support',
    category: 'フェムテック・子育て支援',
    name: 'フェムテック等サポートサービス実証事業費補助金',
    organization: '経済産業省',
    description: 'フェムテック製品やサービスを活用し、妊娠・出産などのライフイベントと仕事の両立、女性特有の健康課題解決を目的とした事業に対して経費の一部を補助する制度です。',
    eligibility: [
      'フェムテック製品やサービスを活用する事業者',
      '妊娠・出産などのライフイベントと仕事の両立を支援する事業',
      '女性特有の健康課題解決を目的とした事業',
      '実証事業として実施する事業'
    ],
    amount: {
      type: '補助率・上限額',
      value: '事業により異なる（詳細は公募要領を確認）',
      note: '実証事業の内容により異なる'
    },
    applicationPeriod: '年1回程度（時期は公表される）',
    applicationMethod: '経済産業省の公募窓口から申請',
    relevance: '高',
    relevanceNote: '出産支援パーソナルアプリは、妊娠・出産などのライフイベントと仕事の両立を支援するフェムテックサービスとして、この補助金の対象となる可能性が非常に高い。実証事業として申請可能',
    link: 'https://www.meti.go.jp/policy/economy/jinzai/diversity/femtech/femtech.html',
    tags: ['フェムテック', '子育て支援', '女性支援', '実証事業', 'ライフイベント']
  },
  {
    id: 'monozukuri-service',
    category: 'ものづくり・サービス開発',
    name: 'ものづくり・商業・サービス生産性向上促進補助金',
    organization: '経済産業省',
    description: '中小企業や小規模事業者が革新的な新製品・新サービスの開発や生産プロセスの改善を行うための設備投資等に要する経費の一部を補助する制度です。',
    eligibility: [
      '中小企業・小規模事業者',
      '革新的な新製品・新サービスの開発を行う事業者',
      '生産プロセスの改善を行う事業者',
      '設備投資等を行う事業者'
    ],
    amount: {
      type: '補助率',
      value: '最大2/3（上限額は事業により異なる）',
      note: '事業内容により異なる'
    },
    applicationPeriod: '年1回程度（時期は公表される）',
    applicationMethod: 'ものづくり補助金ポータルサイトから申請',
    relevance: '中',
    relevanceNote: 'アプリ開発・サービス開発の費用に活用可能。ものづくり補助金の商業・サービス版として、デジタルサービス開発にも適用可能',
    link: 'https://www.monodukuri-hojo.jp/',
    tags: ['ものづくり', 'サービス開発', '生産性向上', '新サービス', '設備投資']
  },
  {
    id: 'public-procurement',
    category: '公共調達・販路拡大',
    name: 'スタートアップにおける公共調達促進',
    organization: '経済産業省',
    description: '政府や自治体がスタートアップ企業から製品やサービスを調達することで、事業推進や販路拡大を支援する制度です。',
    eligibility: [
      'スタートアップ企業',
      '政府や自治体への製品・サービス提供が可能な事業者',
      '公共調達の対象となる製品・サービスを提供する事業者'
    ],
    amount: {
      type: '調達機会の提供',
      value: '補助金ではなく、公共調達の機会提供',
      note: '直接的な補助金ではないが、販路拡大の機会を提供'
    },
    applicationPeriod: '随時（公共調達の機会は随時公表される）',
    applicationMethod: '公共調達ポータルサイトや各自治体の調達情報を確認',
    relevance: '高',
    relevanceNote: '自治体向けの出産支援アプリ提供事業として、公共調達を通じて自治体への販路拡大が可能。自治体との契約機会を獲得できる',
    link: 'https://www.meti.go.jp/policy/newbusiness/public_procurement.html',
    tags: ['公共調達', 'スタートアップ', '販路拡大', '自治体', '政府調達']
  },
  {
    id: 'growth-acceleration',
    category: '成長支援',
    name: '成長加速化補助金',
    organization: '経済産業省',
    description: '飛躍的成長を目指す中小企業の設備投資を補助する制度です。工場・物流拠点などの新設・増築、自動化による革新的な生産性向上、イノベーション創出に向けた設備の導入を支援します。',
    eligibility: [
      '飛躍的成長を目指す中小企業',
      '設備投資を行う事業者',
      '自動化による革新的な生産性向上を目指す事業者',
      'イノベーション創出に向けた設備導入を行う事業者'
    ],
    amount: {
      type: '補助率・上限額',
      value: '事業により異なる（詳細は公募要領を確認）',
      note: '設備投資の内容により異なる'
    },
    applicationPeriod: '年1回程度（時期は公表される）',
    applicationMethod: '経済産業省の公募窓口から申請',
    relevance: '中',
    relevanceNote: 'サーバー設備やクラウドインフラなどの設備投資に活用可能。ただし、主に製造業向けの設備投資が中心',
    link: 'https://mirasapo-plus.go.jp/subsidy/',
    tags: ['成長支援', '設備投資', '生産性向上', 'イノベーション', '自動化']
  },
  {
    id: 'employment-retention',
    category: '雇用創出支援',
    name: '人材確保等支援助成金',
    organization: '経済産業省',
    description: '魅力ある職場づくりのために労働環境の向上などに取り組み、従業員の職場定着を促進する中小企業等を支援する助成金です。',
    eligibility: [
      '中小企業・小規模事業者',
      '労働環境の向上に取り組む事業者',
      '従業員の職場定着を促進する事業者',
      '魅力ある職場づくりに取り組む事業者'
    ],
    amount: {
      type: '助成率・上限額',
      value: '事業により異なる（詳細は公募要領を確認）',
      note: '取り組み内容により異なる'
    },
    applicationPeriod: '随時',
    applicationMethod: '経済産業省の窓口または都道府県を通じて申請',
    relevance: '中',
    relevanceNote: '新規事業開始時の人材確保や職場環境整備に活用可能。従業員の定着促進のための取り組みを支援',
    link: 'https://www.chusho.meti.go.jp/pamflet/hakusyo/2023/shokibo/b4_5.html',
    tags: ['人材確保', '雇用創出', '職場環境', '従業員定着', '労働環境']
  }
];

const SpecificationSubsidies = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  // カテゴリー一覧を取得
  const categories = ['all', ...new Set(SUBSIDIES_DATA.map(item => item.category))];

  // フィルタリングされたデータ
  const filteredData = selectedCategory === 'all' 
    ? SUBSIDIES_DATA 
    : SUBSIDIES_DATA.filter(item => item.category === selectedCategory);

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
            <h1>補助金・助成金</h1>
          </div>
          
          <div className="specification-section">
            <h2 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px', color: '#667eea' }}>概要</h2>
            <p style={{ margin: 0, lineHeight: '1.8', fontSize: '14px' }}>
              出産支援パーソナルアプリ提供事業を開始するにあたり、取得可能な補助金・助成金を調査・整理しました。
              新規事業開始時の初期費用、IT導入費用、サービス開発費用など、事業の各段階で活用できる補助金・助成金を掲載しています。
              各補助金・助成金の申請条件や申請方法は変更される可能性があるため、最新の情報は各機関の公式サイトでご確認ください。
            </p>
          </div>

          {/* カテゴリーフィルターと表示形式切り替え */}
          <div className="specification-section">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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

      {/* 補助金・助成金一覧 */}
      {viewMode === 'card' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedData.map((item) => (
            <div
              id={`subsidy-${item.id}`}
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
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    <span style={{ marginRight: '16px' }}>実施機関: {item.organization}</span>
                    <span>補助額: {item.amount.value}</span>
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
                      補助額・助成額
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
                      本事業への適用可能性
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
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '200px' }}>補助金・助成金名</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '120px' }}>カテゴリー</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '120px' }}>実施機関</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', border: '1px solid #ddd', minWidth: '150px' }}>補助額・助成額</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #ddd', minWidth: '80px' }}>関連度</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '120px' }}>申請時期</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '200px' }}>申請方法</th>
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
                  <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', fontSize: '13px' }}>
                    {item.applicationPeriod}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', fontSize: '13px' }}>
                    {item.applicationMethod}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        setViewMode('card');
                        setExpandedId(item.id);
                        setTimeout(() => {
                          document.getElementById(`subsidy-${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
              <li>複数の補助金・助成金に重複申請できる場合とできない場合があります。申請前に各制度の重複申請可否を確認してください。</li>
              <li>補助金・助成金の申請には、事業計画書、見積書、その他必要な書類の提出が必要です。申請前に必要書類を確認してください。</li>
              <li>補助金・助成金の審査には時間がかかる場合があります。事業開始時期を考慮して、余裕を持って申請してください。</li>
              <li>補助金・助成金の支給は、事業完了後の実績報告や監査を経て行われます。適切な記録管理が必要です。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationSubsidies;

