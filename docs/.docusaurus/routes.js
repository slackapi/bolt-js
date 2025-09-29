import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/bolt-js/__docusaurus/debug',
    component: ComponentCreator('/bolt-js/__docusaurus/debug', 'e60'),
    exact: true
  },
  {
    path: '/bolt-js/__docusaurus/debug/config',
    component: ComponentCreator('/bolt-js/__docusaurus/debug/config', '05a'),
    exact: true
  },
  {
    path: '/bolt-js/__docusaurus/debug/content',
    component: ComponentCreator('/bolt-js/__docusaurus/debug/content', '4bd'),
    exact: true
  },
  {
    path: '/bolt-js/__docusaurus/debug/globalData',
    component: ComponentCreator('/bolt-js/__docusaurus/debug/globalData', 'ddf'),
    exact: true
  },
  {
    path: '/bolt-js/__docusaurus/debug/metadata',
    component: ComponentCreator('/bolt-js/__docusaurus/debug/metadata', 'bf2'),
    exact: true
  },
  {
    path: '/bolt-js/__docusaurus/debug/registry',
    component: ComponentCreator('/bolt-js/__docusaurus/debug/registry', 'c1b'),
    exact: true
  },
  {
    path: '/bolt-js/__docusaurus/debug/routes',
    component: ComponentCreator('/bolt-js/__docusaurus/debug/routes', '33b'),
    exact: true
  },
  {
    path: '/bolt-js/',
    component: ComponentCreator('/bolt-js/', '90d'),
    routes: [
      {
        path: '/bolt-js/',
        component: ComponentCreator('/bolt-js/', '9fe'),
        routes: [
          {
            path: '/bolt-js/',
            component: ComponentCreator('/bolt-js/', '8e3'),
            routes: [
              {
                path: '/bolt-js/concepts/acknowledge',
                component: ComponentCreator('/bolt-js/concepts/acknowledge', '8b3'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/actions',
                component: ComponentCreator('/bolt-js/concepts/actions', '756'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/ai-apps',
                component: ComponentCreator('/bolt-js/concepts/ai-apps', 'fb9'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/authenticating-oauth',
                component: ComponentCreator('/bolt-js/concepts/authenticating-oauth', '560'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/authorization',
                component: ComponentCreator('/bolt-js/concepts/authorization', 'ae6'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/commands',
                component: ComponentCreator('/bolt-js/concepts/commands', 'c7e'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/context',
                component: ComponentCreator('/bolt-js/concepts/context', 'c4b'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/conversation-store',
                component: ComponentCreator('/bolt-js/concepts/conversation-store', 'd08'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/creating-modals',
                component: ComponentCreator('/bolt-js/concepts/creating-modals', '766'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/custom-routes',
                component: ComponentCreator('/bolt-js/concepts/custom-routes', 'cab'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/custom-steps',
                component: ComponentCreator('/bolt-js/concepts/custom-steps', 'eae'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/deferring-initialization',
                component: ComponentCreator('/bolt-js/concepts/deferring-initialization', '6d0'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/error-handling',
                component: ComponentCreator('/bolt-js/concepts/error-handling', '7ae'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/event-listening',
                component: ComponentCreator('/bolt-js/concepts/event-listening', '6f0'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/global-middleware',
                component: ComponentCreator('/bolt-js/concepts/global-middleware', 'd5b'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/listener-middleware',
                component: ComponentCreator('/bolt-js/concepts/listener-middleware', '83b'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/logging',
                component: ComponentCreator('/bolt-js/concepts/logging', 'f6c'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/message-listening',
                component: ComponentCreator('/bolt-js/concepts/message-listening', '343'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/message-sending',
                component: ComponentCreator('/bolt-js/concepts/message-sending', '21f'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/options',
                component: ComponentCreator('/bolt-js/concepts/options', '54f'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/publishing-views',
                component: ComponentCreator('/bolt-js/concepts/publishing-views', '07b'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/receiver',
                component: ComponentCreator('/bolt-js/concepts/receiver', '0de'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/shortcuts',
                component: ComponentCreator('/bolt-js/concepts/shortcuts', 'ccb'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/socket-mode',
                component: ComponentCreator('/bolt-js/concepts/socket-mode', '8c7'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/token-rotation',
                component: ComponentCreator('/bolt-js/concepts/token-rotation', '918'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/updating-pushing-views',
                component: ComponentCreator('/bolt-js/concepts/updating-pushing-views', '077'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/view-submissions',
                component: ComponentCreator('/bolt-js/concepts/view-submissions', '75c'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/concepts/web-api',
                component: ComponentCreator('/bolt-js/concepts/web-api', 'c10'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/deployments/aws-lambda',
                component: ComponentCreator('/bolt-js/deployments/aws-lambda', '501'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/deployments/heroku',
                component: ComponentCreator('/bolt-js/deployments/heroku', '0aa'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/getting-started',
                component: ComponentCreator('/bolt-js/getting-started', 'a8e'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/legacy/steps-from-apps',
                component: ComponentCreator('/bolt-js/legacy/steps-from-apps', 'ef9'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/reference',
                component: ComponentCreator('/bolt-js/reference', '60d'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/tutorial/hubot-migration',
                component: ComponentCreator('/bolt-js/tutorial/hubot-migration', '33a'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/tutorial/migration-v2',
                component: ComponentCreator('/bolt-js/tutorial/migration-v2', '356'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/tutorial/migration-v3',
                component: ComponentCreator('/bolt-js/tutorial/migration-v3', '6c1'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/tutorial/migration-v4',
                component: ComponentCreator('/bolt-js/tutorial/migration-v4', '659'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/tutorials/ai-assistant',
                component: ComponentCreator('/bolt-js/tutorials/ai-assistant', '715'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/tutorials/code-assistant',
                component: ComponentCreator('/bolt-js/tutorials/code-assistant', 'fce'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/tutorials/custom-steps',
                component: ComponentCreator('/bolt-js/tutorials/custom-steps', '1cc'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/tutorials/custom-steps-workflow-builder-existing',
                component: ComponentCreator('/bolt-js/tutorials/custom-steps-workflow-builder-existing', '2e9'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/tutorials/custom-steps-workflow-builder-new',
                component: ComponentCreator('/bolt-js/tutorials/custom-steps-workflow-builder-new', '3c8'),
                exact: true,
                sidebar: "sidebarJSBolt"
              },
              {
                path: '/bolt-js/',
                component: ComponentCreator('/bolt-js/', '8c0'),
                exact: true,
                sidebar: "sidebarJSBolt"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
