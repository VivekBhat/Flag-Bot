###Acceptance Testing
####PRESTEPS

1. User is logged in to the correct team domain: **csc510-slackbot**
2. User is on the right slack channel: **#featureflags**
3. User types: **@flaglagbot hi**
4. Bot presents the user with the command options that are available
~~~~
To see all of your LaunchDarkly flags, type 'list flags'.
To create a LaunchDarkly flag, type 'create flag <flag-key>'.
To delete a LaunchDarkly flag, type 'delete flag <flag-key>'.
To turn on LaunchDarkly flag, type 'turn on flag <flag-key>'.
To turn off LaunchDarkly flag, type 'turn off flag <flag-key>'.
To integrate a feature in your code, type 'integrate feature <flag-key>'.
To discard a feature in your code, type 'discard feature <flag-key>'.
Here are your options. To see them again, type 'help'.
~~~~


#### Test Case 1 - Launch Darkly Delete Flag Alert
Related to: [Issue #1](../../issues/1) | [Issue #7](../../issues/7) | [Issue #8](../../issues/8)
*Note: *

#### Test Case 2 - List Feature Flag
Related to: [Issue #2](../../issues/2)
STEPS

1. Follow presteps[1-4]
2. User types: **@flaglagbot list flags**
3. The bot responds with a list of flags that are currently on LaunchDarkly Dashboard: **Your feature flags:** followed by one flagkey per line. If there aren’t any flags, the bot responds with **No flags were found.**


#### Test Case 3 - Create Feature Flag
Related to: [Issue #3](../../issues/3)
STEPS

1. Follow presteps[1-4]
2. Follow test case 2, to see a list of valid flag-key to use in the next step
3. User types:  **@flaglagbot create flag `<flag-key>`**, where flag-key is the name of the flags on Launch Darkly Dashboard
3. The bot with success message: **Your flag `<flag-key>` was created!**

#### Test Case 4 - Notification??
Related to: [Issue #4](../../issues/4)

#### Test Case 5 - Turn Feature Flag ON/OFF
Related to: [Issue #5](../../issues/5)
STEPS

1. Follow presteps[1-4]
2. Follow test case 2, to see a list of valid flag-key to use in the next step
3. User types:  **@flaglagbot turn off flag `<flag-key>`**, where flag-key is the name of the flags on Launch Darkly Dashboard
4. The bot with success message: ** Success! Your feature flag was turned off.**

*Note: Can change the keyword to ON to try to turn a feature on*

#### Test Case 6 - Delete Feature Flag
Related to: [Issue #6](../../issues/6)
