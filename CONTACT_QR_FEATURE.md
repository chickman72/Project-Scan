# Contact Information QR Code Feature

## Overview
The application now includes the ability to generate QR codes that encode contact information in vCard (VCF) format. Users can create shareable QR codes containing:

- First Name
- Last Name
- Phone Number
- Email Address
- Organization
- Website

## How It Works

### 1. **Creating Contact QR Codes**
Users can navigate to their dashboard and click "Create Contact QR" to open the contact QR generator form. The form requires:
- **First Name** (required)
- **Last Name** (required)
- Phone (optional)
- Email (optional)
- Organization (optional)
- Website (optional)

After filling in the contact information, the app generates:
1. A vCard (VCF) file with the contact details
2. A unique short code (e.g., `/c/AbCdEf`)
3. A QR code image that encodes the short link
4. A shareable link that can be distributed

### 2. **Sharing Contact QR Codes**
Users can:
- Copy the short link to clipboard
- Share the QR code image
- View the link in a new window
- Each scan is tracked with a click counter

### 3. **Retrieving Contact Information**
When someone scans a contact QR code or visits the short link:
1. The user is directed to `/c/[shortCode]`
2. The server increments the click counter
3. The vCard file is automatically downloaded to their device
4. Users can import the contact into their phone/email client

## Implementation Details

### New Files Created

1. **[lib/vcard.ts](lib/vcard.ts)**
   - Generates vCard (RFC 6350) format strings from contact data
   - Properly escapes special characters for vCard format

2. **[app/actions/contactActions.ts](app/actions/contactActions.ts)**
   - Server actions for creating and managing contact QR codes
   - `createContactQR()` - Creates a new contact QR code
   - `deleteContactQR()` - Deletes a contact QR code
   - `getContactQRs()` - Retrieves all contact QR codes for a user

3. **[app/c/[shortCode]/route.ts](app/c/[shortCode]/route.ts)**
   - API route handler for contact QR code lookups
   - Returns vCard file with proper headers for download
   - Tracks click counts

4. **[components/ContactQRGenerator.tsx](components/ContactQRGenerator.tsx)**
   - React component for creating contact QR codes
   - Displays generated QR code and contact information
   - Copy link and delete functionality

5. **[components/ContactQRCard.tsx](components/ContactQRCard.tsx)**
   - React component for displaying saved contact QR codes
   - Shows contact preview and click tracking
   - Delete and share options

### Modified Files

1. **[app/actions/qrActions.ts](app/actions/qrActions.ts)**
   - Updated `getUserQRs()` to exclude contact QR codes
   - Contact QRs are filtered by `type: 'contact'` field

2. **[components/DashboardClient.tsx](components/DashboardClient.tsx)**
   - Added contact QR management state
   - Integrated ContactQRGenerator and ContactQRCard components
   - Organized QR codes into sections (Contact vs URL)
   - Added toggle to show/hide contact QR form

## Database Schema

Contact QR codes are stored in the same Cosmos DB container with the following structure:

```typescript
{
  id: string;                  // UUID
  userId: string;              // Partition key
  type: "contact";             // Identifies as contact QR
  shortCode: string;           // Unique 6-character code
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  organization: string | null;
  website: string | null;
  vcard: string;              // Full vCard (VCF) content
  clickCount: number;          // Number of scans/downloads
  createdAt: string;           // ISO timestamp
}
```

## Key Features

✅ **Full Contact Information Support**
- All standard contact fields (name, phone, email, org, website)

✅ **Standard vCard Format**
- RFC 6350 compliant vCard files
- Works with all major email clients and phone contact apps
- Automatic download on scan

✅ **Track Usage**
- Click counter for each contact QR code
- Creation date tracking

✅ **User-Friendly Dashboard**
- Organized sections for Contact and URL QR codes
- Quick access buttons for copy, view, and delete
- Contact information preview in card view

✅ **Secure & Private**
- Contact data stored per-user in database
- Short codes require authentication to manage
- Proper access control via userId

## Usage Example

1. Go to Dashboard
2. Click "Create Contact QR" in the Contact QR Codes section
3. Fill in contact details (First Name and Last Name required)
4. Click "Create Contact QR"
5. Copy the short link or share the QR code image
6. When scanned, the QR code downloads a .vcf file that can be imported into contacts

## Future Enhancement Ideas

- Edit existing contact QR codes
- Bulk create contact QRs from CSV
- Social media integration (LinkedIn, etc.)
- vCard version 4.0 support with additional fields
- Custom domain for short links
- Advanced analytics dashboard
