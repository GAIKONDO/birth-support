import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebarState } from '../hooks/useSidebarState';
import Sidebar from './Sidebar';
import SubMenu from './SubMenu';
import './Registration.css';
import './Layout.css';

const Registration = () => {
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
          <div className="registration-page">
            <div className="registration-content-card">
              <div className="registration-content">
                <div className="registration-section">
                  <h1>登録方法</h1>
                  <p className="registration-description">
                    登録方法の内容がここに表示されます。
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

export default Registration;

