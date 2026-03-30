import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationSystemArchitecture = () => {
  const [systemArchitectureDiagram, setSystemArchitectureDiagram] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState('simple'); // 'simple' or 'detailed'
  const systemArchitectureRef = useRef(null);
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

  // シンプル版システムアーキテクチャ図
  const simpleSystemArchitectureMermaid = `
    graph TB
      subgraph User["ユーザー"]
        UserBrowser["ブラウザ"]
      end
      
      subgraph Frontend["フロントエンド"]
        ReactApp["Reactアプリケーション<br/>Vite + JavaScript"]
        FirebaseHosting["Firebase Hosting<br/>静的サイトホスティング"]
        Router["React Router<br/>ルーティング管理"]
      end
      
      subgraph Auth["認証・セキュリティ"]
        FirebaseAuth["Firebase Authentication<br/>Google OAuth認証"]
        FirestoreRules["Firestore Security Rules<br/>アクセス制御"]
      end
      
      subgraph Storage["データストレージ"]
        Firestore["Firestore<br/>NoSQLデータベース<br/>支援制度データ、ユーザーデータ、<br/>アクションデータ、健診記録、共有アカウント"]
        FirebaseStorage["Firebase Storage<br/>ファイルストレージ<br/>プロフィール画像など"]
      end
      
      subgraph Components["主要コンポーネント"]
        Layout["Layout<br/>共通レイアウト"]
        Sidebar["Sidebar<br/>サイドバーナビゲーション"]
        MyPage["MyPage<br/>マイページ"]
        SupportSystems["SupportSystems<br/>支援制度一覧"]
        ActionManagement["ActionManagement<br/>アクション管理"]
      end
      
      subgraph Hooks["カスタムフック"]
        useAuth["useAuth<br/>認証状態管理"]
        useSupportSystems["useSupportSystems<br/>支援制度データ取得"]
      end
      
      subgraph Libraries["ライブラリ"]
        MermaidJS["Mermaid.js<br/>図表の可視化"]
      end
      
      UserBrowser --> FirebaseHosting
      FirebaseHosting --> ReactApp
      ReactApp --> Router
      Router --> Layout
      Layout --> Sidebar
      Layout --> MyPage
      Layout --> SupportSystems
      Layout --> ActionManagement
      
      ReactApp --> useAuth
      ReactApp --> useSupportSystems
      ReactApp --> MermaidJS
      
      useAuth --> FirebaseAuth
      useSupportSystems --> Firestore
      MyPage --> Firestore
      MyPage --> FirebaseStorage
      SupportSystems --> Firestore
      ActionManagement --> Firestore
      
      FirebaseAuth --> FirestoreRules
      FirestoreRules --> Firestore
      
      style User fill:#fce7f3,stroke:#6b7280,stroke-width:2px
      style Frontend fill:#e0e7ff,stroke:#6366f1,stroke-width:2px
      style Auth fill:#fee2e2,stroke:#dc2626,stroke-width:2px
      style Storage fill:#dbeafe,stroke:#2563eb,stroke-width:2px
      style Components fill:#fef3c7,stroke:#d97706,stroke-width:2px
      style Hooks fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
      style Libraries fill:#fef3c7,stroke:#d97706,stroke-width:2px
      
      style UserBrowser fill:#fbcfe8,stroke:#9f1239,stroke-width:2px
      style ReactApp fill:#c7d2fe,stroke:#4f46e5,stroke-width:2px
      style FirebaseHosting fill:#c7d2fe,stroke:#4f46e5,stroke-width:2px
      style Router fill:#c7d2fe,stroke:#4f46e5,stroke-width:2px
      style FirebaseAuth fill:#fecaca,stroke:#991b1b,stroke-width:2px
      style FirestoreRules fill:#fecaca,stroke:#991b1b,stroke-width:2px
      style Firestore fill:#bfdbfe,stroke:#1e40af,stroke-width:2px
      style FirebaseStorage fill:#bfdbfe,stroke:#1e40af,stroke-width:2px
      style Layout fill:#fde68a,stroke:#d97706,stroke-width:2px
      style Sidebar fill:#fde68a,stroke:#d97706,stroke-width:2px
      style MyPage fill:#fde68a,stroke:#d97706,stroke-width:2px
      style SupportSystems fill:#fde68a,stroke:#d97706,stroke-width:2px
      style ActionManagement fill:#fde68a,stroke:#d97706,stroke-width:2px
      style useAuth fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
      style useSupportSystems fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
      style MermaidJS fill:#fde68a,stroke:#d97706,stroke-width:2px
  `;

  // 詳細版システムアーキテクチャ図
  const detailedSystemArchitectureMermaid = `
    graph TB
      subgraph User["ユーザー"]
        UserBrowser["ブラウザ"]
      end
      
      subgraph Hosting["ホスティング"]
        FirebaseHosting["Firebase Hosting<br/>静的サイトホスティング"]
      end
      
      subgraph AppRoot["アプリケーションルート"]
        App["App.jsx<br/>ルーティング定義"]
        AuthProvider["AuthProvider<br/>認証コンテキスト"]
        Router["React Router<br/>ルーティング管理"]
      end
      
      subgraph LayoutComponents["レイアウトコンポーネント"]
        Layout["Layout<br/>共通レイアウト"]
        Sidebar["Sidebar<br/>サイドバーナビゲーション"]
        SubMenu["SubMenu<br/>サブメニュー"]
        ProtectedRoute["ProtectedRoute<br/>認証保護ルート"]
      end
      
      subgraph AuthComponents["認証コンポーネント"]
        Login["Login<br/>ログインページ"]
        AccountSwitcher["AccountSwitcher<br/>アカウント切り替え"]
        SharingSettings["SharingSettings<br/>共有設定"]
        Invitations["Invitations<br/>招待管理"]
      end
      
      subgraph PageComponents["ページコンポーネント"]
        MyPage["MyPage<br/>マイページ"]
        SupportSystems["SupportSystems<br/>支援制度一覧"]
        ActionManagement["ActionManagement<br/>アクション管理"]
        Search["Search<br/>検索"]
        AIAssistant["AIAssistant<br/>AIアシスタント"]
        ElectronicMaternalHandbook["ElectronicMaternalHandbook<br/>電子母子手帳"]
        Statistics["Statistics<br/>統計情報"]
        PaymentAmount["PaymentAmount<br/>支給金額"]
      end
      
      subgraph DetailPages["詳細ページ"]
        LumpSumDetail["LumpSumDetail<br/>出産育児一時金"]
        ChildcareLeaveDetail["ChildcareLeaveDetail<br/>育児休業給付金"]
        ChildbirthAllowanceDetail["ChildbirthAllowanceDetail<br/>出産手当金"]
        ChildAllowanceDetail["ChildAllowanceDetail<br/>児童手当"]
        OtherDetails["その他詳細ページ<br/>産後パパ育休、出生後休業支援など"]
      end
      
      subgraph Hooks["カスタムフック"]
        useAuth["useAuth<br/>認証状態管理"]
        useOwnerId["useOwnerId<br/>オーナーID管理"]
        useSupportSystems["useSupportSystems<br/>支援制度データ取得"]
        useSidebarState["useSidebarState<br/>サイドバー状態管理"]
      end
      
      subgraph FirebaseServices["Firebaseサービス"]
        FirebaseAuth["Firebase Authentication<br/>Google OAuth認証"]
        Firestore["Firestore<br/>NoSQLデータベース"]
        FirebaseStorage["Firebase Storage<br/>ファイルストレージ"]
        FirestoreRules["Firestore Security Rules<br/>アクセス制御"]
      end
      
      subgraph DataCollections["Firestoreコレクション"]
        SupportSystemsData["支援制度データ<br/>マスターデータ"]
        UserData["ユーザーデータ<br/>プロフィール情報"]
        ActionsData["アクションデータ<br/>申請予定管理"]
        ExaminationsData["健診記録<br/>電子母子手帳"]
        SharedAccountsData["共有アカウント<br/>共有設定"]
      end
      
      subgraph Libraries["ライブラリ・ツール"]
        MermaidJS["Mermaid.js<br/>図表の可視化"]
        ReactRouterLib["React Router<br/>ルーティング"]
      end
      
      UserBrowser --> FirebaseHosting
      FirebaseHosting --> App
      
      App --> AuthProvider
      App --> Router
      Router --> Layout
      Router --> Login
      Router --> ProtectedRoute
      
      Layout --> Sidebar
      Layout --> SubMenu
      Layout --> AccountSwitcher
      Layout --> SharingSettings
      Layout --> Invitations
      
      ProtectedRoute --> MyPage
      ProtectedRoute --> SupportSystems
      ProtectedRoute --> ActionManagement
      ProtectedRoute --> Search
      ProtectedRoute --> AIAssistant
      ProtectedRoute --> ElectronicMaternalHandbook
      ProtectedRoute --> Statistics
      ProtectedRoute --> PaymentAmount
      
      SupportSystems --> LumpSumDetail
      SupportSystems --> ChildcareLeaveDetail
      SupportSystems --> ChildbirthAllowanceDetail
      SupportSystems --> ChildAllowanceDetail
      SupportSystems --> OtherDetails
      
      ElectronicMaternalHandbook --> ExaminationsData
      
      Layout --> useAuth
      Layout --> useOwnerId
      Layout --> useSidebarState
      
      SupportSystems --> useSupportSystems
      ActionManagement --> useSupportSystems
      Search --> useSupportSystems
      
      LumpSumDetail --> MermaidJS
      ChildcareLeaveDetail --> MermaidJS
      ChildbirthAllowanceDetail --> MermaidJS
      ChildAllowanceDetail --> MermaidJS
      
      useAuth --> FirebaseAuth
      useOwnerId --> Firestore
      useSupportSystems --> Firestore
      
      MyPage --> Firestore
      SupportSystems --> Firestore
      ActionManagement --> Firestore
      ElectronicMaternalHandbook --> Firestore
      AccountSwitcher --> Firestore
      SharingSettings --> Firestore
      Invitations --> Firestore
      
      MyPage --> FirebaseStorage
      AccountSwitcher --> FirebaseStorage
      
      FirebaseAuth --> FirestoreRules
      FirestoreRules --> Firestore
      
      Firestore --> SupportSystemsData
      Firestore --> UserData
      Firestore --> ActionsData
      Firestore --> ExaminationsData
      Firestore --> SharedAccountsData
      
      style User fill:#fce7f3,stroke:#6b7280,stroke-width:2px
      style Hosting fill:#e0e7ff,stroke:#6366f1,stroke-width:2px
      style AppRoot fill:#dbeafe,stroke:#2563eb,stroke-width:2px
      style LayoutComponents fill:#dcfce7,stroke:#16a34a,stroke-width:2px
      style AuthComponents fill:#fee2e2,stroke:#dc2626,stroke-width:2px
      style PageComponents fill:#fef3c7,stroke:#d97706,stroke-width:2px
      style DetailPages fill:#fde68a,stroke:#d97706,stroke-width:2px
      style Hooks fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
      style FirebaseServices fill:#fecaca,stroke:#991b1b,stroke-width:2px
      style DataCollections fill:#bfdbfe,stroke:#1e40af,stroke-width:2px
      style Libraries fill:#fef3c7,stroke:#d97706,stroke-width:2px
      
      style UserBrowser fill:#fbcfe8,stroke:#9f1239,stroke-width:2px
      style FirebaseHosting fill:#c7d2fe,stroke:#4f46e5,stroke-width:2px
      style App fill:#bfdbfe,stroke:#1e40af,stroke-width:2px
      style AuthProvider fill:#bfdbfe,stroke:#1e40af,stroke-width:2px
      style Router fill:#bfdbfe,stroke:#1e40af,stroke-width:2px
      style Layout fill:#bbf7d0,stroke:#15803d,stroke-width:2px
      style Sidebar fill:#bbf7d0,stroke:#15803d,stroke-width:2px
      style SubMenu fill:#bbf7d0,stroke:#15803d,stroke-width:2px
      style ProtectedRoute fill:#bbf7d0,stroke:#15803d,stroke-width:2px
      style Login fill:#fecaca,stroke:#991b1b,stroke-width:2px
      style AccountSwitcher fill:#fecaca,stroke:#991b1b,stroke-width:2px
      style SharingSettings fill:#fecaca,stroke:#991b1b,stroke-width:2px
      style Invitations fill:#fecaca,stroke:#991b1b,stroke-width:2px
      style MyPage fill:#fde68a,stroke:#d97706,stroke-width:2px
      style SupportSystems fill:#fde68a,stroke:#d97706,stroke-width:2px
      style ActionManagement fill:#fde68a,stroke:#d97706,stroke-width:2px
      style Search fill:#fde68a,stroke:#d97706,stroke-width:2px
      style AIAssistant fill:#fde68a,stroke:#d97706,stroke-width:2px
      style ElectronicMaternalHandbook fill:#fde68a,stroke:#d97706,stroke-width:2px
      style Statistics fill:#fde68a,stroke:#d97706,stroke-width:2px
      style PaymentAmount fill:#fde68a,stroke:#d97706,stroke-width:2px
      style LumpSumDetail fill:#fef3c7,stroke:#ca8a04,stroke-width:2px
      style ChildcareLeaveDetail fill:#fef3c7,stroke:#ca8a04,stroke-width:2px
      style ChildbirthAllowanceDetail fill:#fef3c7,stroke:#ca8a04,stroke-width:2px
      style ChildAllowanceDetail fill:#fef3c7,stroke:#ca8a04,stroke-width:2px
      style OtherDetails fill:#fef3c7,stroke:#ca8a04,stroke-width:2px
      style useAuth fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
      style useOwnerId fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
      style useSupportSystems fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
      style useSidebarState fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
      style FirebaseAuth fill:#fecaca,stroke:#991b1b,stroke-width:2px
      style Firestore fill:#bfdbfe,stroke:#1e40af,stroke-width:2px
      style FirebaseStorage fill:#bfdbfe,stroke:#1e40af,stroke-width:2px
      style FirestoreRules fill:#fecaca,stroke:#991b1b,stroke-width:2px
      style SupportSystemsData fill:#93c5fd,stroke:#1e3a8a,stroke-width:2px
      style UserData fill:#93c5fd,stroke:#1e3a8a,stroke-width:2px
      style ActionsData fill:#93c5fd,stroke:#1e3a8a,stroke-width:2px
      style ExaminationsData fill:#93c5fd,stroke:#1e3a8a,stroke-width:2px
      style SharedAccountsData fill:#93c5fd,stroke:#1e3a8a,stroke-width:2px
      style MermaidJS fill:#fde68a,stroke:#d97706,stroke-width:2px
      style ReactRouterLib fill:#fde68a,stroke:#d97706,stroke-width:2px
  `;

  // 現在の表示モードに応じたMermaid図を取得
  const currentMermaidDiagram = viewMode === 'simple' ? simpleSystemArchitectureMermaid : detailedSystemArchitectureMermaid;

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

    if (systemArchitectureRef.current) {
      renderDiagram(currentMermaidDiagram, systemArchitectureRef, setSystemArchitectureDiagram);
    }
  }, [zoomLevel, viewMode, currentMermaidDiagram]);

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>システムアーキテクチャ</h1>
            <p className="specification-description">
              出産支援パーソナルアプリケーションのシステムアーキテクチャについて説明します。
            </p>
          </div>

          <div className="specification-section">
            <div className="specification-section-header">
              <h2>システム全体アーキテクチャ</h2>
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
                  ref={systemArchitectureRef}
                  style={{ 
                    opacity: systemArchitectureDiagram ? 1 : 0, 
                    visibility: systemArchitectureDiagram ? 'visible' : 'hidden',
                    transition: 'opacity 0.3s ease-in' 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="specification-section">
            <h2>アプリケーション構造</h2>
            
            <h3>アプリケーションルート</h3>
            <ul>
              <li><strong>App.jsx</strong>: ルーティング定義とアプリケーションのエントリーポイント</li>
              <li><strong>AuthProvider</strong>: 認証コンテキストを提供（useAuthフックで利用）</li>
              <li><strong>React Router</strong>: クライアントサイドルーティング管理</li>
            </ul>
            
            <h3>レイアウトコンポーネント</h3>
            <ul>
              <li><strong>Layout</strong>: 認証後の共通レイアウト（Sidebar、SubMenuを含む）</li>
              <li><strong>Sidebar</strong>: サイドバーナビゲーション（メインメニュー）</li>
              <li><strong>SubMenu</strong>: サブメニュー（各ページのサブナビゲーション）</li>
              <li><strong>ProtectedRoute</strong>: 認証保護ルート（未認証ユーザーをログインページにリダイレクト）</li>
            </ul>
            
            <h3>認証コンポーネント</h3>
            <ul>
              <li><strong>Login</strong>: ログインページ（Google OAuth認証）</li>
              <li><strong>AccountSwitcher</strong>: アカウント切り替え機能</li>
              <li><strong>SharingSettings</strong>: アカウント共有設定</li>
              <li><strong>Invitations</strong>: 招待管理（招待の送信・承認）</li>
            </ul>
            
            <h3>ページコンポーネント</h3>
            <ul>
              <li><strong>MyPage</strong>: マイページ（ユーザー情報の管理）</li>
              <li><strong>SupportSystems</strong>: 支援制度一覧（カード表示・テーブル表示）</li>
              <li><strong>ActionManagement</strong>: アクション管理（申請予定の制度管理、ガントチャート、カレンダー表示）</li>
              <li><strong>Search</strong>: 検索機能（支援制度の検索）</li>
              <li><strong>AIAssistant</strong>: AIアシスタント（質問応答）</li>
              <li><strong>ElectronicMaternalHandbook</strong>: 電子母子手帳（健診記録の管理）</li>
              <li><strong>Statistics</strong>: 統計情報（カテゴリ別の統計）</li>
              <li><strong>PaymentAmount</strong>: 収支概算</li>
            </ul>
            
            <h3>詳細ページ</h3>
            <ul>
              <li><strong>LumpSumDetail</strong>: 出産育児一時金の詳細（Mermaid図による可視化）</li>
              <li><strong>ChildcareLeaveDetail</strong>: 育児休業給付金の詳細</li>
              <li><strong>ChildbirthAllowanceDetail</strong>: 出産手当金の詳細</li>
              <li><strong>ChildAllowanceDetail</strong>: 児童手当の詳細</li>
              <li><strong>その他詳細ページ</strong>: 産後パパ育休、出生後休業支援給付金、育児時短就業給付金、伴走型相談支援と妊婦支援給付</li>
            </ul>
            
            <h3>カスタムフック</h3>
            <ul>
              <li><strong>useAuth</strong>: 認証状態管理（currentUser、signInWithGoogle、logout）</li>
              <li><strong>useOwnerId</strong>: オーナーID管理（共有アカウント対応）</li>
              <li><strong>useSupportSystems</strong>: 支援制度データ取得（Firestoreから取得）</li>
              <li><strong>useSidebarState</strong>: サイドバー状態管理（開閉状態の管理）</li>
            </ul>
          </div>
          
          <div className="specification-section">
            <h2>ホスティング</h2>
            <ul>
              <li><strong>Firebase Hosting</strong>: 静的サイトホスティングサービス（Reactアプリケーションをデプロイ）</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>認証・セキュリティ</h2>
            <ul>
              <li><strong>Firebase Authentication</strong>: Google OAuthによるユーザー認証</li>
              <li><strong>Firestore Security Rules</strong>: Firestoreへのアクセス制御（ユーザーごとのデータ分離）</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>Firebaseサービス</h2>
            
            <h3>Firestore（NoSQLデータベース）</h3>
            <ul>
              <li><strong>支援制度データ</strong>: マスターデータ（制度の基本情報、支給金額、対象者など）</li>
              <li><strong>ユーザーデータ</strong>: プロフィール情報（表示名、メールアドレスなど）</li>
              <li><strong>アクションデータ</strong>: 申請予定の制度管理（ステータス、申請期限など）</li>
              <li><strong>健診記録</strong>: 電子母子手帳のデータ（診察日、診察内容など）</li>
              <li><strong>共有アカウント</strong>: アカウント共有設定（共有ユーザー、権限など）</li>
            </ul>
            
            <h3>Firebase Storage</h3>
            <ul>
              <li><strong>プロフィール画像</strong>: ユーザーのプロフィール画像</li>
              <li><strong>その他のファイル</strong>: 必要に応じて保存されるファイル</li>
            </ul>
            
            <h3>Firebase Authentication</h3>
            <ul>
              <li><strong>Google OAuth認証</strong>: Googleアカウントによる認証</li>
            </ul>
            
            <h3>Firestore Security Rules</h3>
            <ul>
              <li><strong>アクセス制御</strong>: ユーザーごとのデータ分離とアクセス権限の管理</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>ライブラリ・ツール</h2>
            <ul>
              <li><strong>Mermaid.js</strong>: 図表の可視化（支援制度の仕組みや申請フローの可視化）</li>
              <li><strong>React Router</strong>: クライアントサイドルーティング</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>データフロー</h2>
            <ol>
              <li>ユーザーがブラウザでアプリケーションにアクセス</li>
              <li>Firebase HostingからReactアプリケーションが配信される</li>
              <li>Firebase AuthenticationでGoogle OAuth認証を行う</li>
              <li>認証後、Firestoreからユーザーデータや支援制度データを取得</li>
              <li>Mermaid.jsを使用して図表を動的にレンダリング</li>
              <li>ユーザーの操作に応じてFirestoreにデータを保存・更新</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationSystemArchitecture;

