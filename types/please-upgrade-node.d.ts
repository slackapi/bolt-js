export = pleaseUpgradeNode;

interface Options {
  message?: (requiredVersion: string) => unknown;
  exitCode?: number;
}

declare function pleaseUpgradeNode(packageJson: any, options?: Options): void;
