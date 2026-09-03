# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** conhecimento
- **Date:** 2026-09-01
- **Prepared by:** TestSprite AI Team
- **Scope:** frontend / codebase (dev server, cap of 15 high-priority tests)
- **Local endpoint:** http://localhost:3000/textos
- **Dashboard:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906

---

## 2️⃣ Requirement Validation Summary

### Requirement: App shell and navigation
- **Description:** Opening the app lands on the textos workspace (pt-BR). `/` redirects to `/textos`. Header nav switches Textos/Chat.

#### Test TC002 Land on textos from the root redirect
- **Test Code:** [TC002_Land_on_textos_from_the_root_redirect.py](./TC002_Land_on_textos_from_the_root_redirect.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/65ffcc96-65f7-46cf-93e9-50a7866d1e96
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** URL contains `/textos` and the Textos nav link is visible. The generated script opened `/textos` directly rather than `/`, so the Next.js redirect itself was not exercised.

#### Test TC003 Open the app and land on the textos workspace
- **Test Code:** [TC003_Open_the_app_and_land_on_the_textos_workspace.py](./TC003_Open_the_app_and_land_on_the_textos_workspace.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/4c3b8dfb-8d7c-44cb-867e-64d73beccd6d
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Workspace header, list, and existing textos (including Agenda da terça / Projeto Gatinha) are visible.

---

### Requirement: List and create textos
- **Description:** The person can list textos, see the workspace sumário, and create a texto with required título and markdown corpo.

#### Test TC006 Create a first texto
- **Test Code:** [TC006_Create_a_first_texto.py](./TC006_Create_a_first_texto.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/f7da37b1-6301-44b3-b071-71959925cd0a
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Created “Texto de teste” via the Novo texto form; it appeared in the list.

#### Test TC007 Create a first texto and see it in the list
- **Test Code:** [TC007_Create_a_first_texto_and_see_it_in_the_list.py](./TC007_Create_a_first_texto_and_see_it_in_the_list.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/5694e44f-5413-4d73-b12d-1f85925dada6
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Created “Introdução” and confirmed it in the list. Duplicate of TC006 with a different title.

#### Test TC009 View the textos list and workspace summary
- **Test Code:** [TC009_View_the_textos_list_and_workspace_summary.py](./TC009_View_the_textos_list_and_workspace_summary.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/48484c0d-fefa-4d6d-a9a6-8f7edc9c0339
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** List shows existing textos. Assertions targeted list items more than the Sumário do workspace block.

---

### Requirement: Open and edit texto
- **Description:** Opening a list item loads the editor. Título and corpo can be changed, previewed as markdown, and saved.

#### Test TC004 Edit, preview, and save a texto
- **Test Code:** [TC004_Edit_preview_and_save_a_texto.py](./TC004_Edit_preview_and_save_a_texto.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/5575a58e-bb64-4e9c-82bf-8f25c71a249e
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Edited Projeto Gatinha, clicked Preview, saved, and saw the updated title in the list. Did not assert that markdown-body replaced the textarea.

#### Test TC008 Open an existing texto and edit its content
- **Test Code:** [TC008_Open_an_existing_texto_and_edit_its_content.py](./TC008_Open_an_existing_texto_and_edit_its_content.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/403cd6f9-c361-4359-ba92-798ea76944ed
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Saved “Projeto Gatinha - Atualizado” with new markdown. Mutated the local workspace used for the demo.

#### Test TC011 Open an existing texto for editing
- **Test Code:** [TC011_Open_an_existing_texto_for_editing.py](./TC011_Open_an_existing_texto_for_editing.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/0d46b126-2bad-4ab5-bcb8-27f4e0be991b
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Opened Agenda da terça; título and conteúdo fields were editable. Fill was not saved.

#### Test TC014 Preview rendered markdown in a texto
- **Test Code:** [TC014_Preview_rendered_markdown_in_a_texto.py](./TC014_Preview_rendered_markdown_in_a_texto.py)
- **Test Error:** Clicking Preview did not appear (to TestSprite) to switch into preview; the Conteúdo textarea seemed to remain; no rendered markdown container was found.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/7ffc2813-3ad5-44f7-9146-10795d76123e
- **Status:** ❌ Failed
- **Severity:** LOW
- **Analysis / Findings:** Product code toggles `preview` and replaces the textarea with `MarkdownBody` (`apps/web/app/textos/[id]/page.tsx`). The generated assertions used brittle XPaths (toggle buttons / Salvar row) instead of `.markdown-body` or the hidden textarea. This is a likely false negative in the TestSprite script, not a confirmed product bug. Re-run with a locator on `.markdown-body` after clicking Preview.

---

### Requirement: Delete texto from list
- **Description:** List delete uses a native confirm dialog and removes the texto.

#### Test TC015 Delete a texto from the list and confirm removal
- **Test Code:** [TC015_Delete_a_texto_from_the_list_and_confirm_removal.py](./TC015_Delete_a_texto_from_the_list_and_confirm_removal.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/f7291b62-b445-45be-8b94-7faf69edc617
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Created “TestSprite a apagar” and deleted that item only, as instructed. Native confirm was accepted.

---

### Requirement: Chat with AI over textos
- **Description:** Chat lists conversas, streams an assistant reply from saved textos, and shows Fonte chips linking to `/textos/:id`.

#### Test TC001 Open chat and send a question with sources
- **Test Code:** [TC001_Open_chat_and_send_a_question_with_sources.py](./TC001_Open_chat_and_send_a_question_with_sources.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/b3f5d009-64e0-455a-bb1b-abcca32d486d
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Asked about the gatinha; assistant cited “Projeto Gatinha - Atualizado”; the chip opened the texto editor.

#### Test TC005 Create a new chat conversation and send a question
- **Test Code:** [TC005_Create_a_new_chat_conversation_and_send_a_question.py](./TC005_Create_a_new_chat_conversation_and_send_a_question.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/80286063-9e7a-47a6-bccb-92250ec09632
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Nova conversa + Enviar produced a reply with a Fonte link.

#### Test TC010 See cited source textos in a chat reply
- **Test Code:** [TC010_See_cited_source_textos_in_a_chat_reply.py](./TC010_See_cited_source_textos_in_a_chat_reply.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/6bff32e8-8abb-4158-9e9b-68e90f0d09f6
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Fonte chip navigated to `/textos/:id`. Core MVP-A demo path (pergunta que só um texto responde + origem visível).

#### Test TC012 Continue an existing chat conversation with a follow-up question
- **Test Code:** [TC012_Continue_an_existing_chat_conversation_with_a_follow_up_question.py](./TC012_Continue_an_existing_chat_conversation_with_a_follow_up_question.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/e1a04d67-c756-4ad5-b89b-be092ec337ec
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Follow-up stayed on the same conversa; prior Fonte and new reply were visible.

#### Test TC013 Review prior chat messages and continue the same conversation
- **Test Code:** [TC013_Review_prior_chat_messages_and_continue_the_same_conversation.py](./TC013_Review_prior_chat_messages_and_continue_the_same_conversation.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ac69a4b1-261a-5d8e-8de1-e84d2f552906/test/bd5991b9-3eaf-4477-87bc-9ac7b92c9edf
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Overlaps TC012; history + appended assistant reply both present.

---

## 3️⃣ Coverage & Matching Metrics

- **93.33%** of executed tests passed (14/15)
- Dev-mode cap: 15 high-priority cases. TC016–TC025 (editor delete, empty states, header nav, validation, 404, footer) were **not executed**.

| Requirement | Total Tests | ✅ Passed | ❌ Failed |
|--------------------|-------------|-----------|------------|
| App shell and navigation | 2 | 2 | 0 |
| List and create textos | 3 | 3 | 0 |
| Open and edit texto | 4 | 3 | 1 |
| Delete texto from list | 1 | 1 | 0 |
| Chat with AI over textos | 5 | 5 | 0 |
| **Executed total** | **15** | **14** | **1** |

---

## 4️⃣ Key Gaps / Risks

> 14 of 15 executed tests passed. Chat, CRUD list, save, fontes, and list-delete are green on the local app.

> **TC014 (Preview)** is the only failure. Product toggle is a simple `setPreview` that swaps textarea ↔ `MarkdownBody`. Generated assertions targeted the wrong XPaths. Treat as a flaky/false-negative TestSprite script until re-run with `.markdown-body`.

> Tests **mutated the local Postgres workspace**: Projeto Gatinha was renamed/saved (TC004/TC008); “Texto de teste” and “Introdução” were created; “TestSprite a apagar” was created and deleted. Restore demo data if needed.

> Empty-list, editor-delete-without-confirm, HTML required on título, invalid id, and footer identity were in the plan but skipped by the 15-test dev cap.

> Generated Playwright uses fragile absolute XPaths; re-runs can flake if list order changes.

---
