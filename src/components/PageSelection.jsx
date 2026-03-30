import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import './PageSelection.css';

const PageSelection = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sharedPages, setSharedPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

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
  }, [currentUser, navigate]);

  const handleSelectMyPage = () => {
    // 自分のマイページにアクセス（通常の状態）
    navigate('/mypage-authenticated');
  };

  const handleSelectSharedPage = (ownerId) => {
    // 共有ページにアクセス（URLパラメータで指定）
    navigate(`/mypage-authenticated?owner=${ownerId}`);
  };

  if (loading) {
    return (
      <div className="page-selection-container">
        <div className="page-selection-card">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-selection-container">
      <div className="page-selection-card">
        <h1>出産支援制度アプリ</h1>
        <h2>ページを選択</h2>
        <p className="selection-description">
          アクセスするページを選択してください。
        </p>

        <div className="page-options">
          {/* 自分のマイページ */}
          <button
            className="page-option-button my-page-button"
            onClick={handleSelectMyPage}
          >
            <div className="page-option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="page-option-content">
              <div className="page-option-title">自分のマイページ</div>
              <div className="page-option-subtitle">{currentUser?.email}</div>
            </div>
            <div className="page-option-arrow">→</div>
          </button>

          {/* 共有ページ */}
          {sharedPages.map((page) => (
            <button
              key={page.ownerId}
              className="page-option-button shared-page-button"
              onClick={() => handleSelectSharedPage(page.ownerId)}
            >
              <div className="page-option-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="page-option-content">
                <div className="page-option-title">
                  {page.displayName}さんのページ
                </div>
                <div className="page-option-subtitle">
                  {page.permission === 'editor' ? '編集可能' : '閲覧のみ'}
                </div>
              </div>
              <div className="page-option-arrow">→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageSelection;

