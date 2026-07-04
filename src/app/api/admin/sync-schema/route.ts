import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ADMIN_DISCORD_ID = "722146261381415043";

// POST /api/admin/sync-schema — Trigger automatic schema sync to Turso
// Runs the same logic as scripts/sync-schema.ts but as an API endpoint
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user as Record<string, unknown>).discordId !== ADMIN_DISCORD_ID
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const result = await runSync();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Admin sync-schema error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/admin/sync-schema — Return sync status (dry run)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user as Record<string, unknown>).discordId !== ADMIN_DISCORD_ID
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const status = await dryRun();
    return NextResponse.json({ success: true, ...status });
  } catch (error: any) {
    console.error("Admin sync-schema dry-run error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    );
  }
}

// ─── Inline sync logic (same as scripts/sync-schema.ts) ───

const PRISMA_TO_SQLITE: Record<string, string> = {
  String: "TEXT",
  Int: "INTEGER",
  Float: "REAL",
  Boolean: "BOOLEAN",
  DateTime: "DATETIME",
};

interface SchemaField {
  name: string;
  type: string;
  prismaType: string;
  optional: boolean;
  isId: boolean;
  isUnique: boolean;
  defaultVal: string | null;
}

interface SchemaIndex {
  name: string;
  fields: string[];
  isUnique: boolean;
}

interface SchemaFK {
  fromTable: string;
  fromField: string;
  toTable: string;
  toField: string;
  onDelete?: string;
}

interface SchemaModel {
  name: string;
  fields: SchemaField[];
  indexes: SchemaIndex[];
  fks: SchemaFK[];
  primaryKey: string | null;
}

function createLibsqlClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@libsql/client");
  const url = process.env["DATABASE_URL"] || "";
  const authToken = process.env["TURSO_AUTH_TOKEN"] || undefined;
  if (!url.startsWith("libsql://") && !url.startsWith("https://")) {
    throw new Error("Not a Turso database");
  }
  return createClient({ url, authToken });
}

function parseSchema(content: string) {
  const models = new Map<string, SchemaModel>();
  const modelNames = new Set<string>();

  // Pass 1: model names
  const modelNameRegex = /^model\s+(\w+)\s*\{/gm;
  let m;
  while ((m = modelNameRegex.exec(content)) !== null) {
    modelNames.add(m[1]);
  }

  // Pass 2: parse models
  const modelBlockRegex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  let match;

  while ((match = modelBlockRegex.exec(content)) !== null) {
    const modelName = match[1];
    const body = match[2];
    const fields: SchemaField[] = [];
    const indexes: SchemaIndex[] = [];
    const fks: SchemaFK[] = [];
    let primaryKey: string | null = null;

    const lines = body.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*"))
        continue;
      if (trimmed.startsWith("@@")) {
        const uniqueMatch = trimmed.match(
          /^@@unique\(\[([^\]]+)\)\)(?:\s+"([^"]+)")?/
        );
        if (uniqueMatch) {
          const fieldList = uniqueMatch[1]
            .split(",")
            .map((f: string) => f.trim().replace(/"/g, ""));
          const name =
            uniqueMatch[2] || `${modelName}_${fieldList.join("_")}_key`;
          indexes.push({ name, fields: fieldList, isUnique: true });
          continue;
        }
        const indexMatch = trimmed.match(
          /^@@index\(\[([^\]]+)\]\)(?:\s+"([^"]+)")?/
        );
        if (indexMatch) {
          const fieldList = indexMatch[1]
            .split(",")
            .map((f: string) => f.trim().replace(/"/g, ""));
          const name =
            indexMatch[2] || `${modelName}_${fieldList.join("_")}_idx`;
          indexes.push({ name, fields: fieldList, isUnique: false });
          continue;
        }
        continue;
      }

      const fieldMatch = trimmed.match(/^(\w+)\s+(\w+)(\??)([\s\S]*)$/);
      if (!fieldMatch) continue;

      const fieldName = fieldMatch[1];
      const rawType = fieldMatch[2];
      const optional = fieldMatch[3] === "?";
      const rest = fieldMatch[4].trim();

      // Skip virtual relation fields (type matches a model name)
      if (modelNames.has(rawType)) {
        const fkRegex =
          /@relation(?:\s*"[^"]*")?\s*,\s*fields:\s*\[(\w+)\]\s*,\s*references:\s*\[(\w+)\](?:\s*,\s*onDelete:\s*(\w+))?/;
        const fkMatch = rest.match(fkRegex);
        if (fkMatch) {
          fks.push({
            fromTable: modelName,
            fromField: fkMatch[1],
            toTable: "",
            toField: fkMatch[2],
            onDelete: fkMatch[3],
          });
        }
        continue;
      }

      const sqlType = PRISMA_TO_SQLITE[rawType] || "TEXT";
      let isId = false;
      let isUnique = false;
      let defaultVal: string | null = null;

      if (rest.includes("@id")) {
        isId = true;
        primaryKey = fieldName;
      }
      if (rest.includes("@unique")) isUnique = true;
      const defaultMatch = rest.match(/@default\(([^)]+)\)/);
      if (defaultMatch) defaultVal = defaultMatch[1].trim();

      fields.push({
        name: fieldName,
        type: sqlType,
        prismaType: rawType,
        optional,
        isId,
        isUnique,
        defaultVal,
      });
    }

    models.set(modelName, {
      name: modelName,
      fields,
      indexes,
      fks,
      primaryKey,
    });
  }

  // Pass 3: resolve FK target tables
  for (const [, model] of models) {
    for (const fk of model.fks) {
      if (fk.toTable) continue;
      for (const [, candidate] of models) {
        if (candidate.primaryKey === fk.toField) {
          fk.toTable = candidate.name;
          break;
        }
      }
    }
  }

  return { models, modelNames };
}

