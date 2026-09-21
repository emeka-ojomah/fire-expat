export default function BrandMark({ size = 'sm', withTagline = false }) {
  const isLg = size === 'lg';
  const boxClass = isLg ? 'w-11 h-11 rounded-xl' : 'w-8 h-8 rounded-lg';
  const svgSize = isLg ? 20 : 16;
  const wordClass = isLg ? 'text-lg font-bold leading-none' : 'text-[15px] font-semibold tracking-tight';

  return (
    <div className="flex items-center gap-3">
      <div className={`${boxClass} bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center shrink-0`}>
        <svg width={svgSize} height={svgSize} viewBox="0 0 28 28" fill="none">
          <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="#6366F1" strokeWidth="1.5" fill="none" />
          <circle cx="14" cy="14" r="3" fill="#6366F1" />
        </svg>
      </div>
      <div>
        <h1 className={`${wordClass} text-slate-100`}>
          fire<span className="text-indigo-400">-expat</span>
        </h1>
        {withTagline && (
          <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">
            Financial Independence · Retire Early
          </p>
        )}
      </div>
    </div>
  );
}
