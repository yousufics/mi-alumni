import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import Field from '../../Components/Field';
import { btn, input } from '../../Components/ui';

const empty = {
    position: '',
    session: '',
    role: '',
    name: '',
    batch: '',
    is_current: true,
    sort_order: 0,
    photo: null,
    remove_photo: false,
};

export default function Committee({ members, positions }) {
    const form = useForm(empty);
    const [editing, setEditing] = useState(null); // সম্পাদনার সদস্য (অবজেক্ট)
    const [preview, setPreview] = useState(null);

    const selected = positions.find((p) => p.key === form.data.position);
    const advisory = selected?.group === 'advisory';

    const reset = () => {
        setEditing(null);
        setPreview(null);
        form.setData({ ...empty, session: members.find((m) => !m.advisory)?.session || '' });
        form.clearErrors();
    };

    const edit = (m) => {
        setEditing(m);
        setPreview(null);
        form.setData({
            position: m.position,
            session: m.session || '',
            role: m.role === m.position_label ? '' : m.role,
            name: m.name,
            batch: m.batch || '',
            is_current: !!m.is_current,
            sort_order: m.sort_order,
            photo: null,
            remove_photo: false,
            _method: 'put',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, forceFormData: true, onSuccess: reset };
        if (editing) form.post(`/admin/committee/${editing.id}`, opts);
        else form.post('/admin/committee', opts);
    };

    const remove = (m) => {
        if (window.confirm(`${m.name} (${m.role}) মুছে ফেলবেন?`)) {
            router.delete(`/admin/committee/${m.id}`, { preserveScroll: true });
        }
    };

    const pickPhoto = (e) => {
        const file = e.target.files?.[0] || null;
        form.setData('photo', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    // তালিকা গ্রুপ: বর্তমান কমিটি / উপদেষ্টা ও দাতা / সাবেক মেয়াদ
    const groups = [];
    members.forEach((m) => {
        const key = m.advisory ? 'advisory' : `${m.is_current ? 'c' : 'o'}|${m.session}`;
        const title = m.advisory
            ? 'উপদেষ্টা ও দাতা সদস্য'
            : `${m.is_current ? 'বর্তমান কমিটি' : 'সাবেক কমিটি'} — ${m.session}`;
        let g = groups.find((x) => x.key === key);
        if (!g) groups.push((g = { key, title, items: [] }));
        g.items.push(m);
    });

    const currentPhoto = editing?.photo && !form.data.remove_photo ? editing.photo : null;

    return (
        <AdminLayout title="কমিটি ও সদস্য ব্যবস্থাপনা">
            <form onSubmit={submit} className="mb-8 grid gap-5 rounded-2xl border border-brand-200 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-bold text-brand-800">{editing ? `সম্পাদনা: ${editing.name}` : 'নতুন সদস্য যোগ'}</h2>

                <Field label="পজিশন" required error={form.errors.position}>
                    {(id) => (
                        <select id={id} className={input} value={form.data.position} onChange={(e) => form.setData('position', e.target.value)}>
                            <option value="">— পজিশন বাছাই করুন —</option>
                            <optgroup label="কমিটি">
                                {positions.filter((p) => p.group === 'committee').map((p) => (
                                    <option key={p.key} value={p.key}>{p.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="উপদেষ্টা ও দাতা">
                                {positions.filter((p) => p.group !== 'committee').map((p) => (
                                    <option key={p.key} value={p.key}>{p.label}</option>
                                ))}
                            </optgroup>
                        </select>
                    )}
                </Field>
                {selected && (
                    <p className="-mt-2 rounded-lg bg-gold-100 px-4 py-2 text-sm text-brand-900">
                        <strong>{selected.label}</strong> সাইটে দেখাবে: {selected.appears}।
                    </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="নাম" required error={form.errors.name}>
                        {(id) => <input id={id} className={input} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}
                    </Field>
                    <Field label="ব্যাচ" error={form.errors.batch}>
                        {(id) => <input id={id} className={input} placeholder="ব্যাচ ২০১০" value={form.data.batch} onChange={(e) => form.setData('batch', e.target.value)} />}
                    </Field>
                    <Field label="পদবির লেখা (ফাঁকা রাখলে পজিশনের নাম)" error={form.errors.role}>
                        {(id) => <input id={id} className={input} placeholder={selected?.label || ''} value={form.data.role} onChange={(e) => form.setData('role', e.target.value)} />}
                    </Field>
                    {!advisory && (
                        <Field label="কমিটির মেয়াদ" required error={form.errors.session}>
                            {(id) => <input id={id} className={input} placeholder="যেমন ২০২৪–২০২৬ মেয়াদ" value={form.data.session} onChange={(e) => form.setData('session', e.target.value)} />}
                        </Field>
                    )}
                    <Field label="ক্রম (ছোট সংখ্যা আগে)" error={form.errors.sort_order}>
                        {(id) => <input id={id} type="number" min="0" className={input} value={form.data.sort_order} onChange={(e) => form.setData('sort_order', e.target.value)} />}
                    </Field>
                </div>

                {!advisory && (
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={form.data.is_current} onChange={(e) => form.setData('is_current', e.target.checked)} />
                        বর্তমান কমিটি (বন্ধ করলে "সাবেক কমিটি"-তে যাবে)
                    </label>
                )}

                <div className="flex flex-wrap items-center gap-5">
                    {(preview || currentPhoto) && (
                        <img src={preview || currentPhoto} alt="" className="h-20 w-20 rounded-full border-2 border-gold-500 object-cover" />
                    )}
                    <Field label="ছবি (jpg/png/webp, সর্বোচ্চ ২ MB)" error={form.errors.photo}>
                        {(id) => <input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} className="text-sm" />}
                    </Field>
                    {editing?.photo && (
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.data.remove_photo} onChange={(e) => form.setData('remove_photo', e.target.checked)} />
                            বর্তমান ছবি মুছে ফেলুন
                        </label>
                    )}
                </div>

                <div className="flex gap-3">
                    <button disabled={form.processing} className={`${btn.base} ${btn.teal}`}>
                        {editing ? 'হালনাগাদ করুন' : 'যোগ করুন'}
                    </button>
                    {editing && (
                        <button type="button" onClick={reset} className={`${btn.base} border border-brand-200 bg-white`}>বাতিল</button>
                    )}
                </div>
            </form>

            {groups.length === 0 && (
                <p className="rounded-2xl border border-brand-200 bg-white p-8 text-center text-slate-500">কেউ নেই। উপরের ফরম থেকে যোগ করুন।</p>
            )}
            <div className="grid gap-6">
                {groups.map((g) => (
                    <section key={g.key} className="overflow-hidden rounded-2xl border border-brand-200 bg-white">
                        <h3 className="bg-brand-100 px-5 py-3 font-bold text-brand-800">{g.title}</h3>
                        <ul className="divide-y divide-brand-100">
                            {g.items.map((m) => (
                                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        {m.photo ? (
                                            <img src={m.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">{m.name.charAt(0)}</div>
                                        )}
                                        <div>
                                            <div className="text-sm font-semibold text-gold-600">{m.role}</div>
                                            <div className="font-semibold">{m.name} <span className="font-normal text-slate-500">{m.batch}</span></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => edit(m)} className="rounded-md border border-brand-200 px-3 py-1 text-sm hover:bg-brand-100">সম্পাদনা</button>
                                        <button type="button" onClick={() => remove(m)} className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">মুছুন</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </AdminLayout>
    );
}
