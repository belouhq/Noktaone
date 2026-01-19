/**
 * Format relative time with i18n support
 * Returns human-readable strings: "Just now", "X min ago", "Today – HH:mm", etc.
 */

export function formatRelativeTime(
  timestamp: Date,
  t: (key: string) => string
): string {
  const now = new Date();
  
  // Validate timestamp
  if (isNaN(timestamp.getTime()) || timestamp.getTime() > now.getTime()) {
    return t('time.todayAt').replace('{{time}}', '') || 'Today';
  }
  
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // "Just now" (< 1 min)
  if (diffMins < 1) {
    const translated = t('home.justNow');
    return translated !== 'home.justNow' ? translated : 'Just now';
  }

  // "X min ago" (< 60 min, same day)
  if (diffMins < 60 && now.toDateString() === timestamp.toDateString()) {
    const translated = t('time.minutesAgo');
    if (translated !== 'time.minutesAgo' && translated.includes('{{count}}')) {
      return translated.replace('{{count}}', String(diffMins));
    }
    // English fallback with singular/plural
    return diffMins === 1 ? '1 min ago' : `${diffMins} min ago`;
  }

  // "X hours ago" (< 24 hours, same day)
  if (diffHours < 24 && now.toDateString() === timestamp.toDateString()) {
    const translated = t('time.hoursAgo');
    if (translated !== 'time.hoursAgo' && translated.includes('{{count}}')) {
      return translated.replace('{{count}}', String(diffHours));
    }
    // English fallback with singular/plural
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  // "Today – HH:mm" (same day, > 1 hour)
  if (now.toDateString() === timestamp.toDateString()) {
    const timeStr = timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    const translated = t('time.todayAt');
    if (translated !== 'time.todayAt' && translated.includes('{{time}}')) {
      return translated.replace('{{time}}', timeStr);
    }
    return `Today – ${timeStr}`;
  }

  // "Yesterday"
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (timestamp.toDateString() === yesterday.toDateString()) {
    const translated = t('time.yesterday');
    return translated !== 'time.yesterday' ? translated : 'Yesterday';
  }

  // "X days ago" (handle singular/plural)
  const translated = t('time.daysAgo');
  if (translated !== 'time.daysAgo' && translated.includes('{{count}}')) {
    const result = translated.replace('{{count}}', String(diffDays));
    // Handle singular/plural in English fallback
    if (diffDays === 1 && result.includes('days')) {
      return result.replace('days', 'day');
    }
    return result;
  }
  // English fallback with singular/plural
  return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
}
