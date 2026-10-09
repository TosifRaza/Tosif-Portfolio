import { useEffect, useMemo, useState } from 'react';
import { Github } from 'lucide-react';
import { api } from '@/utils/api';

const CONTRIBUTION_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

function buildWeeks(contributions) {
  if (!contributions.length) return [];

  const byDate = new Map(contributions.map((day) => [day.date, day]));
  const first = new Date(`${contributions[0].date}T00:00:00Z`);
  const last = new Date(`${contributions[contributions.length - 1].date}T00:00:00Z`);
  first.setUTCDate(first.getUTCDate() - first.getUTCDay());
  const dayCount = Math.floor((last - first) / 86400000) + 1;
  const weekCount = Math.ceil(dayCount / 7);

  return Array.from({ length: weekCount }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(first);
      date.setUTCDate(first.getUTCDate() + weekIndex * 7 + dayIndex);
      const key = date.toISOString().slice(0, 10);
      return { date: key, ...(byDate.get(key) || { count: 0, level: 0 }) };
    })
  );
}

export default function GitHubContributions({ githubUrl }) {
  const username = githubUrl?.match(/github\.com\/([^/?#]+)/i)?.[1];
  const [calendar, setCalendar] = useState(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!username) return undefined;
    let controller;
    let disposed = false;

    setCalendar(null);
    setUnavailable(false);
    const refreshCalendar = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const data = await api.getGithubContributions(controller.signal);
        if (!disposed) {
          setCalendar(data);
          setUnavailable(false);
        }
      } catch (error) {
        if (!disposed && error.name !== 'AbortError') setUnavailable(true);
      }
    };

    refreshCalendar();
    const refreshTimer = window.setInterval(refreshCalendar, 24 * 60 * 60 * 1000);

    return () => {
      disposed = true;
      window.clearInterval(refreshTimer);
      controller?.abort();
    };
  }, [username]);

  const weeks = useMemo(() => buildWeeks(calendar?.contributions || []), [calendar]);
  const total = calendar?.total ?? 0;

  if (!username) return null;

  return (
    <section className="mt-7 w-full min-w-0 rounded-xl border border-border bg-card/60 p-3 sm:p-4" aria-label="GitHub contributions">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">GitHub Activity</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {calendar ? `${total} contributions in the last 6 months` : unavailable ? 'Contribution graph is temporarily unavailable' : 'Loading contribution activity…'}
          </p>
        </div>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary/80"
        >
          <Github size={14} /> View profile
        </a>
      </div>

      {weeks.length > 0 && (
        <div className="mt-3 overflow-x-auto pb-1">
          <div className="w-max">
            <div className="ml-[26px] flex gap-[3px]" aria-hidden="true">
              {weeks.map((week, index) => {
                const monthStart = week.find((day) => day.date.endsWith('-01')) || (index === 0 ? week[0] : null);
                return (
                  <span key={index} className="h-3 w-2.5 text-[9px] leading-3 text-muted-foreground">
                    {monthStart ? new Date(`${monthStart.date}T00:00:00Z`).toLocaleString('en', { month: 'short', timeZone: 'UTC' }) : ''}
                  </span>
                );
              })}
            </div>
            <div className="mt-1 flex gap-1.5">
              <div className="flex w-5 flex-col justify-between py-0.5 text-[8px] leading-[8px] text-muted-foreground" aria-hidden="true">
                <span>Mon</span><span>Wed</span><span>Fri</span>
              </div>
              <div className="flex gap-[3px]" role="img" aria-label={`${total} GitHub contributions over the last 6 months`}>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((day) => (
                      <span
                        key={day.date}
                        title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`}
                        className="h-2.5 w-2.5 rounded-[2px]"
                        style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(day.color || '') ? day.color : CONTRIBUTION_COLORS[day.level] || CONTRIBUTION_COLORS[0] }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
