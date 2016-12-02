SELECT af.idFight, af.idFighter, af.assignedTeam
FROM nsfw_activefighters af
WHERE af.idFight = (SELECT af1.idFight
                    FROM nsfw_activefighters af1
                    WHERE af1.idFighter = 'Aelith')
AND af.assignedTeam = (SELECT af2.assignedTeam
                       FROM nsfw_activefighters af2
                       WHERE af2.idFighter = 'Aelith')

SELECT af.assignedTeam
FROM nsfw_activefighters af
WHERE af.idFighter = 'Aelith'
AND af.idFight = 1


SELECT af.idFighter, Count(*)
FROM nsfw_activefighters af
  INNER JOIN nsfw_activefighters ax
    ON af.idFight = ax.idFight
    AND af.assignedTeam = ax.assignedTeam
WHERE ax.idFighter = 'Aelith'
AND af.idFighter <> 'Aelith'
GROUP BY af.idFighter