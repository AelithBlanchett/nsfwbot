# NSFWBot [![Build Status](https://travis-ci.org/AelithBlanchett/nsfwbot.svg?branch=master)](https://travis-ci.org/AelithBlanchett/nsfwbot)

Not much here for the moment.

## Install
1) Pull from master

2) Do that:
  - npm install
  - npm install typescript -g
  - tsc
  - cd tests
  - node tests.js
And check if the tests are working correctly.

3) Edit config file with your info

4) npm start

5) Commands are automatically loaded


###Available commands:

!addFeature, !addStats, !addfeature, !addstats, !b, !brawl, !current, !dbg, !deleteProfile, !deleteprofile, !e, !escape, !escapeHold, !escapehold, !exit, !fight, !flood, !forfeit, !getStats, !getstats, !giveUp, !giveup, !grapple, !grappling, !h, !help, !hit, !hold, !holds, !hp, !leave, !leaveFight, !leavefight, !list, !listops, !lust, !myStats, !mystats, !ready, !register, !reloadplugins, !removeFeature, !removeStats, !removefeature, !removestats, !reset, !restart, !s, !sex, !sextoys, !sexual, !stamina, !stats, !status, !submission, !submit, !surrender, !tapout, !toys, !unready, !wrestle

Some commands are just aliases.


###Adding, balancing and modifying values
For the holds: > plugins/etc/holds.js

For the sexual attacks: > plugins/etc/sexual.js

For the brawl attacks: > plugins/etc/brawl.js

For the features: > plugins/etc/features.js

For the sextoys: > plugins/etc/sextoys.js



#TODO

- Some sexual moves are counted as holds, modify the current hold scheme to adapt it. (if the isInfinite parameter is set, don't count turns)
- Read the code to fill this TODO
- Add crossed out moves (some conditions are tricky)
- Standardize the 'JSON' (not really json) files, with all the different parameters.

