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

3) Edit config file with your info, especially take care of the config.room and config.master

4) Edit the config.mysql.js to match your database's info

5) Run the create.sql script in config/

4) Execute: node index.js


#TODO

-   Add a way to do table matches (Requires table-setup action and table-smash)
-   Implement different kind of matches, HP only, LP only, FP only, Bondage only.
-   Variable end match messages, suggesting how to finish
-   Finish features implementation (Rename focus to submissiveness?)
-   Use message constants
-   Implement bondage, but not only in a sexhold
-   Implement a way to inflict lust onto your own character


