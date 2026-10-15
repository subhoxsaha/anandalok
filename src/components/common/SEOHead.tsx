import React, { useEffect } from 'react';
import { ArtisanProduct, Cause } from '../../types';
import {
  generateOrganizationSchema,
  generateProductSchema,
  generateCauseSchema,
  generateBreadcrumbSchema,
  updatePageSEO,
  SEOConfig
} from '../../lib/seo';
import { getProductReviews } from '../../lib/storage';

interface SEOHeadProps {
  activeTab: string;
  selectedProduct: ArtisanProduct | null;
  selectedCause: Cause | null;
  causes: Cause[];
  products: ArtisanProduct[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  activeTab,
  selectedProduct,
  selectedCause,
  causes,
  products
}) => {
  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://anandalok.org';
    const orgSchema = generateOrganizationSchema(baseUrl);
    const reviews = getProductReviews();

    let config: SEOConfig;

    // 1. Specific Product Detail View
    if (selectedProduct) {
      const productUrl = `${baseUrl}?tab=marketplace&product=${selectedProduct.id}`;
      const productImg =
        selectedProduct.images && selectedProduct.images.length > 0
          ? selectedProduct.images[0]
          : `${baseUrl}/og-image.png`;
      const cleanDesc = `${selectedProduct.title} handcrafted by ${selectedProduct.artisanName} in ${selectedProduct.artisanLocation}. ${selectedProduct.description.slice(0, 100)}... 100% fair artisan wages.`;

      const productSchema = generateProductSchema(selectedProduct, baseUrl, reviews);
      const breadcrumb = generateBreadcrumbSchema([
        { name: 'Home', url: baseUrl },
        { name: 'Artisan Marketplace', url: `${baseUrl}?tab=marketplace` },
        {
          name: selectedProduct.category.replace('_', ' ').toUpperCase(),
          url: `${baseUrl}?tab=marketplace&cat=${selectedProduct.category}`
        },
        { name: selectedProduct.title, url: productUrl }
      ]);

      // Optimal 50-60 char title for social cards
      const shortTitle = selectedProduct.title.length > 32 
        ? selectedProduct.title.slice(0, 29) + '...' 
        : selectedProduct.title;
      const title = `${shortTitle} | Anandalok Bengal Crafts`;

      config = {
        title,
        description: cleanDesc,
        url: productUrl,
        imageUrl: productImg,
        imageAlt: selectedProduct.title,
        imageWidth: '1200',
        imageHeight: '630',
        type: 'product',
        productData: {
          price: selectedProduct.price,
          currency: 'INR',
          inStock: selectedProduct.inStock > 0,
          id: selectedProduct.id,
          category: selectedProduct.category
        },
        jsonLd: [orgSchema, productSchema, breadcrumb]
      };
    }
    // 2. Specific Cause Detail View
    else if (selectedCause) {
      const causeUrl = `${baseUrl}?tab=causes&cause=${selectedCause.id}`;
      const causeImg = selectedCause.imageUrl || `${baseUrl}/og-image.png`;
      const cleanDesc = `${selectedCause.subtitle}. ${selectedCause.impactPer100}. 80G Tax-exempt donation supporting rural families in West Bengal.`;

      const causeSchema = generateCauseSchema(selectedCause, baseUrl);
      const breadcrumb = generateBreadcrumbSchema([
        { name: 'Home', url: baseUrl },
        { name: 'Welfare Causes', url: `${baseUrl}?tab=causes` },
        { name: selectedCause.title, url: causeUrl }
      ]);

      const shortCauseTitle = selectedCause.title.length > 30
        ? selectedCause.title.slice(0, 27) + '...'
        : selectedCause.title;
      const title = `${shortCauseTitle} | Anandalok Welfare`;

      config = {
        title,
        description: cleanDesc,
        url: causeUrl,
        imageUrl: causeImg,
        imageAlt: selectedCause.title,
        imageWidth: '1200',
        imageHeight: '630',
        type: 'website',
        jsonLd: [orgSchema, causeSchema, breadcrumb]
      };
    }
    // 3. Marketplace Tab
    else if (activeTab === 'marketplace') {
      const marketplaceUrl = `${baseUrl}?tab=marketplace`;
      const catalogItemList = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Anandalok Rural Artisan Guild Catalog',
        description:
          'Handmade heritage crafts by women and traditional rural artisans of West Bengal',
        itemListElement: products.slice(0, 12).map((p, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${baseUrl}?tab=marketplace&product=${p.id}`,
          name: p.title
        }))
      };

      const breadcrumb = generateBreadcrumbSchema([
        { name: 'Home', url: baseUrl },
        { name: 'Artisan Marketplace', url: marketplaceUrl }
      ]);

      config = {
        title: 'Artisan Marketplace & Crafts | Anandalok Foundation',
        description:
          'Support rural West Bengal women artisans. Shop authentic handloom Kantha stitch, terracotta pottery, and eco-friendly jute crafts with direct fair wages.',
        url: marketplaceUrl,
        imageUrl: `${baseUrl}/og-image.png`,
        imageAlt: 'Anandalok Artisan Crafts Marketplace',
        imageWidth: '1200',
        imageHeight: '630',
        type: 'website',
        jsonLd: [orgSchema, catalogItemList, breadcrumb]
      };
    }
    // 4. Causes Tab
    else if (activeTab === 'causes') {
      const causesUrl = `${baseUrl}?tab=causes`;
      const causesItemList = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Anandalok Welfare Campaigns',
        description:
          'Active 80G tax-exempt charitable initiatives for child education, cloth drives, and rural healthcare',
        itemListElement: causes.map((c, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${baseUrl}?tab=causes&cause=${c.id}`,
          name: c.title
        }))
      };

      const breadcrumb = generateBreadcrumbSchema([
        { name: 'Home', url: baseUrl },
        { name: 'Welfare Causes', url: causesUrl }
      ]);

      config = {
        title: 'Welfare Causes & Campaigns | Anandalok Foundation',
        description:
          'Join Anandalok Welfare Foundation missions: Shishu Pathshala child education & nutrition, winter warmth cloth distribution drives, and women artisan guilds.',
        url: causesUrl,
        imageUrl: `${baseUrl}/og-image.png`,
        imageAlt: 'Anandalok Welfare Campaigns',
        imageWidth: '1200',
        imageHeight: '630',
        type: 'website',
        jsonLd: [orgSchema, causesItemList, breadcrumb]
      };
    }
    // 5. Blog Tab
    else if (activeTab === 'blog') {
      config = {
        title: 'Field Stories & Impact Journal | Anandalok Welfare',
        description:
          'Read frontline stories of hope and community transformation across West Bengal: child literacy milestones, cloth drive updates, and artisan profiles.',
        url: `${baseUrl}?tab=blog`,
        imageUrl: `${baseUrl}/og-image.png`,
        imageAlt: 'Anandalok Welfare Foundation Stories',
        imageWidth: '1200',
        imageHeight: '630',
        type: 'website',
        jsonLd: [
          orgSchema,
          generateBreadcrumbSchema([
            { name: 'Home', url: baseUrl },
            { name: 'Impact Journal', url: `${baseUrl}?tab=blog` }
          ])
        ]
      };
    }
    // 6. Home / Default
    else {
      const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Anandalok Welfare Foundation',
        url: baseUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}?tab=marketplace&search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };

      config = {
        title: 'Anandalok Welfare Foundation | Empowering Communities',
        description:
          'Empowering communities through child welfare, women empowerment, cloth drives, and an authentic local artisan craft marketplace in Durgapur, West Bengal.',
        url: baseUrl,
        imageUrl: `${baseUrl}/og-image.png`,
        imageAlt: 'Anandalok Welfare Foundation - Spreading Happiness By Holding Hands',
        imageWidth: '1200',
        imageHeight: '630',
        type: 'website',
        jsonLd: [orgSchema, websiteSchema]
      };
    }

    updatePageSEO(config);
  }, [activeTab, selectedProduct, selectedCause, causes, products]);

  return null;
};
