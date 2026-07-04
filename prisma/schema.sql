-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "discordId" TEXT,
    "username" TEXT,
    "discriminator" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "characterName" TEXT,
    "characterTitle" TEXT,
    "race" TEXT,
    "rank" TEXT NOT NULL DEFAULT 'F',
    "description" TEXT,
    "backstory" TEXT,
    "bannerColor" TEXT NOT NULL DEFAULT '#1a1a2e',
    "bannerUrl" TEXT,
    "avatarUrl" TEXT,
    "discordRoles" TEXT,
    "ether" INTEGER NOT NULL DEFAULT 1000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameJp" TEXT,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "imageUrl" TEXT,
    "config" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "maxStock" INTEGER,
    "totalSold" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "slot" TEXT,
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ShopItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "itemId" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Continent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "climate" TEXT NOT NULL DEFAULT 'Tempéré',
    "imageUrl" TEXT,
    "treasury" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Kingdom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "continentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "rank" INTEGER NOT NULL DEFAULT 1,
    "treasury" INTEGER NOT NULL DEFAULT 0,
    "taxRate" REAL NOT NULL DEFAULT 0.25,
    "population" INTEGER NOT NULL DEFAULT 0,
    "bannerUrl" TEXT,
    "guildId" TEXT,
    "discordRoleId" TEXT,
    "leaderId" TEXT,
    "priceModifier" REAL NOT NULL DEFAULT 1.2,
    "buybackRate" REAL NOT NULL DEFAULT 0.5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Kingdom_continentId_fkey" FOREIGN KEY ("continentId") REFERENCES "Continent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "continentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "emblemUrl" TEXT,
    "maxMembers" INTEGER NOT NULL DEFAULT 20,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Guild_continentId_fkey" FOREIGN KEY ("continentId") REFERENCES "Continent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BotPlayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "characterName" TEXT,
    "race" TEXT NOT NULL DEFAULT 'Humain',
    "socialRank" INTEGER NOT NULL DEFAULT 1,
    "bio" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "health" INTEGER NOT NULL DEFAULT 100,
    "maxHealth" INTEGER NOT NULL DEFAULT 100,
    "mana" INTEGER NOT NULL DEFAULT 50,
    "maxMana" INTEGER NOT NULL DEFAULT 50,
    "gold" INTEGER NOT NULL DEFAULT 500,
    "ether" INTEGER NOT NULL DEFAULT 1000,
    "kingdomId" TEXT,
    "guildId" TEXT,
    "lastSalaryAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BotPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BotPlayer_kingdomId_fkey" FOREIGN KEY ("kingdomId") REFERENCES "Kingdom" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BotPlayer_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerInventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "itemType" TEXT NOT NULL DEFAULT 'resource',
    "obtainedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerInventory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "BotPlayer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShopCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📦',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "KingdomShopItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "basePrice" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "itemType" TEXT NOT NULL DEFAULT 'resource',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KingdomShopItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ShopCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "kingdomId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "itemType" TEXT NOT NULL DEFAULT 'misc',
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "BotPlayer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MarketListing_kingdomId_fkey" FOREIGN KEY ("kingdomId") REFERENCES "Kingdom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MerchantStand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "kingdomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MerchantStand_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "BotPlayer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MerchantStand_kingdomId_fkey" FOREIGN KEY ("kingdomId") REFERENCES "Kingdom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StandItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "standId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "itemType" TEXT NOT NULL DEFAULT 'misc',
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT -1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StandItem_standId_fkey" FOREIGN KEY ("standId") REFERENCES "MerchantStand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PendingTrade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiatorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "offeredItems" TEXT NOT NULL DEFAULT '[]',
    "offeredGold" INTEGER NOT NULL DEFAULT 0,
    "requestedItems" TEXT NOT NULL DEFAULT '[]',
    "requestedGold" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "channelId" TEXT NOT NULL,
    "messageIds" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "PendingTrade_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "BotPlayer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PendingTrade_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "BotPlayer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiplomacyRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromContinentId" TEXT NOT NULL,
    "toContinentId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'neutral',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiplomacyRelation_fromContinentId_fkey" FOREIGN KEY ("fromContinentId") REFERENCES "Continent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiplomacyRelation_toContinentId_fkey" FOREIGN KEY ("toContinentId") REFERENCES "Continent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TradeRoute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromContinentId" TEXT NOT NULL,
    "toContinentId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "taxReduction" REAL NOT NULL DEFAULT 0.05,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TradeRoute_fromContinentId_fkey" FOREIGN KEY ("fromContinentId") REFERENCES "Continent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TradeRoute_toContinentId_fkey" FOREIGN KEY ("toContinentId") REFERENCES "Continent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "rewards" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'D',
    "category" TEXT NOT NULL DEFAULT 'exploration',
    "kingdomId" TEXT,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlayerQuest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "PlayerQuest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "BotPlayer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NPC" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "appearance" TEXT,
    "backstory" TEXT,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT,
    "avatarUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RpChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "npcId" TEXT,
    "context" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RpChannel_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPC" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NewsLetter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'system',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "label" TEXT NOT NULL DEFAULT '',
    "group" TEXT NOT NULL DEFAULT 'general',
    "type" TEXT NOT NULL DEFAULT 'text',
    "options" TEXT NOT NULL DEFAULT '[]',
    "hint" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "template" TEXT NOT NULL,
    "variables" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PinterestKeyword" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "weight" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GeneratedImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "basePrompt" TEXT,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "width" INTEGER NOT NULL DEFAULT 1024,
    "height" INTEGER NOT NULL DEFAULT 1024,
    "fileSize" INTEGER,
    "mimeType" TEXT NOT NULL DEFAULT 'image/png',
    "category" TEXT NOT NULL DEFAULT 'technique',
    "relatedId" TEXT,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "model" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PageBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "blockType" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL DEFAULT '{}',
    "config" TEXT NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CharacterSheet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pseudo" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "age" TEXT,
    "race" TEXT,
    "metier" TEXT,
    "histoire" TEXT,
    "description" TEXT,
    "stats" TEXT,
    "liens" TEXT,
    "captures" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectReason" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "logMessageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CharacterSheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscordCharacter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "webhookName" TEXT,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "embedColor" TEXT NOT NULL DEFAULT '#C9A84C',
    "title" TEXT,
    "description" TEXT,
    "personality" TEXT,
    "systemPrompt" TEXT,
    "aiModel" TEXT,
    "temperature" REAL NOT NULL DEFAULT 0.8,
    "maxResponseLength" INTEGER NOT NULL DEFAULT 500,
    "allowedChannels" TEXT NOT NULL DEFAULT '[]',
    "adminOnly" BOOLEAN NOT NULL DEFAULT true,
    "isNpc" BOOLEAN NOT NULL DEFAULT false,
    "npcContext" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CharacterConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT,
    "messages" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CharacterConversation_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "DiscordCharacter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "ShopItem_type_idx" ON "ShopItem"("type");

