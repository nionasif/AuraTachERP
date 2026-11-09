import React, { useState } from 'react';
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { NAV_GROUPS } from './navConfig';
import { Avatar, Button, Logo, Modal, cx } from '../ui/kit';

interface SidebarProps {
  store: ReturnType<typeof useERPStore>;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ store, mobileOpen = false, onCloseMobile }) => {
  const { state, setView, logout } = store;
  const [collapsed, setCollapsed] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const user = state.currentUser;
  const allowed = user?.permissions?.allowedViews;
  const canSee = (view: string) => !allowed || (allowed as string[]).includes(view);

  const renderNavItems = (isMobile = false) => (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {NAV_GROUPS.map(group => {
        const items = group.items.filter(i => canSee(i.view));
        if (items.length === 0) return null;
        return (
          <div key={group.title}>
            {(!collapsed || isMobile) && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{group.title}</p>
            )}
            <ul className="space-y-0.5">
              {items.map(item => {
                const active = state.currentView === item.view || !!item.alsoActive?.includes(state.currentView);
                const Icon = item.icon;
                return (
                  <li key={item.view}>
                    <button
                      onClick={() => {
                        setView(item.view);
                        if (isMobile && onCloseMobile) {
                          onCloseMobile();
                        }
                      }}
                      title={collapsed && !isMobile ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={cx(
                        'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                        collapsed && !isMobile && 'justify-center px-0',
                        active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Icon className={cx('w-[18px] h-[18px] flex-shrink-0', active ? 'text-indigo-600' : 'text-gray-400')} />
                      {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const renderUserBlock = (isMobile = false) => (
    <div className="border-t border-gray-100 p-3">
      <div className={cx('flex items-center gap-3', collapsed && !isMobile && 'justify-center')}>
        <Avatar name={user?.name || 'User'} />
        {(!collapsed || isMobile) && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
        )}
        <button
          onClick={() => setConfirmLogout(true)}
          className={cx('p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-rose-600', collapsed && !isMobile && 'hidden')}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
      {collapsed && !isMobile && (
        <button
          onClick={() => setConfirmLogout(true)}
          className="mt-2 w-full flex justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-rose-600"
          aria-label="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className={cx(
          'fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-200',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Mobile Drawer (Visible on small screens when mobileOpen is true) */}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col bg-white border-r border-gray-200 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="h-16 flex items-center justify-between border-b border-gray-100 px-4">
          <Logo />
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderNavItems(true)}
        {renderUserBlock(true)}
      </aside>

      {/* Desktop Stationary Sidebar (Hidden on mobile/tablet) */}
      <aside
        className={cx(
          'hidden lg:flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-200 flex-shrink-0',
          collapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        {/* Brand */}
        <div className={cx('h-16 flex items-center border-b border-gray-100 px-4', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && <Logo />}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu */}
        {renderNavItems(false)}

        {/* User */}
        {renderUserBlock(false)}
      </aside>

      {/* Logout confirmation modal */}
      {confirmLogout && (
        <Modal
          title="Log out?"
          subtitle="You will need to log in again to continue."
          onClose={() => setConfirmLogout(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmLogout(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setConfirmLogout(false);
                  logout();
                }}
              >
                Log out
              </Button>
            </>
          }
        >
          <p className="text-sm text-gray-600">Signed in as {user?.name}.</p>
        </Modal>
      )}
    </>
  );
};
