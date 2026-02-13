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

export class ContractPlayerUser extends Model<
  InferAttributes<ContractPlayerUser>,
  InferCreationAttributes<ContractPlayerUser>
> {
  declare id: CreationOptional<number>;
  declare playerId: number;
  declare userId: number;
}

export function initContractPlayerUser() {
  ContractPlayerUser.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      playerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      tableName: "contractPlayerUser",
    }
  );
  return ContractPlayerUser;
}