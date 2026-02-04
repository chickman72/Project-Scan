import { NextResponse } from "next/server";
import { getContainer } from "@/lib/cosmos";

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
  type?: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  const { resources } = await getContainer().items
    .query<ContactQRItem>({
      query:
        "SELECT * FROM c WHERE c.shortCode = @shortCode AND c.type = 'contact'",
      parameters: [{ name: "@shortCode", value: shortCode }],
    })
    .fetchAll();

  const item = resources[0];

  if (!item) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Increment click count
  await getContainer()
    .item(item.id, item.userId)
    .patch([{ op: "incr", path: "/clickCount", value: 1 }]);

  // Return vCard file with proper headers
  return new NextResponse(item.vcard, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${item.firstName}_${item.lastName}.vcf"`,
    },
  });
}
