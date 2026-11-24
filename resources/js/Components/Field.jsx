import { useId } from 'react';

export default function Field({ label, error, required, children }) {
    const id = useId();
    return (
        <div className="grid gap-1.5">
            <label htmlFor={id} className="text-sm font-semibold text-slate-700">
                {label} {required && <span className="text-red-600">*</span>}
            </label>
            {/* ইনপুটে id বসানো হয় */}
            {children(id)}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
