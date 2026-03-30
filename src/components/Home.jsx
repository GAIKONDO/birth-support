import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebarState } from '../hooks/useSidebarState';
import Sidebar from './Sidebar';
import SubMenu from './SubMenu';
import './Home.css';
import './Layout.css';

const Home = () => {
  const location = useLocation();
  const { sidebarOpen, subMenuOpen, closeSidebar, toggleSubMenu } = useSidebarState();

  // ページ遷移時にスクロール位置をトップに戻す
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
          <div className="home-page">
            <div className="home-content-card">
              <div className="home-content">
                <div className="home-section">
                  <h1>出産支援制度アプリ</h1>
                  <p className="home-description">
                    妊娠期間から育児期までの診察、申請、報告などのアクションを一元管理できるシステムです。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

