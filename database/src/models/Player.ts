import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./_connection";

export class Player extends Model<
  InferAttributes<Player>,
  InferCreationAttributes<Player>
> {
  declare id: CreationOptional<number>;
  declare firstName: string;
  declare lastName: string;
  declare birthDate: Date | null;
  declare image: CreationOptional<string>;
}

export function initPlayer() {
  Player.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      birthDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        defaultValue: "_playerDefaultRedditAlien.png",
      },
    },
    {
      sequelize,
      tableName: "players",
    }
  );
  return Player;
}