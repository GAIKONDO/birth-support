import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationCaseStudyGovernmentReporting = () => {
  const navigate = useNavigate();
  const [diagram, setDiagram] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const diagramRef = useRef(null);

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

  // 国への報告フロー図（従来型）
  const traditionalFlowMermaid = `
    flowchart TD
      A[企業] -->|行動計画策定| B[次世代育成支援対策<br/>推進法に基づく<br/>行動計画]
      A -->|実施報告| C[厚生労働省<br/>都道府県労働局]
      A -->|健康経営優良法人<br/>認定申請| D[経済産業省]
      A -->|くるみん認定申請| E[厚生労働省]
      
      B -->|報告書作成| F[担当者が手作業で<br/>データ収集・集計]
      F -->|報告書提出| C
      F -->|報告書提出| D
      F -->|報告書提出| E
      
      F -->|時間: 40時間/年| G[報告業務の負担]
      F -->|報告漏れのリスク| H[認定取得の遅延]
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style C fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style E fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style F fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style G fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style H fill:#fef2f2,stroke:#ef4444,stroke-width:2px
  `;

  // アプリ連携後の報告フロー図
  const appIntegratedFlowMermaid = `
    flowchart TD
      A[企業] -->|アプリ導入| B[出産支援パーソナル<br/>アプリ]
      B -->|利用状況データ<br/>自動収集| C[利用状況レポート<br/>自動生成]
      
      A -->|行動計画策定| D[次世代育成支援対策<br/>推進法に基づく<br/>行動計画]
      C -->|データ自動集計| E[報告書自動生成]
      E -->|報告書提出| F[厚生労働省<br/>都道府県労働局]
      E -->|報告書提出| G[経済産業省]
      E -->|報告書提出| H[厚生労働省]
      
      C -->|時間: 4時間/年| I[報告業務の負担<br/>90%削減]
      C -->|報告漏れなし| J[認定取得の促進]
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style C fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style E fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style F fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style G fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style H fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style I fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style J fill:#d1fae5,stroke:#10b981,stroke-width:2px
  `;

  // お金の流れ図
  const moneyFlowMermaid = `
    flowchart LR
      A[企業] -->|アプリ導入費用<br/>月額500円/人| B[出産支援パーソナル<br/>アプリ運営会社]
      
      A -->|行動計画策定・実施| C[次世代育成支援対策<br/>推進法に基づく<br/>取り組み]
      C -->|くるみん認定取得| D[厚生労働省]
      D -->|助成金<br/>最大50万円| A
      
      A -->|健康経営施策実施| E[健康経営優良法人<br/>認定取得]
      E -->|金融機関優遇金利<br/>年間数百万円| F[金融機関]
      E -->|公共調達優遇| G[公共調達]
      
      A -->|両立支援等助成金<br/>申請| H[厚生労働省]
      H -->|助成金支給| A
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:3px
      style B fill:#e0e7ff,stroke:#667eea,stroke-width:2px
      style C fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style E fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style F fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style G fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style H fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
  `;

  const [selectedDiagram, setSelectedDiagram] = useState('traditional');

  // Mermaid図のレンダリング
  useEffect(() => {
    const renderDiagram = async (mermaidCode, ref) => {
      if (!ref.current) return;
      
      ref.current.innerHTML = '';
      ref.current.style.opacity = '0';
      ref.current.style.visibility = 'hidden';
      
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        ref.current.innerHTML = svg;
        
        setTimeout(() => {
          const svgElement = ref.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.transform = `scale(${zoomLevel})`;
            svgElement.style.transformOrigin = 'center center';
            svgElement.style.transition = 'transform 0.2s ease-out';
            ref.current.style.visibility = 'visible';
            ref.current.style.opacity = '1';
            ref.current.style.transition = 'opacity 0.3s ease-in';
          }
        }, 200);
        
        setDiagram(true);
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (ref.current) {
          ref.current.style.visibility = 'visible';
          ref.current.style.opacity = '1';
        }
        setDiagram(false);
      }
    };

    const diagramMap = {
      'traditional': traditionalFlowMermaid,
      'app-integrated': appIntegratedFlowMermaid,
      'money-flow': moneyFlowMermaid
    };
    const mermaidCode = diagramMap[selectedDiagram];
    
    if (diagramRef.current && mermaidCode) {
      renderDiagram(mermaidCode, diagramRef);
    }
  }, [zoomLevel, selectedDiagram]);

  const handleDiagramChange = (diagramType) => {
    setSelectedDiagram(diagramType);
  };

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
              <h1 style={{ margin: 0 }}>国への報告業務の効率化</h1>
            </div>
            <p className="specification-description">
              次世代育成支援対策推進法に基づく行動計画の策定・実施報告や、健康経営優良法人認定の申請など、
              国への報告業務が煩雑で、担当者の負担が大きい課題を、出産支援パーソナルアプリの導入により解決します。
            </p>
          </div>

          {/* 課題の詳細 */}
          <div className="specification-section">
            <h2>課題の詳細</h2>
            <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5', marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px', color: '#991b1b' }}>現状の課題</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: '#7f1d1d' }}>
                <li><strong>報告業務に時間がかかる：</strong>次世代育成支援対策推進法に基づく行動計画の実施報告には、従業員の利用状況や取り組み内容を手作業で収集・集計する必要があり、年間40時間以上の時間がかかる</li>
                <li><strong>報告漏れのリスク：</strong>複数の省庁への報告が必要で、報告期限が異なるため、報告漏れのリスクがある</li>
                <li><strong>担当者の負担が大きい：</strong>報告業務に時間を取られることで、他の業務に集中できず、担当者の負担が大きい</li>
                <li><strong>データの正確性：</strong>手作業でのデータ収集・集計のため、データの正確性に課題がある</li>
              </ul>
            </div>
          </div>

          {/* フロー図の比較 */}
          <div className="specification-section">
            <h2>報告フローの比較</h2>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleDiagramChange('traditional')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: selectedDiagram === 'traditional' ? '2px solid #667eea' : '1px solid #ddd',
                    backgroundColor: selectedDiagram === 'traditional' ? '#667eea' : '#fff',
                    color: selectedDiagram === 'traditional' ? '#fff' : '#374151',
                    fontSize: '14px',
                    fontWeight: selectedDiagram === 'traditional' ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedDiagram === 'traditional' ? '0 2px 4px rgba(102, 126, 234, 0.2)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDiagram !== 'traditional') {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#667eea';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDiagram !== 'traditional') {
                      e.currentTarget.style.backgroundColor = '#fff';
                      e.currentTarget.style.borderColor = '#ddd';
                    }
                  }}
                >
                  従来型の報告フロー
                </button>
                <button
                  onClick={() => handleDiagramChange('app-integrated')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: selectedDiagram === 'app-integrated' ? '2px solid #667eea' : '1px solid #ddd',
                    backgroundColor: selectedDiagram === 'app-integrated' ? '#667eea' : '#fff',
                    color: selectedDiagram === 'app-integrated' ? '#fff' : '#374151',
                    fontSize: '14px',
                    fontWeight: selectedDiagram === 'app-integrated' ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedDiagram === 'app-integrated' ? '0 2px 4px rgba(102, 126, 234, 0.2)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDiagram !== 'app-integrated') {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#667eea';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDiagram !== 'app-integrated') {
                      e.currentTarget.style.backgroundColor = '#fff';
                      e.currentTarget.style.borderColor = '#ddd';
                    }
                  }}
                >
                  アプリ連携後の報告フロー
                </button>
                <button
                  onClick={() => handleDiagramChange('money-flow')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: selectedDiagram === 'money-flow' ? '2px solid #667eea' : '1px solid #ddd',
                    backgroundColor: selectedDiagram === 'money-flow' ? '#667eea' : '#fff',
                    color: selectedDiagram === 'money-flow' ? '#fff' : '#374151',
                    fontSize: '14px',
                    fontWeight: selectedDiagram === 'money-flow' ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedDiagram === 'money-flow' ? '0 2px 4px rgba(102, 126, 234, 0.2)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDiagram !== 'money-flow') {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#667eea';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDiagram !== 'money-flow') {
                      e.currentTarget.style.backgroundColor = '#fff';
                      e.currentTarget.style.borderColor = '#ddd';
                    }
                  }}
                >
                  お金の流れ
                </button>
              </div>
            </div>
            <div className="mermaid-chart-wrapper" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
              <div className="mermaid-zoom-controls" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
                <button className="zoom-button" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))} style={{ padding: '4px 8px', fontSize: '12px' }}>-</button>
                <span className="zoom-level" style={{ padding: '4px 8px', fontSize: '12px' }}>{Math.round(zoomLevel * 100)}%</span>
                <button className="zoom-button" onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))} style={{ padding: '4px 8px', fontSize: '12px' }}>+</button>
                <button className="zoom-button" onClick={() => setZoomLevel(1)} style={{ padding: '4px 8px', fontSize: '12px' }}>リセット</button>
              </div>
              <div className="mermaid-container" ref={diagramRef} style={{ minHeight: '400px', overflow: 'auto' }}></div>
            </div>
          </div>

          {/* 解決策の詳細 */}
          <div className="specification-section">
            <h2>解決策の詳細</h2>
            <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6', marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px', color: '#1e40af' }}>アプリ連携による効率化</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: '#1e3a8a' }}>
                <li><strong>利用状況データの自動収集：</strong>アプリの利用状況が自動的にデータベースに記録され、手作業でのデータ収集が不要になる</li>
                <li><strong>報告書の自動生成：</strong>利用状況データを基に、報告書に必要なデータを自動的に集計・可視化し、報告書を自動生成できる</li>
                <li><strong>報告期限のリマインダー：</strong>アプリのアクション管理機能により、報告期限を設定し、リマインダーで通知されるため、報告漏れのリスクがなくなる</li>
                <li><strong>データの正確性向上：</strong>自動収集・自動集計により、データの正確性が向上する</li>
              </ul>
            </div>
          </div>

          {/* 効果・影響 */}
          <div className="specification-section">
            <h2>効果・影響</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#065f46' }}>時間削減</h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#047857', marginBottom: '8px' }}>90%削減</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#065f46', lineHeight: '1.6' }}>
                  報告業務の時間が年間40時間から4時間に削減（90%削減）。担当者は他の業務に集中できる。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#065f46' }}>報告漏れの防止</h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#047857', marginBottom: '8px' }}>100%防止</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#065f46', lineHeight: '1.6' }}>
                  リマインダー機能により、報告期限を逃すリスクがなくなり、報告漏れが100%防止される。
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#065f46' }}>データの正確性</h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#047857', marginBottom: '8px' }}>向上</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#065f46', lineHeight: '1.6' }}>
                  自動収集・自動集計により、データの正確性が向上し、信頼性の高い報告が可能になる。
                </p>
              </div>
            </div>
          </div>

          {/* 助成金・優遇措置 */}
          <div className="specification-section">
            <h2>助成金・優遇措置</h2>
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #667eea' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '200px' }}>制度名</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '200px' }}>実施機関</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', border: '1px solid #ddd', minWidth: '300px' }}>内容</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', border: '1px solid #ddd', minWidth: '200px' }}>金額・優遇内容</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: '600' }}>くるみん助成金</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>厚生労働省</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>次世代育成支援対策推進法に基づく行動計画を策定・実施し、くるみん認定を取得した中小企業に支給</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>最大50万円</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: '600' }}>健康経営優良法人認定</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>経済産業省</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>従業員の健康管理を経営課題として捉え、戦略的に取り組む企業を認定</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>金融機関優遇金利<br/>公共調達優遇<br/>年間数百万円の効果</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: '600' }}>両立支援等助成金</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>厚生労働省</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>育児と仕事の両立を支援する取り組みを行った企業に支給</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>取り組み内容に応じて異なる</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 投資対効果 */}
          <div className="specification-section">
            <h2>投資対効果（ROI）</h2>
            <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b', marginTop: '16px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', color: '#92400e' }}>試算例（従業員100名規模の場合）</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>投資額</h4>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#92400e' }}>年間60万円</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>（月額500円 × 100名 × 12ヶ月）</p>
                </div>
                <div>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>報告業務時間削減</h4>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#92400e' }}>年間36時間削減</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>（時給3,000円換算で108,000円）</p>
                </div>
                <div>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>助成金・優遇措置</h4>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#92400e' }}>年間150万円以上</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>（くるみん助成金50万円 + 金融機関優遇等）</p>
                </div>
                <div>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>投資対効果</h4>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#92400e' }}>2.5倍以上</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>（投資額60万円に対し、効果150万円以上）</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationCaseStudyGovernmentReporting;

