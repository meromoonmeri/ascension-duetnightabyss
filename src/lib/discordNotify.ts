// ─── Types ───────────────────────────────────────────────────────────────────

export interface DMOptions {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number | string;
    image?: { url: string };
    thumbnail?: { url: string };
    footer?: { text: string; icon_url?: string };
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp?: string;
  }>;
}

export interface MessageOptions extends DMOptions {
  components?: Array<{
    type: 1;
    components: Array<{
      type: 2;
      style: number; // 1=primary(blue), 2=secondary(grey), 3=success(green), 4=danger(red)
      label: string;
      custom_id: string;
      emoji?: { name: string; id?: string };
    }>;
  }>;
}

export interface WebhookOptions {
  name: string;
  avatarUrl?: string;
  content?: string;
  embeds?: DMOptions["embeds"];
  threadId?: string; // reply in thread
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ─── Notification Types ─────────────────────────────────────────────────────

export interface NotificationTypeConfig {
  label: string;
  color: number;
  emoji: string;
}

export const NOTIFICATION_TYPES: Record<string, NotificationTypeConfig> = {
  friend_request: {
    label: "Nouvelle demande d'ami",
    color: 0xc9a84c,
    emoji: "\u{1F91D}",
  },
  friend_accepted: {
    label: "Demande d'ami accept\u00e9e",
    color: 0x22c55e,
    emoji: "\u2705",
  },
  friend_removed: {
    label: "Ami retir\u00e9",
    color: 0xef4444,
    emoji: "\u274C",
  },
  trade_request: {
    label: "Nouvelle demande d'\u00e9change",
    color: 0xc9a84c,
    emoji: "\u{1F4B1}",
  },
  trade_accepted: {
    label: "\u00c9change accept\u00e9",
    color: 0x22c55e,
    emoji: "\u2705",
  },
  trade_declined: {
    label: "\u00c9change refus\u00e9",
    color: 0xef4444,
    emoji: "\u274C",
  },
  private_message: {
    label: "Nouveau message priv\u00e9",
    color: 0x6366f1,
    emoji: "\u{1F48C}",
  },
  invite: {
    label: "Nouvelle invitation",
    color: 0xc9a84c,
    emoji: "\u{1F389}",
  },
  announcement: {
    label: "Annonce importante",
    color: 0xf59e0b,
    emoji: "\u{1F4E2}",
  },
  mention: {
    label: "Vous avez \u00e9t\u00e9 mentionn\u00e9",
    color: 0x3b82f6,
    emoji: "\u{1F514}",
  },
  validation_accepted: {
    label: "Fiche de personnage valid\u00e9e",
    color: 0x22c55e,
    emoji: "\u2705",
  },
  validation_rejected: {
    label: "Fiche de personnage refus\u00e9e",
    color: 0xef4444,
    emoji: "\u274C",
  },
  validation_revision: {
    label: "Fiche en attente de modifications",
    color: 0xf59e0b,
    emoji: "\u23F3",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function hexToNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

/** Normalise embed color fields so the API always receives a number. */
function normalizeEmbeds(
  embeds?: DMOptions["embeds"]
): DMOptions["embeds"] | undefined {
  if (!embeds) return undefined;
  return embeds.map((e) => ({
    ...e,
    color: e.color !== undefined
      ? typeof e.color === "string"
        ? hexToNumber(e.color)
        : e.color
      : undefined,
  }));
}

function authHeaders(): Record<string, string> {
  const token = process.env['DISCORD_TOKEN'];
  if (!token) throw new Error("DISCORD_TOKEN is not set");
  return {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  };
}

const DISCORD_API = "https://discord.com/api/v10";

// ─── Send DM ─────────────────────────────────────────────────────────────────

export async function sendDM(
  discordId: string,
  options: DMOptions
): Promise<SendResult> {
  try {
    const headers = authHeaders();

    // 1. Create (or retrieve) a DM channel with the target user
    const dmRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
      method: "POST",
      headers,
      body: JSON.stringify({ recipient_id: discordId }),
    });

    if (!dmRes.ok) {
      const text = await dmRes.text().catch(() => "");
      return {
        success: false,
        error: `Failed to create DM channel (${dmRes.status}): ${text}`,
      };
    }

    const dmChannel = (await dmRes.json()) as { id: string };

    // 2. Send the message to that channel
    const msgRes = await fetch(
      `${DISCORD_API}/channels/${dmChannel.id}/messages`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...options,
          embeds: normalizeEmbeds(options.embeds),
        }),
      }
    );

    if (!msgRes.ok) {
      const text = await msgRes.text().catch(() => "");
      return {
        success: false,
        error: `Failed to send DM (${msgRes.status}): ${text}`,
      };
    }

    const message = (await msgRes.json()) as { id: string };
    return { success: true, messageId: message.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Send Channel Message ────────────────────────────────────────────────────

export async function sendChannelMessage(
  channelId: string,
  options: MessageOptions
): Promise<SendResult> {
  try {
    const headers = authHeaders();

    const msgRes = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...options,
        embeds: normalizeEmbeds(options.embeds),
      }),
    });

    if (!msgRes.ok) {
      const text = await msgRes.text().catch(() => "");
      return {
        success: false,
        error: `Failed to send channel message (${msgRes.status}): ${text}`,
      };
    }

    const message = (await msgRes.json()) as { id: string };
    return { success: true, messageId: message.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Send Webhook Message ────────────────────────────────────────────────────

export async function sendWebhookMessage(
  channelId: string,
  options: WebhookOptions
): Promise<SendResult> {
  try {
    const headers = authHeaders();

    // 1. Look for an existing webhook with the same name in this channel
    const listRes = await fetch(
      `${DISCORD_API}/channels/${channelId}/webhooks`,
      { headers }
    );

    if (!listRes.ok) {
      const text = await listRes.text().catch(() => "");
      return {
        success: false,
        error: `Failed to list webhooks (${listRes.status}): ${text}`,
      };
    }

    const webhooks = (await listRes.json()) as Array<{
      id: string;
      token: string;
      name: string;
    }>;

    let webhook = webhooks.find((w) => w.name === options.name);

    // 2. Create a new webhook if none matched
    if (!webhook) {
      const createRes = await fetch(
        `${DISCORD_API}/channels/${channelId}/webhooks`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ name: options.name, avatar_url: options.avatarUrl }),
        }
      );

      if (!createRes.ok) {
        const text = await createRes.text().catch(() => "");
        return {
          success: false,
          error: `Failed to create webhook (${createRes.status}): ${text}`,
        };
      }

      webhook = (await createRes.json()) as { id: string; token: string; name: string };
    }

    // 3. Execute the webhook
    const threadParam = options.threadId
      ? `?thread_id=${options.threadId}`
      : "";

    const execRes = await fetch(
      `${DISCORD_API}/webhooks/${webhook.id}/${webhook.token}${threadParam}?wait=true`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: options.content,
          embeds: normalizeEmbeds(options.embeds),
          username: options.name,
          avatar_url: options.avatarUrl,
        }),
      }
    );

    if (!execRes.ok) {
      const text = await execRes.text().catch(() => "");
      return {
        success: false,
        error: `Failed to execute webhook (${execRes.status}): ${text}`,
      };
    }

    const message = (await execRes.json()) as { id: string };
    return { success: true, messageId: message.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}