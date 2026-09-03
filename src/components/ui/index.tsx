import React from "react";

// ─── Button ────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type BtnSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-[#7C5CFC] text-white hover:bg-[#6244e8] active:scale-95 shadow-[0_2px_8px_rgba(124,92,252,0.35)]",
  secondary: "bg-[#F3F0FF] text-[#7C5CFC] hover:bg-[#EAE4FF] active:scale-95",
  ghost: "bg-transparent text-[#6B6B80] hover:bg-[#F0EFF9] active:scale-95",
  danger: "bg-[#EF4444] text-white hover:bg-[#DC2626] active:scale-95",
  outline: "bg-white text-[#1C1B29] border border-[#E8E7F0] hover:bg-[#F7F6F3] active:scale-95",
};

const btnSizes: Record<BtnSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-[8px] gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-[10px] gap-2",
  lg: "px-5 py-3 text-base rounded-[12px] gap-2",
  xl: "px-8 py-4 text-lg rounded-[14px] gap-3",
};

export function Button({ variant = "primary", size = "md", icon, iconRight, fullWidth, loading, children, className = "", disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${btnVariants[variant]} ${btnSizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}

// ─── Badge ──────────────────────────────────────────────────────────────────
type BadgeColor = "primary" | "success" | "warning" | "error" | "info" | "neutral" | "teal" | "rose";

const badgeColors: Record<BadgeColor, string> = {
  primary: "bg-[#F3F0FF] text-[#7C5CFC]",
  success: "bg-[#F0FDF4] text-[#16A34A]",
  warning: "bg-[#FFFBEB] text-[#D97706]",
  error: "bg-[#FEF2F2] text-[#DC2626]",
  info: "bg-[#EFF6FF] text-[#2563EB]",
  neutral: "bg-[#F3F4F6] text-[#6B7280]",
  teal: "bg-[#F0FDFA] text-[#0F766E]",
  rose: "bg-[#FFF1F2] text-[#E11D48]",
};

interface BadgeProps {
  color?: BadgeColor;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function Badge({ color = "neutral", children, dot, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColors[color]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

// ─── Card ───────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
}

const cardPadding = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };

export function Card({ children, className = "", hover, onClick, padding = "md" }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] ${cardPadding[padding]} ${hover ? "card-hover cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Input ──────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Input({ label, error, icon, iconRight, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-[#1C1B29]">{label}</label>}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-[#9898A8]">{icon}</span>}
        <input
          className={`w-full bg-white border border-[#E8E7F0] rounded-[10px] py-2.5 text-sm text-[#1C1B29] placeholder-[#9898A8] focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all ${icon ? "pl-10" : "pl-3.5"} ${iconRight ? "pr-10" : "pr-3.5"} ${error ? "border-red-400" : ""} ${className}`}
          {...props}
        />
        {iconRight && <span className="absolute right-3 text-[#9898A8]">{iconRight}</span>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Select ─────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = "", ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-[#1C1B29]">{label}</label>}
      <select
        className={`w-full bg-white border border-[#E8E7F0] rounded-[10px] px-3.5 py-2.5 text-sm text-[#1C1B29] focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Tag / Chip ──────────────────────────────────────────────────────────────
interface TagProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function Tag({ children, active, onClick, onRemove, className = "" }: TagProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer select-none ${active ? "bg-[#7C5CFC] text-white" : "bg-[#F0EFF9] text-[#6B6B80] hover:bg-[#EAE4FF] hover:text-[#7C5CFC]"} ${className}`}
    >
      {children}
      {onRemove && (
        <button onClick={e => { e.stopPropagation(); onRemove(); }} className="ml-0.5 opacity-60 hover:opacity-100">×</button>
      )}
    </span>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
const avatarColors = [
  "bg-[#7C5CFC] text-white",
  "bg-[#14B8A6] text-white",
  "bg-[#F59E0B] text-white",
  "bg-[#F43F5E] text-white",
  "bg-[#3B82F6] text-white",
  "bg-[#22C55E] text-white",
];

interface AvatarProps {
  initials: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  src?: string;
  className?: string;
}

const avatarSizes = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" };

export function Avatar({ initials, size = "md", src, className = "" }: AvatarProps) {
  const colorIdx = initials.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % avatarColors.length;
  if (src) return <img src={src} alt={initials} className={`rounded-full object-cover ${avatarSizes[size]} ${className}`} />;
  return (
    <div className={`rounded-full flex items-center justify-center font-bold shrink-0 ${avatarColors[colorIdx]} ${avatarSizes[size]} ${className}`}>
      {initials}
    </div>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const progressSizes = { xs: "h-1", sm: "h-1.5", md: "h-2.5" };

export function ProgressBar({ value, max = 100, color = "#7C5CFC", size = "sm", showLabel, label, animated }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex flex-col gap-1">
      {(showLabel || label) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-xs text-[#6B6B80]">{label}</span>}
          {showLabel && <span className="text-xs font-semibold text-[#1C1B29]">{pct}%</span>}
        </div>
      )}
      <div className={`w-full bg-[#F0EFF9] rounded-full overflow-hidden ${progressSizes[size]}`}>
        <div
          className={`${progressSizes[size]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────────────
export function StarRating({ rating, count, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const sz = size === "sm" ? "text-sm" : "text-base";
  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${sz}`}>
        {stars.map(s => (
          <span key={s} className={s <= Math.round(rating) ? "text-[#F59E0B]" : "text-[#E5E7EB]"}>★</span>
        ))}
      </div>
      {rating > 0 && <span className={`font-semibold text-[#1C1B29] ${size === "sm" ? "text-xs" : "text-sm"}`}>{rating.toFixed(1)}</span>}
      {count !== undefined && count > 0 && <span className={`text-[#9898A8] ${size === "sm" ? "text-xs" : "text-sm"}`}>({count})</span>}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  trend?: "up" | "down";
  trendValue?: string;
}

export function StatCard({ icon, label, value, sub, color = "#7C5CFC", trend, trendValue }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#6B6B80] font-medium mb-0.5">{label}</p>
          <p className="text-2xl font-bold text-[#1C1B29] leading-tight">{value}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {sub && <p className="text-xs text-[#9898A8]">{sub}</p>}
            {trend && trendValue && (
              <span className={`text-xs font-medium ${trend === "up" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                {trend === "up" ? "↑" : "↓"} {trendValue}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-[#1C1B29]">{title}</h2>
        {subtitle && <p className="text-sm text-[#6B6B80] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-[#1C1B29] mb-2">{title}</h3>
      {description && <p className="text-sm text-[#6B6B80] mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const modalSizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" };

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${modalSizes[size]} animate-scale-in max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EFF9]">
            <h3 className="text-lg font-bold text-[#1C1B29]">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0EFF9] text-[#6B6B80] transition-colors">✕</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Dropdown Menu ───────────────────────────────────────────────────────────
interface MenuItemProps {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownMenuProps {
  open: boolean;
  onClose: () => void;
  items: MenuItemProps[];
  className?: string;
}

export function DropdownMenu({ open, onClose, items, className = "" }: DropdownMenuProps) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className={`absolute z-50 bg-white rounded-xl shadow-xl border border-[#E8E7F0] py-1 min-w-[160px] animate-scale-in ${className}`}>
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => { item.onClick(); onClose(); }}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[#F7F6F3] transition-colors ${item.danger ? "text-red-500" : "text-[#1C1B29]"}`}
          >
            {item.icon && <span className="text-base opacity-70">{item.icon}</span>}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Category Pill ───────────────────────────────────────────────────────────
import { categoryColors } from "../../data/mockData";

export function CategoryBadge({ category }: { category: string }) {
  const color = categoryColors[category] || "#6B7280";
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: color + "18", color }}
    >
      {category}
    </span>
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-[#1C1B29]">{label}</label>}
      <textarea
        className={`w-full bg-white border border-[#E8E7F0] rounded-[10px] px-3.5 py-2.5 text-sm text-[#1C1B29] placeholder-[#9898A8] focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all resize-none ${className}`}
        {...props}
      />
    </div>
  );
}
