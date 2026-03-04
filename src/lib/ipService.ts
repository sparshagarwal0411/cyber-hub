export interface IPInfo {
    ip: string;
    city: string;
    region: string;
    country_name: string;
    org: string;
    postal: string;
    latitude: number;
    longitude: number;
    asn: string;
    risk_score: number;
    threats: string[];
}

export const ipService = {
    async scanIP(ip: string): Promise<IPInfo> {
        try {
            // Using ipapi.co for free geolocation data (limited rate)
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            if (!response.ok) throw new Error('Failed to fetch IP intelligence');
            const data = await response.json();

            if (data.error) throw new Error(data.reason || 'Invalid IP or rate limit reached');

            // Simulated Security Intel (in a real app, use an API like IPQualityScore or AbuseIPDB)
            const risk_score = Math.floor(Math.random() * 100);
            const threats = [];
            if (risk_score > 70) threats.push("Known Malicious Proxy", "High Spam Reputation");
            if (risk_score > 40 && risk_score <= 70) threats.push("Data Center / VPN Range");
            if (risk_score <= 40) threats.push("Residential Node (Likely Safe)");

            return {
                ip: data.ip,
                city: data.city,
                region: data.region,
                country_name: data.country_name,
                org: data.org,
                postal: data.postal,
                latitude: data.latitude,
                longitude: data.longitude,
                asn: data.asn,
                risk_score,
                threats
            };
        } catch (error: any) {
            console.error('IP Scan Error:', error);
            throw new Error(error.message || 'Identity of network endpoint could not be resolved.');
        }
    }
};
