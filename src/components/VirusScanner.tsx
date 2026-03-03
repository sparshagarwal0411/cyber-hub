import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { AlertCircle, CheckCircle2, ShieldAlert, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { virusTotal, AnalysisResult } from '@/lib/virusTotal';
import { toast } from 'sonner';

const VirusScanner = () => {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [activeTab, setActiveTab] = useState('url');

    const handleUrlScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsScanning(true);
        setAnalysis(null);
        try {
            const scan = await virusTotal.scanUrl(url);
            const result = await virusTotal.waitForAnalysis(scan.id);
            setAnalysis(result);
            toast.success('URL scan completed');
        } catch (error: any) {
            toast.error(error.message || 'Failed to scan URL');
        } finally {
            setIsScanning(false);
        }
    };

    const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setAnalysis(null);
        try {
            const scan = await virusTotal.scanFile(file);
            const result = await virusTotal.waitForAnalysis(scan.id);
            setAnalysis(result);
            toast.success('File scan completed');
        } catch (error: any) {
            toast.error(error.message || 'Failed to scan file');
        } finally {
            setIsScanning(false);
        }
    };

    const AnalysisStats = ({ stats }: { stats: AnalysisResult['data']['attributes']['stats'] }) => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                <ShieldAlert className={`w-8 h-8 ${stats.malicious > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                <span className="text-2xl font-bold mt-2">{stats.malicious}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Malicious</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                <AlertCircle className={`w-8 h-8 ${stats.suspicious > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                <span className="text-2xl font-bold mt-2">{stats.suspicious}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Suspicious</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold mt-2">{stats.harmless}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Harmless</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                <ShieldAlert className="w-8 h-8 text-muted-foreground" />
                <span className="text-2xl font-bold mt-2">{stats.undetected}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Undetected</span>
            </div>
        </div>
    );

    return (
        <Card className="w-full max-w-2xl mx-auto border-primary/20 bg-background/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6 text-primary" />
                    Threat Scanner
                </CardTitle>
                <CardDescription>
                    Powered by VirusTotal. Scan URLs or files for potential threats.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="url" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="url" className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" /> URL
                        </TabsTrigger>
                        <TabsTrigger value="file" className="flex items-center gap-2">
                            <Upload className="w-4 h-4" /> File
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="url">
                        <form onSubmit={handleUrlScan} className="flex gap-2">
                            <Input
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isScanning}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={isScanning || !url}>
                                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Scan URL'}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="file">
                        <div className="grid w-full max-w-sm items-center gap-1.5 mx-auto">
                            <label
                                htmlFor="file-upload"
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isScanning ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
                                    }`}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {isScanning ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileScan}
                                    disabled={isScanning}
                                />
                            </label>
                        </div>
                    </TabsContent>
                </Tabs>

                {isScanning && (
                    <div className="mt-8 space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Scanning for threats...</span>
                            <span>This may take a few moments</span>
                        </div>
                        <Progress value={undefined} className="h-1" />
                    </div>
                )}

                {analysis && (
                    <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-primary/10">
                            <div className={`p-2 rounded-full ${analysis.data.attributes.stats.malicious > 0 ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'
                                }`}>
                                {analysis.data.attributes.stats.malicious > 0 ? <ShieldAlert className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg">
                                    {analysis.data.attributes.stats.malicious > 0
                                        ? 'Threats Detected'
                                        : 'Clean Result'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Analyzed by {Object.keys(analysis.data.attributes.results).length} security engines
                                </p>
                            </div>
                        </div>
                        <AnalysisStats stats={analysis.data.attributes.stats} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default VirusScanner;
