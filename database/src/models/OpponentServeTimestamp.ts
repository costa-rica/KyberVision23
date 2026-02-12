import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./_connection";

export class OpponentServeTimestamp extends Model<
  InferAttributes<OpponentServeTimestamp>,
  InferCreationAttributes<OpponentServeTimestamp>
> {
  declare id: CreationOptional<number>;
  declare actionId: number;
  declare timestampServiceOpp: Date;
  declare serveType: number;
}

export function initOpponentServeTimestamp() {
  OpponentServeTimestamp.init(
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
      timestampServiceOpp: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      serveType: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "opponentServeTimestamps",
    }
  );
  return OpponentServeTimestamp;
}