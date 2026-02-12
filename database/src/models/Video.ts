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

export class Video extends Model<
  InferAttributes<Video>,
  InferCreationAttributes<Video>
> {
  declare id: CreationOptional<number>;
  declare sessionId: number;
  declare contractTeamUserId: number | null;
  declare filename: string | null;
  declare url: string | null;
  declare videoFileCreatedDateTimeEstimate: Date | null;
  declare videoFileSizeInMb: number | null;
  declare pathToVideoFile: string | null;
  declare processingCompleted: CreationOptional<boolean>;
  declare processingFailed: CreationOptional<boolean>;
  declare youTubeVideoId: string | null;
  declare originalVideoFilename: string | null;
}

export function initVideo() {
  Video.init(
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
      contractTeamUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      videoFileCreatedDateTimeEstimate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      videoFileSizeInMb: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      pathToVideoFile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      processingCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      processingFailed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      youTubeVideoId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      originalVideoFilename: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "videos",
    }
  );
  return Video;
}