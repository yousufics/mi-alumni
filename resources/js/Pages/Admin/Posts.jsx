import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import Field from '../../Components/Field';
import { btn, input } from '../../Components/ui';

const today = () => new Date().toISOString().slice(0, 10);

const empty = () => ({
    title: '',
    tag: '',
    excerpt: '',
    body: '',
    published_at: today(),
    is_published: true,
    image: null,
    remove_image: false,
});

export default function Posts({ posts }) {
    const form = useForm(empty());
    const [editing, setEditing] = useState(null);
    const [preview, setPreview] = useState(null);

    const reset = () => {
        setEditing(null);
        setPreview(null);
        form.setData(empty());
        form.clearErrors();
    };

    const edit = (p) => {
        setEditing(p);
        setPreview(null);
        form.setData({
            title: p.title,
            tag: p.tag || '',
            excerpt: p.excerpt || '',
            body: p.body,
            published_at: p.published_at || today(),
            is_published: !!p.is_published,
            image: null,
            remove_image: false,
            _method: 'put',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, forceFormData: true, onSuccess: reset };
        if (editing) form.post(`/admin/posts/${editing.id}`, opts);
        else form.post('/admin/posts', opts);
    };

    const remove = (p) => {
        if (window.confirm(`"${p.title}" মুছে ফেলবেন?`)) {
            router.delete(`/admin/posts/${p.id}`, { preserveScroll: true });
        }
    };

    const pick = (e) => {
        const file = e.target.files?.[0] || null;
        form.setData('image', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const currentImage = editing?.image && !form.data.remove_image ? editing.image : null;

    return (
        <AdminLayout title="নিবন্ধ ব্যবস্থাপনা">
            <form onSubmit={submit} className="mb-8 grid gap-5 rounded-2xl border border-brand-200 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-bold text-brand-800">{editing ? 'নিবন্ধ সম্পাদনা' : 'নতুন নিবন্ধ'}</h2>

                <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
                    <Field label="শিরোনাম" required error={form.errors.title}>
                        {(id) => <input id={id} className={input} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />}
                    </Field>
                    <Field label="ট্যাগ" error={form.errors.tag}>
                        {(id) => <input id={id} className={input} placeholder="ঘোষণা, সংবাদ…" value={form.data.tag} onChange={(e) => form.setData('tag', e.target.value)} />}
                    </Field>
                    <Field label="প্রকাশের তারিখ" error={form.errors.published_at}>
                        {(id) => <input id={id} type="date" className={input} value={form.data.published_at} onChange={(e) => form.setData('published_at', e.target.value)} />}
                    </Field>
                </div>

                <Field label="সারসংক্ষেপ (তালিকায় দেখাবে, ফাঁকা রাখলে বিস্তারিত থেকে নেওয়া হবে)" error={form.errors.excerpt}>
                    {(id) => <textarea id={id} rows={2} className={input} value={form.data.excerpt} onChange={(e) => form.setData('excerpt', e.target.value)} />}
                </Field>

                <Field label="বিস্তারিত (অনুচ্ছেদ আলাদা করতে একটি ফাঁকা লাইন দিন)" required error={form.errors.body}>
                    {(id) => <textarea id={id} rows={10} className={input} value={form.data.body} onChange={(e) => form.setData('body', e.target.value)} />}
                </Field>

                <div className="flex flex-wrap items-center gap-5">
                    {(preview || currentImage) && (
                        <img src={preview || currentImage} alt="" className="h-20 w-32 rounded-lg border border-brand-200 object-cover" />
                    )}
                    <Field label="নিবন্ধের ছবি (jpg/png/webp, সর্বোচ্চ ৩ MB)" error={form.errors.image}>
                        {(id) => <input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="text-sm" />}
                    </Field>
                    {editing?.image && (
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.data.remove_image} onChange={(e) => form.setData('remove_image', e.target.checked)} />
                            বর্তমান ছবি মুছে ফেলুন
                        </label>
                    )}
                </div>

                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} />
                    সাইটে প্রকাশিত (বন্ধ করলে ড্রাফট থাকবে)
                </label>

                <div className="flex gap-3">
                    <button disabled={form.processing} className={`${btn.base} ${btn.teal}`}>
                        {editing ? 'হালনাগাদ করুন' : 'প্রকাশ করুন'}
                    </button>
                    {editing && (
                        <button type="button" onClick={reset} className={`${btn.base} border border-brand-200 bg-white`}>বাতিল</button>
                    )}
                </div>
            </form>

            {posts.length === 0 && (
                <p className="rounded-2xl border border-brand-200 bg-white p-8 text-center text-slate-500">কোনো নিবন্ধ নেই। উপরের ফরম থেকে যোগ করুন।</p>
            )}
            <div className="grid gap-4">
                {posts.map((p) => (
                    <article key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-200 bg-white p-4">
                        {p.image ? (
                            <img src={p.image} alt="" className="h-20 w-32 rounded-lg object-cover" />
                        ) : (
                            <div className="grid h-20 w-32 place-items-center rounded-lg bg-brand-100 text-sm text-slate-500">ছবি নেই</div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-brand-800">
                                {p.title}
                                {!p.is_published && <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 align-middle text-xs font-bold text-slate-600">ড্রাফট</span>}
                            </h3>
                            <div className="text-sm text-slate-500">{p.tag} {p.tag && '·'} {p.published_at}</div>
                        </div>
                        <div className="flex gap-2">
                            <a href={`/posts/${p.id}`} target="_blank" rel="noreferrer" className="rounded-md border border-brand-200 px-3 py-1 text-sm hover:bg-brand-100">দেখুন ↗</a>
                            <button type="button" onClick={() => edit(p)} className="rounded-md border border-brand-200 px-3 py-1 text-sm hover:bg-brand-100">সম্পাদনা</button>
                            <button type="button" onClick={() => remove(p)} className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">মুছুন</button>
                        </div>
                    </article>
                ))}
            </div>
        </AdminLayout>
    );
}
