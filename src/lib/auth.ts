import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "@/lib/db";

const VALIDATED_ROLE_ID = "1489344642796355720";
const DISCORD_GUILD_ID = process.env["DISCORD_GUILD_ID"] || "";

export const authOptions: NextAuthOptions = {
  providers: [
    // ─── Discord provider (only auth method) ─────────────────
    DiscordProvider({
      clientId: process.env['DISCORD_CLIENT_ID'] || "",
      clientSecret: process.env['DISCORD_CLIENT_SECRET'] || "",
      authorization: { params: { scope: "identify guilds guilds.members.read" } },
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "discord") {
        if (!account?.access_token || !profile) return false;

        const discordId = (profile as Record<string, unknown>).sub || (profile as Record<string, unknown>).id;
        if (!discordId || typeof discordId !== "string") return false;

        try {
          const upserted = await db.user.upsert({
            where: { discordId },
            create: {
              discordId,
              username: (profile as Record<string, string>).username || (profile as Record<string, string>).login,
              name: (profile as Record<string, string>).global_name || (profile as Record<string, string>).username || (profile as Record<string, string>).login,
              image: (profile as Record<string, string>).image_url || `https://cdn.discordapp.com/avatars/${discordId}/${(profile as Record<string, string>).avatar}.png`,
              email: (profile as Record<string, string>).email,
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              },
            },
            update: {
              username: (profile as Record<string, string>).username || (profile as Record<string, string>).login,
              name: (profile as Record<string, string>).global_name || (profile as Record<string, string>).username || (profile as Record<string, string>).login,
              image: (profile as Record<string, string>).image_url || `https://cdn.discordapp.com/avatars/${discordId}/${(profile as Record<string, string>).avatar}.png`,
              email: (profile as Record<string, string>).email,
            },
          });

          // Store the DB user id somewhere the jwt callback can read it
          // We use user.id override — but NextAuth may overwrite it. 
          // So we also set it on the user object as a custom field.
          (user as Record<string, unknown>)._dbUserId = upserted.id;

          // Check for "fiche validée" role in Discord guild
          let hasValidatedRole = false;
          if (DISCORD_GUILD_ID && account.access_token) {
            try {
              const res = await fetch(
                `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
                { headers: { Authorization: `Bearer ${account.access_token}` } }
              );
              if (res.ok) {
                const member = await res.json();
                hasValidatedRole = Array.isArray(member.roles) && member.roles.includes(VALIDATED_ROLE_ID);
              }
            } catch {
              // Non-critical
            }
          }
          (user as Record<string, unknown>)._hasValidatedRole = hasValidatedRole;

          const existingProfile = await db.profile.findUnique({ where: { userId: upserted.id } });
          if (!existingProfile) {
            await db.profile.create({
              data: {
                userId: upserted.id,
                characterName: (profile as Record<string, string>).global_name || (profile as Record<string, string>).username || "Inconnu",
              },
            });
          }
        } catch (err) {
          console.error("[Auth] Discord signIn DB error:", err);
          // Still allow sign-in — the JWT/session callbacks will handle missing data
        }
      }

      return true;
    },

    async session({ session, token }) {
      if (!session.user || !token.sub) return session;

      // Priority 1: Use cached DB user ID from JWT (no DB query needed)
      if (token.dbUserId) {
        session.user.id = token.dbUserId as string;
      } else if (token.discordId && token._discordResolved !== true) {
        // Priority 2: DB lookup by discordId (first request after sign-in)
        try {
          const user = await db.user.findUnique({
            where: { discordId: token.discordId as string },
            include: { profile: true },
          });
          if (user) {
            session.user.id = user.id;
            token.dbUserId = user.id; // Cache for future requests
            token._discordResolved = true;
          }
        } catch (err) {
          console.error("[Auth] Session callback DB error:", err);
        }
      }

      // Set extra fields from token
      if (token.discordId) session.user.discordId = token.discordId as string;
      if (token.username) session.user.username = token.username as string;
      if (token.hasValidatedRole) (session.user as Record<string, unknown>).hasValidatedRole = true;

      // Try to load profile from DB (non-critical, for display only)
      if (session.user.id) {
        try {
          const user = await db.user.findUnique({
            where: { id: session.user.id },
            include: { profile: true },
          });
          if (user?.profile) {
            (session.user as Record<string, unknown>).profile = user.profile;
          }
        } catch {
          // Non-critical — profile data is loaded separately by the component
        }
      }

      return session;
    },

    async jwt({ token, account, user, trigger }) {
      // Initial sign in — store all info in JWT
      if (user) {
        if (account?.provider === 'discord') {
          // For Discord: user.id from NextAuth is the Discord snowflake
          const discordId = (user as Record<string, unknown>).id as string;
          // Check if signIn callback stored the DB user ID
          const dbUserId = (user as Record<string, unknown>)._dbUserId as string | undefined;

          if (dbUserId) {
            token.sub = dbUserId;
            token.dbUserId = dbUserId;
          } else {
            token.sub = discordId; // Fallback
          }
          token.discordId = discordId;
          token.hasValidatedRole = (user as Record<string, unknown>)._hasValidatedRole as boolean;

          // Try to get username from DB
          try {
            const dbUser = await db.user.findUnique({ where: { discordId } });
            if (dbUser) {
              token.sub = dbUser.id;
              token.dbUserId = dbUser.id;
              token.username = dbUser.username;
            }
          } catch {
            // Non-critical
          }
        } else {
          // Fallback (should not happen with Discord-only auth)
          token.sub = user.id as string;
          token.dbUserId = user.id as string;
        }
      }

      return token;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    error: "/",
    signIn: "/",
  },
  secret: process.env['NEXTAUTH_SECRET'] || "ascension-secret-change-me",
};