import chalk from "chalk";

export const initialPrompt = {
    name: 'proceed',
    type: 'list',
    message: 'How would you like to proceed?',
    choices: ['noParams', 'Token', 'Date', 'TokenDate'],
};

export const datePrompt = {
    type: "date",
    name: "timestamp",
    message: "Enter desired date:",
    prefix: "🗓", 
    filter: (d) => Math.floor(d.getTime() / 1000),
    validate: (t) => t * 1000 < Date.now() || "Future date input is not allowed.",
    transformer: (s) => chalk.bold.blue(s),
    locale: "en-US",
    format: { month: "short", hour: undefined, minute: undefined },
    clearable: true,
}

export const tokenPrompt = {
    name: 'coinInput',
    type: 'input',
    message: 'Enter token symbol:',
    default() {
        return 'BTC';
    }
}

export const shortenDate = (d) => {
    return new Date(d * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).toString();
}