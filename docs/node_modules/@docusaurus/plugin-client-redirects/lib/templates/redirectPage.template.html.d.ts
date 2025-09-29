/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
declare const _default: "\n<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"UTF-8\">\n    <meta http-equiv=\"refresh\" content=\"0; url=<%= it.toUrl %>\">\n    <link rel=\"canonical\" href=\"<%= it.toUrl %>\" />\n  </head>\n  <script>\n    window.location.href = '<%= it.toUrl %>'<%= it.searchAnchorForwarding ? ' + window.location.search + window.location.hash' : '' %>;\n  </script>\n</html>\n";
export default _default;
