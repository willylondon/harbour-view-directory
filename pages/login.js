import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
            <Head><title>Login | Harbour View Directory</title></Head>
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 card-premium overflow-hidden">
                <div className="bg-gradient-to-br from-brand-deep to-brand p-10 flex flex-col justify-center text-white">
                    <Link href="/" className="text-2xl font-extrabold mb-6">🏘️ Harbour View</Link>
                    <h2 className="text-3xl font-extrabold mb-4">Welcome back!</h2>
                    <p className="text-white/80 mb-8 leading-relaxed">Log in to manage your business listings, track performance, and connect with the Harbour View community.</p>
                    <div className="space-y-4 text-sm text-white/70">
                        <div className="flex items-center gap-3"><span>✅</span> Manage your listings</div>
                        <div className="flex items-center gap-3"><span>✅</span> Respond to community reviews</div>
                        <div className="flex items-center gap-3"><span>✅</span> Connect with Harbour View customers</div>
                    </div>
                </div>
                <div className="p-10">
                    <h1 className="text-2xl font-extrabold text-text mb-2">Sign In</h1>
                    <p className="text-text-soft text-sm mb-8">Enter your email and password to continue.</p>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-btn mb-4 text-sm">{error}</div>}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-text mb-1">Email</label>
                            <input id="email" type="email" required value={email} autoComplete="email"
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text" />
                        </div>
                        <PasswordInput id="password" value={password} onChange={e => setPassword(e.target.value)} />
                        <button type="submit" disabled={loading}
                            className="w-full bg-brand text-white font-bold py-3 rounded-btn hover:bg-brand-deep transition disabled:opacity-50">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-text-soft text-sm">
                        Don't have an account? <Link href="/register" className="text-brand font-bold hover:underline">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
