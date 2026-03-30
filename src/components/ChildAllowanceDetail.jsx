import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import mermaid from 'mermaid';
import './LumpSumDetail.css';

const ChildAllowanceDetail = () => {
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
            
            // ズーム機能用のSVG要素にスケールを適用
            setTimeout(() => {
              const svgElement = chartRef.current.querySelector('svg');
              if (svgElement) {
                svgElement.style.transform = `scale(${zoomLevel})`;
                svgElement.style.transformOrigin = 'center center';
              }
            }, 100);
            
            // ノードを丸みを帯びたスタイリッシュなデザインに調整
            setTimeout(() => {
              const svgElement = chartRef.current?.querySelector('svg');
              if (!svgElement) return;
              
              // すべてのノードのrect要素に丸みとシャドウを追加
              const nodeRects = svgElement.querySelectorAll('.node rect');
              nodeRects.forEach((rect) => {
                rect.setAttribute('rx', '16');
                rect.setAttribute('ry', '16');
                
                // シャドウフィルターを追加
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
              
              // クラスター（エリア）のrect要素にも丸みを追加
              const clusterRects = svgElement.querySelectorAll('.cluster rect');
              clusterRects.forEach((rect) => {
                rect.setAttribute('rx', '20');
                rect.setAttribute('ry', '20');
              });
              
              // エッジのストロークとマーカーの色を設定
              const edgePaths = svgElement.querySelectorAll('.edgePath path');
              edgePaths.forEach((path) => {
                path.setAttribute('stroke', '#6b7280');
              });
              
              const markers = svgElement.querySelectorAll('marker path');
              markers.forEach((marker) => {
                marker.setAttribute('fill', '#6b7280');
                marker.setAttribute('stroke', '#6b7280');
              });
              
              // エッジラベルの背景をピンクに設定
              const edgeLabels = svgElement.querySelectorAll('.edgeLabel foreignObject div');
              edgeLabels.forEach((div) => {
                div.style.backgroundColor = '#fce7f3';
                div.style.borderRadius = '12px';
                div.style.padding = '4px 8px';
                div.style.display = 'inline-block';
              });
              
              // テキストが見切れないように、foreignObjectの幅と高さを調整
              const foreignObjects = svgElement.querySelectorAll('foreignObject');
              foreignObjects.forEach((fo) => {
                const div = fo.querySelector('div');
                if (div) {
                  // テキストの実際の幅と高さを取得
                  const textWidth = div.scrollWidth || div.offsetWidth;
                  const textHeight = div.scrollHeight || div.offsetHeight;
                  
                  if (textWidth > 0) {
                    // 余白を追加して幅を設定
                    const newWidth = Math.ceil(textWidth) + 20;
                    fo.setAttribute('width', newWidth.toString());
                  }
                  
                  if (textHeight > 0) {
                    // 余白を追加して高さを設定
                    const newHeight = Math.ceil(textHeight) + 20;
                    fo.setAttribute('height', newHeight.toString());
                  }
                }
              });
            }, 200);
          }
        });
      }
    }, [chart, id]);

    // ズームレベルが変更されたときに再適用
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
        D["📋 厚生労働省"]
        D_DESC["制度の設計と監督を行う国の機関"]
      end
      
      subgraph areaA[" "]
        A["👤 あなた<br/>（児童を養育する方）"]
        A_DESC["児童手当を受給する当事者"]
      end
      
      subgraph areaB[" "]
        B["🏛️ 市区町村"]
        B_DESC["児童手当の申請窓口と支給を行う機関"]
      end
      
      D -->|"1. 制度設計・監督<br/>（事務処理）"| B
      A -->|"2. 児童手当の申請<br/>（申請）"| B
      B -->|"3. 児童手当を支給<br/>（支給）"| A
      B -->|"4. 支給実績の報告<br/>（報告）"| D
      
      style A fill:#e9d5ff,stroke:#a855f7,stroke-width:3px,color:#581c87,font-weight:bold
      style A_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#581c87,font-weight:normal,font-size:10px
      style areaA fill:#f3e8ff,stroke:#a855f7,stroke-width:2px,stroke-dasharray: 5 5
      
      style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e40af,font-weight:bold
      style B_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#1e40af,font-weight:normal,font-size:10px
      style areaB fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,stroke-dasharray: 5 5
      
      style D fill:#f3f4f6,stroke:#6b7280,stroke-width:2px,color:#374151,font-weight:bold
      style D_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#374151,font-weight:normal,font-size:10px
      style areaD fill:#f9fafb,stroke:#6b7280,stroke-width:2px,stroke-dasharray: 5 5
  `;

  // 制度構成要素図の定義
  const componentDiagram = `
    graph LR
      A[児童手当制度] --> B[対象者]
      A --> C[支給金額]
      A --> D[支給時期]
      A --> G[申請期限]
      
      B --> B1[日本国内に住所を有する児童を養育している方]
      B --> B2[児童の年齢が0歳から中学校卒業まで]
      
      C --> C1[0〜3歳未満<br/>15,000円]
      C1 --> C2[3歳〜小学校修了前<br/>10,000円<br/>（第3子以降は15,000円）]
      C2 --> C3[中学生<br/>10,000円]
      
      D --> D1[毎年6月、10月、2月に支給]
      
      G --> G1[出生後15日以内に市区町村に申請]
      
      G1 --> E[申請方法]
      
      E --> E1[お住まいの市区町村の窓口に申請]
      
      E1 --> F[必要書類]
      
      F --> F1[児童手当認定請求書]
      F --> F2[健康保険証の写し]
      F --> F3[振込先口座情報]
      F --> F4[マイナンバーカードまたは通知カード]
      
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
      participant あなた as あなた<br/>（児童を養育する方）
      participant 市区町村 as 市区町村<br/>（申請窓口・支給機関）
      participant 厚生労働省 as 厚生労働省<br/>（制度の監督機関）
      
      あなた->>市区町村: 1. 出生後15日以内に申請<br/>（児童手当認定請求書、必要書類を提出）
      市区町村->>市区町村: 2. 申請書類の審査・認定
      市区町村->>あなた: 3. 児童手当の支給開始<br/>（毎年6月、10月、2月に指定口座へ振込）
      市区町村->>厚生労働省: 4. 支給実績の報告
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
          
          {/* アーキテクチャ図 */}
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
                  児童手当制度に関わる主要な組織とその関係性を示します。<strong className="highlight-text">紫色の枠で囲まれた「あなた」が当事者（児童を養育する方）の位置</strong>です。図中の数字は手続きの流れを示しています。
                </p>
                <div className="mermaid-container">
                  <MermaidChart chart={architectureDiagram} id="child-allowance-correlation" zoomLevel={zoomLevel} />
                </div>
                <div className="diagram-legend">
                  <h4 className="legend-title">図の見方</h4>
                  <ul className="legend-list">
                    <li><strong className="legend-you">👤 あなた（児童を養育する方）</strong>：児童手当を受給する当事者です。日本国内に住所を有する児童を養育している方が対象です。</li>
                    <li><strong>🏛️ 市区町村</strong>：児童手当の申請窓口と支給を行う機関です。お住まいの市区町村の窓口で申請手続きを行います。</li>
                    <li><strong>📋 厚生労働省</strong>：制度の設計と監督を行う国の機関です。</li>
                  </ul>
                </div>
              </>
            )}

            {viewMode === 'components' && (
              <>
                <p className="section-description">
                  児童手当制度の構成要素を樹形図で示します。
                </p>
                <div className="mermaid-container">
                  <MermaidChart chart={componentDiagram} id="child-allowance-component" zoomLevel={zoomLevel} />
                </div>
              </>
            )}

            {viewMode === 'flow' && (
              <>
                <p className="section-description">
                  児童手当の申請フローを示します。
                  <br />
                  <span style={{ fontSize: '13px', color: '#dc2626', fontStyle: 'italic' }}>
                    ※児童手当の申請は、出生後15日以内に行う必要があります。申請が遅れると、遅れた月分の手当が受け取れない場合があります。また、毎年6月に「現況届」を提出する必要があります。現況届を提出しないと、6月分以降の手当が受け取れなくなります。
                  </span>
                </p>
                <div className="mermaid-container">
                  <MermaidChart chart={applicationFlowSequence} id="child-allowance-flow" zoomLevel={zoomLevel} />
                </div>
                <div className="flow-explanation" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>市区町村について</h4>
                  <p style={{ margin: 0, marginBottom: '24px', color: '#6b7280' }}>
                    市区町村は、児童手当の申請窓口と支給を行う機関です。お住まいの市区町村の窓口（役所や役場）で申請手続きを行います。申請後、審査・認定が行われ、毎年6月、10月、2月に指定口座へ児童手当が振り込まれます。また、毎年6月には「現況届」を提出する必要があり、これにより引き続き児童手当を受給する資格があるかどうかを確認します。
                  </p>
                  
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>申請フローの各手順について</h4>
                  <ol style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>出生後15日以内に申請</strong><br />
                      児童が生まれたら、出生後15日以内にお住まいの市区町村の窓口に申請します。児童手当認定請求書に必要事項を記入し、健康保険証の写し、振込先口座情報、マイナンバーカードまたは通知カードなどの必要書類を添えて提出します。申請が遅れると、遅れた月分の手当が受け取れない場合があります。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>申請書類の審査・認定</strong><br />
                      市区町村が提出された申請書類を審査し、児童手当の受給資格を認定します。申請内容や必要書類の確認を行い、問題がなければ認定されます。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>児童手当の支給開始</strong><br />
                      認定後、毎年6月、10月、2月に指定口座へ児童手当が振り込まれます。支給額は児童の年齢によって異なり、0〜3歳未満は15,000円、3歳〜小学校修了前は10,000円（第3子以降は15,000円）、中学生は10,000円です。また、毎年6月には「現況届」を提出する必要があり、これにより引き続き児童手当を受給する資格があるかどうかを確認します。
                    </li>
                    <li style={{ marginBottom: '0' }}>
                      <strong style={{ color: '#374151' }}>支給実績の報告</strong><br />
                      市区町村が厚生労働省に支給実績を報告します。これにより、制度の運用状況が把握され、適切な監督が行われます。
                    </li>
                  </ol>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 概要セクション（表形式） */}
        <div className="detail-section overview-section">
          <h2>児童手当</h2>
          <div className="detail-card">
            <table className="overview-table">
              <tbody>
                <tr>
                  <th>概要</th>
                  <td>0歳から中学校卒業までの児童を養育している方に支給されます。</td>
                </tr>
                <tr>
                  <th>支給金額</th>
                  <td>
                    <ul className="table-list">
                      <li>0〜3歳未満：15,000円</li>
                      <li>3歳〜小学校修了前：10,000円（第3子以降は15,000円）</li>
                      <li>中学生：10,000円</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>対象者</th>
                  <td>
                    <ul className="table-list">
                      <li>日本国内に住所を有する児童を養育している方</li>
                      <li>児童の年齢が0歳から中学校卒業まで</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>申請期限</th>
                  <td>毎年6月、10月、2月に支給（申請は出生後15日以内に市区町村に申請）</td>
                </tr>
                <tr>
                  <th>申請方法</th>
                  <td>
                    <ul className="table-list">
                      <li>お住まいの市区町村の窓口に申請</li>
                      <li>必要書類を準備して提出</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>必要書類</th>
                  <td>
                    <ul className="table-list">
                      <li>児童手当認定請求書</li>
                      <li>健康保険証の写し</li>
                      <li>振込先口座情報</li>
                      <li>マイナンバーカードまたは通知カード</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>参考リンク</th>
                  <td>
                    <a 
                      href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="reference-link-inline"
                    >
                      厚生労働省の詳細情報を見る
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="detail-section">
          <h2>参考リンク</h2>
          <div className="detail-card">
            <a 
              href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="reference-link"
            >
              厚生労働省の詳細情報を見る
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ChildAllowanceDetail;
