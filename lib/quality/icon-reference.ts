// lib/quality/icon-reference.ts
import fetch from 'node-fetch';

// Function to fetch top 150 Tabler icon names from GitHub
export async function fetchTopTablerIcons(): Promise<string[]> {
  const repoUrl = 'https://api.github.com/repos/tabler/tabler-icons/contents/icons';
  const response = await fetch(repoUrl);
  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

  const files = await response.json();
  const iconNames: string[] = files
    .filter((file: any) => file.name.endsWith('.svg'))
    .map((file: any) => file.name.replace('.svg', ''));

  // Take only top 150
  return iconNames.slice(0, 150);
}

// Export a promise that resolves immediately for convenience
export const iconReferenceList = fetchTopTablerIcons();
