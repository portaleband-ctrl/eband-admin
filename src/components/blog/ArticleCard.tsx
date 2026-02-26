import { Link } from "react-router-dom";
import { Article } from "@/data/mockData";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const stripHtml = (html: string) => {
  if (!html) return "";
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
};

const ArticleCard = ({ article, featured = false }: ArticleCardProps) => {
  const cleanTitle = stripHtml(article.title);
  const cleanExcerpt = stripHtml(article.excerpt);
  if (featured) {
    return (
      <Link to={`/artigo/${article.slug}`} className="group block">
        <article className="overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md border border-gray-200">
          <div className="grid md:grid-cols-5 gap-0">
            <div className="md:col-span-3 aspect-video md:aspect-auto overflow-hidden">
              <img
                src={article.featuredImage}
                alt={article.featuredImageAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
            <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center bg-white">
              <span className="inline-block mb-4 text-[10px] font-bold uppercase tracking-widest text-[#3483FA] border border-[#3483FA] rounded px-2 py-0.5 w-fit">
                {article.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-snug group-hover:text-[#3483FA] transition-colors text-gray-900">
                {cleanTitle}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">{cleanExcerpt}</p>
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-[#3483FA] flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-800">Por {article.author}</span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/artigo/${article.slug}`} className="group block h-full">
      <article className="h-full flex flex-col bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-[#3483FA]/30">
        <div className="aspect-video overflow-hidden relative">
          <img
            src={article.featuredImage}
            alt={article.featuredImageAlt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-[#FFE600] text-[#2D3277] text-[10px] font-black px-2 py-0.5 rounded-sm">
              {article.category}
            </span>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-base font-bold mb-2 group-hover:text-[#3483FA] transition-colors leading-snug line-clamp-2 text-gray-900">
            {cleanTitle}
          </h3>
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4">{cleanExcerpt}</p>
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {new Date(article.publishedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-[10px] font-bold text-[#3483FA] group-hover:underline">
              Ler mais →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;
