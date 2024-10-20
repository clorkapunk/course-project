-- CreateTable
CREATE TABLE "templates" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topicId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "image" TEXT,
    "mode" TEXT DEFAULT 'public',
    "customString1State" TEXT NOT NULL,
    "customString1Question" TEXT,
    "customString1Description" TEXT,
    "customString2State" TEXT NOT NULL,
    "customString2Question" TEXT,
    "customString2Description" TEXT,
    "customString3State" TEXT NOT NULL,
    "customString3Question" TEXT,
    "customString3Description" TEXT,
    "customString4State" TEXT NOT NULL,
    "customString4Question" TEXT,
    "customString4Description" TEXT,
    "customInt1State" TEXT NOT NULL,
    "customInt1Question" TEXT,
    "customInt1Description" TEXT,
    "customInt2State" TEXT NOT NULL,
    "customInt2Question" TEXT,
    "customInt2Description" TEXT,
    "customInt3State" TEXT NOT NULL,
    "customInt3Question" TEXT,
    "customInt3Description" TEXT,
    "customInt4State" TEXT NOT NULL,
    "customInt4Question" TEXT,
    "customInt4Description" TEXT,
    "customText1State" TEXT NOT NULL,
    "customText1Question" TEXT,
    "customText1Description" TEXT,
    "customText2State" TEXT NOT NULL,
    "customText2Question" TEXT,
    "customText2Description" TEXT,
    "customText3State" TEXT NOT NULL,
    "customText3Question" TEXT,
    "customText3Description" TEXT,
    "customText4State" TEXT NOT NULL,
    "customText4Question" TEXT,
    "customText4Description" TEXT,
    "customBool1State" TEXT NOT NULL,
    "customBool1Question" TEXT,
    "customBool1Description" TEXT,
    "customBool2State" TEXT NOT NULL,
    "customBool2Question" TEXT,
    "customBool2Description" TEXT,
    "customBool3State" TEXT NOT NULL,
    "customBool3Question" TEXT,
    "customBool3Description" TEXT,
    "customBool4State" TEXT NOT NULL,
    "customBool4Question" TEXT,
    "customBool41Description" TEXT,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates_tags" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "templates_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tempaltes_users" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "tempaltes_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "templateId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "customString1Answer" TEXT,
    "customString2Answer" TEXT,
    "customString3Answer" TEXT,
    "customString4Answer" TEXT,
    "customInt1Answer" INTEGER,
    "customInt2Answer" INTEGER,
    "customInt3Answer" INTEGER,
    "customInt4Answer" INTEGER,
    "customText1Answer" TEXT,
    "customText2Answer" TEXT,
    "customText3Answer" TEXT,
    "customText4Answer" TEXT,
    "customBool1Answer" BOOLEAN,
    "customBool2Answer" BOOLEAN,
    "customBool3Answer" BOOLEAN,
    "customBool4Answer" BOOLEAN,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates_tags" ADD CONSTRAINT "templates_tags_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates_tags" ADD CONSTRAINT "templates_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tempaltes_users" ADD CONSTRAINT "tempaltes_users_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tempaltes_users" ADD CONSTRAINT "tempaltes_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
