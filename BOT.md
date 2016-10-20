# Milestone - BOT

### Use Cases (10%)

**Note:** We have a total of 8 use cases for FlaglagBot. All the use cases are documented in the github issue tracker. We have outlined 3 uses cases here.

~~~~
UC1: Response to Launch Darkly Delete Event on Feature Flag
============================================================
1 Preconditions: 
-----------------
  Configure a server to listen to LaunchDarkly events using the webhooks API.
2 Main Flow: 
--------------
  When a feature flag is deleted in the Launch Darkly dashboard [S1] the bot alerts the user about it [S2]
  and prompts for an action [S3]. 
  The user requested action is completed [S4]
3 Subflows:
------------
  [S1] The server receives an HTTP POST payload with information about a feature flag being deleted.
  [S2] Bot will alert the user by sending a message on the slack channel to the user with the delete flag name.
  [S3] Bot will present the user with 2 options (1) Integrate feature (2) Discard feature.
      [S3.1] Bot will make changes in the code base and push it to git if option (1) or (2) selected
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
  User has the bot slack channel open and a default environment is defined in the configuration file.
2 Main Flow:
-------------
  The user can request the bot to show all the feature flags in the code [S1].
3 Subflows:
------------
  [S1] User requests the bot to list all flags with the command: “list flags” [E1]
  [S2] Bot will respond with a list of all the feature flags in the code base in the default environment [E2].
4 Alternate Flows:
-------------------
  [E1] User misspells the command and the bot will provide a list of all commands and the syntax
  [E2] No feature flags were found
  ~~~~

~~~~
UC3: Create Feature Flag
==========================
1 Preconditions:
------------------
  User has the bot slack channel open and a default environment is defined in the configuration file.
2 Main Flow:
-------------
The user can request the bot to create a new feature flag [S1].
3 Subflows:
------------
  [S1] User will send a request in the format: “create flag <flag-key>”,
  where the <flag-key> is the name of the new flag [E1] 
  [S2] Bot will send a success message when flag is created
4 Alternate Flows:
-------------------
  [E1] The user input/ command had errors – misspelled keyword or missing parameters. 
  Bot will provide a list of all commands and the syntax.
~~~~

### Mocking (20%)
**Goal:**  mock services and data to support service integration

Our slackbot bot relies on <a href= "http://apidocs.launchdarkly.com/docs/feature-flags-overview"> LaunchDarkly REST API </a> calls for requesting and posting information. 
We have the mock data for LaunchDarkly request/responses in mockdata.json file `[path: FlagLagBot/common/mockdata.json]`


We used the <a href="https://github.com/node-nock/nock/blob/master/README.md">nock library</a> for mocking. 
The code for mock requests/ response that our bot posts on the slack channel can be found in `slackbot.js` 

### Bot Implementation (30%)
** Bot Platform:** 
Our bot is fully operational within the <a href = "https://csc510-slackbot.slack.com/messages/featureflags/"> slack channel </a> we set up 
The bot relies on the <a href= "http://apidocs.launchdarkly.com/docs/webhooks-overview"> webhooks API </a> that launchDarkly provides.
The webhooks is configured to a server. The server is actively listening for HTTP payloads and informing our bot about LaunchDarkly events that it cares about.

** Bot Integration:**
Implement basic conversation/interaction with bot. You need to support the ability to fully have a conversation with an bot as defined by your use cases.

### Selenium Testing (20%)

#### Task Tracking (15%)

#### Screencast (5%)