import { useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import Field from '../../Components/Field';
import { btn, input } from '../../Components/ui';

function useGroup(group, initial) {
    const form = useForm(initial);
    const submit = (e) => {
        e.preventDefault();
        form.put(`/admin/content/${group}`, { preserveScroll: true });
    };
    return [form, submit];
}

function Card({ id, title, hint, form, onSubmit, children }) {
    const firstError = Object.values(form.errors)[0];
    return (
        <form id={id} onSubmit={onSubmit} className="grid scroll-mt-6 gap-4 rounded-2xl border border-brand-200 bg-white p-5 sm:p-6">
            <div>
                <h2 className="text-lg font-bold text-brand-800">{title}</h2>
                {hint && <p className="text-sm text-slate-500">{hint}</p>}
            </div>
            {children}
            <div className="flex flex-wrap items-center gap-3">
                <button disabled={form.processing} className={`${btn.base} ${btn.teal}`}>সংরক্ষণ করুন</button>
                {form.recentlySuccessful && <span className="font-semibold text-green-700">✓ সংরক্ষিত হয়েছে</span>}
                {firstError && <span className="text-sm text-red-600">{firstError}</span>}
            </div>
        </form>
    );
}

const RowBtn = ({ onClick, children }) => (
    <button type="button" onClick={onClick} className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">
        {children}
    </button>
);

const AddBtn = ({ onClick, children }) => (
    <button type="button" onClick={onClick} className="justify-self-start rounded-md border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100">
        + {children}
    </button>
);

function PillarsCard({ initial }) {
    const [form, submit] = useGroup('pillars', { items: initial.items });
    const set = (i, k, v) => form.setData('items', form.data.items.map((it, n) => (n === i ? { ...it, [k]: v } : it)));
    return (
        <Card id="pillars" title="Our Pillars — আমাদের চার স্তম্ভ" hint="মূলপাতা ও পরিচয় পেজে কার্ড আকারে দেখায়। সর্বোচ্চ ৮টি।" form={form} onSubmit={submit}>
            {form.data.items.map((it, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4">
                    <div className="flex items-end gap-3">
                        <Field label={`স্তম্ভ ${i + 1} — শিরোনাম`}>
                            {(id) => <input id={id} className={input} value={it.title} onChange={(e) => set(i, 'title', e.target.value)} />}
                        </Field>
                        {form.data.items.length > 1 && (
                            <RowBtn onClick={() => form.setData('items', form.data.items.filter((_, n) => n !== i))}>মুছুন</RowBtn>
                        )}
                    </div>
                    <Field label="বর্ণনা">
                        {(id) => <textarea id={id} rows={2} className={input} value={it.text} onChange={(e) => set(i, 'text', e.target.value)} />}
                    </Field>
                </div>
            ))}
            {form.data.items.length < 8 && (
                <AddBtn onClick={() => form.setData('items', [...form.data.items, { title: '', text: '' }])}>নতুন স্তম্ভ</AddBtn>
            )}
        </Card>
    );
}

function AboutCard({ initial }) {
    const [form, submit] = useGroup('about', { intro: initial.intro, mission: initial.mission, vision: initial.vision });
    return (
        <Card id="about" title="Introduction — পরিচয়" hint="আমাদের সম্পর্কে পেজ ও মূলপাতার পরিচয় অংশ।" form={form} onSubmit={submit}>
            <Field label="পরিচয়">
                {(id) => <textarea id={id} rows={4} className={input} value={form.data.intro} onChange={(e) => form.setData('intro', e.target.value)} />}
            </Field>
            <Field label="আমাদের লক্ষ্য">
                {(id) => <textarea id={id} rows={3} className={input} value={form.data.mission} onChange={(e) => form.setData('mission', e.target.value)} />}
            </Field>
            <Field label="আমাদের স্বপ্ন">
                {(id) => <textarea id={id} rows={3} className={input} value={form.data.vision} onChange={(e) => form.setData('vision', e.target.value)} />}
            </Field>
        </Card>
    );
}

function ActivitiesCard({ initial }) {
    const [form, submit] = useGroup('activities', { items: initial.items });
    const set = (i, v) => form.setData('items', form.data.items.map((it, n) => (n === i ? v : it)));
    return (
        <Card id="activities" title="What We Do — আমাদের কার্যক্রম" hint="পরিচয় পেজে তালিকা আকারে দেখায়।" form={form} onSubmit={submit}>
            {form.data.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3">
                    <input aria-label={`কার্যক্রম ${i + 1}`} className={input} value={it} onChange={(e) => set(i, e.target.value)} />
                    {form.data.items.length > 1 && (
                        <RowBtn onClick={() => form.setData('items', form.data.items.filter((_, n) => n !== i))}>মুছুন</RowBtn>
                    )}
                </div>
            ))}
            <AddBtn onClick={() => form.setData('items', [...form.data.items, ''])}>নতুন কার্যক্রম</AddBtn>
        </Card>
    );
}

function DonationCard({ initial }) {
    const [form, submit] = useGroup('donation', { intro: initial.intro, thanks: initial.thanks ?? '' });
    return (
        <Card id="donation" title="Donate — অনুদান পেজ" hint="QR, ব্যাংক ও বিকাশ/নগদ নম্বর বদলাতে 'পেমেন্ট তথ্য' পেজে যান।" form={form} onSubmit={submit}>
            <Field label="অনুদানের বার্তা">
                {(id) => <textarea id={id} rows={3} className={input} value={form.data.intro} onChange={(e) => form.setData('intro', e.target.value)} />}
            </Field>
            <Field label="অনুদান জমা দেওয়ার পর অভিনন্দন বার্তা">
                {(id) => <textarea id={id} rows={3} className={input} value={form.data.thanks} onChange={(e) => form.setData('thanks', e.target.value)} />}
            </Field>
        </Card>
    );
}

function ContactCard({ initial }) {
    const v = (k) => initial[k] ?? '';
    const [form, submit] = useGroup('contact', {
        phone: v('phone'), email: v('email'), whatsapp: v('whatsapp'), address: v('address'), facebook: v('facebook'), youtube: v('youtube'),
    });
    const text = (k, label, ph = '') => (
        <Field label={label}>
            {(id) => <input id={id} className={input} placeholder={ph} value={form.data[k]} onChange={(e) => form.setData(k, e.target.value)} />}
        </Field>
    );
    return (
        <Card id="contact" title="Contact — যোগাযোগ" hint="যোগাযোগ পেজ ও ফুটারে দেখায়।" form={form} onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
                {text('phone', 'ফোন')}
                {text('email', 'ইমেইল')}
                {text('whatsapp', 'হোয়াটসঅ্যাপ নম্বর (দেশ কোডসহ, যেমন 8801XXXXXXXXX)')}
                {text('address', 'ঠিকানা')}
                {text('facebook', 'ফেসবুক লিংক', 'https://facebook.com/…')}
                {text('youtube', 'ইউটিউব লিংক', 'https://youtube.com/…')}
            </div>
        </Card>
    );
}

function MembershipCard({ initial }) {
    const [form, submit] = useGroup('membership', { intro: initial.intro ?? '', payment_note: initial.payment_note ?? '' });
    return (
        <Card id="membership" title="Membership — সদস্যপদ পেজের লেখা" hint="মেম্বার টাইপ ও ফি আলাদা পেজ (সদস্য টাইপ ও ফি) থেকে বদলান।" form={form} onSubmit={submit}>
            <Field label="ফরমের ওপরের বার্তা">
                {(id) => <textarea id={id} rows={3} className={input} value={form.data.intro} onChange={(e) => form.setData('intro', e.target.value)} />}
            </Field>
            <Field label="ফি পরিশোধের নির্দেশনা">
                {(id) => <textarea id={id} rows={3} className={input} value={form.data.payment_note} onChange={(e) => form.setData('payment_note', e.target.value)} />}
            </Field>
        </Card>
    );
}

const jumps = [
    ['pillars', 'Our Pillars'],
    ['about', 'Introduction'],
    ['activities', 'What We Do'],
    ['donation', 'Donate'],
    ['contact', 'Contact'],
    ['membership', 'Membership'],
];

export default function Content({ content }) {
    return (
        <AdminLayout title="পেজ কনটেন্ট">
            <div className="mb-6 flex flex-wrap gap-2">
                {jumps.map(([id, label]) => (
                    <a key={id} href={`#${id}`} className="rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm hover:bg-brand-100">{label}</a>
                ))}
            </div>
            <div className="grid gap-6">
                <PillarsCard initial={content.pillars} />
                <AboutCard initial={content.about} />
                <ActivitiesCard initial={content.activities} />
                <DonationCard initial={content.donation} />
                <ContactCard initial={content.contact} />
                <MembershipCard initial={content.membership} />
            </div>
        </AdminLayout>
    );
}
