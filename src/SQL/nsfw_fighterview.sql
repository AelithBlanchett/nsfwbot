SELECT
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters
    WHERE idFighter = 'Aelith'
  )                                        AS fightsCount,

  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = 'Aelith'
  )                                        AS fightsCountCS,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters
    WHERE idFighter = 'Aelith' AND fightStatus = 0
  )                                        AS losses,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = 'Aelith'
          AND fightStatus = 0
  )                                        AS lossesSeason,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters
    WHERE idFighter = 'Aelith' AND fightStatus = 1
  )                                        AS wins,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = 'Aelith'
          AND fightStatus = 1
  )                                        AS winsSeason,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters
    WHERE idFighter = 'Aelith' AND fightStatus = 2
  )                                        AS currentlyPlaying,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = 'Aelith'
          AND fightStatus = 0
  )                                        AS currentlyPlayingSeason,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters
    WHERE idFighter = 'Aelith' AND fightStatus = 3
  )                                        AS forfeits,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = 'Aelith'
          AND fightStatus = 3
  )                                        AS forfeitsSeason,
  (
    SELECT Count(idFight)
    FROM nsfw_activefighters
    WHERE idFighter = 'Aelith' AND fightStatus = 4
  )                                        AS fightsPendingReady,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = 'Aelith'
          AND fightStatus = 4
  )                                        AS fightsPendingReadySeason,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
    WHERE idFighter = 'Aelith' AND fightStatus = 5
  )                                        AS fightsPendingStart,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = 'Aelith'
          AND fightStatus = 5
  )                                        AS fightsPendingStartSeason,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
    WHERE idFighter = 'Aelith' AND af.wantsDraw = TRUE
  )                                        AS fightsPendingDraw,
  (
    SELECT Count(af.idFight)
    FROM nsfw_activefighters af
      LEFT JOIN nsfw_fights f
        ON af.idFight = f.idFight
    WHERE f.season = 1
          AND idFighter = 'Aelith'
          AND af.wantsDraw = TRUE
  )                                        AS fightsPendingDrawSeason,
  (
    SELECT assignedTeam
    FROM nsfw_activefighters
    WHERE idFighter = 'Aelith'
    GROUP BY assignedTeam
    ORDER BY Count(*) DESC
    LIMIT 1
  )                                        AS favoriteTeam,
  (
    SELECT idFighter
    FROM nsfw_activefighters
    WHERE idFighter <> 'Aelith'
    GROUP BY assignedTeam
    ORDER BY Count(*) DESC
    LIMIT 1
  )                                        AS favoriteTagPartner,
  IFNULL((SELECT AVG(diceScore)
          FROM nsfw_actions
          WHERE idAttacker = 'Aelith'), 0) AS averageDiceRoll,
  (
    SELECT Count(missed)
    FROM nsfw_actions
    WHERE idAttacker = 'Aelith'
  )                                        AS missedAttacks,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE idAttacker = 'Aelith'
  )                                        AS actionsCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE idDefender = 'Aelith'
  )                                        AS actionsDefended,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 0 AND (idAttacker = 'Aelith') AND missed = FALSE
  )                                        AS brawlAtksCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 1 AND missed = FALSE AND (idAttacker = 'Aelith')
  )                                        AS sexstrikesCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 2 AND missed = FALSE AND (idAttacker = 'Aelith' OR idDefender = 'Aelith')
  )                                        AS tagsCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 3 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS restCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 4 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS subholdCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 5 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS sexholdCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 6 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS bondageCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 7 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS humholdCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 8 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS itemPickups,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 9 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS sextoyPickups,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 10 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS degradationCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 11 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS forcedWorshipCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 12 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS highriskCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 13 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS penetrationCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 14 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS stunCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 15 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS escapeCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 16 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS submitCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 17 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS straptoyCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 18 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS finishCount,
  (
    SELECT Count(*)
    FROM nsfw_actions
    WHERE type = 19 AND missed = FALSE AND idAttacker = 'Aelith'
  )                                        AS masturbateCount,
  (
    SELECT Count(idFight) AS fights
    FROM nsfw_activefighters af
    WHERE idFighter = 'Aelith' AND timediff(NOW(), af.updatedAt) < '24:00:00'
  )                                        AS matchesInLast24Hours,
  (
    SELECT Count(idFight) AS fights
    FROM nsfw_activefighters af
    WHERE idFighter = 'Aelith' AND timediff(NOW(), af.updatedAt) < '48:00:00'
  )                                        AS matchesInLast48Hours;





