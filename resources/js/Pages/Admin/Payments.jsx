import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import Field from '../../Components/Field';
import { btn, input } from '../../Components/ui';

export default function Payments({ payment }) {
    const form = useForm({
        _method: 'put',
        bank_name: payment.bank_name || '',
        account_name: payment.account_name || '',
        account_number: payment.account_number || '',
        branch: payment.branch || '',
        routing: payment.routing || '',
        qr_note: payment.qr_note || '',
        instruction: payment.instruction || '',
        methods: payment.methods || [],
        qr_image: null,
        remove_qr: false,
    });
    const [preview, setPreview] = useState(null);
    const { data, setData, errors } = form;

    const submit = (e) => {
        e.preventDefault();
        form.post('/admin/payments', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setPreview(null);
                setData((d) => ({ ...d, qr_image: null, remove_qr: false }));
            },
        });
    };

    const pickQr = (e) => {
        const f = e.target.files?.[0] || null;
        setData('qr_image', f);
        setPreview(f ? URL.createObjectURL(f) : null);
    };

    const setMethod = (i, k, v) => setData('methods', data.methods.map((m, n) => (n === i ? { ...m, [k]: v } : m)));
    const text = (k, label, ph = '') => (
        <Field label={label} error={errors[k]}>
            {(id) => <input id={id} className={input} placeholder={ph} value={data[k]} onChange={(e) => setData(k, e.target.value)} />}
        </Field>
    );

    const shownQr = preview || (!data.remove_qr && payment.qr_url);

    return (
        <AdminLayout title="পেমেন্ট তথ্য (ব্যাংক / QR)">
            <p className="mb-5 max-w-3xl text-slate-600">
                এখানকার তথ্য সদস্যপদ ফরম ও অনুদান পেজ — দুই জায়গাতেই দেখায়। এখানে যে মাধ্যমগুলো দেবেন, ফরমের "পেমেন্ট মাধ্যম" তালিকাতেও সেগুলো আসবে।
            </p>

            <form onSubmit={submit} className="grid max-w-4xl gap-6">
                <section className="grid gap-4 rounded-2xl border border-brand-200 bg-white p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-brand-800">QR কোড</h2>
                    <div className="flex flex-wrap items-start gap-5">
                        {shownQr ? (
                            <img src={shownQr} alt="QR" className="h-40 w-40 rounded-lg border border-brand-200 bg-white object-contain p-1" />
                        ) : (
                            <div className="grid h-40 w-40 place-items-center rounded-lg border-2 border-dashed border-brand-200 text-sm text-slate-500">QR নেই</div>
                        )}
                        <div className="grid gap-3">
                            <label className="grid gap-1 text-sm font-semibold">
                                QR ছবি আপলোড (jpg/png/webp, ২ MB)
                                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickQr} className="text-sm font-normal" />
                                {errors.qr_image && <span className="font-normal text-red-600">{errors.qr_image}</span>}
                            </label>
                            {payment.qr_url && (
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={data.remove_qr} onChange={(e) => setData('remove_qr', e.target.checked)} />
                                    বর্তমান QR মুছুন
                                </label>
                            )}
                        </div>
                    </div>
                    {text('qr_note', 'QR-এর নিচের লেখা', 'QR কোড স্ক্যান করে পেমেন্ট করুন')}
                </section>

                <section className="grid gap-4 rounded-2xl border border-brand-200 bg-white p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-brand-800">ব্যাংক অ্যাকাউন্ট</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {text('bank_name', 'ব্যাংকের নাম')}
                        {text('account_name', 'অ্যাকাউন্টের নাম')}
                        {text('account_number', 'অ্যাকাউন্ট নম্বর')}
                        {text('branch', 'শাখা')}
                        {text('routing', 'রাউটিং নম্বর (ঐচ্ছিক)')}
                    </div>
                    <p className="text-sm text-slate-500">অ্যাকাউন্ট নম্বর ফাঁকা রাখলে ব্যাংক অংশটি এবং "ব্যাংক ট্রান্সফার" মাধ্যম দেখাবে না।</p>
                </section>

                <section className="grid gap-4 rounded-2xl border border-brand-200 bg-white p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-brand-800">মোবাইল ব্যাংকিং (বিকাশ / নগদ / রকেট…)</h2>
                    {data.methods.map((m, i) => (
                        <div key={i} className="grid gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                            <Field label="মাধ্যম" error={errors[`methods.${i}.name`]}>
                                {(id) => <input id={id} className={input} placeholder="বিকাশ (পার্সোনাল)" value={m.name} onChange={(e) => setMethod(i, 'name', e.target.value)} />}
                            </Field>
                            <Field label="নম্বর" error={errors[`methods.${i}.detail`]}>
                                {(id) => <input id={id} className={input} value={m.detail} onChange={(e) => setMethod(i, 'detail', e.target.value)} />}
                            </Field>
                            <button
                                type="button"
                                onClick={() => setData('methods', data.methods.filter((_, n) => n !== i))}
                                className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                                মুছুন
                            </button>
                        </div>
                    ))}
                    {data.methods.length < 10 && (
                        <button
                            type="button"
                            onClick={() => setData('methods', [...data.methods, { name: '', detail: '' }])}
                            className="justify-self-start rounded-md border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
                        >
                            + নতুন মাধ্যম
                        </button>
                    )}
                </section>

                <section className="grid gap-4 rounded-2xl border border-brand-200 bg-white p-5 sm:p-6">
                    <Field label="পেমেন্ট নির্দেশনা (ঐচ্ছিক)" error={errors.instruction}>
                        {(id) => <textarea id={id} rows={3} className={input} value={data.instruction} onChange={(e) => setData('instruction', e.target.value)} />}
                    </Field>
                </section>

                <div className="flex items-center gap-3">
                    <button disabled={form.processing} className={`${btn.base} ${btn.teal}`}>{form.processing ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ করুন'}</button>
                    {form.recentlySuccessful && <span className="font-semibold text-green-700">✓ সংরক্ষিত হয়েছে</span>}
                </div>
            </form>
        </AdminLayout>
    );
}
