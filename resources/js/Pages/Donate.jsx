import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import SiteLayout from '../Layouts/SiteLayout';
import PageHead from '../Components/PageHead';
import Container from '../Components/Container';
import SectionHead from '../Components/SectionHead';
import Field from '../Components/Field';
import PaymentPanel from '../Components/PaymentPanel';
import { btn, input } from '../Components/ui';
import { taka } from '../Components/format';

const quick = [500, 1000, 5000, 10000];

function ThankYou({ done, text, onAgain }) {
    return (
        <div className="grid gap-4 rounded-2xl border-2 border-gold-500 bg-gold-100 p-8 text-center" role="status">
            <div className="text-5xl" aria-hidden="true">🎉</div>
            <h3 className="font-display text-2xl font-extrabold text-brand-800">অভিনন্দন ও ধন্যবাদ, {done.name}!</h3>
            <p className="text-lg text-brand-900">
                আপনার <strong className="text-gold-600">{taka(done.amount)}</strong> টাকার অনুদানের জন্য আমরা আন্তরিকভাবে কৃতজ্ঞ।
            </p>
            {text && <p className="text-brand-900">{text}</p>}
            <p className="text-sm text-slate-600">ট্রানজেকশন যাচাই করে কমিটি অনুদান নিশ্চিত করবে।</p>
            <button type="button" onClick={onAgain} className={`${btn.base} ${btn.teal} justify-self-center`}>
                আরেকটি অনুদান দিন
            </button>
        </div>
    );
}

export default function Donate({ donation, payment }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        amount: '',
        payment_method: '',
        trx_id: '',
        message: '',
    });
    const [done, setDone] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        post('/donate', {
            preserveScroll: true,
            onSuccess: () => {
                setDone({ name: data.name, amount: data.amount });
                reset();
            },
        });
    };

    return (
        <SiteLayout>
            <PageHead title="অনুদান" subtitle="আপনার সহযোগিতাই আমাদের শক্তি" />

            <section className="py-16">
                <Container>
                    <SectionHead title="অনুদান দিন" text={donation.intro} />

                    <div className="grid items-start gap-8 lg:grid-cols-2">
                        <PaymentPanel payment={payment} title="১. QR স্ক্যান বা ব্যাংকে অনুদান পাঠান" />

                        {done ? (
                            <ThankYou done={done} text={donation.thanks} onAgain={() => setDone(null)} />
                        ) : (
                            <form onSubmit={submit} className="grid gap-5 rounded-2xl border border-brand-200 bg-white p-6 sm:p-8">
                                <div>
                                    <h3 className="text-lg font-bold text-brand-800">২. অনুদানের তথ্য জমা দিন</h3>
                                    <p className="text-sm text-slate-500">পেমেন্ট করার পর পেমেন্ট মাধ্যম ও ট্রানজেকশন আইডি (trxID) দিয়ে জমা দিন।</p>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field label="আপনার নাম" required error={errors.name}>
                                        {(id) => <input id={id} className={input} value={data.name} onChange={(e) => setData('name', e.target.value)} />}
                                    </Field>
                                    <Field label="মোবাইল নম্বর" required error={errors.phone}>
                                        {(id) => <input id={id} type="tel" className={input} value={data.phone} onChange={(e) => setData('phone', e.target.value)} />}
                                    </Field>
                                </div>
                                <Field label="ইমেইল (ঐচ্ছিক)" error={errors.email}>
                                    {(id) => <input id={id} type="email" className={input} value={data.email} onChange={(e) => setData('email', e.target.value)} />}
                                </Field>

                                <Field label="অনুদানের পরিমাণ (টাকা)" required error={errors.amount}>
                                    {(id) => (
                                        <div className="grid gap-2">
                                            <input id={id} type="number" min="1" inputMode="numeric" className={input} value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                                            <div className="flex flex-wrap gap-2">
                                                {quick.map((n) => (
                                                    <button
                                                        key={n}
                                                        type="button"
                                                        onClick={() => setData('amount', n)}
                                                        className={`rounded-full border px-3 py-1 text-sm ${Number(data.amount) === n ? 'border-gold-500 bg-gold-100' : 'border-brand-200 hover:bg-brand-50'}`}
                                                    >
                                                        {taka(n)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Field>

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

                                <Field label="বার্তা (ঐচ্ছিক)" error={errors.message}>
                                    {(id) => <textarea id={id} rows={3} className={input} value={data.message} onChange={(e) => setData('message', e.target.value)} />}
                                </Field>

                                <button disabled={processing} className={`${btn.base} ${btn.gold} justify-self-start`}>
                                    {processing ? 'জমা হচ্ছে…' : 'অনুদান জমা দিন'}
                                </button>
                            </form>
                        )}
                    </div>
                </Container>
            </section>
        </SiteLayout>
    );
}