-- CreateIndex
CREATE INDEX "ShopItem_rarity_idx" ON "ShopItem"("rarity");

-- CreateIndex
CREATE INDEX "InventoryItem_userId_idx" ON "InventoryItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_userId_itemId_key" ON "InventoryItem"("userId", "itemId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Continent_name_key" ON "Continent"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_leaderId_key" ON "Guild"("leaderId");

-- CreateIndex
CREATE UNIQUE INDEX "BotPlayer_userId_key" ON "BotPlayer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BotPlayer_discordId_key" ON "BotPlayer"("discordId");

-- CreateIndex
CREATE INDEX "BotPlayer_discordId_idx" ON "BotPlayer"("discordId");

-- CreateIndex
CREATE INDEX "BotPlayer_kingdomId_idx" ON "BotPlayer"("kingdomId");

-- CreateIndex
CREATE INDEX "PlayerInventory_playerId_idx" ON "PlayerInventory"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerInventory_playerId_itemName_key" ON "PlayerInventory"("playerId", "itemName");

-- CreateIndex
CREATE UNIQUE INDEX "ShopCategory_name_key" ON "ShopCategory"("name");

-- CreateIndex
CREATE INDEX "KingdomShopItem_categoryId_idx" ON "KingdomShopItem"("categoryId");

-- CreateIndex
CREATE INDEX "KingdomShopItem_active_idx" ON "KingdomShopItem"("active");

-- CreateIndex
CREATE INDEX "MarketListing_kingdomId_idx" ON "MarketListing"("kingdomId");

-- CreateIndex
CREATE INDEX "MarketListing_sellerId_idx" ON "MarketListing"("sellerId");

-- CreateIndex
CREATE INDEX "MarketListing_active_idx" ON "MarketListing"("active");

-- CreateIndex
CREATE INDEX "PendingTrade_status_idx" ON "PendingTrade"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DiplomacyRelation_fromContinentId_toContinentId_key" ON "DiplomacyRelation"("fromContinentId", "toContinentId");

-- CreateIndex
CREATE UNIQUE INDEX "TradeRoute_fromContinentId_toContinentId_key" ON "TradeRoute"("fromContinentId", "toContinentId");

-- CreateIndex
CREATE INDEX "PlayerQuest_playerId_idx" ON "PlayerQuest"("playerId");

-- CreateIndex
CREATE INDEX "PlayerQuest_status_idx" ON "PlayerQuest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "NPC_channelId_key" ON "NPC"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "RpChannel_channelId_key" ON "RpChannel"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "RpChannel_npcId_key" ON "RpChannel"("npcId");

-- CreateIndex
CREATE INDEX "NewsLetter_userId_idx" ON "NewsLetter"("userId");

-- CreateIndex
CREATE INDEX "NewsLetter_userId_read_idx" ON "NewsLetter"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "SiteConfig_key_key" ON "SiteConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PromptTemplate_name_key" ON "PromptTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PinterestKeyword_keyword_key" ON "PinterestKeyword"("keyword");

-- CreateIndex
CREATE INDEX "PageBlock_pageId_idx" ON "PageBlock"("pageId");

-- CreateIndex
CREATE INDEX "PageBlock_pageId_sortOrder_idx" ON "PageBlock"("pageId", "sortOrder");

-- CreateIndex
CREATE INDEX "Friendship_userId_idx" ON "Friendship"("userId");

-- CreateIndex
CREATE INDEX "Friendship_friendId_idx" ON "Friendship"("friendId");

-- CreateIndex
CREATE INDEX "Friendship_status_idx" ON "Friendship"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userId_friendId_key" ON "Friendship"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSheet_userId_key" ON "CharacterSheet"("userId");

-- CreateIndex
CREATE INDEX "CharacterConversation_characterId_idx" ON "CharacterConversation"("characterId");

-- CreateIndex
CREATE INDEX "CharacterConversation_channelId_idx" ON "CharacterConversation"("channelId");

