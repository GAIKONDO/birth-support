import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import './Invitations.css';

const Invitations = () => {
  const { currentUser } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 招待を読み込む
  useEffect(() => {
    if (!currentUser) return;

    const invitationsRef = collection(db, 'invitations');
    const q = query(invitationsRef, where('email', '==', currentUser.email));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invites = [];
      snapshot.forEach((doc) => {
        invites.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setInvitations(invites);
      setLoading(false);
    }, (error) => {
      console.error('招待読み込みエラー:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 招待を承認
  const handleAcceptInvitation = async (invitationId, ownerId, permission) => {
    if (!currentUser) return;

    try {
      // オーナーの共有メンバーリストを更新（メールアドレスで検索）
      const membersRef = collection(db, 'users', ownerId, 'sharedMembers');
      const q = query(membersRef, where('email', '==', currentUser.email));
      const snapshot = await getDocs(q);
      
      // UIDをドキュメントIDとして使用（承認時にUIDに更新）
      const memberRef = doc(db, 'users', ownerId, 'sharedMembers', currentUser.uid);
      
      if (!snapshot.empty) {
        // 既存のドキュメントをUIDベースのIDに移動
        const oldDoc = snapshot.docs[0];
        if (oldDoc.id !== currentUser.uid) {
          // 古いドキュメントを削除
          await deleteDoc(oldDoc.ref);
        }
      }
      
      // UIDベースのドキュメントを作成/更新
      await setDoc(memberRef, {
        email: currentUser.email,
        userId: currentUser.uid,
        displayName: currentUser.displayName || currentUser.email,
        permission: permission,
        status: 'accepted',
        acceptedAt: serverTimestamp()
      }, { merge: true });

      // 招待を削除
      const invitationRef = doc(db, 'invitations', invitationId);
      await deleteDoc(invitationRef);

      alert('招待を承認しました。');
    } catch (error) {
      console.error('招待承認エラー:', error);
      alert('招待の承認に失敗しました。');
    }
  };

  // 招待を拒否
  const handleRejectInvitation = async (invitationId, ownerId) => {
    if (!currentUser) return;

    try {
      // オーナーの共有メンバーリストを更新（メールアドレスで検索）
      const membersRef = collection(db, 'users', ownerId, 'sharedMembers');
      const q = query(membersRef, where('email', '==', currentUser.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // 既存のドキュメントを更新
        const memberDoc = snapshot.docs[0];
        await updateDoc(memberDoc.ref, {
          status: 'rejected',
          rejectedAt: serverTimestamp()
        });
      } else {
        // 新規作成
        const memberRef = doc(db, 'users', ownerId, 'sharedMembers', currentUser.uid);
        await setDoc(memberRef, {
          email: currentUser.email,
          status: 'rejected',
          rejectedAt: serverTimestamp()
        }, { merge: true });
      }

      // 招待を削除
      const invitationRef = doc(db, 'invitations', invitationId);
      await deleteDoc(invitationRef);

      alert('招待を拒否しました。');
    } catch (error) {
      console.error('招待拒否エラー:', error);
      alert('招待の拒否に失敗しました。');
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="invitations-section">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="invitations-section">
      <div className="invitations-card">
        <div className="invitations-header">
          <h3 className="invitations-title">🔔 招待通知</h3>
          <span className="invitations-count">{invitations.length}件</span>
        </div>
        <p className="invitations-description">
          他のユーザーから共有の招待が届いています。承認すると、そのユーザーのデータにアクセスできるようになります。
        </p>
        <div className="invitations-list">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="invitation-item">
              <div className="invitation-info">
                <p className="invitation-message">
                  <strong>{invitation.ownerEmail}</strong> から共有の招待があります。
                  <br />
                  <span className="invitation-permission">
                    権限: {invitation.permission === 'viewer' ? '閲覧のみ' : '編集可能'}
                  </span>
                </p>
              </div>
              <div className="invitation-actions">
                <button
                  className="accept-button"
                  onClick={() => handleAcceptInvitation(invitation.id, invitation.ownerId, invitation.permission)}
                >
                  承認
                </button>
                <button
                  className="reject-button"
                  onClick={() => handleRejectInvitation(invitation.id, invitation.ownerId)}
                >
                  拒否
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Invitations;

