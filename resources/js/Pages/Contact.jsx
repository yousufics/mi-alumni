import { usePage, useForm } from '@inertiajs/react';
import SiteLayout from '../Layouts/SiteLayout';
import PageHead from '../Components/PageHead';
import Container from '../Components/Container';
import Field from '../Components/Field';
import Flash from '../Components/Flash';
import { btn, input } from '../Components/ui';

export default function Contact() {
    const { site } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/contact', { preserveScroll: true, onSuccess: () => reset() });
    };

    const rows = [
        ['ফোন', site.phone],
        ['ইমেইল', site.email],
        ['ঠিকানা', site.address],
    ];

    return (
        <SiteLayout>
            <PageHead title="যোগাযোগ" subtitle="আপনার মতামত ও প্রশ্ন আমাদের জানান" />

            <section className="py-16">
                <Container className="grid items-start gap-8 md:grid-cols-[.8fr_1.2fr]">
                    <div className="rounded-2xl border border-brand-200 bg-white p-6">
                        <h3 className="mb-4 text-xl font-bold text-brand-800">যোগাযোগের তথ্য</h3>
                        <ul className="grid gap-3">
                            {rows.map(([k, v]) => (
                                <li key={k} className="grid gap-0.5">
                                    <strong className="text-sm text-gold-600">{k}</strong>
                                    <span>{v}</span>
                                </li>
                            ))}
                            <li className="grid gap-0.5">
                                <strong className="text-sm text-gold-600">সোশ্যাল</strong>
                                <span>
                                    <a href={site.facebook} className="hover:underline">ফেসবুক</a> ·{' '}
                                    <a href={site.youtube} className="hover:underline">ইউটিউব</a> ·{' '}
                                    <a href={`https://wa.me/${site.whatsapp}`} className="hover:underline">হোয়াটসঅ্যাপ</a>
                                </span>
                            </li>
                        </ul>
                    </div>

                    <form onSubmit={submit} className="grid gap-5 rounded-2xl border border-brand-200 bg-white p-6 sm:p-8">
                        <Flash />
                        <Field label="আপনার নাম" required error={errors.name}>
                            {(id) => <input id={id} className={input} value={data.name} onChange={(e) => setData('name', e.target.value)} />}
                        </Field>
                        <Field label="ইমেইল" required error={errors.email}>
                            {(id) => <input id={id} type="email" className={input} value={data.email} onChange={(e) => setData('email', e.target.value)} />}
                        </Field>
                        <Field label="বিষয়" error={errors.subject}>
                            {(id) => <input id={id} className={input} value={data.subject} onChange={(e) => setData('subject', e.target.value)} />}
                        </Field>
                        <Field label="বার্তা" required error={errors.message}>
                            {(id) => <textarea id={id} rows={5} className={input} value={data.message} onChange={(e) => setData('message', e.target.value)} />}
                        </Field>
                        <button disabled={processing} className={`${btn.base} ${btn.teal} justify-self-start`}>
                            {processing ? 'পাঠানো হচ্ছে…' : 'বার্তা পাঠান'}
                        </button>
                    </form>
                </Container>
            </section>
        </SiteLayout>
    );
}
