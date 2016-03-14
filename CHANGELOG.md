#Version 0.3.0
- Reworked Diving Bulldog, Springboard Bulldog
- Added three new throws, Tiger Suplex, Choke Slam and Headscissors Takedown
- Added check for special events, like OnSuccess, OnFailure, and fixed bonuses events
- Added four brawl moves, Knife Edge Chop, Pressure Point Penetration, Senton Bomb and Drop Kick
- Added two sexual moves, Blue-Balls Wedgie and Camel Toe Clutch
- Minimum damage for all holds is set to one
- Wrist Lock: changed bonus for 'Increase the Hit dice of any Grapple: Holds technique by +2.'
- Arm Wrench bonuses: removed Lariat (some moves are still missing)
- Fixed last turn displaying after the match has ended
- Added classes, for future implementation
- Fixed the counter emote. (It doesn't tell you that you need to !roll anymore)

#Version 0.2.1
- Corrected some dice modificators not being correctly parsed
- If the move is supposed to do damage but the calculation of stats is <= 0, it will at least do 1 damage (like [attacker].strength - [defender].flexibility )
- It's now correctly reseting the current hold's status when the turn switches

#Version 0.2.0

- Added all holds (missing some bonuses, and some conditions), use them with !h or !hold or !holds or !grapple or !grappling or !submission
- All sexual moves fully implemented, transformed some sexual moves to holds (all sexual moves are complete, with conditions and bonuses on roll), use them with !s or !sex or !lust
- Added all brawl moves, use them with !b or !brawl or !hit
- Changed dice system
- Added escape mechanism, you can't attack if you're in a hold now, use it with !e or !escape or !getOut
- Added option to surrender/tapout with !tapout or !giveup or !surrender or !submit
- All commands are now case insensitive


- Removing feature, removing stats, adding Stats, deleting profile is now only permitted to channel operators
- Added !version command
- Added !reset command for channel operators to clear the ring
- Added 'onMiss' trigger, which is executed when an attempted move fails
- Changed how attacks are handled, which means you can now have a lust/hp penalty when attacking someone, or just a move without hp/lust removal
- Added the dice modifiers total when rolling
- All features are implemented, but Stripped down and Exhibitionist features are still disabled

- Added win/loss ratio, but it's only a display. It isn't counted anywhere.


Notes:





