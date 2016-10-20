#Design Milestone - FlagLag Bot

###SoftWereWolves - Nikhila Balaji, Vivek Bhat, Katie Brey, Seth Butler, James Guo


This bot proposal is structured to include the following items:

* Problem Statement
* Bot Description
* Design Sketches
* Architecture Design
* Additional Patterns

## Problem Statement

Feature flags can be a powerful continuous deployment tool for controlling features at run-time.  There are many feature flag management systems, such as LaunchDarkly, that provide a nice web interface for toggling features. However, there is nothing to connect the management system to the code that uses the feature flags. Once feature flags are introduced in the code they can be hard to keep track of, and can cause problems if they are not removed properly when the feature is fully released. The FlagLag Bot aims to bridge the gap between Launch Darkly and the code base that uses it. 


## Bot Description

FlagLag Bot will allow you to better maintain the feature flag code in your codebase. Based on certain events it will prompt you to take actions on your code. The following diagram demonstrates the actions of the bot, and the events that prompt the user for a certain action. 

The bot will be able to remove the flag from the code, leaving the feature permanently. This is useful if a feature has been tested thoroughly and it is time to move the feature into mainline code. Alternatively, the bot can remove a feature from the code and leave the old code that was used before the feature. This would be useful if a feature is no longer wanted and should be scrapped. Users can carry out these actions at any time by giving the command to the Slackbot. 

Certain events also prompt the user to carry out these actions. If a feature flag is deleted in Launch Darkly, the user is given the choice to make the feature permanent, or scrap the feature. If a feature flag has been on for a long time (user-specified setting), the user will be reminded and given the option to make the feature permanent.

 ![Logic Flow](https://github.ncsu.edu/vbhat/MILESTONE-DESIGN/blob/master/Resources/BotDescription.png "Logic Flow")

All of the code manipulation would be driven by the language-specific syntax for the Launch Darkly connection code.  The bot will support a subset of SDKs from the list of SDKs LaunchDarkly supports (see below). We know we will be supporting the Node.js SDK, and will decide which additional ones when developing our bot.

LaunchDarkly SDKs

- Go
- iOS
- Java
- JavaScript
- PHP
- Python
- Python Twisted
- .NET
- Node.js
- Ruby
- REST API


### Design Sketches

* **Wireframe** 

 ![Wireframe_mockup](https://github.ncsu.edu/vbhat/MILESTONE-DESIGN/blob/master/Resources/Slide_2_Wireframe.png "Wireframe ")

* **Storyboard** 


 ![Storyboard1](https://github.ncsu.edu/vbhat/MILESTONE-DESIGN/blob/master/Resources/Slide_3_Storyboard__1.png "Storyboard1 ")


 ![Storyboard2](https://github.ncsu.edu/vbhat/MILESTONE-DESIGN/blob/master/Resources/Slide_3_Storyboard__2.png "Storyboard2 ")


 ![Storyboard3](https://github.ncsu.edu/vbhat/MILESTONE-DESIGN/blob/master/Resources/Slide_3_Storyboard__3.png "Storyboard3 ")



## Architecture Design

 ![ArchDesign](https://github.ncsu.edu/vbhat/MILESTONE-DESIGN/blob/master/Resources/Slide_5_Architecture__new.png "ArchDesign ")

The FlagLag Bot will be embedded in Slack. The slack channel will serve as notification system and the medium for user interaction. FlagLag Bot will serve notifications and options to the user on the slack channel based on the events.  If the user requests and action, the bot carries out the user requested action on the source code, and pushes the changes. 

LaunchDarkly is a commercial flag management system that provides a dashboard for users to manage feature flags. Some of the functions that users can perform in LaunchDarkly include turning a flag on to enable a feature, turning a flag off to disable a feature, and creating a new feature flag. An application controls feature toggling by requesting the status of the feature from Launch Darkly. However, LaunchDarkly does not have any knowledge of the application code. FlagLag Bot serves a an intermediary between LaunchDarkly and the code that requests information feature flag status from LaunchDarkly. 

FlagLag Bot will be able to query LaunchDarkly with REST API calls. In addition, it will also receive information about events in LaunchDarkly through webhooks. We will have a NodeJS server that will be listening for the events from the webhooks.  We will be storing relevant information, particularly timestamps for when a feature flag has last been turned on, in a NoSQL database - MongoDB. Then we will use the Node.js Timer module to schedule notifications.

####Constraints
#####System 

- The bot must have security credentials for the Git repository and the LaunchDarkly access token.

- The bot can only make changes on the code base when the user makes an explicit request.

- The feature flag status can be accessed by all authorized users concurrently. But the flag enable, disable and delete actions can only be accessed by one user at a time and locked to the other users in this period.

#####Functional
- When the  notifications for a long turned on flag is dismissed, the bot must not re-notify in the very immediate future. A specific guideline on when to be re-notified can either be given to the user or must be defined by default when developing.


## Additional Patterns

####Singleton Pattern
[singleton pattern reference ](http://programmers.stackexchange.com/questions/235527/when-to-use-a-singleton-and-when-to-use-a-static-class "Singleton Pattern Reference")

Singleton pattern is used when we want to limit the system to have exactly one instance of an object. The reason for limiting the object to a single instance is because the resources accessed by the object are shared - such as a database or cache. In our case, we can only have one bot instance per bot program that is running. This is best represented by the Singleton Pattern. If no bot object has been created, you can create a new bot. If the bot has been created, then you just return that instance that has been instantiated. This way, every piece of code that needs the bot to do something can just use bot.getInstance() and there will only be one bot floating around at any given point in time. 
#### Observer Pattern
[observer pattern reference ](https://sourcemaking.com/design_patterns/observer "Observer Pattern Reference")

Observer pattern is used when we want certain objects in a system to be notified about changes in state. In the observer pattern, an object called the subject maintains a list of the its dependents, called observers, and notifies them automatically of any state changes. We will be using the observer pattern to model the events being passed around our system. In our case the observer will be our bot, which is interested in the feature flag state changes. The observable is LaunchDarkly feature flags which will notify the bot via webhooks.

