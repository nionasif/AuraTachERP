import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { VIEW_TITLES } from './components/common/navConfig';
import { Button } from './components/ui/kit';
import { useERPStore } from './store/erpStore';
import { TopHeader } from './components/common/TopHeader';
import { Sidebar } from './components/common/Sidebar';
import { ManagementDashboard } from './components/dashboard/ManagementDashboard';
import { PosTerminal } from './components/pos/PosTerminal';
import { HomePage } from './components/home/HomePage';
import { InvoiceManagementModal } from './components/invoice/InvoiceManagementModal';

// Workspaces
import { StoringWorkspaceView } from './components/views/StoringWorkspaceView';
import { ReceiveWorkspaceView } from './components/views/ReceiveWorkspaceView';
import { TransferWorkspaceView } from './components/views/TransferWorkspaceView';
import { SetupWorkspaceView } from './components/views/SetupWorkspaceView';
import { RequisitionWorkspaceView } from './components/views/RequisitionWorkspaceView';
import { EcommerceWorkspaceView } from './components/views/EcommerceWorkspaceView';
import { CrmWorkspaceView } from './components/views/CrmWorkspaceView';
import { ReportWorkspaceView } from './components/views/ReportWorkspaceView';
import { AdminWorkspaceView } from './components/views/AdminWorkspaceView';
import { StaffWorkspaceView } from './components/views/StaffWorkspaceView';
import { DamageProductWorkspaceView } from './components/views/DamageProductWorkspaceView';
import { RepairProductWorkspaceView } from './components/views/RepairProductWorkspaceView';
import { ShoppingBagWorkspaceView } from './components/views/ShoppingBagWorkspaceView';
import { AuditWorkspaceView } from './components/views/AuditWorkspaceView';
import { BiWorkspaceView } from './components/views/BiWorkspaceView';
import { MyTasksWorkspaceView } from './components/views/MyTasksWorkspaceView';

// Modals
import { PaymentModal } from './components/pos/PaymentModal';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { ShiftRegisterModal } from './components/pos/ShiftRegisterModal';
import { StockSearchModal } from './components/modules/StockSearchModal';
import { StockAgingModal } from './components/modules/StockAgingModal';
import { GoodsReceiveModal } from './components/modules/GoodsReceiveModal';
import { StockTransferModal } from './components/modules/StockTransferModal';
import { RecallCartsModal } from './components/modules/RecallCartsModal';
import { NewCustomerModal } from './components/modules/NewCustomerModal';
import { OtherLinksDetailModal } from './components/modules/OtherLinksDetailModal';
import { ViewType } from './types/erp';

const ROUTE_MAP: Record<string, ViewType> = {
  '/': 'DASHBOARD',
  '/dashboard': 'DASHBOARD',
  '/tasks': 'MY_TASKS',
  '/my-tasks': 'MY_TASKS',
  '/hr': 'STAFF',
  '/employees': 'STAFF',
  '/crm': 'CRM',
  '/projects': 'ECOMMERCE',
  '/project-management': 'ECOMMERCE',
  '/sales': 'POS',
  '/service': 'POS',
  '/assets': 'STORING',
  '/it-assets': 'STORING',
  '/procurement': 'RECEIVE',
  '/vendors': 'RECEIVE',
  '/finance': 'REPORT',
  '/accounting': 'REPORT',
  '/helpdesk': 'REPAIR',
  '/support': 'REPAIR',
  '/reports': 'BI_TOOLS',
  '/analytics': 'BI_TOOLS',
  '/users': 'ADMIN',
  '/user-management': 'ADMIN',
  '/activity-log': 'AUDIT',
  '/audit': 'AUDIT',
  '/settings': 'SETUP',
};

const VIEW_TO_PATH: Record<ViewType, string> = {
  DASHBOARD: '/dashboard',
  MY_TASKS: '/tasks',
  STAFF: '/hr',
  CRM: '/crm',
  ECOMMERCE: '/projects',
  POS: '/sales',
  STORING: '/assets',
  RECEIVE: '/procurement',
  REPORT: '/finance',
  REPAIR: '/helpdesk',
  BI_TOOLS: '/reports',
  ADMIN: '/users',
  AUDIT: '/activity-log',
  SETUP: '/settings',
  TRANSFER: '/assets',
  REQUISITION: '/procurement',
  DAMAGE: '/assets',
  SHOPPING_BAG: '/assets',
};

