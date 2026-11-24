import { Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { btn } from '../../Components/ui';
import { taka } from '../../Components/format';

export default function Dashboard({ stats, latest }) {
    const cards = [
        ['অপেক্ষমাণ আবেদন', stats.pending, '/admin/requests?status=pending', true],
        ['অনুমোদিত সদস্য', stats.approved, '/admin/requests?status=approved'],
        ['ফি বাকি (অনুমোদিত সদস্য)', stats.unpaid, '/admin/requests?status=approved&payment=unpaid', true],
        ['আদায়কৃত মেম্বারশীপ ফি', taka(stats.collected), '/admin/requests?status=approved&payment=paid'],
        ['অনুদান যাচাই বাকি', stats.donations_pending, '/admin/donations?status=pending', true],
        ['নিশ্চিত মোট অনুদান', taka(stats.donations_total), '/admin/donations?status=confirmed'],
        ['মোট আবেদন', stats.total, '/admin/requests'],
        ['অপঠিত বার্তা', stats.unread, '/admin/messages', stats.unread > 0],
        ['চলমান ইভেন্ট', stats.events, '/admin/events'],
        ['বর্তমান কমিটি সদস্য', stats.committee, '/admin/committee'],
    ];

    return (
        <AdminLayout title="ড্যাশবোর্ড">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map(([label, value, href, hot]) => (
                    <Link
                        key={label}
                        href={href}
                        className={`rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 ${
                            hot && value > 0 ? 'border-gold-500' : 'border-brand-200'
                        }`}
                    >
                        <div className="text-sm text-slate-500">{label}</div>
                        <div className="mt-1 font-display text-4xl font-extrabold text-brand-800">{value}</div>
                    </Link>
                ))}
            </div>

            <section className="mt-8 rounded-2xl border border-brand-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-brand-800">সর্বশেষ অপেক্ষমাণ আবেদন</h2>
                    <Link href="/admin/requests" className={`${btn.base} ${btn.teal} !px-4 !py-2 text-sm`}>সব দেখুন</Link>
                </div>
                {latest.length === 0 ? (
                    <p className="text-slate-500">এখন কোনো অপেক্ষমাণ আবেদন নেই।</p>
                ) : (
                    <ul className="divide-y divide-brand-100">
                        {latest.map((r) => (
                            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                                <div>
                                    <div className="font-semibold">{r.name}</div>
                                    <div className="text-sm text-slate-500">ব্যাচ {r.batch} · {r.phone}</div>
                                </div>
                                <span className="text-sm text-slate-500">{r.at}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </AdminLayout>
    );
}
