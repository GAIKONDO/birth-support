import './Specification.css';

// 機能一覧データ
const FEATURES_DATA = [
  {
    id: 'search-browse',
    name: '出産支援制度の検索・閲覧',
    description: '国の制度、都道府県の制度、市区町村の制度、民間の制度、勤務先の制度など、様々なカテゴリの支援制度を検索・閲覧できます。',
    challenge: '支援制度の情報が分散していて見つけにくい',
    effect: '一元化された情報により、必要な支援制度を効率的に発見できる。カテゴリ別・地域別の検索により、自分に適した制度を素早く見つけられる。',
    category: '情報提供'
  },
  {
    id: 'detail-visualization',
    name: '支援制度の詳細情報表示',
    description: 'Mermaid図による可視化により、制度の仕組みや申請フロー、関係組織などを分かりやすく表示します。',
    challenge: '申請手続きが複雑で分かりにくい',
    effect: '視覚的な図解により、制度の全体像や申請プロセスを理解しやすくなる。関係組織の連携も明確になり、申請時の混乱を防げる。',
    category: '情報提供'
  },
  {
    id: 'action-management',
    name: 'アクション管理',
    description: '申請予定の制度を管理し、申請期限を設定することで、期限を逃さないようサポートします。ガントチャートやカレンダー表示により、スケジュールを視覚的に管理できます。',
    challenge: '申請期限を逃してしまう',
    effect: '申請期限の可視化とリマインダー機能により、期限を逃すリスクを大幅に低減。複数の申請を同時に管理でき、効率的な申請スケジュールを組める。',
    category: 'スケジュール管理'
  },
  {
    id: 'statistics',
    name: '統計情報の表示',
    description: 'カテゴリ別の支援制度の件数や支給金額の合計を表示し、全体像を把握できます。',
    challenge: 'どのくらいの支援を受けられるのか分からない',
    effect: '受給可能な支援制度の全体像と支給金額の合計を把握できる。経済的な見通しを立てやすくなり、安心して出産・育児に臨める。',
    category: '情報提供'
  },
  {
    id: 'electronic-handbook',
    name: '電子母子手帳機能',
    description: '妊婦健診の記録を電子化し、いつでも確認できるようにします。診察記録、検査結果、出産後の記録などを一元管理できます。',
    challenge: '健診記録や母子手帳の管理が煩雑',
    effect: '紙の母子手帳を失くすリスクがなくなり、いつでもどこでも記録を確認できる。医療機関への持参も不要で、データの共有も容易になる。',
    category: '記録管理'
  },
  {
    id: 'ai-assistant',
    name: 'AIアシスタント機能',
    description: 'AIによる質問応答により、ユーザーの疑問に答えます。24時間365日いつでも育児に関する相談やアドバイスを受けられる伴走型育児支援を提供します。',
    challenge: '育児に関する疑問や不安をすぐに解決したい',
    effect: 'いつでも気軽に相談でき、育児の不安を解消できる。専門知識に基づいたアドバイスにより、適切な判断ができる。プレミアムプランでは、より高度な機能と優先サポートを提供。',
    category: '相談・サポート'
  },
  {
    id: 'search',
    name: '高度な検索機能',
    description: 'キーワード検索、カテゴリ検索、地域検索など、様々な条件で支援制度を検索できます。',
    challenge: '特定の条件に合う支援制度を見つけたい',
    effect: '複数の検索条件を組み合わせることで、自分に最適な支援制度を効率的に発見できる。検索履歴の保存により、過去の検索結果も再確認できる。',
    category: '情報提供'
  },
  {
    id: 'payment-amount',
    name: '収支概算',
    description: '出産・育児に伴う収入と支出の概算を確認し、経済的な見通しを立てることができます。',
    challenge: '受給可能な金額の合計が分からない',
    effect: '複数の支援制度から受給できる金額の合計を一目で把握できる。経済的な見通しを立てやすくなり、出産・育児計画を立てる際の参考になる。',
    category: '情報提供'
  },
  {
    id: 'account-sharing',
    name: 'アカウント共有機能',
    description: '家族やパートナーとアカウントを共有し、申請手続きや記録を共同で管理できます。',
    challenge: '家族で情報を共有したい',
    effect: '家族間で情報を共有でき、申請手続きを分担できる。パートナーも同じ情報にアクセスできるため、育児の負担を分散できる。',
    category: '共同管理'
  }
];

