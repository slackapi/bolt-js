import { InstallationStore, InstallationQuery } from "@slack/oauth";
import { ConsoleLogger, Logger, LogLevel } from '@slack/logger';
import { Context } from "../types";

export class TokenRevocationListeners {
  private installationStore: InstallationStore;
  private logger: Logger;

  public constructor(installationStore: InstallationStore, logger: Logger, logLevel = LogLevel.INFO,) {
    this.installationStore = installationStore;
    this.logger =
      logger ??
      (() => {
        const defaultLogger = new ConsoleLogger();
        defaultLogger.setLevel(logLevel);
        return defaultLogger;
      })();
  }

  public handleTokensRevokedEvents(context: Context) {
    const isEnterpriseInstall = context.isEnterpriseInstall;
  
    const installQuery: InstallationQuery<typeof isEnterpriseInstall> = {
      isEnterpriseInstall: isEnterpriseInstall,
      teamId: context.teamId,
      enterpriseId: context.enterpriseId,
    };

    this.installationStore.deleteInstallation(installQuery, this.logger);

    // add logic to delete bot?
  }

  public handleAppUninstalledEvents(context: Context) {
    const isEnterpriseInstall = context.isEnterpriseInstall;
  
    const installQuery: InstallationQuery<typeof isEnterpriseInstall> = {
      isEnterpriseInstall: isEnterpriseInstall,
      teamId: context.teamId,
      enterpriseId: context.enterpriseId,
    };
    
    this.installationStore.deleteInstallation(installQuery, this.logger);

    // add logic to delete bot?
  }
}
