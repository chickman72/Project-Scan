"use server";

import { getContainer } from "@/lib/cosmos";
import { generateVCard } from "@/lib/vcard";

const SHORT_CODE_LENGTH = 6;
const SHORT_CODE_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

type CreateContactQRInput = {
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  organization?: string;
  website?: string;
};

type ContactQRItem = {
  id: string;
  userId: string;
  shortCode: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  organization: string | null;
  website: string | null;
  vcard: string;
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
  const { resources } = await getContainer().items
    .query<Pick<ContactQRItem, "id">>({
      query:
        "SELECT VALUE c.id FROM c WHERE c.shortCode = @shortCode AND c.type = 'contact'",
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

export async function createContactQR(
  data: CreateContactQRInput
): Promise<ContactQRItem> {
  if (!data.userId || !data.firstName || !data.lastName) {
    throw new Error("Missing required fields.");
  }

  const shortCode = await createUniqueShortCode();
  const now = new Date().toISOString();

  const vcard = generateVCard({
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    email: data.email,
    organization: data.organization,
    website: data.website,
  });

  const item: ContactQRItem & { type: string } = {
    id: crypto.randomUUID(),
    userId: data.userId,
    shortCode,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone?.trim() || null,
    email: data.email?.trim() || null,
    organization: data.organization?.trim() || null,
    website: data.website?.trim() || null,
    vcard,
    clickCount: 0,
    createdAt: now,
    type: "contact",
  };

  await getContainer().items.create(item);

  return item;
}

export async function deleteContactQR(
  id: string,
  userId: string
): Promise<void> {
  if (!id || !userId) {
    throw new Error("Missing required fields.");
  }

  await getContainer().item(id, userId).delete();
}

export async function getContactQRs(userId: string): Promise<ContactQRItem[]> {
  if (!userId) {
    throw new Error("Missing user ID.");
  }

  const { resources } = await getContainer().items
    .query<ContactQRItem>({
      query:
        "SELECT * FROM c WHERE c.userId = @userId AND c.type = 'contact' ORDER BY c.createdAt DESC",
      parameters: [{ name: "@userId", value: userId }],
    })
    .fetchAll();

  return resources;
}
