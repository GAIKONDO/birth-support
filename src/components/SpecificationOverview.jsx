import './Specification.css';

// 対象ユーザーデータ
const TARGET_USERS_DATA = [
  {
    category: '個人ユーザー',
    users: [
      '妊娠中の方',
      '出産を控えている方',
      '育児中の方（0-6歳児の親）',
      '出産・育児に関する支援制度を探している方',
      '育児と仕事の両立に悩んでいる方',
      '育児に関する不安や疑問がある方'
    ],
    needs: [
      '支援制度の情報を一元管理したい',
      '申請手続きを簡単にしたい',
      '申請期限を逃したくない',
      '育児に関する相談をしたい',
      '健診記録を管理したい'
    ]
  },
  {
    category: '企業ユーザー',
    users: [
      '従業員の福利厚生を充実させたい企業',
      '子育て支援に取り組む企業',
      '働き方改革を推進する企業',
      '健康経営に取り組む企業'
    ],
    needs: [
      '従業員の育児と仕事の両立を支援したい',
      '従業員の満足度を向上させたい',
      '離職率を低下させたい',
      '企業の子育て支援施策を可視化したい'
    ]
  },
  {
    category: '自治体ユーザー',
    users: [
      '住民向けサービスを提供したい自治体',
      '子育て支援施策を充実させたい自治体',
      'デジタル化を推進する自治体'
    ],
    needs: [
      '住民の子育て支援を強化したい',
      '自治体独自の支援制度を周知したい',
      '住民サービスの質を向上させたい',
      '行政のデジタル化を推進したい'
    ]
  }
];

// 解決する課題データ
const CHALLENGES_DATA = [
  {
    challenge: '支援制度の情報が分散していて見つけにくい',
    solution: '国の制度、都道府県の制度、市区町村の制度、民間の制度、勤務先の制度など、様々なカテゴリの支援制度を一元管理し、検索・閲覧できるようにする',
    impact: '必要な支援制度を効率的に発見でき、見逃しを防げる'
  },
  {
    challenge: '申請手続きが複雑で分かりにくい',
    solution: 'Mermaid図による可視化により、制度の仕組みや申請フロー、関係組織などを分かりやすく表示する',
    impact: '申請プロセスを理解しやすくなり、申請時の混乱を防げる'
  },
  {
    challenge: '申請期限を逃してしまう',
    solution: 'アクション管理機能により、申請予定の制度を管理し、申請期限を設定することで、期限を逃さないようサポートする',
    impact: '申請期限の可視化とリマインダー機能により、期限を逃すリスクを大幅に低減'
  },
  {
    challenge: '必要な書類や手続きが分からない',
    solution: '支援制度の詳細情報表示により、必要な書類や手続きを明確に示す。AIアシスタント機能により、疑問に即座に回答する',
    impact: '申請に必要な情報を正確に把握でき、申請の成功率が向上する'
  },
  {
    challenge: 'どのくらいの支援を受けられるのか分からない',
    solution: '統計情報の表示により、カテゴリ別の支援制度の件数や支給金額の合計を表示し、全体像を把握できるようにする',
    impact: '受給可能な支援制度の全体像と支給金額の合計を把握でき、経済的な見通しを立てやすくなる'
  },
  {
    challenge: '健診記録や母子手帳の管理が煩雑',
    solution: '電子母子手帳機能により、妊婦健診の記録を電子化し、いつでも確認できるようにする',
    impact: '紙の母子手帳を失くすリスクがなくなり、いつでもどこでも記録を確認できる'
  },
  {
    challenge: '育児に関する疑問や不安をすぐに解決したい',
    solution: 'AIアシスタント機能により、24時間365日いつでも育児に関する相談やアドバイスを受けられる伴走型育児支援を提供する',
    impact: 'いつでも気軽に相談でき、育児の不安を解消できる。専門知識に基づいたアドバイスにより、適切な判断ができる'
  },
  {
    challenge: '家族で情報を共有したい',
    solution: 'アカウント共有機能により、家族やパートナーとアカウントを共有し、申請手続きや記録を共同で管理できる',
    impact: '家族間で情報を共有でき、申請手続きを分担できる。パートナーも同じ情報にアクセスできるため、育児の負担を分散できる'
  }
];

// 主要な特徴・強みデータ
const STRENGTHS_DATA = [
  {
    feature: '一元管理',
    description: '分散している支援制度の情報を一元管理し、効率的に検索・閲覧できる',
    benefit: '情報の見逃しを防ぎ、必要な支援制度を確実に発見できる'
  },
  {
    feature: '視覚的な可視化',
    description: 'Mermaid図による可視化により、制度の仕組みや申請フローを分かりやすく表示する',
    benefit: '複雑な申請手続きも視覚的に理解でき、申請の成功率が向上する'
  },
  {
    feature: 'スケジュール管理',
    description: 'アクション管理機能により、申請期限を可視化し、リマインダー機能で期限を逃さないようサポートする',
    benefit: '複数の申請を同時に管理でき、効率的な申請スケジュールを組める'
  },
  {
    feature: 'AIによる伴走支援',
    description: '24時間365日いつでも育児に関する相談やアドバイスを受けられるAIアシスタント機能',
    benefit: '育児の不安を即座に解消でき、専門知識に基づいた適切な判断ができる'
  },
  {
    feature: '電子母子手帳',
    description: '妊婦健診の記録を電子化し、いつでも確認できる電子母子手帳機能',
    benefit: '紙の母子手帳を失くすリスクがなくなり、データの共有も容易になる'
  },
  {
    feature: '多様な提供形態',
    description: '個人向け（無料・有料）、企業向け、自治体向けなど、様々な提供形態に対応',
    benefit: 'ユーザーのニーズに応じた最適なサービスを提供できる'
  },
  {
    feature: 'パートナー連携',
    description: '教育サービス、保険、医療・ヘルスケア、ECサイトなど、様々なパートナーと連携',
    benefit: 'ユーザーに幅広いサービスを提供でき、ワンストップで必要なサービスを利用できる'
  },
  {
    feature: '継続的な改善',
    description: 'ユーザーフィードバックを基に、継続的に機能改善と新機能追加を行う',
    benefit: '常に最新のニーズに対応したサービスを提供できる'
  }
];

