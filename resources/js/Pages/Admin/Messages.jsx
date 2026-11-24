import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Pager } from './Requests';

export default function Messages({ messages }) {
    const toggle = (m) => router.patch(`/admin/messages/${m.id}`, {}, { preserveScroll: true });
    const remove = (m) => {
        if (window.confirm('বার্তাটি স্থায়ীভাবে মুছে ফেলবেন?')) {
            router.delete(`/admin/messages/${m.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="যোগাযোগ বার্তা">
            {messages.data.length === 0 && (
                <p className="rounded-2xl border border-brand-200 bg-white p-8 text-center text-slate-500">এখনও কোনো বার্তা আসেনি।</p>
            )}
            <div className="grid gap-4">
                {messages.data.map((m) => (
                    <article key={m.id} className={`rounded-2xl border bg-white p-5 ${m.read ? 'border-brand-200' : 'border-gold-500'}`}>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <h3 className="text-lg font-bold text-brand-800">
                                    {m.subject || '(বিষয় নেই)'}
                                    {!m.read && <span className="ml-2 rounded bg-gold-100 px-2 py-0.5 align-middle text-xs font-bold text-gold-600">নতুন</span>}
                                </h3>
                                <div className="text-sm text-slate-500">
                                    {m.name} · <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a> · {m.at}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => toggle(m)} className="rounded-md border border-brand-200 px-3 py-1 text-sm hover:bg-brand-100">
                                    {m.read ? 'অপঠিত করুন' : 'পঠিত করুন'}
                                </button>
                                <button type="button" onClick={() => remove(m)} className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">
                                    মুছুন
                                </button>
                            </div>
                        </div>
                        <p className="mt-3 whitespace-pre-line text-slate-700">{m.message}</p>
                    </article>
                ))}
            </div>
            <Pager page={messages} />
        </AdminLayout>
    );
}
