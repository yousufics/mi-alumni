import { Head, Link } from '@inertiajs/react';
import SiteLayout from '../Layouts/SiteLayout';
import Container from '../Components/Container';
import PostCard from '../Components/PostCard';

export default function PostShow({ post, related }) {
    const paragraphs = post.body.split(/\n{2,}/).filter((t) => t.trim() !== '');

    return (
        <SiteLayout>
            <Head title={post.title} />

            <article className="py-12">
                <Container className="max-w-3xl">
                    <Link href="/posts" className="text-sm font-semibold text-brand-700 hover:underline">← সব নিবন্ধ</Link>

                    {post.tag && (
                        <span className="mt-6 block text-sm font-bold uppercase tracking-wider text-gold-600">{post.tag}</span>
                    )}
                    <h1 className="mt-2 text-3xl font-extrabold text-brand-800 md:text-5xl">{post.title}</h1>
                    <div className="mt-3 text-slate-500">{post.date}</div>

                    {post.image && (
                        <img src={post.image} alt="" className="mt-8 w-full rounded-2xl object-cover" />
                    )}

                    <div className="mt-8 grid gap-5 text-lg leading-8 text-slate-700">
                        {paragraphs.map((t, i) => (
                            <p key={i} className="whitespace-pre-line">{t}</p>
                        ))}
                    </div>
                </Container>
            </article>

            {related.length > 0 && (
                <section className="bg-brand-100 py-14">
                    <Container>
                        <h2 className="mb-6 text-2xl font-extrabold text-brand-800">আরও পড়ুন</h2>
                        <div className="grid gap-6 md:grid-cols-3">
                            {related.map((p) => (
                                <PostCard key={p.id} p={p} />
                            ))}
                        </div>
                    </Container>
                </section>
            )}
        </SiteLayout>
    );
}
