# Feature: Workspaces

## Overview

Workspaces adalah fitur inti yang memungkinkan setiap user yang sudah login untuk mengorganisir pekerjaan mereka ke dalam ruang kerja terpisah. Setiap workspace dapat menampung banyak dokumen. Fitur ini mencakup: halaman `/dashboard/workspaces` untuk mengelola workspace (CRUD), workspace items di sidebar dengan perilaku accordion expand/collapse yang menampilkan daftar dokumen, redirect otomatis dari `/dashboard` ke `/dashboard/workspaces`, serta perubahan skema database Supabase dengan RLS ketat berbasis `owner_id`.

---

## User Stories

### Sub-fitur 1 — Halaman Workspaces (`/dashboard/workspaces`)

- As an authenticated user, I want to see all my workspaces in a grid/list view, so that I can quickly navigate to a specific workspace.
- As an authenticated user, I want to create a new workspace with a name, optional description, and optional icon/emoji, so that I can start organizing my documents.
- As an authenticated user, I want to edit a workspace's name, description, and icon, so that I can keep it up-to-date.
- As an authenticated user, I want to delete a workspace with a confirmation dialog, so that I can remove workspaces I no longer need without accidentally deleting them.
- As an authenticated user, I want to see an empty state with a call-to-action when I have no workspaces, so that I know how to get started.

### Sub-fitur 2 — Redirect `/dashboard` → `/dashboard/workspaces`

- As an authenticated user, I want visiting `/dashboard` to automatically redirect me to `/dashboard/workspaces`, so that the workspaces page becomes the true home of the dashboard.

### Sub-fitur 3 — Sidebar: Workspace Folder Items

- As an authenticated user, I want to see all my workspaces listed in the sidebar as expandable folder items, so that I can navigate workspaces without going to the workspaces page.
- As an authenticated user, I want to click a workspace folder in the sidebar to navigate to `/dashboard/workspaces/[workspaceId]`, so that I can open a specific workspace.
- As an authenticated user, I want to expand a workspace folder in the sidebar to reveal its documents, so that I can jump to a specific document quickly.
- As an authenticated user, I want to click a document in the expanded folder to navigate to `/dashboard/workspaces/[workspaceId]/documents/[documentId]`, so that I can open that document directly.
- As an authenticated user, I want a "New Document" button inside an expanded workspace folder, so that I can create a document without leaving the sidebar.
- As an authenticated user with a collapsed sidebar, I want workspace icons to show as tooltips when I hover over them, so that I can still identify workspaces without text labels.

### Sub-fitur 4 — Workspace Detail Page (`/dashboard/workspaces/[workspaceId]`)

- As an authenticated user, I want a detail page per workspace that lists all documents in that workspace, so that I can manage documents within a specific workspace.

### Sub-fitur 5 — New Document (via Sidebar)

- As an authenticated user, I want to click "New Document" inside a sidebar workspace folder and have a new document created, so that I can start writing immediately.

---

## Acceptance Criteria

### AC-1: Workspaces List Page (`/dashboard/workspaces`)

- [ ] Page is accessible at `/dashboard/workspaces` for authenticated users only.
- [ ] Page displays all workspaces owned by the currently authenticated user (fetched server-side via RSC).
- [ ] Each workspace card shows: icon/emoji (or default placeholder), name, description (truncated if long), and action menu (edit, delete).
- [ ] Workspaces are sorted by `created_at` descending by default.
- [ ] Empty state is shown when the user has no workspaces, with a "Create your first workspace" CTA button.
- [ ] Page title in `<Navbar>` reads "Workspaces".

### AC-2: Create Workspace

- [ ] A "New Workspace" button is visible on the workspaces list page.
- [ ] Clicking "New Workspace" opens a Dialog/Sheet with a form containing: `name` (required, max 80 chars), `description` (optional, max 300 chars), `icon` (optional emoji picker or text input, max 4 chars).
- [ ] Submitting with an empty `name` shows an inline validation error; form does not submit.
- [ ] Submitting a valid form inserts a row into `workspaces` with `owner_id = auth.uid()` and redirects/updates list.
- [ ] The new workspace appears at the top of the workspace list without a full page reload.
- [ ] The new workspace appears in the sidebar immediately after creation.
- [ ] Submit button shows a loading state while the request is in-flight and is disabled to prevent double-submit.
- [ ] On server error, a toast (sonner) error message is shown.

### AC-3: Edit Workspace

