import { execSync } from 'child_process';

export interface GitCommit {
  hash: string;
  date: string;
  author: string;
  message: string;
}

export function getCommitsForDate(date: Date): GitCommit[] {
  try {
    const dateStr = date.toISOString().split('T')[0];
    
    // その日のコミットを取得（著者が自分のもののみ）
    const gitCommand = `git log --since="${dateStr} 00:00:00" --until="${dateStr} 23:59:59" --author="$(git config user.name)" --pretty=format:"%H|%ai|%an|%s"`;
    
    const output = execSync(gitCommand, { 
      encoding: 'utf-8',
      cwd: process.cwd()
    });

    if (!output.trim()) {
      return [];
    }

    return output.trim().split('\n').map(line => {
      const [hash, date, author, message] = line.split('|');
      return {
        hash: hash.substring(0, 7),
        date,
        author,
        message
      };
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not a git repository')) {
      throw new Error('現在のディレクトリはGitリポジトリではありません');
    }
    throw new Error('Gitコミット履歴の取得に失敗しました');
  }
}

export function generateDailyReport(commits: GitCommit[], date: Date): string {
  const dateStr = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  if (commits.length === 0) {
    return `📅 ${dateStr}の日報

❌ 本日はコミットがありませんでした。`;
  }

  const summary = summarizeCommits(commits);
  
  return `📅 ${dateStr}の日報

✅ 完了したタスク (${commits.length}件のコミット):

${summary}

📊 統計:
- 総コミット数: ${commits.length}件
- 作業時間帯: ${getWorkingHours(commits)}

🎯 主な成果:
${getMainAchievements(commits)}`;
}

function summarizeCommits(commits: GitCommit[]): string {
  return commits.map((commit, index) => {
    const time = new Date(commit.date).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${index + 1}. [${time}] ${commit.message} (${commit.hash})`;
  }).join('\n');
}

function getWorkingHours(commits: GitCommit[]): string {
  if (commits.length === 0) return 'なし';
  
  const times = commits.map(c => new Date(c.date));
  const earliest = new Date(Math.min(...times.map(t => t.getTime())));
  const latest = new Date(Math.max(...times.map(t => t.getTime())));
  
  const startTime = earliest.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const endTime = latest.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `${startTime} - ${endTime}`;
}

function getMainAchievements(commits: GitCommit[]): string {
  // コミットメッセージから主要な作業内容を抽出
  const keywords = {
    '新機能': ['add', 'feat', '追加', '新規', '実装'],
    'バグ修正': ['fix', 'bug', '修正', 'バグ'],
    'リファクタリング': ['refactor', 'リファクタ', '整理', '改善'],
    'ドキュメント': ['doc', 'docs', 'readme', 'ドキュメント'],
    'テスト': ['test', 'テスト', 'spec'],
    'スタイル': ['style', 'css', 'デザイン', 'ui']
  };

  const achievements: { [key: string]: number } = {};
  
  commits.forEach(commit => {
    const message = commit.message.toLowerCase();
    Object.entries(keywords).forEach(([category, words]) => {
      if (words.some(word => message.includes(word))) {
        achievements[category] = (achievements[category] || 0) + 1;
      }
    });
  });

  if (Object.keys(achievements).length === 0) {
    return '- 開発作業を継続実施';
  }

  return Object.entries(achievements)
    .sort(([,a], [,b]) => b - a)
    .map(([category, count]) => `- ${category}: ${count}件`)
    .join('\n');
}