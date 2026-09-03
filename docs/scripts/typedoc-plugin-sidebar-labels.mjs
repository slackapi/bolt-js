// @ts-check
import { ReflectionKind } from 'typedoc';
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

/**
 * Local TypeDoc plugin: stamp `sidebar_label` on the pages whose auto-derived
 * (H1) sidebar entry would otherwise be wrong. Every other page is left to the
 * H1-derived label produced by `hideBreadcrumbs` + `pageTitleTemplates`.
 *
 *   1. The project root (reference/index.md). It renders as a standalone sidebar
 *      item rather than a category link, so it otherwise sorts alphabetically as
 *      "index" between "functions" and "interfaces". Stamp its name and pin it to
 *      the top of the Reference section.
 *   2. Each namespace / module index (e.g. HTTPModuleFunctions/index.md). Its file
 *      is literally index.md, so absent an explicit label the auto-generated
 *      sidebar category falls back to "index". Stamp the reflection name.
 *   3. Generic declarations (classes, interfaces, type aliases with type
 *      parameters). Their H1 renders the type parameters with escaped angle
 *      brackets (e.g. "App\<AppCustomContext\>"), and those backslashes leak into
 *      the sidebar. Stamp the bare reflection name so the sidebar reads "App".
 *
 * @param {import('typedoc').Application} app
 */
export function load(app) {
  app.renderer.on(MarkdownPageEvent.END, (page) => {
    const model = /** @type {any} */ (page.model);
    const label = model?.name;
    if (!label) {
      return;
    }
    const isProject = typeof model.isProject === 'function' && model.isProject();
    const isNamespace =
      typeof model.kindOf === 'function' && model.kindOf(ReflectionKind.Namespace | ReflectionKind.Module);
    const hasTypeParameters = Array.isArray(model.typeParameters) && model.typeParameters.length > 0;
    if (!isProject && !isNamespace && !hasTypeParameters) {
      return;
    }
    const frontmatter = [`sidebar_label: ${JSON.stringify(label)}`];
    if (isProject) {
      frontmatter.push('sidebar_position: 0');
    }
    page.contents = `---\n${frontmatter.join('\n')}\n---\n\n${page.contents ?? ''}`;
  });
}