function prismaDefaultToSql(field: SchemaField): string | null {
  if (field.defaultVal === null) return null;
  if (
    field.defaultVal === "cuid()" ||
    field.defaultVal === "uuid()" ||
    field.defaultVal === "autoincrement()"
  )
    return null;
  let val = field.defaultVal;
  if (val === "now()") return "CURRENT_TIMESTAMP";
  if (val === "true") return "1";
  if (val === "false") return "0";
  if (field.prismaType === "String" && !val.startsWith("CURRENT")) {
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      return val;
    return `'${val}'`;
  }
  return val;
}

function fieldToColumnDef(field: SchemaField): string {
  let def = `"${field.name}" ${field.type}`;
  if (field.isId) {
    def += " NOT NULL PRIMARY KEY";
  } else if (!field.optional) {
    const sqlDefault = prismaDefaultToSql(field);
    if (sqlDefault !== null) {
      def += ` NOT NULL DEFAULT ${sqlDefault}`;
    } else {
      def += " NOT NULL";
    }
  } else {
    const sqlDefault = prismaDefaultToSql(field);
    if (sqlDefault !== null) {
      def += ` DEFAULT ${sqlDefault}`;
    }
  }
  if (field.isUnique && !field.isId) def += " UNIQUE";
  return def;
}

function generateCreateTable(model: SchemaModel): string {
  const parts: string[] = [];
  for (const field of model.fields) parts.push(fieldToColumnDef(field));
  for (const fk of model.fks) {
    if (!fk.toTable) continue;
    const onDelete = fk.onDelete
      ? ` ON DELETE ${fk.onDelete.toUpperCase()}`
      : "";
    parts.push(
      `CONSTRAINT "${model.name}_${fk.fromField}_fkey" FOREIGN KEY ("${fk.fromField}") REFERENCES "${fk.toTable}" ("${fk.toField}")${onDelete}`
    );
  }
  return `CREATE TABLE IF NOT EXISTS "${model.name}" (\n  ${parts.join(",\n  ")}\n);`;
}

function generateAddColumn(table: string, field: SchemaField): string {
  let sql = `ALTER TABLE "${table}" ADD COLUMN "${field.name}" ${field.type}`;
  const sqlDefault = prismaDefaultToSql(field);
  if (sqlDefault !== null) sql += ` DEFAULT ${sqlDefault}`;
  return sql + ";";
}

function generateCreateIndex(model: SchemaModel, index: SchemaIndex): string {
  const unique = index.isUnique ? "UNIQUE " : "";
  const fieldsStr = index.fields.map((f) => `"${f}"`).join(", ");
  return `CREATE ${unique}INDEX IF NOT EXISTS "${index.name}" ON "${model.name}"(${fieldsStr});`;
}

function topologicalSort(models: Map<string, SchemaModel>): string[] {
  const visited = new Set<string>();
  const result: string[] = [];
  function visit(name: string) {
    if (visited.has(name)) return;
    visited.add(name);
    const model = models.get(name);
    if (model) {
      for (const fk of model.fks) {
        if (fk.toTable && fk.toTable !== name) visit(fk.toTable);
      }
    }
    result.push(name);
  }
  for (const name of models.keys()) visit(name);
  return result;
}

