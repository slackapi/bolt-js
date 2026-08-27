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
    const model = /** @type {any} */ (page.model);
    const label = model?.name;
    if (!label) {
      return;
    }
    const frontmatter = [`sidebar_label: ${JSON.stringify(label)}`];
    // The project root page (reference/index.md) is emitted as a standalone
    // sidebar item rather than a category link, so it otherwise sorts
    // alphabetically as "index" — landing between "functions" and
    // "interfaces". Pin it to the top of the Reference section.
    if (typeof model.isProject === 'function' && model.isProject()) {
      frontmatter.push('sidebar_position: 0');
    }
    page.contents = `---\n${frontmatter.join('\n')}\n---\n\n${page.contents ?? ''}`;
  });
}
