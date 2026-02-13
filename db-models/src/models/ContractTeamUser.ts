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

export class ContractTeamUser extends Model<
  InferAttributes<ContractTeamUser>,
  InferCreationAttributes<ContractTeamUser>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare teamId: number;
  declare isSuperUser: CreationOptional<boolean>;
  declare isAdmin: CreationOptional<boolean>;
  declare isCoach: CreationOptional<boolean>;
}

export function initContractTeamUser() {
  ContractTeamUser.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isSuperUser: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isCoach: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "contractTeamUser",
    }
  );
  return ContractTeamUser;
}