# Chrome Web Store — Submission Answer Sheet (AI Prompt Vault v0.1.0)

Everything below is paste-ready. Fields are grouped by the dashboard tab they appear on.

---

## Package to upload

- **File:** `ai-prompt-vault-v0.1.0.zip` (in the project root, now contains the real icon).
- If you already dropped an older ZIP, just upload this one again — it replaces the draft.

---

## Store assets (in this `store-assets/` folder)

| Asset | File | Chrome requirement | Status |
| --- | --- | --- | --- |
| Store icon | `store-icon-128.png` | 128×128 PNG | ✅ |
| Screenshot 1 | `screenshot-1-1280x800.png` | 1280×800 or 640×400 | ✅ |
| Privacy policy | `privacy-policy.html` | Must be hosted at a public URL (see below) | ⚠️ host it |

> You need **at least 1** screenshot (max 5). One is enough to publish. If you want more
> (favorites view, folders, variable fill-in, side panel), say the word and I'll generate them.

---

## TAB: Store listing

**Item name**
```
AI Prompt Vault
```

**Summary** (short description, max 132 chars)
```
Save, organize, search and one-click-insert your AI prompts into ChatGPT, Claude, Gemini, Perplexity and more. Offline & private.
```

**Description**
```
AI Prompt Vault is a fast, private home for all your best AI prompts.

Stop digging through old chats and notes. Save your prompts once, then find and insert them in a click — on ChatGPT, Claude, Gemini, Perplexity, Copilot, DeepSeek, and Grok.

FEATURES
• Save, edit, and organize prompts with folders, tags, and favorites
• Instant full-text search across titles, tags, and prompt text
• One-click insert straight into the AI site's message box
• Fill-in-the-blank variables — write {{topic}} or {{audience}} and get prompted for values on insert
• Right-click any selected text on a page to save it as a prompt
• Import and export your whole library as JSON
• Popup for quick access, plus a roomy side panel for managing large libraries
• Keyboard shortcuts: Alt+P opens the popup, Alt+Shift+P opens the side panel

PRIVATE BY DESIGN
• 100% offline — your prompts are stored locally on your device
• No account, no sign-up, no servers, no tracking, no ads
• The extension never reads your conversations or page content; it only inserts the prompt text you choose

Lightweight and fast, built to stay out of your way.
```

**Category:** `Productivity`

**Language:** `English`

---

## TAB: Privacy practices

**Single purpose** (one field)
```
AI Prompt Vault lets users save, organize, search, and insert their own reusable AI prompts, and insert a chosen prompt into the message box of supported AI chat websites.
```

**Permission justifications** (one box per permission)

`storage`
```
Stores the user's sort-order preference locally so the extension remembers how they like their prompt list ordered.
```

`contextMenus`
```
Adds a "Save selection to Prompt Vault" right-click menu item so users can save highlighted text as a new prompt.
```

`scripting`
```
Injects a small insertion script into the current tab, only when the user clicks Insert, to place their chosen prompt text into the page's message box.
```

`activeTab`
```
Grants temporary access to the current tab when the user clicks Insert, so the prompt can be inserted into the page the user is actively viewing.
```

`sidePanel`
```
Displays the user's prompt library in Chrome's side panel for comfortable browsing and management of larger libraries.
```

`clipboardWrite`
```
Copies a prompt to the clipboard when the user clicks Copy, or as a fallback when no text box is found on the page, so the user can paste it manually.
```

**Host permission justification** (for the AI site matches)
```
The extension runs a content script only on the supported AI chat sites (ChatGPT, Claude, Gemini, Perplexity, Copilot, DeepSeek, Grok) for the sole purpose of writing the user's selected prompt text into the site's message input box when the user clicks Insert. It does not read, collect, or transmit page content, conversations, or any other data from these sites.
```

**Are you using remote code?**
```
No, I am not using remote code.
```
(All code is bundled in the package. No eval, no external scripts.)

---

## TAB: Data usage

**What user data do you collect?**
- Leave **every** category **unchecked** (Personally identifiable info, Health, Financial, Authentication,
  Personal communications, Location, Web history, User activity, Website content).
- The extension collects none of these — all prompt data stays in local storage on the device.

**Certifications** — check all three boxes (they are all true):
- ☑ I do not sell or transfer user data to third parties, outside of the approved use cases.
- ☑ I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL**
- Required. Host `privacy-policy.html` at a public URL and paste it here. Easiest options:
  1. **GitHub Pages / Gist:** create a public gist with the HTML, or a repo with GitHub Pages enabled.
  2. **Google Sites / Notion public page:** paste the text content and publish.
  3. Any static host you already use.
- Then paste the resulting link (e.g. `https://<you>.github.io/prompt-vault-privacy/`).

---

## TAB: Distribution

- **Visibility:** Public
- **Pricing:** Free
- **Regions:** All regions
- **Mature content:** No

---

## Contact / verification (Account settings, one-time)

- Add and **verify your contact email** (`fawwaz.adil21@gmail.com`) under the developer account —
  the store won't let you publish until this email is verified.

---

## Final step

Click **Submit for review**. First-time reviews usually take from about a day up to a week. You'll get
an email with the result. If anything is rejected, it will name the exact policy — send me that text
and I'll fix it.

## Note for the next version (payments)

When we add the Pro/payments update, bump `version` in `manifest.json` (e.g. `0.2.0`), rebuild, and
upload the new ZIP to the same listing. Update the privacy policy at that time to describe the payment
provider and any license data, and re-run the Data usage section accordingly.
