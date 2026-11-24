import { Link } from '@inertiajs/react';

export default function PostCard({ p }) {
    return (
        <Link
            href={`/posts/${p.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
        >
            {p.image ? (
                <img src={p.image} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
            ) : (
                <div className="grid aspect-[16/9] w-full place-items-center bg-brand-100">
                    <img src="/logo/logo.png" alt="" className="h-16 w-16 rounded-full opacity-60" />
                </div>
            )}
            <div className="flex flex-1 flex-col p-5">
                {p.tag && (
                    <span className="mb-2 inline-block self-start rounded bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-600">
                        {p.tag}
                    </span>
                )}
                <h3 className="mb-2 text-lg font-bold text-brand-800 group-hover:underline">{p.title}</h3>
                <p className="text-[15.5px] text-slate-600">{p.excerpt}</p>
                <span className="mt-auto pt-3 text-sm text-slate-500">{p.date}</span>
            </div>
        </Link>
    );
}
