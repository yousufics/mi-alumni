import { useRef } from 'react';
import { useForm } from '@inertiajs/react';
import SiteLayout from '../Layouts/SiteLayout';
import PageHead from '../Components/PageHead';
import Container from '../Components/Container';
import Field from '../Components/Field';
import Flash from '../Components/Flash';
import PaymentPanel from '../Components/PaymentPanel';
import { btn, input } from '../Components/ui';
import { taka } from '../Components/format';

export default function Membership({ types, content, payment }) {
    const formRef = useRef(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        batch: '',
        member_type_id: types[0]?.id ?? '',
        profession: '',
        address: '',
        message: '',
        pay_option: 'later',
        payment_method: '',
        trx_id: '',
    });
    const type = types.find((t) => Number(t.id) === Number(data.member_type_id));

    const submit = (e) => {
        e.preventDefault();
        post('/membership', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },
        });
    };

    return (
        <SiteLayout>
            <PageHead title="সদস্য হোন" subtitle="অ্যালামনাই সদস্যপদের আবেদন ফরম" />

            <section className="py-16">
                <Container className="grid items-start gap-8 lg:grid-cols-[1.4fr_.8fr]">
                    <form ref={formRef} onSubmit={submit} className="grid gap-5 rounded-2xl border border-brand-200 bg-white p-6 sm:p-8">
                        {content.intro && <p className="text-slate-600">{content.intro}</p>}
                        <Flash />

                        {types.length > 0 && (
                            <fieldset className="grid gap-3">
                                <legend className="mb-1 text-sm font-semibold text-slate-700">
                                    মেম্বার টাইপ <span className="text-red-600">*</span>
                                </legend>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {types.map((t) => (
                                        <label
                                            key={t.id}
                                            className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                                                Number(data.member_type_id) === t.id ? 'border-gold-500 bg-gold-100' : 'border-brand-200 hover:bg-brand-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="member_type"
                                                className="mt-1.5"
                                                checked={Number(data.member_type_id) === t.id}
                                                onChange={() => setData('member_type_id', t.id)}
                                            />
                                            <span>
                                                <span className="block font-bold text-brand-800">{t.name}</span>
                                                <span className="block font-display text-xl font-extrabold text-gold-600">{taka(t.fee)}</span>
                                                {t.description && <span className="block text-sm text-slate-500">{t.description}</span>}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.member_type_id && <p className="text-sm text-red-600">{errors.member_type_id}</p>}
                            </fieldset>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="পূর্ণ নাম" required error={errors.name}>
                                {(id) => <input id={id} className={input} value={data.name} onChange={(e) => setData('name', e.target.value)} />}
                            </Field>
                            <Field label="ব্যাচ / পাসের সাল" required error={errors.batch}>
                                {(id) => <input id={id} className={input} value={data.batch} onChange={(e) => setData('batch', e.target.value)} />}
                            </Field>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="ইমেইল" required error={errors.email}>
                                {(id) => <input id={id} type="email" className={input} value={data.email} onChange={(e) => setData('email', e.target.value)} />}
                            </Field>
                            <Field label="মোবাইল নম্বর" required error={errors.phone}>
                                {(id) => <input id={id} type="tel" className={input} value={data.phone} onChange={(e) => setData('phone', e.target.value)} />}
                            </Field>
                        </div>
                        <Field label="পেশা" error={errors.profession}>
                            {(id) => <input id={id} className={input} value={data.profession} onChange={(e) => setData('profession', e.target.value)} />}
                        </Field>
                        <Field label="বর্তমান ঠিকানা" error={errors.address}>
                            {(id) => <input id={id} className={input} value={data.address} onChange={(e) => setData('address', e.target.value)} />}
                        </Field>
                        <Field label="কিছু বলতে চান?" error={errors.message}>
                            {(id) => <textarea id={id} rows={4} className={input} value={data.message} onChange={(e) => setData('message', e.target.value)} />}
                        </Field>

                        <fieldset className="grid gap-4 rounded-xl border-2 border-brand-100 bg-brand-50 p-5">
                            <legend className="px-2 font-bold text-brand-800">মেম্বারশীপ ফি পরিশোধ</legend>
                            {type && (
                                <p className="text-[15px] text-slate-600">
                                    {type.name}-এর ফি: <strong className="text-gold-600">{taka(type.fee)}</strong>। পাশের QR বা ব্যাংক অ্যাকাউন্টে পেমেন্ট করে ট্রানজেকশন আইডি (trxID) দিন।
                                </p>
                            )}
                            <label className="flex cursor-pointer items-center gap-3">
                                <input type="radio" name="pay_option" checked={data.pay_option === 'now'} onChange={() => setData('pay_option', 'now')} />
                                <span>আমি ফি পরিশোধ করেছি — trxID দেব</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3">
                                <input type="radio" name="pay_option" checked={data.pay_option === 'later'} onChange={() => setData('pay_option', 'later')} />
                                <span>আমি পরে পরিশোধ করতে চাই</span>
                            </label>

                            {data.pay_option === 'now' && (
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field label="পেমেন্ট মাধ্যম" required error={errors.payment_method}>
                                        {(id) => (
                                            <select id={id} className={input} value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)}>
                                                <option value="">— বাছাই করুন —</option>
                                                {payment.options.map((o) => (
                                                    <option key={o} value={o}>{o}</option>
                                                ))}
                                            </select>
                                        )}
                                    </Field>
                                    <Field label="ট্রানজেকশন আইডি (trxID)" required error={errors.trx_id}>
                                        {(id) => <input id={id} className={input} autoComplete="off" placeholder="যেমন 9AB3XYZ12" value={data.trx_id} onChange={(e) => setData('trx_id', e.target.value)} />}
                                    </Field>
                                </div>
                            )}
                        </fieldset>

                        <button disabled={processing} className={`${btn.base} ${btn.teal} justify-self-start`}>
                            {processing ? 'পাঠানো হচ্ছে…' : 'আবেদন জমা দিন'}
                        </button>
                    </form>

                    <aside className="grid gap-5 lg:sticky lg:top-24">
                        {types.length > 0 && (
                            <div className="rounded-2xl border border-brand-200 bg-white p-6">
                                <h3 className="mb-3 text-lg font-bold text-brand-800">মেম্বারশীপ ফি</h3>
                                <ul className="grid gap-2">
                                    {types.map((t) => (
                                        <li key={t.id} className="flex items-center justify-between gap-3 border-b border-brand-100 pb-2 last:border-0">
                                            <span>{t.name}</span>
                                            <strong className="text-gold-600">{taka(t.fee)}</strong>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {content.payment_note && (
                            <div className="rounded-2xl border-l-4 border-gold-500 bg-gold-100 p-6 text-brand-900">
                                <h3 className="mb-2 font-bold">ফি পরিশোধের নিয়ম</h3>
                                <p className="whitespace-pre-line text-[15.5px]">{content.payment_note}</p>
                            </div>
                        )}
                        <PaymentPanel payment={payment} title="পেমেন্ট করুন (QR / ব্যাংক)" />
                    </aside>
                </Container>
            </section>
        </SiteLayout>
    );
}
