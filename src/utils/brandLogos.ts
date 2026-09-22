/**
 * Official Brand Logo & Monogram Resolver
 * Provides verified official brand logos, real-time domain logo lookups,
 * and high-definition SVG logo badges for arbitrary new brands.
 */

export interface BrandVisualPreset {
  name: string;
  category: string;
  url: string;
}

export const BRAND_LOGO_MAP: Record<string, string> = {
  // Beauty & Skincare / Wellness
  'himalaya': 'https://www.google.com/s2/favicons?domain=himalayawellness.in&sz=256',
  'himalayan': 'https://www.google.com/s2/favicons?domain=himalayawellness.in&sz=256',
  'mamaearth': 'https://www.google.com/s2/favicons?domain=mamaearth.in&sz=256',
  'mama': 'https://www.google.com/s2/favicons?domain=mamaearth.in&sz=256',
  'plum': 'https://www.google.com/s2/favicons?domain=plumgoodness.com&sz=256',
  'sugar': 'https://www.google.com/s2/favicons?domain=sugarcosmetics.com&sz=256',
  'minimalist': 'https://www.google.com/s2/favicons?domain=beminimalist.co&sz=256',
  'nykaa': 'https://www.google.com/s2/favicons?domain=nykaa.com&sz=256',
  'nyka': 'https://www.google.com/s2/favicons?domain=nykaa.com&sz=256',
  'lakme': 'https://www.google.com/s2/favicons?domain=lakmeindia.com&sz=256',
  'lakmé': 'https://www.google.com/s2/favicons?domain=lakmeindia.com&sz=256',
  'wow skin': 'https://www.google.com/s2/favicons?domain=buywow.in&sz=256',
  'forest essentials': 'https://www.google.com/s2/favicons?domain=forestessentialsindia.com&sz=256',
  'kama ayurveda': 'https://www.google.com/s2/favicons?domain=kamaayurveda.com&sz=256',
  'dot & key': 'https://www.google.com/s2/favicons?domain=dotandkey.com&sz=256',
  'dot and key': 'https://www.google.com/s2/favicons?domain=dotandkey.com&sz=256',
  'mcaffeine': 'https://www.google.com/s2/favicons?domain=mcaffeine.com&sz=256',
  'biotique': 'https://www.google.com/s2/favicons?domain=biotique.com&sz=256',
  'derma co': 'https://www.google.com/s2/favicons?domain=thedermaco.com&sz=256',
  'cetaphil': 'https://www.google.com/s2/favicons?domain=cetaphil.com&sz=256',
  'loreal': 'https://www.google.com/s2/favicons?domain=lorealparis.co.in&sz=256',
  'body shop': 'https://www.google.com/s2/favicons?domain=thebodyshop.in&sz=256',

  // Food & Beverage / Cafes
  'blue tokai': 'https://www.google.com/s2/favicons?domain=bluetokaicoffee.com&sz=256',
  'bluetokai': 'https://www.google.com/s2/favicons?domain=bluetokaicoffee.com&sz=256',
  'third wave': 'https://www.google.com/s2/favicons?domain=thirdwavecoffeeroasters.com&sz=256',
  'thirdwave': 'https://www.google.com/s2/favicons?domain=thirdwavecoffeeroasters.com&sz=256',
  'starbucks': 'https://www.google.com/s2/favicons?domain=starbucks.in&sz=256',
  'cafe coffee day': 'https://www.google.com/s2/favicons?domain=cafecoffeeday.com&sz=256',
  'ccd': 'https://www.google.com/s2/favicons?domain=cafecoffeeday.com&sz=256',
  'chai point': 'https://www.google.com/s2/favicons?domain=chaipoint.com&sz=256',
  'chaayos': 'https://www.google.com/s2/favicons?domain=chaayos.com&sz=256',
  'zomato': 'https://www.google.com/s2/favicons?domain=zomato.com&sz=256',
  'swiggy': 'https://www.google.com/s2/favicons?domain=swiggy.com&sz=256',
  'mcdonald': 'https://www.google.com/s2/favicons?domain=mcdonaldsindia.com&sz=256',
  'kfc': 'https://www.google.com/s2/favicons?domain=kfc.co.in&sz=256',
  'domino': 'https://www.google.com/s2/favicons?domain=dominos.co.in&sz=256',
  'subway': 'https://www.google.com/s2/favicons?domain=subway.com&sz=256',
  'burger king': 'https://www.google.com/s2/favicons?domain=burgerking.in&sz=256',
  'pizza hut': 'https://www.google.com/s2/favicons?domain=pizzahut.co.in&sz=256',
  'amul': 'https://www.google.com/s2/favicons?domain=amul.com&sz=256',
  'blinkit': 'https://www.google.com/s2/favicons?domain=blinkit.com&sz=256',
  'zepto': 'https://www.google.com/s2/favicons?domain=zeptonow.com&sz=256',

  // Fitness & Sports
  'cult.fit': 'https://www.google.com/s2/favicons?domain=cult.fit&sz=256',
  'cultfit': 'https://www.google.com/s2/favicons?domain=cult.fit&sz=256',
  'cult': 'https://www.google.com/s2/favicons?domain=cult.fit&sz=256',
  'decathlon': 'https://www.google.com/s2/favicons?domain=decathlon.in&sz=256',
  'muscleblaze': 'https://www.google.com/s2/favicons?domain=muscleblaze.com&sz=256',
  'gymshark': 'https://www.google.com/s2/favicons?domain=gymshark.com&sz=256',
  'nike': 'https://www.google.com/s2/favicons?domain=nike.com&sz=256',
  'puma': 'https://www.google.com/s2/favicons?domain=puma.com&sz=256',
  'adidas': 'https://www.google.com/s2/favicons?domain=adidas.co.in&sz=256',

  // Technology & Gadgets
  'boat': 'https://www.google.com/s2/favicons?domain=boat-lifestyle.com&sz=256',
  'noise': 'https://www.google.com/s2/favicons?domain=gonoise.com&sz=256',
  'fire-boltt': 'https://www.google.com/s2/favicons?domain=fireboltt.com&sz=256',
  'fireboltt': 'https://www.google.com/s2/favicons?domain=fireboltt.com&sz=256',
  'lenskart': 'https://www.google.com/s2/favicons?domain=lenskart.com&sz=256',
  'apple': 'https://www.google.com/s2/favicons?domain=apple.com&sz=256',
  'samsung': 'https://www.google.com/s2/favicons?domain=samsung.com&sz=256',
  'oneplus': 'https://www.google.com/s2/favicons?domain=oneplus.in&sz=256',
  'sony': 'https://www.google.com/s2/favicons?domain=sony.co.in&sz=256',

  // Fashion & Apparel
  'myntra': 'https://www.google.com/s2/favicons?domain=myntra.com&sz=256',
  'souled store': 'https://www.google.com/s2/favicons?domain=thesouledstore.com&sz=256',
  'souled': 'https://www.google.com/s2/favicons?domain=thesouledstore.com&sz=256',
  'snitch': 'https://www.google.com/s2/favicons?domain=snitch.co.in&sz=256',
  'zara': 'https://www.google.com/s2/favicons?domain=zara.com&sz=256',
  'h&m': 'https://www.google.com/s2/favicons?domain=hm.com&sz=256',
  'ajio': 'https://www.google.com/s2/favicons?domain=ajio.com&sz=256',
  'urbanic': 'https://www.google.com/s2/favicons?domain=urbanic.com&sz=256',
  'bewakoof': 'https://www.google.com/s2/favicons?domain=bewakoof.com&sz=256',
  'fabindia': 'https://www.google.com/s2/favicons?domain=fabindia.com&sz=256'
};

