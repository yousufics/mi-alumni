import { Head } from '@inertiajs/react';
import Container from './Container';

export default function PageHead({ title, subtitle }) {
    return (
        <>
            <Head title={title} />
            <section className="bg-brand-800 py-14 text-white">
                <Container>
                    <h1 className="text-3xl font-extrabold md:text-5xl">{title}</h1>
                    {subtitle && <p className="mt-3 max-w-2xl text-white/85">{subtitle}</p>}
                    <div className="mt-6 h-1 w-20 rounded bg-gold-400" />
                </Container>
            </section>
        </>
    );
}
