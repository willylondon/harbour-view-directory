import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Head from 'next/head';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleRegister(e) {
        e.preventDefault();
        setError(null);
        setMsg(null);
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            setMsg('Success! Check your email to confirm your account.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
            <Head><title>Register | Harbour View Directory</title></Head>
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 card-premium overflow-hidden">
                <div className="bg-gradient-to-br from-brand-deep to-brand p-10 flex flex-col justify-center text-white">
                    <Link href="/" className="text-2xl font-extrabold mb-6">🏘️ Harbour View</Link>
                    <h2 className="text-3xl font-extrabold mb-4">Join the directory!</h2>
                    <p className="text-white/80 mb-8 leading-relaxed">Create an account to list your business, promote events, and grow your presence in Harbour View.</p>
                    <div className="space-y-4 text-sm text-white/70">
                        <div className="flex items-center gap-3"><span>✅</span> Free business listing</div>
                        <div className="flex items-center gap-3"><span>✅</span> Premium upgrade options</div>
                        <div className="flex items-center gap-3"><span>✅</span> Community visibility</div>
                    </div>
                </div>
                <div className="p-10">
                    <h1 className="text-2xl font-extrabold text-text mb-2">Create Account</h1>
                    <p className="text-text-soft text-sm mb-8">Start with a free account. No credit card required.</p>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-btn mb-4 text-sm">{error}</div>}
                    {msg && <div className="bg-success-soft text-success p-3 rounded-btn mb-4 text-sm font-medium">{msg}</div>}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-text mb-1">Email</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text mb-1">Password</label>
                            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text" />
                            <p className="text-xs text-text-muted mt-1">At least 6 characters</p>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-brand-warm text-white font-bold py-3 rounded-btn hover:bg-amber-500 transition disabled:opacity-50">
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-text-soft text-sm">
                        Already have an account? <Link href="/login" className="text-brand font-bold hover:underline">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
