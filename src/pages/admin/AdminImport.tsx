import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DownloadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";

// Limpa todas as tags HTML, comentários WP (<!-- wp:paragraph -->) e entidades
const stripHtmlTags = (html: string): string => {
    if (!html) return "";
    return html
        .replace(/<!--[\s\S]*?-->/g, "")     // Remove WP block comments
        .replace(/<[^>]*>/g, "")               // Remove HTML tags
        .replace(/&nbsp;/g, " ")               // Replace &nbsp;
        .replace(/&amp;/g, "&")                // Replace &amp;
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, " ")                  // Normalize whitespace
        .trim();
};

export default function AdminImport() {
    const [file, setFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState({ total: 0, imported: 0, failed: 0 });
    const { settings } = useSettings();

    const triggerCloudflareBuild = () => {
        if (!settings?.cloudflareWebhookUrl) return;
        fetch(settings.cloudflareWebhookUrl, { method: 'POST' })
            .catch(err => console.error("Falha ao acionar webhook da Cloudflare:", err));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setProgress(0);
            setStats({ total: 0, imported: 0, failed: 0 });
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast.error("Por favor, selecione um arquivo XML primeiro.");
            return;
        }

        setIsParsing(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const xmlText = e.target?.result as string;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "application/xml");

                // Basic validation
                if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                    throw new Error("O arquivo não é um XML válido.");
                }

                const allItems = Array.from(xmlDoc.querySelectorAll("item"));

                const getTagText = (node: Element, tag: string, nsTag: string) => {
                    return (node.getElementsByTagName(nsTag)[0]?.textContent || node.getElementsByTagName(tag)[0]?.textContent || "");
                };

                // Map all attachments first to find thumbnail URLs
                const attachmentMap = new Map<string, string>();
                allItems.forEach(item => {
                    const postType = getTagText(item, "post_type", "wp:post_type");
                    if (postType === "attachment") {
                        const postId = getTagText(item, "post_id", "wp:post_id");
                        const url = getTagText(item, "attachment_url", "wp:attachment_url");
                        if (postId && url) {
                            attachmentMap.set(postId, url);
                        }
                    }
                });

                // Filter only published articles
                const posts = allItems.filter(item => {
                    const postType = getTagText(item, "post_type", "wp:post_type");
                    const status = getTagText(item, "status", "wp:status");
                    return postType === "post" && status === "publish";
                });

                setStats(prev => ({ ...prev, total: posts.length }));
                setIsParsing(false);
                setIsImporting(true);

                if (posts.length === 0) {
                    toast.warning("Nenhum artigo publicado (post_type=post e status=publish) encontrado no XML.");
                    setIsImporting(false);
                    return;
                }

                // Process in batches of 50
                const BATCH_SIZE = 50;
                let importedCount = 0;
                let failedCount = 0;

                for (let i = 0; i < posts.length; i += BATCH_SIZE) {
                    const batchItems = posts.slice(i, i + BATCH_SIZE);
                    const batchData = batchItems.map(item => {
                        const rawTitle = item.querySelector("title")?.textContent || "Artigo sem título";
                        const title = stripHtmlTags(rawTitle);
                        const slug = item.querySelector("post_name")?.textContent || title.toLowerCase().replace(/\s+/g, '-');

                        // Use encoded tags for content and excerpt commonly found in WP exports
                        const contentTagArray = Array.from(item.getElementsByTagNameNS("*", "encoded"));
                        const contentNode = contentTagArray.find(node => node.tagName === "content:encoded") || item.querySelector("encoded");
                        const content = contentNode?.textContent || item.querySelector("description")?.textContent || "";

                        // Excerpt
                        const excerptNode = contentTagArray.find(node => node.tagName === "excerpt:encoded");
                        const rawExcerpt = excerptNode?.textContent || content.substring(0, 160);
                        const excerpt = stripHtmlTags(rawExcerpt) + (rawExcerpt.length > 160 ? "..." : "");

                        // Dates
                        const pubDateRaw = getTagText(item, "pubDate", "pubDate") || getTagText(item, "post_date", "wp:post_date") || new Date().toISOString();
                        const publishedAt = new Date(pubDateRaw).toISOString();

                        // Authors
                        const creatorTagArray = Array.from(item.getElementsByTagNameNS("*", "creator"));
                        const author_name = creatorTagArray[0]?.textContent || getTagText(item, "creator", "dc:creator") || "Eband Admin";

                        // Categories and Tags
                        const catElements = Array.from(item.querySelectorAll("category"));
                        let category = "Geral";
                        const tags: string[] = [];

                        catElements.forEach(cat => {
                            const domain = cat.getAttribute("domain");
                            if (domain === "category") category = cat.textContent || "Geral";
                            else if (domain === "post_tag" && cat.textContent) tags.push(cat.textContent);
                        });

                        // Featured Image
                        let featuredImage = "";
                        const postmeta = Array.from(item.getElementsByTagName("wp:postmeta")).concat(Array.from(item.querySelectorAll("postmeta")));
                        postmeta.forEach(meta => {
                            const key = getTagText(meta, "meta_key", "wp:meta_key");
                            const value = getTagText(meta, "meta_value", "wp:meta_value");
                            if (key === "_thumbnail_id" && value) {
                                featuredImage = attachmentMap.get(value) || "";
                            }
                        });

                        if (!featuredImage && content) {
                            const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
                            if (imgMatch && imgMatch[1]) {
                                featuredImage = imgMatch[1];
                            }
                        }

                        return {
                            title,
                            slug,
                            content,
                            excerpt,
                            image_url: featuredImage,
                            category,
                            tags,
                            author_name,
                            published_at: publishedAt,
                            status: "published",
                            article_type: "standard"
                        };
                    });

                    // Insert to Supabase directly
                    const { error } = await supabase
                        .from('posts')
                        .insert(batchData);

                    if (error) {
                        console.error(`Error in batch ${i}:`, error);
                        failedCount += batchData.length;
                    } else {
                        importedCount += batchData.length;
                    }

                    // Update UI Progress safely
                    setStats(prev => ({ ...prev, imported: importedCount, failed: failedCount }));
                    setProgress(Math.round(((i + batchItems.length) / posts.length) * 100));
                }

                toast.success(`Importação finalizada! ${importedCount} artigos inseridos.`);
                if (importedCount > 0) triggerCloudflareBuild();
                setIsImporting(false);
                setFile(null); // Reset
            } catch (err: any) {
                console.error(err);
                toast.error(err.message || "Erro fatal ao ler o XML.");
                setIsParsing(false);
                setIsImporting(false);
            }
        };

        reader.onerror = () => {
            toast.error("Erro ao ler o arquivo selecionado no disco.");
            setIsParsing(false);
            setIsImporting(false);
        };

        reader.readAsText(file);
    };

    return (
        <AdminLayout title="Importar WordPress">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-black font-heading tracking-tight mb-2">Importador WordPress (WXR)</h1>
                    <p className="text-muted-foreground">
                        Migre milhares de conteúdos antigos do seu FTP (Hostinger / cPanel) para a nuvem de banco de dados do Supabase conectada ao front-end do Astro em um único clique sem perda dos links estruturalmente lidos pelo Search Console.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6 h-fit bg-white">
                        <div className="flex items-center gap-3 mb-6 border-b pb-4">
                            <div className="w-10 h-10 rounded-full bg-[#3483FA]/10 flex items-center justify-center text-[#3483FA]">
                                <DownloadCloud className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-heading font-bold text-lg">Faça o Upload do Arquivo</h2>
                                <p className="text-xs text-muted-foreground">Use arquivos do tipo .xml (WP Export)</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <label htmlFor="xml-upload" className="font-medium text-sm">Arquivo Exportado do WP</label>
                                <Input
                                    id="xml-upload"
                                    type="file"
                                    accept=".xml"
                                    onChange={handleFileChange}
                                    disabled={isParsing || isImporting}
                                    className="cursor-pointer"
                                />
                            </div>

                            <Button
                                onClick={handleImport}
                                disabled={!file || isParsing || isImporting}
                                className="w-full bg-[#3483FA] hover:bg-blue-600 text-white font-bold h-12"
                            >
                                {isParsing ? "Lendo Estrutura..." : isImporting ? "Injetando no Banco de Dados..." : "Iniciar Importação Extração Local"}
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gray-50 border-gray-200">
                        <h3 className="font-heading font-bold mb-4">Status da Importação</h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Progresso do Lote Atual (Batches)</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-3" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-center">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Mapeados</p>
                                    <p className="text-3xl font-black">{stats.total}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-center">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Injetados c/ Sucesso</p>
                                    <p className="text-3xl font-black text-green-600 flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" /> {stats.imported}
                                    </p>
                                </div>
                            </div>

                            {stats.failed > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 flex items-start gap-3 mt-4">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-sm">Problemas com alguns artigos</p>
                                        <p className="text-xs mt-1">{stats.failed} artigos falharam ao ser importados, provavelmente por erros de digitação corrompidos na origem ou limites da API.</p>
                                    </div>
                                </div>
                            )}

                            {progress === 100 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-center text-sm font-medium">
                                    Importação de artigos finalizada! O painel da Cloudflare já está processando o servidor Astro final com seus {stats.imported} novos artigos.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
