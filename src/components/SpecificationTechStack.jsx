import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationTechStack = () => {
  const [techStackDiagram, setTechStackDiagram] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState('simple'); // 'simple' or 'detailed'
  const techStackRef = useRef(null);
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
      c4Context: {
        diagramPadding: 40,
        personFontSize: 16,
        systemFontSize: 16,
        externalSystemFontSize: 16,
        systemDbFontSize: 16
      },
      themeVariables: {
        primaryColor: '#fce7f3',
        primaryTextColor: '#000000',
        primaryBorderColor: '#6b7280',
        lineColor: '#6b7280',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#ffffff',
        textColor: '#000000',
        mainBkg: '#ffffff',
        secondBkg: '#f3f4f6',
        tertiaryBkg: '#ffffff'
      }
    });
  }, []);

  // シンプル版技術スタック図
  const simpleTechStackMermaid = `
    C4Context
      title 出産支援パーソナルアプリケーション 技術スタック
      
      Person(user, "ユーザー", "支援制度を利用する方")
      
      System(app, "出産支援パーソナルアプリ", "Webアプリケーション")
      
      System_Ext(firebase, "Firebase Platform", "BaaSプラットフォーム")
      
      SystemDb_Ext(firestore, "Firestore", "データベース")
      
      System_Ext(auth, "Firebase Authentication", "認証サービス")
      
      System_Ext(hosting, "Firebase Hosting", "ホスティング")
      
      Rel(user, app, "利用する", "HTTPS")
      Rel(app, firebase, "利用する")
      Rel(app, firestore, "データの読み書き", "API")
      Rel(app, auth, "認証処理", "API")
      Rel(hosting, app, "ホスティング", "配信")
      
      UpdateElementStyle(firebase, $bgColor="#dcfce7", $borderColor="#16a34a", $fontColor="#000000")
      UpdateElementStyle(firestore, $bgColor="#dcfce7", $borderColor="#16a34a", $fontColor="#000000")
      UpdateElementStyle(auth, $bgColor="#dcfce7", $borderColor="#16a34a", $fontColor="#000000")
      UpdateElementStyle(hosting, $bgColor="#fef3c7", $borderColor="#d97706", $fontColor="#000000")
      UpdateElementStyle(app, $bgColor="#e0e7ff", $borderColor="#6366f1", $fontColor="#000000")
      UpdateElementStyle(user, $bgColor="#fce7f3", $borderColor="#6b7280", $fontColor="#000000")
  `;

  // 詳細版技術スタック図
  const detailedTechStackMermaid = `
    C4Context
      title 出産支援パーソナルアプリケーション 技術スタック
      
      Person(user, "ユーザー", "妊娠・出産・育児に関する支援制度を利用する方<br/>ブラウザまたはモバイルデバイスからアクセス")
      
      System(app, "出産支援パーソナルアプリ", "支援制度の情報管理と申請サポートを行うWebアプリケーション<br/><br/>技術スタック:<br/>• React 19.2.0 (UI構築)<br/>• Vite 7.2.2 (ビルドツール)<br/>• JavaScript (ES6+)<br/>• React Router 7.9.6 (ルーティング)<br/>• Mermaid.js 11.12.1 (図表可視化)")
      
      System_Ext(firebase, "Firebase Platform", "Googleが提供するBaaSプラットフォーム<br/><br/>提供サービス:<br/>• Firestore (NoSQLデータベース)<br/>• Firebase Authentication (認証)<br/>• Firebase Hosting (ホスティング)<br/>• Firestore Security Rules (セキュリティ)")
      
      SystemDb_Ext(firestore, "Firestore", "NoSQLデータベース<br/><br/>保存データ:<br/>• 支援制度データ (マスターデータ)<br/>• ユーザーデータ (プロフィール情報)<br/>• アクションデータ (申請予定管理)<br/>• 健診記録 (電子母子手帳)<br/>• 共有アカウント情報<br/><br/>機能:<br/>• リアルタイム同期<br/>• 自動スケーリング<br/>• マルチリージョンレプリケーション")
      
      System_Ext(auth, "Firebase Authentication", "ユーザー認証サービス<br/><br/>認証方式:<br/>• Google OAuth認証<br/>• セッション管理<br/>• トークン発行<br/><br/>機能:<br/>• 認証状態の監視<br/>• 自動トークン更新<br/>• セキュアなセッション管理")
      
      System_Ext(hosting, "Firebase Hosting", "静的サイトホスティングサービス<br/><br/>機能:<br/>• Reactアプリケーションのデプロイ<br/>• SSL/TLS証明書の自動発行<br/>• CDN統合 (グローバル配信)<br/>• エッジロケーションによる低レイテンシー<br/>• 自動キャッシュ管理")
      
      Rel(user, app, "利用する", "HTTPS<br/>ブラウザ経由")
      Rel(app, firebase, "利用する", "Firebase SDK<br/>統合API")
      Rel(app, firestore, "データの読み書き", "Firestore API<br/>リアルタイム同期<br/>クエリ・トランザクション")
      Rel(app, auth, "認証処理", "Authentication API<br/>Google OAuth<br/>セッション管理")
      Rel(hosting, app, "ホスティング", "静的ファイル配信<br/>CDN経由<br/>SSL/TLS暗号化")
      
      UpdateElementStyle(firebase, $bgColor="#dcfce7", $borderColor="#16a34a", $fontColor="#000000")
      UpdateElementStyle(firestore, $bgColor="#dcfce7", $borderColor="#16a34a", $fontColor="#000000")
      UpdateElementStyle(auth, $bgColor="#dcfce7", $borderColor="#16a34a", $fontColor="#000000")
      UpdateElementStyle(hosting, $bgColor="#fef3c7", $borderColor="#d97706", $fontColor="#000000")
      UpdateElementStyle(app, $bgColor="#e0e7ff", $borderColor="#6366f1", $fontColor="#000000")
      UpdateElementStyle(user, $bgColor="#fce7f3", $borderColor="#6b7280", $fontColor="#000000")
  `;

  // 現在の表示モードに応じたMermaid図を取得
  const currentTechStackDiagram = viewMode === 'simple' ? simpleTechStackMermaid : detailedTechStackMermaid;

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
        
        // ズーム機能用のSVG要素にスケールを適用
        setTimeout(() => {
          const svgElement = ref.current.querySelector('svg');
          if (svgElement) {
            // C4Context図の要素のサイズを調整して文字が被らないようにする
            const nodes = svgElement.querySelectorAll('.node rect, .cluster rect');
            nodes.forEach((rect) => {
              const width = parseFloat(rect.getAttribute('width')) || 0;
              const height = parseFloat(rect.getAttribute('height')) || 0;
              if (width < 200) {
                rect.setAttribute('width', '200');
              }
              if (height < 100) {
                rect.setAttribute('height', '100');
              }
            });
            
            // ズーム機能用のSVG要素にスケールを適用
            svgElement.style.transform = `scale(${zoomLevel})`;
            svgElement.style.transformOrigin = 'center center';
            svgElement.style.transition = 'transform 0.2s ease-out';
            svgElement.style.willChange = 'transform';
            
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

    if (techStackRef.current) {
      renderDiagram(currentTechStackDiagram, techStackRef, setTechStackDiagram);
    }
  }, [zoomLevel, viewMode, currentTechStackDiagram]);

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>技術スタック</h1>
            <p className="specification-description">
              出産支援パーソナルアプリケーションで使用している技術スタックについて説明します。
            </p>
          </div>

          <div className="specification-section">
            <div className="specification-section-header">
              <h2>技術スタック</h2>
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
                  ref={techStackRef}
                  style={{ 
                    opacity: techStackDiagram ? 1 : 0, 
                    visibility: techStackDiagram ? 'visible' : 'hidden',
                    transition: 'opacity 0.3s ease-in' 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="specification-section">
            <h2>フロントエンド</h2>
            <ul>
              <li><strong>React</strong>: UI構築のためのJavaScriptライブラリ</li>
              <li><strong>CSS</strong>: スタイリング</li>
              <li><strong>Mermaid.js</strong>: 図表の可視化</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>バックエンド</h2>
            <ul>
              <li><strong>Firebase</strong>: Googleが提供するBaaSプラットフォーム</li>
              <li><strong>Firestore</strong>: NoSQLデータベース（支援制度データ、ユーザーデータ、アクションデータを保存）</li>
              <li><strong>Firebase Authentication</strong>: ユーザー認証サービス（Google認証、メール認証を提供）</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>ホスティング</h2>
            <ul>
              <li><strong>Firebase Hosting</strong>: 静的サイトホスティングサービス（Reactアプリケーションをデプロイ）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationTechStack;
