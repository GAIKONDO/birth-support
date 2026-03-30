import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

/**
 * 現在のユーザーがアクセスすべきオーナーIDを取得する
 * 自分自身の場合は自分のUID、共有メンバーの場合はオーナーのUIDを返す
 * URLパラメータでownerが指定されている場合はそのオーナーのページを表示
 */
export const useOwnerId = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [ownerId, setOwnerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSharedMember, setIsSharedMember] = useState(false);
  const [permission, setPermission] = useState(null);
  const [ownerEmail, setOwnerEmail] = useState(null);
  const [ownerDisplayName, setOwnerDisplayName] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setOwnerId(null);
      setLoading(false);
      return;
    }

    // URLパラメータでownerが指定されている場合
    const ownerParam = searchParams.get('owner');
    if (ownerParam) {
      setOwnerId(ownerParam);
      setIsSharedMember(true);
      setLoading(true);
      
      // 共有アクセス情報を確認
      const sharedAccessRef = collection(db, 'sharedAccess');
      const q = query(
        sharedAccessRef,
        where('memberId', '==', currentUser.uid),
        where('ownerId', '==', ownerParam)
      );
      
      getDocs(q)
        .then(async (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            if (data.status === 'accepted') {
              setPermission(data.permission || 'viewer');
              setOwnerEmail(data.ownerEmail || null);
              
              // オーナーのプロフィール情報を取得
              try {
                const ownerProfileRef = doc(db, 'users', ownerParam, 'data', 'profile');
                const ownerProfileSnapshot = await getDoc(ownerProfileRef);
                if (ownerProfileSnapshot.exists()) {
                  const ownerProfileData = ownerProfileSnapshot.data();
                  if (ownerProfileData.sharedDisplayName) {
                    setOwnerDisplayName(ownerProfileData.sharedDisplayName);
                  } else if (ownerProfileData.basicInfo?.motherName) {
                    setOwnerDisplayName(ownerProfileData.basicInfo.motherName);
                  } else if (data.ownerEmail) {
                    const emailName = data.ownerEmail.split('@')[0];
                    setOwnerDisplayName(emailName);
                  }
                } else {
                  if (data.ownerEmail) {
                    const emailName = data.ownerEmail.split('@')[0];
                    setOwnerDisplayName(emailName);
                  }
                }
              } catch (error) {
                console.error('オーナープロフィール情報の取得エラー:', error);
                if (data.ownerEmail) {
                  const emailName = data.ownerEmail.split('@')[0];
                  setOwnerDisplayName(emailName);
                }
              }
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('共有アクセス情報の取得エラー:', error);
          setLoading(false);
        });
      return;
    }

    // URLパラメータがない場合は常に自分のマイページを表示
    setOwnerId(currentUser.uid);
    setIsSharedMember(false);
    setPermission(null);
    setOwnerEmail(null);
    setOwnerDisplayName(null);
    setLoading(false);
  }, [currentUser, searchParams]);

  return { ownerId, loading, isSharedMember, permission, ownerEmail, ownerDisplayName };
};

