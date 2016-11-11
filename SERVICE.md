# Milestone - SERVICE

## USE CASES 

**Note:** We have a total of 8 use cases for FlaglagBot. 
All the use cases are documented in the github issue tracker. 
We set the mock data code to false  - so we can test the actual functionality that is implemented

####[20%] Use Case 1 Implementation - Response to LaunchDarkly Delete Event on Feature Flag

 Status is completed and can be checked on [Issue #1](../../issues/1)
 
####[20%] Use Case 2 Implementation - View/List Feature Flags

 Status is completed and can be checked on [Issue #2](../../issues/2)
 
####[20%] Use Case 3 Implementation - Create Feature Flag

 Status is completed and can be checked on [Issue #3](../../issues/3)
 
### OTHER USER CASES 
 * **Use Case 4 - Response to Notification System Alert on Feature Flag** 
    * Only two subflows left to finish this case as mentioned on the issue tracker
    * [Issue #4](../../issues/4)
 * **Use Case 5 - Turning Feature Flag ON/OFF**
    * Completed and closed [Issue #5](../../issues/5)
 * **Use Case 6 - Delete Feature Flag**
    * Completed and closed [Issue #6](../../issues/6)
 * **Use Case 7 - User Integrates Feature Flag**
    * Is dependent on other issues - 11 & 12 
    * [Issue #7](../../issues/7)
 * **Use Case 8 - User Discards Feature Flag**
    * Is dependent on other issues - 11 & 12 
    * [Issue #8](../../issues/8)
    
##### Details on other user cases:

* For the remaining 3 use cases  - 4,7,8 - there is a common dependency.
  * [Issue #11](../../issues/11) `parser/parser.js` has the code for the parser. Details about our issues and progress can be found on the issue tracker. 
  * [Issue #12](../../issues/12) `git/gitBot.js` has the code to pull and push into one of the team member's repository 
* After parser.js is completed, we will have to execute `gitBot.js` so bot can notify the respective confirmation messages to users on the channel.
* Finishing these two issues will complete UC4, UC7, UC8.

##  Task Tracking [20%]

Please see [WORKSHEET.md](https://github.ncsu.edu/kebrey/FlagLagBot/blob/master/WORKSHEET.md) for task tracking information.

##  Screencast [20%]
**UC1, UC2 and UC3 Screencast**
![ Screencast for the 3 use cases] (https://github.ncsu.edu/kebrey/FlagLagBot/blob/master/screencast3.gif)
