import { Head, Link } from '@inertiajs/react';
import SiteLayout from '../Layouts/SiteLayout';
import Container from '../Components/Container';
import SectionHead from '../Components/SectionHead';
import PostCard from '../Components/PostCard';
import { btn } from '../Components/ui';

export default function Home({ pillars, about, posts, events, site }) {
    return (
        <SiteLayout>
            <Head title="মূলপাতা" />

            {/* হিরো */}
            <section className="relative overflow-hidden bg-brand-800 pb-20 pt-14 text-white">
                <Container className="grid items-center gap-12 md:grid-cols-[1.15fr_.85fr]">
                    <div className="order-2 md:order-1">
                        <span className="text-sm font-bold uppercase tracking-[0.14em] text-gold-400">
                            প্রতিষ্ঠিত অ্যালামনাই নেটওয়ার্ক · {site.since}
                        </span>
                        <h1 className="mb-5 mt-3 text-4xl font-extrabold md:text-6xl">
                            সাবেক শিক্ষার্থীদের <span className="text-gold-400">এক ছাতার নিচে</span> মিলনমেলা
                        </h1>
                        <p className="max-w-xl text-lg text-white/90">
                            {site.tagline}। জ্ঞান, সেবা ও সৌহার্দ্যের বন্ধনে আমরা একসঙ্গে পথ চলি।
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/membership" className={`${btn.base} ${btn.gold}`}>সদস্য হোন</Link>
                            <Link href="/about" className={`${btn.base} ${btn.ghost}`}>আমাদের সম্পর্কে জানুন</Link>
                        </div>
                    </div>

                    <div className="order-1 justify-self-center md:order-2">
                        <div className="aspect-[4/5] w-64 rounded-t-full rounded-b-2xl bg-gold-500 p-2.5 sm:w-80">
                            <div className="grid h-full w-full place-items-center overflow-hidden rounded-t-full rounded-b-lg bg-white">
                                <img src="/logo/logo.png" alt="M. I Alumni Association লোগো" className="w-[92%]" />
                            </div>
                        </div>
                    </div>
                </Container>
                <div className="absolute inset-x-0 bottom-0 h-8 rounded-t-[50%] bg-brand-50" />
            </section>

            {/* চার স্তম্ভ */}
            <section className="py-16">
                <Container>
                    <SectionHead
                        eyebrow="Our Pillars"
                        title="আমাদের চার স্তম্ভ"
                        text="অ্যালামনাই অ্যাসোসিয়েশনের সকল কার্যক্রম গড়ে উঠেছে এই চারটি মূল লক্ষ্যকে ঘিরে।"
                    />
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {pillars.map((p, i) => (
                            <div key={p.title} className="rounded-2xl border border-brand-200 bg-white p-6">
                                <div className="mb-4 grid h-11 w-11 place-items-center rounded-t-full rounded-b-md bg-gold-100 font-bold text-gold-600">
                                    {['১', '২', '৩', '৪'][i]}
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-brand-800">{p.title}</h3>
                                <p className="text-[15.5px] text-slate-600">{p.text}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* পরিচয় */}
            <section className="bg-brand-100 py-16">
                <Container className="grid items-center gap-10 md:grid-cols-2">
                    <div>
                        <SectionHead eyebrow="About Us" title="আমাদের সম্পর্কে" />
                        <p className="-mt-6 mb-6 text-slate-700">{about}</p>
                        <Link href="/about" className={`${btn.base} ${btn.teal}`}>বিস্তারিত জানুন</Link>
                    </div>
                    <blockquote className="rounded-2xl border-l-4 border-gold-500 bg-white p-8 font-display text-xl leading-relaxed text-brand-800">
                        একসঙ্গে পথ চলার মধ্য দিয়েই আমরা নিজেদের, প্রতিষ্ঠানের এবং সমাজের জন্য আরও বেশি কিছু করতে পারি।
                    </blockquote>
                </Container>
            </section>

            {/* আসন্ন আয়োজন */}
            <section className="py-16">
                <Container>
                    <SectionHead eyebrow="Upcoming" title="আসন্ন আয়োজন" />
                    <div className="grid gap-5 md:grid-cols-2">
                        {events.map((e) => (
                            <div key={e.title} className="rounded-2xl border border-brand-200 bg-white p-6">
                                <div className="mb-2 text-sm font-semibold text-gold-600">{e.date}</div>
                                <h3 className="text-xl font-bold text-brand-800">{e.title}</h3>
                                <p className="mt-1 text-sm text-slate-500">📍 {e.place}</p>
                                <p className="mt-3 text-slate-600">{e.text}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* সর্বশেষ নিবন্ধ */}
            <section className="bg-brand-100 py-16">
                <Container>
                    <SectionHead eyebrow="Latest" title="সর্বশেষ সংবাদ" />
                    <div className="grid gap-6 md:grid-cols-3">
                        {posts.map((p) => (
                            <PostCard key={p.id} p={p} />
                        ))}
                    </div>
                    <div className="mt-8">
                        <Link href="/posts" className={`${btn.base} ${btn.teal}`}>সব নিবন্ধ দেখুন</Link>
                    </div>
                </Container>
            </section>

            {/* সদস্য আহ্বান */}
            <section className="bg-brand-800 py-14 text-white">
                <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-2xl font-extrabold md:text-3xl">আপনিও যুক্ত হোন আমাদের পরিবারে</h2>
                        <p className="mt-2 text-white/85">অনলাইনে ফরম পূরণ করে সদস্যপদের আবেদন করুন।</p>
                    </div>
                    <Link href="/membership" className={`${btn.base} ${btn.gold}`}>সদস্যপদের আবেদন</Link>
                </Container>
            </section>
        </SiteLayout>
    );
}
