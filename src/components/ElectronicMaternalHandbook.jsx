import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { useOwnerId } from '../hooks/useOwnerId';
import './ElectronicMaternalHandbook.css';

const ElectronicMaternalHandbook = () => {
  const { currentUser } = useAuth();
  const { ownerId, loading: ownerIdLoading, isSharedMember, permission } = useOwnerId();
  const location = useLocation();
  const navigate = useNavigate();
  const [dueDate, setDueDate] = useState('');
  const [firstExaminationDate, setFirstExaminationDate] = useState('');
  const [examinations, setExaminations] = useState([]);

  // ページ遷移時にスクロール位置をトップに戻す
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Firestoreから出産予定日と初回診察日を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const userDataRef = doc(db, 'users', ownerId, 'data', 'profile');
    const unsubscribe = onSnapshot(userDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDueDate(data.dueDate || '');
        setFirstExaminationDate(data.firstExaminationDate || '');
      }
    }, (error) => {
      console.error('データ監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);

  // Firestoreから診察記録を読み込む
  useEffect(() => {
    if (!currentUser || ownerIdLoading || !ownerId) return;

    const examinationsRef = collection(db, 'users', ownerId, 'data', 'maternalHandbook', 'examinations');
    const q = query(examinationsRef, orderBy('date', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const exams = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      // 診察回数を自動的に設定（日付順）
      const examsWithVisitNumber = exams.map((exam, index) => ({
        ...exam,
        visitNumber: index + 1
      }));
      setExaminations(examsWithVisitNumber);
    }, (error) => {
      console.error('診察記録監視エラー:', error);
    });

    return () => unsubscribe();
  }, [currentUser, ownerId, ownerIdLoading]);

  // 診察記録の追加ページに遷移
  const handleAddExamination = () => {
    if (isSharedMember && permission !== 'editor') {
      alert('共有メンバーは編集権限がありません。');
      return;
    }
    navigate('/electronic-maternal-handbook/examination/new');
  };

  // 診察記録の詳細ページに遷移
  const handleExaminationClick = (examinationId) => {
    navigate(`/electronic-maternal-handbook/examination/${examinationId}`);
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

  return (
    <div className="electronic-maternal-handbook-page">
      <div className="electronic-maternal-handbook-content-card">
        <div className="electronic-maternal-handbook-content">
        {/* 概要セクション */}
        <div id="overview" className="detail-section">
          <div className="detail-card">
            <h2 className="section-title">電子母子手帳について</h2>
            <p className="section-description">
              電子母子手帳は、妊娠から出産、育児までの記録をデジタルで管理できるシステムです。
              従来の紙の母子手帳の情報をデジタル化し、いつでもどこでもアクセスできるようにします。
            </p>
          </div>
        </div>

        {/* 妊娠期の記録セクション */}
        <div id="pregnancy" className="detail-section">
          <div className="detail-card">
            <div className="section-header-with-button">
              <h2 className="section-title">妊娠期の記録</h2>
              {!isSharedMember || permission === 'editor' ? (
                <button
                  className="add-examination-button"
                  onClick={handleAddExamination}
                >
                  + 診察記録を追加
                </button>
              ) : null}
            </div>
            {dueDate && (
              <div className="info-item">
                <span className="info-label">出産予定日:</span>
                <span className="info-value">{formatDate(dueDate)}</span>
              </div>
            )}
            {firstExaminationDate && (
              <div className="info-item">
                <span className="info-label">初回診察日:</span>
                <span className="info-value">{formatDate(firstExaminationDate)}</span>
              </div>
            )}
            
            {/* 妊婦健診のスケジュール表 */}
            {examinations.length > 0 && (
              <div className="examination-schedule-section">
                <h3 className="schedule-title">妊婦健診のスケジュール</h3>
                <div className="schedule-table-wrapper">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>回数</th>
                        <th>診察日</th>
                        <th>妊娠週</th>
                        <th>病院名</th>
                        <th>体重</th>
                        <th>血圧</th>
                        <th>尿蛋白</th>
                        <th>浮腫</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examinations.map((exam) => (
                        <tr
                          key={exam.id}
                          className="schedule-table-row"
                          onClick={() => handleExaminationClick(exam.id)}
                        >
                          <td>{exam.visitNumber}回目</td>
                          <td>{formatDate(exam.date)}</td>
                          <td>{exam.pregnancyWeek || '-'}</td>
                          <td>{exam.hospital || '-'}</td>
                          <td>{exam.weight ? `${exam.weight} kg` : '-'}</td>
                          <td>
                            {exam.bloodPressureSystolic && exam.bloodPressureDiastolic
                              ? `${exam.bloodPressureSystolic} / ${exam.bloodPressureDiastolic}`
                              : exam.bloodPressureSystolic
                              ? `${exam.bloodPressureSystolic} / -`
                              : exam.bloodPressureDiastolic
                              ? `- / ${exam.bloodPressureDiastolic}`
                              : '-'}
                          </td>
                          <td>{exam.urineProtein || '-'}</td>
                          <td>{exam.edema || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 診察記録一覧（カード形式） */}
            {examinations.length > 0 && (
              <div className="examinations-list">
                {examinations.map((exam) => (
                  <div
                    key={exam.id}
                    className="examination-item"
                    onClick={() => handleExaminationClick(exam.id)}
                  >
                    <div className="examination-header">
                      <span className="examination-number">{exam.visitNumber}回目診察</span>
                      <span className="examination-date">{formatDate(exam.date)}</span>
                      <span className="examination-hospital">{exam.hospital}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {examinations.length === 0 && !dueDate && !firstExaminationDate && (
              <p className="no-data-message">マイページで出産予定日と初回診察日を設定してください。</p>
            )}
          </div>
        </div>

        {/* 産後の記録セクション */}
        <div id="postpartum" className="detail-section">
          <div className="detail-card">
            <h2 className="section-title">産後の記録</h2>
            <p className="section-description">
              産後の記録は、出産後に記録できるようになります。
            </p>
          </div>
        </div>

        {/* 子どもの記録セクション */}
        <div id="child" className="detail-section">
          <div className="detail-card">
            <h2 className="section-title">子どもの記録</h2>
            <p className="section-description">
              子どもの記録は、出産後に記録できるようになります。
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ElectronicMaternalHandbook;

