import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { btn, input } from '../../Components/ui';
import { taka } from '../../Components/format';

const tabs = [
    ['pending', 'অপেক্ষমাণ'],
    ['approved', 'অনুমোদিত'],
    ['rejected', 'বাতিল'],
];

const statusBadge = {
    pending: 'bg-gold-100 text-gold-600',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

// বর্তমান মানগুলো সহ পুরো পেলোড, যাতে দ্রুত বদলে অন্য ঘর ফাঁকা না হয়
const payload = (r, extra = {}) => ({
    position: r.position || '',
    is_public: !!r.is_public,
    member_type_id: r.member_type_id ?? '',
    fee_amount: r.fee_amount ?? '',
    payment_status: r.payment_status || 'unpaid',
    payment_note: r.payment_note || '',
    _method: 'patch',
    ...extra,
});

const postManage = (r, data, opts = {}) =>
    router.post(`/admin/requests/${r.id}/display`, data, { forceFormData: true, preserveScroll: true, ...opts });

function FeeBadge({ r }) {
    if (r.status !== 'approved' || r.fee_amount === null) return <span className="text-slate-400">—</span>;
    const paid = r.payment_status === 'paid';
    return (
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {paid ? 'পেমেন্ট হয়েছে' : 'পেমেন্ট হয়নি'}
        </span>
    );
}

function ManageForm({ r, types }) {
    const [d, setD] = useState({
        member_type_id: r.member_type_id ?? '',
        fee_amount: r.fee_amount ?? '',
        payment_status: r.payment_status || 'unpaid',
        payment_note: r.payment_note || '',
        position: r.position || '',
        is_public: !!r.is_public,
    });
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const set = (k, v) => setD((x) => ({ ...x, [k]: v }));

    const changeType = (value) => {
        const t = types.find((x) => String(x.id) === String(value));
        setD((x) => ({ ...x, member_type_id: value, fee_amount: t ? t.fee : x.fee_amount }));
    };

    const pick = (e) => {
        const f = e.target.files?.[0] || null;
        setPhoto(f);
        setPreview(f ? URL.createObjectURL(f) : null);
    };

    const save = (e) => {
        e.preventDefault();
        setErrors({});
        postManage(r, { ...d, photo, remove_photo: removePhoto, _method: 'patch' }, {
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
            onError: setErrors,
            onSuccess: () => {
                setPhoto(null);
                setPreview(null);
                setRemovePhoto(false);
            },
        });
    };

    const shown = preview || (!removePhoto && r.photo);
    const label = 'grid gap-1 text-sm font-semibold';

    return (
        <form onSubmit={save} className="mt-4 grid gap-4 border-t border-brand-200 pt-4">
            <div className="flex flex-wrap items-center gap-4">
                {shown ? (
                    <img src={shown} alt="" className="h-20 w-20 rounded-full border-2 border-gold-500 object-cover" />
                ) : (
                    <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-dashed border-brand-200 text-xs text-slate-500">ছবি নেই</div>
                )}
                <label className={label}>
                    সদস্যের ছবি (jpg/png/webp, ২ MB)
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="text-sm font-normal" />
                    {errors.photo && <span className="font-normal text-red-600">{errors.photo}</span>}
                </label>
                {r.photo && (
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} />
                        বর্তমান ছবি মুছুন
                    </label>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className={label}>
                    মেম্বার টাইপ
                    <select className={input} value={d.member_type_id} onChange={(e) => changeType(e.target.value)}>
                        <option value="">— নির্ধারিত নয় —</option>
                        {types.map((t) => (
                            <option key={t.id} value={t.id}>{t.name} ({taka(t.fee)})</option>
                        ))}
                    </select>
                </label>
                <label className={label}>
                    মেম্বারশীপ ফি (টাকা)
                    <input type="number" min="0" className={input} value={d.fee_amount} onChange={(e) => set('fee_amount', e.target.value)} />
                    {errors.fee_amount && <span className="font-normal text-red-600">{errors.fee_amount}</span>}
                </label>
                <label className={label}>
                    ফি স্ট্যাটাস
                    <select className={input} value={d.payment_status} onChange={(e) => set('payment_status', e.target.value)}>
                        <option value="unpaid">পেমেন্ট হয়নি</option>
                        <option value="paid">পেমেন্ট হয়েছে</option>
                    </select>
                </label>
                <label className={label}>
                    পেমেন্ট নোট (ট্রানজেকশন আইডি ইত্যাদি)
                    <input className={input} value={d.payment_note} onChange={(e) => set('payment_note', e.target.value)} />
                </label>
            </div>

            <div className="flex flex-wrap items-end gap-4">
                <label className={label}>
                    সাধারণ সদস্য তালিকায় পজিশন
                    <input className={`${input} !w-64`} placeholder={r.profession || 'যেমন প্রকৌশলী, শিক্ষক'} value={d.position} onChange={(e) => set('position', e.target.value)} />
                </label>
                <label className="flex items-center gap-2 pb-2.5 text-sm">
                    <input type="checkbox" checked={d.is_public} onChange={(e) => set('is_public', e.target.checked)} />
                    সাইটের "সাধারণ সদস্য" তালিকায় দেখাবে
                </label>
                <button disabled={busy} className={`${btn.base} ${btn.teal} !px-5 !py-2 text-sm`}>{busy ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ'}</button>
            </div>
        </form>
    );
}

function Row({ r, types, open, toggle, setStatus, remove }) {
    const quickPay = () =>
        postManage(r, payload(r, { payment_status: r.payment_status === 'paid' ? 'unpaid' : 'paid' }));

    return (
        <>
            <tr className="border-t border-brand-100 align-top">
                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        {r.photo ? (
                            <img src={r.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                            <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-brand-100 font-bold text-brand-700">{r.name.charAt(0)}</div>
                        )}
                        <button type="button" onClick={toggle} className="text-left font-semibold text-brand-700 hover:underline">
                            {r.name}
                        </button>
                    </div>
                </td>
                <td className="px-4 py-3">{r.batch}</td>
                <td className="px-4 py-3">
                    {r.type_name ? (
                        <>
                            <div>{r.type_name}</div>
                            {r.fee_amount !== null && <div className="text-sm text-gold-600">{taka(r.fee_amount)}</div>}
                        </>
                    ) : (
                        <span className="text-slate-400">—</span>
                    )}
                </td>
                <td className="px-4 py-3">
                    <FeeBadge r={r} />
                    {r.trx_id && r.payment_status !== 'paid' && (
                        <div className="mt-1 font-mono text-xs text-brand-700">trx: {r.trx_id}</div>
                    )}
                </td>
                <td className="px-4 py-3">{r.phone}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{r.at}</td>
                <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${statusBadge[r.status]}`}>
                        {tabs.find((t) => t[0] === r.status)?.[1]}
                    </span>
                </td>
                <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                        {r.status === 'approved' && r.fee_amount !== null && (
                            <button type="button" onClick={quickPay} className="rounded-md border border-brand-200 px-3 py-1 text-sm hover:bg-brand-100">
                                {r.payment_status === 'paid' ? 'বাকি করুন' : 'ফি পেয়েছি'}
                            </button>
                        )}
                        {r.status !== 'approved' && (
                            <button type="button" onClick={() => setStatus(r.id, 'approved')} className="rounded-md bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700">অনুমোদন</button>
                        )}
                        {r.status !== 'rejected' && (
                            <button type="button" onClick={() => setStatus(r.id, 'rejected')} className="rounded-md bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700">বাতিল</button>
                        )}
                        {r.status !== 'pending' && (
                            <button type="button" onClick={() => setStatus(r.id, 'pending')} className="rounded-md border border-brand-200 px-3 py-1 text-sm hover:bg-brand-100">ফেরত</button>
                        )}
                        <button type="button" onClick={() => remove(r)} className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">মুছুন</button>
                    </div>
                </td>
            </tr>
            {open && (
                <tr className="bg-brand-50">
                    <td colSpan={8} className="px-4 py-4">
                        <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                            <div><dt className="inline font-semibold">ইমেইল: </dt><dd className="inline">{r.email}</dd></div>
                            <div><dt className="inline font-semibold">পেশা: </dt><dd className="inline">{r.profession || '—'}</dd></div>
                            <div className="sm:col-span-2"><dt className="inline font-semibold">ঠিকানা: </dt><dd className="inline">{r.address || '—'}</dd></div>
                            <div className="sm:col-span-2"><dt className="inline font-semibold">বার্তা: </dt><dd className="inline">{r.message || '—'}</dd></div>
                            <div className="sm:col-span-2">
                                <dt className="inline font-semibold">পেমেন্ট তথ্য: </dt>
                                <dd className="inline">
                                    {r.trx_id ? (
                                        <>
                                            {r.payment_method} · trxID <span className="font-mono font-bold">{r.trx_id}</span> (যাচাই করে "ফি পেয়েছি" দিন)
                                        </>
                                    ) : (
                                        'পরে পরিশোধ করবেন'
                                    )}
                                </dd>
                            </div>
                            {r.paid_at && <div><dt className="inline font-semibold">ফি পরিশোধের তারিখ: </dt><dd className="inline">{r.paid_at}</dd></div>}
                        </dl>
                        {r.status === 'approved' && <ManageForm key={r.id} r={r} types={types} />}
                    </td>
                </tr>
            )}
        </>
    );
}

export function Pager({ page }) {
    if (!page || page.last_page <= 1) return null;
    return (
        <div className="mt-5 flex items-center justify-between text-sm">
            {page.prev_page_url ? (
                <Link href={page.prev_page_url} preserveScroll className="rounded-md border border-brand-200 bg-white px-4 py-2 hover:bg-brand-100">← আগের</Link>
            ) : <span />}
            <span className="text-slate-500">পৃষ্ঠা {page.current_page} / {page.last_page}</span>
            {page.next_page_url ? (
                <Link href={page.next_page_url} preserveScroll className="rounded-md border border-brand-200 bg-white px-4 py-2 hover:bg-brand-100">পরের →</Link>
            ) : <span />}
        </div>
    );
}

export default function Requests({ requests, status, counts, q, payment, types }) {
    const [search, setSearch] = useState(q || '');
    const [openId, setOpenId] = useState(null);

    const go = (params) => router.get('/admin/requests', params, { preserveState: true, replace: true });
    const setStatus = (id, s) => router.patch(`/admin/requests/${id}`, { status: s }, { preserveScroll: true });
    const remove = (r) => {
        if (window.confirm(`${r.name}-এর আবেদন স্থায়ীভাবে মুছে ফেলবেন?`)) {
            router.delete(`/admin/requests/${r.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            title="সদস্য আবেদন"
            actions={
                <a href="/admin/requests/export" className={`${btn.base} ${btn.gold} !px-4 !py-2 text-sm`}>
                    অনুমোদিত তালিকা (CSV)
                </a>
            }
        >
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

                {status === 'approved' && (
                    <select
                        aria-label="ফি স্ট্যাটাস ফিল্টার"
                        className={`${input} !w-44`}
                        value={payment}
                        onChange={(e) => go({ status, q: search, payment: e.target.value })}
                    >
                        <option value="">সব ফি স্ট্যাটাস</option>
                        <option value="unpaid">পেমেন্ট হয়নি</option>
                        <option value="paid">পেমেন্ট হয়েছে</option>
                    </select>
                )}

                <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        go({ status, q: search, payment });
                    }}
                >
                    <input
                        aria-label="খুঁজুন"
                        className={`${input} !w-56`}
                        placeholder="নাম, মোবাইল, ব্যাচ…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className={`${btn.base} ${btn.teal} !px-4 !py-2`}>খুঁজুন</button>
                </form>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-brand-200 bg-white">
                <table className="w-full min-w-[960px] text-left text-[15px]">
                    <thead className="bg-brand-100 text-sm text-brand-800">
                        <tr>
                            <th className="px-4 py-3">নাম</th>
                            <th className="px-4 py-3">ব্যাচ</th>
                            <th className="px-4 py-3">টাইপ ও ফি</th>
                            <th className="px-4 py-3">ফি স্ট্যাটাস</th>
                            <th className="px-4 py-3">মোবাইল</th>
                            <th className="px-4 py-3">তারিখ</th>
                            <th className="px-4 py-3">অবস্থা</th>
                            <th className="px-4 py-3 text-right">কাজ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">কিছু পাওয়া যায়নি।</td>
                            </tr>
                        )}
                        {requests.data.map((r) => (
                            <Row
                                key={r.id}
                                r={r}
                                types={types}
                                open={openId === r.id}
                                toggle={() => setOpenId(openId === r.id ? null : r.id)}
                                setStatus={setStatus}
                                remove={remove}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <Pager page={requests} />
        </AdminLayout>
    );
}
