import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Star } from "lucide-react";
import { useArticles } from "@/hooks/useArticles";

const AdminCategories = () => {
  const { articles } = useArticles();
  const { categories, addCategory, deleteCategory, toggleFeatured, isLoading } = useCategories();
  const [newCat, setNewCat] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newCat.trim()) return;
    setIsAdding(true);
    try {
      await addCategory(newCat);
      setNewCat("");
    } catch {
      // Error handled in hook
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) {
      await deleteCategory(id);
    }
  };

  const getCount = (slug: string) => {
    return articles.filter(a => a.category?.toLowerCase() === slug.toLowerCase()).length;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Categorias">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Categorias">
      <div className="max-w-2xl space-y-6">
        <Card className="p-5">
          <h3 className="font-heading font-bold mb-3">Nova Categoria</h3>
          <div className="flex gap-2">
            <Input
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              placeholder="Nome da categoria"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={isAdding}>
              <Plus className={`w-4 h-4 mr-2 ${isAdding ? "animate-spin" : ""}`} />
              {isAdding ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold">Categorias Existentes</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              = aparece na barra da página inicial
            </p>
          </div>
          {categories.map(cat => (
            <Card key={cat.id} className={`p-4 flex items-center justify-between shadow-sm border transition-all ${cat.featured ? 'border-[#3483FA]/40 bg-blue-50/40' : 'border-accent/10'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-lg">{cat.name}</p>
                  {cat.featured && (
                    <span className="text-[10px] bg-[#3483FA] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Home
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  /{cat.slug} · <span className="font-bold text-accent">{getCount(cat.slug)}</span> {getCount(cat.slug) === 1 ? 'artigo' : 'artigos'}
                </p>
              </div>
              <div className="flex gap-1 items-center">
                <Button
                  variant={cat.featured ? "default" : "outline"}
                  size="sm"
                  className={`h-8 text-xs gap-1.5 ${cat.featured ? 'bg-[#3483FA] hover:bg-[#2968C8]' : ''}`}
                  onClick={() => toggleFeatured(cat.id, !cat.featured)}
                  title={cat.featured ? "Remover da Home" : "Mostrar na Home"}
                >
                  <Star className={`w-3.5 h-3.5 ${cat.featured ? 'fill-white' : ''}`} />
                  {cat.featured ? "Na Home" : "Mostrar na Home"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(cat.id, cat.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma categoria criada ainda.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
