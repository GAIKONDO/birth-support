import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import './InvitePage.css';

const InvitePage = () => {
  const { token } = useParams();
  const { currentUser, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  // 招待トークンを検証
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('無効な招待リンクです。');
        setLoading(false);
        return;
      }

      try {
        const inviteTokensRef = collection(db, 'inviteTokens');
        const q = query(inviteTokensRef, where('token', '==', token));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setError('招待リンクが見つかりません。リンクが無効または期限切れの可能性があります。');
          setLoading(false);
          return;
        }

        const inviteDoc = snapshot.docs[0];
        const data = inviteDoc.data();

        // ステータスをチェック
        if (data.status !== 'pending') {
          setError('この招待は既に処理済みです。');
          setLoading(false);
          return;
        }

        setInviteData({
          id: inviteDoc.id,
          ...data
        });
        setLoading(false);
      } catch (error) {
        console.error('トークン検証エラー:', error);
        setError('招待リンクの検証に失敗しました。');
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // ログイン済みの場合、自動的に招待を承認
  useEffect(() => {
    const autoAcceptInvitation = async () => {
      if (!currentUser || !inviteData || processing) return;

      // メールアドレスが一致するか確認
      if (currentUser.email !== inviteData.email) {
        setError(`この招待は ${inviteData.email} 宛てです。現在ログインしているアカウント（${currentUser.email}）とは異なります。`);
        return;
      }

      setProcessing(true);
      try {
        await handleAcceptInvitation(inviteData.id, inviteData.ownerId, inviteData.permission);
      } catch (error) {
        console.error('自動承認エラー:', error);
        console.error('エラーコード:', error.code);
        console.error('エラーメッセージ:', error.message);
        console.error('エラー詳細:', error);
        let errorMessage = '招待の承認に失敗しました。';
        if (error.code === 'permission-denied') {
          errorMessage = `招待の承認に失敗しました。Firestoreのセキュリティルールを確認してください。\n\nエラーコード: ${error.code}\nエラーメッセージ: ${error.message}`;
        } else if (error.message) {
          errorMessage = `招待の承認に失敗しました。\n\nエラーコード: ${error.code || '不明'}\nエラーメッセージ: ${error.message}`;
        }
        setError(errorMessage);
        setProcessing(false);
      }
    };

    autoAcceptInvitation();
  }, [currentUser, inviteData, processing]);

  // 招待を承認
  const handleAcceptInvitation = async (inviteTokenId, ownerId, permission) => {
    if (!currentUser) return;

    try {
      // UIDをドキュメントIDとして使用（承認時にUIDに更新）
      const memberRef = doc(db, 'users', ownerId, 'sharedMembers', currentUser.uid);
      
      // 既存のドキュメントを確認（メールアドレスで検索）
      try {
        const membersRef = collection(db, 'users', ownerId, 'sharedMembers');
        const q = query(membersRef, where('email', '==', currentUser.email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          // 既存のドキュメントをUIDベースのIDに移動
          const oldDoc = snapshot.docs[0];
          if (oldDoc.id !== currentUser.uid) {
            // 古いドキュメントを削除（オーナーのみ可能なので、ここではスキップ）
            // 代わりに、UIDベースのドキュメントを作成/更新する
          }
        }
      } catch (queryError) {
        // クエリエラーは無視（新規作成として処理）
        console.warn('既存メンバーの検索に失敗しました（新規作成として処理）:', queryError);
      }
      
      // UIDベースのドキュメントを作成/更新
      await setDoc(memberRef, {
        email: currentUser.email,
        userId: currentUser.uid,
        displayName: currentUser.displayName || currentUser.email,
        permission: permission,
        status: 'accepted',
        hasLoggedIn: true, // ログイン済みフラグ
        acceptedAt: serverTimestamp(),
        loggedInAt: serverTimestamp()
      }, { merge: true });

      // 共有アクセス情報をsharedAccessコレクションに保存（オーナーIDを簡単に取得できるように）
      const sharedAccessRef = collection(db, 'sharedAccess');
      // オーナーのメールアドレスを取得（招待トークンから）
      const inviteTokenRef = doc(db, 'inviteTokens', inviteTokenId);
      const inviteTokenSnapshot = await getDoc(inviteTokenRef);
      const ownerEmailFromToken = inviteTokenSnapshot.exists() ? inviteTokenSnapshot.data().ownerEmail : null;
      
      await setDoc(doc(db, 'sharedAccess', `${ownerId}_${currentUser.uid}`), {
        ownerId: ownerId,
        ownerEmail: ownerEmailFromToken || null,
        memberId: currentUser.uid,
        memberEmail: currentUser.email,
        permission: permission,
        status: 'accepted',
        acceptedAt: serverTimestamp()
      }, { merge: true });

      // 招待トークンを削除
      try {
        await deleteDoc(inviteTokenRef);
      } catch (deleteError) {
        // トークン削除エラーは警告のみ（メンバー情報は既に更新済み）
        console.warn('招待トークンの削除に失敗しました:', deleteError);
      }

      // マイページにリダイレクト
      navigate('/mypage-authenticated');
      alert('招待を承認しました。');
    } catch (error) {
      console.error('招待承認エラー:', error);
      console.error('エラーコード:', error.code);
      console.error('エラーメッセージ:', error.message);
      console.error('エラー詳細:', error);
      throw error;
    }
  };

  // Googleログイン
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // ログイン後、useEffectで自動的に招待が承認される
    } catch (error) {
      console.error('ログインエラー:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert('ログインに失敗しました。');
      }
    }
  };

  if (loading) {
    return (
      <div className="invite-page">
        <div className="invite-container">
          <div className="invite-card">
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invite-page">
        <div className="invite-container">
          <div className="invite-card error">
            <h2>エラー</h2>
            <p>{error}</p>
            <button className="back-button" onClick={() => navigate('/')}>
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!inviteData) {
    return null;
  }

  if (currentUser) {
    // ログイン済みの場合
    if (currentUser.email !== inviteData.email) {
      return (
        <div className="invite-page">
          <div className="invite-container">
            <div className="invite-card error">
              <h2>アカウントが一致しません</h2>
              <p>
                この招待は <strong>{inviteData.email}</strong> 宛てです。
                <br />
                現在ログインしているアカウント（<strong>{currentUser.email}</strong>）とは異なります。
              </p>
              <p>正しいアカウントでログインしてください。</p>
              <button className="back-button" onClick={() => navigate('/mypage-authenticated')}>
                マイページに戻る
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 処理中の場合
    if (processing) {
      return (
        <div className="invite-page">
          <div className="invite-container">
            <div className="invite-card">
              <h2>招待を承認中...</h2>
              <p>しばらくお待ちください。</p>
            </div>
          </div>
        </div>
      );
    }
  }

  // 未ログインの場合
  return (
    <div className="invite-page">
      <div className="invite-container">
        <div className="invite-card">
          <h2>🔔 共有の招待</h2>
          <div className="invite-info">
            <p>
              <strong>{inviteData.ownerEmail}</strong> から共有の招待があります。
            </p>
            <div className="invite-details">
              <div className="detail-item">
                <span className="detail-label">メールアドレス:</span>
                <span className="detail-value">{inviteData.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">権限:</span>
                <span className="detail-value">
                  {inviteData.permission === 'viewer' ? '閲覧のみ' : '編集可能'}
                </span>
              </div>
            </div>
          </div>
          <div className="invite-actions">
            <p className="invite-instruction">
              上記のメールアドレスでGoogleアカウントにログインしてください。
              <br />
              ログイン後、自動的に招待が承認されます。
            </p>
            <button className="login-button" onClick={handleLogin} disabled={processing}>
              {processing ? '処理中...' : 'Googleアカウントでログイン'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;