// 提供サービス一覧データ
const SERVICES_DATA = [
  {
    id: 'free-user',
    name: 'エンドユーザー向け（無料）',
    description: '個人ユーザーは基本機能を無料で利用できます。',
    target: '個人ユーザー（妊婦、出産予定者、育児中の方）',
    price: '無料',
    features: [
      '支援制度の検索・閲覧',
      '支援制度の詳細情報表示',
      'アクション管理',
      '統計情報の表示',
      '電子母子手帳機能',
      'AIアシスタント基本機能',
      '検索機能',
      '収支概算'
    ],
    category: '個人向け'
  },
  {
    id: 'premium',
    name: '個人SaaS（プレミアムプラン）',
    description: 'より高度な機能や優先サポートが必要な個人ユーザー向けの有料プランです。',
    target: '個人ユーザー（より高度な機能を求める方）',
    price: '月額980円または年額9,800円',
    features: [
      'AIアシスタントの高度な機能',
      '優先的なカスタマーサポート',
      '詳細な統計情報の閲覧',
      'カスタムレポートの生成',
      '薬・予防接種・検査の紹介',
      '継続的な伴走支援'
    ],
    category: '個人向け'
  },
  {
    id: 'enterprise',
    name: '企業向け提供',
    description: '企業の従業員向け福利厚生として、本アプリケーションを提供します。',
    target: '企業（従業員向け福利厚生）',
    price: '月額従業員1人あたり500円',
    features: [
      '企業ロゴのカスタマイズ',
      '企業独自の支援制度情報の追加',
      '従業員の利用状況レポート',
      '専任サポート担当者の配置',
      '全機能へのアクセス'
    ],
    category: 'B2B'
  },
  {
    id: 'municipality',
    name: '自治体向け提供',
    description: '市区町村などの自治体が住民向けサービスとして本アプリケーションを提供できます。',
    target: '自治体（住民向けサービス）',
    price: '月額利用者1人あたり300円',
    features: [
      '自治体ロゴのカスタマイズ',
      '自治体独自の支援制度情報の追加',
      '住民の利用状況レポート',
      '自治体向け専用サポート',
      '全機能へのアクセス'
    ],
    category: 'B2B'
  },
  {
    id: 'advertising',
    name: '広告収益',
    description: '企業のバナー広告や記事広告を掲載し、広告収益を得ます。',
    target: '広告主企業',
    price: '月額10万円から、CPM/CPCベース',
    features: [
      'バナー広告の掲載',
      '記事広告の掲載',
      'ターゲティング広告',
      '広告効果の測定・レポート'
    ],
    category: '広告'
  },
  {
    id: 'education-partner',
    name: '知育・塾パートナー連携',
    description: '知育サービスや学習塾などの教育サービスと連携し、ユーザーを紹介します。',
    target: '教育サービス事業者',
    price: '紹介1件あたり1,000円、継続利用で月額手数料',
    features: [
      '教育サービスの紹介',
      'ユーザーと教育サービスのマッチング',
      '紹介手数料の獲得',
      '継続利用に伴う月額手数料'
    ],
    category: 'パートナー連携'
  },
  {
    id: 'application-proxy',
    name: '申請代行サービス',
    description: '支援制度の申請手続きを代行する有料サービスを提供します。',
    target: '個人ユーザー（申請手続きを代行してほしい方）',
    price: '1件あたり3,000円から、成功報酬型も選択可能',
    features: [
      '書類作成の代行',
      '申請手続きの代行',
      '提出までの完全サポート',
      '成功報酬型の料金体系'
    ],
    category: '代行サービス'
  },
  {
    id: 'insurance',
    name: '保険の紹介・代行サービス',
    description: '乳児・児童向けの保険、学生保険、学業費用保険などの保険パートナーと連携し、ユーザーへの保険紹介および加入手続きの代行サービスを提供します。',
    target: '個人ユーザー（保険加入を検討している方）',
    price: '紹介1件あたり1,000円、保険加入手続き代行1件あたり5,000円から',
    features: [
      '乳児・児童保険の紹介',
      '学生保険の紹介',
      '学業費用保険の紹介',
      '保険加入手続きの代行',
      '保険相談サービス'
    ],
    category: 'パートナー連携'
  },
  {
    id: 'medical-partner',
    name: '医療・ヘルスケアパートナー連携',
    description: '薬の紹介、予防接種の案内、遺伝子検査、アレルギー検査などの医療・ヘルスケアパートナーと連携し、ユーザーへの紹介および手続き代行サービスを提供します。',
    target: '個人ユーザー（医療・ヘルスケアサービスを利用したい方）',
    price: '紹介1件あたり1,000円、医療サービス手続き代行1件あたり4,000円から',
    features: [
      '薬の紹介・相談',
      '予防接種の案内',
      '遺伝子検査の紹介',
      'アレルギー検査の紹介',
      '医療サービス手続きの代行'
    ],
    category: 'パートナー連携'
  },
  {
    id: 'ec-referral',
    name: 'ECリファラル（アフィリエイト）',
    description: '育児用品、ベビー用品、マタニティ用品などのECサイトと連携し、ユーザーが商品を購入した際にリファラル手数料を受け取ります。',
    target: 'ECサイト運営企業',
    price: '売上高の3〜10%',
    features: [
      '育児用品の紹介',
      'ベビー用品の紹介',
      'マタニティ用品の紹介',
      '商品購入に伴うリファラル手数料',
      '購入データの分析・レポート'
    ],
    category: 'EC連携'
  },
  {
    id: 'matching',
    name: '家政婦・専門教師のマッチング',
    description: '育児中の家庭を支援するため、家政婦・家事代行サービスや専門教師・家庭教師とのマッチングサービスを提供します。',
    target: '個人ユーザー（家事代行・学習支援サービスを利用したい方）',
    price: 'マッチング成立時に料金の10〜20%',
    features: [
      '家政婦・家事代行サービスのマッチング',
      '専門教師・家庭教師のマッチング',
      'ベビーシッターのマッチング',
      'ユーザーとサービス提供者のマッチング',
      'マッチング成立時の手数料'
    ],
    category: 'マッチングサービス'
  },
  {
    id: 'ai-support',
    name: 'AIアシスタントによる伴走型育児支援',
    description: 'AIアシスタント機能により、24時間365日いつでも育児に関する相談やアドバイスを受けられる伴走型育児支援サービスを提供します。',
    target: '個人ユーザー（育児支援を求める方）',
    price: '基本機能は無料、プレミアム機能は有料',
    features: [
      '24時間365日の育児相談',
      'パーソナライズドアドバイス',
      '薬・予防接種・検査の紹介（プレミアム）',
      '継続的な伴走支援（プレミアム）',
      '優先サポート（プレミアム）'
    ],
    category: 'AIサービス'
  }
];

