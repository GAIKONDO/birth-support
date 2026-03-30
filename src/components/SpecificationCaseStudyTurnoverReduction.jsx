import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationCaseStudyTurnoverReduction = () => {
  const navigate = useNavigate();
  const [diagram, setDiagram] = useState(null);
  const traditionalFlowRef = useRef(null);
  const appIntegratedFlowRef = useRef(null);
  const costReductionFlowRef = useRef(null);

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
      A[企業] -->|育児と仕事の両立支援不足| B[従業員の離職]
      B -->|優秀な人材の離職| C[採用コストの増加]
      B -->|経験者の離職| D[ノウハウの喪失]
      B -->|育児中の離職| E[人材の多様性低下]
      
      C -->|採用活動| F[採用コスト: 1人あたり<br/>約500万円]
      C -->|教育・研修| G[教育コスト: 1人あたり<br/>約200万円]
      D -->|業務効率低下| H[生産性の低下]
      E -->|組織力低下| I[イノベーション力低下]
      
      F -->|年間コスト| J[採用コスト増加<br/>年間500万円以上]
      G -->|年間コスト| J
      H -->|機会損失| K[企業の競争力低下]
      I -->|機会損失| K
      
      J -->|財務負担| L[企業の財務悪化]
      K -->|市場シェア低下| L
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style C fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style D fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style E fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style F fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style G fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style H fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style I fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style J fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style K fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style L fill:#fef2f2,stroke:#ef4444,stroke-width:3px
  `;

  // アプリ導入後の解決フロー
  const appIntegratedFlowMermaid = `
    flowchart TD
      A[企業] -->|出産支援パーソナル<br/>アプリ導入| B[育児と仕事の両立支援]
      B -->|支援制度の情報提供| C[従業員の満足度向上]
      B -->|申請手続きのサポート| D[育児の負担軽減]
      B -->|AIアシスタント| E[育児の不安解消]
      B -->|利用状況レポート| F[施策の効果可視化]
      
      C -->|満足度向上| G[離職率の低下]
      D -->|負担軽減| G
      E -->|不安解消| G
      F -->|継続的改善| G
      
      G -->|優秀な人材の定着| H[採用コストの削減]
      G -->|経験者の定着| I[ノウハウの蓄積]
      G -->|多様な人材の定着| J[組織力の向上]
      
      H -->|採用コスト削減| K[年間500万円以上削減]
      I -->|業務効率向上| L[生産性の向上]
      J -->|イノベーション力向上| M[企業の競争力向上]
      
      K -->|財務改善| N[企業の財務健全化]
      L -->|収益向上| N
      M -->|市場シェア拡大| N
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style C fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style E fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style F fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style G fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style H fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style I fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style J fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style K fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style L fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style M fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style N fill:#d1fae5,stroke:#10b981,stroke-width:3px
  `;

  // コスト削減フロー
  const costReductionFlowMermaid = `
    flowchart LR
      A[アプリ導入] --> B[離職率10%低下]
      B --> C[離職者数削減]
      C --> D[採用コスト削減]
      C --> E[教育コスト削減]
      C --> F[ノウハウ喪失防止]
      
      D --> G[年間500万円削減]
      E --> H[年間200万円削減]
      F --> I[機会損失防止]
      
      G --> J[合計効果]
      H --> J
      I --> J
      
      J --> K[年間1,000万円以上]
      
      style A fill:#667eea,stroke:#667eea,stroke-width:3px,color:#fff
      style B fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style C fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style E fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style F fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style G fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style H fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style I fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style J fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style K fill:#d1fae5,stroke:#10b981,stroke-width:3px
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
    if (costReductionFlowRef.current) {
      renderDiagram(costReductionFlowMermaid, costReductionFlowRef, 'cost-reduction-flow');
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
              <h1 style={{ margin: 0 }}>離職率の低下と採用コストの削減</h1>
            </div>
            <p className="specification-description">
              従業員の育児と仕事の両立を支援することで、離職率が低下し、採用コストを削減できるメリットについて説明します。
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
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>育児と仕事の両立支援不足</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    育児と仕事の両立が困難なため、優秀な人材が離職します。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>2</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>高い離職率</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    育児支援施策を実施していない企業では、離職率が平均10%高い傾向にあります。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>3</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>高い採用コスト</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    離職者の補充のため、採用コストが増加します（1人あたり約500万円）。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>4</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>ノウハウの喪失</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    経験者の離職により、ノウハウが喪失し、業務効率が低下します。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 統計データ */}
          <div className="specification-section">
            <h2>離職率と採用コストの現状</h2>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#667eea', color: '#fff' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>項目</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>育児支援なし</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>育児支援あり</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>差</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>離職率（育児中の従業員）</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>20%</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>10%</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>-10%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>採用コスト（1人あたり）</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>約500万円</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>約500万円</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>削減可能</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>教育コスト（1人あたり）</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>約200万円</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>約200万円</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>削減可能</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>年間採用コスト（従業員100名規模）</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>約1,000万円</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>約500万円</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>年間500万円削減</td>
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
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>500万円</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>年間採用コスト増加</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                  離職者の補充のため、採用コストが増加します（従業員100名規模の場合）。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>200万円</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>年間教育コスト増加</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                  新入社員の教育・研修コストが増加します。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>低下</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>生産性の低下</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                  経験者の離職により、ノウハウが喪失し、業務効率が低下します。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>低下</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>企業の競争力</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                  優秀な人材の離職により、企業の競争力が低下します。
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
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>育児と仕事の両立支援</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    支援制度の情報提供と申請手続きのサポートにより、育児と仕事の両立を支援します。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>2</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>従業員の満足度向上</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    育児の不安が解消され、仕事に集中できる環境が整います。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>3</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>離職率の低下</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    育児と仕事の両立が容易になることで、離職率が10%低下します。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>4</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>採用コストの削減</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    優秀な人材の離職を防ぐことで、採用コストを削減できます。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>5</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>ノウハウの蓄積</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    経験者の定着により、ノウハウが蓄積され、業務効率が向上します。
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

          {/* コスト削減フロー */}
          <div className="specification-section">
            <h2>コスト削減フロー</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <div ref={costReductionFlowRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}></div>
            </div>
          </div>

          {/* 効果 */}
          <div className="specification-section">
            <h2>期待される効果</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>↓10%</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>離職率の低下</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  育児支援施策を実施している企業では、離職率が平均10%低下する傾向があります（厚生労働省調査）。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>500万円</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>年間採用コスト削減</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  離職率10%低下により、年間500万円以上の採用コストを削減できます（従業員100名規模の場合）。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>200万円</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>年間教育コスト削減</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  新入社員の教育・研修コストを削減できます。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>向上</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>生産性の向上</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  経験者の定着により、ノウハウが蓄積され、業務効率が向上します。
                </p>
              </div>
            </div>
          </div>

          {/* エビデンス */}
          <div className="specification-section">
            <h2>エビデンス</h2>
            <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                育児支援施策を実施している企業では、離職率が平均10%低下する傾向がある（厚生労働省調査）。育児と仕事の両立を支援することで、
                従業員の満足度が向上し、離職を防ぐことができます。また、離職者の補充のための採用コストも削減できます。
              </p>
              <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#374151' }}>採用コストの内訳（1人あたり）</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#6b7280', lineHeight: '1.8' }}>
                  <li>採用広告費：約50万円</li>
                  <li>人材紹介会社への手数料：約100万円</li>
                  <li>面接・選考コスト：約50万円</li>
                  <li>内定者へのオファー・交渉：約30万円</li>
                  <li>入社前研修：約20万円</li>
                  <li>その他（時間コストなど）：約250万円</li>
                  <li><strong>合計：約500万円</strong></li>
                </ul>
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
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>教育コスト削減</h4>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#92400e' }}>年間200万円</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#78350f' }}>（新入社員教育コスト削減）</p>
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
                  <li>教育コスト削減：年間200万円</li>
                  <li>ノウハウ喪失防止による機会損失防止：年間300万円</li>
                  <li>従業員満足度向上による生産性向上効果：年間300万円</li>
                  <li><strong>合計効果：年間1,300万円以上</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationCaseStudyTurnoverReduction;
