import { supabase } from "@/integrations/supabase/client";

export interface ScanHistory {
    id: string;
    type: 'URL' | 'PDF' | 'Visual';
    target: string;
    risk: string;
    result_details: string;
    created_at: string;
}

export interface UserStats {
    total_scans: number;
    pdf_scans: number;
    url_scans: number;
    visual_scans: number;
}

export interface UserProfile {
    avatar_url: string | null;
}

export interface VaultEntry {
    id: string;
    service_name: string;
    password: string;
    created_at: string;
}

export const profileService = {
    async logScan(type: 'URL' | 'PDF' | 'Visual', target: string, risk: string, details: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // Log the scan
            await supabase.from('scans').insert({
                user_id: user.id,
                type,
                target,
                risk,
                result_details: details
            });

            // Increment stats using the RPC function
            await supabase.rpc('increment_scan_stats', {
                u_id: user.id,
                s_type: type
            });
        } catch (error) {
            console.error('Error logging scan:', error);
        }
    },

    async getStats(): Promise<UserStats> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching stats:', error);
            return { total_scans: 0, pdf_scans: 0, url_scans: 0, visual_scans: 0 };
        }

        if (!data) {
            return { total_scans: 0, pdf_scans: 0, url_scans: 0, visual_scans: 0 };
        }

        return {
            total_scans: data.total_scans,
            pdf_scans: data.pdf_scans,
            url_scans: data.url_scans,
            visual_scans: data.visual_scans
        };
    },

    async getHistory(): Promise<ScanHistory[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('scans')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching history:', error);
            return [];
        }

        return data as ScanHistory[];
    },

    async getProfile(): Promise<UserProfile | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return data;
    },

    async uploadAvatar(file: File): Promise<string> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}-${Math.random()}.${fileExt}`;

        // 1. Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // 3. Update profiles table
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
            .eq('id', user.id);

        if (updateError) throw updateError;

        return publicUrl;
    },

    async saveToVault(service: string, pass: string, code: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
            .from('vault_entries')
            .insert({
                user_id: user.id,
                service_name: service,
                password: pass,
                access_code: code
            });

        if (error) throw error;
    },

    async getVaultEntries(code: string): Promise<VaultEntry[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('vault_entries')
            .select('id, service_name, password, created_at')
            .eq('user_id', user.id)
            .eq('access_code', code);

        if (error) {
            console.error('Error fetching vault entries:', error);
            return [];
        }

        return data as VaultEntry[];
    },

    async deleteVaultEntry(id: string) {
        const { error } = await supabase
            .from('vault_entries')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
