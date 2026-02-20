export async function generatePinterestImage(enrichedData: any, id: string) {
  // Use Vercel OG Image generation or Cloudinary
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  const imageUrl = `${baseUrl}/api/pinterest/image/${id}`;
  
  return {
    url: imageUrl,
    width: 1000,
    height: 1500
  };
}
