SELECT fighters.name, fighters.season, fighters.areStatsPrivate, fighters.dexterity, fighters.power, fighters.sensuality, fighters.endurance, fighters.willpower, fighters.toughness, fighters.tokens, fighters.tokensSpent,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters
    WHERE idFighter = fighters.name
  )                                        AS fightsCount,

  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = consts.value
          AND idFighter = fighters.name
  )                                        AS fightsCountCS,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters
    WHERE idFighter = fighters.name AND fightStatus = 0
  )                                        AS losses,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = fighters.name
          AND fightStatus = 0
  )                                        AS lossesSeason,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters
    WHERE idFighter = fighters.name AND fightStatus = 1
  )                                        AS wins,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = fighters.name
          AND fightStatus = 1
  )                                        AS winsSeason,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters
    WHERE idFighter = fighters.name AND fightStatus = 2
  )                                        AS currentlyPlaying,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = fighters.name
          AND fightStatus = 0
  )                                        AS currentlyPlayingSeason,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters
    WHERE idFighter = fighters.name AND fightStatus = 3
  )                                        AS forfeits,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = fighters.name
          AND fightStatus = 3
  )                                        AS forfeitsSeason,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters
    WHERE idFighter = fighters.name AND fightStatus = 4
  )                                        AS fightsPendingReady,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = fighters.name
          AND fightStatus = 4
  )                                        AS fightsPendingReadySeason,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
    WHERE idFighter = fighters.name AND fightStatus = 5
  )                                        AS fightsPendingStart,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = fighters.name
          AND fightStatus = 5
  )                                        AS fightsPendingStartSeason,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
    WHERE idFighter = fighters.name AND af.wantsDraw = TRUE
  )                                        AS fightsPendingDraw,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = fighters.name
          AND af.wantsDraw = TRUE
  )                                        AS fightsPendingDrawSeason,
  (
    SELECT assignedTeam
    FROM nsfw_activefighters
    WHERE idFighter = fighters.name
    GROUP BY assignedTeam
    ORDER BY Count(*) DESC
    LIMIT 1
  )                                        AS favoriteTeam,
  (
    SELECT af.idFighter
    FROM nsfw_activefighters af
      INNER JOIN nsfw_activefighters ax
        ON af.idFight = ax.idFight
           AND af.assignedTeam = ax.assignedTeam
    WHERE ax.idFighter = fighters.name
          AND af.idFighter <> fighters.name
    GROUP BY af.idFighter
    ORDER BY Count(*) DESC
    LIMIT 1
  )                                        AS favoriteTagPartner,
  (
    SELECT Count(*)
    FROM nsfw_activefighters af
      INNER JOIN nsfw_activefighters ax
        ON af.idFight = ax.idFight
           AND af.assignedTeam = ax.assignedTeam
    WHERE ax.idFighter = fighters.name
          AND af.idFighter <> fighters.name
    GROUP BY af.idFighter
    ORDER BY Count(*) DESC
    LIMIT 1
  )                                        AS timesFoughtWithFavoriteTagPartner,
  IFNULL((SELECT AVG(diceScore)
          FROM nsfw_actions
          WHERE idAttacker = fighters.name), 0) AS averageDiceRoll,
  (
    SELECT Count(missed)
    FROM nsfw_actions
    WHERE idAttacker = fighters.name
  )                                        AS missedAttacks,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE idAttacker = fighters.name
  )                                        AS actionsCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE idDefender = fighters.name
  )                                        AS actionsDefended,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 0 AND (idAttacker = fighters.name) AND missed = FALSE
  )                                        AS brawlAtksCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 1 AND missed = FALSE AND (idAttacker = fighters.name)
  )                                        AS sexstrikesCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 2 AND missed = FALSE AND (idAttacker = fighters.name OR idDefender = fighters.name)
  )                                        AS tagsCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 3 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS restCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 4 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS subholdCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 5 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS sexholdCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 6 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS bondageCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 7 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS humholdCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 8 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS itemPickups,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 9 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS sextoyPickups,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 10 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS degradationCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 11 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS forcedWorshipCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 12 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS highriskCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 13 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS penetrationCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 14 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS stunCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 15 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS escapeCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 16 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS submitCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 17 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS straptoyCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 18 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS finishCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 19 AND missed = FALSE AND idAttacker = fighters.name
  )                                        AS masturbateCount,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters af
    WHERE idFighter = fighters.name AND timestampdiff(HOUR, af.updatedAt, NOW()) <= 24
  )                                        AS matchesInLast24Hours,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters af
    WHERE idFighter = fighters.name AND timestampdiff(HOUR, af.updatedAt, NOW()) <= 48
  )                                        AS matchesInLast48Hours
FROM nsfw_fighters fighters, nsfw_constants consts
WHERE consts.name = 'currentSeason';






