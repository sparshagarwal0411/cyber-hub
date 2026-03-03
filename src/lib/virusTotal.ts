const VT_API_KEY = import.meta.env.VITE_VIRUSTOTAL_API_KEY;
const BASE_URL = '/api/vt';

export interface ScanResult {
    id: string;
    type: string;
    links: {
        self: string;
    };
}

export interface AnalysisResult {
    data: {
        attributes: {
            status: string;
            stats: {
                harmless: number;
                type_unsupported: number;
                suspicious: number;
                confirmed_timeout: number;
                failure: number;
                malicious: number;
                undetected: number;
            };
            results: Record<string, any>;
        };
    };
}

const headers = {
    'x-apikey': VT_API_KEY || '',
    'Accept': 'application/json',
};

export const virusTotal = {
    async scanUrl(url: string): Promise<ScanResult> {
        if (!VT_API_KEY || VT_API_KEY === 'your_virustotal_api_key_here') {
            throw new Error('VirusTotal API key is not configured.');
        }

        const formData = new URLSearchParams();
        formData.append('url', url);

        const response = await fetch(`${BASE_URL}/urls`, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to scan URL');
        }

        const result = await response.json();
        return result.data;
    },

    async scanFile(file: File): Promise<ScanResult> {
        if (!VT_API_KEY || VT_API_KEY === 'your_virustotal_api_key_here') {
            throw new Error('VirusTotal API key is not configured.');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BASE_URL}/files`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to scan file');
        }

        const result = await response.json();
        return result.data;
    },

    async getAnalysis(id: string): Promise<AnalysisResult> {
        const response = await fetch(`${BASE_URL}/analyses/${id}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to get analysis');
        }

        return await response.json();
    },

    // Helper to wait for analysis completion
    async waitForAnalysis(id: string, interval = 5000, maxRetries = 10): Promise<AnalysisResult> {
        for (let i = 0; i < maxRetries; i++) {
            const analysis = await this.getAnalysis(id);
            if (analysis.data.attributes.status === 'completed') {
                return analysis;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        throw new Error('Analysis timed out');
    }
};
