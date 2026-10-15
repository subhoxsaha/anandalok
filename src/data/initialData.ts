import { Cause, ArtisanProduct, VolunteerEvent, BlogPost, GalleryItem, ImpactStat, User, HeroImage } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Suman Roy',
    email: 'admin@anandalok.org',
    role: 'central_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98301 23456',
    location: 'Durgapur, West Bengal',
    joinedDate: '2022-01-15'
  }
];

export const INITIAL_CAUSES: Cause[] = [
  {
    id: 'cause-1',
    title: 'Warmth for All: Winter Cloth & Blanket Drive',
    subtitle: 'Distributing 5,000+ warm clothes and blankets to night shelter dwellers & rural children',
    category: 'cloth_distribution',
    description: 'Every winter, thousands of street-dwelling children and elderly elders in Bengal suffer severe cold. Anandalok Foundation conducts doorstep sorting, washing, and distribution of high-quality new and usable clothes, jackets, and thermal blankets across urban slums and Sundarbans delta villages.',
    targetAmount: 350000,
    raisedAmount: 268500,
    donorCount: 312,
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000',
    featured: true,
    taxExempt80G: true,
    impactPer100: 'Provides 2 heavy thermal blankets and 1 warm sweater set for a child.',
    updates: [
      { date: '2026-08-01', title: 'First Batch Dispatched to Gosaba, Sundarbans', text: '1,200 blankets and 800 children sweaters reached 4 islands via community boat volunteers.' },
      { date: '2026-07-20', title: 'Cloth Collection Drive in 12 Housing Societies', text: 'Over 2.5 tons of gently used clothes collected and quality audited by our volunteer squad.' }
    ]
  },
  {
    id: 'cause-2',
    title: 'Anandalok Shishu Shiksha: Child Education & Nutrition',
    subtitle: 'Providing free remedial coaching, mid-day meals, and digital literacy to 800+ underprivileged kids',
    category: 'child_welfare',
    description: 'We run 6 evening learning centers (Shishu Pathshalas) offering nutritious cooked meals, school bags, textbooks, and interactive computer lessons. We prevent school dropouts by supporting single mothers and daily wage worker families.',
    targetAmount: 500000,
    raisedAmount: 385000,
    donorCount: 489,
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1000',
    featured: true,
    taxExempt80G: true,
    impactPer100: 'Sponsors 1 month of tuition, books, and daily nutritious protein snacks for a child.',
    updates: [
      { date: '2026-07-28', title: 'Digital Tablet Lab Launched in Howrah Center', text: '15 tablet stations installed for foundational math and coding games.' }
    ]
  },
  {
    id: 'cause-3',
    title: 'Nari Shakti: Women Craft Livelihood & Skill Center',
    subtitle: 'Empowering 250+ rural women with sewing, kantha embroidery, and artisan marketing skills',
    category: 'women_empowerment',
    description: 'Financial independence breaks cycles of poverty. Anandalok Nari Shakti center equips women with industrial sewing machines, artisan design guidance, financial literacy, and direct market access through our Anandalok Crafts marketplace.',
    targetAmount: 400000,
    raisedAmount: 310000,
    donorCount: 275,
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000',
    featured: true,
    taxExempt80G: true,
    impactPer100: 'Provides sewing starter raw materials and stipend for 1 woman trainee.',
    updates: [
      { date: '2026-08-03', title: 'New Artisan Batch Graduated!', text: '45 women completed 3-month advanced Kantha stitch module and joined our cooperative.' }
    ]
  },
  {
    id: 'cause-4',
    title: 'Maternal & Child Healthcare & Malnutrition Care',
    subtitle: 'Free health checkup camps, iron-folic supplements, and clean drinking water kits for mothers',
    category: 'food_health',
    description: 'Preventing stunting and maternal anemia in remote brick-kiln clusters and rural hamlets. Mobile health vans with doctor consultation, diagnostics, and essential health kits.',
    targetAmount: 300000,
    raisedAmount: 195000,
    donorCount: 180,
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1000',
    featured: false,
    taxExempt80G: true,
    impactPer100: 'Provides complete health checkup + 3 months iron/vitamin supplement for a mother & infant.',
    updates: []
  }
];

