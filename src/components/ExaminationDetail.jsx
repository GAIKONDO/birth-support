import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useOwnerId } from '../hooks/useOwnerId';
import './ExaminationDetail.css';

const ExaminationDetail = () => {
  const { examinationId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { ownerId, loading: ownerIdLoading, isSharedMember, permission } = useOwnerId();
  const [examination, setExamination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [visitNumber, setVisitNumber] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    hospital: '',
    testResults: '',
    notes: '',
    conversation: '',
    other: '',
    // 妊娠経過の記録
    pregnancyWeek: '',
    weight: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    urineProtein: '',
    urineSugar: '',
    edema: '',
    // 超音波検査の記録
    ultrasoundDate: '',
    fetalPosition: '',
    estimatedWeight: '',
    biparietalDiameter: '',
    abdominalCircumference: '',
    femurLength: '',
    placentaPosition: '',
    amnioticFluid: '',
    // 医師・助産師の所見
    findings: '',
    abnormalities: '',
    lifestyleGuidance: ''
  });
  const [dueDate, setDueDate] = useState('');

  // 出産予定日を読み込む（妊娠週の計算に使用）
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
    getDoc(userDataRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setDueDate(data.dueDate || '');
        }
      })
      .catch((error) => {
        console.error('出産予定日読み込みエラー:', error);
      });
  }, [currentUser, ownerId, ownerIdLoading]);

  // 妊娠週を計算する関数
  const calculatePregnancyWeek = (examinationDate) => {
    if (!dueDate || !examinationDate) return '';
    
    try {
      const due = new Date(dueDate);
      const exam = new Date(examinationDate);
      const diffTime = due - exam;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.floor((280 - diffDays) / 7);
      const days = (280 - diffDays) % 7;
      
      if (weeks < 0) return '0週0日';
      return `${weeks}週${days}日`;
    } catch (e) {
      return '';
    }
  };

  // 診察記録を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    if (examinationId === 'new') {
      setIsNew(true);
      setIsEditing(true);
      setLoading(false);
      return;
    }

    // すべての診察記録を読み込んで診察回数を計算
    const examinationsRef = collection(db, 'users', ownerId, 'data', 'maternalHandbook', 'examinations');
    const q = query(examinationsRef, orderBy('date', 'asc'));
    
    getDocs(q)
      .then((snapshot) => {
        const exams = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // 現在の診察記録を探す
        const currentExam = exams.find(exam => exam.id === examinationId);
        
        if (currentExam) {
          // 診察回数を計算（日付順のインデックス + 1）
          const currentIndex = exams.findIndex(exam => exam.id === examinationId);
          setVisitNumber(currentIndex + 1);
          
          setExamination({
            id: currentExam.id,
            ...currentExam
          });
          setFormData({
            date: currentExam.date || '',
            hospital: currentExam.hospital || '',
            testResults: currentExam.testResults || '',
            notes: currentExam.notes || '',
            conversation: currentExam.conversation || '',
            other: currentExam.other || '',
            pregnancyWeek: currentExam.pregnancyWeek || '',
            weight: currentExam.weight || '',
            bloodPressureSystolic: currentExam.bloodPressureSystolic || '',
            bloodPressureDiastolic: currentExam.bloodPressureDiastolic || '',
            urineProtein: currentExam.urineProtein || '',
            urineSugar: currentExam.urineSugar || '',
            edema: currentExam.edema || '',
            ultrasoundDate: currentExam.ultrasoundDate || '',
            fetalPosition: currentExam.fetalPosition || '',
            estimatedWeight: currentExam.estimatedWeight || '',
            biparietalDiameter: currentExam.biparietalDiameter || '',
            abdominalCircumference: currentExam.abdominalCircumference || '',
            femurLength: currentExam.femurLength || '',
            placentaPosition: currentExam.placentaPosition || '',
            amnioticFluid: currentExam.amnioticFluid || '',
            findings: currentExam.findings || '',
            abnormalities: currentExam.abnormalities || '',
            lifestyleGuidance: currentExam.lifestyleGuidance || ''
          });
        } else {
          alert('診察記録が見つかりませんでした。');
          navigate('/electronic-maternal-handbook');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('診察記録読み込みエラー:', error);
        alert('診察記録の読み込みに失敗しました。');
        setLoading(false);
      });
  }, [currentUser, ownerId, ownerIdLoading, examinationId, navigate]);

  // 診察記録を保存
  const handleSave = async () => {
    if (!currentUser || !ownerId) return;

    // 保存中の場合は処理を中断（連続クリック防止）
    if (saving) {
      return;
    }

    if (isSharedMember && permission !== 'editor') {
      alert('共有メンバーは編集権限がありません。');
      return;
    }

    if (!formData.date || !formData.hospital) {
      alert('診察日と病院名を入力してください。');
      return;
    }

    setSaving(true);

    try {
      if (isNew) {
        // 新規作成
        const examinationsRef = collection(db, 'users', ownerId, 'data', 'maternalHandbook', 'examinations');
        const newExaminationRef = doc(examinationsRef);
        
        const pregnancyWeekValue = formData.pregnancyWeek || calculatePregnancyWeek(formData.date);
        
        await setDoc(newExaminationRef, {
          date: formData.date,
          hospital: formData.hospital,
          testResults: formData.testResults || '',
          notes: formData.notes || '',
          conversation: formData.conversation || '',
          other: formData.other || '',
          pregnancyWeek: pregnancyWeekValue,
          weight: formData.weight || '',
          bloodPressureSystolic: formData.bloodPressureSystolic || '',
          bloodPressureDiastolic: formData.bloodPressureDiastolic || '',
          urineProtein: formData.urineProtein || '',
          urineSugar: formData.urineSugar || '',
          edema: formData.edema || '',
          ultrasoundDate: formData.ultrasoundDate || '',
          fetalPosition: formData.fetalPosition || '',
          estimatedWeight: formData.estimatedWeight || '',
          biparietalDiameter: formData.biparietalDiameter || '',
          abdominalCircumference: formData.abdominalCircumference || '',
          femurLength: formData.femurLength || '',
          placentaPosition: formData.placentaPosition || '',
          amnioticFluid: formData.amnioticFluid || '',
          findings: formData.findings || '',
          abnormalities: formData.abnormalities || '',
          lifestyleGuidance: formData.lifestyleGuidance || '',
          createdAt: new Date().toISOString()
        });
        
        // 保存が完了したことを確認
        console.log('診察記録を保存しました。ID:', newExaminationRef.id);
        
        // URLパラメータ（ownerなど）を保持
        const ownerParam = searchParams.get('owner');
        const params = new URLSearchParams();
        if (ownerParam) {
          params.set('owner', ownerParam);
        }
        const queryString = params.toString();
        const targetPath = queryString 
          ? `/electronic-maternal-handbook?${queryString}#pregnancy`
          : `/electronic-maternal-handbook#pregnancy`;
        
        // 保存完了後に概要ページの妊娠期の記録セクションに遷移
        setSaving(false);
        navigate(targetPath, { replace: true });
        
        // ページ遷移後にスクロール
        setTimeout(() => {
          const element = document.getElementById('pregnancy');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        // 更新
        const examinationRef = doc(db, 'users', ownerId, 'data', 'maternalHandbook', 'examinations', examinationId);
        const pregnancyWeekValue = formData.pregnancyWeek || calculatePregnancyWeek(formData.date);
        
        await setDoc(examinationRef, {
          date: formData.date,
          hospital: formData.hospital,
          testResults: formData.testResults || '',
          notes: formData.notes || '',
          conversation: formData.conversation || '',
          other: formData.other || '',
          pregnancyWeek: pregnancyWeekValue,
          weight: formData.weight || '',
          bloodPressureSystolic: formData.bloodPressureSystolic || '',
          bloodPressureDiastolic: formData.bloodPressureDiastolic || '',
          urineProtein: formData.urineProtein || '',
          urineSugar: formData.urineSugar || '',
          edema: formData.edema || '',
          ultrasoundDate: formData.ultrasoundDate || '',
          fetalPosition: formData.fetalPosition || '',
          estimatedWeight: formData.estimatedWeight || '',
          biparietalDiameter: formData.biparietalDiameter || '',
          abdominalCircumference: formData.abdominalCircumference || '',
          femurLength: formData.femurLength || '',
          placentaPosition: formData.placentaPosition || '',
          amnioticFluid: formData.amnioticFluid || '',
          findings: formData.findings || '',
          abnormalities: formData.abnormalities || '',
          lifestyleGuidance: formData.lifestyleGuidance || '',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        setIsEditing(false);
        setSaving(false);
        // データを再読み込み（診察回数も更新）
        const examinationsRef = collection(db, 'users', ownerId, 'data', 'maternalHandbook', 'examinations');
        const q = query(examinationsRef, orderBy('date', 'asc'));
        const snapshot = await getDocs(q);
        const exams = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        const currentExam = exams.find(exam => exam.id === examinationId);
        if (currentExam) {
          const currentIndex = exams.findIndex(exam => exam.id === examinationId);
          setVisitNumber(currentIndex + 1);
          setExamination({
            id: currentExam.id,
            ...currentExam
          });
        }
      }
    } catch (error) {
      console.error('診察記録保存エラー:', error);
      alert('診察記録の保存に失敗しました。');
      setSaving(false);
    }
  };

  // 診察記録を削除
  const handleDelete = async () => {
    if (!currentUser || !ownerId) return;

    if (isSharedMember && permission !== 'editor') {
      alert('共有メンバーは編集権限がありません。');
      return;
    }

    if (!window.confirm('この診察記録を削除しますか？')) {
      return;
    }

    try {
      const examinationRef = doc(db, 'users', ownerId, 'data', 'maternalHandbook', 'examinations', examinationId);
      await deleteDoc(examinationRef);
      navigate('/electronic-maternal-handbook');
    } catch (error) {
      console.error('診察記録削除エラー:', error);
      alert('診察記録の削除に失敗しました。');
    }
  };

  // 日付をフォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日(${weekday})`;
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="examination-detail-page">
        <div className="examination-detail-content-card">
          <div className="examination-detail-content">
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="examination-detail-page">
      <div className="examination-detail-content-card">
        <div className="examination-detail-content">
          <div className="examination-detail-header">
            <button className="back-button" onClick={() => navigate('/electronic-maternal-handbook')}>
              ← 戻る
            </button>
            <h1 className="examination-detail-title">
              {isNew ? '診察記録を追加' : isEditing ? '診察記録を編集' : `${visitNumber || ''}回目診察の詳細`}
            </h1>
            {!isNew && !isEditing && (!isSharedMember || permission === 'editor') && (
              <div className="examination-detail-actions">
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  編集
                </button>
                <button className="delete-button" onClick={handleDelete}>
                  削除
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="examination-detail-form">
              {/* 基本情報テーブル */}
              <div className="examination-form-table-container">
                <table className="examination-form-table">
                  <tbody>
                    <tr>
                      <td className="table-label">診察日 *</td>
                      <td className="table-value">
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            const calculatedWeek = calculatePregnancyWeek(newDate);
                            setFormData({ ...formData, date: newDate, pregnancyWeek: calculatedWeek || formData.pregnancyWeek });
                          }}
                          className="form-input"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="table-label">病院名 *</td>
                      <td className="table-value">
                        <input
                          type="text"
                          value={formData.hospital}
                          onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                          className="form-input"
                          placeholder="例: 〇〇病院"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 妊娠経過の記録テーブル */}
              <div className="form-section">
                <h3 className="form-section-title">妊娠経過の記録</h3>
                <div className="examination-form-table-container">
                  <table className="examination-form-table">
                    <tbody>
                      <tr>
                        <td className="table-label">妊娠週</td>
                        <td className="table-value">
                          <input
                            type="text"
                            value={formData.pregnancyWeek}
                            onChange={(e) => setFormData({ ...formData, pregnancyWeek: e.target.value })}
                            className="form-input"
                            placeholder="例: 12週3日"
                          />
                        </td>
                        <td className="table-label">体重 (kg)</td>
                        <td className="table-value">
                          <input
                            type="number"
                            step="0.1"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            className="form-input"
                            placeholder="例: 55.5"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="table-label">収縮期血圧 (mmHg)</td>
                        <td className="table-value">
                          <input
                            type="number"
                            value={formData.bloodPressureSystolic}
                            onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                            className="form-input"
                            placeholder="例: 120"
                          />
                        </td>
                        <td className="table-label">拡張期血圧 (mmHg)</td>
                        <td className="table-value">
                          <input
                            type="number"
                            value={formData.bloodPressureDiastolic}
                            onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                            className="form-input"
                            placeholder="例: 80"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="table-label">尿蛋白</td>
                        <td className="table-value">
                          <select
                            value={formData.urineProtein}
                            onChange={(e) => setFormData({ ...formData, urineProtein: e.target.value })}
                            className="form-input"
                          >
                            <option value="">選択してください</option>
                            <option value="(-)">(-)</option>
                            <option value="(±)">(±)</option>
                            <option value="(+)">(+)</option>
                            <option value="(++)">(++)</option>
                            <option value="(+++)">(+++)</option>
                          </select>
                        </td>
                        <td className="table-label">尿糖</td>
                        <td className="table-value">
                          <select
                            value={formData.urineSugar}
                            onChange={(e) => setFormData({ ...formData, urineSugar: e.target.value })}
                            className="form-input"
                          >
                            <option value="">選択してください</option>
                            <option value="(-)">(-)</option>
                            <option value="(±)">(±)</option>
                            <option value="(+)">(+)</option>
                            <option value="(++)">(++)</option>
                            <option value="(+++)">(+++)</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td className="table-label">浮腫</td>
                        <td className="table-value" colSpan="3">
                          <select
                            value={formData.edema}
                            onChange={(e) => setFormData({ ...formData, edema: e.target.value })}
                            className="form-input"
                            style={{ maxWidth: '300px' }}
                          >
                            <option value="">選択してください</option>
                            <option value="なし">なし</option>
                            <option value="軽度">軽度</option>
                            <option value="中等度">中等度</option>
                            <option value="高度">高度</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 超音波検査の記録テーブル */}
              <div className="form-section">
                <h3 className="form-section-title">超音波検査の記録</h3>
                <div className="examination-form-table-container">
                  <table className="examination-form-table">
                    <tbody>
                      <tr>
                        <td className="table-label">超音波検査日</td>
                        <td className="table-value">
                          <input
                            type="date"
                            value={formData.ultrasoundDate}
                            onChange={(e) => setFormData({ ...formData, ultrasoundDate: e.target.value })}
                            className="form-input"
                          />
                        </td>
                        <td className="table-label">胎児の位置</td>
                        <td className="table-value">
                          <input
                            type="text"
                            value={formData.fetalPosition}
                            onChange={(e) => setFormData({ ...formData, fetalPosition: e.target.value })}
                            className="form-input"
                            placeholder="例: 頭位"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="table-label">推定体重 (g)</td>
                        <td className="table-value">
                          <input
                            type="number"
                            value={formData.estimatedWeight}
                            onChange={(e) => setFormData({ ...formData, estimatedWeight: e.target.value })}
                            className="form-input"
                            placeholder="例: 2500"
                          />
                        </td>
                        <td className="table-label">胎盤の位置</td>
                        <td className="table-value">
                          <input
                            type="text"
                            value={formData.placentaPosition}
                            onChange={(e) => setFormData({ ...formData, placentaPosition: e.target.value })}
                            className="form-input"
                            placeholder="例: 前壁"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="table-label">BPD (mm)</td>
                        <td className="table-value">
                          <input
                            type="number"
                            step="0.1"
                            value={formData.biparietalDiameter}
                            onChange={(e) => setFormData({ ...formData, biparietalDiameter: e.target.value })}
                            className="form-input"
                            placeholder="例: 85.5"
                          />
                        </td>
                        <td className="table-label">AC (mm)</td>
                        <td className="table-value">
                          <input
                            type="number"
                            step="0.1"
                            value={formData.abdominalCircumference}
                            onChange={(e) => setFormData({ ...formData, abdominalCircumference: e.target.value })}
                            className="form-input"
                            placeholder="例: 280.0"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="table-label">FL (mm)</td>
                        <td className="table-value">
                          <input
                            type="number"
                            step="0.1"
                            value={formData.femurLength}
                            onChange={(e) => setFormData({ ...formData, femurLength: e.target.value })}
                            className="form-input"
                            placeholder="例: 65.0"
                          />
                        </td>
                        <td className="table-label">羊水量</td>
                        <td className="table-value">
                          <select
                            value={formData.amnioticFluid}
                            onChange={(e) => setFormData({ ...formData, amnioticFluid: e.target.value })}
                            className="form-input"
                          >
                            <option value="">選択してください</option>
                            <option value="正常">正常</option>
                            <option value="やや多い">やや多い</option>
                            <option value="多い">多い</option>
                            <option value="やや少ない">やや少ない</option>
                            <option value="少ない">少ない</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 医師・助産師の所見テーブル */}
              <div className="form-section">
                <h3 className="form-section-title">医師・助産師の所見</h3>
                <div className="examination-form-table-container">
                  <table className="examination-form-table">
                    <tbody>
                      <tr>
                        <td className="table-label">所見</td>
                        <td className="table-value">
                          <textarea
                            value={formData.findings}
                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                            className="form-textarea"
                            placeholder="医師・助産師の所見を入力してください"
                            rows={4}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="table-label">異常の有無</td>
                        <td className="table-value">
                          <textarea
                            value={formData.abnormalities}
                            onChange={(e) => setFormData({ ...formData, abnormalities: e.target.value })}
                            className="form-textarea"
                            placeholder="異常の有無や詳細を入力してください"
                            rows={4}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="table-label">生活指導</td>
                        <td className="table-value">
                          <textarea
                            value={formData.lifestyleGuidance}
                            onChange={(e) => setFormData({ ...formData, lifestyleGuidance: e.target.value })}
                            className="form-textarea"
                            placeholder="生活指導の内容を入力してください"
                            rows={4}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* その他の記録テーブル */}
              <div className="form-section">
                <h3 className="form-section-title">その他の記録</h3>
                <div className="examination-form-table-container">
                  <table className="examination-form-table">
                    <tbody>
                      <tr>
                        <td className="table-label">検査結果</td>
                        <td className="table-value">
                          <textarea
                            value={formData.testResults}
                            onChange={(e) => setFormData({ ...formData, testResults: e.target.value })}
                            className="form-textarea"
                            placeholder="検査結果を入力してください"
                            rows={4}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="table-label">注意事項</td>
                        <td className="table-value">
                          <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="form-textarea"
                            placeholder="注意事項を入力してください"
                            rows={4}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="table-label">医師との会話記録</td>
                        <td className="table-value">
                          <textarea
                            value={formData.conversation}
                            onChange={(e) => setFormData({ ...formData, conversation: e.target.value })}
                            className="form-textarea"
                            placeholder="医師との会話内容を記録してください"
                            rows={4}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="table-label">その他</td>
                        <td className="table-value">
                          <textarea
                            value={formData.other}
                            onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                            className="form-textarea"
                            placeholder="その他の情報を入力してください"
                            rows={4}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="form-actions">
                <button className="cancel-button" onClick={() => {
                  if (isNew) {
                    navigate('/electronic-maternal-handbook');
                  } else {
                    setIsEditing(false);
                    // フォームを元の値に戻す
                    setFormData({
                      date: examination?.date || '',
                      hospital: examination?.hospital || '',
                      testResults: examination?.testResults || '',
                      notes: examination?.notes || '',
                      conversation: examination?.conversation || '',
                      other: examination?.other || '',
                      pregnancyWeek: examination?.pregnancyWeek || '',
                      weight: examination?.weight || '',
                      bloodPressureSystolic: examination?.bloodPressureSystolic || '',
                      bloodPressureDiastolic: examination?.bloodPressureDiastolic || '',
                      urineProtein: examination?.urineProtein || '',
                      urineSugar: examination?.urineSugar || '',
                      edema: examination?.edema || '',
                      ultrasoundDate: examination?.ultrasoundDate || '',
                      fetalPosition: examination?.fetalPosition || '',
                      estimatedWeight: examination?.estimatedWeight || '',
                      biparietalDiameter: examination?.biparietalDiameter || '',
                      abdominalCircumference: examination?.abdominalCircumference || '',
                      femurLength: examination?.femurLength || '',
                      placentaPosition: examination?.placentaPosition || '',
                      amnioticFluid: examination?.amnioticFluid || '',
                      findings: examination?.findings || '',
                      abnormalities: examination?.abnormalities || '',
                      lifestyleGuidance: examination?.lifestyleGuidance || ''
                    });
                  }
                }}>
                  キャンセル
                </button>
                <button className="save-button" onClick={handleSave} disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          ) : (
            <div className="examination-detail-display">
              <div className="examination-detail-item">
                <span className="detail-label">診察日</span>
                <span className="detail-value">{formatDate(examination?.date)}</span>
              </div>
              <div className="examination-detail-item">
                <span className="detail-label">病院名</span>
                <span className="detail-value">{examination?.hospital || '-'}</span>
              </div>

              {/* 妊娠経過の記録セクション */}
              {(examination?.pregnancyWeek || examination?.weight || examination?.bloodPressureSystolic || examination?.urineProtein || examination?.edema) && (
                <div className="examination-detail-section">
                  <h3 className="detail-section-title">妊娠経過の記録</h3>
                  {examination?.pregnancyWeek && (
                    <div className="examination-detail-item">
                      <span className="detail-label">妊娠週</span>
                      <span className="detail-value">{examination.pregnancyWeek}</span>
                    </div>
                  )}
                  {examination?.weight && (
                    <div className="examination-detail-item">
                      <span className="detail-label">体重</span>
                      <span className="detail-value">{examination.weight} kg</span>
                    </div>
                  )}
                  {(examination?.bloodPressureSystolic || examination?.bloodPressureDiastolic) && (
                    <div className="examination-detail-item">
                      <span className="detail-label">血圧</span>
                      <span className="detail-value">
                        {examination.bloodPressureSystolic && examination.bloodPressureDiastolic
                          ? `${examination.bloodPressureSystolic} / ${examination.bloodPressureDiastolic} mmHg`
                          : examination.bloodPressureSystolic
                          ? `${examination.bloodPressureSystolic} / - mmHg`
                          : `- / ${examination.bloodPressureDiastolic} mmHg`}
                      </span>
                    </div>
                  )}
                  {examination?.urineProtein && (
                    <div className="examination-detail-item">
                      <span className="detail-label">尿蛋白</span>
                      <span className="detail-value">{examination.urineProtein}</span>
                    </div>
                  )}
                  {examination?.urineSugar && (
                    <div className="examination-detail-item">
                      <span className="detail-label">尿糖</span>
                      <span className="detail-value">{examination.urineSugar}</span>
                    </div>
                  )}
                  {examination?.edema && (
                    <div className="examination-detail-item">
                      <span className="detail-label">浮腫</span>
                      <span className="detail-value">{examination.edema}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 超音波検査の記録セクション */}
              {(examination?.ultrasoundDate || examination?.fetalPosition || examination?.estimatedWeight || examination?.biparietalDiameter || examination?.placentaPosition) && (
                <div className="examination-detail-section">
                  <h3 className="detail-section-title">超音波検査の記録</h3>
                  {examination?.ultrasoundDate && (
                    <div className="examination-detail-item">
                      <span className="detail-label">超音波検査日</span>
                      <span className="detail-value">{formatDate(examination.ultrasoundDate)}</span>
                    </div>
                  )}
                  {examination?.fetalPosition && (
                    <div className="examination-detail-item">
                      <span className="detail-label">胎児の位置</span>
                      <span className="detail-value">{examination.fetalPosition}</span>
                    </div>
                  )}
                  {examination?.estimatedWeight && (
                    <div className="examination-detail-item">
                      <span className="detail-label">推定体重</span>
                      <span className="detail-value">{examination.estimatedWeight} g</span>
                    </div>
                  )}
                  {(examination?.biparietalDiameter || examination?.abdominalCircumference || examination?.femurLength) && (
                    <div className="examination-detail-item">
                      <span className="detail-label">計測値</span>
                      <span className="detail-value">
                        {[
                          examination.biparietalDiameter && `BPD: ${examination.biparietalDiameter}mm`,
                          examination.abdominalCircumference && `AC: ${examination.abdominalCircumference}mm`,
                          examination.femurLength && `FL: ${examination.femurLength}mm`
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {examination?.placentaPosition && (
                    <div className="examination-detail-item">
                      <span className="detail-label">胎盤の位置</span>
                      <span className="detail-value">{examination.placentaPosition}</span>
                    </div>
                  )}
                  {examination?.amnioticFluid && (
                    <div className="examination-detail-item">
                      <span className="detail-label">羊水量</span>
                      <span className="detail-value">{examination.amnioticFluid}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 医師・助産師の所見セクション */}
              {(examination?.findings || examination?.abnormalities || examination?.lifestyleGuidance) && (
                <div className="examination-detail-section">
                  <h3 className="detail-section-title">医師・助産師の所見</h3>
                  {examination?.findings && (
                    <div className="examination-detail-item">
                      <span className="detail-label">所見</span>
                      <div className="detail-value-multiline">{examination.findings}</div>
                    </div>
                  )}
                  {examination?.abnormalities && (
                    <div className="examination-detail-item">
                      <span className="detail-label">異常の有無</span>
                      <div className="detail-value-multiline">{examination.abnormalities}</div>
                    </div>
                  )}
                  {examination?.lifestyleGuidance && (
                    <div className="examination-detail-item">
                      <span className="detail-label">生活指導</span>
                      <div className="detail-value-multiline">{examination.lifestyleGuidance}</div>
                    </div>
                  )}
                </div>
              )}

              {examination?.testResults && (
                <div className="examination-detail-item">
                  <span className="detail-label">検査結果</span>
                  <div className="detail-value-multiline">{examination.testResults}</div>
                </div>
              )}
              {examination?.notes && (
                <div className="examination-detail-item">
                  <span className="detail-label">注意事項</span>
                  <div className="detail-value-multiline">{examination.notes}</div>
                </div>
              )}
              {examination?.conversation && (
                <div className="examination-detail-item">
                  <span className="detail-label">医師との会話記録</span>
                  <div className="detail-value-multiline">{examination.conversation}</div>
                </div>
              )}
              {examination?.other && (
                <div className="examination-detail-item">
                  <span className="detail-label">その他</span>
                  <div className="detail-value-multiline">{examination.other}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExaminationDetail;

