export default function PageLoader({ message = 'Loading…' }) {
  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-slate-400 text-sm">
      {message}
    </div>
  );
}
