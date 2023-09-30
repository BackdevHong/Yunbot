-- CreateTable
CREATE TABLE "GameOpens" (
    "game_id" SERIAL NOT NULL,
    "game_type" TEXT NOT NULL,
    "game_maxUserCount" INTEGER NOT NULL,
    "game_stopGameOpening" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameOpens_pkey" PRIMARY KEY ("game_id")
);

-- CreateTable
CREATE TABLE "CurrentGameUsers" (
    "current_id" SERIAL NOT NULL,
    "gameOpensGame_id" INTEGER NOT NULL,

    CONSTRAINT "CurrentGameUsers_pkey" PRIMARY KEY ("current_id")
);

-- CreateTable
CREATE TABLE "RealGames" (
    "real_id" SERIAL NOT NULL,
    "gameOpensGame_id" INTEGER NOT NULL,
    "currentGameUsersCurrent_id" INTEGER NOT NULL,

    CONSTRAINT "RealGames_pkey" PRIMARY KEY ("real_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrentGameUsers_gameOpensGame_id_key" ON "CurrentGameUsers"("gameOpensGame_id");

-- CreateIndex
CREATE UNIQUE INDEX "RealGames_gameOpensGame_id_key" ON "RealGames"("gameOpensGame_id");

-- CreateIndex
CREATE UNIQUE INDEX "RealGames_currentGameUsersCurrent_id_key" ON "RealGames"("currentGameUsersCurrent_id");

-- AddForeignKey
ALTER TABLE "CurrentGameUsers" ADD CONSTRAINT "CurrentGameUsers_gameOpensGame_id_fkey" FOREIGN KEY ("gameOpensGame_id") REFERENCES "GameOpens"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealGames" ADD CONSTRAINT "RealGames_gameOpensGame_id_fkey" FOREIGN KEY ("gameOpensGame_id") REFERENCES "GameOpens"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealGames" ADD CONSTRAINT "RealGames_currentGameUsersCurrent_id_fkey" FOREIGN KEY ("currentGameUsersCurrent_id") REFERENCES "CurrentGameUsers"("current_id") ON DELETE RESTRICT ON UPDATE CASCADE;
