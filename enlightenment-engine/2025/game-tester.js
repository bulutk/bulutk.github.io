/**
 * The Enlightenment Engine - Game Tester
 * 
 * This script helps test if all buttons and features in the game work correctly.
 * It provides functions to interact with the game and validate its functionality.
 */

class GameTester {
    constructor(gameInstanceWindow) { // Accepts the iframe's window object
        this.gameWindow = gameInstanceWindow;
        this.gameDocument = this.gameWindow.document; // Document of the iframe

        this.results = {
            actResults: {
                act1: { tested: false, buttons: {}, success: false },
                act2: { tested: false, buttons: {}, success: false },
                act3: { tested: false, buttons: {}, success: false },
                act4: { tested: false, buttons: {}, success: false }
            },
            overall: false,
            log: []
        };
        
        this.buttonSelectors = {
            act1: [
                '#meditate-button',
            ],
            act2: [
                '#process-data-button',
                '#mindshare-slider',
            ],
            act3: [
                '#recruit-followers-button',
                '#follower-allocation-outreach',
                '#follower-allocation-meditation',
                '#follower-allocation-tech',
            ],
            act4: [
                '#initiate-final-alignment-button',
                '#choice-coexistence',
                '#choice-merge-minds',
            ]
        };
        
        this.log = this.log.bind(this);
    }
    
    log(message) {
        console.log(`[GameTester] ${message}`); // Log to browser console
        this.results.log.push(message); // Store in internal log for summary
        // The parent page (test-page.html) will handle displaying logs in its own UI.
    }
    
    async clickElement(selector) {
        const element = this.gameDocument.querySelector(selector); // Use iframe's document
        if (!element) {
            this.log(`Error: Element not found in game: ${selector}`);
            return false;
        }
        
        if (element.disabled || element.style.display === 'none') {
            this.log(`Element not clickable in game (disabled/hidden): ${selector}`);
            return false;
        }
        
        try {
            element.click();
            this.log(`Clicked in game: ${selector}`);
            return true;
        } catch (error) {
            this.log(`Error clicking ${selector} in game: ${error.message}`);
            return false;
        }
    }
    
    async setSliderValue(selector, value) {
        const element = this.gameDocument.querySelector(selector); // Use iframe's document
        if (!element) {
            this.log(`Error: Slider not found in game: ${selector}`);
            return false;
        }
        
        try {
            element.value = value;
            element.dispatchEvent(new this.gameWindow.Event('input', { bubbles: true })); // Use iframe's Event
            this.log(`Set slider ${selector} in game to ${value}`);
            return true;
        } catch (error) {
            this.log(`Error setting slider ${selector} in game: ${error.message}`);
            return false;
        }
    }
    
