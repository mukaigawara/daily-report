import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { getCommitsForDate, generateDailyReport } from './git-utils.js';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateReport = async () => {
      try {
        const today = new Date();
        const commits = await getCommitsForDate(today);
        const dailyReport = generateDailyReport(commits, today);
        setReport(dailyReport);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, []);

  if (loading) {
    return (
      <Box>
        <Text>📊 日報を生成中...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color="red">❌ エラー: {error}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text>{report}</Text>
    </Box>
  );
};