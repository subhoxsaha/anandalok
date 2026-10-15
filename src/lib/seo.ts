import { ArtisanProduct, Cause, ProductReview } from '../types';

/**
 * Generates Schema.org JSON-LD structured data for the Anandalok Welfare Foundation Organization
 */
export function generateOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    '@id': `${baseUrl}/#organization`,
    name: 'Anandalok Welfare Foundation',
    alternateName: ['Anandalok Durgapur', 'Anandalok NGO'],
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/assets/logo.webp`,
      width: '640',
      height: '640',
      caption: 'Anandalok Welfare Foundation Emblem'
    },
    image: `${baseUrl}/assets/logo.webp`,
    description:
      'Registered non-profit welfare organization in Durgapur, West Bengal empowering underprivileged communities through child education, women artisan craft guilds, winter cloth distribution drives, and community health services.',
    foundingLocation: {
      '@type': 'Place',
      name: 'Durgapur, West Bengal, India'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Durgapur',
      addressRegion: 'West Bengal',
      postalCode: '713216',
      addressCountry: 'IN'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-98301-23456',
      contactType: 'donor support and volunteer coordination',
      email: 'contact@anandalok.org',
      availableLanguage: ['English', 'Bengali', 'Hindi']
    },
    nonprofitStatus: 'https://schema.org/Nonprofit501c3',
    taxID: '80G & 12A Certified NGO (West Bengal)',
    knowsAbout: [
      'Child Education & Remedial Learning',
      'Rural Women Artisan Empowerment',
      'Kantha Embroidery & Handloom Textiles',
      'Doorstep Cloth Collection & Distribution',
      'Preventive Healthcare & Malnutrition Relief'
    ],
    sameAs: [
      'https://facebook.com/anandalokwelfare',
      'https://instagram.com/anandalokwelfare',
      'https://twitter.com/anandalok_org'
    ]
  };
}

/**
 * Generates Schema.org JSON-LD structured data for a specific Artisan Product
 */
export function generateProductSchema(
  product: ArtisanProduct,
  baseUrl: string,
  reviews: ProductReview[] = []
) {
  const productUrl = `${baseUrl}?tab=marketplace&product=${product.id}`;
  const imageUrls = product.images.length > 0 ? product.images : [`${baseUrl}/assets/logo.webp`];
  const prodReviews = reviews.filter((r) => r.productId === product.id);

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    image: imageUrls,
    description: product.description,
    sku: product.id,
    mpn: product.id,
    category: product.category.replace('_', ' '),
    material: product.materials && product.materials.length > 0 ? product.materials.join(', ') : 'Natural handcrafted materials',
    brand: {
      '@type': 'Brand',
      name: `${product.artisanName} · Anandalok Rural Artisan Guild`
    },
    manufacturer: {
      '@type': 'NGO',
      name: 'Anandalok Welfare Foundation',
      url: baseUrl,
      logo: `${baseUrl}/assets/logo.webp`
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.inStock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'NGO',
        name: 'Anandalok Welfare Foundation',
        url: baseUrl
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 5.0,
      reviewCount: Math.max(1, product.reviewsCount || prodReviews.length || 1),
      bestRating: '5',
      worstRating: '1'
    }
  };

  if (prodReviews.length > 0) {
    schema.review = prodReviews.map((rev) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: rev.author || 'Verified Patron'
      },
      datePublished: rev.date ? rev.date.split('T')[0] : '2026-08-01',
      reviewBody: rev.comment,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: rev.rating,
        bestRating: '5',
        worstRating: '1'
      }
    }));
  }

  return schema;
}

/**
 * Generates Schema.org JSON-LD structured data for a Cause / Welfare Campaign
 */
export function generateCauseSchema(cause: Cause, baseUrl: string) {
  const causeUrl = `${baseUrl}?tab=causes&cause=${cause.id}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Project',
    '@id': `${causeUrl}#cause`,
    name: cause.title,
    alternateName: cause.subtitle,
    description: `${cause.description} Impact: ${cause.impactPer100}. 80G Tax-exempt verified social welfare campaign.`,
    image: cause.imageUrl || `${baseUrl}/assets/logo.webp`,
    url: causeUrl,
    funder: {
      '@type': 'NGO',
      name: 'Anandalok Welfare Foundation',
      url: baseUrl,
      logo: `${baseUrl}/assets/logo.webp`
    },
    location: {
      '@type': 'Place',
      name: 'Durgapur & Rural Bengal, India'
    },
    potentialAction: {
      '@type': 'DonateAction',
      name: `Sponsor Cause: ${cause.title}`,
      description: cause.impactPer100,
      recipient: {
        '@type': 'NGO',
        name: 'Anandalok Welfare Foundation',
        url: baseUrl,
        taxID: '80G Tax Exempt'
      },
      target: {
        '@type': 'EntryPoint',
        urlTemplate: causeUrl,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform'
        ]
      }
    }
  };
}

