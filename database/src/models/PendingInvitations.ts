import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./_connection";

export class PendingInvitations extends Model<
  InferAttributes<PendingInvitations>,
  InferCreationAttributes<PendingInvitations>
> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare teamId: number;
}

export function initPendingInvitations() {
  PendingInvitations.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "pendingInvitations",
    }
  );
  return PendingInvitations;
}