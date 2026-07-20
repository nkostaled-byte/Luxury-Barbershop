import { Service, Barber, Product, MembershipPlan, Review } from './types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Precision Haircut',
    category: 'Haircut',
    price: 350,
    duration: 45,
    description: 'A bespoke precision haircut tailored to your head structure and personal style. Includes a charcoal wash, scalp massage, and hot towel finish.',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80'
  },
  {
    id: 's2',
    name: 'Seamless Skin Fade',
    category: 'Haircut',
    price: 450,
    duration: 50,
    description: 'The ultimate seamless blend. A masterfully executed razor skin fade paired with premium hair styling, complete with essential oils.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80'
  },
  {
    id: 's3',
    name: 'Premium Beard Sculpt',
    category: 'Beard',
    price: 250,
    duration: 35,
    description: 'Beard shaping and trim using precision clippers and a straight razor cheek-line finish. Nourished with hand-pressed premium oud beard oil.',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80'
  },
  {
    id: 's4',
    name: 'Classic Hot Towel Shave',
    category: 'Shave',
    price: 350,
    duration: 45,
    description: 'Traditional hot towel shave featuring rich sandalwood lather, straight razor precision, cold compress, and an aftershave massage.',
    image: 'https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?w=600&q=80'
  },
  {
    id: 's5',
    name: 'The Sovereign Experience',
    category: 'VIP',
    price: 1200,
    duration: 120,
    description: 'The ultimate grooming experience. Precision Haircut, Premium Beard Sculpt or Hot Towel Shave, paired with a revitalizing face mask, ear singeing, and a premium beverage.',
    image: 'https://images.unsplash.com/photo-1593702295094-aea22597af65?w=600&q=80'
  },
  {
    id: 's6',
    name: 'Hydra-Thermal Wash & Style',
    category: 'Treatment',
    price: 150,
    duration: 25,
    description: 'Deep pore scalp cleansing with hot spring mineral water, tea tree oil treatment, blow-dry, and professional styling session.',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80'
  }
];

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'b1',
    name: 'Alexander Vance',
    role: 'Master Barber & Founder',
    experience: '16+ Years Experience',
    specialties: ['Classic Scissor Cuts', 'Executive Outlines', 'Signature Shaves'],
    rating: 4.9,
    reviewsCount: 1420,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&q=80',
    instagram: '@alexander_vance_barber',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  },
  {
    id: 'b2',
    name: 'Marcus Thorne',
    role: 'Creative Stylist & Fade Expert',
    experience: '9 Years Experience',
    specialties: ['Seamless Skin Fades', 'Modern Textured Crops', 'Line Designs'],
    rating: 4.9,
    reviewsCount: 980,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80',
    instagram: '@marcusthorne_styles',
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['09:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:30', '18:00']
  },
  {
    id: 'b3',
    name: 'Dimitri Volk',
    role: 'Artisanal Beard Sculptor',
    experience: '12 Years Experience',
    specialties: ['Premium Beard Designs', 'Straight Razor Outlines', 'Hot Stone Face Massages'],
    rating: 5.0,
    reviewsCount: 1150,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80',
    instagram: '@dimitrivolk_sculpts',
    availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '19:00']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Sovereign Pomade',
    category: 'Styling',
    price: 350,
    volume: '100ml',
    rating: 4.8,
    stock: 24,
    description: 'High hold with an elegant medium satin shine. Infused with natural beeswax and sandalwood notes. Rinses out effortlessly.',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80'
  },
  {
    id: 'p2',
    name: 'Obsidian Matte Clay',
    category: 'Styling',
    price: 380,
    volume: '85ml',
    rating: 4.9,
    stock: 18,
    description: 'Extreme volume texture clay with a dry matte finish. Formulated with mineral-rich volcanic bentonite clay to strengthen your hair.',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80'
  },
  {
    id: 'p3',
    name: 'Premium Oud Beard Oil',
    category: 'Beard Care',
    price: 450,
    volume: '50ml',
    rating: 5.0,
    stock: 12,
    description: 'A deeply conditioning blend of pure argan, jojoba, and grape seed oil, infused with rare, magnetic oud scent.',
    image: 'https://images.unsplash.com/photo-1626015276284-be46903f6f3a?w=600&q=80'
  },
  {
    id: 'p4',
    name: 'Hydra-Thermal Invigorating Shampoo',
    category: 'Hair Care',
    price: 340,
    volume: '250ml',
    rating: 4.7,
    stock: 30,
    description: 'Scalp stimulating shampoo with peppermint, eucalyptus, and mineral-rich thermal waters. Strengthens roots and locks in moisture.',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&q=80'
  },
  {
    id: 'p5',
    name: 'Sovereign Nourishing Conditioner',
    category: 'Hair Care',
    price: 340,
    volume: '250ml',
    rating: 4.6,
    stock: 28,
    description: 'Rich botanical cream to rebuild damaged follicles and hydrate coarse hair, giving a weightless, premium finish.',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80'
  },
  {
    id: 'p6',
    name: 'The Ultimate Grooming Chest',
    category: 'Gift Set',
    price: 1200,
    volume: 'Full Set',
    rating: 5.0,
    stock: 8,
    description: 'An exquisite hand-finished wood display chest. Contains a Sovereign Pomade, Premium Oud Beard Oil, a premium horn comb, and sandalwood shaving cream.',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&q=80'
  }
];

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'm1',
    name: 'Classic Membership',
    price: 350,
    period: 'month',
    benefits: [
      '2 Precision Haircut or Skin Fade sessions per month',
      'Complimentary scalp treatment with every visit',
      '10% Off all Sovereign products',
      'Priority standby booking notifications'
    ]
  },
  {
    id: 'm2',
    name: 'Premium Membership',
    price: 650,
    period: 'month',
    popular: true,
    benefits: [
      'Unlimited hair grooming sessions (Precision Haircut or Skin Fade)',
      '1 Sovereign Signature treatment per quarter',
      '15% Off all Sovereign products',
      'Dedicated booking line',
      'Complimentary premium beverage during visits'
    ]
  },
  {
    id: 'm3',
    name: 'VIP Membership',
    price: 1200,
    period: 'month',
    benefits: [
      'Unlimited haircuts, beard sculpts, and straight-razor shaves',
      'Priority booking access with zero-wait guarantees',
      'Free full-size product of your choice every month',
      'Private styling room access and complimentary premium bar access',
      'Complimentary birthday grooming package for you & a guest'
    ]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Charles Sterling',
    rating: 5,
    text: 'An outstanding establishment. Alexander Vance is a master artisan. The service is meticulous, the ambiance is reminiscent of an exclusive Mayfair private club, and the premium beverage selection is superb. Worth every single cent.',
    date: '3 days ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    service: 'The Sovereign Experience'
  },
  {
    id: 'r2',
    name: 'Dominic Russo',
    rating: 5,
    text: 'Marcus Thorne executes the sharpest skin fade in the city. The attention to detail is remarkable. Every outline is flawless, and the styling clay smells incredible. Hands down, the best barbershop experience of my life.',
    date: '1 week ago',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    service: 'Seamless Skin Fade'
  },
  {
    id: 'r3',
    name: 'James Harrington',
    rating: 5,
    text: 'Dimitri Volk transformed my beard into a literal work of art. The hot towel sandalwood shaving service is soothing, and the beard oil is magnetic. A true oasis for gentlemen.',
    date: '2 weeks ago',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    service: 'Premium Beard Sculpt'
  }
];

export const BEFORE_AFTER_GALLERY = [
  {
    id: 'g1',
    before: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?w=600&q=80',
    after: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80',
    title: 'Textured Crop & Taper',
    barber: 'Marcus Thorne'
  },
  {
    id: 'g2',
    before: 'https://images.unsplash.com/photo-1517832606589-7a598b647192?w=600&q=80',
    after: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80',
    title: 'Precision Mid-Fade Blend',
    barber: 'Alexander Vance'
  },
  {
    id: 'g3',
    before: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80',
    after: 'https://images.unsplash.com/photo-1593702295094-aea22597af65?w=600&q=80',
    title: 'Signature Beard Sculpt & Razor Line',
    barber: 'Dimitri Volk'
  }
];
