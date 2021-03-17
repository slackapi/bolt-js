export function renderHtmlForInstallPath(addToSlackUrl: string) {
  return `<html>
      <body>
        <a href=${addToSlackUrl}>
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
