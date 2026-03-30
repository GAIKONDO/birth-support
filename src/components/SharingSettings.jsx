import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import './SharingSettings.css';

const SharingSettings = () => {
  const { currentUser } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState('viewer');
  const [inviting, setInviting] = useState(false);
  const [sharedMembers, setSharedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteLinks, setInviteLinks] = useState({}); // { memberId: inviteLink }
  const [lastInviteLink, setLastInviteLink] = useState(''); // 最後に生成された招待リンク

  // 共有メンバーを読み込む
  useEffect(() => {
    if (!currentUser) return;

    const membersRef = collection(db, 'users', currentUser.uid, 'sharedMembers');
    
    const unsubscribe = onSnapshot(membersRef, (snapshot) => {
      const membersMap = new Map(); // メールアドレスまたはUIDをキーとして使用
      const links = {};
      const loggedInEmails = new Set(); // ログイン済みのメールアドレスを記録
      
      // まず、ログイン済みのメンバーを収集
      snapshot.forEach((doc) => {
        const memberData = {
          id: doc.id,
          ...doc.data()
        };
        
        if (memberData.hasLoggedIn && memberData.email) {
          loggedInEmails.add(memberData.email);
        }
      });
      
      // メンバーを処理（ログイン済みのメールアドレスの「招待中」は除外）
      snapshot.forEach((doc) => {
        const memberData = {
          id: doc.id,
          ...doc.data()
        };
        
        // ログイン済みのメールアドレスで「招待中」の場合はスキップ
        if (memberData.status === 'pending' && loggedInEmails.has(memberData.email)) {
          return;
        }
        
        // キーを決定（userIdが存在する場合はuserId、存在しない場合はemail）
        const key = memberData.userId || memberData.email;
        
        // 既存のメンバーが存在する場合
        if (membersMap.has(key)) {
          const existingMember = membersMap.get(key);
          // UIDベースのドキュメントを優先（userIdが存在する場合）
          if (memberData.userId && !existingMember.userId) {
            membersMap.set(key, memberData);
          }
          // 両方UIDベースまたは両方メールアドレスベースの場合、より新しい情報を優先
          else if (memberData.userId === existingMember.userId) {
            // hasLoggedInがtrueの方を優先
            if (memberData.hasLoggedIn && !existingMember.hasLoggedIn) {
              membersMap.set(key, memberData);
            }
            // どちらもhasLoggedInが同じ場合、statusがacceptedの方を優先
            else if (memberData.hasLoggedIn === existingMember.hasLoggedIn) {
              if (memberData.status === 'accepted' && existingMember.status !== 'accepted') {
                membersMap.set(key, memberData);
              }
            }
          }
        } else {
          membersMap.set(key, memberData);
        }
        
        // 招待リンクを生成（inviteTokenが存在する場合）
        if (memberData.inviteToken) {
          const inviteUrl = `${window.location.origin}/invite/${memberData.inviteToken}`;
          // キーを使用してリンクを保存
          links[key] = inviteUrl;
        }
      });
      
      // Mapから配列に変換
      const members = Array.from(membersMap.values());
      
      // リンクをメンバーIDにマッピング
      const memberLinks = {};
      members.forEach(member => {
        const key = member.userId || member.email;
        if (links[key]) {
          memberLinks[member.id] = links[key];
        }
      });
      
      setSharedMembers(members);
      setInviteLinks(memberLinks);
      setLoading(false);
    }, (error) => {
      console.error('共有メンバー読み込みエラー:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 招待を送信
  const handleInvite = async () => {
    if (!currentUser || !inviteEmail.trim()) {
      alert('メールアドレスを入力してください。');
      return;
    }

    // 自分自身を招待できないようにチェック
    if (inviteEmail === currentUser.email) {
      alert('自分自身を招待することはできません。');
      return;
    }

    // 既に招待されているかチェック
    const existingMember = sharedMembers.find(m => m.email === inviteEmail.trim());
    if (existingMember) {
      alert('このメールアドレスは既に招待されています。');
      return;
    }

    setInviting(true);
    try {
      // 一意の招待トークンを生成
      const inviteToken = crypto.randomUUID();
      
      // 招待時はメールアドレスで検索し、承認時にUIDで更新する
      // まず、メールアドレスで検索して既存のドキュメントを確認
      const membersRef = collection(db, 'users', currentUser.uid, 'sharedMembers');
      const q = query(membersRef, where('email', '==', inviteEmail.trim()));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // 既存のドキュメントを更新
        const memberDoc = snapshot.docs[0];
        await updateDoc(memberDoc.ref, {
          permission: invitePermission,
          status: 'pending',
          invitedBy: currentUser.email,
          invitedAt: serverTimestamp(),
          inviteToken: inviteToken
        });
      } else {
        // 新規作成（一時的なIDを使用、後で承認時にUIDに更新）
        await addDoc(membersRef, {
          email: inviteEmail.trim(),
          permission: invitePermission,
          status: 'pending', // pending, accepted, rejected
          invitedBy: currentUser.email,
          invitedAt: serverTimestamp(),
          displayName: null, // 承認後に設定される
          userId: null, // 承認後に設定される
          inviteToken: inviteToken
        });
      }

      // 招待トークンをFirestoreに保存（トークンで検索できるように）
      const inviteTokensRef = collection(db, 'inviteTokens');
      await addDoc(inviteTokensRef, {
        token: inviteToken,
        email: inviteEmail.trim(),
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email,
        permission: invitePermission,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // 招待リンクを生成して表示
      const inviteUrl = `${window.location.origin}/invite/${inviteToken}`;
      setLastInviteLink(inviteUrl);
      
      // クリップボードにコピー
      try {
        await navigator.clipboard.writeText(inviteUrl);
        alert('招待を送信しました。招待リンクをクリップボードにコピーしました。\n\n下記の「招待リンク」セクションからも確認できます。');
      } catch (err) {
        console.error('クリップボードへのコピーに失敗:', err);
        alert(`招待を送信しました。\n\n招待リンク:\n${inviteUrl}\n\nこのリンクをコピーして共有してください。`);
      }
      
      setInviteEmail('');
      setInvitePermission('viewer');
    } catch (error) {
      console.error('招待送信エラー:', error);
      console.error('エラーコード:', error.code);
      console.error('エラーメッセージ:', error.message);
      console.error('エラー詳細:', error);
      
      let errorMessage = '招待の送信に失敗しました。';
      if (error.code === 'permission-denied') {
        errorMessage = `招待の送信に失敗しました。Firestoreのセキュリティルールを確認してください。\n\nエラーコード: ${error.code}\nエラーメッセージ: ${error.message}\n\n以下のコレクションへの書き込み権限を確認してください:\n- users/{userId}/sharedMembers\n- inviteTokens`;
      } else if (error.message) {
        errorMessage = `招待の送信に失敗しました。\n\nエラーコード: ${error.code || '不明'}\nエラーメッセージ: ${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setInviting(false);
    }
  };

  // 権限を更新
  const handleUpdatePermission = async (memberId, newPermission) => {
    if (!currentUser) return;

    try {
      const memberRef = doc(db, 'users', currentUser.uid, 'sharedMembers', memberId);
      await updateDoc(memberRef, {
        permission: newPermission
      });
      alert('権限を更新しました。');
    } catch (error) {
      console.error('権限更新エラー:', error);
      alert('権限の更新に失敗しました。');
    }
  };

  // メンバーを削除
  const handleRemoveMember = async (memberId, email) => {
    if (!currentUser) return;

    if (!window.confirm(`${email} を共有から削除しますか？`)) {
      return;
    }

    try {
      const memberRef = doc(db, 'users', currentUser.uid, 'sharedMembers', memberId);
      await deleteDoc(memberRef);

      // 招待情報も削除
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef,
        where('email', '==', email),
        where('ownerId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      alert('メンバーを削除しました。');
    } catch (error) {
      console.error('メンバー削除エラー:', error);
      alert('メンバーの削除に失敗しました。');
    }
  };

  // 権限の表示名を取得
  const getPermissionLabel = (permission) => {
    switch (permission) {
      case 'viewer':
        return '閲覧のみ';
      case 'editor':
        return '編集可能';
      default:
        return permission;
    }
  };

  // ステータスの表示名を取得
  const getStatusLabel = (status, hasLoggedIn) => {
    if (status === 'accepted' && hasLoggedIn) {
      return 'ログイン済み';
    }
    switch (status) {
      case 'pending':
        return '招待中';
      case 'accepted':
        return '承認済み';
      case 'rejected':
        return '拒否済み';
      default:
        return status;
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="sharing-settings-section">
      <div className="section-header">
        <h3>共有設定</h3>
      </div>

      {/* 招待フォーム */}
      <div className="invite-form">
        <h4 className="subsection-title">メンバーを招待</h4>
        <div className="invite-input-group">
          <input
            type="email"
            className="invite-email-input"
            placeholder="招待するメールアドレス（Googleアカウント）"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={inviting}
          />
          <select
            className="invite-permission-select"
            value={invitePermission}
            onChange={(e) => setInvitePermission(e.target.value)}
            disabled={inviting}
          >
            <option value="viewer">閲覧のみ</option>
            <option value="editor">編集可能</option>
          </select>
          <button
            className="invite-button"
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.trim()}
          >
            {inviting ? '招待中...' : '招待する'}
          </button>
        </div>
        <p className="invite-note">
          Googleアカウントのメールアドレスで招待してください。招待後、招待リンクが生成され、下記に表示されます。
        </p>
        
        {/* 最後に生成された招待リンクを表示 */}
        {lastInviteLink && (
          <div className="last-invite-link-section">
            <label className="invite-link-label">最新の招待リンク:</label>
            <div className="invite-link-group">
              <input
                type="text"
                className="invite-link-input"
                value={lastInviteLink}
                readOnly
                onClick={(e) => e.target.select()}
              />
              <button
                className="copy-link-button"
                onClick={() => {
                  navigator.clipboard.writeText(lastInviteLink);
                  alert('招待リンクをコピーしました。');
                }}
              >
                コピー
              </button>
            </div>
            <p className="invite-link-note">
              このリンクを共有してください。リンクからアクセスしてログインすると、自動的に招待が承認されます。
            </p>
          </div>
        )}
      </div>

      {/* 共有メンバー一覧 */}
      <div className="shared-members-section">
        <h4 className="subsection-title">共有メンバー</h4>
        {loading ? (
          <p className="loading-text">読み込み中...</p>
        ) : sharedMembers.length === 0 ? (
          <p className="no-members-text">共有メンバーはいません。</p>
        ) : (
          <div className="members-list">
            {sharedMembers.map((member) => (
              <div key={member.id} className="member-card">
                <div className="member-info">
                  <div className="member-email">
                    {member.displayName || member.email}
                    {member.displayName && (
                      <span className="member-email-sub">({member.email})</span>
                    )}
                  </div>
                  {/* ステータスバッジを表示 */}
                  <div className="member-status">
                    {member.hasLoggedIn ? (
                      <span className="status-badge status-accepted has-logged-in">
                        ログイン済み
                      </span>
                    ) : (
                      <span className={`status-badge status-${member.status}`}>
                        {getStatusLabel(member.status, member.hasLoggedIn)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="member-actions">
                  <select
                    className="permission-select"
                    value={member.permission}
                    onChange={(e) => handleUpdatePermission(member.id, e.target.value)}
                    disabled={member.status !== 'accepted'}
                  >
                    <option value="viewer">閲覧のみ</option>
                    <option value="editor">編集可能</option>
                  </select>
                  {/* 招待リンクが存在する場合は「リンクを共有する」ボタンを表示 */}
                  {inviteLinks[member.id] && (
                    <button
                      className="share-link-button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(inviteLinks[member.id]);
                          alert('招待リンクをクリップボードにコピーしました。');
                        } catch (err) {
                          console.error('クリップボードへのコピーに失敗:', err);
                          alert('クリップボードへのコピーに失敗しました。');
                        }
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                        <polyline points="16 6 12 2 8 6"></polyline>
                        <line x1="12" y1="2" x2="12" y2="15"></line>
                      </svg>
                      リンクを共有する
                    </button>
                  )}
                  <button
                    className="remove-member-button"
                    onClick={() => handleRemoveMember(member.id, member.email)}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharingSettings;

