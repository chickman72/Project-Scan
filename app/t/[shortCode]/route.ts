import { NextResponse } from "next/server";

import { container } from "@/lib/cosmos";

type QRItem = {
  id: string;
  userId: string;
  shortCode: string;
  originalUrl: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  const { resources } = await container.items
    .query<QRItem>({
      query: "SELECT * FROM c WHERE c.shortCode = @shortCode",
      parameters: [{ name: "@shortCode", value: shortCode }],
    })
    .fetchAll();

  const item = resources[0];

  if (!item) {
    return new NextResponse("Not found", { status: 404 });
  }

  await container
    .item(item.id, item.userId)
    .patch([{ op: "incr", path: "/clickCount", value: 1 }]);

  return NextResponse.redirect(item.originalUrl, 307);
}
