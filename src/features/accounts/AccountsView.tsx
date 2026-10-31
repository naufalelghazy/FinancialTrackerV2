import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Account } from "../../types";
import { formatCurrency } from "../../lib/formatters";
import {
  Wallet,
  Plus,
  Edit2,
  ArrowUpRight,
  Eye,
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { AccountAvatar } from "../../components/ui/AccountAvatar";
import { sortAccountsForDisplay } from "../../lib/accountOrder";

interface AccountsViewProps {
  accounts: Account[];
  isBalanceHidden?: boolean;
  onToggleHideBalance?: () => void;
  onEditAccount: (account: Account) => void;
  onAddAccount: () => void;
  onSelectAccountHistory?: (account: Account) => void;
  /** Called with the full list of ids in their new order once a drag settles. */
  onReorderAccounts?: (orderedIds: string[]) => void;
}

/**
 * Tempat kartu akan mendarat, dihitung dari posisi kursor.
 *
 * Mengembalikan indeks sisip di antara kartu (`0..n`), bukan indeks kartu.
 * Memakai indeks kartu akan salah saat menyeret ke bawah, karena kartu yang
 * diangkat sudah menempati satu slot.
 */
function findDropIndex(
  container: HTMLElement,
  clientY: number,
  draggingIndex: number
): number {
  const cards = Array.from(
    container.querySelectorAll<HTMLElement>("[data-account-index]")
  ).filter((el) => Number(el.dataset.accountIndex) !== draggingIndex);

  for (const [i, el] of cards.entries()) {
    const box = el.getBoundingClientRect();
    if (clientY < box.top + box.height / 2) return i;
  }
  return cards.length;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  isBalanceHidden = false,
  onToggleHideBalance,
  onEditAccount,
  onAddAccount,
  onSelectAccountHistory,
  onReorderAccounts,
}) => {
  const bankAccounts = accounts.filter((a) => a.type !== "credit");
  const ordered = sortAccountsForDisplay(bankAccounts);
  const totalBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const maskAmount = (amount: number) =>
    isBalanceHidden ? "Rp •••••••" : formatCurrency(amount);

  const canReorder = Boolean(onReorderAccounts) && ordered.length > 1;

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [previewIds, setPreviewIds] = useState<string[] | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<string[] | null>(null);

  // The rendered order while a drag is in progress, so cards visibly make room.
  const ids = previewIds ?? ordered.map((a) => a.id);
  const byId = new Map(ordered.map((a) => [a.id, a]));
  const shown = ids.map((id) => byId.get(id)).filter((a): a is Account => Boolean(a));

  // Sorted ids captured when the drag begins: the drop is compared against what
  // was on screen then, not against a list that may have been re-rendered.
  const startIdsRef = useRef<string[]>([]);

  /**
   * Set when a drag actually ran, cleared on the next click.
   *
   * Releasing a drag ends with a `click` on the card under the finger. Without
   * this guard that click opens the account's transaction history -- so the
   * moment you finished reordering, you were navigated away.
   */
  const suppressClickRef = useRef(false);

  const clearDrag = useCallback(() => {
    setDraggingId(null);
    setPreviewIds(null);
    previewRef.current = null;
    startIdsRef.current = [];
  }, []);

  // Kept in a ref so the window listeners below never have to be re-attached
  // mid-drag just because the parent re-rendered.
  const commitOrderRef = useRef<() => void>(() => {});
  useEffect(() => {
    commitOrderRef.current = () => {
      const finalIds = previewRef.current;
      const startIds = startIdsRef.current;
      if (finalIds && finalIds.join() !== startIds.join()) {
        onReorderAccounts?.(finalIds);
      }
      suppressClickRef.current = true;
      clearDrag();
    };
  });

  // Dragging is pointer-based, so the drop can happen outside the card.
  useEffect(() => {
    if (!draggingId) return;

    const onMove = (event: PointerEvent) => {
      const container = listRef.current;
      if (!container) return;
      const current = previewRef.current;
      if (!current) return;
      const from = current.indexOf(draggingId);
      if (from === -1) return;

      const to = findDropIndex(container, event.clientY, from);
      if (to === from) return;

      const next = [...current];
      next.splice(from, 1);
      next.splice(to, 0, draggingId);
      previewRef.current = next;
      setPreviewIds(next);
    };

    const onUp = () => commitOrderRef.current();

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", clearDrag);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", clearDrag);
    };
  }, [draggingId, clearDrag]);

  const startDrag = (id: string) => (event: React.PointerEvent) => {
    if (!canReorder) return;
    event.preventDefault();
    event.stopPropagation();
    const startIds = ordered.map((a) => a.id);
    startIdsRef.current = startIds;
    previewRef.current = startIds;
    setPreviewIds(startIds);
    setDraggingId(id);
    suppressClickRef.current = true;
    if (navigator.vibrate) navigator.vibrate(15);
  };

  /** Keyboard/assistive path: nudge one card and save immediately. */
  const moveBy = (from: number, delta: number) => {
    if (!canReorder) return;
    const to = from + delta;
    if (to < 0 || to >= ordered.length) return;
    const next = ordered.map((a) => a.id);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorderAccounts?.(next);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Total Saldo Card - Kraken Purple Commanding Hero */}
      <div className="hero-balance-card bg-brand text-white rounded-[16px] p-5 sm:p-6 shadow-whisper relative overflow-hidden border border-[#5741d8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/80 text-[11px] font-semibold uppercase tracking-wider">
            <Wallet className="w-3.5 h-3.5" />
            <span>Total Saldo Tersedia</span>
            {onToggleHideBalance && (
              <button
                type="button"
                onClick={onToggleHideBalance}
                title={
                  isBalanceHidden ? "Tampilkan saldo" : "Sembunyikan saldo"
                }
                aria-label={
                  isBalanceHidden ? "Tampilkan saldo" : "Sembunyikan saldo"
                }
                className="w-6 h-6 -m-2.5 p-2.5 box-content rounded-[6px] bg-surface/15 hover:bg-surface/25 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 ml-1"
              >
                {isBalanceHidden ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
          <div className="balance-card-amount text-2xl sm:text-4xl font-bold mt-2 tracking-[-0.8px] tabular-nums">
            {maskAmount(totalBalance)}
          </div>
          <div className="text-xs text-white/70 mt-1">
            {bankAccounts.length} Akun (Bank, E-Wallet & Kas Tunai)
          </div>
        </div>

        <button
          type="button"
          onClick={onAddAccount}
          className="self-start sm:self-auto py-2.5 px-4 rounded-[12px] bg-surface text-brand-text hover:bg-surface/90 text-xs font-bold shadow-whisper flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Account List Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Daftar Rekening & Dompet ({bankAccounts.length})
          </h3>
          <span className="text-[11px] font-medium text-ink-muted text-right">
            {canReorder ? (
              <>
                <span className="hidden sm:inline">
                  Geser ikon ⋮⋮ untuk mengubah urutan
                </span>
                <span className="sm:hidden">Tahan ⋮⋮ untuk menggeser</span>
              </>
            ) : onSelectAccountHistory ? (
              "Klik kartu untuk melihat mutasi"
            ) : null}
          </span>
        </div>

        <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {shown.map((acc, index) => {
            const isDragging = draggingId === acc.id;
            const dragDisabled = !canReorder;

            return (
              <div
                key={acc.id}
                data-account-index={index}
                onPointerDown={(e) => {
                  // Only the grip starts a drag; the card itself still opens
                  // the mutation history when tapped.
                  if ((e.target as HTMLElement).closest("[data-drag-handle]")) return;
                }}
                onClick={(e) => {
                  // Swallow the click that follows a drag release.
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false;
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  onSelectAccountHistory?.(acc);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectAccountHistory?.(acc);
                  }
                }}
                aria-disabled={isDragging || undefined}
                role="button"
                tabIndex={0}
                aria-label={`Lihat mutasi rekening ${acc.name}`}
                className={`group relative flex items-center justify-between gap-1 p-3.5 bg-surface rounded-[12px] border shadow-micro transition-all ${
                  isDragging
                    ? "border-brand shadow-whisper scale-[1.02] z-10"
                    : "border-hairline hover:border-brand/50 hover:shadow-whisper cursor-pointer active:scale-[0.99]"
                }`}
              >
                {/* Drag handle: 44px of touch area, 28px visual. */}
                {canReorder && (
                  <span
                    data-drag-handle
                    role="button"
                    tabIndex={-1}
                    aria-label={`Geser ${acc.name}`}
                    onPointerDown={startDrag(acc.id)}
                    className="-ml-2 w-7 h-7 p-2 box-content rounded-[8px] flex items-center justify-center text-ink-subtle hover:text-brand-text hover:bg-brand-soft transition-colors cursor-grab active:cursor-grabbing touch-none shrink-0"
                  >
                    <GripVertical className="w-4 h-4" />
                  </span>
                )}

                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <AccountAvatar acc={acc} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-ink block tracking-tight group-hover:text-brand-text transition-colors truncate">
                        {acc.name}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-brand-text opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-ink-muted capitalize font-medium">
                        {acc.type}
                      </span>
                      <span className="text-[10px] text-brand-text font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        • Mutasi
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-bold text-sm tracking-tight tabular-nums ${
                      acc.balance >= 0 ? "text-ink" : "text-negative-bright"
                    }`}
                  >
                    {maskAmount(acc.balance)}
                  </span>

                  {/* Keyboard route for the same action. Screen-reader and
                      keyboard users cannot drag, so the order is also reachable
                      one step at a time. */}
                  {canReorder && (
                    <span className="flex flex-col">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBy(index, -1);
                        }}
                        disabled={index === 0}
                        className="w-5 h-5 rounded-[4px] flex items-center justify-center text-ink-subtle hover:text-brand-text hover:bg-brand-soft disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-default"
                        aria-label={`Naikkan ${acc.name}`}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBy(index, 1);
                        }}
                        disabled={index === ordered.length - 1}
                        className="w-5 h-5 rounded-[4px] flex items-center justify-center text-ink-subtle hover:text-brand-text hover:bg-brand-soft disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-default"
                        aria-label={`Turunkan ${acc.name}`}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAccount(acc);
                    }}
                    className="w-8 h-8 -m-2 p-2 box-content rounded-[8px] flex items-center justify-center text-ink-subtle hover:text-brand-text hover:bg-brand-soft transition-all cursor-pointer active:scale-95 border border-transparent hover:border-brand"
                    title="Ubah Akun"
                    aria-label={`Ubah Akun ${acc.name}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {dragDisabled && null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
