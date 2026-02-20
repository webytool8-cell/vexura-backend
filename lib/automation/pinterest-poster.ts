interface PinterestPostData {
  title: string;
  description: string;
  board: string;
  imageUrl: string;
  link: string;
  altText: string;
}

export async function postToPinterest(data: PinterestPostData) {
  const boardId = await getBoardId(data.board);
  
  const response = await fetch('https://api.pinterest.com/v5/pins', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      board_id: boardId,
      media_source: {
        source_type: 'image_url',
        url: data.imageUrl
      },
      title: data.title,
      description: data.description,
      link: data.link,
      alt_text: data.altText
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Pinterest API error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  
  return {
    pinId: result.id,
    pinUrl: `https://pinterest.com/pin/${result.id}`,
    boardId: result.board_id
  };
}

async function getBoardId(boardName: string): Promise<string> {
  // Cache board IDs or fetch dynamically
  const boards: Record<string, string> = {
    'UI Design Icons': process.env.PINTEREST_BOARD_UI!,
    'Branding & Logos': process.env.PINTEREST_BOARD_BRANDING!,
    'Technology Icons': process.env.PINTEREST_BOARD_TECH!,
    'Nature & Organic': process.env.PINTEREST_BOARD_NATURE!,
    'Abstract Art': process.env.PINTEREST_BOARD_ABSTRACT!,
    'Business Icons': process.env.PINTEREST_BOARD_BUSINESS!,
    'Vector Icons Collection': process.env.PINTEREST_BOARD_DEFAULT!
  };

  return boards[boardName] || boards['Vector Icons Collection'];
}
