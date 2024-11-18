import { InstallationStore, InstallationQuery } from "@slack/oauth";
import { Logger } from '@slack/logger';
import { Context } from "../types";

export class TokenRevocationListeners {
  private installationStore: InstallationStore;
  private logger: Logger;

  public constructor(installationStore: InstallationStore, logger: Logger) {
    this.installationStore = installationStore;
    this.logger = logger;
  }

  public handleTokensRevokedEvents(context: Context) {
    const isEnterpriseInstall = context.isEnterpriseInstall;
  
    const installQuery: InstallationQuery<typeof isEnterpriseInstall> = {
      isEnterpriseInstall: isEnterpriseInstall,
      teamId: isEnterpriseInstall ? context.teamId : undefined,
      enterpriseId: isEnterpriseInstall ? context.enterpriseId : undefined
    };

    this.installationStore.deleteInstallation(installQuery, this.logger);

    // add logic to delete bot?
  }

  public handleAppUninstalledEvents(context: Context) {
    const isEnterpriseInstall = context.isEnterpriseInstall;
  
    const installQuery: InstallationQuery<typeof isEnterpriseInstall> = {
      isEnterpriseInstall: isEnterpriseInstall,
      teamId: isEnterpriseInstall ? context.teamId : undefined,
      enterpriseId: isEnterpriseInstall ? context.enterpriseId : undefined
    };
    
    this.installationStore.deleteInstallation(installQuery, this.logger);

    // add logic to delete bot?
  }
}
