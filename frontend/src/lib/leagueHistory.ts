import type { Match, Team, WeekSnapshot } from "../types";
import { computeLeagueTable } from "./leagueTable";

function parseMatchDateTime(value: string): Date {
  return new Date(value.endsWith("Z") ? value : `${value}Z`);
}

function getIsoWeek(date: Date): { year: number; week: number } {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return { year: utc.getUTCFullYear(), week };
}

function mondayOfIsoWeek(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const weekOneMonday = new Date(jan4);
  weekOneMonday.setUTCDate(jan4.getUTCDate() - day + 1);
  const monday = new Date(weekOneMonday);
  monday.setUTCDate(weekOneMonday.getUTCDate() + (week - 1) * 7);
  return monday;
}

function isoWeekEnd(year: number, week: number): Date {
  const monday = mondayOfIsoWeek(year, week);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  return sunday;
}

function seasonIsoWeeks(matches: Match[]): Array<[number, number, Date]> {
  if (matches.length === 0) {
    return [];
  }

  const playedDates = matches.map((match) =>
    parseMatchDateTime(match.matchDateTime),
  );
  const earliest = getIsoWeek(
    new Date(Math.min(...playedDates.map((date) => date.getTime()))),
  );
  const latest = getIsoWeek(
    new Date(Math.max(...playedDates.map((date) => date.getTime()))),
  );

  const weeks: Array<[number, number, Date]> = [];
  let cursor = mondayOfIsoWeek(earliest.year, earliest.week);
  const endMonday = mondayOfIsoWeek(latest.year, latest.week);

  while (cursor.getTime() <= endMonday.getTime()) {
    const cal = getIsoWeek(cursor);
    weeks.push([cal.year, cal.week, isoWeekEnd(cal.year, cal.week)]);
    cursor = new Date(cursor);
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }

  return weeks;
}

export function computeHistory(teams: Team[], matches: Match[]): WeekSnapshot[] {
  return seasonIsoWeeks(matches).map(([year, week, weekEnd]) => {
    const rows = computeLeagueTable(teams, matches, weekEnd);
    return {
      week: `${String(year).padStart(4, "0")}-W${String(week).padStart(2, "0")}`,
      weekEnd: weekEnd.toISOString(),
      standings: rows.map((row) => ({
        teamId: row.teamId,
        teamName: row.teamName,
        position: row.position,
        points: row.points,
        playedMatches: row.played,
      })),
    };
  });
}
