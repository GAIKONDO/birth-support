import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import './AIAssistant.css';

const AIAssistant = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [firstExaminationDate, setFirstExaminationDate] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Firestoreから出産予定日と初回診察日を読み込む
  useEffect(() => {
    if (!currentUser) return;

    const userDataRef = doc(db, 'users', currentUser.uid, 'data', 'profile');
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
  }, [currentUser]);

  // 初回メッセージを設定
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          role: 'assistant',
          content: 'こんにちは！AIアシスタントです。\n\n妊娠・出産・育児に関する質問や相談をいつでもお気軽にどうぞ。また、あなたの情報に基づいて、マイページに登録すべきカードをおすすめすることもできます。\n\n以下のようなサポートも行えます：\n• 伴走型育児支援・アドバイス\n• 薬の紹介・相談\n• 予防接種の案内\n• 遺伝子検査の紹介\n• アレルギー検査の紹介',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // ページ遷移時にスクロール位置をトップに戻す
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // メッセージ送信時にスクロール（初回レンダリング時は除く）
  useEffect(() => {
    // 初回メッセージが設定された直後はスクロールしない
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // AI応答を生成（モック実装）
  const generateAIResponse = async (userMessage) => {
    setIsLoading(true);
    
    // モック応答（実際の実装では、AI APIを呼び出す）
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let response = '';
    
    // キーワードに基づいた応答
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('おすすめ') || lowerMessage.includes('リコメンド') || lowerMessage.includes('登録')) {
      response = generateRecommendations();
    } else if (lowerMessage.includes('メンタル') || lowerMessage.includes('ストレス') || lowerMessage.includes('不安')) {
      response = generateMentalHealthResponse(userMessage);
    } else if (lowerMessage.includes('薬') || lowerMessage.includes('くすり') || lowerMessage.includes('処方')) {
      response = generateMedicineAdvice(userMessage);
    } else if (lowerMessage.includes('予防接種') || lowerMessage.includes('ワクチン') || lowerMessage.includes('接種')) {
      response = generateVaccinationAdvice(userMessage);
    } else if (lowerMessage.includes('遺伝子検査') || lowerMessage.includes('遺伝子') || lowerMessage.includes('遺伝')) {
      response = generateGeneticTestAdvice(userMessage);
    } else if (lowerMessage.includes('アレルギー') || lowerMessage.includes('アレルゲン') || lowerMessage.includes('アレルギー検査')) {
      response = generateAllergyTestAdvice(userMessage);
    } else if (lowerMessage.includes('育児') || lowerMessage.includes('子育て') || lowerMessage.includes('伴走') || lowerMessage.includes('支援')) {
      response = generateParentingSupport(userMessage);
    } else if (lowerMessage.includes('妊娠') || lowerMessage.includes('出産')) {
      response = generateGeneralAdvice(userMessage);
    } else {
      response = generateDefaultResponse(userMessage);
    }
    
    setIsLoading(false);
    return response;
  };

  // リコメンド生成
  const generateRecommendations = () => {
    const recs = [];
    
    if (dueDate) {
      recs.push('出産予定日が設定されているので、以下のカードをマイページに登録することをおすすめします：');
      recs.push('• 出産育児一時金の申請準備');
      recs.push('• 育児休業給付金の申請準備');
      recs.push('• 産前産後休暇の申請');
    } else {
      recs.push('まず、マイページで出産予定日を設定すると、より具体的なリコメンドができます。');
    }
    
    recs.push('\nまた、以下のカテゴリからもおすすめできます：');
    recs.push('• 市役所：妊娠届出の提出先');
    recs.push('• 医療機関：産婦人科や小児科');
    recs.push('• 支援制度：各種手当や給付金');
    recs.push('• 保育施設：復職準備として');
    
    return recs.join('\n');
  };

  // メンタルヘルス応答
  const generateMentalHealthResponse = (message) => {
    const responses = [
      '妊娠中や育児中は、心身ともに大きな変化があります。不安やストレスを感じるのは自然なことです。',
      'もし不安やストレスを感じているなら、無理をせずに休息を取ることが大切です。',
      '周りの人に相談することも大切です。家族や友人、医療機関の専門家に相談してみてください。',
      '一人で抱え込まず、コミュニティーやサポートグループに参加することもおすすめです。',
      '規則正しい生活リズムを保つことや、軽い運動やリラックスできる時間を作ることも効果的です。'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + '\n\n何か具体的に相談したいことがあれば、お聞かせください。';
  };

  // 一般的なアドバイス
  const generateGeneralAdvice = (message) => {
    return '妊娠・出産・育児に関するご質問ありがとうございます。\n\n具体的な内容について、もう少し詳しく教えていただけますか？例えば：\n• 妊娠中の体調管理について\n• 出産準備について\n• 育児の悩みについて\n• 制度や手続きについて\n\nより具体的なアドバイスができます。';
  };

  // デフォルト応答
  const generateDefaultResponse = (message) => {
    return 'ご質問ありがとうございます。\n\n以下のようなことができます：\n• 妊娠・出産・育児に関するアドバイス\n• マイページに登録すべきカードのリコメンド\n• メンタルヘルスサポート\n• 各種制度や手続きの案内\n\n何かお手伝いできることがあれば、お気軽にお聞かせください。';
  };

  // メッセージ送信
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const aiResponse = await generateAIResponse(inputMessage);
    
    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  // クイックアクション（リコメンド）
  const handleQuickRecommendation = async () => {
    const message = 'マイページに登録すべきカードをおすすめして';
    setInputMessage(message);
    await handleSendMessage();
  };

  // クイックアクション（メンタルヘルス）
  const handleQuickMentalHealth = async () => {
    const message = 'メンタルヘルスについて相談したい';
    setInputMessage(message);
    await handleSendMessage();
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="ai-assistant-page">
      <div className="ai-assistant-content-card">
        <div className="ai-assistant-content">
        {/* クイックアクション */}
        <div className="quick-actions-section">
          <div className="quick-actions-card">
            <h3 className="quick-actions-title">クイックアクション</h3>
            <div className="quick-actions-buttons">
              <button className="quick-action-button" onClick={handleQuickRecommendation}>
                <span className="quick-action-icon">💡</span>
                <span className="quick-action-label">おすすめカード</span>
              </button>
              <button className="quick-action-button" onClick={handleQuickMentalHealth}>
                <span className="quick-action-icon">💚</span>
                <span className="quick-action-label">メンタルヘルス</span>
              </button>
            </div>
          </div>
        </div>

        {/* チャットエリア */}
        <div id="chat" className="chat-section">
          <div className="chat-card">
            <div className="chat-header">
              <h2 className="chat-title">AIアシスタント</h2>
              <p className="chat-subtitle">妊娠・出産・育児に関する質問や相談をどうぞ</p>
            </div>
            
            <div className="chat-messages" ref={chatContainerRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                >
                  <div className="message-content">
                    {message.role === 'assistant' && (
                      <div className="message-avatar">🤖</div>
                    )}
                    <div className="message-bubble">
                      <p className="message-text">{message.content}</p>
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {message.role === 'user' && (
                      <div className="message-avatar">👤</div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message assistant-message">
                  <div className="message-content">
                    <div className="message-avatar">🤖</div>
                    <div className="message-bubble">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <div className="chat-input-group">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="メッセージを入力..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
                <button
                  className="chat-send-button"
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
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

export default AIAssistant;

