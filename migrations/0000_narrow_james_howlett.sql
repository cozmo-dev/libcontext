CREATE TABLE `libraries` (
	`name` text PRIMARY KEY NOT NULL,
	`description` text,
	`owner` text NOT NULL,
	`repo` text NOT NULL,
	`ref` text NOT NULL,
	`sha` text NOT NULL,
	`folders` text DEFAULT (json_array()) NOT NULL,
	`files` integer DEFAULT 0,
	`snippets` integer DEFAULT 0,
	`timestamp` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `snippets` (
	`record` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`library` text NOT NULL,
	`path` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`language` text,
	`code` text NOT NULL,
	`embedding` F32_BLOB(1536),
	FOREIGN KEY (`library`) REFERENCES `libraries`(`name`) ON UPDATE no action ON DELETE cascade
);
