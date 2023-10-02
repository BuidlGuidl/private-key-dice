# Dice Demonstration

Random numbers, dice images and animations can be taken from the dice challenge repo here:<br>
https://github.com/scaffold-eth/se-2-challenges/tree/challenge-3-dice-game

Live view of this repo for context:<br>
https://buidlguidl-g33iv38ol-brycehytans-projects.vercel.app/dice

### Project Overview
This will become a demonstration to use during presentations with a live audience using their phones to participate.  A host will control the metrics of the game, and control a private key that will contain some value the users are trying to win. The host determines how many dice can be rolled and what rolling mode the users will be using.  The users will try to roll their dice to match the hosts.  If they do, some of the prize money is sent to them along with a winning message.  Eventually the hosts number will have too many characters (dice) for the users to be able to match.  This will show the security of a 64 character private key.

### Dice
- Each dice will have a value in HEX (0-F)
- Dice images and rolling animations can be grabbed from the Dice Challenge repo at the top of this page.

### Host
- The host can at any time change the number of dice, in a range from 1-64.
- The host can update the rolling mode.
- The host can enable/disable user rolling.  This may be necessary for updating the dice count and modes.
- The host computer will be on display at the presentations.  What information is necessary to show/hide?
- Maybe the host can do an initial roll on the big screen to get their number?
- We should display winners on the host screen so everyone can see when there was a winner.

### Users
- The users should see a cool dice rolling display on their (phone) screens.  This will get tricky as more dice are added, up to a max of 64.
- If they match the hosts, a cool winning message will be display and some of the value in the hosts private key will be sent to them.  Need a cool message they can show off to others.
- All the user's dice will roll at the same time. e.g if the count of dice is currently 24, and example roll from a user would be F18053525893D3537EAB615C
- They should see a cool animation when rolling

### Roll Modes
- Users click a roll button to manually roll the dice once. This will mostly be used when there is a small number of dice.
- Users click a button to start the continous rolling of dice.  It will automatically keep rolling until manually stopped or it finds the match.
- Users click a button to start continous rolling, but this time all users are coordinating trying to guess different numbers of the hosts instead of racing.  Namespaces can be used here.  Austin can put together a quick algorithm to accompolish this, or feel free to tackle it yourself.

## Contributing

Step by step "fork-and-pull" Github contributing using CLI refresher here:  
https://gist.github.com/ZakGriffith/69d1eb8baebddd7d370b87a65a7e3ec0 