- [ ] Each workspace card has an action menu (kebab `...` button or similar) with an "Edit" option.
- [ ] Clicking "Edit" opens the same Dialog/Sheet pre-filled with existing `name`, `description`, and `icon`.
- [ ] Submitting a valid edit updates the workspace row and reflects changes in the list and sidebar.
- [ ] Validation rules are identical to Create (name required, max lengths).
- [ ] On success, a toast confirmation is shown.

### AC-4: Delete Workspace

- [ ] Each workspace card action menu has a "Delete" option.
- [ ] Clicking "Delete" opens an `AlertDialog` with the workspace name in the message and two buttons: "Cancel" and "Delete".
- [ ] Confirming deletion removes the workspace row from the database (cascade deletes associated documents per FK constraint).
- [ ] Deleted workspace is immediately removed from the list and sidebar without a full page reload.
- [ ] Clicking "Cancel" closes the dialog without any change.
- [ ] On server error, a toast error is shown.

### AC-5: Redirect `/dashboard` → `/dashboard/workspaces`

- [ ] `app/dashboard/page.tsx` is replaced with a `redirect('/dashboard/workspaces')` call (Next.js server redirect).
- [ ] Visiting `/dashboard` in the browser results in navigation landing on `/dashboard/workspaces`.
- [ ] No flash of the old dashboard page content occurs.

### AC-6: Sidebar Workspace Items

- [ ] Sidebar fetches the authenticated user's workspaces (client-side fetch on mount via a dedicated API route or server action, or via a server component wrapper passing data as props).
- [ ] Each workspace is rendered as an accordion/collapsible item with: icon (emoji or default `FolderIcon`), workspace name (hidden when sidebar is collapsed), and an expand/collapse chevron.
- [ ] When sidebar is collapsed (desktop), workspace items show only the icon with a tooltip displaying the workspace name on hover.
- [ ] Clicking the workspace name/icon row navigates to `/dashboard/workspaces/[workspaceId]`.
- [ ] Clicking the chevron expands/collapses the document list without navigating.
- [ ] When expanded, the document list fetches documents lazily (on first expand) for that workspace.
- [ ] Each document item shows its title and navigates to `/dashboard/workspaces/[workspaceId]/documents/[documentId]` on click.
- [ ] An empty document list within an expanded workspace shows "No documents yet" placeholder text.
- [ ] A "+ New Document" button is visible at the bottom of the expanded document list.
- [ ] Active route is highlighted in the sidebar (workspace item or document item, depending on current path).
- [ ] Existing static nav items ("Dashboard" → changed to "Workspaces", "Settings") remain in place above the workspace list.
- [ ] The `NAV_ITEMS` entry for `/dashboard` is updated to point to `/dashboard/workspaces` with label "Workspaces".

### AC-7: Workspace Detail Page (`/dashboard/workspaces/[workspaceId]`)

- [ ] Page is rendered at `/dashboard/workspaces/[workspaceId]` for authenticated users only.
- [ ] User is redirected to `/dashboard/workspaces` if the workspace does not exist or does not belong to them.
- [ ] Page displays the workspace name, icon, and description at the top.
- [ ] Page lists all documents in the workspace (title, `updated_at`).
- [ ] Empty state shown when workspace has no documents.
- [ ] Page title in `<Navbar>` reflects the workspace name.

### AC-8: New Document (Sidebar CTA)

- [ ] Clicking "+ New Document" in the sidebar creates a new untitled document in the corresponding workspace via a server action.
- [ ] User is navigated to `/dashboard/workspaces/[workspaceId]/documents/[documentId]` after creation.
- [ ] Button shows loading state during creation.

### AC-9: RLS & Security

- [ ] Users can only SELECT their own workspaces (`owner_id = auth.uid()`).
- [ ] Users can only INSERT workspaces where `owner_id = auth.uid()`.
- [ ] Users can only UPDATE/DELETE their own workspaces.
- [ ] Same RLS rules apply to the `documents` table.
- [ ] Accessing `/dashboard/workspaces/[workspaceId]` belonging to another user returns a 404/redirect.

---

## Test Scenarios

