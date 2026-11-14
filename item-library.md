# Website Intake – Item Library (Draft)

*Draft for Sandy Dietz, Director of Operations / PM, Brandastic*

*November 13, 2026 (America/Los\_Angeles)*

# Purpose

This is the master item library for a future client onboarding site. Each item below will become a card on a private client page, at a link like website.brandastic.com/nextmod-7f3k. Cards are grouped into three phases, shown as accordions. The current phase opens first, and clients can open later phases and get ahead if they want.

The copy under each item is written for the client, in plain language. When you set up a client on the admin page, you will pick a preset, then add or remove items so they only see what applies to them.

## **How statuses will work**

Each card will have two statuses, not a single checkbox:

* The client clicks “I sent it” when they have uploaded a file, shared a link, or sent an invite.  
* You mark the item “Received” once you have what you need, or “Needs changes” with a short note if something is missing or unusable. The client will see that note on their card.

Clients will upload files to their Google Drive folder (linked at the top of their page), not to the website itself. Access items, such as Analytics or DNS, are still marked “I sent it” after the invite has been sent.

Due dates are set once per phase, not per item. Every card in a phase shows the same due date.

Unless a card says otherwise, clients should invite seo@brandastic.com rather than share a password.

## **Presets**

Each item lists which presets include it by default. You can still add or remove that item for a specific client.

* A — WordPress brochure site (a marketing website, no online store)  
* B — WordPress \+ e-commerce (WordPress with an online store, such as WooCommerce)  
* C — Shopify

## **What's in this library**

* Phase 1 — Design: 13 items  
* Phase 2 — Development: 8 items  
* Phase 3 — QA & Launch: 5 items  
* Total: 26 items

Google Tag Manager and Google Search Console are included as selectable options in Phase 1, alongside Analytics. reCAPTCHA remains a Phase 2 option for WordPress presets (A and B).

For Menu Navigation and Products, you can add a Google Drive folder or Google Doc link on the card. Clients use that link to review or drop in the content.

## **Decisions**

Sandy’s answers have been applied throughout this library. Short summary:

1. Analytics options — Keep Analytics, reCAPTCHA, Tag Manager, and Search Console as selectable options. The current website.brandastic.com/onboarding page is going away. Google Tag Manager and Google Search Console are added as Phase 1 items in presets A, B, and C. reCAPTCHA stays in Phase 2, presets A and B.  
2. Website Login stays on presets A and B only. It does not appear on Shopify (preset C) by default.  
3. Blog Import is off by default in A, B, and C. Add it when the client has an existing blog to move.  
4. reCAPTCHA stays on presets A and B only. Shopify’s built-in spam protection covers it.  
5. SMTP stays WordPress-only (A and B) and optional. That is also right for Shopify (no SMTP card on C).  
6. Team Headshots and Bios is off by default in A, B, and C. Add it when the sitemap includes a Team page.  
7. Final Review Sign-off on Staging has been removed. It is not intake.  
8. Menu Navigation, page copy, Forms, Redirects, and Products cards each have a Google Drive folder or Google Doc link that you can add. Clients use that link to review or drop in content.  
9. Clients should still invite seo@brandastic.com, except where a card says otherwise.  
10. For the WordPress login, the username is brandastic and the email is dev@brandastic.com.  
11. Kinsta role stays Company Developer.  
12. No additional DNS registrar steps. GoDaddy, Cloudflare, and Namecheap remain, plus the existing “different company” fallback.  
13. Copywriting add-on wording has been removed. Content cards now point clients to the folder or doc linked on the card to drop in content.  
14. Image guidelines stay at a minimum of 2,000 pixels wide, JPG or PNG, and no watermarks.  
15. The same “I sent it” label is used for access items (invite sent) and for file items.  
16. Due dates are set once per phase, not per item.

### **Still open**

* Analytics options were added as four separate items (Analytics, Tag Manager, Search Console, and reCAPTCHA). If you wanted one combined Analytics card with four sub-options, say so and we can combine them.  
* The WordPress username is kept as lowercase brandastic. Your answer was written “Brandastic”; tell us if you want the username capitalized.

# Phase 1 — Design

This phase gathers what we need to start design: the page list, website content, brand files, photos, and access to the domain and current site.

## **Menu Navigation**

**What we need**