export const INITIAL_ARTISAN_PRODUCTS: ArtisanProduct[] = [
  {
    id: 'prod-1',
    title: 'Hand-Embroidered Bengal Kantha Stitch Cotton Dupatta',
    artisanName: 'Sita Devi & Shanti SHG',
    artisanLocation: 'Santiniketan, Birbhum',
    artisanAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    artisanStory: 'Sita Devi leads a self-help group of 18 women artisans in Birbhum. Each dupatta takes over 40 hours of intricate traditional hand stitching, preserving 500-year-old folklore motifs.',
    category: 'textiles',
    price: 1250,
    originalPrice: 1600,
    rating: 5.0,
    reviewsCount: 0,
    inStock: 15,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Pure breathable Bengal cotton dupatta with exquisite hand-embroidered floral Kantha running stitch. Lightweight, colorfast, and perfect for casual as well as festive wear.',
    materials: ['100% Organic Bengal Cotton', 'Resham Thread Embroidery'],
    dimensions: '2.4 Meters x 0.9 Meters',
    impactMessage: '100% of proceeds go directly to Sita Devi and fund 1 week of nutrition for her children.',
    featured: true
  },
  {
    id: 'prod-2',
    title: 'Traditional Terracotta Water Pitcher & Tea Kulhar Set',
    artisanName: 'Gouranga Das & Family',
    artisanLocation: 'Panchmura, Bankura',
    artisanAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    artisanStory: 'Master potter Gouranga Das creates earthen art certified with Geographical Indication (GI) heritage. Natural cooling terracotta without any chemical glaze.',
    category: 'pottery',
    price: 680,
    originalPrice: 850,
    rating: 5.0,
    reviewsCount: 0,
    inStock: 20,
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Eco-friendly natural red clay water pot with matching set of 4 tea kulhars. Naturally cools water by evaporation while adding healthy micro-minerals.',
    materials: ['Natural River Clay', 'Organic Wood Fire Kiln Baked'],
    dimensions: 'Pitcher 1.8 Liters + 4 Kulhars 150ml',
    impactMessage: 'Sustains heritage Bankura potter crafts and pays school fees for Gouranga\'s daughter.',
    featured: true
  },
  {
    id: 'prod-3',
    title: 'Handcrafted Golden Jute Shoulder Tote Bag',
    artisanName: 'Lalita Mondal',
    artisanLocation: 'Barasat, North 24 Parganas',
    artisanAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    artisanStory: 'Lalita started crafting eco-friendly jute bags after taking Anandalok\'s skill empowerment course. She now employs 6 neighborhood women in her workshop.',
    category: 'jute_crafts',
    price: 450,
    originalPrice: 600,
    rating: 5.0,
    reviewsCount: 0,
    inStock: 30,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Sturdy, stylish jute tote bag with internal waterproof lining, wooden button closure, and reinforced vegan leather straps. Ideal for laptop, groceries, or everyday work.',
    materials: ['100% Natural Golden Jute Fibre', 'Cotton Lining', 'Wooden Accent'],
    dimensions: '16in x 14in x 4in',
    impactMessage: 'Replaces 500+ single-use plastic bags while funding women healthcare drives.',
    featured: true
  },
  {
    id: 'prod-4',
    title: 'Hand-Carved Eco Bamboo Table Lamp with Warm LED Bulb',
    artisanName: 'Ramesh Rabha',
    artisanLocation: 'Alipurduar, North Bengal',
    artisanAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    artisanStory: 'Ramesh utilizes sustainably harvested Assam bamboo to carve soothing ambient lamps with geometric lattice patterns inspired by North Bengal flora.',
    category: 'bamboo_wood',
    price: 990,
    originalPrice: 1300,
    rating: 5.0,
    reviewsCount: 0,
    inStock: 8,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Soothing warm ambient table lamp crafted from treated seasoned bamboo. Emits artistic shadows when illuminated.',
    materials: ['Seasoned Muli Bamboo', 'Warm LED 5W Bulb', 'Braided Fabric Cord'],
    dimensions: '12in Height x 5in Diameter',
    impactMessage: 'Supports forest-fringe tribal craft communities and sustainable agro-forestry.',
    featured: false
  },
  {
    id: 'prod-5',
    title: 'Terracotta Hand-Painted Tribal Statement Jewelry Set',
    artisanName: 'Rina Mahato',
    artisanLocation: 'Purulia, West Bengal',
    artisanAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    artisanStory: 'Rina combines clay molding with natural non-toxic acrylic paints depicting Purulia Chhau mask art motifs.',
    category: 'jewelry',
    price: 420,
    originalPrice: 550,
    rating: 5.0,
    reviewsCount: 0,
    inStock: 25,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Unique lightweight neckpiece with matching earrings. Hand-baked terracotta beads painted in earthy yellow, rust, and turquoise.',
    materials: ['Baked Terracotta Clay', 'Cotton Cord', 'Organic Dyes'],
    dimensions: 'Adjustable length cord',
    impactMessage: 'Helps Rina pay for her college degree in social work.',
    featured: false
  },
  {
    id: 'prod-6',
    title: 'Handloom Soft Cotton Scarf with Wooden Block Prints',
    artisanName: 'Bina & Crafts Cooperative',
    artisanLocation: 'Serampore, Hooghly',
    artisanAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    artisanStory: 'Block printing techniques passed down across generations. Bina trains young women who are survivors of domestic hardships.',
    category: 'textiles',
    price: 580,
    originalPrice: 750,
    rating: 5.0,
    reviewsCount: 0,
    inStock: 18,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Ultra-soft handloom unisex scarf stamped using hand-carved teakwood blocks and non-toxic azo-free dyes.',
    materials: ['100% Handloom Cotton', 'Azo-Free Dyes'],
    dimensions: '1.8M x 0.5M',
    impactMessage: 'Provides steady monthly income for 12 women survivors.',
    featured: false
  }
];

