import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  (function() {
    // List of specific paths to redirect
    const redirects = {
      '/bolt-js/concepts/basic': '/bolt-js/getting-started',
      '/bolt-js/concepts/advanced': '/bolt-js/getting-started',
      '/bolt-js/': '/bolt-js/getting-started',
      '/bolt-js/tutorial/getting-started': '/bolt-js/getting-started',
    };

    // Get the current path
    const currentPath = window.location.pathname;

    // Check if the current path matches any in the redirects list
    if (redirects[currentPath]) {
      // Redirect to the new path
      window.location.replace(redirects[currentPath]);
    }
  })();
}