export const App: React.FC = () => {
  const store = useERPStore();
  const { state, closeModal, setView } = store;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isInitialMount = React.useRef(true);
  const isPopStateNavigation = React.useRef(false);

  // Close mobile menu whenever view changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [state.currentView]);

  // 1. Initial canonical URL synchronization and popstate handler for Back/Forward navigation
  React.useEffect(() => {
    // If authenticated, keep address bar in sync with canonical view
    if (state.isAuthenticated) {
      const targetPath = VIEW_TO_PATH[state.currentView] || '/dashboard';
      const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      if (currentPath !== targetPath) {
        window.history.replaceState({ view: state.currentView }, '', targetPath);
      }
    }

    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      if (ROUTE_MAP[path]) {
        isPopStateNavigation.current = true;
        setView(ROUTE_MAP[path]);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [state.isAuthenticated, setView]);

  // 2. Synchronize address bar URL whenever view changes in UI (Sidebar, TopNav, Hotkeys)
  React.useEffect(() => {
    if (!state.isAuthenticated) return;
    const targetPath = VIEW_TO_PATH[state.currentView] || '/dashboard';
    const title = VIEW_TITLES[state.currentView] || 'Dashboard';
    document.title = `${title} · AuraTech ERP`;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isPopStateNavigation.current) {
      isPopStateNavigation.current = false;
      return;
    }

    if (window.location.pathname.toLowerCase() !== targetPath) {
      window.history.pushState({ view: state.currentView }, '', targetPath);
    }
  }, [state.isAuthenticated, state.currentView]);

  // Session expired / not valid on the server -> back to the login screen
  React.useEffect(() => {
    const onUnauthorized = () => store.logout();
    window.addEventListener('auratech:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auratech:unauthorized', onUnauthorized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.logout]);

  // Global keyboard shortcuts (Escape closes modals/workspaces, F1 goes to Dashboard)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state.activeModal) {
          closeModal();
        } else if (state.currentView !== 'DASHBOARD' && state.currentView !== 'POS') {
          setView('DASHBOARD');
        }
      } else if (e.key === 'F1') {
        e.preventDefault();
        setView('DASHBOARD');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activeModal, state.currentView, closeModal, setView]);

  // If not authenticated, render the Modern Interactive Home Page with Portal Login
  if (!state.isAuthenticated) {
    return <HomePage store={store} />;
  }

  const isCurrentViewAllowed =
    !state.currentUser?.permissions?.allowedViews ||
    state.currentUser.permissions.allowedViews.includes(state.currentView);

  return (
    <div className="h-screen w-screen flex bg-gray-50 text-gray-900 overflow-hidden font-sans">
      {/* Left menu */}
      <Sidebar
        store={store}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Page title bar */}
        <TopHeader
          store={store}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          {!isCurrentViewAllowed ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No access to this page</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Your role (<span className="font-semibold text-gray-700">{state.currentUser?.role}</span>) cannot open{' '}
                  <span className="font-semibold text-gray-700">{VIEW_TITLES[state.currentView]}</span>. Ask an administrator if you need it.
                </p>
                <Button onClick={() => setView('DASHBOARD')}>Back to Dashboard</Button>
              </div>
            </div>
          ) : (
            <>
              {state.currentView === 'DASHBOARD' && <ManagementDashboard store={store} />}
              {state.currentView === 'MY_TASKS' && <MyTasksWorkspaceView store={store} />}
              {state.currentView === 'POS' && <PosTerminal store={store} />}
              {state.currentView === 'STORING' && <StoringWorkspaceView store={store} />}
              {state.currentView === 'RECEIVE' && <ReceiveWorkspaceView store={store} />}
              {state.currentView === 'TRANSFER' && <TransferWorkspaceView store={store} />}
              {state.currentView === 'SETUP' && <SetupWorkspaceView store={store} />}
              {state.currentView === 'REQUISITION' && <RequisitionWorkspaceView store={store} />}
              {state.currentView === 'ECOMMERCE' && <EcommerceWorkspaceView store={store} />}
              {state.currentView === 'CRM' && <CrmWorkspaceView store={store} />}
              {state.currentView === 'REPORT' && <ReportWorkspaceView store={store} />}
              {state.currentView === 'ADMIN' && <AdminWorkspaceView store={store} />}
              {state.currentView === 'STAFF' && <StaffWorkspaceView store={store} />}
              {state.currentView === 'DAMAGE' && <DamageProductWorkspaceView store={store} />}
              {state.currentView === 'REPAIR' && <RepairProductWorkspaceView store={store} />}
              {state.currentView === 'SHOPPING_BAG' && <ShoppingBagWorkspaceView store={store} />}
              {state.currentView === 'AUDIT' && <AuditWorkspaceView store={store} />}
              {state.currentView === 'BI_TOOLS' && <BiWorkspaceView store={store} />}
            </>
          )}
        </main>
      </div>

      {/* Interactive Modal Registry */}
      {state.activeModal === 'PAYMENT' && <PaymentModal store={store} />}
      {state.activeModal === 'RECEIPT_PREVIEW' && <ReceiptModal store={store} />}
      {state.activeModal === 'SHIFT_REGISTER' && <ShiftRegisterModal store={store} />}
      {state.activeModal === 'STOCK_SEARCH' && <StockSearchModal store={store} />}
      {state.activeModal === 'AGING_STOCK' && <StockAgingModal store={store} />}
      {state.activeModal === 'GOODS_RECEIVE' && <GoodsReceiveModal store={store} />}
      {state.activeModal === 'STOCK_TRANSFER' && <StockTransferModal store={store} />}
      {(state.activeModal === 'INVOICE_MANAGEMENT' || state.activeModal === 'INVOICE_LIST') && (
        <InvoiceManagementModal store={store} />
      )}
      {state.activeModal === 'RECALL_CARTS' && <RecallCartsModal store={store} />}
      {state.activeModal === 'NEW_CUSTOMER' && <NewCustomerModal store={store} />}
      {state.activeModal === 'OTHER_LINK_DETAIL' && <OtherLinksDetailModal store={store} />}
    </div>
  );
};

export default App;
