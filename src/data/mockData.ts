export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  status: 'draft' | 'published' | 'scheduled';
  type: 'standard' | 'review' | 'listicle' | 'comparison';
  affiliateLinks?: { label: string; url: string }[];
  wordCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
}

export const mockCategories: Category[] = [
  { id: '1', name: 'Tecnologia', slug: 'tecnologia', description: 'Artigos sobre tecnologia e gadgets', articleCount: 12 },
  { id: '2', name: 'Casa & Cozinha', slug: 'casa-cozinha', description: 'Produtos para casa e cozinha', articleCount: 8 },
  { id: '3', name: 'Saúde & Bem-estar', slug: 'saude-bem-estar', description: 'Dicas de saúde e bem-estar', articleCount: 5 },
  { id: '4', name: 'Finanças', slug: 'financas', description: 'Educação financeira e ferramentas', articleCount: 3 },
];

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Os 10 Melhores Fones de Ouvido Bluetooth de 2025',
    slug: 'melhores-fones-bluetooth-2025',
    excerpt: 'Descubra os fones de ouvido Bluetooth que dominam o mercado em 2025. Comparamos som, conforto, bateria e custo-benefício para você escolher o ideal.',
    content: '<h2>Por que investir em um bom fone Bluetooth?</h2><p>Com a evolução da tecnologia sem fio, os fones Bluetooth se tornaram indispensáveis no dia a dia...</p><h2>1. Sony WH-1000XM6</h2><p>O Sony WH-1000XM6 continua sendo referência em cancelamento de ruído ativo...</p>',
    featuredImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    featuredImageAlt: 'Fones de ouvido Bluetooth modernos sobre mesa de madeira',
    category: 'Tecnologia',
    tags: ['fones', 'bluetooth', 'review'],
    author: 'Admin',
    publishedAt: '2025-02-15',
    status: 'published',
    type: 'review',
    affiliateLinks: [{ label: 'Comprar Sony WH-1000XM6', url: '#' }],
    wordCount: 1200,
  },
  {
    id: '2',
    title: 'Guia Completo: Como Escolher o Melhor Notebook em 2025',
    slug: 'como-escolher-melhor-notebook-2025',
    excerpt: 'Processador, memória, tela... são tantas especificações que fica difícil escolher. Nosso guia simplifica tudo para você tomar a melhor decisão.',
    content: '<h2>Entendendo as especificações</h2><p>Antes de comprar um notebook, é essencial entender...</p>',
    featuredImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    featuredImageAlt: 'Notebook aberto em mesa de trabalho moderna',
    category: 'Tecnologia',
    tags: ['notebook', 'guia', 'compras'],
    author: 'Admin',
    publishedAt: '2025-02-10',
    status: 'published',
    type: 'standard',
    wordCount: 800,
  },
  {
    id: '3',
    title: 'Air Fryer: Vale a Pena? Comparativo das Top 5 Marcas',
    slug: 'air-fryer-comparativo-top-5',
    excerpt: 'Air fryer virou febre nas cozinhas brasileiras. Mas qual modelo realmente entrega o que promete? Testamos e comparamos as 5 melhores.',
    content: '<h2>O que é uma Air Fryer?</h2><p>A air fryer, ou fritadeira elétrica, é um eletrodoméstico...</p>',
    featuredImage: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=800&q=80',
    featuredImageAlt: 'Air fryer moderna em bancada de cozinha',
    category: 'Casa & Cozinha',
    tags: ['air fryer', 'cozinha', 'comparativo'],
    author: 'Admin',
    publishedAt: '2025-02-05',
    status: 'published',
    type: 'comparison',
    affiliateLinks: [
      { label: 'Air Fryer Mondial', url: '#' },
      { label: 'Air Fryer Philips', url: '#' },
    ],
    wordCount: 1200,
  },
  {
    id: '4',
    title: '7 Suplementos Essenciais para Quem Treina em Casa',
    slug: 'suplementos-essenciais-treino-casa',
    excerpt: 'Treinando em casa e quer potencializar seus resultados? Conheça os 7 suplementos que fazem diferença real na sua performance.',
    content: '<h2>Suplementação inteligente</h2><p>Treinar em casa se tornou uma realidade...</p>',
    featuredImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    featuredImageAlt: 'Suplementos fitness organizados em prateleira',
    category: 'Saúde & Bem-estar',
    tags: ['suplementos', 'fitness', 'saúde'],
    author: 'Admin',
    publishedAt: '2025-01-28',
    status: 'published',
    type: 'listicle',
    wordCount: 500,
  },
];