const SpecificationFeatures = () => {
  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>主要機能</h1>
            <p className="specification-description">
              出産支援パーソナルアプリケーションの主要機能について説明します。
              各機能が解決する課題と発揮する効果を明確に示します。
            </p>
          </div>

          {/* 機能一覧 */}
          <div className="specification-section">
            <h2>機能一覧</h2>
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #667eea' }}>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #ddd', minWidth: '60px' }}>項番</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '200px' }}>機能名</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '150px' }}>カテゴリー</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '250px' }}>解決する課題</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '300px' }}>発揮する効果</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '300px' }}>機能説明</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES_DATA.map((feature, index) => (
                    <tr 
                      key={feature.id}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f4ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f9fafb'}
                    >
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600', color: '#667eea' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: '600', color: '#333' }}>
                        {feature.name}
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
                          {feature.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563' }}>
                        {feature.challenge}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', lineHeight: '1.6' }}>
                        {feature.effect}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', lineHeight: '1.6' }}>
                        {feature.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
          </div>

          {/* 提供サービス一覧 */}
          <div className="specification-section">
            <h2>提供サービス一覧</h2>
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #667eea' }}>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #ddd', minWidth: '60px' }}>項番</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '200px' }}>サービス名</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '150px' }}>カテゴリー</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '200px' }}>対象</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '150px' }}>料金</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '300px' }}>主な機能・特徴</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '300px' }}>サービス説明</th>
                  </tr>
                </thead>
                <tbody>
                  {SERVICES_DATA.map((service, index) => (
                    <tr 
                      key={service.id}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f4ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f9fafb'}
                    >
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '600', color: '#667eea' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: '600', color: '#333' }}>
                        {service.name}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            backgroundColor: service.category === '個人向け' ? '#dbeafe' : service.category === 'B2B' ? '#fef3c7' : service.category === '広告' ? '#fce7f3' : service.category === 'パートナー連携' ? '#d1fae5' : service.category === '代行サービス' ? '#e0e7ff' : service.category === 'EC連携' ? '#f3e8ff' : service.category === 'マッチングサービス' ? '#fef2f2' : '#e5e7eb',
                            color: '#374151'
                          }}
                        >
                          {service.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563' }}>
                        {service.target}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#667eea', fontWeight: '600' }}>
                        {service.price}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', lineHeight: '1.6' }}>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {service.features.map((feature, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{feature}</li>
                          ))}
                        </ul>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', lineHeight: '1.6' }}>
                        {service.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationFeatures;