export const INITIAL_EVENTS: VolunteerEvent[] = [
  {
    id: 'evt-1',
    title: 'Mega Winter Cloth Sorting & Distribution Drive',
    category: 'cloth_drive',
    date: '2026-08-16',
    time: '09:00 AM - 02:00 PM',
    location: 'Central Distribution Center, Howrah',
    address: 'Anandalok Hub, 14 GT Road, near Howrah Station, West Bengal',
    description: 'Join us for our flagship cloth drive! Volunteers will sort donated clothes by size/age, pack warmth kits, and join field teams delivering to night shelters and rural centers.',
    requiredVolunteers: 40,
    registeredVolunteers: 28,
    coordinatorName: 'Ananya Banerjee',
    coordinatorPhone: '+91 98310 98765',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    skillsNeeded: ['Cloth Sorting', 'Packing & Logistics', 'Field Distribution', 'Photography'],
    status: 'upcoming'
  },
  {
    id: 'evt-2',
    title: 'Weekend Remedial Math & Science Tutor Camp',
    category: 'child_education',
    date: '2026-08-22',
    time: '03:00 PM - 06:00 PM',
    location: 'Shishu Pathshala, Ultadanga Slum Cluster',
    address: 'Near Hudco Crossing, Ultadanga, Kolkata',
    description: 'Teach basic arithmetic, English phonics, and fun science tricks to 60+ primary school children. No prior formal teaching experience needed—just enthusiasm!',
    requiredVolunteers: 15,
    registeredVolunteers: 12,
    coordinatorName: 'Rahul Sharma',
    coordinatorPhone: '+91 91234 56789',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    skillsNeeded: ['Basic Math', 'English Reading', 'Games & Storytelling'],
    status: 'upcoming'
  },
  {
    id: 'evt-3',
    title: 'Artisan Craft Mela & Digital Literacy Stall',
    category: 'artisan_mela',
    date: '2026-08-29',
    time: '10:00 AM - 07:00 PM',
    location: 'Rabindra Sadan Cultural Complex, Kolkata',
    address: 'Cathedral Road, Kolkata 700071',
    description: 'Assist rural women artisans setting up stalls, managing QR code payments, photographing products, and telling artisan stories to exhibition visitors.',
    requiredVolunteers: 20,
    registeredVolunteers: 16,
    coordinatorName: 'Suman Roy',
    coordinatorPhone: '+91 98301 23456',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    skillsNeeded: ['Customer Engagement', 'Digital Payment Assistance', 'Social Media Reporting'],
    status: 'upcoming'
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'From Stitched Scraps to Self-Reliance: How Sita Devi Rebuilt Her Village Cooperative',
    excerpt: 'Discover how 18 women in Birbhum turned traditional Kantha embroidery into a thriving micro-enterprise supplying buyers across India.',
    content: `When Sita Devi joined Anandalok Foundation's skill development workshop three years ago, her family was struggling with seasonal farm wage fluctuations. Armed with a passion for traditional Bengali Kantha stitching and an endless determination, Sita rallied women in her hamlet.

Anandalok provided industrial stitch finishing tools, design training, and opened direct market links through the Anandalok Crafts online marketplace. Today, Sita's group earns a dignified monthly income, owns their equipment, and ensures every single girl child in their village attends school.

"Before Anandalok, our art was hidden inside household quilts. Today, buyers from Kolkata, Mumbai, and Bengaluru wear our handcrafted dupatta with pride," says Sita Devi.`,
    author: 'Ananya Banerjee',
    authorRole: 'Livelihood & Content Coordinator',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    date: '2026-08-02',
    category: 'Artisan Stories',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000',
    readTime: '4 min read',
    tags: ['Women Empowerment', 'Kantha Stitch', 'Rural Crafts', 'Livelihood'],
    published: true
  },
  {
    id: 'blog-2',
    title: 'Warmth Beyond Clothes: Reflections from Sundarbans Island Distribution Drive',
    excerpt: 'Our volunteer squad crossed river channels to deliver 1,200 heavy blankets and warm children wear to remote Gosaba island villages.',
    content: `Reaching the low-lying islands of the Sundarbans requires navigating waterways on motorized wooden boats loaded with neatly packed relief cartons. Last weekend, 25 Anandalok volunteers set out at dawn.

Winter nights along river deltas are unforgiving. For elderly residents and toddlers, receiving a clean, high-density thermal blanket is more than protection against cold—it is a gesture of warmth and community care.

Thanks to over 300 generous donors and local cloth collection drives in Kolkata and Howrah, we fulfilled our campaign target 5 days ahead of schedule!`,
    author: 'Suman Roy',
    authorRole: 'Founder & Field Operations Director',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    date: '2026-07-26',
    category: 'Cloth Drives',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000',
    readTime: '5 min read',
    tags: ['Sundarbans', 'Winter Drive', 'Volunteer Impact', 'Relief'],
    published: true
  },
  {
    id: 'blog-3',
    title: 'Unlocking Dreams: Why Remedial Evening Classes Are Changing Slum Education',
    excerpt: 'Standard schools often miss children who lack study support at home. Here is how Shishu Pathshala bridges the gap.',
    content: `For children of daily wage workers and domestic helpers, school homework can feel insurmountable when parents cannot read or write. Anandalok's 6 evening learning centers offer a safe, bright sanctuary equipped with tutors, learning toys, and a warm evening meal.

Over the past year, student attendance across our partner government schools jumped from 62% to 94%, with several students qualifying for merit scholarships.`,
    author: 'Rahul Sharma',
    authorRole: 'Education Lead & Volunteer',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    date: '2026-07-15',
    category: 'Child Care',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1000',
    readTime: '3 min read',
    tags: ['Education', 'Child Welfare', 'Literacy', 'Nutrition'],
    published: true
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Joy of Warmth - Sundarbans Blanket Distribution',
    category: 'cloth_drives',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000',
    highResUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=2000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400',
    location: 'Gosaba, Sundarbans',
    date: 'July 2026',
    description: 'Volunteers distributing warm jackets and blankets to elderly village women.',
    photographer: 'Aritra Das',
    images: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 'gal-2',
    title: 'Shishu Pathshala Evening Learning Smiles',
    category: 'children',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1000',
    highResUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=2000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=400',
    location: 'Ultadanga, Kolkata',
    date: 'June 2026',
    description: 'Children proudly displaying their art projects at our remedial learning center.',
    photographer: 'Suman Roy',
    images: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 'gal-3',
    title: 'Artisans at Work - Santiniketan Kantha Stitch Workshop',
    category: 'women',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000',
    highResUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=2000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    location: 'Birbhum, West Bengal',
    date: 'May 2026',
    description: 'Sita Devi guiding apprentice artisans on intricate resham thread embroidery.',
    photographer: 'Ananya Banerjee',
    images: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 'gal-4',
    title: 'GI Terracotta Pottery Crafting in Panchmura',
    category: 'crafts',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1000',
    highResUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=2000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400',
    location: 'Bankura, West Bengal',
    date: 'April 2026',
    description: 'Master potter Gouranga shaping natural clay water pitchers on the traditional wheel.',
    photographer: 'Pritam Saha',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 'gal-5',
    title: 'Mobile Health & Malnutrition Assessment Camp',
    category: 'events',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1000',
    highResUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=2000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    location: 'Howrah Brick Kiln Belt',
    date: 'March 2026',
    description: 'Doctor examining infant growth milestones and providing maternal nutrition kits.',
    photographer: 'Dr. Debabrata Roy',
    images: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 'gal-6',
    title: 'Anandalok Craft Mela Exhibition Stall',
    category: 'crafts',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000',
    highResUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=2000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
    location: 'Rabindra Sadan, Kolkata',
    date: 'January 2026',
    description: 'Visitors exploring handcrafted golden jute bags and artisan home decor.',
    photographer: 'Subhra Dey',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1000'
    ]
  }
];

