import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./_connection";

export class League extends Model<
  InferAttributes<League>,
  InferCreationAttributes<League>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare category: string;
}

export function initLeague() {
  League.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "leagues",
    }
  );
  return League;
}