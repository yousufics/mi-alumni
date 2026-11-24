import { usePage } from '@inertiajs/react';

export default function Flash() {
    const { flash } = usePage().props;
    if (!flash?.success) return null;
    return (
        <div role="status" className="rounded-lg border-l-4 border-gold-500 bg-gold-100 px-4 py-3 text-brand-900">
            {flash.success}
        </div>
    );
}
