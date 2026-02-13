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

export class ContractTeamPlayer extends Model<
  InferAttributes<ContractTeamPlayer>,
  InferCreationAttributes<ContractTeamPlayer>
> {
  declare id: CreationOptional<number>;
  declare playerId: number;
  declare teamId: number;
  declare shirtNumber: number | null;
  declare position: string | null;
  declare positionAbbreviation: string | null;
  declare role: string | null;
}

export function initContractTeamPlayer() {
  ContractTeamPlayer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      playerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shirtNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      position: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      positionAbbreviation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "contractTeamPlayer",
    }
  );
  return ContractTeamPlayer;
}