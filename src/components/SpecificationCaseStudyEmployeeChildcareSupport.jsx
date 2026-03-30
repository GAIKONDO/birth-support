import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationCaseStudyEmployeeChildcareSupport = () => {
  const navigate = useNavigate();
  const traditionalFlowRef = useRef(null);
  const appIntegratedFlowRef = useRef(null);
  const supportFlowRef = useRef(null);

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
      A[従業員] -->|育児| B[育児に関する不安]
      B -->|相談先がない| C[一人で抱え込む]
      B -->|専門知識の不足| D[適切な判断ができない]
      B -->|24時間対応不可| E[夜中の不安に対応できない]
      
      C -->|ストレス増加| F[育児の負担増加]
      D -->|誤った判断| F
      E -->|不安が解消されない| F
      
      F -->|仕事への集中力低下| G[生産性の低下]
      F -->|満足度の低下| H[離職を検討]
      
      G -->|業務効率低下| I[企業への影響]
      H -->|優秀な人材の離職| I
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style C fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style D fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style E fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style F fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style G fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style H fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style I fill:#fef2f2,stroke:#ef4444,stroke-width:3px
  `;

  // アプリ導入後の解決フロー
  const appIntegratedFlowMermaid = `
    flowchart TD
      A[従業員] -->|出産支援パーソナル<br/>アプリ導入| B[包括的な支援実現]
      B -->|AIアシスタント| C[24時間365日相談可能]
      B -->|専門知識の提供| D[適切な判断ができる]
      B -->|即座の対応| E[不安が即座に解消]
      
      C -->|いつでも相談| F[育児の不安解消]
      D -->|専門知識に基づくアドバイス| F
      E -->|即座の対応| F
      
      F -->|ストレス軽減| G[育児の負担軽減]
      F -->|満足度向上| H[育児と仕事の両立]
      
      G -->|仕事への集中力向上| I[生産性の向上]
      H -->|キャリア継続| J[優秀な人材の定着]
      
      I -->|業務効率向上| K[企業への貢献]
      J -->|ノウハウの蓄積| K
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style C fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style E fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style F fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style G fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style H fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style I fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style J fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style K fill:#d1fae5,stroke:#10b981,stroke-width:3px
  `;

  // 不安解消フロー
  const supportFlowMermaid = `
    flowchart LR
      A[アプリ導入] --> B[AIアシスタント機能]
      A --> C[専門知識の提供]
      A --> D[24時間365日対応]
      
      B --> E[育児の不安解消]
      C --> E
      D --> E
      
      E --> F[ストレス軽減]
      E --> G[適切な判断]
      E --> H[育児の負担軽減]
      
      F --> I[満足度向上]
      G --> I
      H --> I
      
      I --> J[育児と仕事の両立]
      I --> K[生産性向上]
      
      style A fill:#667eea,stroke:#667eea,stroke-width:3px,color:#fff
      style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style C fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style E fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style F fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style G fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style H fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style I fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style J fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style K fill:#d1fae5,stroke:#10b981,stroke-width:2px
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
    if (supportFlowRef.current) {
      renderDiagram(supportFlowMermaid, supportFlowRef, 'support-flow');
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
              <h1 style={{ margin: 0 }}>育児に関する不安が解消される</h1>
            </div>
            <p className="specification-description">
              AIアシスタント機能により、24時間365日いつでも育児に関する相談やアドバイスを受けられるメリットについて説明します。
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
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>相談先がない</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    育児に関する不安を相談できる相手がおらず、一人で抱え込んでしまうことがあります。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>2</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>専門知識の不足</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    育児に関する専門知識が不足しており、適切な判断ができないことがあります。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>3</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>24時間対応不可</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    夜中に子どもの体調不良などで不安になったときでも、相談できる相手がいません。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>4</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>ストレスの増加</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    育児の不安が解消されないため、ストレスが増加し、育児の負担が大きくなります。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 統計データ */}
          <div className="specification-section">
            <h2>育児に関する不安の現状</h2>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#667eea', color: '#fff' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>項目</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>相談先なし</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>AIアシスタント活用</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>差</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>相談可能時間</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>限定的</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>24時間365日</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>いつでも相談可能</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>不安解消時間</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>数時間〜数日</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>即座</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>大幅短縮</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>専門知識の提供</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>限定的</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>専門知識に基づく</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>適切な判断が可能</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>ストレスレベル</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>高</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>低</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>大幅改善</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>満足度</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>低</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>高</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>向上</td>
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

          {/* 解決策 */}
          <div className="specification-section">
            <h2>解決策：出産支援パーソナルアプリの導入</h2>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>1</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>24時間365日相談可能</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    AIアシスタント機能により、24時間365日いつでも育児に関する相談やアドバイスを受けられます。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>2</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>専門知識に基づくアドバイス</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    AIアシスタントが専門知識に基づいたアドバイスを提供するため、適切な判断ができます。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>3</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>即座の対応</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    育児に関する不安を即座に相談でき、適切なアドバイスを受けられるため、不安が即座に解消されます。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>4</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>一人で抱え込まない</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    いつでも相談できるため、一人で育児を抱え込むことがなくなり、ストレスが軽減されます。
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

          {/* 不安解消フロー */}
          <div className="specification-section">
            <h2>不安解消フロー</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <div ref={supportFlowRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}></div>
            </div>
          </div>

          {/* 効果 */}
          <div className="specification-section">
            <h2>期待される効果</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>24時間365日</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>相談可能</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  AIアシスタント機能により、24時間365日いつでも育児に関する相談やアドバイスを受けられます。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>即座</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>不安解消</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  育児に関する不安を即座に相談でき、適切なアドバイスを受けられるため、不安が即座に解消されます。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>専門知識</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>適切な判断</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  AIアシスタントが専門知識に基づいたアドバイスを提供するため、適切な判断ができます。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>軽減</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>ストレス</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  育児の不安が解消されることで、ストレスが軽減され、育児の負担が軽減されます。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>向上</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>満足度</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  育児の不安が解消されることで、満足度が向上し、育児と仕事の両立が容易になります。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>向上</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>生産性</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  ストレスが軽減されることで、仕事への集中力が向上し、生産性が向上します。
                </p>
              </div>
            </div>
          </div>

          {/* エビデンス */}
          <div className="specification-section">
            <h2>エビデンス</h2>
            <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                AIアシスタント機能により、24時間365日いつでも育児に関する相談やアドバイスを受けられることで、
                育児の不安が即座に解消され、ストレスが軽減されます。専門知識に基づいた適切な判断ができるため、
                育児の負担が軽減され、満足度が向上します。
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#374151' }}>AIアシスタントの効果</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#6b7280', lineHeight: '1.8' }}>
                    <li>24時間365日いつでも相談可能</li>
                    <li>不安が即座に解消される</li>
                    <li>専門知識に基づいた適切な判断ができる</li>
                    <li>一人で育児を抱え込まない</li>
                  </ul>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#374151' }}>ストレス軽減の効果</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#6b7280', lineHeight: '1.8' }}>
                    <li>ストレスが軽減され、育児の負担が軽減</li>
                    <li>満足度が向上し、離職率が低下</li>
                    <li>仕事への集中力が向上し、生産性が向上</li>
                    <li>育児と仕事の両立が容易になる</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationCaseStudyEmployeeChildcareSupport;
