export default function SectionHead({ eyebrow, title, text }) {
    return (
        <div className="mb-10 max-w-2xl">
            {eyebrow && (
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-gold-500">{eyebrow}</span>
            )}
            <h2 className="mt-1 text-3xl font-extrabold text-brand-800 md:text-4xl">{title}</h2>
            {text && <p className="mt-3 text-slate-600">{text}</p>}
        </div>
    );
}
