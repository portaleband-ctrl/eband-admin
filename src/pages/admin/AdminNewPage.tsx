import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, ArrowLeft, Eye, Sparkles } from "lucide-react";
import { usePages } from "@/hooks/usePages";
import { useSettings } from "@/hooks/useSettings";
import { generateArticleContent } from "@/lib/openai";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

const AdminNewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addPage, updatePage, pages, isLoading } = usePages();
    const { settings } = useSettings();

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [showInMenu, setShowInMenu] = useState(false);
    const [showInFooter, setShowInFooter] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        if (id && !isLoading) {
            const page = pages.find(p => p.id === id);
            if (page) {
                setTitle(page.title);
                setSlug(page.slug);
                setContent(page.content);
                setShowInMenu(page.show_in_menu);
                setShowInFooter(page.show_in_footer || false);
            }
        }
    }, [id, pages, isLoading]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        if (!id) {
            setSlug(val.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-"));
        }
    };

    const handleSave = async () => {
        if (!title || !content || !slug) {
            toast.error("Preencha título, slug e conteúdo.");
            return;
        }

        setIsSaving(true);
        try {
            if (id) {
                await updatePage(id, { title, slug, content, show_in_menu: showInMenu, show_in_footer: showInFooter });
                toast.success("Página atualizada!");
            } else {
                await addPage({ title, slug, content, show_in_menu: showInMenu, show_in_footer: showInFooter, status: 'published' });
            }
            navigate("/admin/paginas");
        } catch (error) {
            // Handled in hook
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateAI = async () => {
        if (!title) {
            toast.error("Digite um título para a IA saber sobre o que escrever.");
            return;
        }
        if (!settings.openAiApiKey) {
            toast.error("Configure sua API Key da OpenAI primeiro.");
            return;
        }

        setIsGenerating(true);
        const loadingToast = toast.loading("Gerando conteúdo da página...");
        try {
            const generated = await generateArticleContent({
                apiKey: settings.openAiApiKey,
                title: `Página estática sobre: ${title}`,
                type: 'standard',
                wordCount: '600',
                includeProducts: false,
                customStandardPrompt: "Esta é uma página institucional do blog (ex: Sobre, Contato, Missão). Escreva um texto profissional e acolhedor."
            });
            setContent(generated);
            toast.dismiss(loadingToast);
            toast.success("Conteúdo gerado!");
        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AdminLayout title={id ? "Editar Página" : "Nova Página"}>
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin/paginas")}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-xl font-bold">{id ? "Editando página" : "Configurações da página"}</h2>
                </div>

                <Card className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Label htmlFor="title">Título da Página</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="Ex: Sobre Nós"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="slug">Caminho (URL)</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">/</span>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                    placeholder="sobre-nos"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-accent/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Mostrar no Menu?</Label>
                                <p className="text-[10px] text-muted-foreground">Exibe um link no menu principal do blog.</p>
                            </div>
                            <Switch checked={showInMenu} onCheckedChange={setShowInMenu} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-accent/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Mostrar no Rodapé?</Label>
                                <p className="text-[10px] text-muted-foreground">Exibe um link no rodapé (footer) do blog.</p>
                            </div>
                            <Switch checked={showInFooter} onCheckedChange={setShowInFooter} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <Label htmlFor="content">Conteúdo (HTML)</Label>
                            <Button variant="ghost" size="sm" onClick={handleGenerateAI} disabled={isGenerating} className="text-accent hover:text-accent hover:bg-accent/5">
                                <Sparkles className={`w-3 h-3 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                                Gerar com IA
                            </Button>
                        </div>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Escreva o conteúdo da sua página em HTML..."
                            rows={15}
                            className="font-mono text-sm"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                            <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
                            {isSaving ? "Salvando..." : id ? "Atualizar Página" : "Publicar Página"}
                        </Button>

                        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Eye className="w-4 h-4" /> Pré-visualizar
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Pré-visualização: {title}</DialogTitle>
                                </DialogHeader>
                                <div className="prose-blog max-w-none pt-4">
                                    <div className="ai-article-container" dangerouslySetInnerHTML={{ __html: content || "<p className='text-muted-foreground italic'>Sem conteúdo para exibir.</p>" }} />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminNewPage;
