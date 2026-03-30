import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import mermaid from 'mermaid';
import './LumpSumDetail.css';

const PaternityLeaveDetail = () => {
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
        D["📋 厚生労働省"]
        D_DESC["制度の設計と監督を行う国の機関"]
      end
      
      subgraph areaE[" "]
        E["💼 勤務先"]
        E_DESC["雇用主。申請手続きを代行"]
      end
      
      subgraph areaA[" "]
        A["👤 あなた<br/>（父親・被保険者）"]
        A_DESC["産後パパ育休を取得し給付金を受給する当事者"]
      end
      
      subgraph areaB[" "]
        B["🏢 ハローワーク"]
        B_DESC["雇用保険の給付を行う機関。産後パパ育休給付金を支給"]
      end
      
      D -->|"1. 制度設計・監督<br/>（事務処理）"| B
      E -->|"2. 雇用保険の加入手続き<br/>（事務処理）"| B
      A -->|"3. 雇用保険に加入<br/>（加入）"| B
      A -->|"4. 産後パパ育休の申請<br/>（申請）"| E
      E -->|"5. 給付金の申請を代行<br/>（申請代行）"| B
      B -->|"6. 産後パパ育休給付金を支給<br/>（支給）"| A
      
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
      A[産後パパ育休制度] --> B[対象者]
      A --> C[支給金額]
      A --> D[取得期間]
      A --> G[申請期限]
      
      B --> B1[雇用保険の被保険者]
      B --> B1_2[子の出生後8週間以内に<br/>育児休業を取得する父親]
      
      B1 --> B2[対象者の条件]
      B1_2 --> B2[対象者の条件]
      
      B2 --> B2_1[育児休業開始前の2年間に<br/>11日以上働いた月が12ヶ月以上]
      
      C --> C1[育児休業給付金と同様<br/>休業開始時賃金日額の67%]
      
      D --> D1[最大4週間（28日）]
      D1 --> D2[2回に分けて取得可能]
      D1 --> D3[子の出生後8週間以内]
      
      G --> G1[子の出生後8週間以内]
      
      G1 --> E[申請方法]
      
      E --> E1[勤務先を通じて申請<br/>事業主が申請手続きを代行]
      
      E1 --> F[必要書類]
      
      F --> F1[育児休業給付金支給申請書]
      F --> F2[育児休業給付受給資格確認票<br/>（初回）育児休業給付金支給申請書]
      F --> F3[賃金台帳、労働者名簿<br/>出勤簿またはタイムカード等の写し]
      F --> F4[母子手帳の写し<br/>または出生証明書]
      
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
      participant 父親 as 父親<br/>（産後パパ育休を取得する本人）
      participant 勤務先 as 勤務先<br/>（事業主）
      participant ハローワーク as ハローワーク<br/>（雇用保険の給付を行う機関）
      participant 厚生労働省 as 厚生労働省<br/>（制度の監督機関）
      
      父親->>勤務先: 1. 産後パパ育休の取得申出<br/>（子の出生後8週間以内）
      父親->>勤務先: 2. 必要書類の提出<br/>（母子手帳の写し、口座情報など）
      勤務先->>勤務先: 3. 申請書類の作成<br/>（受給資格確認票、支給申請書など）
      勤務先->>ハローワーク: 4. 申請書類の提出
      ハローワーク->>ハローワーク: 5. 審査・決定
      ハローワーク->>父親: 6. 給付金の支給<br/>（2ヶ月ごとに指定口座へ振込）
      ハローワーク->>厚生労働省: 7. 支給実績の報告
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
                  産後パパ育休制度に関わる主要な組織とその関係性を示します。<strong className="highlight-text">紫色の枠で囲まれた「あなた」が当事者（父親・被保険者）の位置</strong>です。図中の数字は手続きの流れを示しています。
                </p>
                <div className="mermaid-container">
                  <MermaidChart chart={architectureDiagram} id="paternity-leave-correlation" zoomLevel={zoomLevel} />
                </div>
                <div className="diagram-legend">
                  <h4 className="legend-title">図の見方</h4>
                  <ul className="legend-list">
                    <li><strong className="legend-you">👤 あなた（父親・被保険者）</strong>：産後パパ育休を取得し、給付金を受給する当事者です。雇用保険に加入している父親が対象です。</li>
                    <li><strong>🏢 ハローワーク</strong>：雇用保険の給付を行う機関です。産後パパ育休給付金の支給を行います。</li>
                    <li><strong>💼 勤務先</strong>：雇用主です。産後パパ育休給付金の申請手続きを代行します。</li>
                    <li><strong>📋 厚生労働省</strong>：制度の設計と監督を行う国の機関です。</li>
                  </ul>
                </div>
              </>
            )}

            {viewMode === 'components' && (
              <>
                <p className="section-description">
                  産後パパ育休制度の構成要素を樹形図で示します。
                </p>
                <div className="mermaid-container">
                  <MermaidChart chart={componentDiagram} id="paternity-leave-component" zoomLevel={zoomLevel} />
                </div>
              </>
            )}

            {viewMode === 'flow' && (
              <>
                <p className="section-description">
                  産後パパ育休の申請フローを示します。
                  <br />
                  <span style={{ fontSize: '13px', color: '#dc2626', fontStyle: 'italic' }}>
                    ※産後パパ育休は、子の出生後8週間以内に取得する必要があります。最大4週間（28日）を限度として2回に分けて取得可能です。1歳までの育児休業とは別に取得でき、一定の条件のもと就業することもできます。申請は育児休業開始日から4か月以内に行う必要があります。
                  </span>
                </p>
                <div className="mermaid-container">
                  <MermaidChart chart={applicationFlowSequence} id="paternity-leave-flow" zoomLevel={zoomLevel} />
                </div>
                <div className="flow-explanation" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>ハローワークについて</h4>
                  <p style={{ margin: 0, marginBottom: '24px', color: '#6b7280' }}>
                    ハローワーク（正式名称：公共職業安定所）は、日本政府（厚生労働省）が運営する公的な就業支援機関です。産後パパ育休の申請においては、雇用保険の給付を行う機関として、申請書類の審査や給付金の支給を行います。
                  </p>
                  
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>申請フローの各手順について</h4>
                  <ol style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>産後パパ育休の取得申出</strong><br />
                      父親が勤務先に産後パパ育休を取得する意思を伝えます。子の出生後8週間以内に取得する必要があり、最大4週間（28日）を限度として2回に分けて取得可能です。育児休業の開始予定日や終了予定日を明確にすることが重要です。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>必要書類の提出</strong><br />
                      父親が勤務先に必要書類を提出します。母子手帳の写しや給付金を受け取る口座情報などが必要です。これらの書類は申請手続きに使用されます。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>申請書類の作成</strong><br />
                      勤務先が申請に必要な書類を作成します。受給資格確認票や育児休業給付金支給申請書などを作成し、父親の情報を記入します。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>申請書類の提出</strong><br />
                      勤務先が作成した申請書類を、事業所所在地を管轄するハローワークに提出します。申請は育児休業開始日から4か月以内に行う必要があります。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>審査・決定</strong><br />
                      ハローワークが提出された申請書類を審査し、給付金の支給可否を決定します。受給資格や必要書類の確認を行います。
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>給付金の支給</strong><br />
                      ハローワークが父親の指定口座に給付金を振り込みます。給付金は約2か月ごとに支給され、休業開始時賃金日額の67%が支給されます。産後パパ育休は1歳までの育児休業とは別に取得でき、一定の条件のもと就業することもできます。
                    </li>
                    <li style={{ marginBottom: '0' }}>
                      <strong style={{ color: '#374151' }}>支給実績の報告</strong><br />
                      ハローワークが厚生労働省に支給実績を報告します。これにより、制度の運用状況が把握され、適切な監督が行われます。
                    </li>
                  </ol>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 概要セクション（表形式） */}
        <div className="detail-section overview-section">
          <h2>産後パパ育休（出生時育児休業）</h2>
          <div className="detail-card">
            <table className="overview-table">
              <tbody>
                <tr>
                  <th>概要</th>
                  <td>子の出生後8週間以内に、父親が最大4週間（28日）を限度として2回に分けて取得できる育児休業制度です。</td>
                </tr>
                <tr>
                  <th>支給金額</th>
                  <td>
                    <span className="amount-highlight-inline">育児休業給付金と同様（休業開始時賃金日額の67%）</span>
                  </td>
                </tr>
                <tr>
                  <th>対象者</th>
                  <td>
                    <ul className="table-list">
                      <li>雇用保険の被保険者で、子の出生後8週間以内に育児休業を取得する父親</li>
                      <li>育児休業開始前の2年間に、11日以上働いた月が12ヶ月以上あること</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>取得期間</th>
                  <td>
                    <ul className="table-list">
                      <li>最大4週間（28日）</li>
                      <li>2回に分けて取得可能</li>
                      <li>子の出生後8週間以内</li>
                      <li>1歳までの育児休業とは別に取得可能</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>申請期限</th>
                  <td>子の出生後8週間以内</td>
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
                      <li>育児休業給付金支給申請書</li>
                      <li>育児休業給付受給資格確認票・（初回）育児休業給付金支給申請書</li>
                      <li>賃金台帳、労働者名簿、出勤簿またはタイムカード等の写し</li>
                      <li>母子手帳の写しまたは出生証明書</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>参考リンク</th>
                  <td>
                    <a 
                      href="https://www.mhlw.go.jp/seisakunitsuite/bunya/koyou_roudou/koyoukintou/ryouritsu/ikuji/paternity/" 
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
              href="https://www.mhlw.go.jp/seisakunitsuite/bunya/koyou_roudou/koyoukintou/ryouritsu/ikuji/paternity/" 
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

export default PaternityLeaveDetail;

