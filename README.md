# Testing your metals talk [![Build Status](https://travis-ci.org/williamrijksen/testing-your-metals-talk.svg?branch=master)](https://travis-ci.org/williamrijksen/testing-your-metals-talk)

### Features
- [x] Check your bank balance
- [x] Add transaction by NFC
- [x] Increase the balance by adding salary to your account

### Running the testing-your-metals app

#### Via CLI

1. Clone the repository:

		git clone https://github.com/williamrijksen/testing-your-metals

1. Install dependencies:

		npm install

1. Build to Simulator or Device:

		[appc run | ti build] -p android [-T device]

## How to run tests

1. Make sure you've been running npm install
2. `npm test` to run Mocha tests (mocha tests are written in ES6)`
3. `npm run istanbul` to checkout the Code coverage
4. `npm run lint` to checkout the ESLint
