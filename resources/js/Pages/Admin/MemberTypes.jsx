import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import Field from '../../Components/Field';
import { btn, input } from '../../Components/ui';
import { taka } from '../../Components/format';

const empty = { name: '', fee: '', description: '', sort_order: 0, is_active: true };

export default function MemberTypes({ types }) {
    const { errors: pageErrors } = usePage().props;
    const form = useForm(empty);
    const [editing, setEditing] = useState(null);

    const reset = () => {
        setEditing(null);
        form.setData(empty);
        form.clearErrors();
    };

    const edit = (t) => {
        setEditing(t.id);
        form.setData({
            name: t.name,
            fee: t.fee,
            description: t.description || '',
            sort_order: t.sort_order,
            is_active: !!t.is_active,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: reset };
        if (editing) form.put(`/admin/member-types/${editing}`, opts);
        else form.post('/admin/member-types', opts);
    };

    const remove = (t) => {
        if (window.confirm(`"${t.name}" টাইপটি মুছে ফেলবেন?`)) {
            router.delete(`/admin/member-types/${t.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="সদস্য টাইপ ও মেম্বারশীপ ফি">
            <form onSubmit={submit} className="mb-8 grid gap-5 rounded-2xl border border-brand-200 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-bold text-brand-800">{editing ? 'টাইপ সম্পাদনা' : 'নতুন মেম্বার টাইপ'}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="টাইপের নাম" required error={form.errors.name}>
                        {(id) => <input id={id} className={input} placeholder="যেমন আজীবন মেম্বার" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}
                    </Field>
                    <Field label="মেম্বারশীপ ফি (টাকা)" required error={form.errors.fee}>
                        {(id) => <input id={id} type="number" min="0" className={input} value={form.data.fee} onChange={(e) => form.setData('fee', e.target.value)} />}
                    </Field>
                    <Field label="ক্রম" error={form.errors.sort_order}>
                        {(id) => <input id={id} type="number" min="0" className={input} value={form.data.sort_order} onChange={(e) => form.setData('sort_order', e.target.value)} />}
                    </Field>
                    <Field label="সংক্ষিপ্ত বিবরণ" error={form.errors.description}>
                        {(id) => <input id={id} className={input} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />}
                    </Field>
                </div>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                    সক্রিয় (আবেদন ফরমে দেখাবে)
                </label>
                <div className="flex gap-3">
                    <button disabled={form.processing} className={`${btn.base} ${btn.teal}`}>{editing ? 'হালনাগাদ করুন' : 'যোগ করুন'}</button>
                    {editing && <button type="button" onClick={reset} className={`${btn.base} border border-brand-200 bg-white`}>বাতিল</button>}
                </div>
                <p className="text-sm text-slate-500">ফি বদলালে আগের আবেদনকারীদের সংরক্ষিত ফি বদলাবে না, শুধু নতুন আবেদনে নতুন ফি প্রযোজ্য হবে।</p>
            </form>

            {pageErrors?.delete && (
                <div role="alert" className="mb-5 rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-3 text-red-800">{pageErrors.delete}</div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {types.map((t) => (
                    <article key={t.id} className={`rounded-2xl border bg-white p-5 ${t.is_active ? 'border-brand-200' : 'border-dashed border-slate-300 opacity-75'}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-bold text-brand-800">
                                    {t.name}
                                    {!t.is_active && <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 align-middle text-xs font-bold text-slate-600">নিষ্ক্রিয়</span>}
                                </h3>
                                {t.description && <p className="text-sm text-slate-500">{t.description}</p>}
                            </div>
                            <div className="font-display text-2xl font-extrabold text-gold-600">{taka(t.fee)}</div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm text-slate-500">আবেদনকারী: {t.members.toLocaleString('bn-BD')} জন</span>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => edit(t)} className="rounded-md border border-brand-200 px-3 py-1 text-sm hover:bg-brand-100">সম্পাদনা</button>
                                <button type="button" onClick={() => remove(t)} className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">মুছুন</button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </AdminLayout>
    );
}
