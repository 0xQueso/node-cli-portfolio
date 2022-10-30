 
<h1 align="center">Node CLI Portfolio</h1>
  
<br>

## About ##

A Node CLI program that displays your blockchain transactions from CSV file.

 - Given no parameters, return the latest portfolio value per token in USD
 - Given a token, return the latest portfolio value for that token in USD
 - Given a date, return the portfolio value per token in USD on that date
 - Given a date and a token, return the portfolio value of that token in USD on that date

## Technologies ##

The following tools were used in this project:

- [Node.js](https://nodejs.org/en/)
- [Node-cache](https://www.npmjs.com/package/node-cache)
- [FS](https://nodejs.org/api/fs.html)
- [Cryptocompare API](https://min-api.cryptocompare.com/)
- [Axios](https://www.npmjs.com/package/axios)
- [Inquirer](https://www.npmjs.com/package/inquirer)
- [Chalk](https://www.npmjs.com/package/chalk)
- [Nanospinner](https://www.npmjs.com/package/nanospinner)

## To Start ##

Extract [CSV file](https://s3-ap-southeast-1.amazonaws.com/static.propine.com/transactions.csv.zip) file to root folder.

Also pushed `.envrc` file which contains `CRYPTO_COMPARE_API_KEY` for convenience.
```bash
# after cloning; install dependencies
$ npm install

# run CLI app
$ node index.js
 
# use arrow keys/input to navigate the app.
```


# Design Decision #

## Interface ##
Upon running the app, this is the main navigation that you will see.
```bash
? How would you like to proceed?
> noParams
  Token
  Date
  TokenDate
```
choose an option by using your arrow keys.
  - noParams - will show you your token portfolio.
  - Token - will ask you to input Token Symbol, default is BTC.
  - Date - will ask you to input a Date, default is Today.
  - TokenDate - will ask you for both Date and Token Symbol.

## Reading the CSV file ##
For reading the CSV with almost 21 million rows, instead of using libraries that parses the file for you, I used FS to create a readstream and compute necessarry data using own logic. This drastically lowers the run time of the csv read function from a minute down to less than 10 seconds.
## Caching ##
Most important decision is the caching, I have utilized in-memory caching using node-cache, this allows user to get instant result from query. To save cost and not be rate-limited by third party apis especially those that are not free.
## Code implementation ##
I have kept the code solution simple, maintainable and not over complicated functions as possible. To start the app `getPortfolioDetails` function is first executed which prompts user for input, after input it will call the `handleAnswer` function.

Depending on the answer the user inputs, the `handleAnswer` will check if there is already data on cache and if there is not it will call the `readCSV` function to read and save computed data to cache.

The `getTokenInUsdAmount` and `resultFormatter` functions are responsible for the formatting and displaying of the results.

<a href="#top">Back to top</a>
