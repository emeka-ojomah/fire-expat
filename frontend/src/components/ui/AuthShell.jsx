export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-[#0B1220] overflow-y-auto">
      <div className="min-h-full flex items-start sm:items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
