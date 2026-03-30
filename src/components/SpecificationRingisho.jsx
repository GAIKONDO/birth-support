import { useNavigate } from 'react-router-dom';
import './Specification.css';

const SpecificationRingisho = () => {
  const navigate = useNavigate();

  return (
    <div className="specification-page">
      <div className="specification-content-card">
        <div className="specification-content">
          <div className="specification-header">
            <h1>稟議書</h1>
            <p className="specification-description">
              出産支援パーソナルアプリ事業の新規会社設立に関する稟議書
            </p>
          </div>

          {/* 件名 */}
          <div className="specification-section">
            <h2>件名</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                出産支援パーソナルアプリ事業の新規会社設立について
              </p>
            </div>
          </div>

          {/* 目的・背景 */}
          <div className="specification-section">
            <h2>1. 目的・背景</h2>
            
            {/* 社会的背景 */}
            <div style={{ padding: '24px', backgroundColor: '#fef3c7', borderRadius: '12px', border: '2px solid #f59e0b', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px' }}>🇯🇵</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#92400e' }}>
                  少子化対策が国家的課題
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '15px', color: '#78350f', lineHeight: '1.8' }}>
                出産・育児を支援するデジタルサービスの需要が高まっています。本アプリケーションは、妊娠中から育児期まで一貫した支援を提供し、個人・企業・自治体の課題を解決する包括的なプラットフォームです。
              </p>
            </div>

            {/* 伊藤忠商事が取り組む意義 */}
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #3b82f6', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '20px' }}>
                  🏢
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e40af' }}>
                  伊藤忠商事が取り組む意義
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#1e40af' }}>総合商社としての強み</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.7' }}>
                    多様な事業領域での経験とネットワークを活かし、個人・企業・自治体を横断的に支援できる
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#1e40af' }}>社会的インパクト</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.7' }}>
                    少子化対策という国家的課題に取り組むことで、企業の社会的責任を果たし、持続可能な社会の実現に貢献
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#1e40af' }}>新規事業創出</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.7' }}>
                    DX・ヘルスケア領域での新規事業として、中長期的な成長機会を創出
                  </p>
                </div>
              </div>
            </div>

            {/* AI時代の実現可能性 */}
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #10b981', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '20px' }}>
                  🤖
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#065f46' }}>
                  AI時代によって実現できる理由
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#d1fae5', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#065f46' }}>24時間365日のサポート</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.7' }}>
                    AIアシスタントにより、育児に関する疑問や不安に即座に対応。従来の人的サポートでは不可能な規模での支援が実現
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#d1fae5', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#065f46' }}>パーソナライズされた支援</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.7' }}>
                    ユーザーの状況やニーズに応じた最適な情報提供とアドバイスを自動的に提供
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#d1fae5', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#065f46' }}>データ分析による効果測定</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.7' }}>
                    利用状況や効果を定量的に分析し、継続的な改善と最適化が可能
                  </p>
                </div>
              </div>
            </div>

            {/* 3つのステークホルダーの課題と解決策 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* 個人ユーザー */}
              <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    👤
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    個人ユーザー
                  </h4>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>課題：</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#4b5563', lineHeight: '1.6' }}>
                    <li>支援制度の情報が分散</li>
                    <li>申請手続きが複雑</li>
                    <li>育児の不安や疑問</li>
                  </ul>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#047857', fontWeight: '600' }}>
                    ✓ 情報の一元管理と申請の簡素化
                  </p>
                </div>
              </div>

              {/* 企業ユーザー */}
              <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    🏢
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    企業ユーザー
                  </h4>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>課題：</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#4b5563', lineHeight: '1.6' }}>
                    <li>育児と仕事の両立支援不足</li>
                    <li>離職率の高さ</li>
                    <li>施策の効果が見えない</li>
                  </ul>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#047857', fontWeight: '600' }}>
                    ✓ 包括的な支援と効果の可視化
                  </p>
                </div>
              </div>

              {/* 自治体ユーザー */}
              <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    🏛️
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    自治体ユーザー
                  </h4>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>課題：</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#4b5563', lineHeight: '1.6' }}>
                    <li>住民への支援制度の周知不足</li>
                    <li>行政のデジタル化の遅れ</li>
                    <li>施策の効果測定が困難</li>
                  </ul>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#047857', fontWeight: '600' }}>
                    ✓ デジタル化と施策の可視化
                  </p>
                </div>
              </div>
            </div>

            {/* 本アプリの価値 */}
            <div style={{ padding: '20px', backgroundColor: '#f0f4ff', borderRadius: '12px', border: '2px solid #667eea', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px' }}>💡</span>
                <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#1e293b' }}>
                  本アプリの価値
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: '1.8' }}>
                妊娠中から育児期まで一貫した支援を提供し、<strong style={{ color: '#667eea' }}>個人・企業・自治体の課題を包括的に解決</strong>するプラットフォームです。
              </p>
            </div>

            {/* 詳細リンク */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/specification/overview');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a67d8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                <span>📋</span>
                詳細はこちら（概要）
                <span>→</span>
              </a>
            </div>
          </div>

          {/* 事業内容 */}
          <div className="specification-section">
            <h2>2. 事業内容</h2>
            
            {/* 事業概要 */}
            <div style={{ padding: '24px', backgroundColor: '#f0f4ff', borderRadius: '12px', border: '2px solid #667eea', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px' }}>📱</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                  出産支援パーソナルアプリ
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: '1.8' }}>
                妊娠中から育児期まで一貫した支援を提供する包括的なプラットフォーム。個人・企業・自治体の3つのステークホルダーに対して、それぞれのニーズに応じたサービスを提供します。
              </p>
            </div>

            {/* 主要機能をカテゴリ別に表示 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* 個人向け機能 */}
              <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #f59e0b', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    👤
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    個人向け機能
                  </h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                  <li style={{ marginBottom: '8px' }}>支援制度の一元管理と検索</li>
                  <li style={{ marginBottom: '8px' }}>申請手続きの簡素化・ガイド</li>
                  <li style={{ marginBottom: '8px' }}>AIアシスタント（24時間365日対応）</li>
                  <li style={{ marginBottom: '8px' }}>電子母子手帳機能</li>
                  <li style={{ marginBottom: '8px' }}>申請期限管理・リマインダー</li>
                </ul>
              </div>

              {/* 企業向け機能 */}
              <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    🏢
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    企業向け機能
                  </h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                  <li style={{ marginBottom: '8px' }}>従業員向け育児支援プラットフォーム</li>
                  <li style={{ marginBottom: '8px' }}>利用状況レポート・効果測定</li>
                  <li style={{ marginBottom: '8px' }}>認定申請データの自動生成</li>
                  <li style={{ marginBottom: '8px' }}>報告業務の効率化</li>
                  <li style={{ marginBottom: '8px' }}>施策の可視化・経営層への説明資料</li>
                </ul>
              </div>

              {/* 自治体向け機能 */}
              <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #10b981', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    🏛️
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    自治体向け機能
                  </h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                  <li style={{ marginBottom: '8px' }}>住民向け支援制度の周知・提供</li>
                  <li style={{ marginBottom: '8px' }}>自治体独自制度の情報発信</li>
                  <li style={{ marginBottom: '8px' }}>施策の利用状況・効果測定</li>
                  <li style={{ marginBottom: '8px' }}>デジタル化の推進</li>
                  <li style={{ marginBottom: '8px' }}>住民サービスの質向上</li>
                </ul>
              </div>
            </div>

            {/* 収益モデル */}
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #e5e7eb', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px' }}>💰</span>
                <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#1e293b' }}>
                  収益モデル
                </h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', borderLeft: '3px solid #667eea' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>企業向けサブスク</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>月額500円/従業員</p>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', borderLeft: '3px solid #667eea' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>自治体向けライセンス</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>年間契約</p>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', borderLeft: '3px solid #667eea' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>パートナー紹介手数料</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>1,000円/件</p>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', borderLeft: '3px solid #667eea' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>ECリファラル</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>アフィリエイト</p>
                </div>
              </div>
            </div>

            {/* 詳細リンク */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/specification/features');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a67d8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                <span>📋</span>
                主要機能の詳細
                <span>→</span>
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/specification/business-plan');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#fff',
                  color: '#667eea',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '2px solid #667eea',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f4ff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>💼</span>
                ビジネスモデル
                <span>→</span>
              </a>
            </div>
          </div>

          {/* 企業が本アプリを採用・導入する背景 */}
          <div className="specification-section">
            <h2>3. 企業が本アプリを採用・導入する背景</h2>
            
            {/* 法的・制度的背景の説明 */}
            <div style={{ padding: '20px', backgroundColor: '#f0f4ff', borderRadius: '8px', border: '2px solid #667eea', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '20px' }}>
                  ⚖️
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                  法的・制度的背景
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: '1.8' }}>
                企業は各種法令に基づき、従業員の育児支援施策を実施する義務があります。本アプリの導入により、これらの法的要件を満たしながら、効果的な支援を実現できます。
              </p>
            </div>

            {/* 4つの背景をカード形式で表示 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {/* 1. 次世代育成支援対策推進法 */}
              <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667eea', fontWeight: '700', fontSize: '18px' }}>
                    1
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    次世代育成支援対策推進法
                  </h4>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                  企業は行動計画を策定・実施する<strong style={{ color: '#dc2626' }}>義務</strong>があります。本アプリの導入により、行動計画の実効性を高められます。
                </p>
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', borderLeft: '4px solid #667eea' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>主な取り組み内容：</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#4b5563', lineHeight: '1.8' }}>
                    <li>育児休業取得率の向上</li>
                    <li>育児と仕事の両立支援</li>
                    <li>子育て支援制度の周知</li>
                  </ul>
                </div>
              </div>

              {/* 2. くるみん認定 */}
              <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #fcd34d', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', backgroundColor: '#fef3c7', borderRadius: '12px', fontSize: '11px', fontWeight: '700', color: '#92400e' }}>
                  最大50万円
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontWeight: '700', fontSize: '18px' }}>
                    2
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    次世代育成支援対策推進法に基づく認定マーク（くるみん）
                  </h4>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                  子育て支援に積極的に取り組む企業が取得できる認定です。本アプリの導入は、認定取得のための具体的な取り組みとして評価されます。
                </p>
                <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px' }}>💰</span>
                    <p style={{ margin: 0, fontSize: '14px', color: '#78350f', fontWeight: '700' }}>
                      最大50万円の助成金
                    </p>
                  </div>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#92400e' }}>✓ 公共調達での優遇措置</p>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#92400e' }}>✓ 企業の社会的評価向上</p>
                </div>
              </div>

              {/* 3. 健康経営優良法人認定 */}
              <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', backgroundColor: '#dbeafe', borderRadius: '12px', fontSize: '11px', fontWeight: '700', color: '#1e40af' }}>
                  年間数百万円
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: '700', fontSize: '18px' }}>
                    3
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    健康経営優良法人認定
                  </h4>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                  従業員の健康管理を経営課題として捉え、戦略的に取り組む企業が取得できる認定です。本アプリの導入により、ライフイベント支援として評価されます。
                </p>
                <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px' }}>💳</span>
                    <p style={{ margin: 0, fontSize: '14px', color: '#1e40af', fontWeight: '700' }}>
                      金融機関からの優遇金利
                    </p>
                  </div>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#1e3a8a' }}>✓ 公共調達での優遇措置</p>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#1e3a8a' }}>✓ 年間数百万円の効果</p>
                </div>
              </div>

              {/* 4. 働き方改革 */}
              <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #10b981', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: '700', fontSize: '18px' }}>
                    4
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    働き方改革の推進
                  </h4>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                  育児と仕事の両立支援は、働き方改革の重要な柱の一つです。本アプリの導入により、従業員の働き方改革を推進し、多様な働き方を実現できます。
                </p>
              </div>
            </div>

            {/* 本アプリ導入による効果 */}
            <div style={{ padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '24px' }}>
                  ✨
                </div>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#065f46' }}>
                  本アプリ導入による効果
                </h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>📊</span>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#065f46' }}>
                      報告業務の効率化
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#047857', lineHeight: '1.6' }}>
                    行動計画の実施状況を自動的にレポート化
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>📝</span>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#065f46' }}>
                      申請データの自動生成
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#047857', lineHeight: '1.6' }}>
                    認定申請に必要なデータを自動生成
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>📈</span>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#065f46' }}>
                      施策効果の可視化
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#047857', lineHeight: '1.6' }}>
                    経営層への説明が容易に
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>👥</span>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#065f46' }}>
                      従業員満足度向上
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#047857', lineHeight: '1.6' }}>
                    離職率の低下に貢献
                  </p>
                </div>
              </div>
            </div>

            {/* ケーススタディへのリンク */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/specification/case-study');
                }}
                style={{
                  padding: '14px 28px',
                  backgroundColor: '#667eea',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a67d8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                <span>📚</span>
                詳細はこちら（ケーススタディ）
                <span>→</span>
              </a>
            </div>
          </div>

          {/* 市場分析 */}
          <div className="specification-section">
            <h2>4. 市場分析</h2>
            
            {/* 市場規模の概要 */}
            <div style={{ padding: '24px', backgroundColor: '#f0f4ff', borderRadius: '12px', border: '2px solid #667eea', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '32px' }}>📊</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                  市場規模の概要
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: '1.8' }}>
                少子化対策が国家的課題となる中、出産・育児を支援するデジタルサービスの市場は拡大しています。本アプリケーションは、個人・企業・自治体の3つのセグメントに対して、それぞれのニーズに応じたサービスを提供します。
              </p>
            </div>

            {/* 市場規模の数値 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* ターゲット人口 */}
              <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #f59e0b', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    👥
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    ターゲット人口
                  </h4>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
                    約570万人
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                    • 妊婦：約57万人<br/>
                    • 0-1歳の親：約69万組<br/>
                    • 1-2歳の親：約77万組<br/>
                    • 2-3歳の親：約77万組<br/>
                    • 3-6歳の親：約290万組
                  </p>
                </div>
              </div>

              {/* 自治体数 */}
              <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    🏛️
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    自治体数
                  </h4>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>
                    1,741自治体
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                    全国の市区町村数<br/>
                    （2024年時点）
                  </p>
                </div>
              </div>

              {/* 企業数 */}
              <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #10b981', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    🏢
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    潜在企業数
                  </h4>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                    約62万社
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                    従業員の育児支援を推進する<br/>
                    企業の推定数
                  </p>
                </div>
              </div>
            </div>

            {/* ターゲットセグメント */}
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #e5e7eb', marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                ターゲットセグメント
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '700', color: '#92400e' }}>個人ユーザー</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.7' }}>
                    妊婦・育児中の親（0-6歳児の親）<br/>
                    年間約570万人規模の市場
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '700', color: '#1e40af' }}>企業ユーザー</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', lineHeight: '1.7' }}>
                    従業員の育児支援を推進する企業<br/>
                    次世代育成支援対策推進法に基づく行動計画の策定・実施が義務
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#d1fae5', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '700', color: '#065f46' }}>自治体ユーザー</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.7' }}>
                    子育て支援施策を充実させる自治体<br/>
                    全国1,741自治体が潜在顧客
                  </p>
                </div>
              </div>
            </div>

            {/* 獲得目標 */}
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #10b981', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '32px' }}>🎯</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#065f46' }}>
                  獲得目標
                </h3>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: '#10b981' }}>
                    約45万人
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    （全国規模での獲得目標ユーザー数）
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f0fdf4', borderBottom: '2px solid #10b981' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#065f46' }}>カテゴリー</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#065f46' }}>ターゲット人口</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#065f46' }}>獲得率</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#065f46' }}>獲得目標</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', color: '#374151' }}>妊婦</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>約57万人</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#10b981', fontWeight: '600' }}>30%</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#065f46', fontWeight: '700' }}>約17万人</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <td style={{ padding: '12px', color: '#374151' }}>0-1歳の親</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>約69万組</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#10b981', fontWeight: '600' }}>20%</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#065f46', fontWeight: '700' }}>約14万組</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', color: '#374151' }}>1-2歳の親</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>約77万組</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#10b981', fontWeight: '600' }}>10%</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#065f46', fontWeight: '700' }}>約8万組</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <td style={{ padding: '12px', color: '#374151' }}>2-3歳の親</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>約77万組</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#10b981', fontWeight: '600' }}>5%</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#065f46', fontWeight: '700' }}>約4万組</td>
                      </tr>
                      <tr style={{ borderBottom: '2px solid #10b981' }}>
                        <td style={{ padding: '12px', color: '#374151' }}>3-6歳の親</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>約290万組</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#10b981', fontWeight: '600' }}>1%</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#065f46', fontWeight: '700' }}>約3万組</td>
                      </tr>
                      <tr style={{ backgroundColor: '#f0fdf4' }}>
                        <td style={{ padding: '12px', fontWeight: '700', color: '#065f46' }}>合計</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#065f46' }}>約570万人</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#065f46' }}>-</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#065f46', fontSize: '16px' }}>約45万人</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 市場成長性 */}
            <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px' }}>📈</span>
                <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#1e293b' }}>
                  市場成長性
                </h4>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#475569', lineHeight: '1.8' }}>
                <li>少子化対策が国家的課題として継続的に取り組まれている</li>
                <li>デジタル化の推進により、行政・企業のDX需要が拡大</li>
                <li>働き方改革の推進により、育児支援施策の重要性が高まっている</li>
                <li>健康経営・ESG経営の観点から、企業の社会的責任が重視されている</li>
              </ul>
            </div>

            {/* 詳細リンク */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/specification/market-size');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a67d8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                <span>📊</span>
                詳細はこちら（市場規模）
                <span>→</span>
              </a>
            </div>
          </div>

          {/* 事業計画・収益計画 */}
          <div className="specification-section">
            <h2>5. 事業計画・収益計画</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                収益モデル
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                <li>企業向けサブスクリプション（月額500円/従業員）</li>
                <li>自治体向けライセンス（年間契約）</li>
                <li>教育・習い事パートナー紹介手数料（1,000円/件）</li>
                <li>保険・医療パートナー紹介手数料（1,000円/件）</li>
                <li>ECリファラル（アフィリエイト）</li>
                <li>家政婦・専門教師マッチング手数料</li>
              </ul>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/specification/business-plan');
                  }}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#667eea',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '14px',
                    textAlign: 'center',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e0e7ff';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  ビジネスモデル
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/specification/business-plan-detail');
                  }}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#667eea',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '14px',
                    textAlign: 'center',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e0e7ff';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  事業計画
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/specification/business-plan-simulation');
                  }}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#667eea',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '14px',
                    textAlign: 'center',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e0e7ff';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  シミュレーション
                </a>
              </div>
            </div>
          </div>

          {/* 補助金・助成金 */}
          <div className="specification-section">
            <h2>6. 補助金・助成金</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                新規会社設立および事業展開において、各種補助金・助成金の活用が可能です。
                また、本アプリを導入する企業・自治体向けの助成金制度も多数存在します。
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/specification/subsidies');
                  }}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#667eea',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '14px',
                    textAlign: 'center',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e0e7ff';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  補助金・助成金
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/specification/user-subsidies');
                  }}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#667eea',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '14px',
                    textAlign: 'center',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e0e7ff';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  利用者向け助成金
                </a>
              </div>
            </div>
          </div>

          {/* ケーススタディ */}
          <div className="specification-section">
            <h2>7. ケーススタディ</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                本アプリケーションの導入により、企業・個人ユーザーが得られる具体的な効果とメリットをケーススタディとして整理しています。
              </p>
              <div style={{ marginTop: '16px' }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/specification/case-study');
                  }}
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  詳細はこちら →
                </a>
              </div>
            </div>
          </div>

          {/* リスク評価 */}
          <div className="specification-section">
            <h2>8. リスク評価</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                事業展開におけるリスクと対策を詳細に分析しています。
              </p>
              <div style={{ marginTop: '16px' }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/specification/risk-assessment');
                  }}
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  詳細はこちら →
                </a>
              </div>
            </div>
          </div>

          {/* 承認事項 */}
          <div className="specification-section">
            <h2>9. 承認事項</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                以下の事項について承認をお願いいたします。
              </p>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                <li style={{ marginBottom: '12px' }}>
                  出産支援パーソナルアプリ事業の新規会社設立
                </li>
                <li style={{ marginBottom: '12px' }}>
                  初期投資資金の承認（詳細は事業計画を参照）
                </li>
                <li style={{ marginBottom: '12px' }}>
                  社内ベンチャー制度の適用
                </li>
                <li style={{ marginBottom: '12px' }}>
                  各種補助金・助成金の申請
                </li>
              </ol>
            </div>
          </div>

          {/* 添付資料 */}
          <div className="specification-section">
            <h2>10. 添付資料</h2>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/specification/overview');
                    }}
                    style={{ color: '#667eea', textDecoration: 'none' }}
                  >
                    概要
                  </a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/specification/features');
                    }}
                    style={{ color: '#667eea', textDecoration: 'none' }}
                  >
                    主要機能
                  </a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/specification/business-plan');
                    }}
                    style={{ color: '#667eea', textDecoration: 'none' }}
                  >
                    ビジネスモデル
                  </a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/specification/business-plan-detail');
                    }}
                    style={{ color: '#667eea', textDecoration: 'none' }}
                  >
                    事業計画
                  </a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/specification/business-plan-simulation');
                    }}
                    style={{ color: '#667eea', textDecoration: 'none' }}
                  >
                    シミュレーション
                  </a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/specification/market-size');
                    }}
                    style={{ color: '#667eea', textDecoration: 'none' }}
                  >
                    市場規模
                  </a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/specification/subsidies');
                    }}
                    style={{ color: '#667eea', textDecoration: 'none' }}
                  >
                    補助金・助成金
                  </a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/specification/case-study');
                    }}
                    style={{ color: '#667eea', textDecoration: 'none' }}
                  >
                    ケーススタディ
                  </a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/specification/risk-assessment');
                    }}
                    style={{ color: '#667eea', textDecoration: 'none' }}
                  >
                    リスク評価
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationRingisho;

