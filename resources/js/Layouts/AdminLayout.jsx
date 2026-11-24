import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Flash from '../Components/Flash';

const links = [
    { href: '/admin', label: 'ড্যাশবোর্ড', exact: true },
    { href: '/admin/requests', label: 'সদস্য আবেদন', badge: 'pending' },
    { href: '/admin/member-types', label: 'সদস্য টাইপ ও ফি' },
    { href: '/admin/donations', label: 'অনুদান', badge: 'donations' },
    { href: '/admin/payments', label: 'পেমেন্ট তথ্য (ব্যাংক/QR)' },
    { href: '/admin/messages', label: 'বার্তা', badge: 'unread' },
    { href: '/admin/committee', label: 'কমিটি ও সদস্য' },
    { href: '/admin/posts', label: 'নিবন্ধ' },
    { href: '/admin/events', label: 'ইভেন্ট' },
    { href: '/admin/content', label: 'পেজ কনটেন্ট' },
];

export default function AdminLayout({ title, children, actions }) {
    const { auth, adminCounts, site } = usePage().props;
    const current = usePage().url || '/admin';
    const [open, setOpen] = useState(false);

    const active = (l) => (l.exact ? current === l.href : current.startsWith(l.href));

    return (
        <div className="min-h-screen bg-brand-50 lg:grid lg:grid-cols-[250px_1fr]">
            <Head title={`${title} | অ্যাডমিন`} />

            <header className="flex items-center justify-between bg-brand-900 px-4 py-3 text-white lg:hidden">
                <span className="font-bold">অ্যাডমিন প্যানেল</span>
                <button type="button" aria-label="মেনু" onClick={() => setOpen(!open)} className="rounded-md p-2 hover:bg-white/10">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                    </svg>
                </button>
            </header>

            <aside className={`${open ? 'block' : 'hidden'} bg-brand-900 text-white lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto`}>
                <div className="hidden items-center gap-3 px-5 py-5 lg:flex">
                    <img src="/logo/logo.png" alt="" className="h-10 w-10 rounded-full bg-white" />
                    <div className="leading-tight">
                        <div className="font-bold">অ্যাডমিন প্যানেল</div>
                        <div className="text-xs text-white/70">{site?.name}</div>
                    </div>
                </div>

                <nav className="grid gap-1 px-3 pb-3 pt-1">
                    {links.map((l) => {
                        const n = l.badge ? adminCounts?.[l.badge] : 0;
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center justify-between rounded-md px-3 py-2.5 transition hover:bg-white/10 ${
                                    active(l) ? 'bg-white/15 font-semibold' : ''
                                }`}
                            >
                                <span>{l.label}</span>
                                {n > 0 && (
                                    <span className="rounded-full bg-gold-500 px-2 text-sm font-bold text-white">{n}</span>
                                )}
                            </Link>
                        );
                    })}
                    <a href="/" target="_blank" rel="noreferrer" className="rounded-md px-3 py-2.5 text-white/80 hover:bg-white/10">
                        সাইট দেখুন ↗
                    </a>
                </nav>

                <div className="border-t border-white/15 px-5 py-4 text-sm">
                    <div className="truncate text-white/80">{auth?.user?.email}</div>
                    <button
                        type="button"
                        onClick={() => router.post('/admin/logout')}
                        className="mt-2 rounded-md border border-white/40 px-3 py-1.5 hover:bg-white/10"
                    >
                        লগআউট
                    </button>
                </div>
            </aside>

            <main className="min-w-0 p-4 sm:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-extrabold text-brand-800 md:text-3xl">{title}</h1>
                    {actions}
                </div>
                <div className="mb-5"><Flash /></div>
                {children}
            </main>
        </div>
    );
}
