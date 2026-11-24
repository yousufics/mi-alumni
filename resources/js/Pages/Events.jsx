import SiteLayout from '../Layouts/SiteLayout';
import PageHead from '../Components/PageHead';
import Container from '../Components/Container';

export default function Events({ events }) {
    return (
        <SiteLayout>
            <PageHead title="ইভেন্ট" subtitle="সভা, পুনর্মিলনী ও কনফারেন্স" />

            <section className="py-16">
                <Container>
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
        </SiteLayout>
    );
}
