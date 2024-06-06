import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [token, setToken] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedSession = localStorage.getItem('supabase.auth.token');
        if (savedSession) {
            const session = JSON.parse(savedSession);
            setUser(session.user);
            queryGitUserToken(session.user.id);
        }
    }, []);

    const signIn = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error, data: session } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage('Could not authenticate user');
        } else {
            setMessage('Successfully signed in');
            if (session) {
                localStorage.setItem('supabase.auth.token', JSON.stringify(session));
                setUser(session.user);
                queryGitUserToken(session.user.id);
            }
        }
    };

    const signUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage('Could not sign up user');
        } else {
            setMessage('Check email to continue sign-in process');
        }
    };

    const queryGitUserToken = async (userId: string) => {
        const { data, error } = await supabase
            .from('git_user')
            .select('token')
            .eq('user_id', userId)
            .single();

        if (error) {
            setMessage('Could not fetch token');
        } else {
            setToken(data.token);
            setMessage('Token fetched successfully');
        }
    };

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            {user ? (
                <div>
                    <h1>Hello, {user.email}</h1>
                    {token && (
                        <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
                            Token: {token}
                        </p>
                    )}
                </div>
            ) : (
                <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
                    <label className="text-md" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border mb-6"
                        name="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label className="text-md" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border mb-6"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        onClick={signIn}
                        className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={signUp}
                        className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
                    >
                        Sign Up
                    </button>
                    {message && (
                        <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
                            {message}
                        </p>
                    )}
                </form>
            )}
        </div>
    );
};

export default Login;
