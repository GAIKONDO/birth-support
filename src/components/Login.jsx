import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useSidebarState } from '../hooks/useSidebarState';
import Sidebar from './Sidebar';
import SubMenu from './SubMenu';
import PageSelection from './PageSelection';
import './Login.css';
import './Layout.css';

const Login = () => {
  const { signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSharedPages, setHasSharedPages] = useState(false);
  const [checkingSharedPages, setCheckingSharedPages] = useState(false);
  const { sidebarOpen, subMenuOpen, closeSidebar, toggleSubMenu } = useSidebarState();

  // 既にログインしている場合は共有ページをチェック
  useEffect(() => {
    const checkSharedPages = async () => {
      if (!currentUser) return;

      // 既に/mypageにいる場合はPageSelectionを表示しない
      if (location.pathname === '/mypage') {
        return;
      }

      setCheckingSharedPages(true);
      try {
        const sharedAccessRef = collection(db, 'sharedAccess');
        const q = query(sharedAccessRef, where('memberId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        
        const acceptedPages = snapshot.docs.filter(doc => doc.data().status === 'accepted');
        setHasSharedPages(acceptedPages.length > 0);
      } catch (error) {
        console.error('共有ページの確認エラー:', error);
        setHasSharedPages(false);
      } finally {
        setCheckingSharedPages(false);
      }
    };

    checkSharedPages();
  }, [currentUser, location.pathname]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      // ログイン後、共有ページがあるかチェック（useEffectで処理される）
    } catch (err) {
      // ユーザーがポップアップを閉じた場合はエラーを表示しない
      if (err.code === 'auth/popup-closed-by-user') {
        setError('');
      } else if (err.code === 'auth/popup-blocked') {
        setError('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。');
      } else {
        setError('ログインに失敗しました。もう一度お試しください。');
        console.error('ログインエラー:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // ログイン後、共有ページがない場合はマイページ（プロフィール画面）にリダイレクト
  useEffect(() => {
    if (currentUser && !checkingSharedPages && !hasSharedPages) {
      // ログイン画面やログイン前のページからログインした場合は、マイページにリダイレクト
      const publicPages = ['/', '/mypage', '/service-overview', '/company-overview', '/pricing', '/registration'];
      if (publicPages.includes(location.pathname)) {
        navigate('/mypage-authenticated', { replace: true });
      }
    }
  }, [currentUser, checkingSharedPages, hasSharedPages, navigate, location.pathname]);

  // ログイン済みで共有ページがある場合、かつ/mypageにいない場合はページ選択画面を表示
  if (currentUser && hasSharedPages && location.pathname !== '/mypage') {
    return <PageSelection />;
  }

  // ログイン済みで共有ページがない場合は、マイページにリダイレクト（useEffectで処理）
  // ただし、/mypageにいる場合はログイン画面を表示

  return (
    <div className="layout-container login-page-container">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar}
        subMenuOpen={subMenuOpen}
        onToggleSubMenu={toggleSubMenu}
      />
      <SubMenu isVisible={sidebarOpen && subMenuOpen} />
      
      <div className={`layout-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${sidebarOpen && !subMenuOpen ? 'submenu-closed' : ''}`}>
        <div className="layout-content">
          <div className="login-page">
            <div className="login-content-card">
              <div className="login-content">
                <div className="login-card">
                  <h1>出産支援制度アプリ</h1>
                  <h2>ログイン</h2>
                  <p className="login-description">
                    Googleアカウントでログインして、マイページにアクセスしてください。
                  </p>
                  
                  {error && <div className="error-message">{error}</div>}
                  
                  <button 
                    onClick={handleGoogleSignIn}
                    disabled={loading || checkingSharedPages}
                    className="google-sign-in-button"
                  >
                    {loading || checkingSharedPages ? (
                      'ログイン中...'
                    ) : (
                      <>
                        <svg className="google-icon" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Googleでログイン
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

