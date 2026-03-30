import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationCaseStudyHealthManagement = () => {
  const navigate = useNavigate();
  const [diagram, setDiagram] = useState(null);
  const traditionalFlowRef = useRef(null);
  const appIntegratedFlowRef = useRef(null);
  const certificationFlowRef = useRef(null);

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
      A[企業] -->|健康経営・働き方改革| B[具体的な取り組みが不足]
      B -->|健康経営優良法人認定| C[取得が困難]
      B -->|くるみん認定| D[取得が困難]
      B -->|働き方改革| E[進展が遅い]
      
      C -->|具体的な施策不足| F[従業員の健康管理が<br/>経営課題として<br/>捉えられていない]
      D -->|具体的な取り組み不足| G[次世代育成支援の<br/>行動計画が不十分]
      E -->|育児と仕事の両立支援不足| H[働き方改革が停滞]
      
      F -->|認定取得できない| I[企業の社会的評価が<br/>向上しない]
      G -->|認定取得できない| I
      H -->|改革が進まない| I
      
      I -->|金融機関からの優遇なし| J[優遇金利が受けられない]
      I -->|公共調達での優遇なし| K[優遇措置が受けられない]
      I -->|優秀な人材の採用困難| L[企業の競争力低下]
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style C fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style D fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style E fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style F fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style G fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style H fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style I fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style J fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style K fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style L fill:#fef2f2,stroke:#ef4444,stroke-width:3px
  `;

  // アプリ導入後の解決フロー
  const appIntegratedFlowMermaid = `
    flowchart TD
      A[企業] -->|出産支援パーソナル<br/>アプリ導入| B[包括的な支援実現]
      B -->|従業員の健康管理| C[健康経営優良法人認定<br/>取得に貢献]
      B -->|ライフイベント支援| D[ワークライフバランス実現]
      B -->|次世代育成支援| E[くるみん認定取得に貢献]
      B -->|働き方改革推進| F[育児と仕事の両立支援]
      B -->|利用状況レポート| G[認定申請データ自動生成]
      
      C -->|健康管理の可視化| H[健康経営優良法人認定取得]
      D -->|従業員満足度向上| I[企業の社会的評価向上]
      E -->|行動計画の実施| J[くるみん認定取得]
      F -->|働き方改革の推進| I
      G -->|申請書類の自動生成| H
      G -->|申請書類の自動生成| J
      
      H -->|金融機関からの優遇| K[優遇金利が受けられる]
      H -->|公共調達での優遇| L[優遇措置が受けられる]
      J -->|助成金受給| M[最大50万円の助成金]
      I -->|ESG評価向上| N[企業の競争力向上]
      
      K -->|コスト削減| O[企業の財務改善]
      L -->|受注機会増加| O
      M -->|財務改善| O
      N -->|優秀な人材確保| O
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style C fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style E fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style F fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style G fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style H fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style I fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style J fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style K fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style L fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style M fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style N fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style O fill:#d1fae5,stroke:#10b981,stroke-width:3px
  `;

  // 認定取得フロー
  const certificationFlowMermaid = `
    flowchart LR
      A[アプリ導入] --> B[健康管理データ収集]
      A --> C[育児支援データ収集]
      A --> D[働き方改革データ収集]
      
      B --> E[健康経営優良法人<br/>認定申請データ]
      C --> F[くるみん認定<br/>申請データ]
      D --> G[働き方改革<br/>実績データ]
      
      E --> H[健康経営優良法人認定取得]
      F --> I[くるみん認定取得]
      G --> J[働き方改革推進企業認定]
      
      H --> K[金融機関優遇金利]
      H --> L[公共調達優遇]
      I --> M[助成金50万円]
      I --> L
      J --> N[企業ブランド向上]
      
      K --> O[企業の競争力向上]
      L --> O
      M --> O
      N --> O
      
      style A fill:#667eea,stroke:#667eea,stroke-width:3px,color:#fff
      style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style C fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style E fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style F fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style G fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style H fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style I fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style J fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style K fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style L fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style M fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style N fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style O fill:#d1fae5,stroke:#10b981,stroke-width:3px
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
    if (certificationFlowRef.current) {
      renderDiagram(certificationFlowMermaid, certificationFlowRef, 'certification-flow');
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
              <h1 style={{ margin: 0 }}>健康経営や働き方改革への取り組みが不十分</h1>
            </div>
            <p className="specification-description">
              健康経営優良法人認定やくるみん認定の取得を目指しているが、具体的な取り組みが不足している課題を、
              出産支援パーソナルアプリの導入により解決します。
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
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>健康経営優良法人認定の取得が困難</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    従業員の健康管理を経営課題として捉え、戦略的に取り組む具体的な施策が不足しています。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>2</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>くるみん認定の取得が困難</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    次世代育成支援対策推進法に基づく行動計画を策定・実施しているが、具体的な取り組みが不足しています。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>3</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>働き方改革の進展が遅い</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    育児と仕事の両立支援などの働き方改革の取り組みが進んでいません。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>4</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>企業の社会的評価が向上しない</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                    認定を取得できないため、企業の社会的評価が向上せず、優秀な人材の採用が困難です。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 統計データ */}
          <div className="specification-section">
            <h2>認定取得の現状</h2>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#667eea', color: '#fff' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>認定名</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>取得率</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>主なメリット</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>取得の難易度</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>健康経営優良法人認定</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669' }}>約3,000社</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>金融機関優遇金利、公共調達優遇</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>高</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>くるみん認定</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669' }}>約10,000社</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>助成金最大50万円、公共調達優遇</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>中</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>働き方改革推進企業認定</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669' }}>約5,000社</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>企業ブランド向上、ESG評価向上</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>中</td>
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
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>向上しない</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>企業の社会的評価</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                  認定を取得できないため、企業の社会的評価が向上しません。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>困難</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>優秀な人材の採用</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                  企業の社会的評価が低いため、優秀な人材の採用が困難です。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>受けられない</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>金融機関からの優遇</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                  健康経営優良法人認定を取得できないため、金融機関からの優遇金利が受けられません。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>受けられない</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#991b1b', fontWeight: '600' }}>公共調達での優遇</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }}>
                  認定を取得できないため、公共調達での優遇措置が受けられません。
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
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>従業員の健康管理</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    AIアシスタント機能により、従業員の健康管理をサポートし、健康経営優良法人認定の取得に貢献します。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>2</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>ライフイベント支援</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    出産・育児というライフイベントを包括的に支援し、従業員のワークライフバランスを実現します。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>3</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>次世代育成支援</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    次世代育成支援対策推進法に基づく行動計画の策定・実施をサポートし、くるみん認定の取得に貢献します。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>4</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>働き方改革の推進</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    育児と仕事の両立支援により、働き方改革を推進します。
                  </p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>5</div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>利用状況レポート</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    認定申請に必要なデータを自動的に集計・可視化し、申請をサポートします。
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

          {/* 認定取得フロー */}
          <div className="specification-section">
            <h2>認定取得フロー</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <div ref={certificationFlowRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}></div>
            </div>
          </div>

          {/* 効果 */}
          <div className="specification-section">
            <h2>期待される効果</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>取得可能</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>健康経営優良法人認定</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  従業員の健康管理を経営課題として捉え、戦略的に取り組む企業として認定されます。金融機関からの優遇金利や公共調達での優遇措置を受けられます。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>取得可能</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>くるみん認定</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  次世代育成支援対策推進法に基づく行動計画を策定・実施し、くるみん認定を取得できます。最大50万円の助成金が受給できます。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>向上</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>企業の社会的評価</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  認定を取得することで、企業の社会的評価が向上します。優秀な人材の採用が容易になり、ESG評価も向上します。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>向上</div>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#065f46', fontWeight: '600' }}>ESG評価</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
                  健康経営や働き方改革への取り組みにより、ESG評価が向上し、投資家や取引先からの評価が高まります。
                </p>
              </div>
            </div>
          </div>

          {/* 認定取得のメリット */}
          <div className="specification-section">
            <h2>認定取得のメリット</h2>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#92400e', fontWeight: '600' }}>健康経営優良法人認定</h3>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#78350f', lineHeight: '1.8' }}>
                    <li>金融機関からの優遇金利：年0.1%〜0.5%の金利優遇</li>
                    <li>公共調達での優遇措置：入札評価で加点</li>
                    <li>企業ブランドの向上</li>
                    <li>従業員の健康意識向上</li>
                  </ul>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#92400e', fontWeight: '600' }}>くるみん認定</h3>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#78350f', lineHeight: '1.8' }}>
                    <li>助成金：最大50万円</li>
                    <li>公共調達での優遇措置：入札評価で加点</li>
                    <li>企業ブランドの向上</li>
                    <li>従業員の満足度向上</li>
                  </ul>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#92400e', fontWeight: '600' }}>働き方改革推進企業認定</h3>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#78350f', lineHeight: '1.8' }}>
                    <li>企業ブランドの向上</li>
                    <li>ESG評価の向上</li>
                    <li>優秀な人材の採用が容易に</li>
                    <li>従業員の満足度向上</li>
                  </ul>
                </div>
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
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>くるみん助成金</h4>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#92400e' }}>最大50万円</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#78350f' }}>（初年度のみ）</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>金融機関優遇金利</h4>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#92400e' }}>年間100万円以上</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#78350f' }}>（融資額による）</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>投資対効果</h4>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#92400e' }}>2.5倍以上</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#78350f' }}>（初年度：投資60万円に対し、効果150万円以上）</p>
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#78350f' }}>追加効果</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#78350f', lineHeight: '1.8' }}>
                  <li>公共調達での優遇措置による受注機会増加：年間200万円以上</li>
                  <li>企業ブランド向上による採用コスト削減：年間300万円</li>
                  <li>ESG評価向上による投資家からの評価向上：無形資産</li>
                  <li>従業員満足度向上による生産性向上効果：年間300万円</li>
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

export default SpecificationCaseStudyHealthManagement;
