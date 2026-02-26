import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, Globe, FileText, Menu as MenuIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { usePages } from "@/hooks/usePages";
import { Badge } from "@/components/ui/badge";

const AdminPages = () => {
    const { pages, isLoading, deletePage, updatePage } = usePages();

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Excluir a página "${title}"?`)) {
            await deletePage(id);
        }
    };

    const toggleMenu = async (id: string, current: boolean) => {
        await updatePage(id, { show_in_menu: !current });
    };

    const toggleFooter = async (id: string, current: boolean) => {
        await updatePage(id, { show_in_footer: !current });
    };

    if (isLoading) {
        return (
            <AdminLayout title="Páginas">
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Páginas">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">Gerencie as páginas estáticas do seu blog (Sobre, Contato, etc).</p>
                    <Button asChild>
                        <Link to="/admin/paginas/nova">
                            <Plus className="w-4 h-4 mr-2" /> Nova Página
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4">
                    {pages.length > 0 ? (
                        pages.map((page) => (
                            <Card key={page.id} className="p-4 flex items-center justify-between group hover:border-accent/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{page.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-muted-foreground">/{page.slug}</p>
                                            {page.show_in_menu && (
                                                <Badge variant="secondary" className="text-[9px] bg-green-100 text-green-700 hover:bg-green-100 px-1.5 h-4">
                                                    <MenuIcon className="w-2.5 h-2.5 mr-1" /> No Menu
                                                </Badge>
                                            )}
                                            {page.show_in_footer && (
                                                <Badge variant="secondary" className="text-[9px] bg-blue-100 text-blue-700 hover:bg-blue-100 px-1.5 h-4">
                                                    <Globe className="w-2.5 h-2.5 mr-1" /> No Rodapé
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`gap-2 ${page.show_in_menu ? 'text-green-600' : 'text-muted-foreground'}`}
                                        onClick={() => toggleMenu(page.id, page.show_in_menu)}
                                        title={page.show_in_menu ? "Remover do menu" : "Exibir no menu"}
                                    >
                                        <MenuIcon className="w-4 h-4" />
                                        <span className="text-xs hidden sm:inline">{page.show_in_menu ? 'Menu' : 'Add Menu'}</span>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`gap-2 ${page.show_in_footer ? 'text-blue-600' : 'text-muted-foreground'}`}
                                        onClick={() => toggleFooter(page.id, page.show_in_footer)}
                                        title={page.show_in_footer ? "Remover do rodapé" : "Exibir no rodapé"}
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span className="text-xs hidden sm:inline">{page.show_in_footer ? 'Rodapé' : 'Add Rodapé'}</span>
                                    </Button>

                                    <Button variant="ghost" size="icon" asChild>
                                        <Link to={`/admin/paginas/editar/${page.id}`}>
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                    </Button>

                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(page.id, page.title)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                            <p className="text-muted-foreground">Nenhuma página criada ainda.</p>
                            <Button asChild variant="link" className="text-accent mt-2">
                                <Link to="/admin/paginas/nova">Criar minha primeira página</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPages;
