// @ts-check
import { ReflectionKind } from 'typedoc';
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

/**
 * Local TypeDoc plugin: fix the two index pages whose sidebar entry would
 * otherwise be wrong. Every other page is left to the H1-derived label produced
 * by `hideBreadcrumbs` + `pageTitleTemplates`.
 *
 *   1. The project root (reference/index.md). It renders as a standalone sidebar
 *      item rather than a category link, so it otherwise sorts alphabetically as
 *      "index" between "functions" and "interfaces". Stamp its name and pin it to
 *      the top of the Reference section.
 *   2. Each namespace / module index (e.g. HTTPModuleFunctions/index.md). Its file
 *      is literally index.md, so absent an explicit label the auto-generated
 *      sidebar category falls back to "index". Stamp the reflection name.
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
    const isNamespace = typeof model.kindOf === 'function' && model.kindOf(ReflectionKind.Namespace | ReflectionKind.Module);
    if (!isProject && !isNamespace) {
      return;
    }
    const frontmatter = [`sidebar_label: ${JSON.stringify(label)}`];
    if (isProject) {
      frontmatter.push('sidebar_position: 0');
    }
    page.contents = `---\n${frontmatter.join('\n')}\n---\n\n${page.contents ?? ''}`;
  });
}
