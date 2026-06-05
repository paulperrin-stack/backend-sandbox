-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_authorId_fkey";

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;
