import React, { useState } from 'react';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { NAV_GROUPS } from './navConfig';
import { Avatar, Button, Logo, Modal, cx } from '../ui/kit';

interface SidebarProps {
  store: ReturnType<typeof useERPStore>;
}

export const Sidebar: React.FC<SidebarProps> = ({ store }) => {
  const { state, setView, logout } = store;
  const [collapsed, setCollapsed] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const user = state.currentUser;
  const allowed = user?.permissions?.allowedViews;
  const canSee = (view: string) => !allowed || (allowed as string[]).includes(view);

  return (
    <aside className={cx('h-full flex flex-col bg-white border-r border-gray-200 transition-all duration-200 flex-shrink-0', collapsed ? 'w-[68px]' : 'w-64')}>
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
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map(group => {
          const items = group.items.filter(i => canSee(i.view));
          if (items.length === 0) return null;
          return (
            <div key={group.title}>
              {!collapsed && <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{group.title}</p>}
              <ul className="space-y-0.5">
                {items.map(item => {
                  const active = state.currentView === item.view || !!item.alsoActive?.includes(state.currentView);
                  const Icon = item.icon;
                  return (
                    <li key={item.view}>
                      <button
                        onClick={() => setView(item.view)}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? 'page' : undefined}
                        className={cx(
                          'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                          collapsed && 'justify-center px-0',
                          active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        <Icon className={cx('w-[18px] h-[18px] flex-shrink-0', active ? 'text-indigo-600' : 'text-gray-400')} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-3">
        <div className={cx('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar name={user?.name || 'User'} />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          )}
          <button
            onClick={() => setConfirmLogout(true)}
            className={cx('p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-rose-600', collapsed && 'hidden')}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        {collapsed && (
          <button onClick={() => setConfirmLogout(true)} className="mt-2 w-full flex justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-rose-600" aria-label="Log out">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

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
    </aside>
  );
};
