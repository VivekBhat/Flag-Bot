## Deployment Scripts [25%]

1. Establish connection to EC2 - Identity and access management (IAM)
   1. Access key ID & secret access key from IAM ( provides admin privileges for AWS instances)
   2. ssh keys to authenticate connection between host and AWS Admin user
        * Add these ssh keys to EC2 key pairs in configuration panel
2. SSH into AWS instance
3. Run ansible play book
4. Enter github credentials to access repository for cloning

Files created
* `server_deployment.yml`
* `provision.yml`




##Acceptance Testing [40%]
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

### Test Case 1 - Launch Darkly Delete Flag Alert
Related to: [Issue #1](../../issues/1) | [Issue #7](../../issues/7) | [Issue #8](../../issues/8)

STEPS

1. Precondition: A flag is deleted on the LaunchDarkly Dashboard and the server is receiving webhooks from it.
2. Follow presteps[1-4]
3. User receives an alert message on the channel saying: **A `<flag-key>` has been deleted. What would like to do - integrate or discard feature?**
4. User types: **integrate feature '<flag-key>'** where the flag-key is mentioned in previous step
5. The bot replies with a success message if the feature existed in the code and was successfully integrated. **Success! Your feature was integreted into your code**. If not found, it responds with a error message 


*Note: Can modify this test case to cover use case 8, by just changing the keyword to discard in step 4*

### Test Case 2 - List Feature Flag
Related to: [Issue #2](../../issues/2)

STEPS

1. Follow presteps[1-4]
2. User types: **@flaglagbot list flags**
3. The bot responds with a list of flags that are currently on LaunchDarkly Dashboard: **Your feature flags:** followed by one flagkey per line. If there aren’t any flags, the bot responds with **No flags were found.**


### Test Case 3 - Create Feature Flag
Related to: [Issue #3](../../issues/3)

STEPS

1. Follow presteps[1-4]
2. Follow test case 2, to see a list of valid flag-key to use in the next step
3. User types:  **@flaglagbot create flag `<flag-key>`**, where flag-key is the name of the flags on Launch Darkly Dashboard
3. The bot with success message: **Your flag `<flag-key>` was created!**

### Test Case 4 - Notification about feature flag turned on for long
Related to: [Issue #4](../../issues/4)

STEPS

1. Precondition: A flag has been turned on in the code for a long time without being turned off, deleted or modified. The server is keeping track of any webhooks related to it.
2. Follow presteps[1-4]
3. User receives an alert message on the channel saying: **The flag `<flag-key>` been activated for 100000ms what would you like to do?**

*Note: In order to test this case, a flag has to be turned on LaunchDarkly and the server has been keeping track of it*

### Test Case 5 - Turn Feature Flag ON/OFF
Related to: [Issue #5](../../issues/5)

STEPS

1. Follow presteps[1-4]
2. Follow test case 2, to see a list of valid flag-key to use in the next step
3. User types: **@flaglagbot turn off flag `<flag-key>`**, where flag-key is the name of the flags on Launch Darkly Dashboard
4. The bot with success message: ** Success! Your feature flag was turned off.**

*Note: Can change the keyword to ON to try to turn a feature on*

### Test Case 6 - Delete Feature Flag
Related to: [Issue #6](../../issues/6) | indirectly triggers Test Case 1

STEPS

1. Follow presteps[1-4]
2. Follow test case 2, to see a list of valid flag-key to use in the next step
3. User types: **@flaglagbot delete flag `<flag-key>`**, where flag-key is the name of the flags on Launch Darkly Dashboard
4. The bot with success message: ** Your flag `<flag-key>` was deleted!**

## Exploratory Testing and Code Inspection [25%]
We have set testing to false, so no mock data is used. Our implemented functionality in the above test cases is tested on real data. 

We have handled major error flows in the above use cases. For example some of them include:
* If user uses a wrong syntax (missing keyword) of the command, the user is presented with the options available again.
* If user flag-key is not present, then an appropriate message is shown in Test Case 6 - Delete flag, Turn on/off.


## Task Tracking & Screencast [10%]

Please see [WORKSHEET.md](https://github.ncsu.edu/kebrey/FlagLagBot/blob/master/WORKSHEET.md) for task tracking information.

*Note:Removed the link that was not working. Our screencast for this milestone is linked below:*

[Service Deployment](https://www.youtube.com/watch?v=7K9fXtlD2F4&feature=youtu.be)
