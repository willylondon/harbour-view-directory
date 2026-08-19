import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getAllBlogPosts, getBlogPostBySlug } from '../../lib/blogPosts';

export async function getStaticPaths() {
    const paths = getAllBlogPosts().map(post => ({ params: { slug: post.slug } }));

    return {
        paths,
        fallback: false,
    };
}

export async function getStaticProps({ params }) {
    const post = getBlogPostBySlug(params.slug);

    if (!post) {
        return { notFound: true };
    }

    return {
        props: {
            post,
        },
        revalidate: 300,
    };
}

export default function BlogPostPage({ post }) {
    const articleUrl = `https://harbourviewdirectory.online/blog/${post.slug}`;
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        mainEntityOfPage: articleUrl,
        author: {
            '@type': 'Organization',
            name: 'Harbour View Directory',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Harbour View Directory',
        },
        keywords: post.keywords.join(', '),
    };

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>{post.title} | Harbour View Directory</title>
                <meta name="description" content={post.description} />
                <meta property="og:title" content={`${post.title} | Harbour View Directory`} />
                <meta property="og:description" content={post.description} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={articleUrl} />
                <link rel="canonical" href={articleUrl} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            </Head>

            <Navbar publicOnly />

            <main className="pt-24 pb-16 px-6">
                <article className="container-premium max-w-3xl">
                    <nav className="mb-8 text-sm text-text-muted">
                        <Link href="/" className="hover:text-brand transition">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/blog" className="hover:text-brand transition">Blog</Link>
                    </nav>

                    <header className="mb-10">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wide text-brand">
                            <span>{post.publishedAt}</span>
                            <span>•</span>
                            <span>{post.readingMinutes} min read</span>
                        </div>
                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-text md:text-5xl">{post.title}</h1>
                        <p className="mt-5 text-lg leading-8 text-text-soft">{post.intro}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                                <span key={tag} className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </header>

                    <div className="space-y-10">
                        {post.sections.map(section => (
                            <section key={section.heading} className="card-premium p-7 md:p-8">
                                <h2 className="text-2xl font-extrabold text-text">{section.heading}</h2>
                                <div className="mt-4 space-y-4 text-base leading-8 text-text-soft">
                                    {section.paragraphs.map(paragraph => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                </div>
                                {section.bullets?.length > 0 && (
                                    <ul className="mt-5 space-y-3 text-text-soft list-disc list-outside pl-5">
                                        {section.bullets.map(item => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        ))}
                    </div>

                    {post.internalLinks?.length > 0 && (
                        <section className="mt-10 card-premium p-7 md:p-8">
                            <h2 className="text-2xl font-extrabold text-text">Keep exploring this topic</h2>
                            <p className="mt-3 text-text-soft leading-7">These pages are the strongest next steps if you want to move from reading into real Harbour View listings.</p>
                            <div className="mt-6 grid gap-3 md:grid-cols-3">
                                {post.internalLinks.map(link => (
                                    <Link key={link.href} href={link.href} className="rounded-[1.2rem] bg-bg-alt px-5 py-4 text-sm font-bold text-text transition hover:bg-brand-soft hover:text-brand">
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="mt-10 rounded-[1.5rem] bg-slate-950 p-8 text-white shadow-elevated">
                        <h2 className="text-2xl font-extrabold">Why this matters for Harbour View traffic</h2>
                        <p className="mt-4 text-sm leading-7 text-slate-300">{post.closing}</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/directory" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 hover:bg-sky-50 transition">Search directory</Link>
                            <Link href="/rent-near-cmu" className="rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15 transition">View rentals</Link>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
