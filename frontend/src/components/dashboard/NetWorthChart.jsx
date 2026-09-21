const hasData = Array.isArray(data) && data.some((d) => d.savings > 0 || d.target > 0);

if (!hasData) {
  return (
    <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-100">Net Worth Trajectory</h3>
      <p className="text-xs text-slate-500 mt-0.5 mb-4">Inflation-adjusted projection toward your FIRE target</p>
      <div className="h-80 flex flex-col items-center justify-center text-center">
        <LineChartIcon className="text-slate-600 mb-3" size={32} />
        <p className="text-sm text-slate-400">No projection yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Add transactions in the Savings Tracker and set your monthly expenses in Settings to see your trajectory.
        </p>
      </div>
    </div>
  );
}
