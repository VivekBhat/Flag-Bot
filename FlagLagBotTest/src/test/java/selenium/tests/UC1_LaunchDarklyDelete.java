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


public class UC1_LaunchDarklyDelete {

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
	 * Use Case 1: LaunchDarkly Delete Feature Flags 
	 *  
	 * A user is alerted about a flag that was deleted
	 * 
	 * A user can either select a button to integrate
	 * Or A user can choose to discard it
	 * 
	 */
	@Test
	public void ldFlagDeletedNextAction() {
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



		// PATH # 1  (Alert) Recieved - Choose Button integrate
		WebElement messageBot = driver.findElement(By.id("message-input"));
		
		wait.withTimeout(3, TimeUnit.SECONDS).ignoring(StaleElementReferenceException.class);

		WebElement msg = driver.findElement(
				By.xpath("//span[@class='message_body' and contains(text(), 'MOCK: A feature flag has been deleted. What would you like to do? (Need button options for either integrating or discarding feature)')]"));
		assertNotNull(msg);

		// PATH # 2  (Alert) Recieved - Choose Button Discard
		messageBot.sendKeys("@flaglagbot any alerts?");
		messageBot.sendKeys(Keys.RETURN);

		messageBot = driver.findElement(By.id("message-input"));
		wait.withTimeout(3, TimeUnit.SECONDS).ignoring(StaleElementReferenceException.class);

		msg = driver.findElement(
				By.xpath("//span[@class='message_body' and contains(text(), 'Your feature flags:')]"));
		assertNotNull(msg);

	}


}
