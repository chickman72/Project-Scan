import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = process.env.COSMOS_DB_CONTAINER_ID;
const usersContainerId = process.env.COSMOS_DB_USERS_CONTAINER_ID;

if (!endpoint || !key || !databaseId || !containerId) {
  throw new Error("Missing Cosmos DB environment variables.");
}

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);
const usersContainer = usersContainerId
  ? database.container(usersContainerId)
  : null;

export { container, usersContainer };
