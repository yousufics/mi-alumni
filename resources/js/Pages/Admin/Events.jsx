import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import Field from '../../Components/Field';
import { btn, input } from '../../Components/ui';

const empty = { title: '', date_label: '', place: '', description: '', is_published: true, sort_order: 0 };

export default function Events({ events }) {
    const form = useForm(empty);
    const [editing, setEditing] = useState(null);

    const reset = () => {
        setEditing(null);
        form.setData(empty);
        form.clearErrors();
    };

    const edit = (e) => {
        setEditing(e.id);
        form.setData({
            title: e.title,
            date_label: e.date_label,
            place: e.place || '',
            description: e.description || '',
            is_published: !!e.is_published,
            sort_order: e.sort_order,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = (ev) => {
        ev.preventDefault();
        const opts = { preserveScroll: true, onSuccess: reset };
        if (editing) form.put(`/admin/events/${editing}`, opts);
        else form.post('/admin/events', opts);
    };

    const remove = (e) => {
        if (window.confirm(`"${e.title}" মুছে ফেলবেন?`)) {
            router.delete(`/admin/events/${e.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="ইভেন্ট ব্যবস্থাপনা">
            <form onSubmit={submit} className="mb-8 grid gap-4 rounded-2xl border border-brand-200 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-bold text-brand-800">{editing ? 'ইভেন্ট সম্পাদনা' : 'নতুন ইভেন্ট'}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="শিরোনাম" required error={form.errors.title}>
                        {(id) => <input id={id} className={input} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />}
                    </Field>
                    <Field label="তারিখ (লেখা আকারে)" required error={form.errors.date_label}>
                        {(id) => <input id={id} className={input} placeholder="যেমন ১৫ ডিসেম্বর ২০২৬" value={form.data.date_label} onChange={(e) => form.setData('date_label', e.target.value)} />}
                    </Field>
                    <Field label="স্থান" error={form.errors.place}>
                        {(id) => <input id={id} className={input} value={form.data.place} onChange={(e) => form.setData('place', e.target.value)} />}
                    </Field>
                    <Field label="ক্রম (ছোট সংখ্যা আগে)" error={form.errors.sort_order}>
                        {(id) => <input id={id} type="number" min="0" className={input} value={form.data.sort_order} onChange={(e) => form.setData('sort_order', e.target.value)} />}
                    </Field>
                </div>
                <Field label="বিবরণ" error={form.errors.description}>
                    {(id) => <textarea id={id} rows={3} className={input} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />}
                </Field>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} />
                    সাইটে প্রকাশিত (বন্ধ করলে লুকানো থাকবে)
                </label>
                <div className="flex gap-3">
                    <button disabled={form.processing} className={`${btn.base} ${btn.teal}`}>
                        {editing ? 'হালনাগাদ করুন' : 'যোগ করুন'}
                    </button>
                    {editing && (
                        <button type="button" onClick={reset} className={`${btn.base} border border-brand-200 bg-white`}>বাতিল</button>
                    )}
                </div>
            </form>

            {events.length === 0 && (
                <p className="rounded-2xl border border-brand-200 bg-white p-8 text-center text-slate-500">কোনো ইভেন্ট নেই। উপরের ফরম থেকে যোগ করুন।</p>
            )}
            <div className="grid gap-4">
                {events.map((e) => (
                    <article key={e.id} className="rounded-2xl border border-brand-200 bg-white p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold text-gold-600">{e.date_label}</div>
                                <h3 className="text-lg font-bold text-brand-800">
                                    {e.title}
                                    {!e.is_published && <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 align-middle text-xs font-bold text-slate-600">লুকানো</span>}
                                </h3>
                                {e.place && <div className="text-sm text-slate-500">📍 {e.place}</div>}
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => edit(e)} className="rounded-md border border-brand-200 px-3 py-1 text-sm hover:bg-brand-100">সম্পাদনা</button>
                                <button type="button" onClick={() => remove(e)} className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">মুছুন</button>
                            </div>
                        </div>
                        {e.description && <p className="mt-2 text-slate-600">{e.description}</p>}
                    </article>
                ))}
            </div>
        </AdminLayout>
    );
}
