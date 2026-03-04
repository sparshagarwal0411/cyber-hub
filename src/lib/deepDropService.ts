import { supabase } from "@/integrations/supabase/client";

export interface DeepDropRecord {
    id: string;
    content: string;
    expires_at: string;
    burned: boolean;
}

export const deepDropService = {
    async createDrop(content: string, expiryMinutes: number = 30): Promise<string> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required for secure drops");

        const expires_at = new Date(Date.now() + expiryMinutes * 60000).toISOString();

        // Note: This expects a 'deep_drops' table in Supabase.
        // If the table doesn't exist, this will fail. We'll handle it gracefully.
        const { data, error } = await supabase
            .from('deep_drops')
            .insert({
                user_id: user.id,
                content, // In a high-sec app, this would be encrypted client-side first
                expires_at
            })
            .select()
            .single();

        if (error) {
            console.error('Deep Drop Error:', error);
            if (error.code === 'PGRST116' || error.message.includes('not found')) {
                throw new Error("Deep Drop storage system is not initialized. Please contact administrator.");
            }
            throw error;
        }

        return data.id;
    },

    async getDrop(id: string): Promise<string> {
        // 1. Fetch the drop
        const { data, error } = await supabase
            .from('deep_drops')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) throw new Error("Drop not found or expired.");

        // 2. Check expiry
        if (new Date(data.expires_at) < new Date() || data.burned) {
            throw new Error("This drop has self-destructed.");
        }

        // 3. Mark as burned
        await supabase
            .from('deep_drops')
            .update({ burned: true })
            .eq('id', id);

        return data.content;
    }
};
