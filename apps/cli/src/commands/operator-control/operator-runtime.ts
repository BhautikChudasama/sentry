import Vorpal from "vorpal";
import { getSignerFromPrivateKey, operatorRuntime } from "@sentry/core";

/**
 * Starts a runtime of the operator.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function bootOperator(cli: Vorpal) {
    let stopFunction: () => Promise<void>;

    cli
        .command('boot-operator', 'Starts a runtime of the operator.')
        .action(async function (this: Vorpal.CommandInstance) {
						let password  = process.env.WALLET_KEY || "";
						
						if(!password) {
							const walletKeyPrompt: Vorpal.PromptObject = {
									type: 'password',
									name: 'walletKey',
									message: 'Enter the private key of the operator:',
									mask: '*'
							};
							const { walletKey } = await this.prompt(walletKeyPrompt);
							
							if (!walletKey || walletKey.length < 1) {
									throw new Error("No private key passed in. Please provide a valid private key.")
							}
							password = walletKey
						}

            const { signer } = getSignerFromPrivateKey(password);

            stopFunction = await operatorRuntime(
                signer,
                undefined,
                (log) => this.log(log)
            );

            return new Promise((resolve, reject) => { }); // Keep the command alive
        })
        .cancel(() => {
            if (stopFunction) {
                stopFunction();
            }
        });
}