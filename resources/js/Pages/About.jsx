import SiteLayout from '../Layouts/SiteLayout';
import PageHead from '../Components/PageHead';
import Container from '../Components/Container';
import SectionHead from '../Components/SectionHead';

export default function About({ about, pillars }) {
    return (
        <SiteLayout>
            <PageHead title="আমাদের সম্পর্কে" subtitle="এম. আই. অ্যালামনাই অ্যাসোসিয়েশন" />

            <section className="py-16">
                <Container className="grid gap-10 md:grid-cols-2">
                    <div>
                        <SectionHead eyebrow="Introduction" title="পরিচয়" />
                        <p className="-mt-6 text-slate-700">{about.intro}</p>
                    </div>
                    <div className="grid gap-5">
                        <div className="rounded-2xl border border-brand-200 bg-white p-6">
                            <h3 className="mb-2 text-xl font-bold text-brand-800">আমাদের লক্ষ্য</h3>
                            <p className="text-slate-600">{about.mission}</p>
                        </div>
                        <div className="rounded-2xl border border-brand-200 bg-white p-6">
                            <h3 className="mb-2 text-xl font-bold text-brand-800">আমাদের স্বপ্ন</h3>
                            <p className="text-slate-600">{about.vision}</p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="bg-brand-100 py-16">
                <Container className="grid gap-10 md:grid-cols-2">
                    <div>
                        <SectionHead eyebrow="What We Do" title="আমাদের কার্যক্রম" />
                        <ul className="-mt-4 grid gap-3">
                            {about.activities.map((a) => (
                                <li key={a} className="flex gap-3">
                                    <span className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-gold-500" />
                                    <span>{a}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {pillars.map((p) => (
                            <div key={p.title} className="rounded-2xl border border-brand-200 bg-white p-6">
                                <h3 className="mb-2 text-lg font-bold text-brand-800">{p.title}</h3>
                                <p className="text-[15.5px] text-slate-600">{p.text}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>
        </SiteLayout>
    );
}
