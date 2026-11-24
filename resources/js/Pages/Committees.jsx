import { Link } from '@inertiajs/react';
import SiteLayout from '../Layouts/SiteLayout';
import PageHead from '../Components/PageHead';
import Container from '../Components/Container';
import Pager from '../Components/Pager';

const tabs = [
    ['current', '/committees', 'বর্তমান কমিটি'],
    ['advisors', '/committees/advisors', 'উপদেষ্টা ও দাতা সদস্য'],
    ['members', '/committees/members', 'সাধারণ সদস্য'],
    ['former', '/committees/former', 'সাবেক কমিটি'],
];

function Avatar({ m, size }) {
    const dim = size === 'lg' ? 'h-32 w-32 text-4xl' : 'h-24 w-24 text-3xl';
    if (m.photo) {
        return <img src={m.photo} alt={m.name} loading="lazy" className={`mx-auto mb-4 rounded-full border-2 border-gold-500 object-cover ${dim}`} />;
    }
    return (
        <div className={`mx-auto mb-4 grid place-items-center rounded-full border-2 border-dashed border-gold-500 bg-brand-100 font-display font-bold text-brand-700 ${dim}`}>
            {m.name.charAt(0)}
        </div>
    );
}

function MemberCard({ m, featured }) {
    return (
        <div className={`rounded-2xl border border-brand-200 bg-white p-6 text-center ${featured ? 'w-full max-w-sm' : ''}`}>
            <Avatar m={m} size={featured ? 'lg' : 'md'} />
            <div className="text-sm font-bold uppercase tracking-wider text-gold-600">{m.title}</div>
            <h3 className="mt-1 text-xl font-bold text-brand-800">{m.name}</h3>
            {m.batch && <p className="text-sm text-slate-500">{m.batch}</p>}
        </div>
    );
}

function Sections({ sections, empty }) {
    if (sections.length === 0) {
        return <p className="text-slate-500">{empty}</p>;
    }
    return (
        <div className="grid gap-12">
            {sections.map((s) => (
                <section key={s.title}>
                    <h3 className="mb-5 flex items-center gap-3 text-2xl font-extrabold text-brand-800">
                        <span className="h-6 w-1.5 rounded bg-gold-500" />
                        {s.title}
                    </h3>
                    <div className={s.featured ? 'flex flex-wrap justify-center gap-5 md:justify-start' : 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'}>
                        {s.members.map((m) => (
                            <MemberCard key={m.id} m={m} featured={s.featured} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

function Sidebar({ title, children }) {
    return (
        <aside className="h-fit rounded-2xl border border-brand-200 bg-white p-3 lg:sticky lg:top-24">
            <div className="px-3 pb-2 pt-1 text-sm font-bold uppercase tracking-wider text-gold-600">{title}</div>
            <div className="grid max-h-[60vh] gap-1 overflow-y-auto">{children}</div>
        </aside>
    );
}

function SideLink({ href, data, active, children, count }) {
    return (
        <Link
            href={href}
            data={data}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-[15.5px] transition ${
                active ? 'bg-brand-700 font-semibold text-white' : 'hover:bg-brand-100'
            }`}
        >
            <span>{children}</span>
            {count !== undefined && <span className={`text-sm ${active ? 'text-white/80' : 'text-slate-500'}`}>{count}</span>}
        </Link>
    );
}

export default function Committees({ tab, title, session, sections = [], terms = [], list, batches = [], batch = '', total = 0 }) {
    return (
        <SiteLayout>
            <PageHead title="কমিটিসমূহ" subtitle="নেতৃত্ব, উপদেষ্টা ও সদস্যবৃন্দ" />

            <section className="py-12">
                <Container>
                    {/* ৪টি ট্যাব বাটন */}
                    <div className="mb-8 overflow-x-auto">
                        <div className="inline-flex overflow-hidden rounded-xl border border-brand-200 bg-white">
                            {tabs.map(([key, href, label]) => (
                                <Link
                                    key={key}
                                    href={href}
                                    className={`whitespace-nowrap px-5 py-3 text-[16px] transition ${
                                        tab === key ? 'bg-brand-700 font-semibold text-white' : 'hover:bg-brand-100'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-brand-800 md:text-4xl">{title}</h2>
                        {session && <p className="mt-1 text-slate-500">{session}</p>}
                    </div>

                    {(tab === 'current' || tab === 'advisors') && (
                        <Sections
                            sections={sections}
                            empty={tab === 'current' ? 'বর্তমান কমিটির তথ্য শিগগির প্রকাশ করা হবে।' : 'উপদেষ্টা ও দাতা সদস্যদের তথ্য শিগগির প্রকাশ করা হবে।'}
                        />
                    )}

                    {tab === 'former' && (
                        terms.length === 0 ? (
                            <p className="text-slate-500">সাবেক কমিটির তথ্য এখনও যুক্ত হয়নি।</p>
                        ) : (
                            <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                                <Sidebar title="কমিটির মেয়াদ">
                                    {terms.map((t) => (
                                        <SideLink key={t.session} href="/committees/former" data={{ session: t.session }} active={t.session === session}>
                                            {t.session}
                                        </SideLink>
                                    ))}
                                </Sidebar>
                                <Sections sections={sections} empty="এই মেয়াদের তথ্য নেই।" />
                            </div>
                        )
                    )}

                    {tab === 'members' && (
                        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                            <Sidebar title="ব্যাচ অনুযায়ী">
                                <SideLink href="/committees/members" active={batch === ''} count={total}>সব ব্যাচ</SideLink>
                                {batches.map((b) => (
                                    <SideLink key={b.batch} href="/committees/members" data={{ batch: b.batch }} active={b.batch === batch} count={b.total}>
                                        ব্যাচ {b.batch}
                                    </SideLink>
                                ))}
                            </Sidebar>

                            <div>
                                {list.data.length === 0 ? (
                                    <p className="text-slate-500">এখনও কোনো সদস্য তালিকাভুক্ত হননি।</p>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {list.data.map((m) => (
                                            <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-brand-200 bg-white p-4">
                                                {m.photo ? (
                                                    <img src={m.photo} alt="" loading="lazy" className="h-14 w-14 flex-none rounded-full border border-gold-500 object-cover" />
                                                ) : (
                                                    <div className="grid h-14 w-14 flex-none place-items-center rounded-full bg-brand-100 font-display text-xl font-bold text-brand-700">
                                                        {m.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h3 className="truncate font-bold text-brand-800">{m.name}</h3>
                                                    <p className="text-sm text-slate-500">ব্যাচ {m.batch}</p>
                                                    {m.position && <p className="truncate text-sm text-gold-600">{m.position}</p>}
                                                    {m.type && <span className="mt-1 inline-block rounded bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-600">{m.type}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Pager page={list} />
                            </div>
                        </div>
                    )}
                </Container>
            </section>
        </SiteLayout>
    );
}
