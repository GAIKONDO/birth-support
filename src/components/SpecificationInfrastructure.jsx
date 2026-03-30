import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationInfrastructure = () => {
  const [infrastructureDiagram, setInfrastructureDiagram] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState('simple'); // 'simple' or 'detailed'
  const infrastructureRef = useRef(null);
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
        primaryColor: '#fce7f3',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#6b7280',
        lineColor: '#6b7280',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#ffffff'
      }
    });
  }, []);

  // シンプル版インフラ構成図
  const simpleInfrastructureMermaid = `
    graph TB
      subgraph Internet["インターネット"]
        Users["ユーザー<br/>ブラウザ"]
      end
      
      subgraph GCP["Google Cloud Platform"]
        subgraph Firebase["Firebase"]
          FirebaseHosting["Firebase Hosting<br/>静的サイトホスティング<br/>SSL/TLS証明書<br/>CDN統合"]
          FirebaseAuth["Firebase Authentication<br/>Google OAuth認証<br/>セッション管理"]
          Firestore["Firestore<br/>NoSQLデータベース<br/>リアルタイム同期"]
          SecurityRules["Firestore Security Rules<br/>アクセス制御<br/>データベースのセキュリティ"]
        end
      end
      
      Users --> FirebaseHosting
      FirebaseHosting --> FirebaseAuth
      FirebaseHosting --> Firestore
      
      Firestore --> SecurityRules
      
      style Internet fill:#fce7f3,stroke:#6b7280,stroke-width:2px
      style GCP fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
      style Firebase fill:#fff3e0,stroke:#e65100,stroke-width:2px
      
      style Users fill:#fbcfe8,stroke:#9f1239,stroke-width:2px
      style FirebaseHosting fill:#ffcc80,stroke:#e65100,stroke-width:2px
      style FirebaseAuth fill:#ffcc80,stroke:#e65100,stroke-width:2px
      style Firestore fill:#ffcc80,stroke:#e65100,stroke-width:2px
      style SecurityRules fill:#ffab91,stroke:#e65100,stroke-width:2px
  `;

  // 詳細版インフラ構成図
  const detailedInfrastructureMermaid = `
    graph TB
      subgraph Internet["インターネット"]
        Users["ユーザー<br/>ブラウザ"]
        MobileUsers["モバイルユーザー"]
      end
      
      subgraph GCP["Google Cloud Platform"]
        subgraph Firebase["Firebase"]
          subgraph Hosting["ホスティングサービス"]
            FirebaseHosting["Firebase Hosting<br/>静的サイトホスティング<br/>SSL/TLS証明書<br/>自動デプロイ<br/>CDN統合"]
            CDN["CDN・エッジネットワーク<br/>グローバル配信<br/>低レイテンシー<br/>エッジロケーション"]
          end
          
          subgraph Auth["認証サービス"]
            FirebaseAuth["Firebase Authentication<br/>Google OAuth認証<br/>セッション管理<br/>トークン発行"]
            AuthProviders["認証プロバイダー<br/>Google"]
          end
          
          subgraph Database["データベースサービス"]
            Firestore["Firestore<br/>NoSQLデータベース<br/>リアルタイム同期<br/>自動スケーリング"]
            FirestoreReplication["レプリケーション<br/>マルチリージョン<br/>高可用性"]
            SecurityRules["Firestore Security Rules<br/>アクセス制御<br/>ユーザーごとのデータ分離<br/>権限管理"]
          end
        end
      end
      
      Users --> FirebaseHosting
      MobileUsers --> FirebaseHosting
      FirebaseHosting --> CDN
      FirebaseHosting --> FirebaseAuth
      FirebaseHosting --> Firestore
      
      FirebaseAuth --> AuthProviders
      
      Firestore --> FirestoreReplication
      Firestore --> SecurityRules
      
      style Internet fill:#fce7f3,stroke:#6b7280,stroke-width:2px
      style GCP fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
      style Firebase fill:#fff3e0,stroke:#e65100,stroke-width:2px
      style Hosting fill:#ffe0b2,stroke:#e65100,stroke-width:2px
      style Auth fill:#ffe0b2,stroke:#e65100,stroke-width:2px
      style Database fill:#ffe0b2,stroke:#e65100,stroke-width:2px
      
      style Users fill:#fbcfe8,stroke:#9f1239,stroke-width:2px
      style MobileUsers fill:#fbcfe8,stroke:#9f1239,stroke-width:2px
      style FirebaseHosting fill:#ffcc80,stroke:#e65100,stroke-width:2px
      style CDN fill:#ffcc80,stroke:#e65100,stroke-width:2px
      style FirebaseAuth fill:#ffcc80,stroke:#e65100,stroke-width:2px
      style AuthProviders fill:#ffcc80,stroke:#e65100,stroke-width:2px
      style Firestore fill:#ffcc80,stroke:#e65100,stroke-width:2px
      style FirestoreReplication fill:#ffcc80,stroke:#e65100,stroke-width:2px
      style SecurityRules fill:#ffab91,stroke:#e65100,stroke-width:2px
  `;

  // 現在の表示モードに応じたMermaid図を取得
  const currentMermaidDiagram = viewMode === 'simple' ? simpleInfrastructureMermaid : detailedInfrastructureMermaid;

  // Mermaid図のレンダリング
  useEffect(() => {
    const renderDiagram = async (mermaidCode, ref, setState) => {
      if (!ref.current) return;
      
      // レンダリング前にコンテナをクリアして非表示にする
      ref.current.innerHTML = '';
      ref.current.style.opacity = '0';
      ref.current.style.visibility = 'hidden';
      setState(false);
      
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        ref.current.innerHTML = svg;
        
        // テキストが見切れないように、foreignObjectの幅と高さを調整
        setTimeout(() => {
          const svgElement = ref.current.querySelector('svg');
          if (svgElement) {
            // ズーム機能用のSVG要素にスケールを適用
            svgElement.style.transform = `scale(${zoomLevel})`;
            svgElement.style.transformOrigin = 'center center';
            svgElement.style.transition = 'transform 0.2s ease-out';
            svgElement.style.willChange = 'transform';
            
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
                  
                  // 対応するrect要素の幅も調整
                  const node = fo.closest('.node');
                  if (node) {
                    const rect = node.querySelector('rect');
                    if (rect) {
                      const currentWidth = parseFloat(rect.getAttribute('width')) || 0;
                      if (newWidth > currentWidth) {
                        rect.setAttribute('width', newWidth.toString());
                      }
                    }
                  }
                }
                
                if (textHeight > 0) {
                  // 余白を追加して高さを設定
                  const newHeight = Math.ceil(textHeight) + 20;
                  fo.setAttribute('height', newHeight.toString());
                  
                  // 対応するrect要素の高さも調整
                  const node = fo.closest('.node');
                  if (node) {
                    const rect = node.querySelector('rect');
                    if (rect) {
                      const currentHeight = parseFloat(rect.getAttribute('height')) || 0;
                      if (newHeight > currentHeight) {
                        rect.setAttribute('height', newHeight.toString());
                      }
                    }
                  }
                }
              }
            });
            
            // エッジラベルのテキストも調整
            const edgeLabels = svgElement.querySelectorAll('.edgeLabel foreignObject');
            edgeLabels.forEach((fo) => {
              const div = fo.querySelector('div');
              if (div) {
                const textWidth = div.scrollWidth || div.offsetWidth;
                const textHeight = div.scrollHeight || div.offsetHeight;
                
                if (textWidth > 0) {
                  const newWidth = Math.ceil(textWidth) + 20;
                  fo.setAttribute('width', newWidth.toString());
                  
                  // エッジラベルのrectも調整
                  const edgeLabelGroup = fo.closest('.edgeLabel');
                  if (edgeLabelGroup) {
                    const rect = edgeLabelGroup.querySelector('rect');
                    if (rect) {
                      const currentWidth = parseFloat(rect.getAttribute('width')) || 0;
                      if (newWidth > currentWidth) {
                        rect.setAttribute('width', newWidth.toString());
                      }
                    }
                  }
                }
                
                if (textHeight > 0) {
                  const newHeight = Math.ceil(textHeight) + 20;
                  fo.setAttribute('height', newHeight.toString());
                  
                  // エッジラベルのrectも調整
                  const edgeLabelGroup = fo.closest('.edgeLabel');
                  if (edgeLabelGroup) {
                    const rect = edgeLabelGroup.querySelector('rect');
                    if (rect) {
                      const currentHeight = parseFloat(rect.getAttribute('height')) || 0;
                      if (newHeight > currentHeight) {
                        rect.setAttribute('height', newHeight.toString());
                      }
                    }
                  }
                }
              }
            });
            
            // レンダリング完了後に表示する
            ref.current.style.visibility = 'visible';
            ref.current.style.opacity = '1';
            ref.current.style.transition = 'opacity 0.3s ease-in';
          }
        }, 200);
        
        setState(true);
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        // エラー時も表示を戻す
        if (ref.current) {
          ref.current.style.visibility = 'visible';
          ref.current.style.opacity = '1';
        }
        setState(false);
      }
    };

    if (infrastructureRef.current) {
      renderDiagram(currentMermaidDiagram, infrastructureRef, setInfrastructureDiagram);
    }
  }, [zoomLevel, viewMode, currentMermaidDiagram]);

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>インフラ構成</h1>
            <p className="specification-description">
              出産支援パーソナルアプリケーションのインフラ構成について説明します。
            </p>
          </div>

          <div className="specification-section">
            <div className="specification-section-header">
              <h2>インフラ構成図</h2>
            </div>
            <div className="mermaid-section">
              <div className="mermaid-chart-wrapper" ref={fullscreenRef}>
                <div className="diagram-controls-fullscreen">
                  <div className="diagram-toggle">
                    <button
                      className={`toggle-button ${viewMode === 'simple' ? 'active' : ''}`}
                      onClick={() => setViewMode('simple')}
                    >
                      シンプル
                    </button>
                    <button
                      className={`toggle-button ${viewMode === 'detailed' ? 'active' : ''}`}
                      onClick={() => setViewMode('detailed')}
                    >
                      詳細
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
                <div 
                  className="mermaid-container" 
                  ref={infrastructureRef}
                  style={{ 
                    opacity: infrastructureDiagram ? 1 : 0, 
                    visibility: infrastructureDiagram ? 'visible' : 'hidden',
                    transition: 'opacity 0.3s ease-in' 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="specification-section">
            <h2>ホスティング</h2>
            <ul>
              <li><strong>Firebase Hosting</strong>: 静的サイトホスティングサービス。Reactアプリケーションをビルドしてデプロイします。</li>
              <li><strong>SSL/TLS証明書</strong>: 自動的にSSL/TLS証明書が発行され、HTTPS通信を提供します。</li>
              <li><strong>CDN統合</strong>: Firebase CDNにより、グローバルにコンテンツを配信し、低レイテンシーを実現します。</li>
              <li><strong>自動デプロイ</strong>: Git連携により、コードの変更を自動的にビルド・デプロイします。</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>認証サービス</h2>
            <ul>
              <li><strong>Firebase Authentication</strong>: Google OAuth認証を提供します。</li>
              <li><strong>セッション管理</strong>: ユーザーの認証状態を管理し、セッションを維持します。</li>
              <li><strong>トークン発行</strong>: 認証トークンを発行し、APIリクエストの認証に使用します。</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>データベース</h2>
            <ul>
              <li><strong>Firestore</strong>: NoSQLデータベース。リアルタイム同期機能を提供します。</li>
              <li><strong>自動スケーリング</strong>: トラフィックに応じて自動的にスケールします。</li>
              <li><strong>マルチリージョン</strong>: 複数のリージョンにレプリケーションされ、高可用性を実現します。</li>
              <li><strong>リアルタイム同期</strong>: データの変更をリアルタイムでクライアントに反映します。</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>ストレージ</h2>
            <ul>
              <li><strong>Firebase Storage</strong>: ファイルストレージサービス。プロフィール画像などのファイルを保存します。</li>
              <li><strong>CDN統合</strong>: 保存されたファイルはCDN経由で配信され、高速なアクセスを実現します。</li>
              <li><strong>ユーザーごとの分離</strong>: ストレージバケットにより、ユーザーごとにデータを分離します。</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>Firebaseセキュリティ</h2>
            <p>Firebaseの各サービスには、それぞれ専用のセキュリティ機能が組み込まれています。</p>
            <ul>
              <li><strong>Firestore Security Rules</strong>: Firestoreへのアクセスを制御し、ユーザーごとのデータ分離を実現します。Firebaseコンソールで設定・管理するFirebaseのサービスです。</li>
              <li><strong>Firebase Auth Rules</strong>: 認証状態に基づいてアクセスを制御します。Firebase Authenticationの一部として提供される機能です。</li>
              <li><strong>CORS設定</strong>: Firebase Storageのクロスオリジンリクエストを制御します。Firebase Storageの設定の一部です。</li>
            </ul>
            <p>これらはすべてFirebaseのサービスとして提供されており、Firebaseコンソールで一元管理できます。</p>
          </div>

          <div className="specification-section">
            <h2>監視・ログ</h2>
            <ul>
              <li><strong>Firebase Analytics</strong>: ユーザーのアクセス解析を行います。</li>
              <li><strong>Firebase Crashlytics</strong>: アプリケーションのエラーを追跡し、問題を特定します。</li>
              <li><strong>ログ管理</strong>: デバッグ情報やエラーログを管理します。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationInfrastructure;

