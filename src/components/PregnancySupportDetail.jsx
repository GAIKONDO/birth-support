import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import mermaid from 'mermaid';
import './LumpSumDetail.css';

const PregnancySupportDetail = () => {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState('flow'); // 'correlation', 'components', 'flow'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef(null);

  // 全画面表示の状態を監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
        edgeLabelBackground: 'transparent',
        primaryTextColor: '#374151',
        primaryBorderColor: '#6b7280',
        lineColor: '#6b7280',
        secondaryColor: 'transparent',
        tertiaryColor: 'transparent'
      }
    });
  }, []);

  // Mermaid図をレンダリングするコンポーネント
  const MermaidChart = ({ chart, id, zoomLevel = 1 }) => {
    const chartRef = useRef(null);

    useEffect(() => {
      if (chartRef.current) {
        const uniqueId = `mermaid-${id}-${Date.now()}`;
        mermaid.render(uniqueId, chart).then(({ svg }) => {
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
            
            setTimeout(() => {
              const svgElement = chartRef.current.querySelector('svg');
              if (svgElement) {
                svgElement.style.transform = `scale(${zoomLevel})`;
                svgElement.style.transformOrigin = 'center center';
              }
            }, 100);
            
            setTimeout(() => {
              const svgElement = chartRef.current?.querySelector('svg');
              if (!svgElement) return;
              
              const nodeRects = svgElement.querySelectorAll('.node rect');
              nodeRects.forEach((rect) => {
                rect.setAttribute('rx', '16');
                rect.setAttribute('ry', '16');
                
                let defs = svgElement.querySelector('defs');
                if (!defs) {
                  defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                  svgElement.insertBefore(defs, svgElement.firstChild);
                }
                
                let filter = defs.querySelector('#node-shadow');
                if (!filter) {
                  filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                  filter.setAttribute('id', 'node-shadow');
                  filter.setAttribute('x', '-50%');
                  filter.setAttribute('y', '-50%');
                  filter.setAttribute('width', '200%');
                  filter.setAttribute('height', '200%');
                  
                  const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                  feGaussianBlur.setAttribute('in', 'SourceAlpha');
                  feGaussianBlur.setAttribute('stdDeviation', '4');
                  
                  const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
                  feOffset.setAttribute('dx', '0');
                  feOffset.setAttribute('dy', '2');
                  feOffset.setAttribute('result', 'offsetblur');
                  
                  const feComponentTransfer = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
                  const feFuncA = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncA');
                  feFuncA.setAttribute('type', 'linear');
                  feFuncA.setAttribute('slope', '0.3');
                  feComponentTransfer.appendChild(feFuncA);
                  
                  const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
                  const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                  const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                  feMergeNode2.setAttribute('in', 'SourceGraphic');
                  
                  feMerge.appendChild(feMergeNode1);
                  feMerge.appendChild(feMergeNode2);
                  
                  filter.appendChild(feGaussianBlur);
                  filter.appendChild(feOffset);
                  filter.appendChild(feComponentTransfer);
                  filter.appendChild(feMerge);
                  defs.appendChild(filter);
                }
                
                rect.setAttribute('filter', 'url(#node-shadow)');
              });
              
              const clusterRects = svgElement.querySelectorAll('.cluster rect');
              clusterRects.forEach((rect) => {
                rect.setAttribute('rx', '20');
                rect.setAttribute('ry', '20');
              });
              
              const edgePaths = svgElement.querySelectorAll('.edgePath');
              edgePaths.forEach((edgePath) => {
                const path = edgePath.querySelector('path');
                if (!path) return;
                path.setAttribute('stroke', '#6b7280');
                path.setAttribute('stroke-width', '2');
              });
              
              const foreignObjects = svgElement.querySelectorAll('foreignObject');
              foreignObjects.forEach((fo) => {
                const div = fo.querySelector('div');
                if (div) {
                  const textWidth = div.scrollWidth || div.offsetWidth;
                  const textHeight = div.scrollHeight || div.offsetHeight;
                  
                  if (textWidth > 0) {
                    const newWidth = Math.ceil(textWidth) + 20;
                    fo.setAttribute('width', newWidth.toString());
                  }
                  
                  if (textHeight > 0) {
                    const newHeight = Math.ceil(textHeight) + 20;
                    fo.setAttribute('height', newHeight.toString());
                  }
                }
              });
              
              const edgeLabels = svgElement.querySelectorAll('.edgeLabel foreignObject div');
              edgeLabels.forEach((div) => {
                div.style.backgroundColor = '#fce7f3';
                div.style.borderRadius = '12px';
                div.style.padding = '4px 8px';
                div.style.display = 'inline-block';
              });
            }, 200);
          }
        }).catch(error => {
          console.error('Error rendering Mermaid chart:', error);
        });
      }
    }, [chart, id, zoomLevel]);
    
    useEffect(() => {
      if (chartRef.current) {
        const svgElement = chartRef.current.querySelector('svg');
        if (svgElement) {
          requestAnimationFrame(() => {
            svgElement.style.transform = `scale(${zoomLevel})`;
            svgElement.style.transformOrigin = 'center center';
          });
        }
      }
    }, [zoomLevel]);

    return (
      <div className="mermaid-chart-wrapper">
        <div ref={chartRef} className="mermaid-chart" />
      </div>
    );
  };

  // 相関図の定義
  const architectureDiagram = `
    graph TB
      subgraph areaD[" "]
        D["📋 こども家庭庁"]
        D_DESC["制度の設計と監督を行う国の機関"]
      end
      
      subgraph areaE[" "]
        E["🏛️ 市区町村"]
        E_DESC["相談支援と給付金の申請受付を行う機関"]
      end
      
      subgraph areaA[" "]
        A["👤 あなた<br/>（妊婦）"]
        A_DESC["伴走型相談支援と妊婦支援給付を受ける当事者"]
      end
      
      subgraph areaB[" "]
        B["💬 相談支援員"]
        B_DESC["妊娠期から出産・子育て期にかけての相談支援を行う専門家"]
      end
      
      D -->|"1. 制度設計・監督<br/>（事務処理）"| E
      E -->|"2. 相談支援の提供<br/>（支援）"| B
      A -->|"3. 妊娠届出<br/>（申請）"| E
      A -->|"4. 相談支援の利用<br/>（相談）"| B
      E -->|"5. 給付金の支給<br/>（支給）"| A
      B -->|"6. 必要な支援への案内<br/>（案内）"| A
      
      style A fill:#e9d5ff,stroke:#a855f7,stroke-width:3px,color:#581c87,font-weight:bold
      style A_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#581c87,font-weight:normal,font-size:10px
      style areaA fill:#f3e8ff,stroke:#a855f7,stroke-width:2px,stroke-dasharray: 5 5
      
      style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e40af,font-weight:bold
      style B_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#1e40af,font-weight:normal,font-size:10px
      style areaB fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,stroke-dasharray: 5 5
      
      style D fill:#f3f4f6,stroke:#6b7280,stroke-width:2px,color:#374151,font-weight:bold
      style D_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#374151,font-weight:normal,font-size:10px
      style areaD fill:#f9fafb,stroke:#6b7280,stroke-width:2px,stroke-dasharray: 5 5
      
      style E fill:#d1fae5,stroke:#10b981,stroke-width:2px,color:#065f46,font-weight:bold
      style E_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#065f46,font-weight:normal,font-size:10px
      style areaE fill:#ecfdf5,stroke:#10b981,stroke-width:2px,stroke-dasharray: 5 5
  `;

  // 制度構成要素図の定義
  const componentDiagram = `
    graph LR
      A[伴走型相談支援と<br/>妊婦支援給付制度] --> B[対象者]
      A --> C[支給金額]
      A --> D[支給時期]
      A --> G[申請期限]
      
      B --> B1[妊娠届出をした妊婦]
      
      C --> C1[妊娠届出時に5万円]
      C1 --> C2[妊娠後期以降に5万円<br/>（妊娠している子どもの数に応じて）]
      
      D --> D1[妊娠届出時]
      D1 --> D2[妊娠後期以降]
      
      G --> G1[妊娠届出時]
      G1 --> G2[妊娠後期以降]
      
      G2 --> E[申請方法]
      
      E --> E1[市区町村に申請]
      
      E1 --> F[必要書類]
      
      F --> F1[妊娠届出書]
      F --> F2[本人確認書類]
      F --> F3[口座情報]
      
      style A fill:#e9d5ff,stroke:#a855f7,stroke-width:3px,color:#581c87,font-weight:bold
      style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e40af,font-weight:bold
      style C fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e,font-weight:bold
      style D fill:#fed7aa,stroke:#f97316,stroke-width:2px,color:#9a3412,font-weight:bold
      style G fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e,font-weight:bold
      style E fill:#d1fae5,stroke:#10b981,stroke-width:2px,color:#065f46,font-weight:bold
      style F fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#312e81,font-weight:bold
  `;

  // 申請フロー図の定義
  const applicationFlowSequence = `
    sequenceDiagram
      participant 妊婦 as 妊婦<br/>（当事者）
      participant 市区町村 as 市区町村<br/>（申請受付機関）
      participant 相談支援員 as 相談支援員<br/>（相談支援の専門家）
      participant こども家庭庁 as こども家庭庁<br/>（制度の監督機関）
      
      妊婦->>市区町村: 1. 妊娠届出<br/>（妊娠届出書の提出）
      市区町村->>市区町村: 2. 申請書類の確認
      市区町村->>妊婦: 3. 第1回給付金の支給<br/>（5万円）
      市区町村->>相談支援員: 4. 相談支援の案内
      相談支援員->>妊婦: 5. 相談支援の提供<br/>（妊娠期から出産・子育て期にかけて）
      妊婦->>市区町村: 6. 妊娠後期以降の申請<br/>（必要書類の提出）
      市区町村->>市区町村: 7. 申請書類の確認
      市区町村->>妊婦: 8. 第2回給付金の支給<br/>（5万円、妊娠している子どもの数に応じて）
      市区町村->>こども家庭庁: 9. 支給実績の報告
  `;

  if (!currentUser) {
    return null;
  }

  return (
    <div className="lump-sum-detail-page">
      <div className="lump-sum-detail-content-card">
      <div className="lump-sum-detail-content">
        {/* Mermaid図セクション */}
        <div className="detail-section mermaid-section">
          <h2>制度の仕組みと関係組織</h2>
          
          <div className="detail-card" ref={fullscreenRef}>
            <div className="diagram-header">
              <h3 className="section-subtitle">
                {viewMode === 'correlation' && '関係組織の相関図'}
                {viewMode === 'components' && '制度の構成要素'}
                {viewMode === 'flow' && '申請フロー'}
              </h3>
              <div className="diagram-controls">
                <div className="diagram-toggle">
                  <button
                    className={`toggle-button ${viewMode === 'flow' ? 'active' : ''}`}
                    onClick={() => setViewMode('flow')}
                  >
                    申請フロー
                  </button>
                  <button
                    className={`toggle-button ${viewMode === 'components' ? 'active' : ''}`}
                    onClick={() => setViewMode('components')}
                  >
                    制度構成要素
                  </button>
                  <button
                    className={`toggle-button ${viewMode === 'correlation' ? 'active' : ''}`}
                    onClick={() => setViewMode('correlation')}
                  >
                    相関図
                  </button>
                </div>
                <div className="mermaid-zoom-controls">
                  <button 
                    className="zoom-button" 
                    onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                    title="縮小"
                  >
                    −
                  </button>
                  <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                  <button 
                    className="zoom-button" 
                    onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
                    title="拡大"
                  >
                    ＋
                  </button>
                  <button 
                    className="zoom-button reset-button" 
                    onClick={() => setZoomLevel(1)}
                    title="リセット"
                  >
                    リセット
                  </button>
                  <button
                    className="fullscreen-button"
                    onClick={async () => {
                      if (!document.fullscreenElement) {
                        try {
                          await fullscreenRef.current.requestFullscreen();
                        } catch (err) {
                          console.error('全画面表示に失敗しました:', err);
                        }
                      } else {
                        try {
                          await document.exitFullscreen();
                        } catch (err) {
                          console.error('全画面解除に失敗しました:', err);
                        }
                      }
                    }}
                    title={isFullscreen ? "全画面を解除" : "全画面表示"}
                  >
                    {isFullscreen ? '✕' : '⛶'}
                  </button>
                </div>
              </div>
            </div>
            
            {viewMode === 'correlation' && (
              <>
                <p className="section-description">
                  伴走型相談支援と妊婦支援給付制度に関わる主要な組織とその関係性を示します。<strong className="highlight-text">紫色の枠で囲まれた「あなた」が当事者（妊婦）の位置</strong>です。図中の数字は手続きの流れを示しています。
                </p>
                <div className="mermaid-container">
                  <MermaidChart chart={architectureDiagram} id="pregnancy-support-correlation" zoomLevel={zoomLevel} />
                </div>
                <div className="diagram-legend">
                  <h4 className="legend-title">図の見方</h4>
                  <ul className="legend-list">
                    <li><strong className="legend-you">👤 あなた（妊婦）</strong>：伴走型相談支援と妊婦支援給付を受ける当事者です。妊娠届出をした妊婦が対象です。</li>
                    <li><strong>💬 相談支援員</strong>：妊娠期から出産・子育て期にかけての相談支援を行う専門家です。</li>
                    <li><strong>🏛️ 市区町村</strong>：相談支援と給付金の申請受付を行う機関です。</li>
                    <li><strong>📋 こども家庭庁</strong>：制度の設計と監督を行う国の機関です。</li>
                  </ul>
                </div>
              </>
            )}

            {viewMode === 'components' && (
              <>
                <p className="section-description">
                  伴走型相談支援と妊婦支援給付制度の構成要素を樹形図で示します。
                </p>
                <div className="mermaid-container">
                  <MermaidChart chart={componentDiagram} id="pregnancy-support-component" zoomLevel={zoomLevel} />
                </div>
              </>
            )}

            {viewMode === 'flow' && (
              <>
                <p className="section-description">
                  伴走型相談支援と妊婦支援給付の申請フローを示します。
                  <br />
                  <span style={{ fontSize: '13px', color: '#dc2626', fontStyle: 'italic' }}>
                    ※伴走型相談支援と妊婦支援給付は、妊娠期から出産・子育て期にかけての相談支援と経済的支援を組み合わせて提供する制度です。妊娠届出時に5万円、妊娠後期以降に5万円（妊娠している子どもの数に応じて）が支給されます。
                  </span>
                </p>
                <div className="mermaid-container">
                  <MermaidChart chart={applicationFlowSequence} id="pregnancy-support-flow" zoomLevel={zoomLevel} />
                </div>
                <div className="flow-explanation" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>市区町村について</h4>
                  <p style={{ margin: 0, marginBottom: '24px', color: '#6b7280' }}>
                    市区町村は、伴走型相談支援と妊婦支援給付の申請受付と給付金の支給を行う機関です。妊娠届出の際に申請手続きを行い、給付金の支給を行います。
                  </p>
                  
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>申請フローの各手順について</h4>
                  <ol style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>妊娠届出</strong><br />
                      妊婦が市区町村に妊娠届出書を提出します。これにより、伴走型相談支援と妊婦支援給付の対象となります。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>申請書類の確認</strong><br />
                      市区町村が提出された申請書類を確認し、給付金の支給可否を判断します。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>第1回給付金の支給</strong><br />
                      市区町村が妊婦の指定口座に第1回給付金（5万円）を振り込みます。妊娠届出時に支給されます。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>相談支援の案内</strong><br />
                      市区町村が相談支援員を紹介し、相談支援の利用を案内します。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>相談支援の提供</strong><br />
                      相談支援員が妊娠期から出産・子育て期にかけて、継続的な相談支援を提供します。出産・子育てに関する相談に応じ、必要な支援につなぎます。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>妊娠後期以降の申請</strong><br />
                      妊婦が妊娠後期以降に、第2回給付金の申請を行います。必要書類を市区町村に提出します。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>申請書類の確認</strong><br />
                      市区町村が提出された申請書類を確認し、給付金の支給可否を判断します。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>第2回給付金の支給</strong><br />
                      市区町村が妊婦の指定口座に第2回給付金（5万円、妊娠している子どもの数に応じて）を振り込みます。
                    </li>
                    <li style={{ marginBottom: '0' }}>
                      <strong style={{ color: '#374151' }}>支給実績の報告</strong><br />
                      市区町村がこども家庭庁に支給実績を報告します。これにより、制度の運用状況が把握され、適切な監督が行われます。
                    </li>
                  </ol>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 概要セクション（表形式） */}
        <div className="detail-section overview-section">
          <h2>伴走型相談支援と妊婦支援給付</h2>
          <div className="detail-card">
            <table className="overview-table">
              <tbody>
                <tr>
                  <th>概要</th>
                  <td>妊娠期から出産・子育て期にかけての相談支援を行い、経済的支援を提供する制度です。</td>
                </tr>
                <tr>
                  <th>支給金額</th>
                  <td>
                    <span className="amount-highlight-inline">妊娠届出時に5万円、妊娠後期以降に5万円（妊娠している子どもの数に応じて）</span>
                  </td>
                </tr>
                <tr>
                  <th>対象者</th>
                  <td>
                    <ul className="table-list">
                      <li>妊娠届出をした妊婦</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>申請期限</th>
                  <td>
                    <ul className="table-list">
                      <li>妊娠届出時</li>
                      <li>妊娠後期以降</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>申請方法</th>
                  <td>
                    <ul className="table-list">
                      <li>市区町村に申請</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>必要書類</th>
                  <td>
                    <ul className="table-list">
                      <li>妊娠届出書</li>
                      <li>本人確認書類</li>
                      <li>口座情報</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>参考リンク</th>
                  <td>
                    <a 
                      href="https://www.cfa.go.jp/resources/strategy/kodomo-oen" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="reference-link"
                    >
                      こども家庭庁の公式サイト
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PregnancySupportDetail;

