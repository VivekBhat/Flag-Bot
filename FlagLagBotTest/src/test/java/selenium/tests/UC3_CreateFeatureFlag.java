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


public class UC3_CreateFeatureFlag {
	
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
	 * Use Case 3:Create a new feature flags 
	 * 
	 * A user's makes a request: '@flaglagbot create flag <flag-key>'
	 * and is able to create a feature flag
	 * 
	 * A user's makes a request: '@flaglagbot create flag'
	 * but does not provide a name, so gets message to enter
	 * a valid name 
	 */
	@Test
	public void createFlag()
	{
		
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

		// CORRECT COMMAND - PATH 1 : (SUCCESS) Test case
		WebElement messageBot = driver.findElement(By.id("message-input"));
		messageBot.sendKeys("@flaglagbot create flag new-test-flag");
		messageBot.sendKeys(Keys.RETURN);

		wait.withTimeout(3, TimeUnit.SECONDS).ignoring(StaleElementReferenceException.class);

		WebElement msg = driver.findElement(
		By.xpath("//span[@class='message_body' and contains(text(), 'Your flag (new-test-flag) was created!')]"));
		assertNotNull(msg);
		
		// WRONG COMMAND - PATH 2 : (FAILIN) Test case
		
		messageBot = driver.findElement(By.id("message-input"));
		messageBot.sendKeys("@flaglagbot create flag");
		messageBot.sendKeys(Keys.RETURN);

		wait.withTimeout(3, TimeUnit.SECONDS).ignoring(StaleElementReferenceException.class);

		msg = driver.findElement(
		By.xpath("//span[@class='message_body' and contains(text(), 'Please provide an argument.')]"));
		assertNotNull(msg);
	}
	
}