-- Migration pour supprimer le statut BANNED des utilisateurs
-- D'abord, mettre à jour tous les utilisateurs BANNED vers DISABLED
UPDATE "User" SET status = 'DISABLED' WHERE status = 'BANNED';

-- Ensuite, supprimer la valeur BANNED de l'enum
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "User" ALTER COLUMN status DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN status TYPE "UserStatus" USING status::text::"UserStatus";
ALTER TABLE "User" ALTER COLUMN status SET DEFAULT 'ACTIVE';
DROP TYPE "UserStatus_old";
