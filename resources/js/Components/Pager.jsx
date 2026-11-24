import { Link } from '@inertiajs/react';

export default function Pager({ page }) {
    if (!page || page.last_page <= 1) return null;
    return (
        <div className="mt-8 flex items-center justify-between text-sm">
            {page.prev_page_url ? (
                <Link href={page.prev_page_url} className="rounded-md border border-brand-200 bg-white px-4 py-2 hover:bg-brand-100">← আগের</Link>
            ) : <span />}
            <span className="text-slate-500">পৃষ্ঠা {page.current_page} / {page.last_page}</span>
            {page.next_page_url ? (
                <Link href={page.next_page_url} className="rounded-md border border-brand-200 bg-white px-4 py-2 hover:bg-brand-100">পরের →</Link>
            ) : <span />}
        </div>
    );
}
