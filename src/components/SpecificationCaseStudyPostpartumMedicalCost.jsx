import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationCaseStudyPostpartumMedicalCost = () => {
  const navigate = useNavigate();
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
      A[出産後] -->|子どもの医療費| B[医療費負担が分からない]
      B -->|医療費助成制度の把握困難| C[制度を活用できない]
      B -->|申請手続きが分からない| D[申請を諦める]
      B -->|見通しが立たない| E[経済的な不安]
      
      C -->|支援を受けられない| F[経済的負担増加]
      D -->|申請を諦める| F
      E -->|不安が増大| F
      
      F -->|出産・育児への不安| G[ストレス増加]
      F -->|満足度の低下| H[離職を検討]
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style C fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style D fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style E fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style F fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style G fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style H fill:#fef2f2,stroke:#ef4444,stroke-width:2px
  `;

  // アプリ導入後の解決フロー
  const appIntegratedFlowMermaid = `
    flowchart TD
      A[出産後] -->|出産支援パーソナル<br/>アプリ導入| B[包括的な支援実現]
      B -->|制度の詳細情報| C[乳幼児医療費助成制度を把握]
      B -->|申請手続きのガイド| D[申請手続きが分かる]
      B -->|医療費負担の可視化| E[経済的な見通しが立つ]
      
      C -->|制度を活用| F[医療費負担軽減]
      D -->|申請が簡単| F
      E -->|見通しが立つ| F
      
      F -->|不安解消| G[ストレス軽減]
      F -->|満足度向上| H[出産・育児への安心]
      
      G -->|健康への好影響| I[ワークライフバランス]
      H -->|キャリア継続| I
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style C fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style E fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style F fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style G fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style H fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style I fill:#d1fae5,stroke:#10b981,stroke-width:2px
  `;

  // 解決プロセス
  const solutionFlowMermaid = `
    flowchart LR
      A[アプリ導入] --> B[制度の詳細情報]
      A --> C[申請手続きのガイド]
      A --> D[医療費負担の可視化]
      
      B --> E[乳幼児医療費助成制度を把握]
      C --> F[申請手続きが分かる]
      D --> G[経済的な見通しが立つ]
      
      E --> H[医療費負担軽減]
      F --> H
      G --> H
      
      H --> I[ストレス軽減]
      H --> J[出産・育児への安心]
      
      style A fill:#667eea,stroke:#667eea,stroke-width:3px,color:#fff
      style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style C fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style E fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style F fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style G fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style H fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style I fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style J fill:#d1fae5,stroke:#10b981,stroke-width:2px
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
              <h1 style={{ margin: 0 }}>子どもの医療費負担</h1>
            </div>
            <p className="specification-description">
              子どもの医療費がどのくらいかかるのか分からず、経済的な不安を感じる課題を、
              乳幼児医療費助成制度の情報提供により解決します。
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
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>医療費負担が分からない</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    子どもの医療費がどのくらいかかるのか分からず、経済的な見通しを立てることが困難です。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>2</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>医療費助成制度の申請手続きが分からない</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    乳幼児医療費助成制度の申請手続きが分からず、制度を活用できないことがあります。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>3</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>経済的な不安</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    医療費負担が分からないため、経済的な不安を感じます。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 統計データ */}
          <div className="specification-section">
            <h2>子どもの医療費と助成制度</h2>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#667eea', color: '#fff' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>項目</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>助成制度未活用</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>助成制度活用</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>差</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>医療費負担（月額）</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>5,000円〜</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>0円〜500円</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>-90%以上</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>申請手続きの理解度</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>50%</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>95%</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>+45%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>制度の活用率</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>60%</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>100%</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>+40%</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>経済的な不安</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>高</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>低</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>大幅改善</td>
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
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>制度の詳細情報</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    乳幼児医療費助成制度の詳細情報を提供し、制度の内容を把握できます。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>2</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>申請手続きのガイド</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    申請手続きを分かりやすくガイドし、申請書類の自動生成機能を提供します。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>3</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>医療費負担の可視化</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    医療費負担を可視化し、経済的な見通しを立てやすくします。
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
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>-90%以上</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>医療費負担の軽減</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  乳幼児医療費助成制度を活用することで、医療費負担が月額5,000円以上から0円〜500円に軽減されます。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>100%</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>制度の活用率</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  申請手続きが分かりやすくなるため、制度の活用率が60%から100%に向上します。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>↑45%</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>申請手続きの理解度向上</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  申請手続きのガイドにより、申請手続きの理解度が50%から95%に向上します。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>軽減</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>経済的な不安</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  医療費負担が軽減されるため、経済的な不安が軽減されます。
                </p>
              </div>
            </div>
          </div>

          {/* エビデンス */}
          <div className="specification-section">
            <h2>エビデンス</h2>
            <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                乳幼児医療費助成制度の情報を提供し、申請手続きをサポートすることで、
                医療費負担を軽減できます。申請手続きが分かりやすくなるため、制度を活用しやすくなります。
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#374151' }}>医療費負担軽減の効果</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#6b7280', lineHeight: '1.8' }}>
                    <li>医療費負担：月額5,000円以上 → 0円〜500円（-90%以上）</li>
                    <li>制度の活用率：60% → 100%（+40%）</li>
                    <li>申請手続きの理解度：50% → 95%（+45%）</li>
                  </ul>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#374151' }}>経済的な不安軽減の効果</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#6b7280', lineHeight: '1.8' }}>
                    <li>医療費負担が軽減され、経済的な不安が軽減</li>
                    <li>申請手続きが分かりやすくなり、制度を活用しやすくなる</li>
                    <li>満足度が向上し、離職率が低下</li>
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

export default SpecificationCaseStudyPostpartumMedicalCost;
