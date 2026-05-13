import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://goxplora.ca';

interface PageSEOProps {
  title: string;
  description: string;
  canonical?: string;
  schema?: object | object[];
}

export function PageSEO({ title, description, canonical = '/', schema }: PageSEOProps) {
  const url = `${BASE_URL}${canonical}`;
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
