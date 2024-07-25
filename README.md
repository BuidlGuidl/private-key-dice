# PKDice

## Description

This game is designed to demonstrate the difficulty of guessing or brute-forcing a wallet's private key. A host creates a game with a reward and a concealed private key, and participants join the race to guess this hidden key.

## Project Overview

This project is a live demonstration intended for use during presentations with a live audience using their phones to participate. A host controls the game metrics and a private key that contains some value the users are trying to win. The host determines the number of dice that can be rolled and the rolling mode the users will use. Participants try to roll their dice to match the host's. If they succeed, they receive a portion of the prize money and a winning message. As the number of dice increases, it becomes increasingly difficult for users to match the host's dice, demonstrating the security of a 64-character private key.

## Features

### Dice
- Each die has a value in HEX (0-F).
- Dice images and rolling animations can be sourced from the Dice Challenge [repo](https://github.com/scaffold-eth/se-2-challenges/tree/challenge-3-dice-game).

### Host
- Can change the number of dice (1-64 range).
- Can update the rolling mode.
- Can enable/disable user rolling (useful for updating dice count and modes).
- Host computer will be displayed during presentations.
- Initial roll can be displayed on the big screen to generate the host's number.
- Winner is displayed on the host screen for visibility.

### Users
- Each user gets a burner wallet upon connecting for display purposes and to receive winnings.
- Users see a dice rolling display on their phones, which scales with the number of dice (up to 64).
- Cool winning message and some value from the host's private key are sent to users upon winning.
- All user dice roll simultaneously.

### Roll Modes
- **Manual Roll:** Users click a roll button to manually roll the dice once. Best for a small number of dice.
- **Auto Rolling:** Users click a button to start continuous rolling until manually stopped or a hidden character(s) are found.
- **Brute Continuous Rolling:** Users click a button to start rolling continuously as quickly as possible, coordinating with each other to guess different numbers of the host’s dice.

## Instructions for Hosts

1. **Setup:** Configure the number of dice and rolling mode.
3. **Enable Rolling:** Allow users to start rolling.
4. **Monitor:** Display winners on the host screen for everyone to see.
5. **Adjust Settings:** Enable/disable user rolling as necessary to update dice count and modes.

## Instructions for Users

1. **Connect:** Join the game using your phone.
2. **Burner Wallet:** Receive a burner wallet for display and receiving winnings.
3. **Rolling Dice:** Click the roll button to roll the dice once.
4. **Winning:** If your roll matches the host’s, receive a cool winning message and some of the host’s prize money.

## Rolling Modes

1. **Manual Roll:**
   - Click to roll the dice once.
2. **Auto Rolling:**
   - Click to start rolling until stopped or a match is found.
3. **Brute Rolling:**
   - Click to start rolling as quickly as possible.

## Credits

- Dice images and rolling animations sourced from the Dice Challenge [repo](https://github.com/scaffold-eth/se-2-challenges/tree/challenge-3-dice-game).


## License

This project is licensed under the MIT License. See the LICENSE file for more information.

---

## Setting Up Locally


1. Clone this repo & install dependencies

```
git clone https://github.com/Buidlguidl/private-key-dice.git
cd private-key-dice
yarn install
```

2. Run the backend in the first terminal:

```
yarn backend
```

This command starts a local backend on port `6001` and can be used for testing and development. You can customize the configuration in `backend.config.ts` and add your very own `.env` file following the `packages/backend/.env.example`.

3. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. Change `isLocal` variable to `true` in the config in `packages/nextjs/server.config.ts`. You can also add your very own `.env.local` file following the `packages/nextjs/.env.example`.