/**
 * Generates BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Updates DOM Meta tags and JSON-LD structured data dynamically
 */
export interface SEOConfig {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  imageAlt?: string;
  imageWidth?: string;
  imageHeight?: string;
  imageType?: string;
  type?: 'website' | 'product';
  productData?: {
    price: number;
    currency: string;
    inStock: boolean;
    id: string;
    category?: string;
  };
  jsonLd: Record<string, any> | Record<string, any>[];
}

function setMetaTag(attributeName: 'property' | 'name', attributeValue: string, content: string) {
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function removeMetaTag(attributeName: 'property' | 'name', attributeValue: string) {
  const element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (element) {
    element.remove();
  }
}

export function updatePageSEO(config: SEOConfig) {
  if (typeof document === 'undefined') return;

  // 1. Title
  document.title = config.title;

  // 2. Standard Meta Description
  setMetaTag('name', 'description', config.description);

  // 3. Canonical Link
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', config.url);

  // 4. OpenGraph Tags
  setMetaTag('property', 'og:site_name', 'Anandalok Welfare Foundation');
  setMetaTag('property', 'og:title', config.title);
  setMetaTag('property', 'og:description', config.description);
  setMetaTag('property', 'og:url', config.url);
  setMetaTag('property', 'og:locale', 'en_US');
  setMetaTag('property', 'og:image', config.imageUrl);
  setMetaTag('property', 'og:image:secure_url', config.imageUrl);
  setMetaTag('property', 'og:image:alt', config.imageAlt || config.title);
  setMetaTag('property', 'og:image:width', config.imageWidth || '1200');
  setMetaTag('property', 'og:image:height', config.imageHeight || '630');
  setMetaTag('property', 'og:image:type', config.imageType || 'image/png');
  setMetaTag('property', 'og:type', config.type || 'website');

  // 5. Product OpenGraph specific tags
  if (config.type === 'product' && config.productData) {
    setMetaTag('property', 'product:price:amount', config.productData.price.toString());
    setMetaTag('property', 'product:price:currency', config.productData.currency);
    setMetaTag('property', 'product:availability', config.productData.inStock ? 'in stock' : 'out of stock');
    setMetaTag('property', 'product:retailer_item_id', config.productData.id);
    setMetaTag('property', 'product:condition', 'new');
    if (config.productData.category) {
      setMetaTag('property', 'product:category', config.productData.category);
    }
  } else {
    // Clean up product tags if navigating away from product page
    removeMetaTag('property', 'product:price:amount');
    removeMetaTag('property', 'product:price:currency');
    removeMetaTag('property', 'product:availability');
    removeMetaTag('property', 'product:retailer_item_id');
    removeMetaTag('property', 'product:condition');
    removeMetaTag('property', 'product:category');
  }

  // 6. Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', config.title);
  setMetaTag('name', 'twitter:description', config.description);
  setMetaTag('name', 'twitter:image', config.imageUrl);
  setMetaTag('name', 'twitter:image:alt', config.imageAlt || config.title);

  // 7. Structured Data (JSON-LD)
  let scriptTag = document.getElementById('anandalok-structured-data') as HTMLScriptElement | null;
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.id = 'anandalok-structured-data';
    scriptTag.type = 'application/ld+json';
    document.head.appendChild(scriptTag);
  }

  // Ensure top-level format
  const jsonLdContent = Array.isArray(config.jsonLd)
    ? { '@context': 'https://schema.org', '@graph': config.jsonLd }
    : config.jsonLd;

  scriptTag.textContent = JSON.stringify(jsonLdContent, null, 2);
}
