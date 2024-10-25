/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  sidebarJSBolt: [
    {
      type: "doc",
      id: "index",
      label: "Bolt for JavaScript",
      className: "sidebar-title",
    },
    "getting-started",
    {
      type: "category",
      label: "Slack API calls",
      items: ["concepts/message-sending", "concepts/web-api"],
    },
    {
      type: "category",
      label: "Events",
      items: ["concepts/message-listening", "concepts/event-listening"],
    },
    {
      type: "category",
      label: "Interactivity & Shortcuts",
      items: [
        "concepts/acknowledge",
        "concepts/shortcuts",
        "concepts/commands",
        "concepts/action-listening",
        "concepts/action-respond",
        "concepts/creating-modals",
        "concepts/updating-pushing-views",
        "concepts/view-submissions",
        "concepts/options",
        "concepts/publishing-views",
      ],
    },
    "concepts/assistant",
    "concepts/custom-steps",
    {
      type: "category",
      label: "App Configuration",
      items: [
        "concepts/socket-mode",
        "concepts/error-handling",
        "concepts/logging",
        "concepts/custom-routes",
        "concepts/deferring-initialization",
        "concepts/receiver",
      ],
    },
    {
      type: "category",
      label: "Middleware & Context",
      items: [
        "concepts/global-middleware",
        "concepts/listener-middleware",
        "concepts/context",
      ],
    },
    {
      type: "category",
      label: "Authorization & Security",
      items: [
        "concepts/authorization",
        "concepts/authenticating-oauth",
        "concepts/token-rotation",
      ],
    },
    {
      type: "category",
      label: "Deployments",
      items: ["deployments/aws-lambda", "deployments/heroku"],
    },
    {
      type: "category",
      label: "Migration Guides",
      items: [
        "migration/migration-v2",
        "migration/migration-v3",
        "migration/migration-v4",
      ],
    },
    {
      type: "category",
      label: "Legacy",
      items: [
        "legacy/hubot-migration",
        "legacy/steps-from-apps",
        "legacy/conversation-store",
      ],
    },
    { type: "html", value: "<hr>" },
    "reference",
    { type: "html", value: "<hr>" },
    {
      type: "link",
      label: "Release notes",
      href: "https://github.com/slackapi/bolt-js/releases",
    },
    {
      type: "link",
      label: "Code on GitHub",
      href: "https://github.com/SlackAPI/bolt-js",
    },
    {
      type: "link",
      label: "Contributors Guide",
      href: "https://github.com/SlackAPI/bolt-js/blob/main/.github/contributing.md",
    },
  ],
};

export default sidebars;