export const IMPACT_STATS: ImpactStat[] = [
  {
    label: 'Lives Impacted Directly',
    value: 18500,
    suffix: '+',
    description: 'Across 45+ urban slums and rural island hamlets in West Bengal',
    iconName: 'Heart'
  },
  {
    label: 'Clothes & Blankets Distributed',
    value: 12400,
    suffix: '+',
    description: 'Sorted, sanitized, and delivered during annual season drives',
    iconName: 'Shirt'
  },
  {
    label: 'Women Artisans Empowered',
    value: 420,
    suffix: '+',
    description: 'Earning independent monthly livelihood via Anandalok Crafts',
    iconName: 'Sparkles'
  },
  {
    label: 'Children Educated & Supported',
    value: 850,
    suffix: '+',
    description: 'Enrolled in 6 Shishu Pathshalas with 100% nutritious mid-day meals',
    iconName: 'GraduationCap'
  }
];

export const INITIAL_HERO_IMAGES: HeroImage[] = [
  {
    id: 'hero-1',
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1600',
    title: 'Vastra Daan Drives',
    caption: 'Cloth & Warmth Drives in Sundarbans & Durgapur'
  },
  {
    id: 'hero-2',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1600',
    title: 'Shishu Pathshala',
    caption: 'Free Digital Tutoring & Meals for Underprivileged Children'
  },
  {
    id: 'hero-3',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1600',
    title: 'Rural Women Crafts',
    caption: 'Kantha & Terracotta Crafts Guild in Santiniketan'
  },
  {
    id: 'hero-4',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1600',
    title: 'Mobile Healthcare',
    caption: 'Doctor Camps & Health Kits in Remote Villages'
  }
];
