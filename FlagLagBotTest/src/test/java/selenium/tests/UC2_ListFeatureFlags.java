package selenium.tests;

import static org.junit.Assert.*;

import java.util.concurrent.TimeUnit;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

import io.github.bonigarcia.wdm.ChromeDriverManager;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebElement;

import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;


public class UC2_ListFeatureFlags {

	private static WebDriver driver;

	@BeforeClass
	public static void setUp() throws Exception 
	{
		//driver = new HtmlUnitDriver();
		ChromeDriverManager.getInstance().setup();
		driver = new ChromeDriver();
	}

	@AfterClass
	public static void  tearDown() throws Exception
	{
		driver.close();
		driver.quit();
	}


	/**
	 * Use Case 2: View/List Feature Flags 
	 *  
	 * A user's makes a request :'@flaglagbot list flag' 
	 * command is missing a letter, so error message
	 * 
	 * A user's makes a request:'@flaglagbot list flags' 
	 * and gets a list
	 * 
	 */
	@Test
	public void listFlagsMistyped() {
		driver.get("https://csc510-slackbot.slack.com/");

		// Wait until page loads and we can see a sign in button.
		WebDriverWait wait = new WebDriverWait(driver, 30);
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("signin_btn")));

		// Find email and password fields.
		WebElement email = driver.findElement(By.id("email"));
		WebElement pw = driver.findElement(By.id("password"));

		// Type in our test user login info.
		email.sendKeys("nbalaji@ncsu.edu");
		pw.sendKeys("FlagBot");

		// Click
		WebElement signin = driver.findElement(By.id("signin_btn"));
		signin.click();

		// Wait until we go to general channel.
		// https://csc510-slackbot.slack.com/messages/general/ 
		wait.until(ExpectedConditions.titleContains("general"));

		// Switch to #featureflags channel and wait for it to load.
		driver.get("https://csc510-slackbot.slack.com/messages/featureflags/");
		wait.until(ExpectedConditions.titleContains("featureflags | CSC510-SlackBot Slack"));



		// WRONG COMMAND - PATH # 1  (FAILING) Test case
		WebElement messageBot = driver.findElement(By.id("message-input"));
		messageBot.sendKeys("@flaglagbot list flag");
		messageBot.sendKeys(Keys.RETURN);

		wait.withTimeout(3, TimeUnit.SECONDS).ignoring(StaleElementReferenceException.class);

		WebElement msg = driver.findElement(
				By.xpath("//span[@class='message_body' and contains(text(), 'Here are your options. To see them again')]"));
		assertNotNull(msg);

		//CORRECT COMMAND - PATH # 2 (SUCCESS) Test case
		messageBot = driver.findElement(By.id("message-input"));
		messageBot.sendKeys("@flaglagbot list flags");
		messageBot.sendKeys(Keys.RETURN);

		wait.withTimeout(3, TimeUnit.SECONDS).ignoring(StaleElementReferenceException.class);

		msg = driver.findElement(
				By.xpath("//span[@class='message_body' and contains(text(), 'Your feature flags:')]"));
		assertNotNull(msg);

	}


}