A decision on each page in the list below: keep it, remove it, or rename it. Add any pages that are missing.

**Why we need it**

The menu and page list have to be settled before we start design, so we don’t rebuild the layout later.

**Steps**

1. For each page, choose Keep, Remove, or Rename. If you rename a page, type the new name.
2. Use Add a page for anything that isn’t on the list.
3. Click I sent it when the list is right.

**Done looks like**

Every page is marked keep, remove, or rename, and any extra pages you need are listed.

**Card type:** Form

**Presets:** A, B, and C

**Default phase:** Phase 1 — Design

## **Analytics Access**

**What we need**

Access to your Google Analytics 4 property (the report that shows how people find and use your website). Please add seo@brandastic.com as a user. Don’t share your password.

**Why we need it**

We use Analytics to set up tracking on the new site and to understand your current traffic.

**Steps**

1. Visit Google Analytics. Go to analytics.google.com, then click Admin (the gear icon, lower left).  
2. Go to Account Access Management. Under the Account column, select Account Access Management.  
3. Add us as Administrator. Click the \+ button, then Add users. Enter seo@brandastic.com, select Administrator, and click Add.

**Done looks like**

seo@brandastic.com has been added as an Administrator on the account.

**Presets:** A, B, and C

**Default phase:** Phase 1 — Design

## **Google Tag Manager**

**What we need**

Access to your Google Tag Manager container (the place that holds tracking tags for your website). Please add seo@brandastic.com as a user with permission to publish. Don’t share your password.

**Why we need it**

We use Tag Manager to add and update tracking on the new site without having to change the site code each time.

**Steps**

