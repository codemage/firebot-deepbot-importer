import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { FirebotUser } from "@crowbartools/firebot-custom-scripts-types/types/modules/user-db";
import { HelixUser } from "@twurple/api";
import { parse } from "csv-parse/sync";
import * as util from "util";

interface Params {
  csv: string;
  currency: string;
}

interface DeepBotUserEntry {
  user: string;
  points: number;
  watch_time: number;
  vip: number;
  mod: number;
  join_date: Date;
  last_seen: Date;
  vip_expiry: Date;
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Deepbot CSV Importer",
      description: "Import a saved DeepBot user database",
      author: "Walter Mundt",
      version: "0.0.1",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      csv: {
        type: "filepath",
        title: "CSV File",
        description: "Exported DeepBot user database in CSV format",
        fileOptions: {
          directoryOnly: false,
          filters: [{name: "*.csv", extensions: ["csv"]}],
          title: "DeepBot CSV File",
          buttonLabel: "Pick CSV File"
        },
        validation: {required: true},
      },
      currency: {
        type: "currency-select",
        title: "Currency",
        description: "Currency to overwrite with points from CSV data",
        validation: {required: true},
      }
    };
  },
  run: async (runRequest) => {
    const { logger, currencyDb, twitchApi, userDb } = runRequest.modules;
    const readFile = util.promisify(runRequest.modules.fs.readFile);

    const currency = currencyDb.getCurrencyById(runRequest.parameters.currency);
    logger.info("Importing DeepBot users from ", runRequest.parameters.csv, " overwriting currency:", currency.name);
  
    const csv_path = runRequest.parameters.csv;
    const csv_buf = await readFile(csv_path);
    let csv_data: DeepBotUserEntry[] = parse(csv_buf, {columns: true, skip_empty_lines: true, cast: (value, context) => {
      if (context.header || context.column == "user")
        return value;
      if (["points", "watch_time", "vip", "mod"].includes(context.column as string))
        return Number(value);
      // TODO: how to handle dates?
      if (["join_date", "last_seen", "vip_expiry"].includes(context.column as string))
        return new Date(value);
      return value;
    }});
  
    const now = new Date();
    const days_since = function(d : Date) { return (now.valueOf() - d.valueOf())/1000/60/60/24; }
    let total_records = csv_data.length;
    // csv_data = csv_data.filter(value => days_since(value.last_seen) < 30);
    logger.info("parsed", total_records, "CSV records, requesting", csv_data.length, " users' information from Twitch");
    const twitchUserList = await twitchApi.users.getUsersByNames(csv_data.filter(value => value).map(value => value.user));
    const twitchUsers: Record<string, HelixUser> = {};
    for (const user of twitchUserList) { twitchUsers[user.name] = user; }
    /*let showUser = async (user: string) => {
      if (user in twitchUsers) {
        let firebotUser = await userDb.getUserById(twitchUsers[user].id);
        logger.info(user, "in firebot: ", firebotUser);
      }
    };
    await showUser("leonfoucault");*/
    logger.info("received", twitchUserList.length, "user records from Twitch, commencing FireBot user database update");
    for (const row of csv_data) {
      let twitchUser = twitchUsers[row.user];
      if (!twitchUser) {
        logger.info(row.user, "not found on Twitch any more, skipping");
        continue;
      }
      let firebotUser = await userDb.getUserById(twitchUser.id);
      let action: String;
      if (firebotUser === undefined || firebotUser === null) {
        action = "create";
        firebotUser = {
          // @ts-expect-error bad type in the TypeScript interface for this
          _id: twitchUser.id,
          username: row.user,
          displayName: twitchUser.displayName,
          profilePicUrl: twitchUser.profilePictureUrl,
          twitch: true,
          twitchRoles: [],
          online: false,
          // @ts-expect-error these should be timestmaps and not Date objects
          onlineAt: row.last_seen.valueOf(),
          // @ts-expect-error these should be timestamps and not Date objects
          lastSeen: row.last_seen.valueOf(),
          // @ts-expect-error these should be timestamps and not Date objects
          joinDate: row.join_date.valueOf(),
          minutesInChannel: row.watch_time,
          chatMessages: 0,
          disableAutoStatAccrual: false,
          disableActiveUserList: false,
          disableViewerList: false,
          metadata: {},
          currency: {[currency.id]: row.points},
          ranks: {},
        };
      } else {
        action = "update";
        // @ts-expect-error these should be timestamps and not Date objects
        firebotUser.lastSeen = Math.max(row.last_seen.valueOf(), firebotUser.lastSeen);
        // @ts-expect-error these should be timestamps and not Date objects
        firebotUser.joinDate = Math.min(row.join_date.valueOf(), firebotUser.joinDate);
        firebotUser.minutesInChannel = row.watch_time;
        firebotUser.currency = {[currency.id]: row.points};
      }
      let ok = await userDb.updateUser(firebotUser);
      if (ok)
        logger.info(ok + ";", action + "d", "user", row.user);
      else
        logger.info(ok + ";", "failed to", action, "user", row.user);
    }

    logger.info("DeepBot data import complete");
  },
};

export default script;
