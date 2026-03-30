import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import './Specification.css';

const SpecificationBusinessPlan = () => {
  const [businessPlanDiagram, setBusinessPlanDiagram] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState('simple'); // 'simple' or 'detailed'
  const businessPlanRef = useRef(null);
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

  // シンプル版ビジネスプラン図
  const simpleBusinessPlanMermaid = `
    flowchart LR
      Advertiser[広告主<br/>企業] -->|広告費| Provider[運営会社<br/>出産支援パーソナルアプリ提供]
      Partner[知育・塾パートナー<br/>教育サービス] -->|紹介手数料| Provider
      Insurance[保険パートナー<br/>乳児・児童保険<br/>学生保険<br/>学業費用保険] -->|紹介手数料<br/>代行手数料| Provider
      MedicalPartner[医療・ヘルスケアパートナー<br/>薬・予防接種<br/>遺伝子検査<br/>アレルギー検査] -->|紹介手数料<br/>代行手数料| Provider
      EC[ECリファラル<br/>アフィリエイト<br/>商品紹介] -->|リファラル手数料| Provider
      Matching[家政婦・専門教師<br/>マッチング<br/>サービス提供者] -->|マッチング手数料| Provider
      Renovation[リフォームパートナー<br/>子育て対応リフォーム<br/>業者紹介斡旋<br/>デザイン相談] -->|紹介手数料| Provider
      Album[アルバム制作パートナー<br/>アルバム制作サービス<br/>写真整理・編集<br/>フォトブック作成] -->|紹介手数料| Provider
      
      Provider -->|直接提供| PremiumUser[個人ユーザー<br/>プレミアムプラン<br/>月額/年額]
      Provider -->|直接提供| DirectUser[エンドユーザー<br/>無料で利用]
      Provider -->|B2B提供| Company[企業<br/>従業員向け福利厚生]
      Provider -->|B2B提供| Municipality[自治体<br/>住民向けサービス]
      Provider -->|認定取得支援サービス提供| Certification[認定取得支援<br/>くるみん認定取得支援<br/>健康経営優良法人認定取得支援<br/>企業向け]
      
      Company -->|提供| CompanyEmployee[企業の従業員<br/>エンドユーザー]
      Municipality -->|提供| Resident[自治体の住民<br/>エンドユーザー]
      
      PremiumUser -->|月額/年額| Provider
      Company -->|企業契約| Provider
      Company -->|認定取得支援利用| Certification
      Certification -->|認定取得支援手数料| Provider
      Municipality -->|自治体契約| Provider
      
      style Provider fill:#e0e7ff,stroke:#667eea,stroke-width:3px
      style DirectUser fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style PremiumUser fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style Company fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style Municipality fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style CompanyEmployee fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style Resident fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style Advertiser fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style Partner fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style Insurance fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style MedicalPartner fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style EC fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style Matching fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style Renovation fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style Album fill:#e0f2fe,stroke:#0ea5e9,stroke-width:2px
      style Certification fill:#fce7f3,stroke:#ec4899,stroke-width:2px
  `;

  // 詳細版ビジネスプラン図
  const detailedBusinessPlanMermaid = `
    flowchart LR
      subgraph Revenue["収益源"]
        Advertiser[広告主<br/>企業広告<br/>バナー広告・記事広告<br/>月額10万円〜]
        Partner[知育・塾パートナー<br/>教育サービス連携<br/>紹介1件あたり1,000円<br/>継続利用で月額手数料]
        Insurance[保険パートナー<br/>乳児・児童保険<br/>学生保険（小中高大）<br/>学業費用保険<br/>紹介1件あたり1,000円<br/>代行手数料]
        MedicalPartner[医療・ヘルスケアパートナー<br/>薬の紹介・相談<br/>予防接種の案内<br/>遺伝子検査の紹介<br/>アレルギー検査の紹介<br/>紹介1件あたり1,000円<br/>代行手数料]
        EC[ECリファラル<br/>アフィリエイト<br/>育児用品・ベビー用品<br/>商品購入1件あたり<br/>売上高の3〜10%]
        Matching[家政婦・専門教師<br/>マッチング<br/>家政婦・家事代行<br/>専門教師・家庭教師<br/>マッチング1件あたり<br/>料金の10〜20%]
        Renovation[リフォームパートナー<br/>子育て対応リフォーム<br/>業者紹介斡旋<br/>デザイン相談<br/>紹介1件あたり50,000円]
        Album[アルバム制作パートナー<br/>アルバム制作サービス<br/>写真整理・編集<br/>フォトブック作成<br/>紹介1件あたり30,000円]
      end
      
      Provider[運営会社<br/>出産支援パーソナルアプリ提供<br/>プラットフォーム運営<br/>AIアシスタントによる<br/>伴走型育児支援・アドバイス]
      
      subgraph B2B["B2B提供モデル"]
        Agency[申請代行サービス<br/>自治体・企業向け<br/>1件あたり3,000円〜<br/>書類作成・提出代行]
        InsuranceAgency[保険代行サービス<br/>保険加入手続き代行<br/>1件あたり5,000円〜<br/>保険申請・手続き代行]
        MedicalAgency[医療サービス代行<br/>薬・検査の紹介・手続き代行<br/>1件あたり4,000円〜<br/>医療機関連携・手続き代行]
        Certification[認定取得支援<br/>企業向け<br/>くるみん認定取得支援<br/>次世代育成支援対策推進法に基づく認定マーク<br/>健康経営優良法人認定取得支援<br/>認定取得支援1件あたり100,000円]
        Company[企業<br/>従業員向け福利厚生<br/>カスタマイズ対応]
        Municipality[自治体<br/>住民向けサービス<br/>自治体ロゴ・カスタマイズ]
        
        Company -->|申請代行サービス利用| Agency
        Municipality -->|申請代行サービス利用| Agency
        Company -->|保険代行サービス利用| InsuranceAgency
        Municipality -->|保険代行サービス利用| InsuranceAgency
        Company -->|医療サービス代行利用| MedicalAgency
        Municipality -->|医療サービス代行利用| MedicalAgency
        Company -->|認定取得支援利用| Certification
      end
      
      subgraph Direct["直接提供モデル"]
        PremiumUser[個人ユーザー<br/>プレミアムプラン<br/>月額980円/年額9,800円<br/>追加機能・優先サポート<br/>AIアシスタント伴走型育児支援]
      end
      
      subgraph EndUsers["エンドユーザー"]
        DirectUser[エンドユーザー<br/>無料で利用<br/>基本機能すべて利用可能<br/>AIアシスタント基本機能]
        CompanyEmployee[企業の従業員<br/>エンドユーザー<br/>基本機能すべて利用可能]
        Resident[自治体の住民<br/>エンドユーザー<br/>基本機能すべて利用可能]
      end
      
      Advertiser -->|広告費<br/>CPM/CPC| Provider
      Partner -->|紹介手数料<br/>継続手数料| Provider
      Insurance -->|紹介手数料<br/>代行手数料| Provider
      MedicalPartner -->|紹介手数料<br/>代行手数料| Provider
      EC -->|リファラル手数料<br/>売上高の3〜10%| Provider
      Matching -->|マッチング手数料<br/>料金の10〜20%| Provider
      Renovation -->|紹介手数料<br/>1件あたり50,000円| Provider
      Album -->|紹介手数料<br/>1件あたり30,000円| Provider
      
      Provider -->|企業契約<br/>月額従業員1人あたり500円| Company
      Provider -->|自治体契約<br/>月額利用者1人あたり300円| Municipality
      Provider -->|申請代行サービス提供| Agency
      Provider -->|保険代行サービス提供| InsuranceAgency
      Provider -->|医療サービス代行提供| MedicalAgency
      Provider -->|認定取得支援サービス提供| Certification
      Provider -->|有料提供| PremiumUser
      Provider -->|無料提供| DirectUser
      
      Company -->|福利厚生として提供| CompanyEmployee
      Municipality -->|住民サービスとして提供| Resident
      
      PremiumUser -->|月額/年額課金| Provider
      Company -->|企業契約<br/>従業員数ベース| Provider
      Municipality -->|自治体契約<br/>利用者数ベース| Provider
      Agency -->|代行手数料<br/>成功報酬型| Provider
      InsuranceAgency -->|代行手数料<br/>成功報酬型| Provider
      MedicalAgency -->|代行手数料<br/>成功報酬型| Provider
      Certification -->|認定取得支援手数料<br/>1件あたり100,000円| Provider
      
      style Provider fill:#e0e7ff,stroke:#667eea,stroke-width:3px
      style DirectUser fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style PremiumUser fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style Company fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style Municipality fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style CompanyEmployee fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style Resident fill:#d1fae5,stroke:#10b981,stroke-width:2px
      style Advertiser fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style Partner fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style Insurance fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style MedicalPartner fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style EC fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style Matching fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style Renovation fill:#fce7f3,stroke:#ec4899,stroke-width:2px
      style Album fill:#e0f2fe,stroke:#0ea5e9,stroke-width:2px
      style Certification fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style Agency fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style InsuranceAgency fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
      style MedicalAgency fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
  `;

  const currentBusinessPlanDiagram = viewMode === 'simple' ? simpleBusinessPlanMermaid : detailedBusinessPlanMermaid;

  // Mermaid図のレンダリング
  useEffect(() => {
    if (!businessPlanRef.current) return;

    const renderDiagram = async () => {
      // レンダリング前にコンテナをクリア
      businessPlanRef.current.innerHTML = '';
      
      try {
        const id = `business-plan-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, currentBusinessPlanDiagram);
        
        if (businessPlanRef.current) {
          businessPlanRef.current.innerHTML = svg;
          
          // SVG要素にスタイルを適用
          const svgElement = businessPlanRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.transform = `scale(${zoomLevel})`;
            svgElement.style.transformOrigin = 'top left';
            svgElement.style.transition = 'transform 0.2s ease-out';
            svgElement.style.willChange = 'transform';
          }
        }
      } catch (error) {
        console.error('Mermaid diagram rendering error:', error);
        if (businessPlanRef.current) {
          businessPlanRef.current.innerHTML = '<p style="color: red; padding: 20px;">図の読み込みに失敗しました。ページを再読み込みしてください。</p>';
        }
      }
    };

    renderDiagram();
  }, [currentBusinessPlanDiagram, viewMode, zoomLevel]);

  // ズームイン
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  };

  // ズームアウト
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  // ズームリセット
  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  // 全画面表示
  const handleFullscreen = async () => {
    if (!fullscreenRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await fullscreenRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>ビジネスモデル</h1>
            <p className="specification-description">
              出産支援パーソナルアプリケーションの提供方法とマネタイズ方法について説明します。
            </p>
          </div>

          <div className="specification-section">
            <h2>ビジネスモデル</h2>
            <p>
              本アプリケーションは、エンドユーザーが無料で利用できることを基本方針とし、
              企業・自治体・パートナー企業からの収益により運営されます。
            </p>
          </div>

          <div className="mermaid-chart-wrapper" ref={fullscreenRef}>
            <div className="diagram-controls-fullscreen">
              <div className="diagram-header">
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
                  <button className="zoom-button" onClick={handleZoomOut} title="縮小">-</button>
                  <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                  <button className="zoom-button" onClick={handleZoomIn} title="拡大">+</button>
                  <button className="zoom-button" onClick={handleZoomReset} title="リセット">リセット</button>
                  <button 
                    className="fullscreen-button" 
                    onClick={handleFullscreen}
                    title={isFullscreen ? '全画面を閉じる' : '全画面表示'}
                  >
                    {isFullscreen ? '✕' : '⛶'}
                  </button>
                </div>
              </div>
            </div>
            <div className="mermaid-container" ref={businessPlanRef}></div>
          </div>

          <div className="specification-section">
            <h2>提供方法</h2>
            
            <h3>1. エンドユーザー向け（無料）</h3>
            <p>
              個人ユーザーは基本機能を無料で利用できます。支援制度の検索、申請期限の管理、
              アクション管理、電子母子手帳などの主要機能をすべて無料でご利用いただけます。
            </p>

            <h3>2. 個人SaaS（プレミアムプラン）</h3>
            <p>
              より高度な機能や優先サポートが必要な個人ユーザー向けに、プレミアムプランを提供します。
              月額980円または年額9,800円で、以下の追加機能をご利用いただけます：
            </p>
            <ul>
              <li>AIアシスタントの高度な機能</li>
              <li>優先的なカスタマーサポート</li>
              <li>詳細な統計情報の閲覧</li>
              <li>カスタムレポートの生成</li>
            </ul>

            <h3>3. 企業向け提供</h3>
            <p>
              企業の従業員向け福利厚生として、本アプリケーションを提供します。
              月額従業員1人あたり500円で、以下のサービスを提供します：
            </p>
            <ul>
              <li>企業ロゴのカスタマイズ</li>
              <li>企業独自の支援制度情報の追加</li>
              <li>従業員の利用状況レポート</li>
              <li>専任サポート担当者の配置</li>
            </ul>

            <h3>4. 自治体向け提供</h3>
            <p>
              市区町村などの自治体が住民向けサービスとして本アプリケーションを提供できます。
              月額利用者1人あたり300円で、以下のサービスを提供します：
            </p>
            <ul>
              <li>自治体ロゴのカスタマイズ</li>
              <li>自治体独自の支援制度情報の追加</li>
              <li>住民の利用状況レポート</li>
              <li>自治体向け専用サポート</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>マネタイズ方法</h2>

            <h3>1. 広告収益</h3>
            <p>
              企業のバナー広告や記事広告を掲載し、広告収益を得ます。
              月額10万円から、CPM（インプレッション単価）やCPC（クリック単価）ベースでの課金が可能です。
            </p>

            <h3>2. 知育・塾パートナー連携</h3>
            <p>
              知育サービスや学習塾などの教育サービスと連携し、ユーザーを紹介した際に
              紹介手数料（1件あたり1,000円）や継続利用に伴う月額手数料を受け取ります。
            </p>

            <h3>3. 申請代行サービス</h3>
            <p>
              支援制度の申請手続きを代行する有料サービスを提供します。
              1件あたり3,000円から、書類作成から提出までを代行します。
              成功報酬型の料金体系も選択可能です。
            </p>

            <h3>4. 保険の紹介・代行サービス</h3>
            <p>
              乳児・児童向けの保険、小学校から大学生までの学生保険、学業費用保険などの
              保険パートナーと連携し、ユーザーへの保険紹介および加入手続きの代行サービスを提供します。
              紹介1件あたり1,000円、保険加入手続きの代行は1件あたり5,000円からとなります。
              以下の保険商品を取り扱います：
            </p>
            <ul>
              <li><strong>乳児・児童保険</strong>：0歳から小学生までの子どもを対象とした保険</li>
              <li><strong>学生保険</strong>：小学校から大学までの学生を対象とした保険</li>
              <li><strong>学業費用保険</strong>：教育費に特化した保険商品</li>
            </ul>

            <h3>5. 医療・ヘルスケアパートナー連携</h3>
            <p>
              薬の紹介、予防接種の案内、遺伝子検査、アレルギー検査などの医療・ヘルスケアパートナーと連携し、
              ユーザーへの紹介および手続き代行サービスを提供します。
              紹介1件あたり1,000円、医療サービス手続きの代行は1件あたり4,000円からとなります。
              以下のサービスを取り扱います：
            </p>
            <ul>
              <li><strong>薬の紹介・相談</strong>：妊娠中・育児中の薬に関する情報提供と相談サービス</li>
              <li><strong>予防接種の案内</strong>：乳児・幼児・学童期の予防接種スケジュール管理と案内</li>
              <li><strong>遺伝子検査の紹介</strong>：遺伝子検査サービスの紹介と手続き代行</li>
              <li><strong>アレルギー検査の紹介</strong>：アレルギー検査サービスの紹介と手続き代行</li>
            </ul>

            <h3>6. ECリファラル（アフィリエイト）</h3>
            <p>
              育児用品、ベビー用品、マタニティ用品などのECサイトと連携し、
              ユーザーが商品を購入した際にリファラル手数料（売上高の3〜10%）を受け取ります。
              アプリ内で商品を紹介し、ユーザーが購入に至った場合に収益が発生します。
            </p>
            <ul>
              <li><strong>育児用品</strong>：ベビーカー、チャイルドシート、ベビーベッドなど</li>
              <li><strong>ベビー用品</strong>：おむつ、ミルク、離乳食、おもちゃなど</li>
              <li><strong>マタニティ用品</strong>：マタニティウェア、授乳用品など</li>
              <li><strong>その他</strong>：育児に関連する商品全般</li>
            </ul>

            <h3>7. 家政婦・専門教師のマッチング</h3>
            <p>
              育児中の家庭を支援するため、家政婦・家事代行サービスや専門教師・家庭教師との
              マッチングサービスを提供します。ユーザーとサービス提供者をマッチングし、
              マッチング成立時に手数料（料金の10〜20%）を受け取ります。
            </p>
            <ul>
              <li><strong>家政婦・家事代行</strong>：掃除、洗濯、料理などの家事代行サービス</li>
              <li><strong>専門教師・家庭教師</strong>：子どもの学習支援、習い事の指導など</li>
              <li><strong>ベビーシッター</strong>：一時的な育児支援サービス</li>
              <li><strong>その他</strong>：育児を支援する各種サービス</li>
            </ul>

            <h3>8. AIアシスタントによる伴走型育児支援</h3>
            <p>
              AIアシスタント機能により、24時間365日いつでも育児に関する相談やアドバイスを受けられる
              伴走型育児支援サービスを提供します。プレミアムプランでは、より高度なAIアシスタント機能と
              優先的なサポートを提供します。
            </p>
            <ul>
              <li><strong>基本機能（無料）</strong>：基本的な育児相談とアドバイス</li>
              <li><strong>プレミアム機能（有料）</strong>：詳細な育児支援、薬・予防接種・検査の紹介、継続的な伴走支援</li>
              <li><strong>パーソナライズドアドバイス</strong>：ユーザーの状況に応じた個別のアドバイス</li>
            </ul>
          </div>

          <div className="specification-section">
            <h2>収益モデルの特徴</h2>
            <ul>
              <li><strong>エンドユーザー無料</strong>：基本機能はすべて無料で提供し、ユーザー獲得を優先</li>
              <li><strong>B2B収益</strong>：企業・自治体からの契約により安定した収益を確保</li>
              <li><strong>パートナー連携</strong>：教育サービス、保険パートナー、医療・ヘルスケアパートナーとの連携により追加収益を創出</li>
              <li><strong>ECリファラル</strong>：育児用品・ベビー用品などのECサイトとの連携により、商品購入に伴うリファラル手数料を獲得</li>
              <li><strong>マッチングサービス</strong>：家政婦・専門教師などのマッチングにより、サービス利用に伴う手数料を獲得</li>
              <li><strong>申請代行</strong>：支援制度申請、保険加入手続き、医療サービス手続きの代行により高付加価値サービスを提供</li>
              <li><strong>保険紹介・代行</strong>：乳児・児童保険、学生保険、学業費用保険などの紹介・代行により単価の高い収益を獲得</li>
              <li><strong>医療・ヘルスケア紹介・代行</strong>：薬、予防接種、遺伝子検査、アレルギー検査などの紹介・代行により医療関連の収益を獲得</li>
              <li><strong>AIアシスタント伴走型育児支援</strong>：24時間365日の育児支援により、プレミアムプランの付加価値を高め、継続的な収益を確保</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationBusinessPlan;

