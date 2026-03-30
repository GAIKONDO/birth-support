import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationDataStructure = () => {
  const [dataStructureDiagram, setDataStructureDiagram] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState('simple'); // 'simple' or 'detailed'
  const dataStructureRef = useRef(null);
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

  // シンプル版データ構造図
  const simpleDataStructureMermaid = `
    erDiagram
      SUPPORT_SYSTEM {
        string id PK
        string title
        string category
      }
      
      USER {
        string uid PK
        string email
      }
      
      ACTION {
        string id PK
        string userId FK
        string systemId FK
        string status
      }
      
      SHARED_ACCOUNT {
        string id PK
        string ownerId FK
        string sharedUserId FK
      }
      
      SUPPORT_SYSTEM ||--o{ ACTION : "has"
      USER ||--o{ ACTION : "creates"
      USER ||--o{ SHARED_ACCOUNT : "owns"
      USER ||--o{ SHARED_ACCOUNT : "shares"
  `;

  // 詳細版データ構造図
  const detailedDataStructureMermaid = `
    erDiagram
      SUPPORT_SYSTEM {
        string id PK "一意の識別子（主キー）"
        string title "制度名"
        string description "制度の概要"
        string category "カテゴリ（国の制度、都道府県の制度、市区町村の制度、民間の制度、勤務先の制度）"
        string amount "支給額の情報"
        string eligibility "対象となる条件"
        string deadline "申請可能な期間"
        string ministryName "所管省庁名（国の制度の場合）"
        string prefectureName "都道府県名（都道府県の制度の場合）"
        string municipalityName "市区町村名（市区町村の制度の場合）"
        string organizationName "組織名（民間の制度の場合）"
        string companyName "会社名（勤務先の制度の場合）"
        string referenceUrl "参考URL"
        boolean isActive "有効フラグ"
      }
      
      USER {
        string uid PK "ユーザーID（主キー）"
        string email "メールアドレス"
        string displayName "表示名"
        string photoURL "プロフィール画像URL"
      }
      
      ACTION {
        string id PK "アクションID（主キー）"
        string userId FK "ユーザーID（外部キー）"
        string systemId FK "支援制度ID（外部キー）"
        string status "ステータス（pending, in-progress, completed）"
        date dueDate "申請期限"
        date createdAt "作成日時"
        date updatedAt "更新日時"
      }
      
      SHARED_ACCOUNT {
        string id PK "共有アカウントID（主キー）"
        string ownerId FK "所有者ID（外部キー）"
        string sharedUserId FK "共有ユーザーID（外部キー）"
        string permission "権限（viewer, editor）"
        date createdAt "作成日時"
      }
      
      SUPPORT_SYSTEM ||--o{ ACTION : "has"
      USER ||--o{ ACTION : "creates"
      USER ||--o{ SHARED_ACCOUNT : "owns"
      USER ||--o{ SHARED_ACCOUNT : "shares"
  `;

  // 現在の表示モードに応じたMermaid図を取得
  const currentDataStructureDiagram = viewMode === 'simple' ? simpleDataStructureMermaid : detailedDataStructureMermaid;

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

    if (dataStructureRef.current) {
      renderDiagram(currentDataStructureDiagram, dataStructureRef, setDataStructureDiagram);
    }
  }, [zoomLevel, viewMode, currentDataStructureDiagram]);

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>データ構造</h1>
            <p className="specification-description">
              出産支援パーソナルアプリケーションのデータベース構造について説明します。
            </p>
          </div>

          <div className="specification-section">
            <div className="specification-section-header">
              <h2>ER図</h2>
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
                  ref={dataStructureRef}
                  style={{ 
                    opacity: dataStructureDiagram ? 1 : 0, 
                    visibility: dataStructureDiagram ? 'visible' : 'hidden',
                    transition: 'opacity 0.3s ease-in' 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="specification-section">
            <h2>エンティティ説明</h2>
            
            <h3>SUPPORT_SYSTEM（支援制度）</h3>
            <ul>
              <li><strong>id</strong>: 一意の識別子（主キー）</li>
              <li><strong>title</strong>: 制度名</li>
              <li><strong>description</strong>: 制度の概要</li>
              <li><strong>category</strong>: カテゴリ（国の制度、都道府県の制度、市区町村の制度、民間の制度、勤務先の制度）</li>
              <li><strong>amount</strong>: 支給額の情報</li>
              <li><strong>eligibility</strong>: 対象となる条件</li>
              <li><strong>deadline</strong>: 申請可能な期間</li>
              <li><strong>ministryName</strong>: 所管省庁名（国の制度の場合）</li>
              <li><strong>prefectureName</strong>: 都道府県名（都道府県の制度の場合）</li>
              <li><strong>municipalityName</strong>: 市区町村名（市区町村の制度の場合）</li>
              <li><strong>organizationName</strong>: 組織名（民間の制度の場合）</li>
              <li><strong>companyName</strong>: 会社名（勤務先の制度の場合）</li>
              <li><strong>referenceUrl</strong>: 参考URL</li>
              <li><strong>isActive</strong>: 有効フラグ</li>
            </ul>

            <h3>USER（ユーザー）</h3>
            <ul>
              <li><strong>uid</strong>: ユーザーID（主キー）</li>
              <li><strong>email</strong>: メールアドレス</li>
              <li><strong>displayName</strong>: 表示名</li>
              <li><strong>photoURL</strong>: プロフィール画像URL</li>
            </ul>

            <h3>ACTION（アクション）</h3>
            <ul>
              <li><strong>id</strong>: アクションID（主キー）</li>
              <li><strong>userId</strong>: ユーザーID（外部キー）</li>
              <li><strong>systemId</strong>: 支援制度ID（外部キー）</li>
              <li><strong>status</strong>: ステータス（pending, in-progress, completed）</li>
              <li><strong>dueDate</strong>: 申請期限</li>
              <li><strong>createdAt</strong>: 作成日時</li>
              <li><strong>updatedAt</strong>: 更新日時</li>
            </ul>

            <h3>SHARED_ACCOUNT（共有アカウント）</h3>
            <ul>
              <li><strong>id</strong>: 共有アカウントID（主キー）</li>
              <li><strong>ownerId</strong>: 所有者ID（外部キー）</li>
              <li><strong>sharedUserId</strong>: 共有ユーザーID（外部キー）</li>
              <li><strong>permission</strong>: 権限（viewer, editor）</li>
              <li><strong>createdAt</strong>: 作成日時</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationDataStructure;

