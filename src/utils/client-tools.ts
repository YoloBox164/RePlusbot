import { DateTime } from "luxon";

export default {
  logDate(timestamp: number = Date.now()): string {
    return DateTime.fromMillis(timestamp).toFormat("yyyy-MM-dd | TT 'GMT'ZZZ");
  },
};
