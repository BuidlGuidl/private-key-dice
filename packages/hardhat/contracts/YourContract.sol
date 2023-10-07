// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract YourContract {
    enum Mode {
        Manual,
        Continuous,
        GroupBruteForce
    }

    Mode public currentMode;
    uint8 public diceCount = 1; 
    address public host;

    error OnlyHostAllowed();
    error InvalidDiceCount();

    event ModeChanged(address indexed caller, Mode newMode);
    event DiceCountChanged(address indexed caller, uint8 newDiceCount);

    modifier onlyHost() {
        if (msg.sender != host) revert OnlyHostAllowed();
        _;
    }

    constructor(address _host) {
        host = _host;
        currentMode = Mode.Manual;
    }

    function setMode(Mode _mode) external onlyHost {
        currentMode = _mode;
        emit ModeChanged(msg.sender, _mode);
    }

    function setDiceCount(uint8 _count) external onlyHost {
        if (_count < 1 || _count > 64) revert InvalidDiceCount();
        diceCount = _count;
        emit DiceCountChanged(msg.sender, _count);
    }
}
