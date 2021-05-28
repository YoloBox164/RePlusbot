import { Snowflake } from "discord.js";

export class React_O_Role {
    public readonly roleId: Snowflake;
    public readonly emoji: unknown; //! Find out what type is it!

    constructor(roleId: Snowflake) {
        this.roleId = roleId;
    }
}

export class React_O_Role_System {

}

export default React_O_Role_System;