// ─── Dry run: compute what would change without applying ───
async function dryRun() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@libsql/client");
  const url = process.env["DATABASE_URL"] || "";
  const authToken = process.env["TURSO_AUTH_TOKEN"] || undefined;

  if (!url.startsWith("libsql://") && !url.startsWith("https://")) {
    return { isTurso: false, message: "Local SQLite — use prisma db push" };
  }

  const client = createClient({ url, authToken });

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readFileSync } = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { join } = require("path");
    const schemaContent = readFileSync(
      join(process.cwd(), "prisma", "schema.prisma"),
      "utf-8"
    );
    const { models } = parseSchema(schemaContent);

    const existingTables = new Set<string>();
    const tablesResult = await client.execute(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
    );
    for (const row of tablesResult.rows) existingTables.add(row.name as string);

    const missingTables: string[] = [];
    const missingColumns: { table: string; field: string; type: string }[] = [];
    const missingIndexes: { name: string; table: string; fields: string[] }[] = [];

    for (const [name, model] of models) {
      if (!existingTables.has(name)) {
        missingTables.push(name);
        continue;
      }
      const colsResult = await client.execute(`PRAGMA table_info("${name}")`);
      const existingCols = new Set(colsResult.rows.map((r: any) => r.name));
      for (const field of model.fields) {
        if (!existingCols.has(field.name)) {
          missingColumns.push({
            table: name,
            field: field.name,
            type: field.type,
          });
        }
      }
      const idxResult = await client.execute(
        `SELECT name FROM sqlite_master WHERE type='index' AND tbl_name=? AND name NOT LIKE 'sqlite_%'`,
        [name]
      );
      const existingIdxs = new Set(idxResult.rows.map((r: any) => r.name));
      for (const index of model.indexes) {
        if (!existingIdxs.has(index.name)) {
          missingIndexes.push({
            name: index.name,
            table: name,
            fields: index.fields,
          });
        }
      }
    }

    return {
      isTurso: true,
      existingTables: existingTables.size,
      schemaModels: models.size,
      missingTables,
      missingColumns,
      missingIndexes,
      needsSync:
        missingTables.length > 0 ||
        missingColumns.length > 0 ||
        missingIndexes.length > 0,
    };
  } finally {
    client.close();
  }
}

// ─── Actual sync ───────────────────────────────────────
async function runSync() {
  const client = createLibsqlClient();

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readFileSync } = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { join } = require("path");
    const schemaContent = readFileSync(
      join(process.cwd(), "prisma", "schema.prisma"),
      "utf-8"
    );
    const { models } = parseSchema(schemaContent);

    const existingTables = new Set<string>();
    const tablesResult = await client.execute(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
    );
    for (const row of tablesResult.rows) existingTables.add(row.name as string);

    let tablesCreated = 0;
    let columnsAdded = 0;
    let indexesCreated = 0;
    const changes: string[] = [];

    // Create missing tables (topologically sorted)
    const sorted = topologicalSort(models);
    for (const name of sorted) {
      const model = models.get(name)!;
      if (!existingTables.has(name)) {
        const sql = generateCreateTable(model);
        try {
          await client.execute(sql);
          tablesCreated++;
          changes.push(`Table "${name}" created`);
        } catch (err: any) {
          changes.push(`ERROR creating "${name}": ${err.message}`);
        }
      }
    }

    // Add missing columns
    for (const [, model] of models) {
      if (!existingTables.has(model.name)) continue;
      const colsResult = await client.execute(
        `PRAGMA table_info("${model.name}")`
      );
      const existingCols = new Set(colsResult.rows.map((r: any) => r.name));
      for (const field of model.fields) {
        if (!existingCols.has(field.name)) {
          const sql = generateAddColumn(model.name, field);
          try {
            await client.execute(sql);
            columnsAdded++;
            changes.push(
              `Column ${model.name}.${field.name} (${field.type}) added`
            );
          } catch (err: any) {
            changes.push(
              `ERROR adding ${model.name}.${field.name}: ${err.message}`
            );
          }
        }
      }
    }

    // Create missing indexes
    for (const [, model] of models) {
      const idxResult = await client.execute(
        `SELECT name FROM sqlite_master WHERE type='index' AND tbl_name=? AND name NOT LIKE 'sqlite_%'`,
        [model.name]
      );
      const existingIdxs = new Set(idxResult.rows.map((r: any) => r.name));
      for (const index of model.indexes) {
        if (!existingIdxs.has(index.name)) {
          const sql = generateCreateIndex(model, index);
          try {
            await client.execute(sql);
            indexesCreated++;
            changes.push(
              `Index "${index.name}" on ${model.name}(${index.fields.join(", ")}) created`
            );
          } catch (err: any) {
            changes.push(`ERROR creating index "${index.name}": ${err.message}`);
          }
        }
      }
    }

    // Also run prisma generate to update client
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { execSync } = require("child_process");
      execSync("npx prisma generate", { cwd: process.cwd(), timeout: 30000 });
      changes.push("Prisma client regenerated");
    } catch {
      changes.push("WARNING: prisma generate failed");
    }

    return {
      tablesCreated,
      columnsAdded,
      indexesCreated,
      changes,
    };
  } finally {
    client.close();
  }
}