import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOwnerId } from '../hooks/useOwnerId';
import AccountSwitcher from './AccountSwitcher';
import SharingSettings from './SharingSettings';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, subMenuOpen, onToggleSubMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { isSharedMember } = useOwnerId();
  const [isMobile, setIsMobile] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ログイン前とログイン後でメニュー項目を切り替え
  const publicMenuItems = [
    {
      path: '/',
      label: 'ホーム',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      path: '/service-overview',
      label: 'サービス概要',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )
    },
    {
      path: '/company-overview',
      label: '会社概要',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      )
    },
    {
      path: '/pricing',
      label: '利用金額',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      path: '/registration',
      label: '登録方法',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
      )
    },
    {
      path: '/mypage',
      label: 'マイページ',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    }
  ];

  const authenticatedMenuItems = [
    {
      path: '/mypage-authenticated',
      label: 'マイページ',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      path: '/statistics',
      label: '該当制度',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    },
    {
      path: '/support-systems',
      label: '出産支援制度',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )
    },
    {
      path: '/action-management',
      label: 'アクション管理',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      )
    },
    {
      path: '/search',
      label: '検索',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      )
    },
    {
      path: '/ai-assistant',
      label: 'AIアシスタント',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      )
    },
    {
      path: '/electronic-maternal-handbook',
      label: '電子母子手帳',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          <path d="M8 7h8"></path>
          <path d="M8 11h8"></path>
          <path d="M8 15h4"></path>
        </svg>
      )
    },
    {
      path: '/specification/overview',
      label: '企画書',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    }
  ];

  const menuItems = currentUser ? authenticatedMenuItems : publicMenuItems;

  return (
    <>
      {/* オーバーレイ（モバイル用のみ） */}
      {isOpen && isMobile && <div className="sidebar-overlay" onClick={onClose} />}
      
      {/* サイドバー（アイコンのみ） */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-content">
          {/* ハンバーガーメニューアイコン */}
          <div className="sidebar-logo">
            <button 
              className="hamburger-menu-button"
              onClick={onToggleSubMenu}
              aria-label={subMenuOpen ? 'サブメニューを閉じる' : 'サブメニューを開く'}
              title={subMenuOpen ? 'サブメニューを閉じる' : 'サブメニューを開く'}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{
                  transform: subMenuOpen ? 'rotate(0deg)' : 'rotate(90deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {/* ナビゲーションメニュー（アイコン + ラベル） */}
          <nav className="sidebar-nav">
            <ul className="sidebar-menu">
              {menuItems.map((item) => {
                // アクティブ状態の判定
                // /payment-amount の場合は /statistics をアクティブにする（支給金額は統計情報のサブメニュー）
                let isActive = location.pathname === item.path;
                if (item.path === '/statistics' && location.pathname === '/payment-amount') {
                  isActive = true;
                }
                // /specification/ で始まる場合は /specification/overview をアクティブにする（仕様書のサブメニュー）
                if (item.path === '/specification/overview' && location.pathname.startsWith('/specification/')) {
                  isActive = true;
                }
                // 現在のURLパラメータ（ownerなど）を保持
                const ownerParam = searchParams.get('owner');
                const params = new URLSearchParams();
                if (ownerParam) {
                  params.set('owner', ownerParam);
                }
                // アクション管理ページの場合は、viewパラメータも保持
                if (item.path === '/action-management') {
                  const viewParam = searchParams.get('view');
                  if (viewParam) {
                    params.set('view', viewParam);
                  }
                }
                const queryString = params.toString();
                const toPath = queryString ? `${item.path}?${queryString}` : item.path;
                
                return (
                  <li key={item.path}>
                    <Link 
                      to={toPath} 
                      className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
                      onClick={isMobile ? onClose : undefined}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-label">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 下部エリア（共有設定ボタンとプロフィールアイコン） */}
          <div className="sidebar-footer">
            {currentUser && !isSharedMember && (
              <button 
                className="sidebar-sharing-button"
                onClick={() => setShowSharingModal(true)}
                title="共有設定"
                aria-label="共有設定"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </button>
            )}
            {currentUser ? (
              <button 
                className="sidebar-profile-icon-button"
                onClick={() => setShowAccountSwitcher(true)}
                title={currentUser.email}
                aria-label="アカウント切り替え"
              >
                <div className="sidebar-profile-icon">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="プロフィール" 
                      className="profile-avatar-small"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || currentUser.email || 'User')}&background=667eea&color=fff&size=40`;
                      }}
                    />
                  ) : (
                    <div className="profile-avatar-small profile-avatar-placeholder">
                      {currentUser.displayName?.[0] || currentUser.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              </button>
            ) : (
              <button 
                className="sidebar-guest-icon-button"
                onClick={() => setShowGuestModal(true)}
                title="ログイン / 新規登録"
                aria-label="ログイン / 新規登録"
              >
                <div className="sidebar-guest-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 共有設定モーダル */}
      {showSharingModal && !isSharedMember && (
        <div className="modal-overlay" onClick={() => setShowSharingModal(false)}>
          <div className="sharing-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>共有設定</h2>
              <button 
                className="modal-close-button"
                onClick={() => setShowSharingModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <SharingSettings />
            </div>
          </div>
        </div>
      )}

      {/* アカウント切り替えモーダル */}
      <AccountSwitcher 
        isOpen={showAccountSwitcher} 
        onClose={() => setShowAccountSwitcher(false)}
        position="bottom-left"
      />

      {/* ゲスト用ログイン/新規登録モーダル */}
      {showGuestModal && (
        <div className="modal-overlay" onClick={() => setShowGuestModal(false)}>
          <div className="guest-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>ログイン / 新規登録</h2>
              <button 
                className="modal-close-button"
                onClick={() => setShowGuestModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="guest-modal-options">
                <button 
                  className="guest-modal-button login-button"
                  onClick={() => {
                    setShowGuestModal(false);
                    navigate('/mypage');
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  ログイン
                </button>
                <button 
                  className="guest-modal-button signup-button"
                  onClick={() => {
                    setShowGuestModal(false);
                    navigate('/mypage');
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  新規登録
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
