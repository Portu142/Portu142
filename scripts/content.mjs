// Contenido del perfil (solo datos publicos).
export const info = {
  name: 'Ricardo Pinheiro',
  user: 'ricardo@github',
  rows: [
    ['Rol', 'Desarrollador full-stack junior'],
    ['Formación', 'Técnico Superior en DAW'],
    ['Stack', 'C# / .NET 8 · React + TypeScript · Node.js / Express · Python'],
    ['Datos', 'PostgreSQL / PostGIS · SQLite'],
    ['Ahora', 'buscando puesto como desarrollador · profundizando en React'],
    ['Contacto', 'rdpcarvalho644@gmail.com'],
  ],
};

export const projects = [
  {
    name: 'LocalizadorCafeterias',
    emoji: '☕',
    tagline: 'Encuentra cafeterías cerca de ti, consulta su carta y opina.',
    stack: ['.NET 8', 'React 19 + TS', 'PostgreSQL/PostGIS', 'Leaflet'],
    highlight: 'Demo en vivo · CI en GitHub Actions',
    url: 'https://github.com/Portu142/LocalizadorCafeterias',
  },
  {
    name: 'gestor-de-almacen',
    emoji: '📦',
    tagline: 'Inventario de tienda: stock mínimo, entradas/salidas y avisos de reposición.',
    stack: ['Node.js + Express', 'React + Vite', 'SQLite'],
    highlight: '16 tests · reglas de negocio reales',
    url: 'https://github.com/Portu142/gestor-de-almacen',
  },
  {
    name: 'ScraPrice',
    emoji: '🛒',
    tagline: 'Rastreador y comparador de precios mediante web scraping.',
    stack: ['Python', 'Frappe', 'Redis/RQ', 'BeautifulSoup'],
    highlight: 'TFG del ciclo DAW',
    url: 'https://github.com/Portu142/ScraPrice',
  },
];
