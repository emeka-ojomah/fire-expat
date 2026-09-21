export default function Button({ children, loading, className = '', ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg py-3 transition-colors disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
