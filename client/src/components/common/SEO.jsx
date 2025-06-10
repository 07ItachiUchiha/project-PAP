import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'PlantPAP - Premium Plants & Garden Essentials',
  description = 'Discover premium quality plants, gardening tools, and organic essentials. Transform your space into a green sanctuary with our curated collection.',
  keywords = 'plants, gardening, indoor plants, outdoor plants, organic gardening, plant care, garden tools, nursery',
  image = '/og-image.jpg',
  url = window.location.href,
  type = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  children
}) => {
  const siteName = 'PlantPAP';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "description": description,
    "url": "https://plantpap.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://plantpap.com/shop?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="PlantPAP Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@PlantPAP" />
      <meta name="twitter:creator" content="@PlantPAP" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#4ade80" />
      <meta name="msapplication-TileColor" content="#4ade80" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
      
      {/* Additional head content */}
      {children}
    </Helmet>
  );
};

// Product SEO component
export const ProductSEO = ({ product }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images?.map(img => img.url || img) || [],
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": "PlantPAP"
    },
    "offers": {
      "@type": "Offer",
      "price": product.salePrice || product.price,
      "priceCurrency": "INR",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "PlantPAP"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount || 0
    } : undefined
  };

  return (
    <SEO
      title={`${product.name} - Premium ${product.category} Plant`}
      description={product.description}
      keywords={`${product.name}, ${product.category}, plant, gardening, ${product.tags?.join(', ') || ''}`}
      image={product.images?.[0]?.url || product.images?.[0]}
      type="product"
      structuredData={structuredData}
    />
  );
};

// Category SEO component
export const CategorySEO = ({ category, description, productCount }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category} Plants Collection`,
    "description": description,
    "url": `https://plantpap.com/shop?category=${category.toLowerCase()}`,
    "numberOfItems": productCount
  };

  return (
    <SEO
      title={`${category} Plants - Premium Collection`}
      description={description}
      keywords={`${category} plants, ${category} gardening, premium ${category}, plant collection`}
      structuredData={structuredData}
    />
  );
};

export default SEO;
