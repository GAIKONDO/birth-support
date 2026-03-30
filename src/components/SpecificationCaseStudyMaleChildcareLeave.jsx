import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationCaseStudyMaleChildcareLeave = () => {
  const navigate = useNavigate();
  const [diagram, setDiagram] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const traditionalFlowRef = useRef(null);
  const appIntegratedFlowRef = useRef(null);
  const moneyFlowRef = useRef(null);
  const subsidyFlowRef = useRef(null);

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

  // 従来型の育児休業申請フロー
  const traditionalFlowMermaid = `
    flowchart TD
      A[男性従業員] -->|育児休業希望| B[上司・人事部]
      B -->|申請手続きが<br/>分からない| C[手続きの複雑さ]
      B -->|取得しにくい雰囲気| D[職場の風土]
      B -->|取得率: 14.0%| E[男性育児休業<br/>取得率の低さ]
      
      C -->|申請書類作成| F[手作業での<br/>申請書類作成]
      F -->|申請期限を逃す| G[申請漏れ]
      D -->|取得しにくい| H[取得を諦める]
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style C fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style D fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style E fill:#fef2f2,stroke:#ef4444,stroke-width:3px
      style F fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style G fill:#fef2f2,stroke:#ef4444,stroke-width:2px
      style H fill:#fef2f2,stroke:#ef4444,stroke-width:2px
  `;

  // アプリ連携後の育児休業申請フロー
  const appIntegratedFlowMermaid = `
    flowchart TD
      A[男性従業員] -->|アプリで情報確認| B[出産支援パーソナル<br/>アプリ]
      B -->|申請手続きガイド| C[申請手続きが<br/>分かりやすくなる]
      B -->|申請期限リマインダー| D[申請漏れ防止]
      B -->|取得のメリット説明| E[取得しやすい雰囲気]
      
      A -->|育児休業申請| F[上司・人事部]
      F -->|申請書類自動生成| G[アプリから<br/>申請書類出力]
      F -->|取得率向上| H[男性育児休業<br/>取得率向上]
      
      C -->|申請成功率向上| I[申請漏れなし]
      D -->|申請漏れなし| I
      E -->|取得しやすくなる| H
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style C fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style D fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style E fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style F fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style G fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style H fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style I fill:#d1fae5,stroke:#10b981,stroke-width:2px
  `;

  // お金の流れ（育児休業給付金）
  const moneyFlowMermaid = `
    flowchart LR
      A[男性従業員] -->|育児休業取得| B[企業]
      B -->|育児休業給付金<br/>申請| C[ハローワーク]
      C -->|育児休業給付金<br/>支給| D[男性従業員]
      
      D -->|給付金受給| E[育児休業給付金<br/>給付率: 67%<br/>上限: 約30万円/月]
      
      B -->|両立支援等助成金<br/>申請| F[厚生労働省]
      F -->|助成金支給| B
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style B fill:#fef3c7,stroke:#f59e0b,stroke-width:3px
      style C fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style D fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style E fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style F fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
  `;

  // 両立支援等助成金の流れ
  const subsidyFlowMermaid = `
    flowchart TD
      A[企業] -->|男性育児休業取得促進| B[両立支援等助成金<br/>出生時両立支援コース]
      B -->|申請| C[厚生労働省]
      C -->|審査| D[助成金支給決定]
      
      D -->|助成金支給| A
      
      E[助成金の内容] -->|男性育児休業取得者1人あたり| F[基本額: 10万円]
      E -->|取得率向上に応じて| G[追加支給: 最大40万円]
      
      F --> D
      G --> D
      
      style A fill:#fef3c7,stroke:#f59e0b,stroke-width:3px
      style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style C fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
      style D fill:#d1fae5,stroke:#10b981,stroke-width:3px
      style E fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style F fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style G fill:#d1fae5,stroke:#10b981,stroke-width:2px
  `;

  // Mermaid図のレンダリング
  useEffect(() => {
    const renderDiagram = async (mermaidCode, ref, applyZoom = true) => {
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
            // SVGのサイズを調整
            const containerWidth = ref.current.offsetWidth - 40; // padding分を考慮
            const svgWidth = svgElement.getAttribute('width') || svgElement.offsetWidth;
            const svgHeight = svgElement.getAttribute('height') || svgElement.offsetHeight;
            
            // SVGがコンテナより大きい場合は縮小
            if (parseFloat(svgWidth) > containerWidth) {
              const scale = containerWidth / parseFloat(svgWidth);
              svgElement.style.width = `${containerWidth}px`;
              svgElement.style.height = `${parseFloat(svgHeight) * scale}px`;
            } else {
              svgElement.style.maxWidth = '100%';
              svgElement.style.height = 'auto';
            }
            
            svgElement.style.display = 'block';
            svgElement.style.margin = '0 auto';
            
            if (applyZoom) {
              svgElement.style.transform = `scale(${zoomLevel})`;
              svgElement.style.transformOrigin = 'center center';
              svgElement.style.transition = 'transform 0.2s ease-out';
            }
            
            ref.current.style.visibility = 'visible';
            ref.current.style.opacity = '1';
            ref.current.style.transition = 'opacity 0.3s ease-in';
          }
        }, 200);
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (ref.current) {
          ref.current.style.visibility = 'visible';
          ref.current.style.opacity = '1';
        }
      }
    };

    renderDiagram(traditionalFlowMermaid, traditionalFlowRef, false);
    renderDiagram(appIntegratedFlowMermaid, appIntegratedFlowRef, false);
    renderDiagram(moneyFlowMermaid, moneyFlowRef, false);
    renderDiagram(subsidyFlowMermaid, subsidyFlowRef, false);
  }, [zoomLevel]);

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
              <h1 style={{ margin: 0 }}>男性の育児休業取得率向上</h1>
            </div>
            <p className="specification-description">
              男性の育児休業取得率が極めて低く（2023年: 14.0%）、育児と仕事の両立支援が不十分な課題を、
              出産支援パーソナルアプリの導入により解決します。企業は両立支援等助成金（出生時両立支援コース）により、
              男性育児休業取得者1人あたり最大50万円の助成金を受けられます。
            </p>
          </div>

          {/* 現状の課題 */}
          <div className="specification-section">
            <h2>現状の課題</h2>
            <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5', marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px', color: '#991b1b' }}>男性育児休業取得率の低さ</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7f1d1d', marginBottom: '8px' }}>2023年の取得率</p>
                  <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#dc2626' }}>14.0%</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7f1d1d', marginTop: '4px' }}>（女性: 85.1%）</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7f1d1d', marginBottom: '8px' }}>政府目標</p>
                  <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#dc2626' }}>30%</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7f1d1d', marginTop: '4px' }}>（2025年まで）</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7f1d1d', marginBottom: '8px' }}>目標との差</p>
                  <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#dc2626' }}>16.0%</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7f1d1d', marginTop: '4px' }}>（約2.3倍の向上が必要）</p>
                </div>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: '#7f1d1d' }}>
                <li><strong>申請手続きが複雑：</strong>育児休業給付金の申請手続きが複雑で、必要な書類が多く、申請期限を逃すリスクがある</li>
                <li><strong>取得しにくい雰囲気：</strong>職場で男性が育児休業を取得しにくい雰囲気があり、取得を諦めるケースが多い</li>
                <li><strong>情報不足：</strong>育児休業の取得方法やメリット、給付金の内容など、必要な情報が不足している</li>
                <li><strong>復帰後の不安：</strong>育児休業取得後の復帰や、その後のキャリア形成への不安がある</li>
              </ul>
            </div>
          </div>

          {/* フロー図の比較 */}
          <div className="specification-section">
            <h2>育児休業申請フローの比較</h2>
            <div className="case-study-flow-comparison">
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', textAlign: 'center', fontWeight: '600' }}>従来型の申請フロー</h3>
                <div className="mermaid-chart-wrapper" style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  backgroundColor: '#fff',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div className="mermaid-container" ref={traditionalFlowRef} style={{ 
                    minHeight: '400px', 
                    overflow: 'auto',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                  }}></div>
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', textAlign: 'center', fontWeight: '600' }}>アプリ連携後の申請フロー</h3>
                <div className="mermaid-chart-wrapper" style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  backgroundColor: '#fff',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div className="mermaid-container" ref={appIntegratedFlowRef} style={{ 
                    minHeight: '400px', 
                    overflow: 'auto',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                  }}></div>
                </div>
              </div>
            </div>
            
            {/* 男性向けの効果説明 */}
            <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#f0f4ff', borderRadius: '8px', border: '1px solid #667eea' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', color: '#1e40af', fontWeight: '600' }}>
                男性従業員にとっての主なメリット
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #c7d2fe' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#667eea', fontWeight: '600' }}>
                    1. 制度利用によるメリットの可視化
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                    アプリにより、育児休業給付金の受給額や、復帰後のキャリア形成への影響など、制度を利用することで得られる具体的なメリットが一目で分かります。これにより、「育児休業を取得することで何が得られるのか」が明確になり、取得への動機が高まります。特に、給付金の受給額が可視化されることで、経済的な不安が軽減され、取得を決断しやすくなります。
                  </p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #c7d2fe' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#667eea', fontWeight: '600' }}>
                    2. 取得によるメリットの明確化
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                    育児休業を取得することで得られるメリット（家族との時間、育児スキルの向上、パートナーとの関係性の向上など）が、アプリのAIアシスタント機能により、具体的な事例とともに説明されます。これにより、「育児休業を取得することで、仕事だけでなく、人生全体が豊かになる」という認識が深まり、取得への意欲が向上します。
                  </p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #c7d2fe' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#667eea', fontWeight: '600' }}>
                    3. 離脱期間や会社への説明負担の軽減
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                    アプリのアクション管理機能により、育児休業の取得期間や復帰予定日を明確に設定でき、上司や人事部への説明が容易になります。また、申請書類の自動生成機能により、複雑な申請手続きが簡素化され、申請に必要な時間や労力が大幅に削減されます。さらに、アプリの利用状況レポートにより、企業側も従業員の育児休業取得を支援する姿勢を示しやすくなり、取得しやすい雰囲気が醸成されます。これにより、「会社に迷惑をかけるのではないか」「説明が面倒だ」という心理的負担が軽減され、取得へのハードルが下がります。
                  </p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '6px', border: '1px solid #3b82f6', marginTop: '8px' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>
                    総合的な効果
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.8' }}>
                    これらの効果により、男性従業員は「育児休業を取得することで得られるメリット」を明確に理解し、「取得に伴う負担」を最小限に抑えることができます。その結果、育児休業取得への心理的ハードルが大幅に下がり、取得率の向上につながります。特に、制度のメリットが可視化されることで、「取得することで自分自身や家族が得られる価値」が明確になり、取得を決断しやすくなります。
                  </p>
                </div>
              </div>
            </div>
            
            {/* 企業向けの効果説明 */}
            <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', color: '#92400e', fontWeight: '600' }}>
                企業にとっての主なメリット
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#d97706', fontWeight: '600' }}>
                    1. 助成金の受給
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.8', marginBottom: '12px' }}>
                    男性育児休業取得率を向上させることで、<strong>両立支援等助成金（出生時両立支援コース）</strong>を受給できます。男性育児休業取得者1人あたり<strong>基本額10万円</strong>、取得率向上に応じて<strong>追加支給最大40万円</strong>が支給され、取得者1人あたり最大50万円の助成金が得られます。
                  </p>
                  <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
                      <strong>例：</strong>従業員100名規模で男性育児休業取得者5名の場合、最大250万円の助成金が受給可能です。
                    </p>
                  </div>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#d97706', fontWeight: '600' }}>
                    2. くるみん認定取得への貢献
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.8' }}>
                    次世代育成支援対策推進法に基づく行動計画を策定・実施し、男性育児休業取得率を向上させることで、<strong>くるみん認定</strong>の取得に貢献します。くるみん認定を取得すると、<strong>最大50万円の助成金</strong>が受給でき、企業の社会的評価が向上します。また、公共調達での優遇措置も受けられます。
                  </p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#d97706', fontWeight: '600' }}>
                    3. 健康経営優良法人認定への貢献
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.8' }}>
                    従業員のライフイベント（出産・育児）を支援する取り組みは、<strong>健康経営優良法人認定</strong>の取得に貢献します。認定を取得すると、金融機関からの優遇金利や公共調達での優遇措置を受けられ、<strong>年間数百万円の効果</strong>が期待できます。
                  </p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#d97706', fontWeight: '600' }}>
                    4. 離職率の低下と採用コストの削減
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.8', marginBottom: '12px' }}>
                    育児と仕事の両立を支援することで、従業員の離職率が低下します。育児支援施策を実施している企業では、離職率が<strong>平均10%低下</strong>する傾向があります（厚生労働省調査）。これにより、採用コストが削減され、優秀な人材の確保が容易になります。
                  </p>
                  <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
                      <strong>例：</strong>従業員100名規模の場合、離職率10%低下により、年間500万円以上の採用コスト削減効果が期待できます。
                    </p>
                  </div>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#d97706', fontWeight: '600' }}>
                    5. 従業員満足度の向上と生産性向上
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.8' }}>
                    育児と仕事の両立を支援することで、従業員の満足度が向上し、仕事への集中力や生産性が向上します。福利厚生が充実している企業では、従業員の満足度が高く、生産性も高い傾向があります（経済産業省調査）。従業員1人あたり月額500円の投資で、年間6,000円以上の生産性向上効果が期待できます。
                  </p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#d97706', fontWeight: '600' }}>
                    6. 企業ブランドの向上とESG評価の向上
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.8' }}>
                    育児と仕事の両立を支援する企業として、企業ブランドが向上します。優秀な人材の採用が容易になり、顧客からの信頼も向上します。また、ESG（環境・社会・ガバナンス）評価の向上により、株主・投資家からの評価も向上し、企業価値の向上につながります。
                  </p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '6px', border: '1px solid #3b82f6', marginTop: '8px' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>
                    投資対効果（ROI）のまとめ
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.8', marginBottom: '12px' }}>
                    従業員100名規模で男性育児休業取得者5名の場合、アプリ導入費用（年間60万円）に対し、以下の効果が期待できます：
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1e3a8a', lineHeight: '1.8' }}>
                    <li><strong>両立支援等助成金：</strong>最大250万円</li>
                    <li><strong>離職率低下による効果：</strong>年間500万円以上（採用コスト削減）</li>
                    <li><strong>くるみん助成金：</strong>最大50万円</li>
                    <li><strong>健康経営優良法人認定による効果：</strong>年間数百万円（金融機関優遇等）</li>
                  </ul>
                  <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#1e40af', lineHeight: '1.8', fontWeight: '600' }}>
                    投資対効果：<strong>12.5倍以上</strong>（投資額60万円に対し、効果750万円以上）
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* お金の流れ */}
          <div className="specification-section">
            <h2>お金の流れ</h2>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>育児休業給付金の流れ</h3>
              <div className="mermaid-chart-wrapper" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', marginBottom: '24px' }}>
                <div className="mermaid-container" ref={moneyFlowRef} style={{ minHeight: '300px', overflow: 'auto' }}></div>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>両立支援等助成金（出生時両立支援コース）の流れ</h3>
              <div className="mermaid-chart-wrapper" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
                <div className="mermaid-container" ref={subsidyFlowRef} style={{ minHeight: '300px', overflow: 'auto' }}></div>
              </div>
            </div>
          </div>

          {/* 解決策の詳細 */}
          <div className="specification-section">
            <h2>解決策の詳細</h2>
            <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6', marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px', color: '#1e40af' }}>アプリ連携による取得率向上</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: '#1e3a8a' }}>
                <li><strong>申請手続きガイド：</strong>アプリの支援制度詳細情報により、育児休業給付金の申請手続きが分かりやすくなる。必要な書類や手続きを明確に示す</li>
                <li><strong>申請期限リマインダー：</strong>アクション管理機能により、申請期限を設定し、リマインダーで通知されるため、申請漏れのリスクがなくなる</li>
                <li><strong>申請書類の自動生成：</strong>アプリから申請に必要な書類を自動生成でき、申請の負担が軽減される</li>
                <li><strong>取得のメリット説明：</strong>AIアシスタント機能により、育児休業取得のメリットや、給付金の内容を分かりやすく説明し、取得しやすい雰囲気を作る</li>
                <li><strong>復帰後のサポート：</strong>復帰後の育児と仕事の両立をサポートする情報やアドバイスを提供し、復帰後の不安を解消する</li>
              </ul>
            </div>
          </div>

          {/* 離職率・復帰の目処・その後のサポート */}
          <div className="specification-section">
            <h2>離職率・復帰の目処・その後のサポート</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#065f46' }}>離職率の低下</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#065f46', lineHeight: '1.6', marginBottom: '12px' }}>
                  育児と仕事の両立を支援することで、離職率が低下します。
                </p>
                <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '6px', marginTop: '12px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#047857', marginBottom: '4px' }}>育児支援施策実施企業の離職率</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#10b981' }}>平均10%低下</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#047857', marginTop: '4px' }}>（厚生労働省調査）</p>
                </div>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#065f46' }}>復帰の目処</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#065f46', lineHeight: '1.6', marginBottom: '12px' }}>
                  アプリのアクション管理機能により、復帰予定日を設定し、復帰に向けた準備を計画的に進められます。
                </p>
                <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '6px', marginTop: '12px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#047857', marginBottom: '4px' }}>復帰準備のサポート</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#10b981' }}>計画的に準備</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#047857', marginTop: '4px' }}>（リマインダー機能）</p>
                </div>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#065f46' }}>その後のサポート</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#065f46', lineHeight: '1.6', marginBottom: '12px' }}>
                  復帰後の育児と仕事の両立をサポートする情報やアドバイスを24時間365日提供します。
                </p>
                <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '6px', marginTop: '12px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#047857', marginBottom: '4px' }}>AIアシスタントによる</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#10b981' }}>24時間365日</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#047857', marginTop: '4px' }}>（伴走型育児支援）</p>
                </div>
              </div>
            </div>
          </div>

          {/* 社会的信用度・企業ブランドへの影響 */}
          <div className="specification-section">
            <h2>社会的信用度・企業ブランドへの影響</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#92400e' }}>くるみん認定取得</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.6', marginBottom: '12px' }}>
                  次世代育成支援対策推進法に基づく行動計画を策定・実施し、くるみん認定を取得することで、企業の社会的評価が向上します。
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#78350f', lineHeight: '1.6' }}>
                  <li>企業の社会的評価向上</li>
                  <li>優秀な人材の採用が容易になる</li>
                  <li>助成金の受給（最大50万円）</li>
                </ul>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#92400e' }}>健康経営優良法人認定</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.6', marginBottom: '12px' }}>
                  従業員の健康管理を経営課題として捉え、戦略的に取り組む企業として認定されます。
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#78350f', lineHeight: '1.6' }}>
                  <li>金融機関からの優遇金利</li>
                  <li>公共調達での優遇措置</li>
                  <li>ESG評価の向上</li>
                </ul>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#92400e' }}>企業ブランドの向上</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.6', marginBottom: '12px' }}>
                  育児と仕事の両立を支援する企業として、企業ブランドが向上します。
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#78350f', lineHeight: '1.6' }}>
                  <li>優秀な人材の採用が容易になる</li>
                  <li>顧客からの信頼向上</li>
                  <li>株主・投資家からの評価向上</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 投資対効果 */}
          <div className="specification-section">
            <h2>投資対効果（ROI）</h2>
            <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b', marginTop: '16px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', color: '#92400e' }}>試算例（従業員100名規模、男性育児休業取得者5名の場合）</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>投資額</h4>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#92400e' }}>年間60万円</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>（月額500円 × 100名 × 12ヶ月）</p>
                </div>
                <div>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>両立支援等助成金</h4>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#92400e' }}>最大250万円</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>（男性育児休業取得者5名 × 最大50万円）</p>
                </div>
                <div>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>離職率低下による効果</h4>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#92400e' }}>年間500万円以上</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>（採用コスト削減）</p>
                </div>
                <div>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>投資対効果</h4>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#92400e' }}>12.5倍以上</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>（投資額60万円に対し、効果750万円以上）</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationCaseStudyMaleChildcareLeave;

