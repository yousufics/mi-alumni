import { Head, useForm } from '@inertiajs/react';
import Field from '../../Components/Field';
import { btn, input } from '../../Components/ui';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '', remember: false });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <div className="grid min-h-screen place-items-center bg-brand-800 px-4">
            <Head title="অ্যাডমিন লগইন" />
            <form onSubmit={submit} className="grid w-full max-w-sm gap-5 rounded-2xl bg-white p-8 shadow-xl">
                <div className="text-center">
                    <img src="/logo/logo.png" alt="" className="mx-auto h-20 w-20 rounded-full" />
                    <h1 className="mt-3 text-2xl font-extrabold text-brand-800">অ্যাডমিন লগইন</h1>
                </div>

                <Field label="ইমেইল" error={errors.email}>
                    {(id) => (
                        <input id={id} type="email" autoComplete="username" autoFocus className={input} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    )}
                </Field>
                <Field label="পাসওয়ার্ড" error={errors.password}>
                    {(id) => (
                        <input id={id} type="password" autoComplete="current-password" className={input} value={data.password} onChange={(e) => setData('password', e.target.value)} />
                    )}
                </Field>

                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                    আমাকে মনে রাখুন
                </label>

                <button disabled={processing} className={`${btn.base} ${btn.teal}`}>
                    {processing ? 'অপেক্ষা করুন…' : 'লগইন'}
                </button>
            </form>
        </div>
    );
}
