// HIG-style primitives: inset grouped lists, switches, segmented controls, sheets, buttons.
import { useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { num, t } from '../i18n';

export function LargeTitle({ title, subtitle, right }) {
  return (
    <header className="px-5 pt-7 pb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {subtitle && <p className="t-footnote text-label2 font-medium">{subtitle}</p>}
        <h1 className="t-large-title truncate">{title}</h1>
      </div>
      {right}
    </header>
  );
}

export function Section({ header, footer, children, className = '' }) {
  return (
    <section className={`px-4 mt-7 ${className}`}>
      {header && <h2 className="t-section px-4 pb-2">{header}</h2>}
      <div className="card !rounded-[22px] overflow-hidden">{children}</div>
      {footer && <p className="t-footnote text-label2 px-4 pt-1.5">{footer}</p>}
    </section>
  );
}

export function Row({ icon: Icon, iconBg, title, detail, onClick, right, chevron, destructive, last }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} className={`w-full flex items-center gap-3 pl-4 text-left min-h-[52px] ${onClick ? 'active:bg-fill2 transition-colors' : ''}`}>
      {Icon && (
        <span className="grid place-items-center w-[30px] h-[30px] rounded-[9px] text-white shrink-0"
          style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${iconBg ?? 'var(--tint)'} 72%, #fff), color-mix(in srgb, ${iconBg ?? 'var(--tint)'} 88%, #fff))` }}>
          <Icon size={17} strokeWidth={2.2} />
        </span>
      )}
      <span className={`flex-1 flex items-center gap-2 pr-4 py-3 min-h-[52px] ${last ? '' : 'hairline-b'}`}>
        <span className={`t-body flex-1 ${destructive ? 'text-danger' : ''}`}>{title}</span>
        {detail != null && <span className="t-body text-label2 tabular">{detail}</span>}
        {right}
        {chevron && <ChevronRight size={18} className="text-label3 -mr-1" />}
      </span>
    </Comp>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <button
      role="switch" aria-checked={checked} aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative w-[51px] h-[31px] rounded-full transition-colors duration-200 shrink-0"
      style={{ background: checked ? 'var(--sys-green)' : 'var(--sys-fill)' }}
    >
      <span className="absolute top-[2px] left-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,.15),0_1px_1px_rgba(0,0,0,.16)] transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  );
}

export function Segmented({ options, value, onChange, className = '' }) {
  const i = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div role="tablist" className={`relative grid rounded-[14px] bg-fill2 p-[3px] ${className}`} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      <span className="absolute top-[3px] bottom-[3px] rounded-[11px] bg-bg2 dark:bg-[#3a4158] shadow-[0_4px_12px_-4px_rgba(110,72,40,.25),0_1px_2px_rgba(110,72,40,.08)] transition-transform duration-300 ease-[cubic-bezier(.2,.9,.25,1)]"
        style={{ width: `calc((100% - 6px) / ${options.length})`, left: 3, transform: `translateX(${i * 100}%)` }} />
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} onClick={() => onChange(o.value)}
          className={`relative z-10 h-9 t-footnote ${o.value === value ? 'font-semibold' : 'font-medium'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Button({ children, variant = 'filled', className = '', ...props }) {
  const styles = {
    filled: 'btn-tint',
    tinted: 'text-tint bg-[color-mix(in_srgb,var(--tint)_15%,transparent)]',
    gray: 'bg-fill2 text-label hover:bg-fill',
    plain: 'text-tint',
  };
  return (
    <button {...props}
      className={`pressable inline-flex items-center justify-center gap-2 rounded-[18px] px-5 h-[54px] t-headline disabled:opacity-40 disabled:active:scale-100 ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Sheet({ open, onClose, title, children, detent = 'large' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[rgba(40,24,12,.38)] backdrop-blur-[2px] a-fade" onClick={onClose} />
      <div className={`a-sheet relative w-full max-w-[520px] bg-bg rounded-t-[30px] shadow-[var(--float-shadow)] flex flex-col ${detent === 'large' ? 'max-h-[92dvh]' : 'max-h-[60dvh]'}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto mt-2 w-10 h-[5px] rounded-full bg-label3" />
        <div className="flex items-center justify-between px-5 h-14">
          <span className="w-8" />
          <h2 className="t-headline">{title}</h2>
          <button onClick={onClose} aria-label={t('Close')} className="pressable grid place-items-center w-[30px] h-[30px] rounded-full bg-fill2 text-label2">
            <X size={16} strokeWidth={2.6} />
          </button>
        </div>
        <div className="overflow-y-auto no-scrollbar pb-6">{children}</div>
      </div>
    </div>
  );
}

export function CoinPill({ coins, onClick }) {
  return (
    <button onClick={onClick} className="pressable card !rounded-full flex items-center gap-1.5 h-9 pl-1.5 pr-3.5" aria-label={t('{n} Banana Coins', { n: coins })}>
      <BananaCoin size={22} />
      <span className="t-subhead font-semibold tabular">{num(coins)}</span>
    </button>
  );
}

export function BananaCoin({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#ffcc00" />
      <circle cx="12" cy="12" r="11" fill="none" stroke="#e6a800" strokeWidth="1.4" />
      <path d="M7.2 7.6 C6.8 13.4 10.6 17.6 16.6 16.8 C17.4 16.6 17.4 15.6 16.6 15.5 C12 15.4 9.4 12.4 9 7.8 C8.9 6.8 7.3 6.7 7.2 7.6Z" fill="#7a5200" />
      <path d="M8.1 7.4 L7.6 5.6" stroke="#7a5200" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div key={toast.id} className="a-toast fixed left-1/2 z-[60] flex items-center gap-2 px-4 h-11 rounded-full material-bar shadow-lg t-subhead font-semibold whitespace-nowrap"
      style={{ top: 'calc(env(safe-area-inset-top) + 10px)' }} role="status">
      {toast.icon}{toast.text}
    </div>
  );
}

/** HIG action sheet for destructive confirmations (replaces window.confirm). */
export function ConfirmSheet({ request, onClose }) {
  if (!request) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-2" role="alertdialog" aria-label={request.title}
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
      <div className="absolute inset-0 bg-[rgba(40,24,12,.38)] a-fade" onClick={onClose} />
      <div className="relative w-full max-w-[520px] a-sheet flex flex-col gap-2">
        <div className="rounded-[22px] material-bar overflow-hidden text-center">
          <div className="px-4 py-3.5 hairline-b">
            <p className="t-footnote font-semibold text-label2">{request.title}</p>
            <p className="t-footnote text-label2 mt-0.5">{request.message}</p>
          </div>
          <button onClick={() => { request.onConfirm(); onClose(); }} className="w-full h-[57px] text-[20px] text-danger active:bg-fill2">{request.action}</button>
        </div>
        <button onClick={onClose} autoFocus className="w-full h-[57px] rounded-[22px] bg-bg2 text-[20px] font-semibold text-tint active:bg-fill2">{t('Cancel')}</button>
      </div>
    </div>
  );
}
