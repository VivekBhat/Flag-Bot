# Milestone - BOT

### Use Cases (10%)

**Note:** We have a total of 8 use cases for FlaglagBot. All the use cases are documented in the github issue tracker. We have outlined 3 uses cases here.

~~~~
UC1: Response to LaunchDarkly Delete Event on Feature Flag
============================================================
1 Preconditions: 
-----------------
  Ther server is listening for LaunchDarkly webhooks POSTs about feature flag events.
  
2 Main Flow: 
--------------
  When a feature flag is deleted in the LaunchDarkly dashboard [S1] the bot alerts the user [S2]
  and prompts for an action [S3]. 
  The user requested action is completed [S4]
  
3 Subflows:
------------
  [S1] The server receives an HTTP POST payload with information about the feature flag deletion.
  [S2] Bot will alert the user by sending a message to the slack channel about the flag deletion.
  [S3] Bot will present the user with 2 options (1) Integrate feature (2) Discard feature.
      [S3.1] Bot will make changes in the code base and push it to git if option (1) or (2) selected.
  [S4] Bot will display a message about the action that was performed [E1][E2].
  
4 Alternate Flows:
-------------------
  [E1] Requested action is completed, bot responds with a success message.
  [E2] Feature flag is not found in the code base – bot responds with an error message 
  mentioning that flag was not found in the code.
~~~~

~~~~
UC2: View/List Feature Flags
==============================
1 Preconditions:
-----------------
  User has the bot slack channel open.
  
2 Main Flow:
-------------
  The user can request the bot to show all the LaunchDarkly feature flags [S1].
  
3 Subflows:
------------
  [S1] User requests the bot to list all flags with the command: “list flags” [E1].
  [S2] Bot will respond with a list of all the feature flags in all environments [E2].
  
4 Alternate Flows:
-------------------
  [E1] User misspells the command and the bot will provide a list of all commands and the syntax.
  [E2] No feature flags were found, and the bot tells the user this.
  ~~~~

~~~~
UC3: Create Feature Flag
==========================
1 Preconditions:
------------------
  User has the bot slack channel open.
  
2 Main Flow:
-------------
The user can request the bot to create a new feature flag [S1].

3 Subflows:
------------
  [S1] User will send a request in the format: “create flag <flag-key>”,
  where the <flag-key> is the name of the new flag [E1]. 
  [S2] Bot will send a success message when flag is created.
  
4 Alternate Flows:
-------------------
  [E1] The user input/ command had errors – misspelled keyword or missing parameters. 
  Bot will provide a list of all commands and the syntax.
~~~~

### Mocking (20%)
**Goal:**  mock services and data to support service integration

Our slackbot bot relies on <a href= "http://apidocs.launchdarkly.com/docs/feature-flags-overview"> LaunchDarkly REST API </a> calls for requesting and manipulating feature flags. 
We have the mock data for LaunchDarkly request/responses in mockdata.json file `[path: FlagLagBot/common/mockdata.json]`


We used the <a href="https://github.com/node-nock/nock/blob/master/README.md">nock library</a> for mocking. 
The code for mock requests/ response that our bot posts on the slack channel can be found in `slackbot.js` 

### Bot Implementation (30%)

**Bot Platform:** 

* Our bot is fully operational within the <a href = "https://csc510-slackbot.slack.com/messages/featureflags/"> slack channel </a> we set up.  


* The bot relies on the <a href= "http://apidocs.launchdarkly.com/docs/webhooks-overview"> webhooks API </a> that launchDarkly provides. 


* The server is actively listening for HTTP POSTs from LaunchDarkly about events that it cares about.

**Bot Integration:**
* Currently all the commands that the user can issue to the bot are available. As some are not implemented, the mock data helps the bot provide an appropriate response. If there are issues in the syntax  - misspelled or missing parameters, the bot shows an error message and provides the directions again to the user on the slack channel.

### Selenium Testing (20%)

* UC 1 - Path 1
* UC 1 - Path 2
* UC 2 - Path 1 `ListFeatureFlag.java` - wrong command with error message
* UC 2 - Path 2 `ListFeatureFlag.java` - correct command and list of flags shown
* UC 3 - Path 1 `CreateFeatureFlag.java` - correct command and new flag created
* UC 3 - Path 2 `CreateFeatureFlag.java` - missing name of new flag, prompted again

#### Task Tracking (15%)

Please see [WORKSHEET.md](https://github.ncsu.edu/kebrey/FlagLagBot/blob/master/WORKSHEET.md) for task tracking information.

#### Screencast (5%)
