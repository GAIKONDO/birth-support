import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationCaseStudyWorkLifeBalance = () => {
  const navigate = useNavigate();
  const [diagram, setDiagram] = useState(null);
  const traditionalFlowRef = useRef(null);
  const appIntegratedFlowRef = useRef(null);
  const solutionFlowRef = useRef(null);

  // Mermaid初期化
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'base',
      securityLevel: 'loose',
      flowchart: {
        htmlLabels: true,
        useMaxWidth: false,
        nodeSpacing: 30,
        rankSpacing: 40,
        curve: 'basis',
        padding: 10
      },
      themeVariables: {
        primaryColor: '#e0e7ff',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#667eea',
        lineColor: '#667eea',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#ffffff'
      }
    });
  }, []);

  // 従来型の課題フロー
  const traditionalFlowMermaid = `
    flowchart TD
      A[従業員] -->|育児と仕事の両立| B[課題発生]
      B -->|育児休業取得率低い| C[特に男性: 14.0%]
      B -->|支援制度の情報不足| D[制度を活用できない]
      B -->|申請手続きが複雑| E[申請に時間がかかる]
      B -->|職場の雰囲気| F[取得しにくい環境]
      
      C -->|離職| G[優秀な人材の離職]
      D -->|制度を活用できない| H[経済的負担]
      E -->|申請漏れ| I[支援を受けられない]
      F -->|取得を諦める| J[育児負担の増加]
      
      G -->|採用コスト増加| K[企業の損失]
      H -->|満足度低下| K
      I -->|満足度低下| K
      J -->|満足度低下| K
      
      K -->|生産性低下| L[企業の競争力低下]
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style C fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style D fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style E fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style F fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style G fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style H fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style I fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style J fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style K fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style L fill:#fef2f2,stroke:#ef4444,stroke-width:3px
  `;

  // アプリ導入後の解決フロー
  const appIntegratedFlowMermaid = `
    flowchart TD
      A[従業員] -->|出産支援パーソナル<br/>アプリ導入| B[包括的支援]
      B -->|支援制度の情報提供| C[制度を活用できる]
      B -->|申請手続きのサポート| D[申請が簡単に]
      B -->|申請期限リマインダー| E[申請漏れ防止]
      B -->|AIアシスタント| F[24時間相談可能]
      B -->|利用状況レポート| G[企業が効果を把握]
      
      C -->|制度を最大限活用| H[経済的負担軽減]
      D -->|申請成功率向上| I[支援を確実に受給]
      E -->|申請漏れなし| I
      F -->|育児の不安解消| J[安心して育児]
      
      H -->|満足度向上| K[離職率低下]
      I -->|満足度向上| K
      J -->|満足度向上| K
      
      K -->|優秀な人材の定着| L[企業の競争力向上]
      G -->|施策の効果可視化| M[継続的な改善]
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style C fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style D fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style E fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style F fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style G fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style H fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style I fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style J fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style K fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style L fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style M fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
  `;

  // 解決プロセス
  const solutionFlowMermaid = `
    flowchart LR
      A[アプリ導入] --> B[情報提供]
      A --> C[申請サポート]
      A --> D[リマインダー]
      A --> E[AI相談]
      
      B --> F[制度活用]
      C --> G[申請成功]
      D --> H[申請漏れ防止]
      E --> I[不安解消]
      
      F --> J[満足度向上]
      G --> J
      H --> J
      I --> J
      
      J --> K[離職率低下]
      J --> L[生産性向上]
      
      K --> M[企業の競争力向上]
      L --> M
      
      style A fill:#667eea,stroke:#667eea,stroke-width:3px,color:#fff
      style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style C fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style E fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style F fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style G fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style H fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style I fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style J fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style K fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style L fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style M fill:#d1fae5,stroke:#10b981,stroke-width:3px
  `;

  // Mermaid図のレンダリング
  useEffect(() => {
    const renderDiagram = async (mermaidCode, ref, id) => {
      if (ref.current) {
        try {
          const { svg } = await mermaid.render(`${id}-svg`, mermaidCode);
          ref.current.innerHTML = svg;
        } catch (error) {
          console.error(`Error rendering ${id}:`, error);
        }
      }
    };

    if (traditionalFlowRef.current) {
      renderDiagram(traditionalFlowMermaid, traditionalFlowRef, 'traditional-flow');
    }
    if (appIntegratedFlowRef.current) {
      renderDiagram(appIntegratedFlowMermaid, appIntegratedFlowRef, 'app-integrated-flow');
    }
    if (solutionFlowRef.current) {
      renderDiagram(solutionFlowMermaid, solutionFlowRef, 'solution-flow');
    }
  }, []);

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <button
                onClick={() => navigate('/specification/case-study')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ← 戻る
              </button>
              <h1 style={{ margin: 0 }}>従業員の育児と仕事の両立支援が不十分</h1>
            </div>
            <p className="specification-description">
              育児休業取得率が低く、特に男性の育児休業取得率が極めて低い。育児と仕事の両立を支援する仕組みが不十分で、
              従業員の離職や転職を招いている課題を、出産支援パーソナルアプリの導入により解決します。
            </p>
          </div>

          {/* 現状の課題 */}
          <div className="specification-section">
            <h2>現状の課題</h2>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>1</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>育児休業取得率の低さ</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    特に男性の育児休業取得率が極めて低く（2023年: <strong>14.0%</strong>）、育児と仕事の両立が進んでいません。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>2</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>支援制度の情報不足</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    従業員が利用できる支援制度の情報が不足しており、制度を活用しにくい状況です。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>3</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>申請手続きの複雑さ</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    育児休業給付金などの申請手続きが複雑で、申請に時間がかかり、申請漏れのリスクがあります。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>4</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>職場の雰囲気</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    育児休業を取得しにくい雰囲気があり、特に男性が取得しにくい環境です。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 統計データ */}
          <div className="specification-section">
            <h2>現状の統計データ</h2>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#667eea', color: '#fff' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>項目</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>女性</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>男性</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>育児休業取得率（2023年）</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669' }}>85.1%</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>14.0%</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>男性の取得率が極めて低い</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>平均取得期間</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>約11ヶ月</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>約2週間</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>男性の取得期間が短い</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>取得を希望する理由</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }} colSpan="3">育児参加、パートナーの負担軽減、家族との時間</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>取得をためらう理由</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }} colSpan="3">職場の雰囲気、申請手続きの複雑さ、情報不足</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 従来型の課題フロー */}
          <div className="specification-section">
            <h2>従来型の課題フロー</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <div ref={traditionalFlowRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}></div>
            </div>
          </div>

          {/* 影響 */}
          <div className="specification-section">
            <h2>企業への影響</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>10%</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>離職率の増加</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                  育児と仕事の両立が困難なため、優秀な人材が離職します。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>500万円</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>年間採用コスト増加</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                  離職者の補充のため、採用コストが増加します（従業員100名規模の場合）。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>15%</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>満足度低下</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                  従業員の満足度が低下し、企業の生産性が低下します。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>停滞</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>働き方改革の停滞</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                  育児と仕事の両立が進まないため、働き方改革が停滞します。
                </p>
              </div>
            </div>
          </div>

          {/* 解決策 */}
          <div className="specification-section">
            <h2>解決策：出産支援パーソナルアプリの導入</h2>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>1</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>支援制度の情報提供</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    利用可能な支援制度の情報を一元管理し、検索・閲覧できるようにします。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>2</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>申請手続きのサポート</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    申請手続きをガイドし、申請書類の自動生成機能を提供します。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>3</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>申請期限のリマインダー</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    アクション管理機能により、申請期限を設定し、リマインダーで通知します。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>4</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>AIアシスタント機能</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    24時間365日いつでも育児に関する相談やアドバイスを受けられます。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>5</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>利用状況レポート</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    企業側が従業員の利用状況を把握し、施策の効果を可視化します。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* アプリ導入後の解決フロー */}
          <div className="specification-section">
            <h2>アプリ導入後の解決フロー</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <div ref={appIntegratedFlowRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}></div>
            </div>
          </div>

          {/* 解決プロセス */}
          <div className="specification-section">
            <h2>解決プロセス</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <div ref={solutionFlowRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}></div>
            </div>
          </div>

          {/* 効果 */}
          <div className="specification-section">
            <h2>期待される効果</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>↑30%</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>育児休業取得率の向上</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  支援制度の情報提供と申請手続きのサポートにより、特に男性の育児休業取得率が大幅に向上します。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>↑15%</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>従業員の満足度向上</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  育児と仕事の両立が容易になることで、従業員の満足度が向上します。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>↓10%</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>離職率の低下</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  優秀な人材の離職を防ぎ、採用コストを削減できます。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>↑5%</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>企業の生産性向上</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  従業員の満足度が向上し、仕事への集中力が高まることで、企業の生産性が向上します。
                </p>
              </div>
            </div>
          </div>

          {/* 投資対効果 */}
          <div className="specification-section">
            <h2>投資対効果（ROI）</h2>
            <div style={{ padding: '24px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b', marginTop: '16px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', color: '#92400e', fontWeight: '700' }}>試算例（従業員100名規模の場合）</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>投資額</h4>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#92400e' }}>年間60万円</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#78350f' }}>（月額500円 × 100名 × 12ヶ月）</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>離職率低下による効果</h4>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#92400e' }}>年間500万円以上</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#78350f' }}>（採用コスト削減）</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>投資対効果</h4>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#92400e' }}>8.3倍以上</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#78350f' }}>（投資額60万円に対し、効果500万円以上）</p>
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#78350f' }}>内訳</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#78350f', lineHeight: '1.8' }}>
                  <li>離職率10%低下による採用コスト削減：年間500万円</li>
                  <li>従業員満足度向上による生産性向上効果：年間300万円</li>
                  <li>育児休業取得率向上による企業ブランド向上効果：年間200万円</li>
                  <li><strong>合計効果：年間1,000万円以上</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationCaseStudyWorkLifeBalance;
