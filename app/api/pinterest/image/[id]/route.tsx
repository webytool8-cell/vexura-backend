import { ImageResponse } from 'next/og';
import { getMarketplaceListing } from '@/lib/database/marketplace';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const listing = await getMarketplaceListing(params.id);
  
  if (!listing) {
    return new Response('Not found', { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1000px',
          height: '1500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          color: 'white',
          fontFamily: 'sans-serif'
        }}
      >
        {/* Vector Preview */}
        <div
          style={{
            fontSize: 400,
            marginBottom: 60
          }}
        >
          {/* Render SVG or placeholder */}
          🎨
        </div>
        
        {/* Title */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            color: '#ccff00',
            marginBottom: 30,
            textAlign: 'center',
            padding: '0 40px'
          }}
        >
          {listing.vector.name}
        </div>
        
        {/* Description */}
        <div
          style={{
            fontSize: 30,
            color: '#888',
            marginBottom: 60
          }}
        >
          Free Download • Commercial License
        </div>
        
        {/* Branding */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 'bold',
            color: 'white'
          }}
        >
          VEXURA.io
        </div>
      </div>
    ),
    {
      width: 1000,
      height: 1500
    }
  );
}