export const PRESET_BRAND_SAMPLES: BrandVisualPreset[] = [
  { name: 'Himalaya Wellness', category: 'Beauty & Skincare', url: 'https://www.google.com/s2/favicons?domain=himalayawellness.in&sz=256' },
  { name: 'Mamaearth', category: 'Beauty & Skincare', url: 'https://www.google.com/s2/favicons?domain=mamaearth.in&sz=256' },
  { name: 'Blue Tokai Coffee', category: 'Food & Beverage', url: 'https://www.google.com/s2/favicons?domain=bluetokaicoffee.com&sz=256' },
  { name: 'Starbucks Coffee', category: 'Food & Beverage', url: 'https://www.google.com/s2/favicons?domain=starbucks.in&sz=256' },
  { name: 'Cult.fit Training', category: 'Fitness & Sports', url: 'https://www.google.com/s2/favicons?domain=cult.fit&sz=256' },
  { name: 'boAt Lifestyle', category: 'Technology', url: 'https://www.google.com/s2/favicons?domain=boat-lifestyle.com&sz=256' },
  { name: 'Myntra Fashion', category: 'Fashion & Apparel', url: 'https://www.google.com/s2/favicons?domain=myntra.com&sz=256' }
];

/**
 * Generate a dynamic high-definition SVG logo monogram for any arbitrary brand
 */
