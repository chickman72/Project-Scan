"use server";

import { usersContainer } from "@/lib/cosmos";
import { hashPassword } from "@/lib/password";

type RegisterInput = {
  email: string;
  password: string;
};

type UserItem = {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
};

export async function registerUser(data: RegisterInput) {
  if (!usersContainer) {
    throw new Error("Users container is not configured.");
  }

  const email = data.email.trim().toLowerCase();
  const password = data.password.trim();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  try {
    const { resource: existing } = await usersContainer
      .item(email, email)
      .read<UserItem>();
    if (existing) {
      throw new Error("An account with that email already exists.");
    }
  } catch (error) {
    const notFound =
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: number }).code === 404;
    if (!notFound) {
      throw error;
    }
  }

  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();

  const item: UserItem = {
    id: email,
    email,
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: now,
  };

  await usersContainer.items.create(item, { partitionKey: email });

  return { id: item.id, email: item.email };
}
