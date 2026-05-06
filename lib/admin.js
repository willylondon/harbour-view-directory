import { supabase } from './supabase';

export async function getUserRole(userId) {
    try {
        const { data } = await supabase
            .from('profiles')
            .select('role, is_admin')
            .eq('id', userId)
            .single();
        if (data?.role === 'admin' || data?.is_admin === true) return 'admin';
        return 'user';
    } catch {
        return null;
    }
}

export async function isAdmin(userId) {
    const role = await getUserRole(userId);
    return role === 'admin';
}

export async function requireAuth(context) {
    const { data: { session } } = await supabase.auth.getSession(
        context?.req?.cookies
    );

    if (!session) {
        return { redirect: { destination: '/login', permanent: false } };
    }
    return { session };
}

export async function requireAdmin(context) {
    const result = await requireAuth(context);
    if (result.redirect) return result;

    const admin = await isAdmin(result.session.user.id);
    if (!admin) {
        return {
            redirect: { destination: '/dashboard', permanent: false },
            props: {}
        };
    }
    return { session: result.session, isAdmin: true };
}