export const generateBrandMonogramLogo = (name?: string, category?: string): string => {
  const cleanName = (name || 'Brand').trim();
  const cat = (category || '').toLowerCase();

  let bg = '0d9488'; // Teal
  if (cat.includes('food') || cat.includes('beverage') || cat.includes('cafe')) bg = 'ea580c';
  else if (cat.includes('fitness') || cat.includes('gym') || cat.includes('sport')) bg = '6366f1';
  else if (cat.includes('tech') || cat.includes('software') || cat.includes('saas')) bg = '0284c7';
  else if (cat.includes('fashion') || cat.includes('apparel') || cat.includes('style')) bg = '18181b';
  else if (cat.includes('lifestyle')) bg = '8b5cf6';

  const seed = encodeURIComponent(cleanName);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=${bg}&textColor=ffffff&fontSize=42&fontWeight=800`;
};

/**
 * Resolve authentic official brand logo
 */
export const resolveBrandLogo = (
  name?: string,
  category?: string,
  email?: string,
  existingLogo?: string
): string => {
  const cName = (name || '').toLowerCase().trim();
  const cat = (category || '').toLowerCase().trim();
  const em = (email || '').toLowerCase().trim();
  const logo = (existingLogo || '').trim();

  // If user explicitly provided a direct valid custom image URL
  if (
    logo &&
    !logo.includes('photo-1490481651871-ab68de25d43d') &&
    !logo.includes('photo-1501339847302') &&
    !(cName.includes('himalaya') && logo.includes('photo-1556228720-195a672e8a03'))
  ) {
    return logo;
  }

  const query = `${cName} ${em}`.toLowerCase();

  // 1. Check verified brand logos dictionary
  for (const [keyword, url] of Object.entries(BRAND_LOGO_MAP)) {
    if (query.includes(keyword)) {
      return url;
    }
  }

  // 2. If business email has a custom company domain (e.g. contact@mycafe.in)
  if (em && em.includes('@')) {
    const domain = em.split('@')[1]?.toLowerCase().trim();
    if (domain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'proton.me', 'example.com'].includes(domain)) {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    }
  }

  // 3. Generate high quality crisp SVG monogram emblem for any new brand
  return generateBrandMonogramLogo(name, category);
};

/**
 * Format clean display brand name
 */
export const resolveBrandDisplayName = (brandProfile: any, email?: string): string => {
  const name = brandProfile?.company_name;
  const em = (email || '').toLowerCase();
  if (name && name !== 'Brand Partner' && name !== 'Brand') return name;

  if (em.includes('himalaya')) return 'Himalaya';
  if (em.includes('mamaearth') || em.includes('mama')) return 'Mamaearth';
  if (em.includes('myntra')) return 'Myntra';
  if (em.includes('nykaa') || em.includes('nyka')) return 'Nykaa';
  if (em.includes('lakme')) return 'Lakmé';
  if (em.includes('boat')) return 'boAt';
  if (em.includes('cult')) return 'Cult.fit';
  if (em.includes('decathlon')) return 'Decathlon';
  if (em.includes('souled')) return 'The Souled Store';
  if (em.includes('zomato')) return 'Zomato';
  if (em.includes('blue tokai') || em.includes('bluetokai')) return 'Blue Tokai Coffee Roasters';
  if (em.includes('third wave') || em.includes('thirdwave')) return 'Third Wave Coffee';

  if (email) {
    const clean = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return 'Brand Partner';
};
