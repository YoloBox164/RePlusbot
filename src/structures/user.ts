import { Client, Structures } from "discord.js";
import { DevID } from "../settings";

declare module "discord.js" {
  interface User {
    isDev: boolean;
  }
}

Structures.extend("User", (User) => {
  class CustomUser extends User {
    public isDev = this.id === DevID;

    constructor(client: Client, data: Record<string, unknown>) {
      super(client, data);
    }
  }

  return CustomUser;
});