1. Sign in to Google Tag Manager at [tagmanager.google.com](https://tagmanager.google.com) and open the container for this website.  
2. Click Admin.  
3. In the Container column, click User Management.  
4. Click the \+ button, then Add users.  
5. Enter seo@brandastic.com, choose the Publish permission, and click Invite.

If you don’t have Google Tag Manager yet, skip the steps above and tell us. We’ll help you set it up.

**Done looks like**

seo@brandastic.com has been invited with Publish permission, or you’ve told us you don’t have Tag Manager yet.

**Presets:** A, B, and C

**Default phase:** Phase 1 — Design

## **Google Search Console**

**What we need**

Access to your Google Search Console property (the report that shows how Google finds and lists your website). Please add seo@brandastic.com as a user with Full permission. Don’t share your password.

**Why we need it**

We use Search Console to check that the new site can be found in Google and to fix issues after launch.

**Steps**

1. Sign in to Google Search Console at [search.google.com/search-console](https://search.google.com/search-console) and open the property for this website.  
2. Click Settings (the gear icon).  
3. Click Users and permissions.  
4. Click Add user.  
5. Enter seo@brandastic.com, choose the Full permission, and click Add.

If you don’t have Google Search Console yet, skip the steps above and tell us. We’ll help you set it up.

**Done looks like**

seo@brandastic.com has been added with Full permission, or you’ve told us you don’t have Search Console yet.

**Presets:** A, B, and C

**Default phase:** Phase 1 — Design

## **DNS Access**

**What we need**

Access to the place where your domain’s DNS is managed (DNS is the setting that points your domain name, like yourcompany.com, to your website). Common places are GoDaddy, Cloudflare, and Namecheap. Please add seo@brandastic.com. Don’t share your password.

**Why we need it**

We need this access to connect your domain to the new website on launch day, without waiting on a last-minute login.

**Steps**

1. Tell us where your domain is managed (GoDaddy, Cloudflare, Namecheap, or somewhere else). If you’re not sure, tell us where you bought the domain and we’ll help you find it.  
2. Follow the steps for your provider below. You don’t need to share your password.

### **If you use GoDaddy**

1. Sign in at godaddy.com.  
2. Click your name in the top right and choose Account Settings.  
3. Click Delegate Access.  
4. Under People who can access my account, click Invite to Access.  
5. Enter the name Brandastic and the email seo@brandastic.com. Choose Domains Only, then click Invite.

If you have several domains and only want us to manage one, tell us after we accept the invite. We can then walk you through limiting access with a domain folder.

### **If you use Cloudflare**

1. Sign in at dash.cloudflare.com.  
2. Go to Manage Account, then Members. (You can also open Members from the account menu.)  
3. Click Invite members.  
4. Enter seo@brandastic.com.  
5. Under permission policies, set the scope to a specific domain, select your domain, choose the Domain Administrator role (or Domain DNS, if you only want us to edit DNS), then click Create policy.  
6. Scroll to the bottom and click Invite members to send the invitation.

### **If you use Namecheap**

1. Sign in at namecheap.com.  
2. Open Domain List and click Manage next to your domain.  
3. Open the Sharing & Transfer tab, then find Share Access.  
4. Enter seo@brandastic.com and add us as a manager. Choose Advanced DNS (so we can edit the settings that point your domain to the website), then confirm. You may be asked for your Namecheap password to confirm — that stays with you; please don’t send it to us.  
5. We’ll accept the invitation from our Namecheap account.

### **If you use a different company**

1. Look for a section called Users, Members, Sharing, or Delegate access.  
2. Invite seo@brandastic.com with permission to edit DNS records (the settings that point your domain to the website).  
3. Tell us the company name so we know where to accept the invite. If the screens aren’t clear, send us a note and we’ll walk you through it.

**Done looks like**

You’ve told us where the domain is managed, and seo@brandastic.com has been invited with permission to edit DNS.

**Presets:** A, B, and C

**Default phase:** Phase 1 — Design

## **Server / Hosting (WordPress only)**

**What we need**

The name of the company that currently hosts your WordPress site (for example, Kinsta, WP Engine, SiteGround, or GoDaddy). If the site is already on Kinsta, please invite seo@brandastic.com.

**Why we need it**

We need to know where the current site lives so we can plan the build and the move to the new site, if there is one.

**Steps**

1. Tell us the name of your current host. If you’re not sure, check an old invoice, ask your IT person, or send us a note and we’ll help you find it.  
2. If the site is not on Kinsta, you can stop here unless we later ask for access.

### **If your site is already on Kinsta**

1. Sign in to MyKinsta.  
2. From the dashboard, click Company settings, then Users, then Invite users. (Only a Company Owner or Company Administrator can invite someone at the company level.)  
3. Enter seo@brandastic.com.  
4. Select Company, then choose the Company Developer role. This lets us work on the site without seeing billing.  
5. Click Send invite. We’ll get an email and accept it.  
6. If you can’t invite at the company level, open the site in MyKinsta, go to User management, click Invite users, enter seo@brandastic.com, choose Site developer, and send the invite.

**Done looks like**

You’ve told us the current host, and, if the site is on Kinsta, seo@brandastic.com has been invited.

**Card type:** I sent it

**Presets:** A and B

**Default phase:** Phase 1 — Design

## **Shopify Collaborator Access (Shopify only)**

**What we need**

Your store’s myshopify.com address (for example, yourstore.myshopify.com) and the 4-digit collaborator request code. A collaborator is a special Shopify login for a partner or agency. You approve the request, you choose the permissions, and you can remove us later. Don’t share your password.

**Why we need it**

This is how we work in your Shopify store to build and launch the new site, without using your personal login.

**Steps**

1. In your Shopify admin, go to Settings, then Users (it may say Users and permissions).  
2. Open Security and find the Collaborators section.  
3. Copy the 4-digit collaborator request code.  
4. Send us that code plus your store’s myshopify.com address.  
5. We’ll send a collaborator request. You’ll get an email and a notice in Shopify. Go to Settings \> Users, filter by Requests, review the permissions, and click Accept request. Sharing the code does not give us access until you approve the request.

**Done looks like**

You’ve sent the myshopify address and the 4-digit code. After we send the request, please accept it in Shopify.

**Card type:** I sent it

**Presets:** C

**Default phase:** Phase 1 — Design

## **Brand Logos**

**What we need**

High-resolution versions of your logo, ideally as SVG, plus PNG. If you also have an EPS file, send that too. Include full-color, white, and one-color versions if you have them.

**Why we need it**

The logo is used throughout the design, and a sharp file keeps it from looking blurry on the site.

**Steps**

1. Gather the original logo files from your designer or brand kit, not a small version copied from the current website.  
2. Upload them to the Google Drive folder linked at the top of your page. SVG is best because it stays sharp at any size. Please also include a PNG, and an EPS if you have one.  
3. If you have more than one version (full color, white, or one color), upload all of them.  
4. If you can’t find a high-resolution file, tell us and we’ll work with what you have.

**Done looks like**

The logo files are in your Drive folder, or you’ve told us you only have a lower-resolution file.

**Presets:** A, B, and C

**Default phase:** Phase 1 — Design

## **Brand Style**

**What we need**

Three websites you like and why, three words that describe your brand, and anything you want us to avoid.

**Why we need it**

These notes keep the design pointed at your taste before we start layout.

**Steps**

1. Add three sites you like, and a short reason for each.  
2. Enter three words that describe your brand.  
3. Tell us anything to avoid, if you have it.

**Done looks like**

All three sites, the three words, and any notes to avoid are filled in.

**Card type:** Form

**Presets:** A, B, and C

**Default phase:** Phase 1 — Design

## **Brand Colors or Standards**

**What we need**

Your brand colors. Add up to five colors, or tell us to use the colors from your logo.

**Why we need it**

Settling colors early keeps the design consistent and avoids rework later.

**Steps**

1. Add between one and five brand colors below, or check “Use our logo colors.”

**Done looks like**

You’ve added your colors, or checked that we should use the logo colors.

**Card type:** Form

**Presets:** A, B, and C

**Default phase:** Phase 1 — Design

## **Website Content**

**What we need**

Your website text, added to the content doc we created for you. Each tab in the doc is one page of your site.

**Why we need it**

We use this text to build each page. If you'd like to keep text from your current site for a page, just tell us.

**Steps**

1. Open your content doc using the button below.  
2. Click the tab for each page.  
3. Paste or write your text under each section heading.  
4. Below, mark each page “My content is in the doc” or “Use my current site.”

**Done looks like**

Every page is marked as in the doc or using the current site.

**Presets:** A, B, and C

**Default phase:** Phase 1 — Design

## **Image or Video Assets**

**What we need**

Photos or videos we can use on the site. If you don’t have any, we’ll use stock images (ready-made photos we’re licensed to use) and confirm them with you.

**Why we need it**

Real photos of your work, team, or location make the design feel like your company. We need them early so the first design isn’t a placeholder.

**Steps**

1. Gather the photos and videos you’d like us to use. Please send the original files, not screenshots, and avoid images with watermarks (the stamped logo or text some stock sites add).  
2. For photos, JPG or PNG is fine. A width of at least 2,000 pixels is a helpful target for large banners, but send the largest file you have.  
3. Upload the files to your Drive folder, or share a folder link with seo@brandastic.com.  
4. If you don’t have photos or videos to send, tell us and we’ll use licensed stock images.

**Done looks like**

Your photos and videos are in the Drive folder, or you’ve asked us to use stock images.

**Presets:** A, B, and C

**Default phase:** Phase 1 — Design

## **Team Headshots**

**What we need**

A headshot for each person on the Team tab of your content doc. Name each file to match that person’s name.

**Why we need it**

The Team page needs a clear photo for each person, and matching file names keeps them paired with the right name.

**Steps**

1. Upload each headshot below. The files go in the 04 Team folder.  
2. Name each file to match a name in the Team tab of your content doc.

**Done looks like**

A headshot is uploaded for each person, and each file name matches a name in the Team tab.

**Card type:** File

**File folder:** 04 Team

**Presets: Off by default in A, B, and C. Add this item when the sitemap includes a Team page.**

**Default phase:** Phase 1 — Design

## **Website Login (existing WordPress site)**

**What we need**

A new WordPress admin login of our own on your current site, so we can review pages, copy, and images. Please don’t share your personal username and password.

**Why we need it**

Access to the current site helps us reuse what should be kept, and later set up redirects so old links still work.

**Steps**

1. Sign in to your current WordPress dashboard (the web address often ends in /wp-admin).  
2. Go to Users, then Add User (it may say Add New).  
3. Create a user with the username brandastic, the email dev@brandastic.com, and the Administrator role.  
4. Leave the option turned on to send the new user an email, then click Add User. We’ll receive the email and set our own password. Please don’t send us your personal login.  
5. Send us the web address you use to sign in, if it isn’t obvious.  
6. If your current site is not WordPress (for example, Squarespace or Wix), skip the steps above and tell us what you use. We’ll give you the right access steps.

**Done looks like**

The brandastic admin user has been created and we’ve received the email, or you’ve told us the current site is not WordPress.

**Presets:** A and B

**Default phase:** Phase 1 — Design

# Phase 2 — Development

This phase gathers form email settings, social links, and any store or integration access we need to finish the build.

## **Social Accounts**

**What we need**

The web address for each social profile you want linked from the site. Mark N/A for any you don’t use.

**Why we need it**

These links usually go in the header, footer, or contact area, and we want them to be the right, current profiles.

**Steps**

1. For each network below, paste the full web address (starting with https://), or check N/A.

**Done looks like**

Every network has a web address or is marked N/A.

**Card type:** Form

**Presets:** A, B, and C

**Default phase:** Phase 2 — Development

## **Form Email Settings**

**What we need**

Where each form should send, and the mailbox it should come from. The form fields themselves live in the content doc, on the page where that form sits.

**Why we need it**

If the inbox or the from address is wrong, form messages can go missing or land in spam.

**Steps**

1. Add a row for each form: the form name and the email address (or addresses) that should receive it.  
2. Enter the from email. This usually matches your sending mailbox, such as info@yourcompany.com.  
3. On a WordPress site, also tell us your email provider, the sending mailbox, and an IT contact if you have one.

**Done looks like**

Each form has a name and a send-to email, and the from email is filled in. WordPress sites also include the email provider and sending mailbox.

**Card type:** Form

**Presets:** A, B, and C

**Default phase:** Phase 2 — Development

## **Product Export (e-commerce only)**

**What we need**

A current list of your products, either as a CSV file (a spreadsheet) or through access to the current store so we can export it.

**Why we need it**

We use this list to set up the new store with the right names, prices, and images.

**Steps**

1. If you’ve already given us access to the current WordPress site or Shopify store, tell us we can export the products ourselves.  
2. If you’d rather send a file: in many stores you’ll find an Export option under Products. Download a CSV and drop it into the Google Drive folder or Google Doc linked on this card.  
3. If you can’t export a file, use the Google Drive folder or Google Doc linked on this card and include the product name, description, price, and a link to each image.  
4. Include product images, or tell us where to find them.

**Done looks like**

We have a product CSV, access to export it, or a completed list in the linked folder or doc, plus a way to get the images.

**Presets:** B and C

**Default phase:** Phase 2 — Development

## **Third-Party Integrations**

**What we need**

Each outside tool the new site should connect to (for example, Mailchimp, a booking tool, a chat widget, or a CRM), what it’s used for, and confirmation that you’ve sent us access.

**Why we need it**

These connections often take time to set up, and we don’t want to discover a required tool late in the build.

**Steps**

1. Add a row for each tool: the tool name, what it’s used for, and check “I sent access” after you’ve invited seo@brandastic.com. Please don’t send your personal password.  
2. If you don’t have any tools to connect, check that instead.

**Done looks like**

Every tool has a name, a use, and “I sent access,” or you’ve confirmed there are none.

**Card type:** Form

**Presets:** A, B, and C

**Default phase:** Phase 2 — Development

## **Blog Import (including media)**

**What we need**

Access to your current blog, including the posts and their images, so we can move them to the new site. You can skip this if you don’t have a blog to move.

**Why we need it**

Moving old posts (and their pictures) keeps your writing online and helps search traffic continue to work after launch.

**Steps**

1. If you already created a WordPress login for us on the current site, tell us we can export the blog from there, including images.  
2. If the blog lives somewhere else (another host, Shopify, or a platform like Medium), tell us where it is and how we can access it.  
3. If you only want some posts moved, send us the list. If you don’t have a blog to import, say so and we’ll skip this.

**Done looks like**

We have access (or a file) to move the posts and images, or you’ve confirmed there’s no blog to import.

**Presets: Off by default in A, B, and C. Add this item when the client has an existing blog to move.**

**Default phase:** Phase 2 — Development

## **reCAPTCHA Keys**

**What we need**

Google reCAPTCHA keys for your domain (reCAPTCHA is a Google tool that helps keep spam out of your forms), and seo@brandastic.com added as an owner.

**Why we need it**

We add this to your forms so junk submissions are filtered out, and having our email on the key means we can help if something breaks later.

**Steps**

1. Go to [https\://www\.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) and sign in with a Google account.  
2. Create a new site. Give it a label (your company name is fine), choose reCAPTCHA v3, and add your domain. If we’ve already given you a staging address (the private preview of the new site), add that domain too.  
3. Submit, then copy the site key and the secret key.  
4. Open the key’s settings and add seo@brandastic.com under Owners, then save. Each owner email must be a Google account.  
5. Send us both keys, or just confirm you’ve added us as an owner — we can copy them from there.  
6. If Google walks you into a Google Cloud screen instead of the classic admin page, that’s okay. Create a score-based (v3) key for your domain, add seo@brandastic.com as a user or owner, and send us the two keys.

**Done looks like**

We’ve received the site key and secret key, and seo@brandastic.com is listed as an owner.

**Presets:** A and B

**Default phase:** Phase 2 — Development

## **Legal Pages and Footer Details**

**What we need**

Your Privacy Policy and Terms (or Terms of Service), plus any license or registration numbers that should appear in the footer.

**Why we need it**

These pages and footer details are usually required before launch, and we shouldn’t invent legal wording for you.

**Steps**

1. If you already have a Privacy Policy and Terms, send the text or the current page addresses, or upload the documents to your Drive folder.  
2. If you don’t have these pages yet, tell us. We can place standard starter pages on the site, but you should have your own lawyer review them. We can’t give legal advice.  
3. Send any license, permit, or registration numbers that should appear in the footer (common for contractors, real estate, health care, and similar fields).  
4. Tell us if you have special privacy or cookie requirements we should know about.

**Done looks like**

We have your Privacy Policy and Terms (or your go-ahead to use starter pages for legal review), plus any footer license numbers.

**Presets:** A, B, and C

**Default phase:** Phase 2 — Development

# Phase 3 — QA & Launch

This phase covers the store exports we need before launch.

## **Customer Export (e-commerce only)**

**What we need**

A current export of your store’s customer list, as a CSV file, or access to the current store so we can export it.

**Why we need it**

If customers have accounts on the current store, we need this list so they aren’t lost when the new store launches.

**Steps**

1. If you’ve already given us access to the current store, tell us we can export the customer list ourselves.  
2. If you’d rather send a file, look in your store admin for a customer export (often under Customers). Download a CSV and upload it to your Drive folder.  
3. If you don’t have customer accounts to move, tell us and we’ll skip this.

**Done looks like**

We have a customer CSV, access to export it, or your note that there’s nothing to move.

**Presets:** B and C

**Default phase:** Phase 3 — QA & Launch

## **Order History Export (e-commerce only)**

**What we need**

A current export of past orders, as a CSV file, or access to the current store so we can export it.

**Why we need it**

Order history helps you keep a record of past purchases after the new store is live, and can matter for customer service.

**Steps**

1. If you’ve already given us access to the current store, tell us we can export the order history ourselves.  
2. If you’d rather send a file, look in your store admin for an orders export (often under Orders). Download a CSV and upload it to your Drive folder.  
3. If past orders don’t need to move, tell us and we’ll skip this.

**Done looks like**

We have an orders CSV, access to export it, or your note that order history doesn’t need to move.

**Presets:** B and C

**Default phase:** Phase 3 — QA & Launch

## **Updated Product Export for Launch (e-commerce only)**

**What we need**

A fresh product export just before launch, so prices, stock, and new items match what’s current.

**Why we need it**

The first product list is for building the store. This update catches changes made while we were building.

**Steps**

1. Wait until we ask for this, usually shortly before launch. You don’t need to send it in Phase 2\.  
2. If we already have access to the current store, tell us we can pull a fresh product export.  
3. If you’d rather send a file, export a current product CSV the same way as before and upload it to your Drive folder. Note anything that changed, such as new products, prices, or items that should come down.

**Done looks like**

We’ve received a fresh product export, or confirmation that we can pull one, shortly before launch.

**Presets:** B and C

**Default phase:** Phase 3 — QA & Launch

# Applied

These questions have been applied to the library above. Each item keeps your original answer, followed by a short note on what changed. Two items are flagged where the answer needed a small interpretation.

1. The Analytics card currently covers only Google Analytics, which is what the sheet asks for. Should it also include Google Tag Manager and Search Console, or should those stay on the marketing onboarding page at [website.brandastic.com/onboarding](http://website.brandastic.com/onboarding)? What is currently on website.brandastic.com/onboarding is going away. But under analytics we should retain analytics, recaptcha, tag manager and search console as options. Applied: Added Google Tag Manager and Google Search Console as separate Phase 1 items in presets A, B, and C. Analytics stays as its own Phase 1 item. reCAPTCHA stays in Phase 2, presets A and B. Open: if you wanted one combined Analytics card with four sub-options instead of four items, say so and we can combine them.   
2. For Website Login, I included it on presets A and B only. Should it also appear on Shopify projects when the current site is WordPress (or Squarespace, Wix, and so on) and we’re moving them to Shopify? No Applied: Website Login stays on presets A and B only.  
3. Blog Import is in all three presets, marked optional. Should it be off by default, and only added when the client has an existing blog to move? yes Applied: Blog Import is now off by default in A, B, and C. Add it when the client has an existing blog to move.  
4. reCAPTCHA is tagged for WordPress presets (A and B) only. Do Shopify builds need this card too, or does Shopify’s built-in spam protection cover it? Built in covers it. Applied: reCAPTCHA stays on presets A and B only.   
5. SMTP is tagged for WordPress (A and B) only, and kept optional, matching the sheet. Is that right for Shopify as well? yes Applied: SMTP stays WordPress-only (A and B) and optional. No SMTP card on Shopify (C).  
6. Team Headshots and Bios is optional and included in all three presets. Should it only appear when the sitemap includes a Team page? yes Applied: Team Headshots and Bios is now off by default in A, B, and C. Add it when the sitemap includes a Team page.  
7. The Final Review card uses a 3-business-day review window and one round of revisions, from our earlier 4-week process talk. Do you want those numbers in the client-facing copy, or should they stay flexible per project? Remove a final review card \- thats not intake Applied: The Final Review Sign-off on Staging card has been removed.  
8. For the first version of the site, the related cards will link to that client’s copy of the Sitemap, Content Writing, Forms, URL Mapping, and Products tabs (or a Google Doc), rather than rebuilding those worksheets on the new site. Is that still what you want? I want these Items to have a link that I can add of a google drive folder, or a google doc. Applied: Menu Navigation, Homepage Content, Text Content for Other Pages, Forms Confirmation, Redirects, and Product Export now point clients to a Google Drive folder or Google Doc link you can add on the card.   
9. I used seo@brandastic.com everywhere, matching the sheet. Is that still the address clients should invite? Yes Applied: Clients still invite seo@brandastic.com, except the WordPress login card (see the next item).   
10. For the WordPress login, I suggested creating an admin user named brandastic with the email seo@brandastic.com. Do you want a different username? Brandastic and email dev@brandastic.com for this one. Applied: The WordPress login step now uses the email dev@brandastic.com. The username is kept as lowercase brandastic (typical for WordPress). Open: you wrote “Brandastic”; tell us if you want the username capitalized.   
11. For Kinsta, I suggested the Company Developer role (not billing). Is that the role you want, or do you sometimes need Company Administrator? Developer is fine Applied: No change. The Kinsta steps still use the Company Developer role.  
12. The DNS card includes steps for GoDaddy, Cloudflare, and Namecheap. Are there other companies you see often (for example, Squarespace/Google Domains, Bluehost, or Network Solutions) that should get their own steps? no Applied: No change. The DNS card still covers GoDaddy, Cloudflare, and Namecheap, plus the existing “different company” fallback.  
13. The homepage and inner-page content cards mention a copywriting add-on if writing isn’t included. Is that the wording you want clients to see? No just a link to the folder for them to drop in the content. Applied: Copywriting add-on wording has been removed from the homepage and inner-page content cards. Those cards now point to the folder or doc linked on the card.   
14. Image guidelines use a minimum of 2,000 pixels wide, JPG or PNG, and no watermarks, based on earlier homepage image work. Do you want different specs? no Applied: No change. Image guidelines stay at a minimum of 2,000 pixels wide, JPG or PNG, and no watermarks.  
15. For access items (Analytics, DNS, Shopify), “I sent it” will mean the invite was sent, not that a file was uploaded. Is the same button label fine for those cards? yes Applied: No change. The same “I sent it” label is used for access items.  
16. Should due dates be set once per phase (one date for all Phase 1 items) or per item? Per phase. Applied: Documented in “How statuses will work”: due dates are set once per phase, not per item. 