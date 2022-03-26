import { ConsoleLogger } from '@slack/logger';

const logger = new ConsoleLogger();

// Deprecated: this function will be removed in the near future
// Use the ones from @slack/oauth (v2.5 or newer) instead
export default function defaultRenderHtmlForInstallPath(addToSlackUrl: string): string {
  logger.warn('This method is deprecated. Use defaultRenderHtmlForInstallPath from @slack/oatuh instead.');
  // TODO: replace the internals of this method with the one from @slack/oauth@2.5 or newer
  return `<html>
      <body>
        <a href="${addToSlackUrl}">
          <img
            alt="Add to Slack"
            height="40"
            width="139"
            src="https://platform.slack-edge.com/img/add_to_slack.png"
            srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
          />
        </a>
      </body>
    </html>`;
}

// Deprecated: this function will be removed in the near future
// For backward-compatibility
export function renderHtmlForInstallPath(addToSlackUrl: string): string {
  return defaultRenderHtmlForInstallPath(addToSlackUrl);
}
