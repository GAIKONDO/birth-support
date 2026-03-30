import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import './AccountSwitcher.css';

const AccountSwitcher = ({ isOpen, onClose, position = 'top-right' }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sharedPages, setSharedPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !currentUser) return;

    // 共有アクセス情報を取得
    const fetchSharedPages = async () => {
      try {
        const sharedAccessRef = collection(db, 'sharedAccess');
        const q = query(sharedAccessRef, where('memberId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        
        const pagesPromises = snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          if (data.status === 'accepted' && data.ownerId) {
            let displayName = data.ownerEmail || 'オーナー';
            
            // オーナーのプロフィール情報を取得
            try {
              const ownerProfileRef = doc(db, 'users', data.ownerId, 'data', 'profile');
              const ownerProfileSnapshot = await getDoc(ownerProfileRef);
              if (ownerProfileSnapshot.exists()) {
                const ownerProfileData = ownerProfileSnapshot.data();
                if (ownerProfileData.sharedDisplayName) {
                  displayName = ownerProfileData.sharedDisplayName;
                } else if (ownerProfileData.basicInfo?.motherName) {
                  displayName = ownerProfileData.basicInfo.motherName;
                } else if (data.ownerEmail) {
                  const emailName = data.ownerEmail.split('@')[0];
                  displayName = emailName;
                }
              } else if (data.ownerEmail) {
                const emailName = data.ownerEmail.split('@')[0];
                displayName = emailName;
              }
            } catch (error) {
              console.error('オーナープロフィール情報の取得エラー:', error);
              if (data.ownerEmail) {
                const emailName = data.ownerEmail.split('@')[0];
                displayName = emailName;
              }
            }
            
            return {
              ownerId: data.ownerId,
              ownerEmail: data.ownerEmail,
              displayName: displayName,
              permission: data.permission || 'viewer'
            };
          }
          return null;
        });
        
        const pages = (await Promise.all(pagesPromises)).filter(page => page !== null);
        setSharedPages(pages);
        setLoading(false);
      } catch (error) {
        console.error('共有ページの取得エラー:', error);
        setLoading(false);
      }
    };

    fetchSharedPages();
  }, [isOpen, currentUser]);

  // モーダル外をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const handleSelectMyPage = () => {
    navigate('/mypage-authenticated');
    onClose();
  };

  const handleSelectSharedPage = (ownerId) => {
    navigate(`/mypage-authenticated?owner=${ownerId}`);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      onClose();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  if (!isOpen || !currentUser) return null;

  const currentOwnerId = searchParams.get('owner');
  const isViewingMyPage = !currentOwnerId;
  const isViewingSharedPage = currentOwnerId && sharedPages.some(p => p.ownerId === currentOwnerId);

  return (
    <div className={`account-switcher-overlay account-switcher-overlay-${position}`}>
      <div className="account-switcher-modal" ref={modalRef}>
        {/* 現在のアカウント情報 */}
        <div className="account-switcher-current">
          <div className="current-account-header">
            <div className="current-account-info">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || currentUser.email}
                  className="current-account-avatar"
                />
              ) : (
                <div className="current-account-avatar-placeholder">
                  {currentUser.displayName?.[0] || currentUser.email?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="current-account-details">
                <div className="current-account-name">
                  {currentUser.displayName || currentUser.email}
                </div>
                <div className="current-account-email">{currentUser.email}</div>
              </div>
            </div>
            <button className="account-switcher-close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {/* ページ選択 */}
        <div className="account-switcher-pages">
          {loading ? (
            <div className="account-switcher-loading">読み込み中...</div>
          ) : (
            <>
              {/* 自分のマイページ */}
              <button
                className={`account-switcher-page-option ${isViewingMyPage ? 'active' : ''}`}
                onClick={handleSelectMyPage}
              >
                <div className="page-option-icon-small">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="page-option-content-small">
                  <div className="page-option-title-small">自分のマイページ</div>
                  <div className="page-option-subtitle-small">{currentUser.email}</div>
                </div>
                {isViewingMyPage && (
                  <div className="page-option-check">✓</div>
                )}
              </button>

              {/* 共有ページ */}
              {sharedPages.map((page) => {
                const isActive = currentOwnerId === page.ownerId;
                return (
                  <button
                    key={page.ownerId}
                    className={`account-switcher-page-option ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectSharedPage(page.ownerId)}
                  >
                    <div className="page-option-icon-small">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div className="page-option-content-small">
                      <div className="page-option-title-small">
                        {page.displayName}さんのページ
                      </div>
                      <div className="page-option-subtitle-small">
                        {page.permission === 'editor' ? '編集可能' : '閲覧のみ'}
                      </div>
                    </div>
                    {isActive && (
                      <div className="page-option-check">✓</div>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* フッター */}
        <div className="account-switcher-footer">
          <button className="account-switcher-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            すべてのアカウントからログアウトする
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSwitcher;

