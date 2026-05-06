import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { requireAdmin } from '../lib/admin';

export async function getServerSideProps(context) {
    const result = await requireAdmin(context);
    if (result.redirect) return result;
    return { props: { user: { email: result.session.user.email } } };
}

export default function AdminPage({ user }) {
    return (
        <div className="min-h-screen bg-bg">
            <Head><title>Admin Panel | Harbour View Directory</title></Head>
            <Navbar />
            <main className="container-premium pt-28 pb-16">
                <div className="card-premium p-8 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="bg-brand-warm text-white text-xs font-bold px-3 py-1.5 rounded-full">Admin</span>
                        <h1 className="text-3xl font-extrabold text-text">Admin Panel</h1>
                    </div>
                    <p className="text-text-soft mb-6">Logged in as <strong>{user.email}</strong></p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="card-premium p-6">
                            <h3 className="font-bold text-text mb-3">Pending Approvals</h3>
                            <p className="text-sm text-text-muted">Review and approve new vendor listings and events.</p>
                        </div>
                        <div className="card-premium p-6">
                            <h3 className="font-bold text-text mb-3">Manage Vendors</h3>
                            <p className="text-sm text-text-muted">View, edit, feature, or remove vendor listings.</p>
                        </div>
                        <div className="card-premium p-6">
                            <h3 className="font-bold text-text mb-3">Manage Events</h3>
                            <p className="text-sm text-text-muted">Approve, feature, or remove community events.</p>
                        </div>
                        <div className="card-premium p-6">
                            <h3 className="font-bold text-text mb-3">Site Settings</h3>
                            <p className="text-sm text-text-muted">Configure directory settings, featured content, and more.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
