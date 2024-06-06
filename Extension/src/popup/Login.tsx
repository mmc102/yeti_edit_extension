import React, { useState } from 'react';
import { supabase } from './SupabaseClient';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const signIn = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {

            console.log(error)
            setMessage(error);
        } else {
            setMessage('Successfully signed in');
        }
    };

    const signUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            console.log(error)
            setMessage('Could not sign up user');
        } else {
            setMessage('Check email to continue sign-in process');
        }
    };

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
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
        </div>
    );
};

export default Login;
