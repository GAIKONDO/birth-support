import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import './Specification.css';

const Specification = () => {
  const [techStackDiagram, setTechStackDiagram] = useState(null);
  const [dataStructureDiagram, setDataStructureDiagram] = useState(null);
  const [pageStructureDiagram, setPageStructureDiagram] = useState(null);
  const techStackRef = useRef(null);
  const dataStructureRef = useRef(null);
  const pageStructureRef = useRef(null);

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
        diagramPadding: 20
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

  // 技術スタックアーキテクチャ図
  const techStackMermaid = `
    C4Context
      title 出産支援パーソナルアプリケーション システムアーキテクチャ
      
      Person(user, "ユーザー", "妊娠・出産・育児に関する支援制度を利用する方")
      
      System(app, "出産支援パーソナルアプリ", "支援制度の情報管理と申請サポートを行うWebアプリケーション")
      
      System_Ext(firebase, "Firebase Platform", "Googleが提供するBaaSプラットフォーム")
      
      SystemDb_Ext(firestore, "Firestore", "NoSQLデータベース<br/>支援制度データ、ユーザーデータ、アクションデータを保存")
      
      System_Ext(auth, "Firebase Authentication", "ユーザー認証サービス<br/>Google認証、メール認証を提供")
      
      System_Ext(hosting, "Firebase Hosting", "静的サイトホスティングサービス<br/>Reactアプリケーションをデプロイ")
      
      Rel(user, app, "利用する", "HTTPS")
      Rel(app, firebase, "利用する")
      Rel(app, firestore, "データの読み書き", "Firestore API")
      Rel(app, auth, "認証処理", "Authentication API")
      Rel(hosting, app, "ホスティング", "静的ファイル配信")
      
      UpdateElementStyle(firebase, $bgColor="#dcfce7", $borderColor="#16a34a")
      UpdateElementStyle(firestore, $bgColor="#dcfce7", $borderColor="#16a34a")
      UpdateElementStyle(auth, $bgColor="#dcfce7", $borderColor="#16a34a")
      UpdateElementStyle(hosting, $bgColor="#fef3c7", $borderColor="#d97706")
      UpdateElementStyle(app, $bgColor="#e0e7ff", $borderColor="#6366f1")
      UpdateElementStyle(user, $bgColor="#fce7f3", $borderColor="#6b7280")
  `;

  // データ構造図
  const dataStructureMermaid = `
    erDiagram
      SUPPORT_SYSTEM {
        string id PK
        string title
        string description
        string category
        string amount
        string eligibility
        string deadline
        string ministryName
        string prefectureName
        string municipalityName
        string organizationName
        string companyName
        string referenceUrl
        boolean isActive
      }
      
      USER {
        string uid PK
        string email
        string displayName
        string photoURL
      }
      
      ACTION {
        string id PK
        string userId FK
        string systemId FK
        string status
        date dueDate
        date createdAt
        date updatedAt
      }
      
      SHARED_ACCOUNT {
        string id PK
        string ownerId FK
        string sharedUserId FK
        string permission
        date createdAt
      }
      
      SUPPORT_SYSTEM ||--o{ ACTION : "has"
      USER ||--o{ ACTION : "creates"
      USER ||--o{ SHARED_ACCOUNT : "owns"
      USER ||--o{ SHARED_ACCOUNT : "shares"
  `;

  // ページ構成図
  const pageStructureMermaid = `
    graph TB
      A[アプリケーション] --> B[認証前ページ]
      A --> C[認証後ページ]
      
      B --> B1[ホーム]
      B --> B2[サービス概要]
      B --> B3[会社概要]
      B --> B4[利用金額]
      B --> B5[登録方法]
      B --> B6[マイページ<br/>ログイン]
      
      C --> C1[マイページ]
      C --> C2[統計情報]
      C --> C3[出産支援制度]
      C --> C4[アクション管理]
      C --> C5[検索]
      C --> C6[AIアシスタント]
      C --> C7[電子母子手帳]
      C --> C8[仕様書]
      
      C2 --> C2_1[支給金額]
      C2 --> C2_2[統計情報詳細]
      
      C3 --> C3_1[制度詳細ページ]
      C3_1 --> C3_1_1[出産育児一時金]
      C3_1 --> C3_1_2[育児休業給付金]
      C3_1 --> C3_1_3[出産手当金]
      C3_1 --> C3_1_4[児童手当]
      C3_1 --> C3_1_5[その他制度]
      
      C7 --> C7_1[健診記録詳細]
      
      style A fill:#667eea,stroke:#4c51bf,stroke-width:3px,color:#fff
      style B fill:#fce7f3,stroke:#6b7280,stroke-width:2px
      style C fill:#dcfce7,stroke:#16a34a,stroke-width:2px
      style B1 fill:#e0e7ff,stroke:#6366f1,stroke-width:2px
      style B2 fill:#e0e7ff,stroke:#6366f1,stroke-width:2px
      style B3 fill:#e0e7ff,stroke:#6366f1,stroke-width:2px
      style B4 fill:#e0e7ff,stroke:#6366f1,stroke-width:2px
      style B5 fill:#e0e7ff,stroke:#6366f1,stroke-width:2px
      style B6 fill:#e0e7ff,stroke:#6366f1,stroke-width:2px
      style C1 fill:#fef3c7,stroke:#d97706,stroke-width:2px
      style C2 fill:#fef3c7,stroke:#d97706,stroke-width:2px
      style C3 fill:#fef3c7,stroke:#d97706,stroke-width:2px
      style C4 fill:#fef3c7,stroke:#d97706,stroke-width:2px
      style C5 fill:#fef3c7,stroke:#d97706,stroke-width:2px
      style C6 fill:#fef3c7,stroke:#d97706,stroke-width:2px
      style C7 fill:#fef3c7,stroke:#d97706,stroke-width:2px
      style C8 fill:#fef3c7,stroke:#d97706,stroke-width:2px
  `;

  // Mermaid図のレンダリング
  useEffect(() => {
    const renderDiagram = async (mermaidCode, ref, setState) => {
      if (!ref.current) return;
      
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        ref.current.innerHTML = svg;
        setState(true);
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    };

    if (techStackRef.current) {
      renderDiagram(techStackMermaid, techStackRef, setTechStackDiagram);
    }
    if (dataStructureRef.current) {
      renderDiagram(dataStructureMermaid, dataStructureRef, setDataStructureDiagram);
    }
    if (pageStructureRef.current) {
      renderDiagram(pageStructureMermaid, pageStructureRef, setPageStructureDiagram);
    }
  }, []);

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>仕様書</h1>
            <p className="specification-description">
              本アプリケーションの仕様について記載しています。
            </p>
          </div>

          <div className="specification-section">
            <h2>概要</h2>
            <p>
              出産支援パーソナルアプリケーションは、妊娠・出産・育児に関する各種支援制度の情報を一元管理し、
              ユーザーが適切な支援を受けられるようサポートするWebアプリケーションです。
            </p>
          </div>

          <div className="specification-section">
            <h2>主要機能</h2>
            <ul>
              <li>出産支援制度の検索・閲覧</li>
              <li>支援制度の詳細情報表示（Mermaid図による可視化）</li>
              <li>アクション管理（申請予定の制度管理）</li>
              <li>統計情報の表示</li>
              <li>電子母子手帳機能</li>
              <li>AIアシスタント機能</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>技術スタック</h2>
            <div className="mermaid-container" ref={techStackRef}></div>
          </div>

          <div className="specification-section">
            <h2>データ構造</h2>
            <div className="mermaid-container" ref={dataStructureRef}></div>
          </div>

          <div className="specification-section">
            <h2>ページ構成</h2>
            <div className="mermaid-container" ref={pageStructureRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Specification;

