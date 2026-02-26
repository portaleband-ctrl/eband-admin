import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { LogIn, Sparkles } from "lucide-react";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success("Bem-vindo de volta!");
            navigate("/admin");
        } catch (error: any) {
            toast.error(error.message || "Erro ao fazer login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
            <Card className="w-full max-w-md p-8 shadow-2xl border-accent/10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="text-2xl font-black font-heading tracking-tight text-foreground">
                        Aura Premium Admin
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Faça login para gerenciar seu blog
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="rounded-xl"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full gap-2 h-11 rounded-xl font-bold bg-accent hover:bg-accent/90"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Entrando...
                            </span>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" /> Acessar Painel
                            </>
                        )}
                    </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-8 italic">
                    Apenas usuários autorizados podem acessar este painel.
                </p>
            </Card>
        </div>
    );
};

export default AdminLogin;
