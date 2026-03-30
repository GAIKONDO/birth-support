import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOwnerId } from '../hooks/useOwnerId';
import { useSidebarState } from '../hooks/useSidebarState';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import Sidebar from './Sidebar';
import SubMenu from './SubMenu';
import Invitations from './Invitations';
import SharingSettings from './SharingSettings';
import AccountSwitcher from './AccountSwitcher';
import './Layout.css';
import './MyPage.css';

const Layout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { ownerId, loading: ownerIdLoading, isSharedMember, ownerEmail, ownerDisplayName } = useOwnerId();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, subMenuOpen, closeSidebar, toggleSubMenu } = useSidebarState();
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [sharedDisplayName, setSharedDisplayName] = useState('');
  const [originalSharedDisplayName, setOriginalSharedDisplayName] = useState('');
  const [isEditingSharedDisplayName, setIsEditingSharedDisplayName] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const hasUpdatedLoginFlag = useRef(false); // ログインフラグ更新済みかどうか

  // ページタイトルのマッピング
  const pageTitles = {
    '/mypage': 'マイページ',
    '/mypage-authenticated': 'マイページ',
    '/support-systems': '出産支援制度',
    '/support-systems/lump-sum': '出産育児一時金',
    '/support-systems/childcare-leave': '育児休業給付金',
    '/support-systems/childbirth-allowance': '出産手当金',
    '/support-systems/child-allowance': '児童手当',
    '/action-management': 'アクション管理',
    '/electronic-maternal-handbook': '電子母子手帳',
    '/search': '検索',
    '/ai-assistant': 'AIアシスタント'
  };

  const getPageTitle = () => {
    // 完全一致を優先
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
    // /support-systems/で始まる場合は出産支援制度のタイトルを返す
    if (location.pathname.startsWith('/support-systems/')) {
      return '出産支援制度';
    }
    return 'マイページ';
  };

  const currentPageTitle = getPageTitle();

  // currentUserが変わった時にフラグをリセット
  useEffect(() => {
    hasUpdatedLoginFlag.current = false;
  }, [currentUser?.uid]);

  // 共有メンバーがログインした時にhasLoggedInフラグを更新
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId || !isSharedMember || hasUpdatedLoginFlag.current) return;

    const updateLoginFlag = async () => {
      try {
        const membersRef = collection(db, 'users', ownerId, 'sharedMembers');
        
        // まずUIDベースで検索
        let memberRef = doc(db, 'users', ownerId, 'sharedMembers', currentUser.uid);
        let memberSnapshot = await getDoc(memberRef);
        
        // UIDベースで見つからない場合はメールアドレスで検索
        if (!memberSnapshot.exists()) {
          const q = query(membersRef, where('email', '==', currentUser.email));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            // メールアドレスベースのドキュメントが見つかった場合、UIDベースに移動
            const oldDoc = snapshot.docs[0];
            const oldData = oldDoc.data();
            
            // UIDベースのドキュメントを作成/更新
            memberRef = doc(db, 'users', ownerId, 'sharedMembers', currentUser.uid);
            await setDoc(memberRef, {
              ...oldData,
              userId: currentUser.uid,
              displayName: currentUser.displayName || currentUser.email
            }, { merge: true });
            
            // 古いドキュメントを削除（オーナーのみ可能なので、ここではスキップ）
            // 代わりに、UIDベースのドキュメントを参照する
            
            memberSnapshot = await getDoc(memberRef);
          }
        }
        
        if (memberSnapshot.exists()) {
          const memberData = memberSnapshot.data();
          const updates = {};
          let needsUpdate = false;

          // statusがpendingの場合はacceptedに更新
          if (memberData.status === 'pending') {
            updates.status = 'accepted';
            updates.acceptedAt = serverTimestamp();
            needsUpdate = true;
          }

          // hasLoggedInが未設定またはfalseの場合のみ更新
          if (!memberData.hasLoggedIn) {
            updates.hasLoggedIn = true;
            updates.loggedInAt = serverTimestamp();
            needsUpdate = true;
          }

          // userIdが未設定の場合は設定
          if (!memberData.userId) {
            updates.userId = currentUser.uid;
            updates.displayName = currentUser.displayName || currentUser.email;
            needsUpdate = true;
          }

          if (needsUpdate) {
            await setDoc(memberRef, updates, { merge: true });
            hasUpdatedLoginFlag.current = true;
            console.log('ログインフラグとステータスを更新しました');
          } else {
            hasUpdatedLoginFlag.current = true;
          }
        }
      } catch (error) {
        console.error('ログインフラグ更新エラー:', error);
      }
    };

    updateLoginFlag();
  }, [currentUser, ownerIdLoading, ownerId, isSharedMember]);

  // Firestoreから共有時の表示名を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId || isSharedMember) return;

    const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
    
    const unsubscribe = onSnapshot(userDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.sharedDisplayName !== undefined) {
          setSharedDisplayName(data.sharedDisplayName || '');
          setOriginalSharedDisplayName(data.sharedDisplayName || '');
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, ownerIdLoading, ownerId, isSharedMember]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // 共有時の表示名を保存
  const handleSaveSharedDisplayName = async () => {
    if (!currentUser || !ownerId) return;

    setSaving(true);
    try {
      const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
      await setDoc(userDataRef, { sharedDisplayName: sharedDisplayName.trim() || null }, { merge: true });
      setOriginalSharedDisplayName(sharedDisplayName);
      setIsEditingSharedDisplayName(false);
      console.log('共有表示名を保存しました:', sharedDisplayName);
      alert('共有表示名を保存しました。');
    } catch (error) {
      console.error('共有表示名保存エラー:', error);
      alert('共有表示名の保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSharedDisplayNameEdit = () => {
    setSharedDisplayName(originalSharedDisplayName);
    setIsEditingSharedDisplayName(false);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="layout-container">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar}
        subMenuOpen={subMenuOpen}
        onToggleSubMenu={toggleSubMenu}
      />
      <SubMenu isVisible={sidebarOpen && subMenuOpen} />
      
          <div className={`layout-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${sidebarOpen && !subMenuOpen ? 'submenu-closed' : ''}`}>
        <div className="layout-content">
          <Invitations />
          {children}
        </div>
      </div>

    </div>
  );
};

export default Layout;

