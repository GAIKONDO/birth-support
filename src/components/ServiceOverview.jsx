import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebarState } from '../hooks/useSidebarState';
import Sidebar from './Sidebar';
import SubMenu from './SubMenu';
import './ServiceOverview.css';
import './Layout.css';

const ServiceOverview = () => {
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
          <div className="service-overview-page">
            <div className="service-overview-content-card">
              <div className="service-overview-content">
                <div className="service-overview-section">
                  <h1>サービス概要</h1>
                  <p className="service-overview-description">
                    サービス概要の内容がここに表示されます。
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

export default ServiceOverview;

