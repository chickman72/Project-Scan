/**
 * Generate a vCard (VCF format) string from contact information
 * vCard format: https://tools.ietf.org/html/rfc6350
 */
export function generateVCard(contact: {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  organization?: string;
  website?: string;
}): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCardValue(`${contact.firstName} ${contact.lastName}`.trim())}`,
    `N:${escapeVCardValue(contact.lastName)};${escapeVCardValue(contact.firstName)};;;`,
  ];

  if (contact.email) {
    lines.push(`EMAIL:${escapeVCardValue(contact.email)}`);
  }

  if (contact.phone) {
    lines.push(`TEL:${escapeVCardValue(contact.phone)}`);
  }

  if (contact.organization) {
    lines.push(`ORG:${escapeVCardValue(contact.organization)}`);
  }

  if (contact.website) {
    lines.push(`URL:${escapeVCardValue(contact.website)}`);
  }

  lines.push("END:VCARD");

  return lines.join("\r\n");
}

/**
 * Escape special characters in vCard values
 */
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}
