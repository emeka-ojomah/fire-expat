export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#151E31] border border-slate-800 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}
