/**
 * Tiny design kit used by the cleaned-up screens.
 * NOTE: uses Tailwind's default `gray` / `indigo` / `emerald` / `rose` scales on purpose –
 * `slate` and `amber` are re-mapped in tailwind.config.js for the older screens.
 */
import React from 'react';
import { X } from 'lucide-react';

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

/* ---------- Logo ---------- */
export const Logo: React.FC<{ className?: string; showText?: boolean }> = ({ className, showText = true }) => (
  <div className={cx('flex items-center gap-2.5', className)}>
    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
      A
    </div>
    {showText && <span className="font-bold text-gray-900 text-lg tracking-tight">AuraTech ERP</span>}
  </div>
);

/* ---------- Avatar ---------- */
const AVATAR_TONES = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
];
export const initialsOf = (name: string) =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ name, size = 'md', className }) => {
  const tone = AVATAR_TONES[(name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  const sizes = { sm: 'w-7 h-7 text-[11px]', md: 'w-9 h-9 text-xs', lg: 'w-14 h-14 text-lg' };
  return (
    <div className={cx('rounded-full flex items-center justify-center font-semibold flex-shrink-0', sizes[size], tone, className)}>
      {initialsOf(name)}
    </div>
  );
};

/* ---------- Card ---------- */
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div className={cx('bg-white rounded-xl border border-gray-200 shadow-sm', className)} {...rest} />
);

/* ---------- Buttons ---------- */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' };
export const Button: React.FC<BtnProps> = ({ variant = 'primary', size = 'md', className, ...rest }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    />
  );
};

/* ---------- Form fields ---------- */
const inputBase =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-500';

export const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode; className?: string }> = ({ label, hint, children, className }) => (
  <label className={cx('block', className)}>
    <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-gray-400 mt-1">{hint}</span>}
  </label>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...rest }, ref) => (
  <input ref={ref} className={cx(inputBase, className)} {...rest} />
));
Input.displayName = 'Input';

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, ...rest }) => (
  <select className={cx(inputBase, 'pr-8', className)} {...rest} />
);

/* ---------- Badge ---------- */
const BADGE_TONES: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  gray: 'bg-gray-100 text-gray-600 ring-gray-500/20',
};
export const Badge: React.FC<{ tone?: keyof typeof BADGE_TONES; children: React.ReactNode; className?: string }> = ({ tone = 'gray', children, className }) => (
  <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset', BADGE_TONES[tone], className)}>
    {children}
  </span>
);

/* ---------- Modal ---------- */
export const Modal: React.FC<{ title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean; footer?: React.ReactNode }> = ({
  title,
  subtitle,
  onClose,
  children,
  wide,
  footer,
}) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/40 backdrop-blur-[2px]" onMouseDown={onClose}>
      <div
        className={cx('bg-white rounded-2xl shadow-xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col', wide ? 'max-w-3xl' : 'max-w-lg')}
        onMouseDown={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-4 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 -mr-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex flex-wrap justify-end gap-2 bg-gray-50/60 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
};

/* ---------- Notices ---------- */
export const Notice: React.FC<{ tone: 'error' | 'success' | 'info'; children: React.ReactNode }> = ({ tone, children }) => {
  const tones = {
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  };
  return <div className={cx('text-sm rounded-lg border px-3 py-2', tones[tone])}>{children}</div>;
};

export const EmptyState: React.FC<{ title: string; text?: string; action?: React.ReactNode }> = ({ title, text, action }) => (
  <div className="text-center py-12 px-4">
    <p className="text-sm font-semibold text-gray-700">{title}</p>
    {text && <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
