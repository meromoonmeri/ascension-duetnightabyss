import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env['DATABASE_URL'] || '';
  const tursoToken = process.env['TURSO_AUTH_TOKEN'] || '';
  const discordClientId = process.env['DISCORD_CLIENT_ID'] || '';
  const discordSecret = process.env['DISCORD_CLIENT_SECRET'] || '';
  const nextauthSecret = process.env['NEXTAUTH_SECRET'] || '';
  const nextauthUrl = process.env['NEXTAUTH_URL'] || '';
  const discordToken = process.env['DISCORD_TOKEN'] || '';
  const cfToken = process.env['CF_API_TOKEN'] || '';
  const cfAccount = process.env['CF_ACCOUNT_ID'] || '';
  const geminiKey = process.env['GEMINI_API_KEY'] || '';

  // Mask sensitive values, show type for DATABASE_URL
  const maskDbUrl = dbUrl
    ? dbUrl === 'undefined'
      ? 'LITERAL STRING "undefined" ⚠️'
      : dbUrl.startsWith('libsql://')
        ? `libsql://${dbUrl.replace(/:[^@]+@/, ':***@').substring(10, 30)}...`
        : dbUrl.startsWith('file:')
          ? dbUrl.substring(0, 30)
          : `UNKNOWN FORMAT: "${dbUrl.substring(0, 20)}..."`
    : 'NOT SET';

  return NextResponse.json({
    DATABASE_URL: {
      status: dbUrl ? 'SET' : 'NOT SET',
      value: maskDbUrl,
      isUndefined: dbUrl === 'undefined',
      isTurso: dbUrl.startsWith('libsql://'),
      isFile: dbUrl.startsWith('file:'),
    },
    TURSO_AUTH_TOKEN: tursoToken ? `SET (${tursoToken.substring(0, 8)}...)` : 'NOT SET',
    NEXTAUTH_SECRET: nextauthSecret ? 'SET' : 'NOT SET ⚠️',
    NEXTAUTH_URL: nextauthUrl || 'NOT SET ⚠️',
    DISCORD_CLIENT_ID: discordClientId || 'NOT SET',
    DISCORD_CLIENT_SECRET: discordSecret ? `SET (${discordSecret.substring(0, 4)}...)` : 'NOT SET ⚠️',
    DISCORD_TOKEN: discordToken ? `SET (${discordToken.substring(0, 8)}...)` : 'NOT SET',
    CF_API_TOKEN: cfToken ? `SET (${cfToken.substring(0, 8)}...)` : 'NOT SET',
    CF_ACCOUNT_ID: cfAccount ? `SET (${cfAccount.substring(0, 8)}...)` : 'NOT SET',
    GEMINI_API_KEY: geminiKey ? 'SET' : 'NOT SET',
    NODE_ENV: process.env['NODE_ENV'] || 'NOT SET',
    PORT: process.env['PORT'] || 'NOT SET',
    allEnvKeys: Object.keys(process.env).sort(),
  });
}
