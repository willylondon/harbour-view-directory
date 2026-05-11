import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleReset(e) {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://harbourviewdirectory.online/login',
            });
            if (resetError) throw resetError;
            setMessage('Password reset instructions have been sent if that email is registered.');
        } catch (err) {
            setError(err.message || 'Unable to send password reset instructions right now.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
            <Head>
                <title>Forgot Password | Harbour View Directory</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="w-full max-w-md card-premium p-8">
                <Link href="/" className="text-xl font-extrabold text-text">Harbour View</Link>
                <h1 className="mt-8 text-2xl font-extrabold text-text">Reset your password</h1>
                <p className="mt-2 text-sm leading-6 text-text-soft">Enter your account email and we will send password reset instructions.</p>
                {error && <div className="mt-5 rounded-btn bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</div>}
                {message && <div className="mt-5 rounded-btn bg-success-soft p-3 text-sm font-semibold text-success">{message}</div>}
                <form onSubmit={handleReset} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="reset-email" className="block text-sm font-bold text-text mb-1">Email</label>
                        <input
                            id="reset-email"
                            type="email"
                            required
                            value={email}
                            autoComplete="email"
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-brand text-white font-bold py-3 rounded-btn hover:bg-brand-deep transition disabled:opacity-50">
                        {loading ? 'Sending...' : 'Send reset instructions'}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-text-soft">
                    Remembered it? <Link href="/login" className="font-bold text-brand hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
