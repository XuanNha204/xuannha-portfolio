export interface GitHubProject {
  name: string;
  description: string;
  url: string;
  homepage: string;
  language: string;
  topics: string[];
  stars: number;
  pushedAt: string;
}

type GitHubRepository = {
  name?: unknown;
  description?: unknown;
  html_url?: unknown;
  homepage?: unknown;
  language?: unknown;
  topics?: unknown;
  stargazers_count?: unknown;
  pushed_at?: unknown;
  fork?: unknown;
  archived?: unknown;
};

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";
}

export async function getGitHubProjects(): Promise<GitHubProject[]> {
  const username = (process.env.GITHUB_USERNAME || "XuanNha204").trim();
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) return [];

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Xnha.Dev-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&per_page=30`,
      { headers, next: { revalidate: 3600 } }
    );
    if (!response.ok) return [];
    const data = await response.json() as unknown;
    if (!Array.isArray(data)) return [];

    return (data as GitHubRepository[])
      .filter((repo) => repo.fork !== true && repo.archived !== true)
      .flatMap((repo) => {
        const name = text(repo.name, 100);
        const url = text(repo.html_url, 300);
        if (!name || !/^https:\/\/github\.com\//i.test(url)) return [];
        return [{
          name,
          description: text(repo.description, 300),
          url,
          homepage: text(repo.homepage, 300),
          language: text(repo.language, 50),
          topics: Array.isArray(repo.topics) ? repo.topics.map((topic) => text(topic, 40)).filter(Boolean).slice(0, 8) : [],
          stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
          pushedAt: text(repo.pushed_at, 40),
        }];
      })
      .slice(0, 10);
  } catch {
    return [];
  }
}
