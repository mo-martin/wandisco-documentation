---
id: migration
title: Start a Migration
sidebar_label: Start a Migration
---

The LiveMigrator allows you to migrate data in a single pass while keeping up with all changes to your source zone. The outcome is data which is guaranteed to be consistent between source and target. As data is being migrated it is immediately ready to be used, without interruption.

Once you have created a replication rule you can start a migration.

From the rule screen, go to Configure Migration, check the details are correct and simply click Start Migration.

One setting you need to configure is the overwrite setting. This determines what happens if the Migrator encounters content in the target path with the same name and size.

- Skip - If the filesize is identical between the source and target, the file is skipped. If it’s a different size, the whole file is replaced.

- Overwrite - Everything is replaced, even if the file size is identical.

  Coming soon will be the ability to decide if files are always overwritten, or if they are only overwritten if their timestamp is after a specified time. This time is set in UTC.
