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

export class ContractVideoAction extends Model<
  InferAttributes<ContractVideoAction>,
  InferCreationAttributes<ContractVideoAction>
> {
  declare id: CreationOptional<number>;
  declare actionId: number;
  declare videoId: number | null;
  declare deltaTimeInSeconds: CreationOptional<number | null>;
}

export function initContractVideoAction() {
  ContractVideoAction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      actionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      videoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      deltaTimeInSeconds: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      tableName: "contractVideoAction",
    }
  );
  return ContractVideoAction;
}