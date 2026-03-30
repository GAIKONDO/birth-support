import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot, deleteField } from 'firebase/firestore';
import { useOwnerId } from '../hooks/useOwnerId';
import { useSupportSystems } from '../hooks/useSupportSystems';
import './MyPage.css';

// 都道府県リスト（47都道府県 + 海外）
const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県', '海外'
];

const MyPage = () => {
  const { currentUser } = useAuth();
  const { ownerId, loading: ownerIdLoading, isSharedMember, permission, ownerEmail, ownerDisplayName } = useOwnerId();
  const [dueDate, setDueDate] = useState('');
  const [originalDueDate, setOriginalDueDate] = useState('');
  const [firstExaminationDate, setFirstExaminationDate] = useState('');
  const [originalFirstExaminationDate, setOriginalFirstExaminationDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    // 母親の情報
    motherBirthDate: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    phoneNumber: '',
    insurances: [], // [{ type: '健康保険組合', name: '' }, ...]
    annualIncome: '',
    companyName: '',
    employmentType: '',
    isSelfEmployed: false,
    // 父親の情報
    fatherBirthDate: '',
    fatherPhoneNumber: '',
    fatherAnnualIncome: '',
    fatherCompanyName: '',
    fatherEmploymentType: '',
    fatherIsSelfEmployed: false,
    fatherInsurances: [], // [{ type: '健康保険組合', name: '' }, ...]
    // 住所の同一/別居
    sameAddress: true,
    fatherPostalCode: '',
    fatherPrefecture: '',
    fatherCity: '',
    fatherAddress: '',
    // 兄弟・姉妹
    children: [], // [{ gender: '男'|'女', birthDate: 'YYYY-MM-DD' }, ...]
    // その他
    planMaternityLeave: '',
    planChildcareLeave: '',
    fatherPlanMaternityLeave: '',
    fatherPlanChildcareLeave: ''
  });
  const [originalBasicInfo, setOriginalBasicInfo] = useState({});
  
  // 共有ページ名の状態管理
  const [sharedDisplayName, setSharedDisplayName] = useState('');
  const [originalSharedDisplayName, setOriginalSharedDisplayName] = useState('');
  const [isEditingSharedDisplayName, setIsEditingSharedDisplayName] = useState(false);
  
  // 追加済み制度とアクションの状態管理
  const [addedSystems, setAddedSystems] = useState(new Set());
  const [actions, setActions] = useState([]);
  
  // 支援制度のマスターデータを取得
  const { systems: supportSystems } = useSupportSystems({ activeOnly: true });

  // Firestoreから出産予定日を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
    
    // まず一度だけ読み込む
    getDoc(userDataRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.dueDate) {
            setDueDate(data.dueDate);
            setOriginalDueDate(data.dueDate);
          }
          if (data.firstExaminationDate) {
            setFirstExaminationDate(data.firstExaminationDate);
            setOriginalFirstExaminationDate(data.firstExaminationDate);
          }
        }
      })
      .catch((error) => {
        console.error('データ読み込みエラー:', error);
      });
    
    // リアルタイムで監視
    const unsubscribe = onSnapshot(userDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.dueDate) {
          setDueDate(data.dueDate);
          setOriginalDueDate(data.dueDate);
        } else {
          setDueDate('');
          setOriginalDueDate('');
        }
        if (data.firstExaminationDate) {
          setFirstExaminationDate(data.firstExaminationDate);
          setOriginalFirstExaminationDate(data.firstExaminationDate);
        } else {
          setFirstExaminationDate('');
          setOriginalFirstExaminationDate('');
        }
      } else {
        setDueDate('');
        setOriginalDueDate('');
        setFirstExaminationDate('');
        setOriginalFirstExaminationDate('');
      }
    }, (error) => {
      console.error('データ監視エラー:', error);
      if (error.code === 'permission-denied') {
        console.warn('Firestoreのセキュリティルールを確認してください。');
      }
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);

  // Firestoreから基本情報を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
    
    getDoc(userDataRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.basicInfo) {
            // デフォルト値をマージ（既存データとの互換性のため）
            const mergedBasicInfo = {
              sameAddress: true,
              fatherPostalCode: '',
              fatherPrefecture: '',
              fatherCity: '',
              fatherAddress: '',
              motherBirthDate: '',
              fatherBirthDate: '',
              fatherPhoneNumber: '',
              insurances: [],
              fatherInsurances: [],
              children: [],
              ...data.basicInfo
            };
            // 既存のageフィールドがある場合は削除（後方互換性）
            if (mergedBasicInfo.motherAge !== undefined) {
              delete mergedBasicInfo.motherAge;
            }
            if (mergedBasicInfo.fatherAge !== undefined) {
              delete mergedBasicInfo.fatherAge;
            }
            // 既存のinsuranceType/insuranceNameをinsurances配列に変換（後方互換性）
            if (mergedBasicInfo.insuranceType && !mergedBasicInfo.insurances) {
              mergedBasicInfo.insurances = [{
                type: mergedBasicInfo.insuranceType,
                name: mergedBasicInfo.insuranceName || ''
              }];
              delete mergedBasicInfo.insuranceType;
              delete mergedBasicInfo.insuranceName;
            }
            if (mergedBasicInfo.fatherInsuranceType && !mergedBasicInfo.fatherInsurances) {
              mergedBasicInfo.fatherInsurances = [{
                type: mergedBasicInfo.fatherInsuranceType,
                name: mergedBasicInfo.fatherInsuranceName || ''
              }];
              delete mergedBasicInfo.fatherInsuranceType;
              delete mergedBasicInfo.fatherInsuranceName;
            }
            // 配列が未定義の場合は空配列に初期化
            if (!Array.isArray(mergedBasicInfo.insurances)) {
              mergedBasicInfo.insurances = [];
            }
            if (!Array.isArray(mergedBasicInfo.fatherInsurances)) {
              mergedBasicInfo.fatherInsurances = [];
            }
            // 既存のnumberOfChildren/childrenAgesをchildren配列に変換（後方互換性）
            if (mergedBasicInfo.numberOfChildren && !mergedBasicInfo.children) {
              const num = parseInt(mergedBasicInfo.numberOfChildren) || 0;
              mergedBasicInfo.children = Array.from({ length: num }, () => ({ gender: '', birthDate: '' }));
              delete mergedBasicInfo.numberOfChildren;
              delete mergedBasicInfo.childrenAges;
            }
            // 配列が未定義の場合は空配列に初期化
            if (!Array.isArray(mergedBasicInfo.children)) {
              mergedBasicInfo.children = [];
            }
            setBasicInfo(mergedBasicInfo);
            setOriginalBasicInfo(mergedBasicInfo);
          }
        }
      })
      .catch((error) => {
        console.error('基本情報読み込みエラー:', error);
      });
    
    const unsubscribe = onSnapshot(userDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.basicInfo) {
          // デフォルト値をマージ（既存データとの互換性のため）
          const mergedBasicInfo = {
            sameAddress: true,
            fatherPostalCode: '',
            fatherPrefecture: '',
            fatherCity: '',
            fatherAddress: '',
            motherBirthDate: '',
            fatherBirthDate: '',
            fatherPhoneNumber: '',
            insurances: [],
            fatherInsurances: [],
            children: [],
            ...data.basicInfo
          };
          // 既存のageフィールドがある場合は削除（後方互換性）
          if (mergedBasicInfo.motherAge !== undefined) {
            delete mergedBasicInfo.motherAge;
          }
          if (mergedBasicInfo.fatherAge !== undefined) {
            delete mergedBasicInfo.fatherAge;
          }
          // 既存のinsuranceType/insuranceNameをinsurances配列に変換（後方互換性）
          if (mergedBasicInfo.insuranceType && !mergedBasicInfo.insurances) {
            mergedBasicInfo.insurances = [{
              type: mergedBasicInfo.insuranceType,
              name: mergedBasicInfo.insuranceName || ''
            }];
            delete mergedBasicInfo.insuranceType;
            delete mergedBasicInfo.insuranceName;
          }
          if (mergedBasicInfo.fatherInsuranceType && !mergedBasicInfo.fatherInsurances) {
            mergedBasicInfo.fatherInsurances = [{
              type: mergedBasicInfo.fatherInsuranceType,
              name: mergedBasicInfo.fatherInsuranceName || ''
            }];
            delete mergedBasicInfo.fatherInsuranceType;
            delete mergedBasicInfo.fatherInsuranceName;
          }
          // 配列が未定義の場合は空配列に初期化
          if (!Array.isArray(mergedBasicInfo.insurances)) {
            mergedBasicInfo.insurances = [];
          }
          if (!Array.isArray(mergedBasicInfo.fatherInsurances)) {
            mergedBasicInfo.fatherInsurances = [];
          }
          // 既存のnumberOfChildren/childrenAgesをchildren配列に変換（後方互換性）
          if (mergedBasicInfo.numberOfChildren && !mergedBasicInfo.children) {
            const num = parseInt(mergedBasicInfo.numberOfChildren) || 0;
            mergedBasicInfo.children = Array.from({ length: num }, () => ({ gender: '', birthDate: '' }));
            delete mergedBasicInfo.numberOfChildren;
            delete mergedBasicInfo.childrenAges;
          }
          // 配列が未定義の場合は空配列に初期化
          if (!Array.isArray(mergedBasicInfo.children)) {
            mergedBasicInfo.children = [];
          }
          setBasicInfo(mergedBasicInfo);
          setOriginalBasicInfo(mergedBasicInfo);
        }
      }
    }, (error) => {
      console.error('基本情報監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);

  // Firestoreから共有ページ名を読み込む
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

  // Firestoreから追加済み制度を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const addedSystemsRef = doc(db, 'users', ownerId, 'data', 'addedSystems');
    
    getDoc(addedSystemsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const systemIds = data.systemIds || [];
          setAddedSystems(new Set(systemIds));
        } else {
          setAddedSystems(new Set());
        }
      })
      .catch((error) => {
        console.error('追加済み制度読み込みエラー:', error);
      });
    
    const unsubscribe = onSnapshot(addedSystemsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const systemIds = data.systemIds || [];
        setAddedSystems(new Set(systemIds));
      } else {
        setAddedSystems(new Set());
      }
    }, (error) => {
      console.error('追加済み制度監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);

  // Firestoreからアクションを読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const actionsRef = doc(db, 'users', ownerId, 'data', 'actions');
    
    const unsubscribe = onSnapshot(actionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setActions(data.actions || []);
      } else {
        setActions([]);
      }
    }, (error) => {
      console.error('アクション監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);

  // 登録済みの支援制度を取得
  const getRegisteredSystems = () => {
    const registeredSystemIds = new Set();
    
    // addedSystemsから取得
    addedSystems.forEach(systemId => {
      registeredSystemIds.add(systemId);
    });
    
    // アクションのサブアクションから取得
    actions.forEach(action => {
      if (action.subActions && Array.isArray(action.subActions)) {
        action.subActions.forEach(subAction => {
          let systemId = null;
          if (subAction.actionName === '出産育児一時金') {
            systemId = 1;
          } else if (subAction.actionName === '育児休業の申請') {
            systemId = 2;
          } else if (subAction.actionName === '出産手当金の申請') {
            systemId = 3;
          } else if (subAction.actionName === '児童手当の申請') {
            systemId = 4;
          }
          
          if (systemId) {
            registeredSystemIds.add(systemId);
          }
        });
      }
    });
    
    // マスターデータからタイトルを取得
    return Array.from(registeredSystemIds)
      .map(systemId => {
        const system = supportSystems.find(s => Number(s.id) === systemId);
        return system ? system.title : null;
      })
      .filter(title => title !== null)
      .sort();
  };

  // 出産予定日と初回診察日を保存
  const handleSaveDueDate = async () => {
    if (!currentUser || !ownerId) return;
    
    // 共有メンバーの場合、編集権限がない場合は保存できない
    if (isSharedMember && permission !== 'editor') {
      alert('共有メンバーは編集権限がありません。');
      return;
    }

    if (!dueDate) {
      alert('出産予定日を入力してください。');
      return;
    }

    // 出産予定日が変更されている場合、確認ダイアログを表示
    if (originalDueDate && originalDueDate !== dueDate) {
      const confirmMessage = `出産予定日を更新しますか？\n\n現在: ${new Date(originalDueDate).toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      })}\n新しい日付: ${new Date(dueDate).toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      })}\n\nアクション管理の「妊娠期間」「産褥期」「授乳期」の終了日が自動的に更新されます。\n「母子手帳取得」は既に設定済みの場合は変更されません。`;
      
      if (!window.confirm(confirmMessage)) {
        // キャンセルされた場合、元の値に戻す
        setDueDate(originalDueDate);
        setFirstExaminationDate(originalFirstExaminationDate);
        setIsEditing(false);
        return;
      }
    }

    setSaving(true);
    try {
      const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
      const dataToSave = { dueDate };
      if (firstExaminationDate) {
        dataToSave.firstExaminationDate = firstExaminationDate;
      }
      await setDoc(userDataRef, dataToSave, { merge: true });
      setOriginalDueDate(dueDate);
      setOriginalFirstExaminationDate(firstExaminationDate);
      setIsEditing(false);
      console.log('出産予定日と初回診察日を保存しました:', { dueDate, firstExaminationDate });
    } catch (error) {
      console.error('データ保存エラー:', error);
      console.error('エラーコード:', error.code);
      console.error('エラーメッセージ:', error.message);
      
      let errorMessage = 'データの保存に失敗しました。';
      if (error.code === 'permission-denied') {
        errorMessage = '保存に失敗しました。Firestoreのセキュリティルールを確認してください。\n\nFirebase Consoleで以下のルールを設定してください：\n\nrules_version = \'2\';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /users/{userId}/data/{document=**} {\n      allow read, write: if request.auth != null && request.auth.uid == userId;\n    }\n  }\n}';
      } else if (error.message) {
        errorMessage = `データの保存に失敗しました。\n\nエラー: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // 元の値に戻す
    setDueDate(originalDueDate);
    setFirstExaminationDate(originalFirstExaminationDate);
    setIsEditing(false);
  };

  // 出産予定日をリセット（削除）
  const handleResetDueDate = async () => {
    if (!currentUser || !ownerId) return;
    
    // 共有メンバーの場合、編集権限がない場合は削除できない
    if (isSharedMember) {
      alert('共有メンバーは編集権限がありません。');
      return;
    }

    if (!dueDate) {
      alert('出産予定日が設定されていません。');
      return;
    }

    const confirmMessage = `出産予定日をリセットしますか？\n\n現在の出産予定日: ${new Date(dueDate).toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })}\n\n出産予定日を削除すると、アクション管理の「妊娠期間」「産褥期」「授乳期」「母子手帳取得」のアクションは削除されませんが、出産予定日を基準にした自動設定は無効になります。`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSaving(true);
    try {
      const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
      await setDoc(userDataRef, { dueDate: deleteField() }, { merge: true });
      setDueDate('');
      setOriginalDueDate('');
      console.log('出産予定日をリセットしました');
      alert('出産予定日をリセットしました。');
    } catch (error) {
      console.error('出産予定日リセットエラー:', error);
      console.error('エラーコード:', error.code);
      console.error('エラーメッセージ:', error.message);
      
      let errorMessage = '出産予定日のリセットに失敗しました。';
      if (error.code === 'permission-denied') {
        errorMessage = 'リセットに失敗しました。Firestoreのセキュリティルールを確認してください。';
      } else if (error.message) {
        errorMessage = `出産予定日のリセットに失敗しました。\n\nエラー: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // 基本情報を保存
  const handleSaveBasicInfo = async () => {
    if (!currentUser || !ownerId) return;
    
    // 共有メンバーの場合、編集権限がない場合は保存できない
    if (isSharedMember && permission !== 'editor') {
      alert('共有メンバーは編集権限がありません。');
      return;
    }

    setSaving(true);
    try {
      const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
      await setDoc(userDataRef, { basicInfo }, { merge: true });
      setOriginalBasicInfo(basicInfo);
      setIsEditingBasicInfo(false);
      console.log('基本情報を保存しました:', basicInfo);
      alert('基本情報を保存しました。');
    } catch (error) {
      console.error('基本情報保存エラー:', error);
      alert('基本情報の保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBasicInfoEdit = () => {
    setBasicInfo(originalBasicInfo);
    setIsEditingBasicInfo(false);
  };

  // 共有ページ名を保存
  const handleSaveSharedDisplayName = async () => {
    if (!currentUser || !ownerId) return;

    if (isSharedMember && permission !== 'editor') {
      alert('共有メンバーは編集権限がありません。');
      return;
    }

    setSaving(true);
    try {
      const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
      await setDoc(userDataRef, { sharedDisplayName: sharedDisplayName.trim() || null }, { merge: true });
      setOriginalSharedDisplayName(sharedDisplayName);
      setIsEditingSharedDisplayName(false);
      console.log('共有ページ名を保存しました:', sharedDisplayName);
      alert('共有ページ名を保存しました。');
    } catch (error) {
      console.error('共有ページ名保存エラー:', error);
      alert('共有ページ名の保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSharedDisplayNameEdit = () => {
    setSharedDisplayName(originalSharedDisplayName);
    setIsEditingSharedDisplayName(false);
  };

  // 郵便番号から住所を取得する関数
  const fetchAddressFromPostalCode = async (postalCode, isFather = false) => {
    // ハイフンを除去して7桁の数字のみにする
    const cleanPostalCode = postalCode.replace(/[^0-9]/g, '');
    
    // 7桁でない場合は処理しない
    if (cleanPostalCode.length !== 7) {
      return;
    }
    
    try {
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanPostalCode}`);
      const data = await response.json();
      
      if (data.status === 200 && data.results && data.results.length > 0) {
        const result = data.results[0];
        const prefecture = result.address1; // 都道府県
        const city = result.address2; // 市区町村
        const town = result.address3 || ''; // 町域
        
        setBasicInfo(prev => {
          const updated = { ...prev };
          if (isFather) {
            updated.fatherPrefecture = prefecture;
            updated.fatherCity = city;
            // 町域がある場合はaddressフィールドに追加（既存の値がある場合は保持）
            if (town && !prev.fatherAddress) {
              updated.fatherAddress = town;
            }
          } else {
            updated.prefecture = prefecture;
            updated.city = city;
            // 町域がある場合はaddressフィールドに追加（既存の値がある場合は保持）
            if (town && !prev.address) {
              updated.address = town;
            }
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('郵便番号検索エラー:', error);
      // エラーが発生してもユーザーには通知しない（入力は続行可能）
    }
  };

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo(prev => {
      const updated = {
      ...prev,
      [field]: value
      };
      
      // 郵便番号が変更された場合、自動的に住所を取得
      if (field === 'postalCode') {
        // 7桁の数字が入力されたら住所を取得
        const cleanPostalCode = value.replace(/[^0-9]/g, '');
        if (cleanPostalCode.length === 7) {
          fetchAddressFromPostalCode(value, false);
        }
      }
      
      if (field === 'fatherPostalCode') {
        // 7桁の数字が入力されたら住所を取得
        const cleanPostalCode = value.replace(/[^0-9]/g, '');
        if (cleanPostalCode.length === 7) {
          fetchAddressFromPostalCode(value, true);
        }
      }
      
      // 就業形態が変更された場合の処理
      if (field === 'isSelfEmployed') {
        // 雇用形態をリセット（就業形態に応じた選択肢に変更するため）
        if (value === 'not-employed') {
          updated.employmentType = '';
        } else if (value === true) {
          // 自営業の場合、自営業向けの雇用形態に限定
          const selfEmployedOptions = ['個人事業主', 'フリーランス', '開業医', '士業', '業務委託', 'その他'];
          if (prev.employmentType && !selfEmployedOptions.includes(prev.employmentType)) {
            updated.employmentType = '';
          }
        }
        
        // 保険の種類を自動選択（未設定の場合のみ）
        if (prev.insurances.length === 0) {
          if (value === false) {
            // 会社勤めの場合、健康保険組合を推奨
            updated.insurances = [{ type: '健康保険組合', name: '' }];
          } else if (value === true || value === 'not-employed') {
            // 自営業または就業していない場合、国民健康保険を推奨
            updated.insurances = [{ type: '国民健康保険', name: '' }];
          }
        }
      }
      
      if (field === 'fatherIsSelfEmployed') {
        // 雇用形態をリセット
        if (value === 'not-employed') {
          updated.fatherEmploymentType = '';
        } else if (value === true) {
          // 自営業の場合、自営業向けの雇用形態に限定
          const selfEmployedOptions = ['個人事業主', 'フリーランス', '開業医', '士業', '業務委託', 'その他'];
          if (prev.fatherEmploymentType && !selfEmployedOptions.includes(prev.fatherEmploymentType)) {
            updated.fatherEmploymentType = '';
          }
        }
        
        // 保険の種類を自動選択（未設定の場合のみ）
        if (prev.fatherInsurances.length === 0) {
          if (value === false) {
            updated.fatherInsurances = [{ type: '健康保険組合', name: '' }];
          } else if (value === true || value === 'not-employed') {
            updated.fatherInsurances = [{ type: '国民健康保険', name: '' }];
          }
        }
      }
      
      // 雇用形態が変更された場合、保険の種類を再評価（未設定の場合のみ）
      if (field === 'employmentType') {
        const employmentType = value;
        const isSelfEmployed = updated.isSelfEmployed;
        
        if (updated.insurances.length === 0) {
          // 会社勤め + 正社員/契約社員 → 健康保険組合、協会けんぽ、共済組合
          if (isSelfEmployed === false && ['正社員', '契約社員'].includes(employmentType)) {
            updated.insurances = [{ type: '健康保険組合', name: '' }];
          }
          // 会社勤め + パート/アルバイト → 健康保険組合、協会けんぽ、国民健康保険
          else if (isSelfEmployed === false && ['パート', 'アルバイト'].includes(employmentType)) {
            updated.insurances = [{ type: '健康保険組合', name: '' }];
          }
        }
      }
      
      if (field === 'fatherEmploymentType') {
        const employmentType = value;
        const fatherIsSelfEmployed = updated.fatherIsSelfEmployed;
        
        if (updated.fatherInsurances.length === 0) {
          if (fatherIsSelfEmployed === false && ['正社員', '契約社員'].includes(employmentType)) {
            updated.fatherInsurances = [{ type: '健康保険組合', name: '' }];
          }
          else if (fatherIsSelfEmployed === false && ['パート', 'アルバイト'].includes(employmentType)) {
            updated.fatherInsurances = [{ type: '健康保険組合', name: '' }];
          }
        }
      }
      
      return updated;
    });
  };
  
  // 雇用形態の選択肢を取得（就業形態に応じて）
  const getEmploymentTypeOptions = (isSelfEmployed) => {
    if (isSelfEmployed === false) {
      // 会社勤めの場合
      return [
        { value: '正社員', label: '正社員' },
        { value: '契約社員', label: '契約社員' },
        { value: 'パート', label: 'パート' },
        { value: 'アルバイト', label: 'アルバイト' },
        { value: '派遣社員', label: '派遣社員' },
        { value: '業務委託', label: '業務委託' },
        { value: 'その他', label: 'その他' }
      ];
    } else if (isSelfEmployed === true) {
      // 自営業の場合
      return [
        { value: '個人事業主', label: '個人事業主' },
        { value: 'フリーランス', label: 'フリーランス' },
        { value: '開業医', label: '開業医' },
        { value: '士業', label: '士業（弁護士、税理士、司法書士など）' },
        { value: '業務委託', label: '業務委託' },
        { value: 'その他', label: 'その他' }
      ];
    } else if (isSelfEmployed === 'not-employed') {
      // 就業していない場合
      return [
        { value: '', label: '該当なし' }
      ];
    } else {
      // その他または未選択の場合
      return [
        { value: '正社員', label: '正社員' },
        { value: '契約社員', label: '契約社員' },
        { value: 'パート', label: 'パート' },
        { value: 'アルバイト', label: 'アルバイト' },
        { value: '派遣社員', label: '派遣社員' },
        { value: '個人事業主', label: '個人事業主' },
        { value: 'フリーランス', label: 'フリーランス' },
        { value: '開業医', label: '開業医' },
        { value: '士業', label: '士業（弁護士、税理士、司法書士など）' },
        { value: '業務委託', label: '業務委託' },
        { value: 'その他', label: 'その他' }
      ];
    }
  };
  
  // 保険の種類の選択肢を取得（就業形態と雇用形態に応じて）
  const getInsuranceTypeOptions = (isSelfEmployed, employmentType) => {
    if (isSelfEmployed === false) {
      // 会社勤めの場合
      if (['正社員', '契約社員'].includes(employmentType)) {
        return [
          { value: '健康保険組合', label: '健康保険組合' },
          { value: '協会けんぽ', label: '協会けんぽ' },
          { value: '共済組合', label: '共済組合' },
          { value: 'その他', label: 'その他' },
          { value: 'custom', label: 'その他（任意入力）' }
        ];
      } else if (['パート', 'アルバイト'].includes(employmentType)) {
        return [
          { value: '健康保険組合', label: '健康保険組合' },
          { value: '協会けんぽ', label: '協会けんぽ' },
          { value: '国民健康保険', label: '国民健康保険' },
          { value: 'その他', label: 'その他' },
          { value: 'custom', label: 'その他（任意入力）' }
        ];
      } else {
        return [
          { value: '健康保険組合', label: '健康保険組合' },
          { value: '協会けんぽ', label: '協会けんぽ' },
          { value: '国民健康保険', label: '国民健康保険' },
          { value: '共済組合', label: '共済組合' },
          { value: 'その他', label: 'その他' },
          { value: 'custom', label: 'その他（任意入力）' }
        ];
      }
    } else if (isSelfEmployed === true || isSelfEmployed === 'not-employed') {
      // 自営業または就業していない場合
      return [
        { value: '国民健康保険', label: '国民健康保険' },
        { value: 'その他', label: 'その他' },
        { value: 'custom', label: 'その他（任意入力）' }
      ];
    } else {
      // その他または未選択の場合
      return [
        { value: '健康保険組合', label: '健康保険組合' },
        { value: '協会けんぽ', label: '協会けんぽ' },
        { value: '国民健康保険', label: '国民健康保険' },
        { value: '共済組合', label: '共済組合' },
        { value: 'その他', label: 'その他' },
        { value: 'custom', label: 'その他（任意入力）' }
      ];
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="mypage-page">
      <div className="mypage-content-card">
        <div className="mypage-content">
        <div id="profile" className="profile-section">
          {!isSharedMember && (
            <>
              <div className="profile-header-wrapper">
                <div className="profile-header">
                  <img 
                    src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || currentUser.email || 'User')}&background=667eea&color=fff&size=128`} 
                    alt="プロフィール画像" 
                    className="profile-image"
                    onError={(e) => {
                      // 画像の読み込みに失敗した場合のフォールバック
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || currentUser.email || 'User')}&background=667eea&color=fff&size=128`;
                    }}
                  />
                  <div className="profile-info">
                    <h2>{currentUser.displayName || 'ユーザー'}</h2>
                    <p className="email">{currentUser.email}</p>
                  </div>
                </div>
              </div>
              {/* 共有ページ名の表示と編集（グラデーション位置・中央配置） */}
              <div className="shared-page-name-section-gradient">
                <div className="shared-page-name-container">
                  {!isEditingSharedDisplayName ? (
                    <>
                      <div className="shared-page-name-value-top">
                        {sharedDisplayName || <span className="no-value">未設定（共有時に表示される名前）</span>}
                      </div>
                      <div className="shared-page-name-row">
                        <div className="shared-page-name-label-bottom">共有ページ名</div>
                        <button
                          className="edit-shared-page-name-button-inline"
                          onClick={() => setIsEditingSharedDisplayName(true)}
                          disabled={saving}
                        >
                          編集
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={sharedDisplayName}
                        onChange={(e) => setSharedDisplayName(e.target.value)}
                        className="shared-page-name-input-top"
                        placeholder="共有ページ名を入力してください"
                        maxLength={50}
                      />
                      <div className="shared-page-name-edit-buttons-inline">
                        <button
                          className="save-shared-page-name-button-inline"
                          onClick={handleSaveSharedDisplayName}
                          disabled={saving}
                        >
                          {saving ? '保存中...' : '保存'}
                        </button>
                        <button
                          className="cancel-shared-page-name-button-inline"
                          onClick={handleCancelSharedDisplayNameEdit}
                          disabled={saving}
                        >
                          キャンセル
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          
          <div className="due-date-section">
            <h3 className="due-date-title">出産予定日・初回診察日</h3>
            {!isEditing ? (
              <div className="due-date-display">
                <div className="date-item">
                  <label className="date-label">出産予定日:</label>
                  <p className="due-date-value">
                    {dueDate ? (
                      <>
                        {new Date(dueDate).toLocaleDateString('ja-JP', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </>
                    ) : (
                      <span className="no-date">未設定</span>
                    )}
                  </p>
                </div>
                <div className="date-item">
                  <label className="date-label">初回診察（妊娠確認）:</label>
                  <p className="due-date-value">
                    {firstExaminationDate ? (
                      <>
                        {new Date(firstExaminationDate).toLocaleDateString('ja-JP', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </>
                    ) : (
                      <span className="no-date">未設定</span>
                    )}
                  </p>
                </div>
                {(!isSharedMember || permission === 'editor') && (
                  <div className="due-date-buttons-group">
                    <button 
                      className="edit-due-date-button"
                      onClick={() => setIsEditing(true)}
                    >
                      {dueDate ? '変更' : '設定'}
                    </button>
                    {dueDate && (
                      <button 
                        className="reset-due-date-button"
                        onClick={handleResetDueDate}
                        disabled={saving}
                      >
                        リセット
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="due-date-edit">
                <div className="date-input-group">
                  <label className="date-input-label">出産予定日 *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="due-date-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="date-input-group">
                  <label className="date-input-label">初回診察（妊娠確認）</label>
                  <input
                    type="date"
                    value={firstExaminationDate}
                    onChange={(e) => setFirstExaminationDate(e.target.value)}
                    className="due-date-input"
                    max={dueDate || undefined}
                  />
                </div>
                <div className="due-date-buttons">
                  <button
                    className="save-button"
                    onClick={handleSaveDueDate}
                    disabled={saving}
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                  <button
                    className="cancel-button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
            {dueDate && (
              <p className="due-date-note">
                出産予定日を基準に、申請手続きの実施期間が自動設定されます。
                {firstExaminationDate && ' 初回診察日は「初回診察（妊娠確認）」の期間として使用されます。'}
              </p>
            )}
          </div>
        </div>

            {/* 基本情報セクション */}
            <div id="basic-info" className="info-section">
              <div className="section-header">
                <h3>基本情報</h3>
                {!isEditingBasicInfo && (!isSharedMember || permission === 'editor') ? (
                  <button 
                    className="edit-basic-info-button"
                    onClick={() => setIsEditingBasicInfo(true)}
                  >
                    編集
                  </button>
                ) : null}
              </div>

          {!isEditingBasicInfo ? (
            <div className="basic-info-display">
              {/* 表形式で表示 */}
              <div className="basic-info-table-container">
                <table className="basic-info-table">
                  <thead>
                    <tr>
                      <th>項目</th>
                      <th>母親</th>
                      <th>父親</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="table-label">生年月日</td>
                      <td className={`table-value ${!basicInfo.motherBirthDate ? 'info-value-empty' : ''}`}>
                        {basicInfo.motherBirthDate 
                          ? new Date(basicInfo.motherBirthDate).toLocaleDateString('ja-JP', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric'
                            })
                          : '未設定'}
                      </td>
                      <td className={`table-value ${!basicInfo.fatherBirthDate ? 'info-value-empty' : ''}`}>
                        {basicInfo.fatherBirthDate 
                          ? new Date(basicInfo.fatherBirthDate).toLocaleDateString('ja-JP', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric'
                            })
                          : '未設定'}
                      </td>
                    </tr>
                    <tr>
                      <td className="table-label">住所</td>
                      <td className={`table-value ${!(basicInfo.postalCode || basicInfo.prefecture || basicInfo.city || basicInfo.address) ? 'info-value-empty' : ''}`}>
                      {basicInfo.postalCode || basicInfo.prefecture || basicInfo.city || basicInfo.address 
                        ? `〒${basicInfo.postalCode || ''} ${basicInfo.prefecture || ''}${basicInfo.city || ''}${basicInfo.address || ''}`.trim()
                        : '未設定'}
                      </td>
                      <td className={`table-value ${basicInfo.sameAddress ? '' : (!(basicInfo.fatherPostalCode || basicInfo.fatherPrefecture || basicInfo.fatherCity || basicInfo.fatherAddress) ? 'info-value-empty' : '')}`}>
                        {basicInfo.sameAddress 
                          ? '同一' 
                          : (basicInfo.fatherPostalCode || basicInfo.fatherPrefecture || basicInfo.fatherCity || basicInfo.fatherAddress
                            ? `〒${basicInfo.fatherPostalCode || ''} ${basicInfo.fatherPrefecture || ''}${basicInfo.fatherCity || ''}${basicInfo.fatherAddress || ''}`.trim()
                            : '未設定')}
                      </td>
                    </tr>
                    <tr>
                      <td className="table-label">電話番号</td>
                      <td className={`table-value ${!basicInfo.phoneNumber ? 'info-value-empty' : ''}`}>
                        {basicInfo.phoneNumber || '未設定'}
                      </td>
                      <td className={`table-value ${!basicInfo.fatherPhoneNumber ? 'info-value-empty' : ''}`}>
                        {basicInfo.fatherPhoneNumber || '未設定'}
                      </td>
                    </tr>
                    <tr>
                      <td className="table-label">就業形態</td>
                      <td className={`table-value ${!basicInfo.isSelfEmployed && basicInfo.isSelfEmployed !== false ? 'info-value-empty' : ''}`}>
                        {basicInfo.isSelfEmployed === true ? '自営業' : basicInfo.isSelfEmployed === false ? '会社勤め' : basicInfo.isSelfEmployed === 'other' ? 'その他' : basicInfo.isSelfEmployed === 'not-employed' ? '就業していない' : '未設定'}
                      </td>
                      <td className={`table-value ${!basicInfo.fatherIsSelfEmployed && basicInfo.fatherIsSelfEmployed !== false ? 'info-value-empty' : ''}`}>
                        {basicInfo.fatherIsSelfEmployed === true ? '自営業' : basicInfo.fatherIsSelfEmployed === false ? '会社勤め' : basicInfo.fatherIsSelfEmployed === 'other' ? 'その他' : basicInfo.fatherIsSelfEmployed === 'not-employed' ? '就業していない' : '未設定'}
                      </td>
                    </tr>
                    <tr>
                      <td className="table-label">雇用形態</td>
                      <td className={`table-value ${!basicInfo.employmentType ? 'info-value-empty' : ''}`}>
                        {basicInfo.employmentType || '未設定'}
                      </td>
                      <td className={`table-value ${!basicInfo.fatherEmploymentType ? 'info-value-empty' : ''}`}>
                        {basicInfo.fatherEmploymentType || '未設定'}
                      </td>
                    </tr>
                    <tr>
                      <td className="table-label">保険の種類</td>
                      <td className={`table-value ${!basicInfo.insurances || basicInfo.insurances.length === 0 ? 'info-value-empty' : ''}`}>
                        {basicInfo.insurances && basicInfo.insurances.length > 0 ? (
                          <div className="insurance-list">
                            {basicInfo.insurances.map((insurance, index) => (
                              <div key={index} className="insurance-item">
                                <span className="insurance-type">
                                  {insurance.type === 'custom' ? insurance.name : insurance.type}
                    </span>
                                {insurance.type === '健康保険組合' && insurance.name && (
                                  <span className="insurance-name">（{insurance.name}）</span>
                                )}
                  </div>
                            ))}
                  </div>
                        ) : '未設定'}
                      </td>
                      <td className={`table-value ${!basicInfo.fatherInsurances || basicInfo.fatherInsurances.length === 0 ? 'info-value-empty' : ''}`}>
                        {basicInfo.fatherInsurances && basicInfo.fatherInsurances.length > 0 ? (
                          <div className="insurance-list">
                            {basicInfo.fatherInsurances.map((insurance, index) => (
                              <div key={index} className="insurance-item">
                                <span className="insurance-type">
                                  {insurance.type === 'custom' ? insurance.name : insurance.type}
                                </span>
                                {insurance.type === '健康保険組合' && insurance.name && (
                                  <span className="insurance-name">（{insurance.name}）</span>
                                )}
                  </div>
                            ))}
                  </div>
                        ) : '未設定'}
                      </td>
                    </tr>
                    <tr>
                      <td className="table-label">年収</td>
                      <td className={`table-value ${!basicInfo.annualIncome ? 'info-value-empty' : ''}`}>
                        {basicInfo.annualIncome ? `${basicInfo.annualIncome}万円` : '未設定'}
                      </td>
                      <td className={`table-value ${!basicInfo.fatherAnnualIncome ? 'info-value-empty' : ''}`}>
                        {basicInfo.fatherAnnualIncome ? `${basicInfo.fatherAnnualIncome}万円` : '未設定'}
                      </td>
                    </tr>
                    <tr>
                      <td className="table-label">勤務先</td>
                      <td className={`table-value ${!basicInfo.companyName ? 'info-value-empty' : ''}`}>
                        {basicInfo.companyName || '未設定'}
                      </td>
                      <td className={`table-value ${!basicInfo.fatherCompanyName ? 'info-value-empty' : ''}`}>
                        {basicInfo.fatherCompanyName || '未設定'}
                      </td>
                    </tr>
                    <tr>
                      <td className="table-label">産前産後休暇取得予定</td>
                      <td className={`table-value ${!basicInfo.planMaternityLeave ? 'info-value-empty' : ''}`}>
                        {basicInfo.planMaternityLeave || '未設定'}
                      </td>
                      <td className={`table-value ${!basicInfo.fatherPlanMaternityLeave ? 'info-value-empty' : ''}`}>
                        {basicInfo.fatherPlanMaternityLeave || '未設定'}
                      </td>
                    </tr>
                    <tr>
                      <td className="table-label">育児休業取得予定</td>
                      <td className={`table-value ${!basicInfo.planChildcareLeave ? 'info-value-empty' : ''}`}>
                        {basicInfo.planChildcareLeave || '未設定'}
                      </td>
                      <td className={`table-value ${!basicInfo.fatherPlanChildcareLeave ? 'info-value-empty' : ''}`}>
                        {basicInfo.fatherPlanChildcareLeave || '未設定'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 兄弟・姉妹 */}
              <div className="info-subsection">
                <h4 className="subsection-title">兄弟・姉妹</h4>
                {basicInfo.children && basicInfo.children.length > 0 ? (
                  <div className="children-table-container">
                    <table className="children-table">
                      <thead>
                        <tr>
                          <th>性別</th>
                          <th>生年月日</th>
                        </tr>
                      </thead>
                      <tbody>
                        {basicInfo.children.map((child, index) => (
                          <tr key={index}>
                            <td className={`table-value ${!child.gender ? 'info-value-empty' : ''}`}>
                              {child.gender || '未設定'}
                            </td>
                            <td className={`table-value ${!child.birthDate ? 'info-value-empty' : ''}`}>
                              {child.birthDate 
                                ? new Date(child.birthDate).toLocaleDateString('ja-JP', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric'
                                  })
                                : '未設定'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="info-item">
                    <span className="info-value-empty">兄弟・姉妹はいません</span>
                    </div>
                  )}
              </div>

            </div>
          ) : (
            <div className="basic-info-edit">
              {/* 表形式で編集 */}
              <div className="basic-info-edit-table-container">
                <table className="basic-info-edit-table">
                  <thead>
                    <tr>
                      <th>項目</th>
                      <th>母親</th>
                      <th>父親</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 生年月日 */}
                    <tr>
                      <td className="table-label">生年月日 *</td>
                      <td className="table-value">
                    <input
                          type="date"
                          value={basicInfo.motherBirthDate}
                          onChange={(e) => handleBasicInfoChange('motherBirthDate', e.target.value)}
                      className="form-input"
                          max={new Date().toISOString().split('T')[0]}
                    />
                      </td>
                      <td className="table-value">
                        <input
                          type="date"
                          value={basicInfo.fatherBirthDate}
                          onChange={(e) => handleBasicInfoChange('fatherBirthDate', e.target.value)}
                          className="form-input"
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </td>
                    </tr>
                    {/* 住所 */}
                    <tr>
                      <td className="table-label">住所</td>
                      <td className="table-value">
                        <div className="address-input-group">
                          <div className="address-row">
                    <input
                      type="text"
                      value={basicInfo.postalCode}
                      onChange={(e) => handleBasicInfoChange('postalCode', e.target.value)}
                              className="form-input address-postal"
                              placeholder="郵便番号"
                      maxLength="8"
                    />
                            <select
                      value={basicInfo.prefecture}
                      onChange={(e) => handleBasicInfoChange('prefecture', e.target.value)}
                              className="form-select address-prefecture"
                            >
                              <option value="">都道府県を選択</option>
                              {PREFECTURES.map(pref => (
                                <option key={pref} value={pref}>{pref}</option>
                              ))}
                            </select>
                  </div>
                          <div className="address-row">
                    <input
                      type="text"
                      value={basicInfo.city}
                      onChange={(e) => handleBasicInfoChange('city', e.target.value)}
                              className="form-input address-city"
                              placeholder="市区町村"
                    />
                  </div>
                    <input
                      type="text"
                      value={basicInfo.address}
                      onChange={(e) => handleBasicInfoChange('address', e.target.value)}
                            className="form-input address-detail"
                            placeholder="番地・建物名"
                    />
                  </div>
                      </td>
                      <td className="table-value">
                        <div className="address-radio-group">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="sameAddress"
                              checked={basicInfo.sameAddress === true}
                              onChange={() => handleBasicInfoChange('sameAddress', true)}
                            />
                            <span>同一</span>
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="sameAddress"
                              checked={basicInfo.sameAddress === false}
                              onChange={() => handleBasicInfoChange('sameAddress', false)}
                            />
                            <span>別居</span>
                          </label>
                        </div>
                        {!basicInfo.sameAddress && (
                          <div className="address-input-group" style={{ marginTop: '12px' }}>
                            <div className="address-row">
                              <input
                                type="text"
                                value={basicInfo.fatherPostalCode}
                                onChange={(e) => handleBasicInfoChange('fatherPostalCode', e.target.value)}
                                className="form-input address-postal"
                                placeholder="郵便番号"
                                maxLength="8"
                              />
                              <select
                                value={basicInfo.fatherPrefecture}
                                onChange={(e) => handleBasicInfoChange('fatherPrefecture', e.target.value)}
                                className="form-select address-prefecture"
                              >
                                <option value="">都道府県を選択</option>
                                {PREFECTURES.map(pref => (
                                  <option key={pref} value={pref}>{pref}</option>
                                ))}
                              </select>
                            </div>
                            <div className="address-row">
                              <input
                                type="text"
                                value={basicInfo.fatherCity}
                                onChange={(e) => handleBasicInfoChange('fatherCity', e.target.value)}
                                className="form-input address-city"
                                placeholder="市区町村"
                              />
                            </div>
                            <input
                              type="text"
                              value={basicInfo.fatherAddress}
                              onChange={(e) => handleBasicInfoChange('fatherAddress', e.target.value)}
                              className="form-input address-detail"
                              placeholder="番地・建物名"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                    {/* 電話番号 */}
                    <tr>
                      <td className="table-label">電話番号</td>
                      <td className="table-value">
                    <input
                      type="tel"
                      value={basicInfo.phoneNumber}
                      onChange={(e) => handleBasicInfoChange('phoneNumber', e.target.value)}
                      className="form-input"
                      placeholder="090-1234-5678"
                    />
                      </td>
                      <td className="table-value">
                        <input
                          type="tel"
                          value={basicInfo.fatherPhoneNumber}
                          onChange={(e) => handleBasicInfoChange('fatherPhoneNumber', e.target.value)}
                          className="form-input"
                          placeholder="090-1234-5678"
                        />
                      </td>
                    </tr>
                    {/* 就業形態 */}
                    <tr>
                      <td className="table-label">就業形態 *</td>
                      <td className="table-value">
                    <select
                          value={basicInfo.isSelfEmployed === true ? 'self-employed' : basicInfo.isSelfEmployed === false ? 'company' : basicInfo.isSelfEmployed === 'other' ? 'other' : basicInfo.isSelfEmployed === 'not-employed' ? 'not-employed' : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            let newValue;
                            if (value === 'self-employed') newValue = true;
                            else if (value === 'company') newValue = false;
                            else if (value === 'other') newValue = 'other';
                            else if (value === 'not-employed') newValue = 'not-employed';
                            else newValue = null;
                            handleBasicInfoChange('isSelfEmployed', newValue);
                          }}
                      className="form-select"
                    >
                      <option value="">選択してください</option>
                          <option value="company">会社勤め</option>
                          <option value="self-employed">自営業</option>
                          <option value="not-employed">就業していない</option>
                          <option value="other">その他</option>
                    </select>
                      </td>
                      <td className="table-value">
                        <select
                          value={basicInfo.fatherIsSelfEmployed === true ? 'self-employed' : basicInfo.fatherIsSelfEmployed === false ? 'company' : basicInfo.fatherIsSelfEmployed === 'other' ? 'other' : basicInfo.fatherIsSelfEmployed === 'not-employed' ? 'not-employed' : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            let newValue;
                            if (value === 'self-employed') newValue = true;
                            else if (value === 'company') newValue = false;
                            else if (value === 'other') newValue = 'other';
                            else if (value === 'not-employed') newValue = 'not-employed';
                            else newValue = null;
                            handleBasicInfoChange('fatherIsSelfEmployed', newValue);
                          }}
                          className="form-select"
                        >
                          <option value="">選択してください</option>
                          <option value="company">会社勤め</option>
                          <option value="self-employed">自営業</option>
                          <option value="not-employed">就業していない</option>
                          <option value="other">その他</option>
                        </select>
                      </td>
                    </tr>
                    {/* 雇用形態 */}
                    <tr>
                      <td className="table-label">雇用形態 *</td>
                      <td className="table-value">
                        <select
                          value={basicInfo.employmentType}
                          onChange={(e) => handleBasicInfoChange('employmentType', e.target.value)}
                          className="form-select"
                          disabled={basicInfo.isSelfEmployed === 'not-employed'}
                        >
                          <option value="">選択してください</option>
                          {getEmploymentTypeOptions(basicInfo.isSelfEmployed).map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {basicInfo.isSelfEmployed === 'not-employed' && (
                          <span className="info-value-empty" style={{ fontSize: '12px', marginLeft: '8px' }}>
                            （就業していない場合は該当なし）
                          </span>
                        )}
                      </td>
                      <td className="table-value">
                        <select
                          value={basicInfo.fatherEmploymentType}
                          onChange={(e) => handleBasicInfoChange('fatherEmploymentType', e.target.value)}
                          className="form-select"
                          disabled={basicInfo.fatherIsSelfEmployed === 'not-employed'}
                        >
                          <option value="">選択してください</option>
                          {getEmploymentTypeOptions(basicInfo.fatherIsSelfEmployed).map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {basicInfo.fatherIsSelfEmployed === 'not-employed' && (
                          <span className="info-value-empty" style={{ fontSize: '12px', marginLeft: '8px' }}>
                            （就業していない場合は該当なし）
                          </span>
                        )}
                      </td>
                    </tr>
                    {/* 保険の種類 */}
                    <tr>
                      <td className="table-label">保険の種類 *</td>
                      <td className="table-value">
                        <div className="insurances-container">
                          {(basicInfo.insurances || []).map((insurance, index) => (
                            <div key={index} className="insurance-input-group">
                              <div className="insurance-select-row">
                                <select
                                  value={insurance.type}
                                  onChange={(e) => {
                                    const newInsurances = [...(basicInfo.insurances || [])];
                                    newInsurances[index] = { ...newInsurances[index], type: e.target.value, name: e.target.value === '健康保険組合' ? newInsurances[index].name : '' };
                                    handleBasicInfoChange('insurances', newInsurances);
                                  }}
                                  className="form-select"
                                >
                                  <option value="">選択してください</option>
                                  {getInsuranceTypeOptions(basicInfo.isSelfEmployed, basicInfo.employmentType).map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newInsurances = [...(basicInfo.insurances || [])];
                                    newInsurances.splice(index, 1);
                                    handleBasicInfoChange('insurances', newInsurances);
                                  }}
                                  className="remove-insurance-button"
                                  title="削除"
                                >
                                  ×
                                </button>
                  </div>
                              {insurance.type === 'custom' && (
                      <input
                        type="text"
                                  value={insurance.name || ''}
                                  onChange={(e) => {
                                    const newInsurances = [...(basicInfo.insurances || [])];
                                    newInsurances[index] = { ...newInsurances[index], name: e.target.value };
                                    handleBasicInfoChange('insurances', newInsurances);
                                  }}
                        className="form-input"
                                  style={{ marginTop: '8px' }}
                                  placeholder="保険の種類を入力してください"
                    />
                              )}
                              {insurance.type === '健康保険組合' && (
                    <input
                      type="text"
                                  value={insurance.name || ''}
                                  onChange={(e) => {
                                    const newInsurances = [...(basicInfo.insurances || [])];
                                    newInsurances[index] = { ...newInsurances[index], name: e.target.value };
                                    handleBasicInfoChange('insurances', newInsurances);
                                  }}
                      className="form-input"
                                  style={{ marginTop: '8px' }}
                                  placeholder="例: ○○健康保険組合"
                    />
                              )}
                  </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const options = getInsuranceTypeOptions(basicInfo.isSelfEmployed, basicInfo.employmentType);
                              const defaultType = options.length > 0 ? options[0].value : '';
                              const newInsurances = [...(basicInfo.insurances || []), { type: defaultType, name: '' }];
                              handleBasicInfoChange('insurances', newInsurances);
                            }}
                            className="add-insurance-button"
                          >
                            + 保険を追加
                          </button>
                        </div>
                      </td>
                      <td className="table-value">
                        <div className="insurances-container">
                          {(basicInfo.fatherInsurances || []).map((insurance, index) => (
                            <div key={index} className="insurance-input-group">
                              <div className="insurance-select-row">
                    <select
                                  value={insurance.type}
                                  onChange={(e) => {
                                    const newInsurances = [...(basicInfo.fatherInsurances || [])];
                                    newInsurances[index] = { ...newInsurances[index], type: e.target.value, name: e.target.value === '健康保険組合' ? newInsurances[index].name : '' };
                                    handleBasicInfoChange('fatherInsurances', newInsurances);
                                  }}
                      className="form-select"
                    >
                      <option value="">選択してください</option>
                                  {getInsuranceTypeOptions(basicInfo.fatherIsSelfEmployed, basicInfo.fatherEmploymentType).map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                    </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newInsurances = [...(basicInfo.fatherInsurances || [])];
                                    newInsurances.splice(index, 1);
                                    handleBasicInfoChange('fatherInsurances', newInsurances);
                                  }}
                                  className="remove-insurance-button"
                                  title="削除"
                                >
                                  ×
                                </button>
                  </div>
                              {insurance.type === 'custom' && (
                        <input
                                  type="text"
                                  value={insurance.name || ''}
                                  onChange={(e) => {
                                    const newInsurances = [...(basicInfo.fatherInsurances || [])];
                                    newInsurances[index] = { ...newInsurances[index], name: e.target.value };
                                    handleBasicInfoChange('fatherInsurances', newInsurances);
                                  }}
                                  className="form-input"
                                  style={{ marginTop: '8px' }}
                                  placeholder="保険の種類を入力してください"
                                />
                              )}
                              {insurance.type === '健康保険組合' && (
                        <input
                                  type="text"
                                  value={insurance.name || ''}
                                  onChange={(e) => {
                                    const newInsurances = [...(basicInfo.fatherInsurances || [])];
                                    newInsurances[index] = { ...newInsurances[index], name: e.target.value };
                                    handleBasicInfoChange('fatherInsurances', newInsurances);
                                  }}
                                  className="form-input"
                                  style={{ marginTop: '8px' }}
                                  placeholder="例: ○○健康保険組合"
                                />
                              )}
                    </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const options = getInsuranceTypeOptions(basicInfo.fatherIsSelfEmployed, basicInfo.fatherEmploymentType);
                              const defaultType = options.length > 0 ? options[0].value : '';
                              const newInsurances = [...(basicInfo.fatherInsurances || []), { type: defaultType, name: '' }];
                              handleBasicInfoChange('fatherInsurances', newInsurances);
                            }}
                            className="add-insurance-button"
                          >
                            + 保険を追加
                          </button>
                  </div>
                      </td>
                    </tr>
                    {/* 年収 */}
                    <tr>
                      <td className="table-label">年収（万円）</td>
                      <td className="table-value">
                    <input
                      type="number"
                          value={basicInfo.annualIncome}
                          onChange={(e) => handleBasicInfoChange('annualIncome', e.target.value)}
                      className="form-input"
                      min="0"
                          placeholder="500"
                    />
                      </td>
                      <td className="table-value">
                    <input
                      type="number"
                      value={basicInfo.fatherAnnualIncome}
                      onChange={(e) => handleBasicInfoChange('fatherAnnualIncome', e.target.value)}
                      className="form-input"
                      min="0"
                      placeholder="500"
                    />
                      </td>
                    </tr>
                    {/* 勤務先 */}
                    <tr>
                      <td className="table-label">勤務先</td>
                      <td className="table-value">
                        <input
                          type="text"
                          value={basicInfo.companyName}
                          onChange={(e) => handleBasicInfoChange('companyName', e.target.value)}
                          className="form-input"
                          placeholder="株式会社○○"
                        />
                      </td>
                      <td className="table-value">
                    <input
                      type="text"
                      value={basicInfo.fatherCompanyName}
                      onChange={(e) => handleBasicInfoChange('fatherCompanyName', e.target.value)}
                      className="form-input"
                      placeholder="株式会社○○"
                    />
                      </td>
                    </tr>
                    {/* 産前産後休暇取得予定 */}
                    <tr>
                      <td className="table-label">産前産後休暇取得予定</td>
                      <td className="table-value">
                    <select
                          value={basicInfo.planMaternityLeave}
                          onChange={(e) => handleBasicInfoChange('planMaternityLeave', e.target.value)}
                      className="form-select"
                    >
                      <option value="">選択してください</option>
                          <option value="取得予定">取得予定</option>
                          <option value="取得しない">取得しない</option>
                          <option value="未定">未定</option>
                    </select>
                      </td>
                      <td className="table-value">
                    <select
                          value={basicInfo.fatherPlanMaternityLeave}
                          onChange={(e) => handleBasicInfoChange('fatherPlanMaternityLeave', e.target.value)}
                      className="form-select"
                    >
                      <option value="">選択してください</option>
                      <option value="取得予定">取得予定</option>
                      <option value="取得しない">取得しない</option>
                      <option value="未定">未定</option>
                    </select>
                      </td>
                    </tr>
                    {/* 育児休業取得予定 */}
                    <tr>
                      <td className="table-label">育児休業取得予定</td>
                      <td className="table-value">
                    <select
                      value={basicInfo.planChildcareLeave}
                      onChange={(e) => handleBasicInfoChange('planChildcareLeave', e.target.value)}
                      className="form-select"
                    >
                      <option value="">選択してください</option>
                      <option value="取得予定">取得予定</option>
                      <option value="取得しない">取得しない</option>
                      <option value="未定">未定</option>
                    </select>
                      </td>
                      <td className="table-value">
                        <select
                          value={basicInfo.fatherPlanChildcareLeave}
                          onChange={(e) => handleBasicInfoChange('fatherPlanChildcareLeave', e.target.value)}
                          className="form-select"
                        >
                          <option value="">選択してください</option>
                          <option value="取得予定">取得予定</option>
                          <option value="取得しない">取得しない</option>
                          <option value="未定">未定</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
                  </div>

              {/* 兄弟・姉妹 */}
              <div className="info-subsection">
                <h4 className="subsection-title">兄弟・姉妹</h4>
                <div className="children-edit-container">
                  {(basicInfo.children || []).map((child, index) => (
                    <div key={index} className="child-input-group">
                      <div className="child-header">
                        <span className="child-number">子ども {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newChildren = [...(basicInfo.children || [])];
                            newChildren.splice(index, 1);
                            handleBasicInfoChange('children', newChildren);
                          }}
                          className="remove-child-button"
                          title="削除"
                        >
                          ×
                        </button>
                      </div>
                      <div className="child-fields">
                        <div className="form-group">
                          <label className="form-label">性別</label>
                          <select
                            value={child.gender || ''}
                            onChange={(e) => {
                              const newChildren = [...(basicInfo.children || [])];
                              newChildren[index] = { ...newChildren[index], gender: e.target.value };
                              handleBasicInfoChange('children', newChildren);
                            }}
                            className="form-select"
                          >
                            <option value="">選択してください</option>
                            <option value="男">男</option>
                            <option value="女">女</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">生年月日</label>
                          <input
                            type="date"
                            value={child.birthDate || ''}
                            onChange={(e) => {
                              const newChildren = [...(basicInfo.children || [])];
                              newChildren[index] = { ...newChildren[index], birthDate: e.target.value };
                              handleBasicInfoChange('children', newChildren);
                            }}
                            className="form-input"
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newChildren = [...(basicInfo.children || []), { gender: '', birthDate: '' }];
                      handleBasicInfoChange('children', newChildren);
                    }}
                    className="add-child-button"
                  >
                    + 子どもを追加
                  </button>
                </div>
              </div>


              <div className="basic-info-buttons">
                <button
                  className="save-button"
                  onClick={handleSaveBasicInfo}
                  disabled={saving}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  className="cancel-button"
                  onClick={handleCancelBasicInfoEdit}
                  disabled={saving}
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>

        <div id="services" className="info-section">
          <h3>登録済みの支援制度</h3>
          {getRegisteredSystems().length > 0 ? (
          <div className="service-list">
              {getRegisteredSystems().map((title, index) => (
                <div key={index} className="service-item">
                  <h4>{title}</h4>
            </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
              登録済みの支援制度はありません。
            </p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;

