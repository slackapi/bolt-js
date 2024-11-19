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
      userId: context.userId,
    };

    if (this.installationStore.deleteInstallation) {
      this.installationStore.deleteInstallation(installQuery, this.logger);
      /**
       * deleteInstallation with enterprise/team_id + user_id -> delete only user tokens
        deleteBot with enterprise/team_id -> delete only bot tokens
        deleteAll with enterprise/team_id -> delete both bot and user tokens
      */
    } else {
      throw new Error(
        `Custom InstallationStore must have deleteInstallation method implemented`,
      );
    }
  }

  public handleAppUninstalledEvents(context: Context) {
    const isEnterpriseInstall = context.isEnterpriseInstall;
  
    const installQuery: InstallationQuery<typeof isEnterpriseInstall> = {
      isEnterpriseInstall: isEnterpriseInstall,
      teamId: context.teamId,
      enterpriseId: context.enterpriseId,
      userId: context.userId,
    };

    if (this.installationStore.deleteInstallation) {
      this.installationStore.deleteInstallation(installQuery, this.logger);
      /**
       * deleteInstallation with enterprise/team_id + user_id -> delete only user tokens
        deleteBot with enterprise/team_id -> delete only bot tokens
        deleteAll with enterprise/team_id -> delete both bot and user tokens
      */
    } else {
      throw new Error(
        `Custom InstallationStore must have deleteInstallation method implemented`,
      );
    }
  }
}
