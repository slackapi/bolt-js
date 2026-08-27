// @ts-check
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

/**
 * Local TypeDoc plugin: stamp a `sidebar_label` frontmatter onto every generated
 * page equal to the reflection's name.
 *
 * Why: typedoc-plugin-markdown prints a breadcrumb line before the page's H1, so
 * Docusaurus cannot infer a content title and falls back to the doc id's last
 * segment. For most pages the segment is the export name ("App"), but for the
 * `index.md` of a module/namespace it is literally "index" — which then becomes
 * the label of the auto-generated sidebar category (e.g. HTTPModuleFunctions
 * rendered as "index"). Emitting an explicit sidebar_label removes the reliance
 * on that fallback and keeps category and leaf labels stable across regeneration.
 *
 * @param {import('typedoc').Application} app
 */
export function load(app) {
  app.renderer.on(MarkdownPageEvent.END, (page) => {
    const label = page.model?.name;
    if (!label) {
      return;
    }
    page.contents = `---\nsidebar_label: ${JSON.stringify(label)}\n---\n\n${page.contents ?? ''}`;
  });
}
