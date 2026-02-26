import BlogLayout from "@/components/blog/BlogLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ContactPage = () => (
  <BlogLayout>
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-heading font-bold mb-4">Contato</h1>
      <p className="text-muted-foreground mb-8">Tem alguma dúvida, sugestão ou proposta? Envie sua mensagem!</p>
      <form className="space-y-5" onSubmit={e => { e.preventDefault(); }}>
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" placeholder="Seu nome" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="seu@email.com" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="message">Mensagem</Label>
          <Textarea id="message" placeholder="Escreva sua mensagem..." rows={5} className="mt-1" />
        </div>
        <Button type="submit" className="w-full">Enviar Mensagem</Button>
      </form>
    </div>
  </BlogLayout>
);

export default ContactPage;
