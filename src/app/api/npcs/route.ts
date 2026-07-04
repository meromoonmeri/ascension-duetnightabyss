import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const npcs = await db.nPC.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        channelId: true,
        guildId: true,
        avatarUrl: true,
        personality: true,
        appearance: true,
        backstory: true,
        rpChannels: {
          where: { active: true },
          select: {
            channelId: true,
            guildId: true,
            context: true,
          },
        },
      },
    });

    return NextResponse.json(npcs);
  } catch (error) {
    console.error('[API /npcs] Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
