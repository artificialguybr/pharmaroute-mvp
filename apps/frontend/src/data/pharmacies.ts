export interface Visit {
  id: string;
  date: string;
  notes: string;
  status: 'completed' | 'issue' | 'rescheduled';
  productsPresented?: string;
  nextSteps?: string;
}

export interface Schedule {
  id: string;
  sellerId: string;
  pharmacyId: string;
  pharmacyName: string;
  date: string; // ISO string
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  lastVisit: string | null;
  status: 'needs_visit' | 'visited_recently' | 'scheduled';
  region: string;
  notes: string;
  contactPerson: string;
  visitHistory: Visit[];
}

export interface Seller {
  id: string;
  name: string;
  region: string;
  completedVisits: number;
  pendingVisits: number;
  efficiency: number;
  avatar: string;
  phone: string;
  email: string;
  territory: {
    lat: number;
    lng: number;
    radius: number; // in meters
  };
}

export const mockUserLocation = {
  lat: -23.5641,
  lng: -46.6518 // Paulista Ave
};

export const mockSellers: Seller[] = [
  { 
    id: 's1', 
    name: 'Ana Paula', 
    region: 'Zona Sul', 
    completedVisits: 12, 
    pendingVisits: 3, 
    efficiency: 80, 
    avatar: 'AP',
    phone: '(11) 98888-1111',
    email: 'ana.paula@pharmaroute.com',
    territory: { lat: -23.6071, lng: -46.6668, radius: 3000 }
  },
  { 
    id: 's2', 
    name: 'Carlos Silva', 
    region: 'Centro', 
    completedVisits: 8, 
    pendingVisits: 7, 
    efficiency: 53, 
    avatar: 'CS',
    phone: '(11) 98888-2222',
    email: 'carlos.silva@pharmaroute.com',
    territory: { lat: -23.5489, lng: -46.6328, radius: 2500 }
  },
  { 
    id: 's3', 
    name: 'Roberto Gomes', 
    region: 'Zona Oeste', 
    completedVisits: 15, 
    pendingVisits: 1, 
    efficiency: 93, 
    avatar: 'RG',
    phone: '(11) 98888-3333',
    email: 'roberto.gomes@pharmaroute.com',
    territory: { lat: -23.5675, lng: -46.6853, radius: 4000 }
  },
];

export const mockActivities = [
  { id: 'a1', seller: 'Ana Paula', action: 'visitou', target: 'Drogaria Onofre - Moema', time: '10 min atrás', status: 'completed' },
  { id: 'a2', seller: 'Carlos Silva', action: 'reportou problema em', target: 'Drogaria São Paulo - Centro', time: '45 min atrás', status: 'issue' },
  { id: 'a3', seller: 'Roberto Gomes', action: 'visitou', target: 'Farmácia Pague Menos', time: '2 horas atrás', status: 'completed' },
  { id: 'a4', seller: 'Ana Paula', action: 'agendou retorno em', target: 'Drogasil - Paulista', time: '3 horas atrás', status: 'rescheduled' },
];

export const mockAnnotations = [
  { id: 'n1', seller: 'Ana Paula', pharmacy: 'Drogaria Onofre - Moema', note: 'Gerente solicitou mais amostras do novo xarope infantil. Deixei 5 caixas.', time: '10 min atrás' },
  { id: 'n2', seller: 'Carlos Silva', pharmacy: 'Drogaria São Paulo - Centro', note: 'Farmacêutico ausente hoje. Remarcado para amanhã no primeiro horário.', time: '45 min atrás' },
  { id: 'n3', seller: 'Roberto Gomes', pharmacy: 'Farmácia Pague Menos', note: 'Concorrência com promoção agressiva na vitamina C. Precisamos rever nossa tabela.', time: '2 horas atrás' },
];

// Generate some dynamic dates for the calendar
const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
const nextDay = new Date(today); nextDay.setDate(nextDay.getDate() + 2);

export const mockSchedules: Schedule[] = [
  { id: 'sch1', sellerId: 's1', pharmacyId: '4', pharmacyName: 'Drogaria Onofre - Moema', date: new Date(today.setHours(14, 30)).toISOString(), notes: 'Apresentação de campanha de inverno', status: 'pending' },
  { id: 'sch2', sellerId: 's1', pharmacyId: '6', pharmacyName: 'Drogaria São Paulo - Vila Mariana', date: new Date(tomorrow.setHours(10, 0)).toISOString(), notes: 'Recolher pedido mensal', status: 'pending' },
  { id: 'sch3', sellerId: 's2', pharmacyId: '1', pharmacyName: 'Drogaria São Paulo - Centro', date: new Date(tomorrow.setHours(9, 0)).toISOString(), notes: 'Retorno - Gerente estava ausente', status: 'pending' },
  { id: 'sch4', sellerId: 's3', pharmacyId: '3', pharmacyName: 'Farmácia Pague Menos - Pinheiros', date: new Date(nextDay.setHours(15, 0)).toISOString(), notes: 'Apresentar portfólio completo', status: 'pending' },
];

