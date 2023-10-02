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
- Unsure of the number of users we will have at one time, a good guess is in the 10-30 range.
- Users will get a burner wallet when they connect that we will use for display purposes, and to send any winnings.
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


### initial notes from austin:

the essence of what I want to demonstrate is that technically you can guess someone's private key but if you use enough bytes randomness it becomes impossible 

the idea comes from my buddy griffin who does a "guess the number" kind of game that is similar -- I want to use our amazing hex dice from mr dee and SE2 to make a pretty mobile experience that is controlled from and admin screen 

this would be a demo for technical groups and normies - I lock money up in a private key where we know all of the bytes except one and everyone has to click to roll the dice and if they land on the right hex character it makes a private key, checks if there is money on it, and sweeps it with a celebration screen 

then from the admin side I lock up a little money and we roll two dice and then three and then four - we'll have to experiment with where it gets so difficult a room wont be able to get it and then we can allow them to upgrade their roller to *automatic roll* and *group brute force roll* where everyone works on different sections trying to find the solution  

the payoff is when I have 64 dice on a single screen and I show some smart contract with billions of dollars in it -- all your phone has to do is guess the right 64 hex characters and that billion dollars is yours 
