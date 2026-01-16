import { CosmosClient } from "@azure/cosmos";

let cachedClient: CosmosClient | null = null;

function getClient() {
  if (!cachedClient) {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_DB_KEY;

    if (!endpoint || !key) {
      throw new Error("Missing Cosmos DB environment variables.");
    }

    cachedClient = new CosmosClient({ endpoint, key });
  }

  return cachedClient;
}

function getDatabase() {
  const databaseId = process.env.COSMOS_DB_DATABASE_ID;

  if (!databaseId) {
    throw new Error("Missing Cosmos DB environment variables.");
  }

  return getClient().database(databaseId);
}

export function getContainer() {
  const containerId = process.env.COSMOS_DB_CONTAINER_ID;

  if (!containerId) {
    throw new Error("Missing Cosmos DB environment variables.");
  }

  return getDatabase().container(containerId);
}

export function getUsersContainer() {
  const usersContainerId = process.env.COSMOS_DB_USERS_CONTAINER_ID;

  if (!usersContainerId) {
    return null;
  }

  return getDatabase().container(usersContainerId);
}