export const mockPharmacies: Pharmacy[] = [
  {
    id: '1',
    name: 'Drogaria São Paulo - Centro',
    address: 'Rua Direita, 123 - Sé, São Paulo - SP',
    lat: -23.5489,
    lng: -46.6328,
    phone: '(11) 99999-1111',
    email: 'contato.centro@drogariasp.com.br',
    lastVisit: '2023-10-01T10:00:00Z',
    status: 'needs_visit',
    region: 'Centro',
    notes: 'Cliente prioritário. Focar na linha de vitaminas.',
    contactPerson: 'Carlos Silva (Gerente)',
    visitHistory: [
      {
        id: 'v1',
        date: '2023-10-01T10:00:00Z',
        notes: 'Apresentada a nova linha de vitaminas. Gerente pediu amostras.',
        status: 'completed'
      },
      {
        id: 'v2',
        date: '2023-09-01T14:30:00Z',
        notes: 'Gerente ausente. Retornar amanhã.',
        status: 'rescheduled'
      }
    ]
  },
  {
    id: '2',
    name: 'Drogasil - Paulista',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    lat: -23.5641,
    lng: -46.6518,
    phone: '(11) 99999-2222',
    email: 'paulista@drogasil.com.br',
    lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'visited_recently',
    region: 'Centro',
    notes: 'Sempre procurar a Ana Paula antes de verificar as gôndolas.',
    contactPerson: 'Ana Paula (Farmacêutica)',
    visitHistory: [
      {
        id: 'v3',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Estoque de analgésicos reposto. Próxima visita em 15 dias.',
        status: 'completed'
      }
    ]
  },
  {
    id: '3',
    name: 'Farmácia Pague Menos - Pinheiros',
    address: 'Rua Teodoro Sampaio, 2000 - Pinheiros, São Paulo - SP',
    lat: -23.5675,
    lng: -46.6853,
    phone: '(11) 99999-3333',
    email: 'pinheiros@paguemenos.com.br',
    lastVisit: null,
    status: 'needs_visit',
    region: 'Zona Oeste',
    notes: 'Cliente novo. Apresentar portfólio completo.',
    contactPerson: 'Roberto Gomes (Proprietário)',
    visitHistory: []
  },
  {
    id: '4',
    name: 'Drogaria Onofre - Moema',
    address: 'Av. Ibirapuera, 3000 - Moema, São Paulo - SP',
    lat: -23.6071,
    lng: -46.6668,
    phone: '(11) 99999-4444',
    email: 'moema@onofre.com.br',
    lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    region: 'Zona Sul',
    notes: 'Agendar visitas sempre no período da tarde.',
    contactPerson: 'Mariana Costa (Compradora)',
    visitHistory: [
      {
        id: 'v4',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Deixado material promocional da campanha de inverno.',
        status: 'completed'
      }
    ]
  },
  {
    id: '5',
    name: 'Farma Conde - Tatuapé',
    address: 'Rua Tuiuti, 1500 - Tatuapé, São Paulo - SP',
    lat: -23.5405,
    lng: -46.5762,
    phone: '(11) 99999-5555',
    email: 'tatuape@farmaconde.com.br',
    lastVisit: '2023-09-15T14:30:00Z',
    status: 'needs_visit',
    region: 'Zona Leste',
    notes: 'Verificar aceitação do novo display de balcão.',
    contactPerson: 'Fernando Almeida (Gerente)',
    visitHistory: [
      {
        id: 'v5',
        date: '2023-09-15T14:30:00Z',
        notes: 'Instalado novo display de balcão.',
        status: 'completed'
      }
    ]
  },
  {
    id: '6',
    name: 'Drogaria São Paulo - Vila Mariana',
    address: 'Rua Domingos de Morais, 1000 - Vila Mariana, São Paulo - SP',
    lat: -23.5865,
    lng: -46.6378,
    phone: '(11) 99999-6666',
    email: 'vilamariana@drogariasp.com.br',
    lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'visited_recently',
    region: 'Zona Sul',
    notes: 'Tudo ok. Pedido mensal realizado.',
    contactPerson: 'Juliana Mendes (Farmacêutica)',
    visitHistory: [
      {
        id: 'v6',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Pedido mensal recolhido. Sem novidades.',
        status: 'completed'
      },
      {
        id: 'v7',
        date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Apresentado novo xarope infantil.',
        status: 'completed'
      }
    ]
  }
];
