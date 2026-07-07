import nextEnv from "@next/env";
import postgres from "postgres";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	console.error("DATABASE_URL is missing. Add it to .env/.env.local before running database commands.");
	process.exit(1);
}

const parsedUrl = new URL(databaseUrl);

console.log(
	JSON.stringify(
		{
			protocol: parsedUrl.protocol,
			username: parsedUrl.username,
			passwordLength: decodeURIComponent(parsedUrl.password || "").length,
			host: parsedUrl.hostname,
			port: parsedUrl.port || "default",
			database: parsedUrl.pathname.replace(/^\//, ""),
			ssl: parsedUrl.searchParams.get("sslmode") || parsedUrl.searchParams.get("ssl") || null,
		},
		null,
		2,
	),
);

const sql = postgres(databaseUrl, {
	max: 1,
	ssl: "require",
});

try {
	const [connection] = await sql`
		select
			current_database() as database,
			current_user as user,
			inet_server_addr()::text as server_addr,
			inet_server_port() as server_port
	`;

	console.log("Connection OK");
	console.log(JSON.stringify(connection, null, 2));
} catch (error) {
	console.error("Connection failed");
	console.error(
		JSON.stringify(
			{
				code: error.code,
				message: error.message,
				severity: error.severity_local || error.severity,
			},
			null,
			2,
		),
	);
	process.exitCode = 1;
} finally {
	await sql.end({ timeout: 5 });
}
