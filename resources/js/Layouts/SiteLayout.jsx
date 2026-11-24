import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Container from '../Components/Container';

export default function SiteLayout({ children }) {
    const { site, nav } = usePage().props;
    const current = usePage().url || '/';
    const [open, setOpen] = useState(false);

    const isActive = (href) => (href === '/' ? current === '/' : current.startsWith(href));
    const close = () => setOpen(false);

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 bg-brand-800 text-white shadow-md">
                <Container className="flex h-[68px] items-center gap-4">
                    <Link href="/" onClick={close} className="flex items-center gap-3">
                        <img src="/logo/logo.png" alt={site.name} className="h-11 w-11 rounded-full bg-white" />
                        <span className="leading-tight">
                            <span className="block text-lg font-bold tracking-wide">{site.name}</span>
                            <span className="hidden text-xs text-white/75 sm:block">{site.name_bn}</span>
                        </span>
                    </Link>

                    <button
                        type="button"
                        aria-label="মেনু"
                        aria-expanded={open}
                        onClick={() => setOpen(!open)}
                        className="ml-auto rounded-md p-2 hover:bg-white/10 lg:hidden"
                    >
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                        </svg>
                    </button>

                    <nav
                        className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col gap-1 bg-brand-800 px-4 pb-4 lg:static lg:ml-auto lg:flex lg:flex-row lg:items-center lg:gap-1 lg:bg-transparent lg:p-0`}
                    >
                        {nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={close}
                                className={`rounded-md px-3 py-2 text-[15.5px] transition hover:bg-white/10 ${
                                    isActive(item.href) ? 'bg-white/15 font-semibold' : ''
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            href="/membership"
                            onClick={close}
                            className="rounded-md bg-gold-500 px-4 py-2 text-center font-semibold text-white transition hover:bg-gold-600 lg:ml-2"
                        >
                            সদস্য হোন
                        </Link>
                    </nav>
                </Container>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="bg-brand-900 text-white">
                <Container className="grid gap-10 py-12 md:grid-cols-3">
                    <div>
                        <img src="/logo/logo.png" alt="" className="mb-3 h-16 w-16 rounded-full bg-white" />
                        <h4 className="text-lg font-bold">{site.name}</h4>
                        <p className="mt-1 text-white/80">{site.tagline}</p>
                    </div>
                    <div>
                        <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-gold-400">গুরুত্বপূর্ণ লিংক</h4>
                        <ul className="grid gap-1.5 text-white/85">
                            {nav.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="hover:underline">{item.label}</Link>
                                </li>
                            ))}
                            <li><Link href="/membership" className="hover:underline">সদস্য হোন</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-gold-400">যোগাযোগ</h4>
                        <ul className="grid gap-1.5 text-white/85">
                            <li>{site.phone}</li>
                            <li>{site.email}</li>
                            <li>{site.address}</li>
                            <li>
                                <a href={site.facebook} className="hover:underline">ফেসবুক</a> ·{' '}
                                <a href={site.youtube} className="hover:underline">ইউটিউব</a> ·{' '}
                                <a href={`https://wa.me/${site.whatsapp}`} className="hover:underline">হোয়াটসঅ্যাপ</a>
                            </li>
                        </ul>
                    </div>
                </Container>
                <div className="border-t border-white/15 py-4 text-sm text-white/70">
                    <Container>
                        © {site.since} {site.name}. সর্বস্বত্ব সংরক্ষিত।
                    </Container>
                </div>
            </footer>
        </div>
    );
}