const SpecificationOverview = () => {
  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>概要</h1>
            <p className="specification-description">
              出産支援パーソナルアプリケーションの概要について説明します。
              妊娠・出産・育児に関する各種支援制度の情報を一元管理し、
              ユーザーが適切な支援を受けられるようサポートするWebアプリケーションです。
            </p>
          </div>

          <div className="specification-section">
            <h2>アプリケーションの目的</h2>
            <p>
              出産支援パーソナルアプリケーションは、妊娠・出産・育児に関する各種支援制度の情報を一元管理し、
              ユーザーが適切な支援を受けられるようサポートするWebアプリケーションです。
            </p>
            <p>
              分散している支援制度の情報を一箇所に集約し、検索・閲覧・管理を容易にすることで、
              ユーザーが支援制度を見逃すことなく、効率的に申請手続きを行えるよう支援します。
            </p>
            <p>
              また、AIアシスタントによる伴走型育児支援や、電子母子手帳機能などにより、
              妊娠期から出産・育児期まで、継続的にユーザーをサポートします。
            </p>
          </div>

          <div className="specification-section">
            <h2>対象ユーザー</h2>
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #667eea' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '150px' }}>カテゴリー</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '300px' }}>対象ユーザー</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '350px' }}>主なニーズ</th>
                  </tr>
                </thead>
                <tbody>
                  {TARGET_USERS_DATA.map((item, index) => (
                    <tr 
                      key={index}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f4ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f9fafb'}
                    >
                      <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: '600', color: '#333', verticalAlign: 'top' }}>
                        {item.category}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', lineHeight: '1.8', verticalAlign: 'top' }}>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {item.users.map((user, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{user}</li>
                          ))}
                        </ul>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', lineHeight: '1.8', verticalAlign: 'top' }}>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {item.needs.map((need, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{need}</li>
                          ))}
            </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="specification-section">
            <h2>解決する課題</h2>
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #667eea' }}>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #ddd', minWidth: '60px' }}>項番</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '300px' }}>課題</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '350px' }}>解決策</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '300px' }}>効果・影響</th>
                  </tr>
                </thead>
                <tbody>
                  {CHALLENGES_DATA.map((item, index) => (
                    <tr 
                      key={index}
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
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', lineHeight: '1.6', verticalAlign: 'top', fontWeight: '600' }}>
                        {item.challenge}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', lineHeight: '1.6', verticalAlign: 'top' }}>
                        {item.solution}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', lineHeight: '1.6', verticalAlign: 'top' }}>
                        {item.impact}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="specification-section">
            <h2>主要な特徴・強み</h2>
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #667eea' }}>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #ddd', minWidth: '60px' }}>項番</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '150px' }}>特徴</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '350px' }}>説明</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '300px' }}>メリット</th>
                  </tr>
                </thead>
                <tbody>
                  {STRENGTHS_DATA.map((item, index) => (
                    <tr 
                      key={index}
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
                      <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: '600', color: '#333', verticalAlign: 'top' }}>
                        {item.feature}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', lineHeight: '1.6', verticalAlign: 'top' }}>
                        {item.description}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', color: '#4b5563', lineHeight: '1.6', verticalAlign: 'top' }}>
                        {item.benefit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="specification-section">
            <h2>提供価値</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: '#f0f4ff', borderRadius: '8px', border: '1px solid #667eea' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px', color: '#667eea' }}>個人ユーザーへの価値</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: '#4b5563' }}>
                  <li>支援制度の情報を一元管理でき、見逃しを防げる</li>
                  <li>申請手続きが分かりやすくなり、申請の成功率が向上する</li>
                  <li>申請期限を逃さず、適切なタイミングで申請できる</li>
                  <li>育児に関する不安を解消でき、安心して出産・育児に臨める</li>
                  <li>経済的な見通しを立てやすくなり、計画的な出産・育児ができる</li>
                </ul>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px', color: '#92400e' }}>企業への価値</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: '#78350f' }}>
                  <li>従業員の育児と仕事の両立を支援し、離職率を低下させる</li>
                  <li>従業員の満足度を向上させ、企業の魅力を高める</li>
                  <li>子育て支援企業としての評価を高め、くるみん認定などの取得に貢献</li>
                  <li>健康経営優良法人認定の取得に貢献</li>
                  <li>従業員の生産性向上により、企業の業績向上に貢献</li>
                </ul>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px', color: '#065f46' }}>自治体への価値</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: '#047857' }}>
                  <li>住民の子育て支援を強化し、住民満足度を向上させる</li>
                  <li>自治体独自の支援制度を効率的に周知できる</li>
                  <li>行政のデジタル化を推進し、行政サービスの質を向上させる</li>
                  <li>住民サービスの一元化により、行政の効率化を実現</li>
                  <li>子育て支援施策の効果を可視化し、政策の改善に活用できる</li>
            </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationOverview;
