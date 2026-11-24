import { useState } from 'react';

function CopyRow({ label, value, copied, onCopy }) {
    if (!value) return null;
    return (
        <div className="flex items-start justify-between gap-3 border-b border-brand-100 py-2 last:border-0">
            <div className="min-w-0">
                <div className="text-xs text-slate-500">{label}</div>
                <div className="break-words font-semibold text-brand-800">{value}</div>
            </div>
            {onCopy && (
                <button
                    type="button"
                    onClick={() => onCopy(value)}
                    className="flex-none rounded-md border border-brand-200 px-2.5 py-1 text-xs hover:bg-brand-100"
                >
                    {copied === value ? '✓ কপি হয়েছে' : 'কপি'}
                </button>
            )}
        </div>
    );
}

const isPlaceholder = (v) => /X{3,}/i.test(v || '');

/** QR কোড, ব্যাংক অ্যাকাউন্ট ও মোবাইল ব্যাংকিং নম্বর — সদস্যপদ ও অনুদান পেজে ব্যবহৃত */
export default function PaymentPanel({ payment, title = 'পেমেন্ট করুন' }) {
    const [copied, setCopied] = useState(null);

    const copy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(text);
            setTimeout(() => setCopied(null), 1500);
        } catch {
            /* কপি সম্ভব না হলে কিছু করার নেই */
        }
    };

    const mobile = (payment.methods || []).filter((m) => m.name && m.detail);
    const hasBank = !!(payment.account_number || payment.bank_name);
    const hasAny = payment.qr_url || hasBank || mobile.length > 0;

    return (
        <div className="grid gap-5 rounded-2xl border border-brand-200 bg-white p-6">
            <h3 className="text-lg font-bold text-brand-800">{title}</h3>

            {!hasAny && <p className="text-slate-500">পেমেন্টের তথ্য শীঘ্রই যোগ করা হবে।</p>}

            {payment.qr_url && (
                <div className="grid justify-items-center gap-2 rounded-xl bg-brand-50 p-4">
                    <img src={payment.qr_url} alt="পেমেন্ট QR কোড" className="h-auto w-full max-w-[230px] rounded-lg border border-brand-200 bg-white p-2" />
                    {payment.qr_note && <p className="text-center text-sm font-semibold text-brand-700">{payment.qr_note}</p>}
                </div>
            )}

            {hasBank && (
                <div>
                    <h4 className="mb-1 font-bold text-brand-700">ব্যাংক অ্যাকাউন্ট</h4>
                    <div className="rounded-xl border border-brand-100 px-4">
                        <CopyRow label="ব্যাংকের নাম" value={payment.bank_name} />
                        <CopyRow label="অ্যাকাউন্টের নাম" value={payment.account_name} copied={copied} onCopy={copy} />
                        <CopyRow label="অ্যাকাউন্ট নম্বর" value={payment.account_number} copied={copied} onCopy={copy} />
                        <CopyRow label="শাখা" value={payment.branch} />
                        <CopyRow label="রাউটিং নম্বর" value={payment.routing} copied={copied} onCopy={copy} />
                    </div>
                </div>
            )}

            {mobile.length > 0 && (
                <div>
                    <h4 className="mb-1 font-bold text-brand-700">মোবাইল ব্যাংকিং</h4>
                    <div className="rounded-xl border border-brand-100 px-4">
                        {mobile.map((m) => (
                            <CopyRow
                                key={m.name}
                                label={m.name}
                                value={m.detail}
                                copied={copied}
                                onCopy={isPlaceholder(m.detail) ? null : copy}
                            />
                        ))}
                    </div>
                </div>
            )}

            {payment.instruction && <p className="whitespace-pre-line text-[15px] text-slate-600">{payment.instruction}</p>}
        </div>
    );
}
