import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import mermaid from 'mermaid';
import './LumpSumDetail.css';

const LumpSumDetail = () => {
  const { currentUser } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [viewMode, setViewMode] = useState('flow'); // 'correlation', 'components', 'flow'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
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


  // 出産費用の内訳データ（令和4年度正常分娩全国平均）
  const costBreakdownData = [
    { name: '分娩料', value: 282424, percentage: 51.8, color: '#ef4444' },
    { name: '入院料', value: 118326, percentage: 21.7, color: '#14b8a6' },
    { name: '新生児管理保育料', value: 50052, percentage: 9.2, color: '#f59e0b' },
    { name: 'その他', value: 94995, percentage: 17.4, color: '#94a3b8', description: '処置・手当料、検査・薬剤料、その他の費用' }
  ];

  const totalCost = 545797;

  // Mermaid初期化（最小限）
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
        // エッジラベルの背景色を透明にする
        edgeLabelBackground: 'transparent',
        primaryTextColor: '#374151',
        primaryBorderColor: '#6b7280',
        lineColor: '#6b7280',
        secondaryColor: 'transparent',
        tertiaryColor: 'transparent'
      }
    });
  }, []);

  // Mermaid図をレンダリングするコンポーネント（最小限）
  const MermaidChart = ({ chart, id, onAreaHover, currentHoveredArea, zoomLevel = 1 }) => {
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
                    const isDescNode = nodeText.includes('出産育児一時金を受給する当事者') ||
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
              
              // テキストが見切れないように、foreignObjectの幅と高さを調整
              
              // エッジのマーカーとパスの色を背景の箱（エッジラベル）の色に一致させる
              const edgePaths = svgElement.querySelectorAll('.edgePath');
              edgePaths.forEach((edgePath) => {
                const path = edgePath.querySelector('path');
                if (!path) return;
                
                // エッジラベルの背景色を取得
                // edgePathと同じ親要素内のエッジラベルを探す
                let labelBgColor = '#faf5ff'; // デフォルトは薄い紫色
                
                const edgeGroup = edgePath.parentElement;
                if (edgeGroup) {
                  // エッジラベルのrectを探す（edgeLabelクラスまたはedgePathの兄弟要素）
                  const edgeLabels = edgeGroup.querySelectorAll('.edgeLabel, g[class*="edgeLabel"]');
                  edgeLabels.forEach((edgeLabel) => {
                    const labelRect = edgeLabel.querySelector('rect');
                    if (labelRect) {
                      const fill = labelRect.getAttribute('fill');
                      if (fill && fill !== 'none' && fill !== 'transparent') {
                        labelBgColor = fill;
                      }
                    }
                  });
                  
                  // エッジラベルが見つからない場合、edgePathの近くのrectを探す
                  if (labelBgColor === '#faf5ff') {
                    const allRects = edgeGroup.querySelectorAll('rect');
                    allRects.forEach((rect) => {
                      const fill = rect.getAttribute('fill');
                      // 薄い紫色や薄い色のrectを探す（エッジラベルの背景色）
                      if (fill && fill !== 'none' && fill !== 'transparent') {
                        // 紫色系の色を優先
                        if (fill.includes('faf5ff') || fill.includes('f3e8ff') || fill.includes('e9d5ff') ||
                            fill === '#faf5ff' || fill === '#f3e8ff' || fill === '#e9d5ff') {
                          labelBgColor = fill;
                        } else if (fill.includes('f') && labelBgColor === '#faf5ff') {
                          // 他の薄い色も候補として
                          labelBgColor = fill;
                        }
                      }
                    });
                  }
                }
                
                console.log('Edge label background color:', labelBgColor);
                
                // エッジのパスの色を設定（見やすい色にする）
                const edgeColor = '#6b7280'; // グレー系の色で統一
                path.setAttribute('stroke', edgeColor);
                path.style.stroke = edgeColor;
                path.setAttribute('stroke-width', '2');
                path.style.strokeWidth = '2';
                
                // エッジラベルの背景を透明にする
                const currentEdgeGroup = edgePath.parentElement;
                if (currentEdgeGroup) {
                  const edgeLabels = currentEdgeGroup.querySelectorAll('.edgeLabel, g[class*="edgeLabel"]');
                  edgeLabels.forEach((edgeLabel) => {
                    const labelRect = edgeLabel.querySelector('rect');
                    if (labelRect) {
                      // より強力に透明化
                      labelRect.setAttribute('fill', 'transparent');
                      labelRect.setAttribute('stroke', 'transparent');
                      labelRect.setAttribute('stroke-width', '0');
                      labelRect.removeAttribute('fill'); // fill属性を削除
                      labelRect.style.setProperty('fill', 'transparent', 'important');
                      labelRect.style.setProperty('stroke', 'transparent', 'important');
                      labelRect.style.setProperty('stroke-width', '0', 'important');
                      labelRect.style.setProperty('display', 'none', 'important');
                    }
                  });
                }
                
                // マーカー（矢印）の色を設定して表示する
                const markerEnd = path.getAttribute('marker-end');
                const markerStart = path.getAttribute('marker-start');
                const markerIds = [markerEnd, markerStart].filter(Boolean);
                
                markerIds.forEach((markerId) => {
                  if (markerId) {
                    const markerIdClean = markerId.replace('url(#', '').replace(')', '');
                    const marker = svgElement.querySelector(`#${markerIdClean}`);
                    if (marker) {
                      const markerPath = marker.querySelector('path');
                      if (markerPath) {
                        // マーカーを表示（エッジと同じ色）
                        markerPath.setAttribute('fill', edgeColor);
                        markerPath.setAttribute('stroke', edgeColor);
                        markerPath.style.fill = edgeColor;
                        markerPath.style.stroke = edgeColor;
                      }
                    }
                  }
                });
                
              });
              
              // すべてのエッジラベルの背景を透明にする（念のため）
              // まず、実際のDOM構造を確認するためのログを追加
              console.log('=== エッジラベルの背景を透明にする処理開始 ===');
              
              // より広範囲なセレクターを使用
              const allEdgeLabelRects = svgElement.querySelectorAll('.edgeLabel rect, g[class*="edgeLabel"] rect, g[class*="edge-label"] rect');
              console.log('セレクター1で見つかったrect数:', allEdgeLabelRects.length);
              allEdgeLabelRects.forEach((rect, index) => {
                const fill = rect.getAttribute('fill');
                console.log(`rect[${index}] fill属性:`, fill);
                rect.setAttribute('fill', 'transparent');
                rect.setAttribute('stroke', 'transparent');
                rect.setAttribute('stroke-width', '0');
                rect.style.fill = 'transparent';
                rect.style.stroke = 'transparent';
                rect.style.strokeWidth = '0';
                rect.style.display = 'none'; // 完全に非表示にする
              });
              
              // エッジラベルの親要素内のすべての要素を確認（rect以外も含む）
              const edgeLabelGroups = svgElement.querySelectorAll('.edgeLabel, g[class*="edgeLabel"], g[class*="edge-label"]');
              console.log('エッジラベルグループ数:', edgeLabelGroups.length);
              edgeLabelGroups.forEach((group, groupIndex) => {
                // foreignObject内のdiv要素を確認（これが背景色の原因の可能性が高い）
                const foreignObjects = group.querySelectorAll('foreignObject');
                foreignObjects.forEach((fo, foIndex) => {
                  const div = fo.querySelector('div');
                  if (div) {
                    const bgColor = window.getComputedStyle(div).backgroundColor;
                    const bgColorAttr = div.style.backgroundColor;
                    console.log(`グループ[${groupIndex}] foreignObject[${foIndex}] divの背景色:`, {
                      computed: bgColor,
                      style: bgColorAttr,
                      divStyle: div.getAttribute('style')
                    });
                    
                    // div要素の背景色をピンクにして、丸みを帯びた囲いにする
                    const pinkColor = '#fce7f3'; // 薄いピンク
                    div.style.setProperty('background-color', pinkColor, 'important');
                    div.style.setProperty('background', pinkColor, 'important');
                    div.style.setProperty('border-radius', '12px', 'important');
                    div.style.setProperty('padding', '4px 8px', 'important');
                    // style属性も更新
                    const currentStyle = div.getAttribute('style') || '';
                    const newStyle = currentStyle.replace(/background[^;]*/g, '').replace(/border-radius[^;]*/g, '').replace(/padding[^;]*/g, '').replace(/;+/g, ';') + `background-color: ${pinkColor}; border-radius: 12px; padding: 4px 8px;`;
                    div.setAttribute('style', newStyle);
                  }
                });
                
                // グループ内のすべての要素を確認
                const allChildren = group.querySelectorAll('*');
                console.log(`グループ[${groupIndex}]内の全要素数:`, allChildren.length);
                
                // rect要素を確認
                const rects = group.querySelectorAll('rect');
                console.log(`グループ[${groupIndex}]内のrect数:`, rects.length);
                rects.forEach((rect, rectIndex) => {
                  const fill = rect.getAttribute('fill');
                  console.log(`グループ[${groupIndex}] rect[${rectIndex}] fill属性:`, fill);
                  rect.setAttribute('fill', 'transparent');
                  rect.setAttribute('stroke', 'transparent');
                  rect.setAttribute('stroke-width', '0');
                  rect.style.setProperty('fill', 'transparent', 'important');
                  rect.style.setProperty('stroke', 'transparent', 'important');
                  rect.style.setProperty('stroke-width', '0', 'important');
                  rect.style.setProperty('display', 'none', 'important');
                });
                
                // グループ自体のスタイルも確認
                const groupFill = group.getAttribute('fill');
                const groupStyle = group.getAttribute('style');
                const groupComputedStyle = window.getComputedStyle(group);
                console.log(`グループ[${groupIndex}]自体のfill:`, groupFill, 'style:', groupStyle, 'computed背景色:', groupComputedStyle.backgroundColor);
                
                // グループ自体の背景色もピンクにする
                const pinkColor = '#fce7f3'; // 薄いピンク
                group.style.setProperty('background-color', pinkColor, 'important');
                group.style.setProperty('background', pinkColor, 'important');
                if (groupFill && groupFill !== 'transparent' && groupFill !== 'none') {
                  group.setAttribute('fill', pinkColor);
                }
              });
              
              // すべてのrect要素を確認（エッジラベルに関連するもの）
              const allRects = svgElement.querySelectorAll('rect');
              console.log('SVG内のすべてのrect数:', allRects.length);
              allRects.forEach((rect, index) => {
                const fill = rect.getAttribute('fill');
                const parent = rect.parentElement;
                const parentClass = parent ? parent.getAttribute('class') : '';
                // エッジラベルに関連するrectを探す
                if (fill && fill !== 'transparent' && fill !== 'none' && 
                    (parentClass && parentClass.includes('edgeLabel') || 
                     parentClass && parentClass.includes('edge-label'))) {
                  console.log(`エッジラベル関連のrect[${index}]を発見:`, {
                    fill: fill,
                    parentClass: parentClass,
                    parentTag: parent ? parent.tagName : 'none'
                  });
                  rect.setAttribute('fill', 'transparent');
                  rect.setAttribute('stroke', 'transparent');
                  rect.setAttribute('stroke-width', '0');
                  rect.style.fill = 'transparent';
                  rect.style.stroke = 'transparent';
                  rect.style.strokeWidth = '0';
                  rect.style.display = 'none';
                }
              });
              
              console.log('=== エッジラベルの背景を透明にする処理終了 ===');
              
              // エリア（subgraph/cluster）にホバーイベントを追加
              const clusters = svgElement.querySelectorAll('.cluster');
              console.log('Found clusters:', clusters.length);
              
              clusters.forEach((cluster) => {
                const rect = cluster.querySelector('rect');
                if (rect) {
                  // エリアIDを取得（areaA, areaB, areaC, areaD, areaE）
                  const clusterId = cluster.getAttribute('id') || '';
                  let areaId = null;
                  
                  // クラスターIDから直接特定
                  if (clusterId.includes('areaA') || clusterId.toLowerCase().includes('a') && !clusterId.includes('areaB') && !clusterId.includes('areaC') && !clusterId.includes('areaD') && !clusterId.includes('areaE')) {
                    areaId = 'A';
                  } else if (clusterId.includes('areaB') || (clusterId.toLowerCase().includes('b') && !clusterId.includes('areaA') && !clusterId.includes('areaC') && !clusterId.includes('areaD') && !clusterId.includes('areaE'))) {
                    areaId = 'B';
                  } else if (clusterId.includes('areaC') || (clusterId.toLowerCase().includes('c') && !clusterId.includes('areaA') && !clusterId.includes('areaB') && !clusterId.includes('areaD') && !clusterId.includes('areaE'))) {
                    areaId = 'C';
                  } else if (clusterId.includes('areaD') || (clusterId.toLowerCase().includes('d') && !clusterId.includes('areaA') && !clusterId.includes('areaB') && !clusterId.includes('areaC') && !clusterId.includes('areaE'))) {
                    areaId = 'D';
                  } else if (clusterId.includes('areaE') || (clusterId.toLowerCase().includes('e') && !clusterId.includes('areaA') && !clusterId.includes('areaB') && !clusterId.includes('areaC') && !clusterId.includes('areaD'))) {
                    areaId = 'E';
                  }
                  
                  // ノードを確認してエリアを特定（フォールバック）
                  if (!areaId) {
                    const nodes = cluster.querySelectorAll('.node');
                    nodes.forEach((node) => {
                      const nodeId = node.getAttribute('id') || '';
                      const foreignObject = node.querySelector('foreignObject');
                      let nodeTextContent = '';
                      
                      if (foreignObject) {
                        const div = foreignObject.querySelector('div');
                        if (div) {
                          nodeTextContent = div.textContent || '';
                        }
                      }
                      
                      if (nodeId.includes('A') || nodeTextContent.includes('あなた')) {
                        areaId = 'A';
                      } else if (nodeId.includes('B') || nodeTextContent.includes('健康保険')) {
                        areaId = 'B';
                      } else if (nodeId.includes('C') || nodeTextContent.includes('医療')) {
                        areaId = 'C';
                      } else if (nodeId.includes('D') || nodeTextContent.includes('厚生')) {
                        areaId = 'D';
                      } else if (nodeId.includes('E') || nodeTextContent.includes('勤務')) {
                        areaId = 'E';
                      }
                    });
                  }
                  
                  console.log('Cluster ID:', clusterId, 'Detected areaId:', areaId);
                }
              });
              
              // 説明文ノード（A_DESC, B_DESC, C_DESC, D_DESC, E_DESC）を透明にしてクリック無効化
              // また、説明文ノードをメインノードに近づける
              clusters.forEach((cluster) => {
                const nodes = cluster.querySelectorAll('.node');
                
                // 説明文ノードを検出（テキスト内容で判定）
                const descTexts = [
                  '出産育児一時金を受給する当事者',
                  '加入している健康保険の運営主体',
                  '出産を行う産院や病院',
                  '制度の設計と監督を行う国の機関',
                  '健康保険の加入手続きを行う際に関わる'
                ];
                
                let mainNode = null;
                let descNode = null;
                
                nodes.forEach((node) => {
                  const foreignObject = node.querySelector('foreignObject');
                  if (foreignObject) {
                    const div = foreignObject.querySelector('div');
                    const nodeText = div ? div.textContent.trim() : '';
                    
                    // 説明文ノードかどうかを判定
                    const isDescNode = descTexts.some(descText => nodeText.includes(descText));
                    
                    if (isDescNode) {
                      descNode = node;
                    } else if (nodeText.length > 0 && (nodeText.includes('厚生') || nodeText.includes('勤務') || 
                              nodeText.includes('あなた') || nodeText.includes('健康保険') || nodeText.includes('医療'))) {
                      mainNode = node;
                    }
                  }
                });
                
                // 説明文ノードをメインノードに近づける
                if (mainNode && descNode) {
                  setTimeout(() => {
                    const mainGroup = mainNode.closest('g');
                    const descGroup = descNode.closest('g');
                    
                    if (mainGroup && descGroup) {
                      const mainRect = mainNode.querySelector('rect');
                      const descRect = descNode.querySelector('rect');
                      
                      if (mainRect && descRect) {
                        // メインノードの位置を取得
                        const mainTransform = mainGroup.getAttribute('transform') || '';
                        const mainMatch = mainTransform.match(/translate\(([^,]+),([^)]+)\)/);
                        const mainGroupX = mainMatch ? parseFloat(mainMatch[1]) : 0;
                        const mainGroupY = mainMatch ? parseFloat(mainMatch[2]) : 0;
                        
                        const mainRectX = parseFloat(mainRect.getAttribute('x')) || 0;
                        const mainRectY = parseFloat(mainRect.getAttribute('y')) || 0;
                        const mainRectWidth = parseFloat(mainRect.getAttribute('width')) || 0;
                        const mainRectHeight = parseFloat(mainRect.getAttribute('height')) || 0;
                        
                        // 説明文ノードの現在位置を取得
                        const descTransform = descGroup.getAttribute('transform') || '';
                        const descMatch = descTransform.match(/translate\(([^,]+),([^)]+)\)/);
                        const descGroupX = descMatch ? parseFloat(descMatch[1]) : 0;
                        const descGroupY = descMatch ? parseFloat(descMatch[2]) : 0;
                        
                        const descRectX = parseFloat(descRect.getAttribute('x')) || 0;
                        const descRectY = parseFloat(descRect.getAttribute('y')) || 0;
                        
                        // 説明文をメインノードの右側、中央に配置（10pxの間隔）
                        const mainAbsoluteX = mainGroupX + mainRectX;
                        const mainAbsoluteY = mainGroupY + mainRectY;
                        
                        const targetX = mainAbsoluteX + mainRectWidth + 10;
                        const targetY = mainAbsoluteY + mainRectHeight / 2;
                        
                        const newDescGroupX = targetX - descRectX;
                        const newDescGroupY = targetY - descRectY - (parseFloat(descRect.getAttribute('height')) || 0) / 2;
                        
                        descGroup.setAttribute('transform', `translate(${newDescGroupX}, ${newDescGroupY})`);
                      }
                    }
                  }, 100);
                }
                
                nodes.forEach((node) => {
                  const foreignObject = node.querySelector('foreignObject');
                  if (foreignObject) {
                    const div = foreignObject.querySelector('div');
                    const nodeText = div ? div.textContent : '';
                    
                    if (nodeText && (
                      nodeText.includes('出産育児一時金を受給する当事者') ||
                      nodeText.includes('加入している健康保険の運営主体') ||
                      nodeText.includes('出産を行う産院や病院') ||
                      nodeText.includes('制度の設計と監督を行う国の機関') ||
                      nodeText.includes('健康保険の加入手続きを行う際に関わる')
                    )) {
                      const nodeRect = node.querySelector('rect');
                      if (nodeRect) {
                        nodeRect.setAttribute('fill', 'transparent');
                        nodeRect.setAttribute('stroke', 'transparent');
                        nodeRect.setAttribute('stroke-width', '0');
                        nodeRect.style.fill = 'transparent';
                        nodeRect.style.stroke = 'transparent';
                        nodeRect.style.strokeWidth = '0';
                        node.style.pointerEvents = 'none';
                        nodeRect.style.pointerEvents = 'none';
                      }
                    }
                  }
                });
              });
              
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
              
              // MutationObserverを使ってエッジラベルの背景色の変更を監視
              const makeEdgeLabelTransparent = () => {
                const allEdgeLabelRects = svgElement.querySelectorAll('.edgeLabel rect, g[class*="edgeLabel"] rect, g[class*="edge-label"] rect');
                allEdgeLabelRects.forEach((rect) => {
                  const fill = rect.getAttribute('fill');
                  // 背景色が設定されている場合、透明にする
                  if (fill && fill !== 'transparent' && fill !== 'none') {
                    console.log('エッジラベルの背景色を検出:', fill);
                    rect.setAttribute('fill', 'transparent');
                    rect.setAttribute('stroke', 'transparent');
                    rect.setAttribute('stroke-width', '0');
                    rect.style.setProperty('fill', 'transparent', 'important');
                    rect.style.setProperty('stroke', 'transparent', 'important');
                    rect.style.setProperty('stroke-width', '0', 'important');
                    rect.style.setProperty('display', 'none', 'important');
                  }
                });
              };
              
              // 初回実行
              setTimeout(() => {
                makeEdgeLabelTransparent();
              }, 100);
              
              // MutationObserverで変更を監視
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  if (mutation.type === 'attributes' && mutation.attributeName === 'fill') {
                    const target = mutation.target;
                    if (target.tagName === 'rect') {
                      const parent = target.parentElement;
                      const parentClass = parent ? parent.getAttribute('class') : '';
                      if (parentClass && (parentClass.includes('edgeLabel') || parentClass.includes('edge-label'))) {
                        console.log('エッジラベルのfill属性が変更されました:', target.getAttribute('fill'));
                        makeEdgeLabelTransparent();
                      }
                    }
                  }
                });
              });
              
              // SVG全体を監視
              observer.observe(svgElement, {
                attributes: true,
                attributeFilter: ['fill', 'style'],
                subtree: true,
                childList: true
              });
              
              // クリーンアップ関数（必要に応じて）
              // 注意: このobserverはコンポーネントのライフサイクルで管理する必要があります
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

  // Mermaid図の定義
              // シンプル版（説明文なし、詳細版と同じ配置）
  // 相関図
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
        A["👤 あなた<br/>（被保険者・被扶養者）"]
        A_DESC["出産育児一時金を受給する当事者"]
      end
      
      subgraph areaB[" "]
        B["🏢 健康保険組合"]
        B_DESC["加入している健康保険の運営主体。出産育児一時金の支給を行う"]
      end
      
      subgraph areaC[" "]
        C["🏥 医療機関"]
        C_DESC["出産を行う産院や病院。出産費用の明細書を発行"]
      end
      
      D -->|"1. 制度設計・監督<br/>（事務処理）"| B
      E -->|"2. 健康保険の加入手続き<br/>（事務処理）"| B
      A -->|"3. 健康保険に加入<br/>（加入）"| B
      A -->|"4. 出産を行う<br/>（出産）"| C
      C -->|"5. 出産費用を請求<br/>（請求）"| B
      B -->|"6. 出産育児一時金を支給<br/>（支給）"| A
      B -->|"7. 出産費用を直接支払<br/>（支払い）"| C
      C -->|"8. 一時金を代理受取<br/>（受取）"| B
      
      style A fill:#e9d5ff,stroke:#a855f7,stroke-width:3px,color:#581c87,font-weight:bold
      style A_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#581c87,font-weight:normal,font-size:10px
      style areaA fill:#f3e8ff,stroke:#a855f7,stroke-width:2px,stroke-dasharray: 5 5
      
      style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e40af,font-weight:bold
      style B_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#1e40af,font-weight:normal,font-size:10px
      style areaB fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,stroke-dasharray: 5 5
      
      style C fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e,font-weight:bold
      style C_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#92400e,font-weight:normal,font-size:10px
      style areaC fill:#fffbeb,stroke:#f59e0b,stroke-width:2px,stroke-dasharray: 5 5
      
      style D fill:#f3f4f6,stroke:#6b7280,stroke-width:2px,color:#374151,font-weight:bold
      style D_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#374151,font-weight:normal,font-size:10px
      style areaD fill:#f9fafb,stroke:#6b7280,stroke-width:2px,stroke-dasharray: 5 5
      
      style E fill:#d1fae5,stroke:#10b981,stroke-width:2px,color:#065f46,font-weight:bold
      style E_DESC fill:transparent,stroke:transparent,stroke-width:0px,color:#065f46,font-weight:normal,font-size:10px
      style areaE fill:#ecfdf5,stroke:#10b981,stroke-width:2px,stroke-dasharray: 5 5
  `;

  const directPaymentSequence = `
    sequenceDiagram
      participant 被保険者 as 出産した本人<br/>（被保険者または被扶養者）
      participant 医療機関 as 出産した施設<br/>（産院・病院など）
      participant 健康保険組合
      participant 自治体 as 市区町村<br/>（出生届の提出先）
      participant 厚生労働省 as 厚生労働省<br/>（制度の監督機関）
      
      被保険者->>医療機関: 1. 出産
      医療機関->>健康保険組合: 2. 出産育児一時金の請求
      健康保険組合->>医療機関: 3. 出産育児一時金の支給
      医療機関->>被保険者: 4. 出産費用の精算
      被保険者->>自治体: 5. 出生届の提出<br/>（出産後14日以内）
      自治体->>自治体: 6. 戸籍登録<br/>（出生届受理後）
      健康保険組合->>厚生労働省: 7. 支給実績の報告
  `;

  const proxyReceiptSequence = `
    sequenceDiagram
      participant 被保険者 as 出産した本人<br/>（被保険者または被扶養者）
      participant 医療機関 as 出産した施設<br/>（産院・病院など）
      participant 健康保険組合
      participant 自治体 as 市区町村<br/>（出生届の提出先）
      participant 厚生労働省 as 厚生労働省<br/>（制度の監督機関）
      
      被保険者->>医療機関: 1. 出産
      医療機関->>健康保険組合: 2. 出産育児一時金の請求
      健康保険組合->>医療機関: 3. 出産育児一時金の支給（代理受取）
      医療機関->>被保険者: 4. 出産費用の精算
      被保険者->>自治体: 5. 出生届の提出<br/>（出産後14日以内）
      自治体->>自治体: 6. 戸籍登録<br/>（出生届受理後）
      健康保険組合->>厚生労働省: 7. 支給実績の報告
  `;

  const traditionalSequence = `
    sequenceDiagram
      participant 被保険者 as 出産した本人<br/>（被保険者または被扶養者）
      participant 医療機関 as 出産した施設<br/>（産院・病院・自宅など<br/>自宅の場合は助産師・医師の証明が必要）
      participant 健康保険組合
      participant 自治体 as 市区町村<br/>（出生届の提出先）
      participant 厚生労働省 as 厚生労働省<br/>（制度の監督機関）
      
      被保険者->>医療機関: 1. 出産（費用を全額支払い）
      被保険者->>健康保険組合: 2. 出産育児一時金の申請
      健康保険組合->>被保険者: 3. 出産育児一時金の支給
      被保険者->>自治体: 4. 出生届の提出<br/>（出産後14日以内）
      自治体->>自治体: 5. 戸籍登録<br/>（出生届受理後）
      健康保険組合->>厚生労働省: 6. 支給実績の報告
  `;

  const componentDiagram = `
    graph LR
      A[出産育児一時金制度] --> B[対象者]
      A --> G[申請期限]
      A --> C[支給金額]
      
      B --> B1[被保険者<br/>会社員・公務員など<br/>健康保険に加入している本人]
      B --> B2[被扶養者<br/>被保険者の配偶者・子供など<br/>被保険者の収入で生計を立てている家族]
      
      B1 --> E[対象者の条件]
      B2 --> E
      
      C --> C1[50万円<br/>（令和5年4月から引き上げ）<br/>産科医療補償制度加入医療機関]
      C --> C2[48万8,000円<br/>産科医療補償制度未加入医療機関]
      
      G --> G1[出産後2年以内<br/>（直接支払制度・受取代理制度の場合は<br/>医療機関が手続きを代行）]
      
      G1 --> D[申請方法]
      
      D --> D1[直接支払制度<br/>医療機関が直接請求]
      D --> D2[受取代理制度<br/>医療機関が代理受取]
      D --> D3[従来の方法<br/>出産後に直接申請]
      
      D1 --> D1_F[必要書類]
      D2 --> D2_F[必要書類]
      D3 --> D3_F[必要書類]
      
      D1_F --> D1_F1[出産育児一時金支給申請書<br/>（医療機関が作成）]
      D1_F --> D1_F2[出生証明書<br/>または死産証書]
      
      D2_F --> D2_F1[出産育児一時金支給申請書<br/>（医療機関が作成）]
      D2_F --> D2_F2[出生証明書<br/>または死産証書]
      
      D3_F --> D3_F1[出産育児一時金支給申請書]
      D3_F --> D3_F2[出生証明書<br/>または死産証書]
      D3_F --> D3_F3[医療機関等の領収書]
      D3_F --> D3_F4[健康保険証の写し<br/>（場合により）]
      
      E --> E1[健康保険に加入している<br/>被保険者または被扶養者]
      E --> E2[出産したこと<br/>（妊娠85日以上の出産）]
      E --> E3[申請期限を守る<br/>（出産後2年以内）]
      
      style A fill:#e9d5ff,stroke:#a855f7,stroke-width:3px,color:#581c87,font-weight:bold
      style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e40af,font-weight:bold
      style C fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e,font-weight:bold
      style D fill:#d1fae5,stroke:#10b981,stroke-width:2px,color:#065f46,font-weight:bold
      style E fill:#fce7f3,stroke:#ec4899,stroke-width:2px,color:#9f1239,font-weight:bold
      style G fill:#fed7aa,stroke:#f97316,stroke-width:2px,color:#9a3412,font-weight:bold
      style D1_F fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#312e81,font-weight:bold
      style D2_F fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#312e81,font-weight:bold
      style D3_F fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#312e81,font-weight:bold
  `;

  // CustomTooltipコンポーネント
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#ffffff',
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#1f2937' }}>
            {payload[0].name}
          </p>
          <p style={{ margin: '0', color: payload[0].color }}>
            {payload[0].value.toLocaleString()}円 ({payload[0].payload.percentage}%)
          </p>
          {payload[0].payload.description && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              {payload[0].payload.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

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
                  </div>
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
              {viewMode === 'correlation' && (
                <>
                  <p className="section-description">
                    出産育児一時金制度に関わる主要な組織とその関係性を示します。<strong className="highlight-text">紫色の枠で囲まれた「あなた」が当事者（被保険者・被扶養者）の位置</strong>です。図中の数字は手続きの流れを示しています。
                  </p>
                  <div className="mermaid-container">
                    <MermaidChart 
                      chart={architectureDiagram} 
                      id="architecture-detailed"
                      zoomLevel={zoomLevel}
                    />
                  </div>
                  <div className="diagram-legend">
                    <h4 className="legend-title">図の見方</h4>
                    <ul className="legend-list">
                      <li><strong className="legend-you">👤 あなた（被保険者・被扶養者）</strong>：出産育児一時金を受給する当事者です。健康保険に加入している方、または被扶養者として登録されている方が対象です。</li>
                      <li><strong>🏢 健康保険組合</strong>：あなたが加入している健康保険の運営主体です。出産育児一時金の支給を行います。</li>
                      <li><strong>🏥 医療機関</strong>：出産を行う産院や病院です。直接支払制度や受取代理制度を利用する場合は、医療機関が手続きの一部を代行します。</li>
                      <li><strong>📋 厚生労働省</strong>：制度の設計と監督を行う国の機関です。</li>
                      <li><strong>💼 勤務先</strong>：健康保険の加入手続きを行う際に関わります。</li>
                      <li><strong>💰 出産育児一時金（50万円）</strong>：支給される一時金です。申請方法によって、あなたに直接支給される場合と、医療機関に直接支払われる場合があります。</li>
                    </ul>
                    <p className="legend-note">
                      <span className="note-label">※注意：</span>
                      実線の矢印は直接的な関係、点線の矢印は間接的な関係を示しています。申請方法（直接支払制度、受取代理制度、従来の方法）によって、手続きの流れが異なります。
                    </p>
                  </div>
                </>
              )}

              {viewMode === 'components' && (
                <>
                  <p className="section-description">
                    出産育児一時金制度の主要な構成要素とその分類を示します。
                  </p>
                  <div className="mermaid-container">
                    <MermaidChart chart={componentDiagram} id="component" zoomLevel={zoomLevel} />
                  </div>
                </>
              )}

              {viewMode === 'flow' && (
                <>
                  <p className="section-description">
                    出産育児一時金の申請方法は3つあります。それぞれの申請フローを示します。
                    <br />
                    <span style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                      ※出産育児一時金の申請は健康保険組合に直接行うため、勤務先への報告は不要です（ただし、出産手当金の申請など、他の手続きでは勤務先への報告が必要な場合があります）。また、出産後14日以内に市区町村役場へ出生届を提出する必要があります（出産育児一時金の申請とは別の手続きです）。出生届が受理されると、赤ちゃんの戸籍登録が完了します。
                    </span>
                  </p>
                  <div className="flow-tabs">
                    <div className="flow-tab-content">
                      <h4 className="flow-tab-title">直接支払制度の申請フロー</h4>
                      <p className="flow-tab-description">
                        医療機関が健康保険組合に直接請求する方式の流れを示します。
                      </p>
                      <div className="mermaid-container">
                        <MermaidChart chart={directPaymentSequence} id="direct-payment" zoomLevel={zoomLevel} />
                      </div>
                    </div>
                    <div className="flow-tab-content">
                      <h4 className="flow-tab-title">受取代理制度の申請フロー</h4>
                      <p className="flow-tab-description">
                        医療機関が代理で出産育児一時金を受け取る方式の流れを示します。
                      </p>
                      <div className="mermaid-container">
                        <MermaidChart chart={proxyReceiptSequence} id="proxy-receipt" zoomLevel={zoomLevel} />
                      </div>
                    </div>
                    <div className="flow-tab-content">
                      <h4 className="flow-tab-title">従来の方法の申請フロー</h4>
                      <p className="flow-tab-description">
                        出産後に被保険者が直接申請する方式の流れを示します。医療機関での出産だけでなく、自宅出産の場合もこの方法で申請できます（自宅出産の場合は助産師・医師の証明が必要です）。
                      </p>
                      <div className="mermaid-container">
                        <MermaidChart chart={traditionalSequence} id="traditional" zoomLevel={zoomLevel} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        {/* 概要セクション（表形式） */}
        <div className="detail-section overview-section">
            <h2>出産育児一時金</h2>
          <div className="detail-card">
            <table className="overview-table">
              <tbody>
                <tr>
                  <th>概要</th>
                    <td>
                      健康保険の被保険者または被扶養者が出産した際に、健康保険組合等から支給される一時金です。令和5年4月から、それまでの原則42万円から原則50万円に13年ぶりに引き上げられました。産科医療補償制度に加入している医療機関で出産した場合は50万円、産科医療補償制度に未加入の医療機関で出産した場合は48万8,000円が支給されます（差額1万2,000円は産科医療補償制度の掛金に相当）。
                    </td>
                </tr>
                <tr>
                  <th>支給金額</th>
                  <td>
                      <div className="amount-update-notice" style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#fef3c7', borderRadius: '4px', fontSize: '14px' }}>
                        <strong>📢 出産育児一時金の増額について</strong><br />
                        出産育児一時金の支給額は、令和5年4月から、それまでの原則42万円から原則50万円に13年ぶりに引き上げられました。
                      </div>
                    <span className="amount-highlight-inline">50万円</span>
                      <span className="amount-note">（産科医療補償制度に加入している医療機関で出産した場合・令和5年4月から）</span>
                      <br />
                      <span className="amount-highlight-inline">48万8,000円</span>
                      <span className="amount-note">（産科医療補償制度に未加入の医療機関で出産した場合・差額1万2,000円は産科医療補償制度の掛金に相当）</span>
                  </td>
                </tr>
                <tr>
                  <th>申請率</th>
                  <td>
                      <p>
                        出産育児一時金の申請率は、直接支払制度の普及により、対象者の多くが申請しています。申請できるのに申請していない場合、この割合は下がります。
                    </p>
                    <p className="data-note">
                      <span className="note-label">※注記：</span>
                      申請率に関する全国的な統計データは公表されていません。この数値は一般的な推定値です。
                      <a 
                        href="https://www.mhlw.go.jp/bunya/iryouhoken/iryouhoken09/07-2.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="reference-link-inline"
                      >
                        厚生労働省の詳細情報
                      </a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>対象者</th>
                  <td>
                    <ul className="table-list">
                        <li><strong>被保険者</strong>：会社員・公務員など、健康保険に加入している本人</li>
                        <li><strong>被扶養者</strong>：被保険者の配偶者・子供など、被保険者の収入で生計を立てている家族</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>受け取り方</th>
                  <td>
                    <ul className="table-list">
                      <li>
                        直接支払制度：医療機関が直接健康保険組合等に請求
                        <span className="method-rate">（約85%・推定値）</span>
                      </li>
                      <li>
                        受取代理制度：医療機関が代理で受け取る
                        <span className="method-rate">（約10%・推定値）</span>
                      </li>
                      <li>
                        従来の方法：出産後に健康保険組合等に申請
                        <span className="method-rate">（約5%・推定値）</span>
                      </li>
                    </ul>
                    <p className="data-note">
                      <span className="note-label">※注記：</span>
                        受け取り方の割合は一般的な推定値です。実際の割合は地域や医療機関によって異なります。
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>申請期限</th>
                    <td>
                      出産後2年以内（直接支払制度や受取代理制度を利用する場合は、医療機関が手続きを代行）
                    </td>
                </tr>
                <tr>
                  <th>申請方法</th>
                  <td>
                    <ul className="table-list">
                      <li>直接支払制度を利用する場合：医療機関が直接健康保険組合等に請求</li>
                      <li>受取代理制度を利用する場合：医療機関が代理で受け取る</li>
                      <li>従来の方法：出産後に健康保険組合等に申請</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>必要書類</th>
                  <td>
                    <ul className="table-list">
                      <li>出産育児一時金支給申請書</li>
                      <li>出生証明書または死産証書</li>
                      <li>医療機関等の領収書（直接支払制度を利用しない場合）</li>
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
                      className="reference-link"
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

        {/* 出産費用の解説セクション */}
        <div className="detail-section cost-section">
          <h2>出産にかかる費用</h2>
          
          {/* 全国平均と施設別の費用 */}
          <div className="detail-card">
            <h3 className="section-subtitle">一般的な出産費用</h3>
            <p className="section-description">
              出産費用は、医療機関の種類や地域によって大きく異なります。令和6年度上半期（2024年4月～9月）の正常分娩における全施設平均は約51万7,952円です。
              <a 
                href="https://www.mhlw.go.jp/content/12401000/001336297.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="reference-link-inline"
              >
                出産費用の状況等について（厚生労働省 保険局）
              </a>
            </p>
            
            <div className="cost-comparison">
              <div className="cost-item">
                <div className="cost-label">全施設平均</div>
                <div className="cost-amount">約51.8万円</div>
                <div className="cost-period">（令和6年度上半期）</div>
              </div>
              <div className="cost-item">
                <div className="cost-label">公的病院</div>
                <div className="cost-amount">約48.2万円</div>
                <div className="cost-period">（令和6年度上半期）</div>
              </div>
              <div className="cost-item">
                <div className="cost-label">私的病院</div>
                <div className="cost-amount">約53.7万円</div>
                <div className="cost-period">（令和6年度上半期）</div>
              </div>
              <div className="cost-item">
                <div className="cost-label">診療所</div>
                <div className="cost-amount">約52.3万円</div>
                <div className="cost-period">（令和6年度上半期）</div>
              </div>
            </div>

            <div className="region-comparison">
              <h4 className="comparison-title">都道府県別の費用差</h4>
              <div className="region-items">
                <div className="region-item high">
                  <span className="region-label">最も高い</span>
                  <span className="region-name">東京都</span>
                  <span className="region-amount">約60.5万円</span>
                </div>
                <div className="region-item low">
                  <span className="region-label">最も安い</span>
                  <span className="region-name">熊本県</span>
                  <span className="region-amount">約36.1万円</span>
                </div>
              </div>
              <p className="region-note">
                地域によって最大約24万円の差があります。
              </p>
            </div>

            {/* 費用の内訳グラフ */}
            <div className="cost-breakdown">
              <h4 className="comparison-title">出産費用の内訳（令和6年度上半期 正常分娩全施設平均）</h4>
              <p className="breakdown-total">合計: <span className="total-amount">{totalCost.toLocaleString()}円</span></p>
              <p className="breakdown-note">
                注：内訳の金額と割合は令和4年度の正常分娩データに基づいています。総額は令和6年度上半期の正常分娩全施設平均です。
              </p>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}\n${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color }}>
                          {value} ({entry.payload.percentage}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
                        </div>
                      </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LumpSumDetail;