import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { User as SupabaseUser, Session} from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

    const fetchProfile = async (uid) => {
        const { data, error } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", uid)
          .single();
    
        if (!error && data?.display_name) {
          setUsername(data.display_name);
        } else {
          setUsername(null);
        }
      };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session ?? null);
            const currentUser = session?.user ?? null;
            setUser(session?.user ?? null);
            setEmail(currentUser?.email ?? null);
            if (currentUser) fetchProfile(currentUser.id);
            setLoading(false);
        });

        const { data: sub } = supabase.auth.onAuthStateChange(async (_, session) => {
            setSession(session ?? null);
            const currentUser = session?.user ?? null;
            setUser(session?.user ?? null);
            setEmail(currentUser?.email ?? null);
            
            if (currentUser) {
                fetchProfile(currentUser.id);
            } else {
                setUser(null);
                setEmail(null);
                setUsername(null);
            }
        });

        return () => sub.subscription.unsubscribe();
    }, []);

    const signIn = (email, password) =>
        supabase.auth.signInWithPassword({ email, password });

    const signUp = (email, password) =>
        supabase.auth.signUp({ email, password });

    const signWithGoogle = async () =>
        await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
        });

    const checkDisplayNameAvailable = async (name) => {
        const res = await fetch(`/functions/v1/check-display-name?name=${encodeURIComponent(name)}`);
        const json = await res.json();
        return json.available;
        };
         

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setEmail(null);
        setUsername(null);
    }

    return { user,email, username, loading, checkDisplayNameAvailable, signIn, signUp, signWithGoogle, signOut, session };
}
