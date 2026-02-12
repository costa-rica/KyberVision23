import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./_connection";

export class Session extends Model<
  InferAttributes<Session>,
  InferCreationAttributes<Session>
> {
  declare id: CreationOptional<number>;
  declare contractLeagueTeamId: number;
  declare teamId: number;
  declare sessionDate: Date;
  declare city: string | null;
  declare sessionName: string | null;
}

export function initSession() {
  Session.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      contractLeagueTeamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sessionDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sessionName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "sessions",
    }
  );
  return Session;
}