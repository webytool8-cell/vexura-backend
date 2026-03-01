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

function resolveDefaultBoardId(): string | undefined {
  return (
    process.env.PINTEREST_BOARD_DEFAULT ||
    process.env.PINTEREST_BOARD_TEST ||
    process.env.PINTEREST_BOARD_UI ||
    process.env.PINTEREST_BOARD_BRANDING ||
    process.env.PINTEREST_BOARD_TECH ||
    process.env.PINTEREST_BOARD_NATURE ||
    process.env.PINTEREST_BOARD_ABSTRACT ||
    process.env.PINTEREST_BOARD_BUSINESS
  );
}

async function getBoardId(boardName: string): Promise<string> {
  const defaultBoardId = resolveDefaultBoardId();

  const boards: Record<string, string | undefined> = {
    'UI Design Icons': process.env.PINTEREST_BOARD_UI || process.env.PINTEREST_BOARD_TEST || defaultBoardId,
    'Branding & Logos': process.env.PINTEREST_BOARD_BRANDING || process.env.PINTEREST_BOARD_TEST || defaultBoardId,
    'Technology Icons': process.env.PINTEREST_BOARD_TECH || process.env.PINTEREST_BOARD_TEST || defaultBoardId,
    'Nature & Organic': process.env.PINTEREST_BOARD_NATURE || process.env.PINTEREST_BOARD_TEST || defaultBoardId,
    'Abstract Art': process.env.PINTEREST_BOARD_ABSTRACT || process.env.PINTEREST_BOARD_TEST || defaultBoardId,
    'Business Icons': process.env.PINTEREST_BOARD_BUSINESS || process.env.PINTEREST_BOARD_TEST || defaultBoardId,
    'Vector Icons Collection': defaultBoardId
  };

  const resolvedBoardId = boards[boardName] || boards['Vector Icons Collection'];

  if (!resolvedBoardId) {
    throw new Error(
      'Pinterest board ID is not configured. Set PINTEREST_BOARD_DEFAULT or PINTEREST_BOARD_TEST.'
    );
  }

  return resolvedBoardId;
}
