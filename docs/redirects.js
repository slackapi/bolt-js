import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
(function() {
  // List of specific URLs to handle
  const urlsToHandle = [
    '/bolt-js/concepts#basic',
    '/bolt-js/concepts#advanced',
    '/bolt-js/concepts#message-listening',
    '/bolt-js/concepts#message-sending',
    '/bolt-js/concepts#event-listening',
    '/bolt-js/concepts#web-api',
    '/bolt-js/concepts#action-listening',
    '/bolt-js/concepts#action-respond',
    '/bolt-js/concepts#acknowledge',
    '/bolt-js/concepts#shortcuts',
    '/bolt-js/concepts#commands',
    '/bolt-js/concepts#creating-modals',
    '/bolt-js/concepts#updating-pushing-views',
    '/bolt-js/concepts#view-submissions',
    '/bolt-js/concepts#publishing-views',
    '/bolt-js/concepts#options',
    '/bolt-js/concepts#authenticating-oauth',
    '/bolt-js/concepts#socket-mode',
    '/bolt-js/concepts#error-handling',
    '/bolt-js/concepts#authorization',
    '/bolt-js/concepts#token-rotation',
    '/bolt-js/concepts#conversation-store',
    '/bolt-js/concepts#global-middleware',
    '/bolt-js/concepts#listener-middleware',
    '/bolt-js/concepts#context',
    '/bolt-js/concepts#deferring-initialization',
    '/bolt-js/concepts#logging',
    '/bolt-js/concepts#custom-routes',
    '/bolt-js/concepts#receiver',
    '/bolt-js/concepts#creating-custom-functions',
    '/bolt-js/concepts#defining-custom-functions',
    '/bolt-js/concepts#listening-to-custom-functions',
    '/bolt-js/concepts#responding-to-interactivity',
    '/bolt-js/concepts#steps',
    '/bolt-js/concepts#creating-steps',
    '/bolt-js/concepts#adding-editing-steps',
    '/bolt-js/concepts#saving-steps',
    '/bolt-js/concepts#executing-steps',
    '/bolt-js/ja-jp/concepts#message-listening',
    '/bolt-js/ja-jp/concepts#message-sending',
    '/bolt-js/ja-jp/concepts#event-listening',
    '/bolt-js/ja-jp/concepts#web-api',
    '/bolt-js/ja-jp/concepts#action-listening',
    '/bolt-js/ja-jp/concepts#action-respond',
    '/bolt-js/ja-jp/concepts#acknowledge',
    '/bolt-js/ja-jp/concepts#shortcuts',
    '/bolt-js/ja-jp/concepts#commands',
    '/bolt-js/ja-jp/concepts#creating-modals',
    '/bolt-js/ja-jp/concepts#updating-pushing-views',
    '/bolt-js/ja-jp/concepts#view-submissions',
    '/bolt-js/ja-jp/concepts#publishing-views',
    '/bolt-js/ja-jp/concepts#options',
    '/bolt-js/ja-jp/concepts#authenticating-oauth',
    '/bolt-js/ja-jp/concepts#socket-mode',
    '/bolt-js/ja-jp/concepts#error-handling',
    '/bolt-js/ja-jp/concepts#authorization',
    '/bolt-js/ja-jp/concepts#token-rotation',
    '/bolt-js/ja-jp/concepts#conversation-store',
    '/bolt-js/ja-jp/concepts#global-middleware',
    '/bolt-js/ja-jp/concepts#listener-middleware',
    '/bolt-js/ja-jp/concepts#context',
    '/bolt-js/ja-jp/concepts#deferring-initialization',
    '/bolt-js/ja-jp/concepts#logging',
    '/bolt-js/ja-jp/concepts#custom-routes',
    '/bolt-js/ja-jp/concepts#receiver',
    '/bolt-js/ja-jp/concepts#creating-custom-functions',
    '/bolt-js/ja-jp/concepts#defining-custom-functions',
    '/bolt-js/ja-jp/concepts#listening-to-custom-functions',
    '/bolt-js/ja-jp/concepts#responding-to-interactivity',
    '/bolt-js/ja-jp/concepts#steps',
    '/bolt-js/ja-jp/concepts#creating-steps',
    '/bolt-js/ja-jp/concepts#adding-editing-steps',
    '/bolt-js/ja-jp/concepts#saving-steps',
    '/bolt-js/ja-jp/concepts#executing-steps',
  ];

  // Get the current path and hash
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;

  // If there is a hash fragment
  if (currentHash && currentHash.includes('#')) {
    // Create the full URL with hash replaced by '/'
    const newPath = currentPath + currentHash.replace('#', '/');

    // Loop through the list of URLs to handle
    for (const url of urlsToHandle) {
      // Check if the current path matches the URL to handle
      if (currentPath === url.split('#')[0] && window.location.hash === `#${url.split('#')[1]}`) {
        // Redirect to the new path
        window.location.replace(newPath);
        return; // Exit after the first match
      }
    }
  }
})();
}
