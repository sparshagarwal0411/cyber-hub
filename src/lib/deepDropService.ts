import { supabase } from "@/integrations/supabase/client";

// --- Encryption Utilities (AES-GCM) ---
async function generateKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("jwk", key);
    return btoa(JSON.stringify(exported));
}

async function importKey(jwkBase64: string): Promise<CryptoKey> {
    const jwk = JSON.parse(atob(jwkBase64));
    return window.crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

async function encryptData(data: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(data)
    );
    return {
        encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv))
    };
}

async function decryptData(encryptedBase64: string, ivBase64: string, key: CryptoKey): Promise<string> {
    const decoder = new TextDecoder();
    const encrypted = new Uint8Array(atob(encryptedBase64).split("").map(c => c.charCodeAt(0)));
    const iv = new Uint8Array(atob(ivBase64).split("").map(c => c.charCodeAt(0)));
    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encrypted
    );
    return decoder.decode(decrypted);
}

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

        // 1. Generate E2E Key
        const key = await generateKey();
        const { encrypted, iv } = await encryptData(content, key);
        const keyString = await exportKey(key);

        const expires_at = new Date(Date.now() + expiryMinutes * 60000).toISOString();

        // 2. Store encrypted payload and IV (NOT the key)
        const { data, error } = await supabase
            .from('deep_drops')
            .insert({
                user_id: user.id,
                content: JSON.stringify({ payload: encrypted, vector: iv }),
                expires_at
            })
            .select()
            .single();

        if (error) {
            console.error('Deep Drop Error:', error);
            throw new Error("Failed to deploy secure drop to storage.");
        }

        // 3. Return ID + Key (ID will be path, Key will be hash)
        return `${data.id}#${keyString}`;
    },

    async getDrop(compositeId: string): Promise<string> {
        const [id, keyString] = compositeId.split('#');
        if (!id || !keyString) throw new Error("Invalid drop access credentials.");

        // 1. Fetch the encrypted drop
        const { data, error } = await supabase
            .from('deep_drops')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) throw new Error("Drop not found or expired.");
        if (new Date(data.expires_at) < new Date() || data.burned) {
            throw new Error("This drop has self-destructed.");
        }

        // 2. Burn it immediately
        await supabase
            .from('deep_drops')
            .update({ burned: true })
            .eq('id', id);

        // 3. Decrypt locally
        try {
            const { payload, vector } = JSON.parse(data.content);
            const key = await importKey(keyString);
            return await decryptData(payload, vector, key);
        } catch (e) {
            console.error("Decryption failed:", e);
            throw new Error("Encryption mismatch: Unable to verify payload integrity.");
        }
    }
};