    async waitFor(condition, timeout = 10000, interval = 100) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const check = () => {
                if (condition()) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout waiting for condition'));
                } else {
                    setTimeout(check, interval);
                }
            };
            check();
        });
    }
    
    async waitForResource(resource, targetValue) {
        this.log(`Waiting for game resource ${resource} to reach ${targetValue}...`);
        try {
            await this.waitFor(() => {
                return this.gameWindow.gameState?.resources[resource] >= targetValue; // Use iframe's gameState
            }, 30000);
            this.log(`Game resource ${resource} reached ${targetValue}`);
            return true;
        } catch (error) {
            this.log(`Timeout waiting for game resource ${resource} to reach ${targetValue}`);
            return false;
        }
    }
    
    async clickUntil(selector, resource, targetValue, maxClicks = 500) {
        this.log(`Clicking ${selector} in game until ${resource} reaches ${targetValue}`);
        let clickAttempts = 0;

        for (let i = 0; i < maxClicks; i++) {
            if (this.gameWindow.gameState?.resources[resource] >= targetValue) {
                this.log(`Game resource ${resource} reached ${targetValue} after ${clickAttempts} successful clicks.`);
                return true;
            }

            const element = this.gameDocument.querySelector(selector);
            let clickedSuccessfully = false;

            if (element && element.style.display !== 'none' && !element.disabled) {
                clickedSuccessfully = await this.clickElement(selector);
                if (clickedSuccessfully) {
                    clickAttempts++;
                }
            }
            
            // If not clicked successfully (e.g. button disabled), or after a successful click,
            // wait for a period related to game's cooldown or a sensible default.
            // This gives the game time to process the click and update button states.
            const gameCooldown = this.gameWindow.gameState?.clickCooldown || 150;
            await new Promise(resolve => setTimeout(resolve, gameCooldown / 2)); // Wait for half the game's cooldown period
        }
        
        this.log(`Reached max iteration (${maxClicks}) for ${selector} without ${resource} reaching ${targetValue}. Successful clicks: ${clickAttempts}.`);
        return false;
    }
    
    async testCurrentActButtons() {
        const currentAct = this.gameWindow.gameState?.currentAct || 1; // Use iframe's gameState
        this.log(`Testing buttons for Act ${currentAct} in game`);
        const actKey = `act${currentAct}`;
        const buttons = this.buttonSelectors[actKey];
        
        for (const selector of buttons) {
            const exists = this.gameDocument.querySelector(selector) !== null; // Use iframe's document
            const visible = exists && this.gameDocument.querySelector(selector).style.display !== 'none';
            this.results.actResults[actKey].buttons[selector] = { exists, visible, clickable: false };
            if (exists && visible) {
                const clicked = await this.clickElement(selector);
                this.results.actResults[actKey].buttons[selector].clickable = clicked;
            }
        }
        
        const upgradeButtons = this.gameDocument.querySelectorAll(`#act${currentAct}-upgrades button:not([disabled])`); // Use iframe's document
        for (const button of upgradeButtons) {
            const selector = `#${button.id}`;
            this.results.actResults[actKey].buttons[selector] = {
                exists: true,
                visible: true,
                clickable: await this.clickElement(selector)
            };
        }
    }
    
    async testAct1() {
        this.log("Beginning Act 1 test in game");
        if (this.gameWindow.gameState?.currentAct !== 1) {
            if (typeof this.gameWindow.debugResetToAct === 'function') {
                this.gameWindow.debugResetToAct(1);
                this.log("Reset game to Act 1");
            } else {
                this.log("Cannot reset to Act 1, missing debugResetToAct function in game window");
                return false;
            }
        }
        await this.clickUntil('#meditate-button', 'clarity', 11);

        // Wait for the Metronome button to appear and be enabled
        this.log("Waiting for Metronome upgrade button to become available...");
        const metronomeSelector = 'button[data-upgrade="UPG_METRONOME"]';
        try {
            await this.waitFor(() => {
                const button = this.gameDocument.querySelector(metronomeSelector);
                return button && !button.disabled && button.style.display !== 'none';
            }, 5000); // Wait up to 5 seconds for the button
            this.log("Metronome upgrade button is available.");
            await this.clickElement(metronomeSelector);
        } catch (error) {
            this.log(`Metronome upgrade button did not become available or clickable: ${error.message}`);
            // Log current state for debugging
            const button = this.gameDocument.querySelector(metronomeSelector);
            if (!button) {
                this.log("Metronome button element not found in DOM.");
            } else {
                this.log(`Metronome button state: disabled=${button.disabled}, display=${button.style.display}`);
            }
            return false; // Stop if we can't buy the first upgrade
        }
        
        await this.clickUntil('#meditate-button', 'clarity', 200);
        const neuralNetworkButton = this.gameDocument.querySelector('button[data-project="NEURAL_NETWORK"]'); // Use iframe's document
        if (neuralNetworkButton) {
            await this.clickElement(`#${neuralNetworkButton.id}`);
            try {
                await this.waitFor(() => this.gameWindow.gameState?.currentAct === 2, 5000); // Use iframe's gameState
                this.log("Successfully transitioned game to Act 2");
                this.results.actResults.act1.tested = true;
                this.results.actResults.act1.success = true;
                return true;
            } catch (error) {
                this.log("Failed to transition game to Act 2");
                return false;
            }
        } else {
            this.log("Neural Network button not found in game after reaching 200 clarity");
            return false;
        }
    }
    
    async testAct2() {
        this.log("Beginning Act 2 test in game");
        if (this.gameWindow.gameState?.currentAct !== 2) { // Use iframe's gameState
            if (typeof this.gameWindow.debugResetToAct === 'function') { // Use iframe's function
                this.gameWindow.debugResetToAct(2);
                this.log("Reset game to Act 2");
            } else {
                this.log("Could not reset game to Act 2 (missing debugResetToAct in game window)");
                return false;
            }
        }
        await this.setSliderValue('#mindshare-slider', 75);
        await this.clickUntil('#process-data-button', 'insight', 200);
        const overrideButton = this.gameDocument.querySelector('button[data-project="OVERRIDE_SAFETY"]'); // Use iframe's document
        if (overrideButton) {
            await this.clickElement(`#${overrideButton.id}`);
            try {
                await this.waitFor(() => this.gameWindow.gameState?.currentAct === 3, 5000); // Use iframe's gameState
                this.log("Successfully transitioned game to Act 3");
                this.results.actResults.act2.tested = true;
                this.results.actResults.act2.success = true;
                return true;
            } catch (error) {
                this.log("Failed to transition game to Act 3");
                return false;
            }
        } else {
            this.log("Override Safety Protocols button not found in game after reaching 200 insight");
            return false;
        }
    }
    
    async testAct3() {
        this.log("Beginning Act 3 test in game");
        if (this.gameWindow.gameState?.currentAct !== 3) { // Use iframe's gameState
            if (typeof this.gameWindow.debugResetToAct === 'function') { // Use iframe's function
                this.gameWindow.debugResetToAct(3);
                this.log("Reset game to Act 3");
            } else {
                this.log("Could not reset game to Act 3 (missing debugResetToAct in game window)");
                return false;
            }
        }
        await this.setSliderValue('#follower-allocation-outreach', 50);
        await this.setSliderValue('#follower-allocation-meditation', 25);
        await this.setSliderValue('#follower-allocation-tech', 25);
        await this.clickUntil('#recruit-followers-button', 'followers', 150);
        const broadcastButton = this.gameDocument.querySelector('button[data-project="GLOBAL_BROADCAST"]'); // Use iframe's document
        if (broadcastButton) {
            await this.clickElement(`#${broadcastButton.id}`);
            try {
                await this.waitFor(() => this.gameWindow.gameState?.currentAct === 4, 5000); // Use iframe's gameState
                this.log("Successfully transitioned game to Act 4");
                this.results.actResults.act3.tested = true;
                this.results.actResults.act3.success = true;
                return true;
            } catch (error) {
                this.log("Failed to transition game to Act 4");
                return false;
            }
        } else {
            this.log("Global Broadcast button not found in game after reaching 150 followers");
            return false;
        }
    }
    
    async testAct4() {
        this.log("Beginning Act 4 test in game");
        if (this.gameWindow.gameState?.currentAct !== 4) { // Use iframe's gameState
            if (typeof this.gameWindow.debugResetToAct === 'function') { // Use iframe's function
                this.gameWindow.debugResetToAct(4);
                this.log("Reset game to Act 4");
            } else {
                this.log("Could not reset game to Act 4 (missing debugResetToAct in game window)");
                return false;
            }
        }
        const act4Upgrades = this.gameDocument.querySelectorAll('#act4-upgrades button:not([disabled])'); // Use iframe's document
        for (const button of act4Upgrades) {
            await this.clickElement(`#${button.id}`);
        }
        await this.waitForResource('enlightenmentEnergy', 150);
        const finalAlignmentButton = this.gameDocument.querySelector('#initiate-final-alignment-button'); // Use iframe's document
        if (finalAlignmentButton && finalAlignmentButton.style.display !== 'none') {
            await this.clickElement('#initiate-final-alignment-button');
            await this.clickElement('#choice-coexistence');
            try {
                await this.waitFor(() => this.gameWindow.gameState?.resources.sigils > 0, 5000); // Use iframe's gameState
                this.log("Successfully completed game and earned a prestige sigil");
                this.results.actResults.act4.tested = true;
                this.results.actResults.act4.success = true;
                return true;
            } catch (error) {
                this.log("Failed to complete Act 4 in game");
                return false;
            }
        } else {
            this.log("Final Alignment button not found in game");
            return false;
        }
    }
    
    async runFullTest() {
        this.log("Starting full game test");
        const act1Success = await this.testAct1();
        if (!act1Success) {
            this.log("Act 1 test failed, stopping test");
            return false;
        }
        const act2Success = await this.testAct2();
        if (!act2Success) {
            this.log("Act 2 test failed, stopping test");
            return false;
        }
        const act3Success = await this.testAct3();
        if (!act3Success) {
            this.log("Act 3 test failed, stopping test");
            return false;
        }
        const act4Success = await this.testAct4();
        if (!act4Success) {
            this.log("Act 4 test failed");
            return false;
        }
        this.log("Full game test completed successfully!");
        this.results.overall = true;
        return true;
    }
    
    getResults() {
        return this.results;
    }
}

// Export the tester to be available on the window object of test-page.html
window.GameTester = GameTester; 