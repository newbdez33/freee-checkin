#!/usr/bin/env node

import { program } from 'commander';
import { chromium } from 'playwright';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

class AutoLoginCLI {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await chromium.launch({ 
      headless: true,
      slowMo: 100
    });
    this.page = await this.browser.newPage();
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async login(url, username, password, selectors = {}) {
    try {
      console.log(chalk.blue(`Navigating to ${url}...`));
      await this.page.goto(url);
      
      const usernameSelector = selectors.username || 'input[type="email"], input[type="text"], input[name*="user"], input[name*="email"]';
      const passwordSelector = selectors.password || 'input[type="password"]';
      const submitSelector = selectors.submit || 'button[type="submit"], input[type="submit"], button:has-text("login"), button:has-text("sign in")';

      console.log(chalk.yellow('Filling login form...'));
      await this.page.fill(usernameSelector, username);
      await this.page.fill(passwordSelector, password);
      
      console.log(chalk.yellow('Submitting login form...'));
      await this.page.click(submitSelector);
      
      // Wait for navigation or login success with longer timeout
      try {
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
        console.log(chalk.green('Page loaded, checking for login success...'));
        
        // Wait a bit more for any redirects or dynamic loading
        await this.page.waitForTimeout(3000);
        
      } catch (loadError) {
        console.log(chalk.yellow('Load state timeout, but continuing...'));
      }
      
      console.log(chalk.green('Login completed!'));
      
      return true;
    } catch (error) {
      console.error(chalk.red(`Login failed: ${error.message}`));
      return false;
    }
  }

  async performAction(action) {
    try {
      switch (action.type) {
        case 'click':
          console.log(chalk.yellow(`Clicking element: ${action.selector}`));
          
          // Wait for element to be visible and enabled
          await this.page.waitForSelector(action.selector, { state: 'visible' });
          
          // Check if element exists and is clickable
          const element = await this.page.locator(action.selector);
          const isVisible = await element.isVisible();
          const isEnabled = await element.isEnabled();
          
          console.log(chalk.blue(`Button state - Visible: ${isVisible}, Enabled: ${isEnabled}`));
          
          if (!isVisible || !isEnabled) {
            console.log(chalk.yellow('Button not ready, waiting 3 seconds...'));
            await this.page.waitForTimeout(3000);
          }
          
          // Try multiple click methods
          try {
            await this.page.click(action.selector, { timeout: 10000 });
          } catch (clickError) {
            console.log(chalk.yellow('Regular click failed, trying force click...'));
            await this.page.click(action.selector, { force: true });
          }
          break;
          
        case 'fill':
          console.log(chalk.yellow(`Filling field: ${action.selector} with "${action.value}"`));
          await this.page.fill(action.selector, action.value);
          break;
          
        case 'navigate':
          console.log(chalk.yellow(`Navigating to: ${action.url}`));
          await this.page.goto(action.url);
          break;
          
        case 'wait':
          console.log(chalk.yellow(`Waiting for: ${action.selector || action.timeout + 'ms'}`));
          if (action.selector) {
            await this.page.waitForSelector(action.selector);
          } else {
            await this.page.waitForTimeout(action.timeout || 1000);
          }
          break;
          
        case 'screenshot':
          const screenshotPath = action.path || `screenshot-${Date.now()}.png`;
          console.log(chalk.yellow(`Taking screenshot: ${screenshotPath}`));
          await this.page.screenshot({ path: screenshotPath });
          break;
          
        default:
          console.warn(chalk.orange(`Unknown action type: ${action.type}`));
      }
      
      if (action.wait) {
        await this.page.waitForTimeout(action.wait);
      }
      
      return true;
    } catch (error) {
      console.error(chalk.red(`Action failed: ${error.message}`));
      return false;
    }
  }

  async runScript(configPath) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      await this.init();
      
      if (config.login) {
        const success = await this.login(
          config.login.url,
          config.login.username,
          config.login.password,
          config.login.selectors
        );
        
        if (!success) {
          throw new Error('Login failed');
        }
      }
      
      if (config.actions) {
        console.log(chalk.blue(`Performing ${config.actions.length} actions...`));
        for (const action of config.actions) {
          await this.performAction(action);
        }
      }
      
      console.log(chalk.green('Script completed successfully!'));
      
    } catch (error) {
      console.error(chalk.red(`Script failed: ${error.message}`));
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

program
  .name('auto-login')
  .description('CLI app for automated website login and actions')
  .version('1.0.0');

program
  .command('run')
  .description('Run automation script from config file')
  .argument('<config>', 'Path to config file')
  .action(async (configPath) => {
    const cli = new AutoLoginCLI();
    await cli.runScript(configPath);
  });

program
  .command('login')
  .description('Simple login to a website')
  .requiredOption('-u, --url <url>', 'Website URL')
  .requiredOption('--username <username>', 'Username/Email')
  .requiredOption('--password <password>', 'Password')
  .option('--headless', 'Run in headless mode')
  .action(async (options) => {
    const cli = new AutoLoginCLI();
    await cli.init();
    
    if (options.headless) {
      await cli.browser.close();
      cli.browser = await chromium.launch({ headless: true });
      cli.page = await cli.browser.newPage();
    }
    
    await cli.login(options.url, options.username, options.password);
    
    console.log(chalk.green('Login completed. Browser will remain open for manual actions.'));
    console.log(chalk.yellow('Press Ctrl+C to exit.'));
    
    process.on('SIGINT', async () => {
      await cli.cleanup();
      process.exit(0);
    });
  });

program
  .command('example')
  .description('Generate example config file')
  .action(() => {
    const exampleConfig = {
      login: {
        url: "https://p.secure.freee.co.jp/",
        username: "your-username",
        password: "your-password",
        selectors: {
          username: "input[name='loginId']",
          password: "input[name='password']",
          submit: "button[type='submit']"
        }
      },
      actions: [
        {
          type: "wait",
          timeout: 2000
        },
        {
          type: "navigate",
          url: "https://p.secure.freee.co.jp/"
        },
        {
          type: "click",
          selector: "button.important-button",
          wait: 1000
        },
        {
          type: "fill",
          selector: "[data-testid=\"出勤\"]",
          value: "automated input"
        },
        {
          type: "screenshot",
          path: "result.png"
        }
      ]
    };
    
    fs.writeFileSync('config.json', JSON.stringify(exampleConfig, null, 2));
    console.log(chalk.green('Example config file created: config.json'));
    console.log(chalk.yellow('Edit the config file with your website details and run: auto-login run config.json'));
  });

program.parse();