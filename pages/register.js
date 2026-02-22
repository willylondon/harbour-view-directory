import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    async function handleRegister(e) {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            setMsg('Check your email to confirm your account!');
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-card px-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-md">
                <h1 className="text-3xl font-black text-center text-gray-900 mb-8">Register</h1>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
                {msg && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{msg}</div>}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                            value={password} onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-brand-yellow text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-400 transition shadow-sm">
                        Create Account
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-600 text-sm">
                    Already have an account? <Link href="/login" className="text-brand-blue font-bold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
