import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import mermaid from 'mermaid';
import './LumpSumDetail.css';

const ChildbirthAllowanceDetail = () => {
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
            
            // ズーム機能用のSVG要素にスケールを適用（現在のzoomLevelを使用）
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
                // 角を丸くする（rx, ry属性）
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
                
                // 説明文ノード（透明なノード）にはシャドウを適用しない
                const node = rect.closest('.node');
                if (node) {
                  const foreignObject = node.querySelector('foreignObject');
                  if (foreignObject) {
                    const div = foreignObject.querySelector('div');
                    const nodeText = div ? div.textContent.trim() : '';
                    const isDescNode = nodeText.includes('出産手当金を受給する当事者') ||
                                      nodeText.includes('加入している健康保険の運営主体') ||
                                      nodeText.includes('出産を行う産院や病院') ||
                                      nodeText.includes('制度の設計と監督を行う国の機関') ||
                                      nodeText.includes('健康保険の加入手続きを行う際に関わる');
                    
                    if (!isDescNode) {
                      rect.setAttribute('filter', 'url(#node-shadow)');
                    }
                  }
                }
              });
              
              // クラスター（エリア）のrect要素にも丸みを追加
              const clusterRects = svgElement.querySelectorAll('.cluster rect');
              clusterRects.forEach((rect) => {
                rect.setAttribute('rx', '20');
                rect.setAttribute('ry', '20');
              });
              
              // エッジのマーカーとパスの色を設定
              const edgePaths = svgElement.querySelectorAll('.edgePath');
              edgePaths.forEach((edgePath) => {
                const path = edgePath.querySelector('path');
                if (!path) return;
                path.setAttribute('stroke', '#6b7280');
                path.setAttribute('stroke-width', '2');
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
        }).catch(error => {
          console.error('Error rendering Mermaid chart:', error);
        });
      }
    }, [chart, id, zoomLevel]);
    
    // ズームレベルの変更を監視（SVG要素のtransformだけを更新）
    useEffect(() => {
      if (chartRef.current) {
        const svgElement = chartRef.current.querySelector('svg');
        if (svgElement) {
          // requestAnimationFrameを使ってスムーズに更新
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
      
      subgraph areaE[" "]
        E["💼 勤務先"]
        E_DESC["健康保険の加入手続きを行う際に関わる"]
      end
      
      subgraph areaA[" "]
        A["👤 あなた<br/>（被保険者）"]
        A_DESC["出産手当金を受給する当事者"]
      end
      
      subgraph areaB[" "]
        B["🏢 健康保険組合"]
        B_DESC["加入している健康保険の運営主体。出産手当金の支給を行う"]
      end
      
      subgraph areaC[" "]
        C["🏥 医療機関"]
        C_DESC["出産を行う産院や病院。分娩証明を発行"]
      end
      
      D -->|"1. 制度設計・監督<br/>（事務処理）"| B
      E -->|"2. 健康保険の加入手続き<br/>（事務処理）"| B
      A -->|"3. 健康保険に加入<br/>（加入）"| B
      A -->|"4. 出産を行う<br/>（出産）"| C
      A -->|"5. 出産手当金の申請<br/>（申請）"| B
      B -->|"6. 出産手当金を支給<br/>（支給）"| A
      B -->|"7. 支給実績の報告<br/>（報告）"| D
      
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
      
      style C fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e,font-weight:bold
      style C_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#92400e,font-weight:normal,font-size:10px
      style areaC fill:#fef9c3,stroke:#f59e0b,stroke-width:2px,stroke-dasharray: 5 5
  `;

  // 制度構成要素図の定義
  const componentDiagram = `
    graph LR
      A[出産手当金制度] --> B[対象者]
      A --> C[支給金額]
      A --> D[支給期間]
      A --> G[申請期限]
      
      B --> B1[健康保険の被保険者]
      B --> B1_2[出産のため会社を休んでいる方]
      
      B1 --> B2[対象者の条件]
      B1_2 --> B2[対象者の条件]
      
      B2 --> B2_1[出産予定日を含む42日前から<br/>出産後56日目までの期間で<br/>会社を休んでいること]
      
      C --> C1[標準報酬日額の2/3]
      
      D --> D1[出産予定日を含む42日前から<br/>出産後56日目まで]
      D1 --> D2[多胎妊娠の場合<br/>出産予定日を含む98日前から]
      
      G --> G1[出産予定日を含む42日前から<br/>出産後56日目まで]
      
      G1 --> E[申請方法]
      
      E --> E1[勤務先を通じて申請<br/>または健康保険組合に直接申請]
      
      E1 --> F[必要書類]
      
      F --> F1[出産手当金支給申請書]
      F --> F2[健康保険証の写し]
      F --> F3[母子手帳の写し<br/>または出生証明書]
      F --> F4[振込先口座情報]
      
      style A fill:#e9d5ff,stroke:#a855f7,stroke-width:3px,color:#581c87,font-weight:bold
      style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e40af,font-weight:bold
      style C fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e,font-weight:bold
      style D fill:#fed7aa,stroke:#f97316,stroke-width:2px,color:#9a3412,font-weight:bold
      style G fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e,font-weight:bold
      style E fill:#d1fae5,stroke:#10b981,stroke-width:2px,color:#065f46,font-weight:bold
      style B2 fill:#fce7f3,stroke:#ec4899,stroke-width:2px,color:#9f1239,font-weight:bold
      style F fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#312e81,font-weight:bold
  `;

  // 申請フロー図の定義
  const applicationFlowSequence = `
    sequenceDiagram
      participant 被保険者 as 被保険者<br/>（出産手当金を受給する本人）
      participant 勤務先 as 勤務先<br/>（事業主）
      participant 健康保険組合 as 健康保険組合<br/>（健康保険の運営主体）
      participant 厚生労働省 as 厚生労働省<br/>（制度の監督機関）
      
      被保険者->>勤務先: 1. 出産手当金の申請書を入手<br/>または申請の意思を伝える
      被保険者->>勤務先: 2. 必要書類の提出<br/>（健康保険証の写し、母子手帳の写し、<br/>口座情報など）
      勤務先->>勤務先: 3. 休業期間中の給与支払状況を証明<br/>（申請書に記入）
      被保険者->>被保険者: 4. 医師または助産師に<br/>分娩証明を記入してもらう
      被保険者->>健康保険組合: 5. 申請書類の提出<br/>（勤務先を通じてまたは直接）
      健康保険組合->>健康保険組合: 6. 審査・決定
      健康保険組合->>被保険者: 7. 出産手当金の支給<br/>（指定口座へ振込）
      健康保険組合->>厚生労働省: 8. 支給実績の報告
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
                  出産手当金制度に関わる主要な組織とその関係性を示します。<strong className="highlight-text">紫色の枠で囲まれた「あなた」が当事者（被保険者）の位置</strong>です。図中の数字は手続きの流れを示しています。
                </p>
                <div className="mermaid-container">
                  <MermaidChart 
                    chart={architectureDiagram} 
                    id="childbirth-allowance-correlation"
                    zoomLevel={zoomLevel}
                  />
                </div>
                <div className="diagram-legend">
                  <h4 className="legend-title">図の見方</h4>
                  <ul className="legend-list">
                    <li><strong className="legend-you">👤 あなた（被保険者）</strong>：出産手当金を受給する当事者です。健康保険に加入している方、または被扶養者として登録されている方が対象です。</li>
                    <li><strong>🏢 健康保険組合</strong>：あなたが加入している健康保険の運営主体です。出産手当金の支給を行います。</li>
                    <li><strong>🏥 医療機関</strong>：出産を行う産院や病院です。分娩証明を発行します。</li>
                    <li><strong>📋 厚生労働省</strong>：制度の設計と監督を行う国の機関です。</li>
                    <li><strong>💼 勤務先</strong>：健康保険の加入手続きを行う際に関わります。</li>
                  </ul>
                </div>
              </>
            )}

            {viewMode === 'components' && (
              <>
                <p className="section-description">
                  出産手当金制度の構成要素を樹形図で示します。
                </p>
                <div className="mermaid-container">
                  <MermaidChart chart={componentDiagram} id="childbirth-allowance-component" zoomLevel={zoomLevel} />
                </div>
              </>
            )}

            {viewMode === 'flow' && (
              <>
                <p className="section-description">
                  出産手当金の申請フローを示します。
                  <br />
                  <span style={{ fontSize: '13px', color: '#dc2626', fontStyle: 'italic' }}>
                    ※出産手当金の申請は、産前産後休業が終了した後にまとめて行うのが一般的ですが、産前休業分と産後休業分を分けて申請することも可能です。申請期限は出産予定日を含む42日前から出産後56日目までです。退職後でも、一定の条件を満たせば出産手当金を受給できる場合があります。
                  </span>
                </p>
                <div className="mermaid-container">
                  <MermaidChart chart={applicationFlowSequence} id="childbirth-allowance-flow" zoomLevel={zoomLevel} />
                </div>
                <div className="flow-explanation" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>健康保険組合について</h4>
                  <p style={{ margin: 0, marginBottom: '24px', color: '#6b7280' }}>
                    健康保険組合は、企業や業界団体が設立・運営する健康保険の運営主体です。被保険者とその家族の医療費の給付や、出産手当金・出産育児一時金などの各種給付を行います。出産手当金の申請においては、申請書類の審査や給付金の支給を行います。
                  </p>
                  
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>申請フローの各手順について</h4>
                  <ol style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>出産手当金の申請書を入手または申請の意思を伝える</strong><br />
                      被保険者が勤務先または加入している健康保険組合から「健康保険出産手当金支給申請書」を入手します。申請の意思を勤務先に伝えることも重要です。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>必要書類の提出</strong><br />
                      被保険者が勤務先に必要書類を提出します。健康保険証の写し、母子手帳の写し、振込先口座情報などが必要です。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>休業期間中の給与支払状況を証明</strong><br />
                      勤務先が申請書に、休業期間中の給与支払状況を証明する記入を行います。給与の支払いを受けていないことを証明する必要があります。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>医師または助産師に分娩証明を記入してもらう</strong><br />
                      被保険者が医師または助産師に、申請書の分娩証明欄を記入してもらいます。出産日や分娩の事実を証明するものです。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>申請書類の提出</strong><br />
                      記入済みの申請書を、勤務先を通じてまたは直接、加入している健康保険組合に提出します。申請期限は出産予定日を含む42日前から出産後56日目までです。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>審査・決定</strong><br />
                      健康保険組合が提出された申請書類を審査し、給付金の支給可否を決定します。受給資格や必要書類の確認を行います。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>出産手当金の支給</strong><br />
                      健康保険組合が被保険者の指定口座に出産手当金を振り込みます。支給額は1日につき標準報酬日額の3分の2に相当する額です。
                    </li>
                    <li style={{ marginBottom: '0' }}>
                      <strong style={{ color: '#374151' }}>支給実績の報告</strong><br />
                      健康保険組合が厚生労働省に支給実績を報告します。これにより、制度の運用状況が把握され、適切な監督が行われます。
                    </li>
                  </ol>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 概要セクション（表形式） */}
        <div className="detail-section overview-section">
          <h2>出産手当金</h2>
          <div className="detail-card">
            <table className="overview-table">
              <tbody>
                <tr>
                  <th>概要</th>
                  <td>出産前後の休業中に受け取れる手当です。健康保険から支給されます。</td>
                </tr>
                <tr>
                  <th>支給金額</th>
                  <td>
                    <span className="amount-highlight-inline">標準報酬日額の2/3</span>
                  </td>
                </tr>
                <tr>
                  <th>対象者</th>
                  <td>
                    <ul className="table-list">
                      <li>健康保険の被保険者で、出産のため会社を休んでいる方</li>
                      <li>出産予定日を含む42日前から出産後56日目までの期間で、会社を休んでいる方</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>申請期限</th>
                  <td>出産予定日を含む42日前から出産後56日目まで</td>
                </tr>
                <tr>
                  <th>申請方法</th>
                  <td>
                    <ul className="table-list">
                      <li>勤務先の会社を通じて申請</li>
                      <li>必要書類を準備して会社に提出</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>必要書類</th>
                  <td>
                    <ul className="table-list">
                      <li>出産手当金支給申請書</li>
                      <li>健康保険証の写し</li>
                      <li>母子手帳の写しまたは出生証明書</li>
                      <li>振込先口座情報</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>参考リンク</th>
                  <td>
                    <a 
                      href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/shussan/index.html" 
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
              href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/shussan/index.html" 
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

export default ChildbirthAllowanceDetail;
