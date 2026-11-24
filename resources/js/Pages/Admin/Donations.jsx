import { Fragment, useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Pager } from './Requests';
import { btn, input } from '../../Components/ui';
import { taka } from '../../Components/format';

const tabs = [
    ['pending', 'যাচাই বাকি'],
    ['confirmed', 'নিশ্চিত'],
    ['rejected', 'বাতিল'],
];

export default function Donations({ donations, status, counts, total, q }) {
    const [search, setSearch] = useState(q || '');
    const [openId, setOpenId] = useState(null);

    const go = (params) => router.get('/admin/donations', params, { preserveState: true, replace: true });
    const setStatus = (id, s) => router.patch(`/admin/donations/${id}`, { status: s }, { preserveScroll: true });
    const remove = (d) => {
        if (window.confirm(`${d.name}-এর অনুদানের রেকর্ড মুছে ফেলবেন?`)) {
            router.delete(`/admin/donations/${d.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            title="অনুদান"
            actions={
                <a href="/admin/donations/export" className={`${btn.base} ${btn.gold} !px-4 !py-2 text-sm`}>
                    সব অনুদান (CSV)
                </a>
            }
        >
            <div className="mb-5 rounded-2xl border border-gold-500 bg-white p-5">
                <div className="text-sm text-slate-500">নিশ্চিত মোট অনুদান</div>
                <div className="font-display text-4xl font-extrabold text-brand-800">{taka(total)}</div>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="inline-flex overflow-hidden rounded-lg border border-brand-200 bg-white">
                    {tabs.map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => go({ status: key, q: search })}
                            className={`px-4 py-2 text-[15px] ${status === key ? 'bg-brand-700 text-white' : 'hover:bg-brand-100'}`}
                        >
                            {label} ({counts[key]})
                        </button>
                    ))}
                </div>
                <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        go({ status, q: search });
                    }}
                >
                    <input aria-label="খুঁজুন" className={`${input} !w-60`} placeholder="নাম, মোবাইল, trxID…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button className={`${btn.base} ${btn.teal} !px-4 !py-2`}>খুঁজুন</button>
                </form>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-brand-200 bg-white">
                <table className="w-full min-w-[860px] text-left text-[15px]">
                    <thead className="bg-brand-100 text-sm text-brand-800">
                        <tr>
                            <th className="px-4 py-3">নাম</th>
                            <th className="px-4 py-3">পরিমাণ</th>
                            <th className="px-4 py-3">মাধ্যম</th>
                            <th className="px-4 py-3">trxID</th>
                            <th className="px-4 py-3">মোবাইল</th>
                            <th className="px-4 py-3">তারিখ</th>
                            <th className="px-4 py-3 text-right">কাজ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donations.data.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">কিছু পাওয়া যায়নি।</td></tr>
                        )}
                        {donations.data.map((d) => (
                            <Fragment key={d.id}>
                                <tr className="border-t border-brand-100 align-top">
                                    <td className="px-4 py-3">
                                        <button type="button" onClick={() => setOpenId(openId === d.id ? null : d.id)} className="text-left font-semibold text-brand-700 hover:underline">
                                            {d.name}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-gold-600">{taka(d.amount)}</td>
                                    <td className="px-4 py-3">{d.payment_method}</td>
                                    <td className="px-4 py-3 font-mono text-sm">{d.trx_id}</td>
                                    <td className="px-4 py-3">{d.phone}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{d.at}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            {d.status !== 'confirmed' && (
                                                <button type="button" onClick={() => setStatus(d.id, 'confirmed')} className="rounded-md bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700">নিশ্চিত</button>
                                            )}
                                            {d.status !== 'rejected' && (
                                                <button type="button" onClick={() => setStatus(d.id, 'rejected')} className="rounded-md bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700">বাতিল</button>
                                            )}
                                            {d.status !== 'pending' && (
                                                <button type="button" onClick={() => setStatus(d.id, 'pending')} className="rounded-md border border-brand-200 px-3 py-1 text-sm hover:bg-brand-100">ফেরত</button>
                                            )}
                                            <button type="button" onClick={() => remove(d)} className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">মুছুন</button>
                                        </div>
                                    </td>
                                </tr>
                                {openId === d.id && (
                                    <tr className="bg-brand-50">
                                        <td colSpan={7} className="px-4 py-3 text-sm">
                                            <div><strong>ইমেইল: </strong>{d.email || '—'}</div>
                                            <div><strong>বার্তা: </strong>{d.message || '—'}</div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pager page={donations} />
        </AdminLayout>
    );
}
