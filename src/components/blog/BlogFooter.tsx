import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { usePages } from "@/hooks/usePages";

const BlogFooter = () => {
  const { settings } = useSettings();
  const { pages } = usePages();
  const footerPages = pages.filter(p => p.show_in_footer);

  return (
    <footer className="mt-16 border-t border-gray-200">
      {/* Mid footer - Light gray */}
      <div className="bg-[#EBEBEB] py-10">
        <div className="blog-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-block mb-4">
                {settings.blogLogo ? (
                  <img src={settings.blogLogo} alt={settings.blogName} className="h-6 w-auto object-contain" />
                ) : (
                  <span className="text-lg font-black text-[#2D3277]">{settings.blogName}</span>
                )}
              </Link>
              <p className="text-xs text-gray-600 leading-relaxed max-w-xs">
                {settings.footerText || "Curadoria dos melhores produtos e tendências."}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider mb-4">Explorar</h4>
              <ul className="space-y-2.5 text-xs text-gray-600">
                <li><Link to="/categorias" className="hover:text-[#3483FA] transition-colors">Categorias</Link></li>
                <li><Link to="/sobre" className="hover:text-[#3483FA] transition-colors">Sobre Nós</Link></li>
                <li><Link to="/contato" className="hover:text-[#3483FA] transition-colors">Contato</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2.5 text-xs text-gray-600">
                {footerPages.map(page => (
                  <li key={page.id}>
                    <Link to={`/p/${page.slug}`} className="hover:text-[#3483FA] transition-colors">{page.title}</Link>
                  </li>
                ))}
                <li><Link to="/politica-de-privacidade" className="hover:text-[#3483FA] transition-colors">Privacidade</Link></li>
                <li><Link to="/termos-de-uso" className="hover:text-[#3483FA] transition-colors">Termos</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider mb-4">Redes Sociais</h4>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-[#3483FA] hover:text-white hover:border-[#3483FA] transition-all">
                  <span className="text-[9px] font-black">IG</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-[#3483FA] hover:text-white hover:border-[#3483FA] transition-all">
                  <span className="text-[9px] font-black">FB</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-[#3483FA] hover:text-white hover:border-[#3483FA] transition-all">
                  <span className="text-[9px] font-black">YT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar - Dark blue like ML */}
      <div className="bg-[#2D3277] py-4">
        <div className="blog-container flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-white/60 text-center sm:text-left">
            © {new Date().getFullYear()} {settings.blogName.replace(/\.$/, '')}. Todos os direitos reservados.
          </p>
          <p className="text-[10px] text-white/40">
            Feito com ❤️ pelo nosso time
          </p>
        </div>
      </div>
    </footer>
  );
};

export default BlogFooter;
