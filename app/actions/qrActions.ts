"use server";

import { container } from "@/lib/cosmos";

const SHORT_CODE_LENGTH = 6;
const SHORT_CODE_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

type CreateQRInput = {
  userId: string;
  originalUrl: string;
  name?: string;
};

type QRItem = {
  id: string;
  userId: string;
  shortCode: string;
  originalUrl: string;
  name: string | null;
  clickCount: number;
  createdAt: string;
};

function generateShortCode(): string {
  let result = "";
  for (let i = 0; i < SHORT_CODE_LENGTH; i += 1) {
    const index = Math.floor(Math.random() * SHORT_CODE_ALPHABET.length);
    result += SHORT_CODE_ALPHABET[index];
  }
  return result;
}

async function isShortCodeUnique(shortCode: string): Promise<boolean> {
  const { resources } = await container.items
    .query<Pick<QRItem, "id">>({
      query: "SELECT VALUE c.id FROM c WHERE c.shortCode = @shortCode",
      parameters: [{ name: "@shortCode", value: shortCode }],
    })
    .fetchAll();

  return resources.length === 0;
}

async function createUniqueShortCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const shortCode = generateShortCode();
    if (await isShortCodeUnique(shortCode)) {
      return shortCode;
    }
  }

  throw new Error("Unable to generate a unique short code.");
}

export async function createQR(data: CreateQRInput): Promise<QRItem> {
  if (!data.userId || !data.originalUrl) {
    throw new Error("Missing required fields.");
  }

  const shortCode = await createUniqueShortCode();
  const now = new Date().toISOString();

  const item: QRItem = {
    id: crypto.randomUUID(),
    userId: data.userId,
    shortCode,
    originalUrl: data.originalUrl,
    name: data.name?.trim() || null,
    clickCount: 0,
    createdAt: now,
  };

  await container.items.create(item, { partitionKey: data.userId });

  return item;
}

export async function deleteQR(id: string, userId: string): Promise<void> {
  if (!id || !userId) {
    throw new Error("Missing required fields.");
  }

  await container.item(id, userId).delete();
}

export async function updateQR(
  id: string,
  userId: string,
  newName: string,
  newUrl: string
): Promise<void> {
  if (!id || !userId) {
    throw new Error("Missing required fields.");
  }

  const cleanedName = newName.trim();
  const cleanedUrl = newUrl.trim();

  if (!cleanedUrl) {
    throw new Error("Destination URL is required.");
  }

  await container.item(id, userId).patch([
    { op: "replace", path: "/name", value: cleanedName },
    { op: "replace", path: "/originalUrl", value: cleanedUrl },
  ]);
}

export async function getUserQRs(userId: string): Promise<QRItem[]> {
  if (!userId) {
    throw new Error("Missing userId.");
  }

  const { resources } = await container.items
    .query<QRItem>({
      query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC",
      parameters: [{ name: "@userId", value: userId }],
    })
    .fetchAll();

  return resources;
}
