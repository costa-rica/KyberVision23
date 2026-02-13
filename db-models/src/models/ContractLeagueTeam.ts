import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
} from "sequelize";
import { sequelize } from "./_connection";

export class ContractLeagueTeam extends Model<
  InferAttributes<ContractLeagueTeam>,
  InferCreationAttributes<ContractLeagueTeam>
> {
  declare id: CreationOptional<number>;
  declare leagueId: number;
  declare teamId: number;
}

export function initContractLeagueTeam() {
  ContractLeagueTeam.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      leagueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "contractLeagueTeam",
    }
  );
  return ContractLeagueTeam;
}