| # | Given | When | Then | Type |
|---|-------|------|------|------|
| 1 | User is authenticated with 0 workspaces | Visits `/dashboard/workspaces` | Empty state with CTA is shown | Happy path |
| 2 | User is authenticated with 3 workspaces | Visits `/dashboard/workspaces` | 3 workspace cards are displayed sorted by newest | Happy path |
| 3 | User is on workspaces page | Clicks "New Workspace", fills name only, submits | Workspace created, appears at top of list, sidebar updates | Happy path |
| 4 | User is on workspaces page | Clicks "New Workspace", leaves name empty, submits | Inline validation error shown, no DB insert | Edge case |
| 5 | User creates workspace | Types 81 chars in name field | Input is capped or validation error at 80 chars | Edge case |
| 6 | User is on workspaces page | Clicks "Edit" on a workspace card | Dialog opens pre-filled with current values | Happy path |
| 7 | User edits workspace | Changes name and submits | List and sidebar reflect new name | Happy path |
| 8 | User is on workspaces page | Clicks "Delete", confirms | Workspace and all its documents removed, list updates | Happy path |
| 9 | User is on workspaces page | Clicks "Delete", then "Cancel" | Dialog closes, no changes | Edge case |
| 10 | User visits `/dashboard` | – | Browser lands on `/dashboard/workspaces` | Happy path |
| 11 | User clicks workspace in sidebar | – | Navigated to `/dashboard/workspaces/[workspaceId]` | Happy path |
| 12 | User expands workspace in sidebar with 2 docs | Clicks chevron | Document list with 2 items appears | Happy path |
| 13 | User expands workspace in sidebar with 0 docs | Clicks chevron | "No documents yet" placeholder shown | Edge case |
| 14 | User collapses sidebar (desktop) | Hovers over workspace icon | Tooltip with workspace name appears | Edge case |
| 15 | User clicks "+ New Document" in sidebar | – | New doc created, user navigated to doc page | Happy path |
| 16 | User clicks "+ New Document" | Server returns error | Toast error displayed, no navigation | Negative |
| 17 | Unauthenticated user visits `/dashboard/workspaces` | – | Redirected to `/auth/login` | Negative |
| 18 | User A visits workspace owned by User B | – | Redirected to `/dashboard/workspaces` (not exposed) | Negative |
| 19 | User deletes workspace | Server error occurs | Toast error shown, workspace remains in list | Negative |
| 20 | User creates workspace | Network is offline | Toast error shown, dialog stays open | Negative |
| 21 | User has many workspaces (20+) | Sidebar is open | Workspace list scrolls independently | Edge case |
| 22 | Workspace name has emoji characters | Displayed in card and sidebar | Emoji renders correctly without layout break | Edge case |

---

## Out of Scope

- Document editor / rich text editor (documents are created as empty shells in this iteration).
- Document content editing (`/dashboard/workspaces/[workspaceId]/documents/[documentId]` page content/editor).
- Workspace sharing or collaboration (multi-user per workspace).
- Workspace roles/permissions (owner, editor, viewer).
- Workspace templates.
- Drag-and-drop reordering of workspaces or documents.
- Document search / global search.
- Workspace archiving.
- Pagination or infinite scroll for workspace list (acceptable to load all for MVP).
- File/image uploads for workspace icons (emoji/string only for now).
- Notifications or activity feed.

---

## Open Questions

1. **Workspace detail page scope**: Should `/dashboard/workspaces/[workspaceId]` be fully implemented in this iteration (listing documents), or is it just a placeholder shell? *(Assumed: basic list page, no document editor.)*
2. **Document lazy-loading strategy**: Should document lists in the sidebar be fetched lazily per workspace (on first expand, via client fetch), or should all documents for all workspaces be loaded upfront? *(Recommended: lazy per workspace to keep initial payload small — confirm with team.)*
3. **Sidebar data source**: Since `Sidebar` is a client component, data should either come from a server component wrapper (passing `workspaces` as props into `Sidebar`) or via a client-side `fetch`/server action on mount. Which pattern is preferred? *(Recommended: convert `DashboardLayout` to pass `workspaces` as props to Sidebar, keeping RSC benefits.)*
4. **Workspace delete cascade**: Should deleting a workspace hard-delete all associated documents immediately (DB cascade), or soft-delete / archive? *(Assumed: hard cascade delete for MVP.)*
5. **`icon` field format**: Is `icon` always a single emoji character (1–2 Unicode codepoints), or can it also be a short text slug (e.g., `"work"`, `"personal"`)? Max length? *(Assumed: max 4 chars / single emoji for MVP.)*
6. **"New Document" title**: When creating a document via the sidebar CTA, should the title default to "Untitled" or be empty? *(Recommended: `"Untitled"` as default.)*
7. **Navbar title dynamic update**: The current `DashboardLayout` passes a hardcoded `title="Dashboard"` to `<Navbar>`. Should the layout be refactored to accept a dynamic title per page, or should each page control the Navbar title via a different mechanism (e.g., context, slot)? *(Depends on team preference — flag to engineer.)*

---

## DB Schema SQL

