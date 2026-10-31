import { lazy, Suspense } from 'react';
import { ReloadPrompt } from './components/layout/ReloadPrompt';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav, type NavTab } from './components/layout/BottomNav';
import { DashboardView } from './features/dashboard/DashboardView';
import { TransactionForm } from './components/forms/TransactionForm';
import { Toast } from './components/ui/Toast';
import { SyncBadge } from './components/layout/SyncBadge';
import { useAppState } from './hooks/useAppState';

const AccountsView = lazy(() =>
  import('./features/accounts/AccountsView').then((m) => ({ default: m.AccountsView }))
);
const BillsView = lazy(() =>
  import('./features/accounts/BillsView').then((m) => ({ default: m.BillsView }))
);
const ReportView = lazy(() =>
  import('./features/report/ReportView').then((m) => ({ default: m.ReportView }))
);
const HistoryView = lazy(() =>
  import('./features/history/HistoryView').then((m) => ({ default: m.HistoryView }))
);
const SettingsModal = lazy(() =>
  import('./components/modals/SettingsModal').then((m) => ({ default: m.SettingsModal }))
);
const EditAccountModal = lazy(() =>
  import('./components/modals/EditAccountModal').then((m) => ({ default: m.EditAccountModal }))
);
const EditTransactionModal = lazy(() =>
  import('./components/modals/EditTransactionModal').then((m) => ({ default: m.EditTransactionModal }))
);
const EditCategoryModal = lazy(() =>
  import('./components/modals/EditCategoryModal').then((m) => ({ default: m.EditCategoryModal }))
);
const EditTemplateModal = lazy(() =>
  import('./components/modals/EditTemplateModal').then((m) => ({ default: m.EditTemplateModal }))
);
const VoiceTransactionModal = lazy(() =>
  import('./components/modals/VoiceTransactionModal').then((m) => ({ default: m.VoiceTransactionModal }))
);

const VIEW_TITLES: Record<NavTab, string> = {
  dashboard: 'Dashboard Overview',
  riwayat: 'Riwayat Transaksi',
  report: 'Laporan & Grafik Keuangan',
  saldo: 'Saldo & Rekening',
  tagihan: 'Tagihan & Pinjaman',
  input: 'Catat Transaksi Baru',
};

function ViewFallback() {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-2.5">
      <div className="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
      <p className="text-xs font-medium text-ink-muted">Memuat tampilan...</p>
    </div>
  );
}

/**
 * Shell only: layout, routing between views, and modal mounting.
 *
 * All state lives in `useAppState` (see `hooks/`). This file used to be 970 lines
 * of interleaved state, network code and JSX; keeping it to the render tree means
 * a change to how data is written never requires reading the layout, and vice
 * versa.
 */
