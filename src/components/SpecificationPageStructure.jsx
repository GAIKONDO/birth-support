import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationPageStructure = () => {
  const [pageStructureDiagram, setPageStructureDiagram] = useState(null);
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

    if (pageStructureRef.current) {
      renderDiagram(pageStructureMermaid, pageStructureRef, setPageStructureDiagram);
    }
  }, []);

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>ページ構成</h1>
            <p className="specification-description">
              出産支援パーソナルアプリケーションのページ構成について説明します。
            </p>
          </div>

          <div className="specification-section">
            <h2>ページ構成図</h2>
            <div className="mermaid-container" ref={pageStructureRef}></div>
          </div>

          <div className="specification-section">
            <h2>認証前ページ</h2>
            <ul>
              <li><strong>ホーム</strong>: トップページ</li>
              <li><strong>サービス概要</strong>: サービスの説明</li>
              <li><strong>会社概要</strong>: 会社情報</li>
              <li><strong>利用金額</strong>: 料金プラン</li>
              <li><strong>登録方法</strong>: ユーザー登録の手順</li>
              <li><strong>マイページ（ログイン）</strong>: ログインページ</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>認証後ページ</h2>
            <ul>
              <li><strong>マイページ</strong>: ユーザー情報の管理</li>
              <li><strong>統計情報</strong>: 支援制度の統計情報
                <ul>
                  <li>支給金額: 支給金額の一覧</li>
                  <li>統計情報詳細: カテゴリ別の統計</li>
                </ul>
              </li>
              <li><strong>出産支援制度</strong>: 支援制度の一覧表示
                <ul>
                  <li>制度詳細ページ: 各制度の詳細情報（出産育児一時金、育児休業給付金、出産手当金、児童手当など）</li>
                </ul>
              </li>
              <li><strong>アクション管理</strong>: 申請予定の制度管理</li>
              <li><strong>検索</strong>: 支援制度の検索</li>
              <li><strong>AIアシスタント</strong>: AIによる質問応答</li>
              <li><strong>電子母子手帳</strong>: 母子手帳の電子化
                <ul>
                  <li>健診記録詳細: 各健診記録の詳細</li>
                </ul>
              </li>
              <li><strong>仕様書</strong>: アプリケーションの仕様</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationPageStructure;

