import SiteLayout from '../Layouts/SiteLayout';
import PageHead from '../Components/PageHead';
import Container from '../Components/Container';
import PostCard from '../Components/PostCard';
import Pager from '../Components/Pager';

export default function Posts({ posts }) {
    return (
        <SiteLayout>
            <PageHead title="নিবন্ধ" subtitle="সংবাদ, ঘোষণা ও লেখালেখি" />

            <section className="py-16">
                <Container>
                    {posts.data.length === 0 ? (
                        <p className="text-slate-500">এখনও কোনো নিবন্ধ প্রকাশিত হয়নি।</p>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.data.map((p) => (
                                <PostCard key={p.id} p={p} />
                            ))}
                        </div>
                    )}
                    <Pager page={posts} />
                </Container>
            </section>
        </SiteLayout>
    );
}