```sql
-- ============================================================
-- Table: workspaces
-- ============================================================
CREATE TABLE public.workspaces (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description  text CHECK (char_length(description) <= 300),
  icon         text CHECK (char_length(icon) <= 4),
  owner_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Index for fast per-user queries
CREATE INDEX idx_workspaces_owner_id ON public.workspaces(owner_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspaces_select_own"
  ON public.workspaces FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "workspaces_insert_own"
  ON public.workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update_own"
  ON public.workspaces FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_delete_own"
  ON public.workspaces FOR DELETE
  USING (owner_id = auth.uid());


-- ============================================================
-- Table: documents
-- ============================================================
CREATE TABLE public.documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title        text NOT NULL DEFAULT 'Untitled' CHECK (char_length(title) <= 255),
  content      text,
  owner_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_documents_workspace_id ON public.documents(workspace_id);
CREATE INDEX idx_documents_owner_id     ON public.documents(owner_id);

-- Auto-update updated_at
CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select_own"
  ON public.documents FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "documents_insert_own"
  ON public.documents FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "documents_update_own"
  ON public.documents FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "documents_delete_own"
  ON public.documents FOR DELETE
  USING (owner_id = auth.uid());
```

---

## Feature Module Mapping

```
features/workspaces/
  types/
    index.ts                  — Workspace, WorkspaceInsert, WorkspaceUpdate,
                                Document, DocumentInsert, DocumentUpdate
  services/
    workspace-service.ts      — getWorkspaces(), getWorkspace(id),
                                createWorkspace(), updateWorkspace(), deleteWorkspace()
    document-service.ts       — getDocuments(workspaceId), getDocument(id),
                                createDocument(), updateDocument(), deleteDocument()
  components/
    workspace-list.tsx        — RSC: grid/list of WorkspaceCard components
    workspace-card.tsx        — Client: card with action menu (edit/delete)
    workspace-form.tsx        — Client: create/edit form inside Dialog
    workspace-delete-dialog.tsx — Client: AlertDialog for delete confirmation
    workspace-empty-state.tsx — RSC: empty state with CTA
    workspace-detail.tsx      — RSC: workspace header + document list
  actions/
    workspace-actions.ts      — Server Actions: createWorkspaceAction,
                                updateWorkspaceAction, deleteWorkspaceAction
    document-actions.ts       — Server Actions: createDocumentAction,
                                deleteDocumentAction

app/dashboard/
  page.tsx                    — REPLACE with redirect('/dashboard/workspaces')
  workspaces/
    page.tsx                  — RSC: WorkspacesPage (fetches workspaces server-side)
    [workspaceId]/
      page.tsx                — RSC: WorkspaceDetailPage
      documents/
        [documentId]/
          page.tsx            — Placeholder RSC for document editor (out of scope for now)

components/fragments/
  sidebar.tsx                 — MODIFY: add WorkspaceSidebarSection client component
                                (or accept workspaces prop from layout server component)
  sidebar-workspace-item.tsx  — Client: accordion item with lazy doc fetch
  use-workspace-expand.ts     — Client hook: tracks expanded workspace IDs (localStorage)
```

### TypeScript Types (`features/workspaces/types/index.ts`)

```typescript
export interface Workspace {
  id: string
  name: string
  description: string | null
  icon: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export type WorkspaceInsert = Pick<Workspace, 'name'> & {
  description?: string | null
  icon?: string | null
}

export type WorkspaceUpdate = Partial<WorkspaceInsert>

export interface Document {
  id: string
  workspace_id: string
  title: string
  content: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export type DocumentInsert = {
  workspace_id: string
  title?: string
  content?: string | null
}

export type DocumentUpdate = Partial<Pick<Document, 'title' | 'content'>>
```

### Sidebar Integration Strategy

```
DashboardLayout (RSC)
  ├── fetches: user, profile, workspaces (new)
  ├── passes workspaces as prop to <Sidebar workspaces={workspaces} />
  └── Sidebar (Client Component)
        ├── renders static NAV_ITEMS (update /dashboard → /dashboard/workspaces)
        └── renders <SidebarWorkspaceItem> per workspace
              └── on expand: client fetch /api/workspaces/[id]/documents
                             OR server action getDocuments(workspaceId)
```

### Priority

| Sub-feature | Priority | Reason |
|---|---|---|
| DB schema + RLS | **P0** | Blocks all other work |
| Redirect `/dashboard` | **P0** | Prevents broken landing route |
| Workspaces List + CRUD | **P0** | Core feature value |
| Sidebar workspace items (navigation) | **P1** | Key UX, needed for daily use |
| Sidebar document lazy load + New Doc | **P1** | Completes sidebar workflow |
| Workspace Detail page | **P1** | Entry point to document management |
| Document placeholder page | **P2** | Out of editor scope, just 404 prevention |
```
