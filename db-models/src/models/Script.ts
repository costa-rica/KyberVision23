import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./_connection";

export class Script extends Model<
  InferAttributes<Script>,
  InferCreationAttributes<Script>
> {
  declare id: CreationOptional<number>;
  declare sessionId: number;
  declare timestampReferenceFirstAction: Date | null;
  declare isScriptingLive: CreationOptional<boolean>;
}

export function initScript() {
  Script.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sessionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      timestampReferenceFirstAction: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isScriptingLive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "scripts",
    }
  );
  return Script;
}