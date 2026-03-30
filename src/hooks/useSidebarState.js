import { useState, useEffect } from 'react';

const SUBMENU_STATE_KEY = 'submenuState';

export const useSidebarState = () => {
  // サブメニューの状態をLocalStorageから読み込む
  const getInitialSubmenuState = () => {
    if (typeof window === 'undefined') return true; // SSR対応
    
    const saved = localStorage.getItem(SUBMENU_STATE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
    
    return true; // デフォルトは開く
  };

  // サイドバーは常に開いた状態を維持（固定）
  const [sidebarOpen] = useState(true);
  const [subMenuOpen, setSubMenuOpen] = useState(getInitialSubmenuState);

  // サブメニューの状態をLocalStorageに保存
  useEffect(() => {
    localStorage.setItem(SUBMENU_STATE_KEY, subMenuOpen.toString());
  }, [subMenuOpen]);

  // レスポンシブ対応：モバイル/タブレットサイズではサイドバーを閉じる
  // ただし、サイドバーは固定なので、この処理は不要
  // モバイルサイズでもサイドバーは開いたままにする

  const closeSidebar = () => {
    // サイドバーは固定なので、閉じる処理は行わない
    // ただし、モバイルサイズではオーバーレイで閉じる動作が必要な場合があるため、
    // この関数は残しておくが、実際には何もしない
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(prev => !prev);
  };

  return {
    sidebarOpen,
    subMenuOpen,
    setSubMenuOpen,
    closeSidebar,
    toggleSubMenu
  };
};

