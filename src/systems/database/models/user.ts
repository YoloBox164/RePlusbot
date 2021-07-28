import { ModelColumns, Model } from "../basemodel";

type PrimaryKey = { id: string };

type UserAttributes = PrimaryKey & {
  tag: string;
  exp: number;
  level: number;
  spams: number;
  blLinks: number;
  kicks: number;
  bans: number;
  warns: number;
  allTime: number;
  messages: number;
  commandUses: number;
};

class UserModel extends Model<UserAttributes, PrimaryKey> {
  public readonly tableName = "Users";
  public readonly columns: ModelColumns<UserAttributes> = {
    id: {
      type: "BIGINT(20) unsigned",
      allowNull: false,
      primaryKey: true,
    },
    tag: {
      type: "TEXT",
      allowNull: true,
    },
    exp: {
      type: "INT(10) unsigned",
      allowNull: false,
      defaultValue: 0,
    },
    level: {
      type: "INT(10) unsigned",
      allowNull: false,
      defaultValue: 1,
    },
    spams: {
      type: "INT(10) unsigned",
      allowNull: false,
      defaultValue: 0,
    },
    blLinks: {
      type: "INT(10) unsigned",
      allowNull: false,
      defaultValue: 0,
    },
    kicks: {
      type: "INT(10) unsigned",
      allowNull: false,
      defaultValue: 0,
    },
    bans: {
      type: "INT(10) unsigned",
      allowNull: false,
      defaultValue: 0,
    },
    warns: {
      type: "INT(10) unsigned",
      allowNull: false,
      defaultValue: 0,
    },
    allTime: {
      type: "BIGINT(20) unsigned",
      allowNull: false,
      defaultValue: 0,
    },
    messages: {
      type: "BIGINT(20) unsigned",
      allowNull: false,
      defaultValue: 0,
    },
    commandUses: {
      type: "BIGINT(20) unsigned",
      allowNull: false,
      defaultValue: 0,
    },
  };
}

export const UserFactory = new UserModel();
