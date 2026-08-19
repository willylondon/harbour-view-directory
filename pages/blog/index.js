import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getAllBlogPosts } from '../../lib/blogPosts';

export async function getStaticProps() {
    return {
        props: {
            posts: getAllBlogPosts(),
        },
        revalidate: 300,
    };
}

export default function BlogIndexPage({ posts }) {
    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Harbour View Blog | Local Guides, Rentals, and Community Search Tips</title>
                <meta name="description" content="Local Harbour View guides covering rentals near CMU, trusted local businesses, food, pharmacies, taxis, and community search tips for Kingston 17." />
                <meta property="og:title" content="Harbour View Blog | Local Guides, Rentals, and Community Search Tips" />
                <meta property="og:description" content="Local guides and evergreen search content for Harbour View, Kingston 17, and the CMU area." />
                <link rel="canonical" href="https://harbourviewdirectory.online/blog" />
            </Head>

            <Navbar publicOnly />

            <main>
                <section className="bg-gradient-to-br from-sky-800 via-sky-700 to-cyan-700 px-6 pb-16 pt-28 text-white">
                    <div className="container-premium max-w-4xl">
                        <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">📝 Local blog</span>
                        <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-6xl">Harbour View guides that answer real local searches.</h1>
                        <p className="mt-5 max-w-3xl text-lg leading-8 text-sky-50/90">
                            Practical content for Harbour View, Kingston 17, and the CMU area — rentals, trusted businesses, local services, and search habits that save time.
                        </p>
                    </div>
                </section>

                <section className="section-spacing px-6">
                    <div className="container-premium">
                        <div className="grid gap-6 lg:grid-cols-3">
                            {posts.map(post => (
                                <article key={post.slug} className="card-premium p-7">
                                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-brand">
                                        <span>{post.publishedAt}</span>
                                        <span>•</span>
                                        <span>{post.readingMinutes} min read</span>
                                    </div>
                                    <h2 className="mt-4 text-2xl font-extrabold text-text leading-tight">
                                        <Link href={`/blog/${post.slug}`} className="hover:text-brand transition">
                                            {post.title}
                                        </Link>
                                    </h2>
                                    <p className="mt-4 text-text-soft leading-7">{post.excerpt}</p>
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <Link href={`/blog/${post.slug}`} className="mt-6 inline-flex items-center font-bold text-brand hover:text-brand-deep transition">
                                        Read article →
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