export function App() {
  const app = useAppState();
  const { ui, toast } = app;

  const openTxEditor = (transaction: (typeof app.transactions)[number]) =>
    ui.transactionModal.open({ ...transaction });

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col lg:flex-row font-sans selection:bg-brand-soft selection:text-brand-text transition-colors duration-200">
      <Sidebar
        activeTab={ui.activeTab}
        onChangeTab={ui.setActiveTab}
        onOpenSettings={ui.openSettings}
        onOpenVoiceModal={ui.openVoiceModal}
        isRefreshing={app.isRefreshing}
        isLoading={app.isLoading}
        onSync={app.refreshData}
        pendingSyncCount={app.pendingSyncCount}
        isOnline={app.isOnline}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden">
          <Header
            activeTab={ui.activeTab}
            onChangeTab={ui.setActiveTab}
            onOpenSettings={ui.openSettings}
            onOpenVoiceModal={ui.openVoiceModal}
            isRefreshing={app.isRefreshing}
            isLoading={app.isLoading}
            onSync={app.refreshData}
            pendingSyncCount={app.pendingSyncCount}
            isOnline={app.isOnline}
          />
        </div>

        <header className="hidden lg:flex items-center justify-between px-6 lg:px-8 h-16 border-b border-hairline bg-surface/80 backdrop-blur-md sticky top-0 z-20">
          <h1 className="font-bold text-base lg:text-lg text-ink tracking-tight">
            {VIEW_TITLES[ui.activeTab]}
          </h1>
          <SyncBadge
            isOnline={app.isOnline}
            pendingSyncCount={app.pendingSyncCount}
            isRefreshing={app.isRefreshing}
            isLoading={app.isLoading}
            onSync={app.refreshData}
          />
        </header>

        <main className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 py-6 2xl:py-8 flex-1">
          {app.isLoading && app.accounts.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-3 border-brand/20 border-t-brand rounded-full animate-spin" />
              <p className="text-sm font-semibold text-ink">Menghubungkan ke Supabase...</p>
              <p className="text-xs text-ink-muted">
                Menghitung saldo dari seluruh riwayat transaksi
              </p>
            </div>
          ) : (
            <Suspense fallback={<ViewFallback />}>
              {ui.activeTab === 'dashboard' && (
                <DashboardView
                  accounts={app.accounts}
                  transactions={app.transactions}
                  categories={app.categories}
                  templates={app.templates}
                  isBalanceHidden={ui.isBalanceHidden}
                  onToggleHideBalance={ui.toggleHideBalance}
                  onNavigateTab={ui.setActiveTab}
                  onEditTransaction={openTxEditor}
                  onAddTransaction={() => ui.setActiveTab('input')}
                  onSelectAccountHistory={(acc) => {
                    ui.setHistoryAccountFilterId(acc.id);
                    ui.setActiveTab('riwayat');
                  }}
                  onUseTemplateDirectly={app.useTemplateDirectly}
                  onEditTemplate={ui.templateModal.open}
                  onAddTemplate={() => ui.templateModal.open(null)}
                />
              )}

              {ui.activeTab === 'input' && (
                <div className="max-w-xl 2xl:max-w-2xl mx-auto">
                  <TransactionForm
                    key={ui.prefillKey}
                    accounts={app.accounts}
                    categories={app.categories}
                    templates={app.templates}
                    prefilledData={ui.prefillData}
                    onClearPrefilledData={ui.clearPrefill}
                    onOpenVoiceModal={ui.openVoiceModal}
                    onSubmit={app.addTransaction}
                    onSaveAsTemplate={app.saveAsTemplate}
                  />
                </div>
              )}

              {ui.activeTab === 'saldo' && (
                <AccountsView
                  accounts={app.accounts}
                  isBalanceHidden={ui.isBalanceHidden}
                  onToggleHideBalance={ui.toggleHideBalance}
                  onEditAccount={ui.accountModal.open}
                  onAddAccount={() => ui.accountModal.open(null)}
                  onReorderAccounts={app.reorderAccounts}
                  onSelectAccountHistory={(acc) => {
                    ui.setHistoryAccountFilterId(acc.id);
                    ui.setActiveTab('riwayat');
                  }}
                />
              )}

              {ui.activeTab === 'tagihan' && (
                <BillsView
                  accounts={app.accounts}
                  isBalanceHidden={ui.isBalanceHidden}
                  onToggleHideBalance={ui.toggleHideBalance}
                  onEditAccount={ui.accountModal.open}
                />
              )}

              {ui.activeTab === 'riwayat' && (
                <div className="max-w-4xl 2xl:max-w-5xl mx-auto">
                  <HistoryView
                    transactions={app.transactions}
                    accounts={app.accounts}
                    categories={app.categories}
                    selectedAccountId={ui.historyAccountFilterId}
                    onChangeSelectedAccountId={ui.setHistoryAccountFilterId}
                    onEditTransaction={openTxEditor}
                  />
                </div>
              )}

              {ui.activeTab === 'report' && (
                <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto">
                  <ReportView
                    transactions={app.transactions}
                    accounts={app.accounts}
                    categories={app.categories}
                    onEditTransaction={openTxEditor}
                  />
                </div>
              )}
            </Suspense>
          )}
        </main>
      </div>

      <BottomNav activeTab={ui.activeTab} onChangeTab={ui.setActiveTab} />

      <Suspense fallback={null}>
        {ui.isSettingsOpen && (
          <SettingsModal
            isOpen={ui.isSettingsOpen}
            initialTab={ui.settingsTab}
            onClose={ui.closeSettings}
            accounts={app.accounts}
            categories={app.categories}
            templates={app.templates}
            onEditAccount={ui.accountModal.open}
            onAddAccount={() => ui.accountModal.open(null)}
            onEditCategory={ui.categoryModal.open}
            onAddCategory={() => ui.categoryModal.open(null)}
            onEditTemplate={ui.templateModal.open}
            onAddTemplate={() => ui.templateModal.open(null)}
          />
        )}

        {ui.accountModal.isOpen && (
          <EditAccountModal
            isOpen={ui.accountModal.isOpen}
            account={ui.accountModal.item}
            onClose={ui.accountModal.close}
            onSave={app.saveAccount}
            onDelete={app.deleteAccount}
            transactionCount={
              ui.accountModal.item
                ? app.transactions.filter(
                    (t) =>
                      t.sourceAccountId === ui.accountModal.item?.id ||
                      t.destinationAccountId === ui.accountModal.item?.id
                  ).length
                : 0
            }
          />
        )}

        {ui.categoryModal.isOpen && (
          <EditCategoryModal
            isOpen={ui.categoryModal.isOpen}
            category={ui.categoryModal.item}
            onClose={ui.categoryModal.close}
            onSave={app.saveCategory}
            onDelete={app.deleteCategory}
            transactionCount={
              ui.categoryModal.item
                ? app.transactions.filter(
                    (t) => t.categoryId === ui.categoryModal.item?.id
                  ).length
                : 0
            }
          />
        )}

        {ui.templateModal.isOpen && (
          <EditTemplateModal
            isOpen={ui.templateModal.isOpen}
            template={ui.templateModal.item}
            accounts={app.accounts}
            categories={app.categories}
            onClose={ui.templateModal.close}
            onSave={app.saveTemplate}
            onDelete={app.deleteTemplate}
          />
        )}

        {ui.transactionModal.isOpen && (
          <EditTransactionModal
            isOpen={ui.transactionModal.isOpen}
            transaction={ui.transactionModal.item}
            accounts={app.accounts}
            categories={app.categories}
            onClose={ui.transactionModal.close}
            onSave={app.updateTransaction}
            onDelete={app.deleteTransaction}
          />
        )}

        {ui.isVoiceModalOpen && (
          <VoiceTransactionModal
            isOpen={ui.isVoiceModalOpen}
            onClose={ui.closeVoiceModal}
            accounts={app.accounts}
            categories={app.categories}
            templates={app.templates}
            history={app.transactions}
            onApplyToForm={(data) => {
              ui.applyVoicePrefill(data);
              toast.show('Data ucapan diterapkan ke formulir!', 'Tinjau detail sebelum menyimpan');
            }}
            onDirectSave={async (data) => {
              const result = await app.addTransaction(data);
              if (!result.ok) return;
              toast.show(
                result.queued
                  ? 'Transaksi suara tersimpan di perangkat'
                  : 'Transaksi berhasil disimpan via suara!',
                result.queued ? 'Akan disinkronkan saat koneksi tersedia' : data.notes,
                result.queued ? 'info' : 'success'
              );
            }}
          />
        )}
      </Suspense>

      <Toast toast={toast.toast} onClose={toast.dismiss} />

      <ReloadPrompt />
    </div>
  );
}

export default App;
