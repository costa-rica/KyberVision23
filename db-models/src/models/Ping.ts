import {
	DataTypes,
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	ForeignKey,
	literal,
} from "sequelize";
import { sequelize } from "./_connection";
// If you have a User model, you can import it and type the ForeignKey, e.g.:
// import { User } from "./User";

export class Ping extends Model<
	InferAttributes<Ping>,
	InferCreationAttributes<Ping>
> {
	declare id: CreationOptional<number>;

	// If you have a User model, you can type this as ForeignKey<User['id']>
	declare userId: number;

	// Stored in UTC. Highest precision supported by the dialect (microseconds on MySQL/Postgres).
	declare serverTimestamp: CreationOptional<Date>;

	// Client-provided UTC timestamp from the device, ideally an ISO string parsed to Date.
	declare userDeviceTimestamp: Date | null;

	// Endpoint name invoked when this ping was recorded.
	declare endpointName: string | null;

	// Device information fields
	declare deviceName: string | null;
	declare deviceType: string | null;
	declare isTablet: boolean | null;
	declare manufacturer: string | null;
	declare modelName: string | null;
	declare osName: string | null;
	declare osVersion: string | null;
}

export function initPing() {
	Ping.init(
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

			// Use DATE(6) where supported; SQLite will ignore precision but still store ms-level JS Date.
			serverTimestamp: {
				// ts-expect-error: precision is ignored on some dialects (e.g., sqlite) but safe to specify.
				type: (DataTypes.DATE as unknown as (precision?: number) => any)(6),
				allowNull: false,
				// Prefer DB-side UTC now. SQLite CURRENT_TIMESTAMP is UTC.
				defaultValue: literal("CURRENT_TIMESTAMP"),
			},

			userDeviceTimestamp: {
				// ts-expect-error: precision is ignored on some dialects (e.g., sqlite) but safe to specify.
				type: (DataTypes.DATE as unknown as (precision?: number) => any)(6),
				allowNull: true,
			},

			endpointName: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			deviceName: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			deviceType: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			isTablet: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
			},

			manufacturer: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			modelName: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			osName: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			osVersion: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "pings",
			indexes: [{ fields: ["userId"] }, { fields: ["serverTimestamp"] }],
		}
	);

	return Ping;
}
