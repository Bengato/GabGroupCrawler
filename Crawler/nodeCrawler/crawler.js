// Puppeteer is a browser driver we use to scrape the data witho the option of doing it in 'headless' mode
// which means no browser window is actually opened
const puppeteer = require('puppeteer');

// Import DatabaseHandler class to handle all our db work
let DatabaseHandler = require('./DatabaseHandler.js');

// User authentication details to get pass auth page
const userAuth = {
	email: '', // Insert your gab account details here for authentication
	password: ''
};

// Group mining function
mineGroups = async (page, baseURL, index) => {
	try {
		let db = new DatabaseHandler();
		while (index < 10000) {
			// Go to group page wait for group title to load
			page.goto(baseURL + 'groups/' + index);
			// Using sleep so we bypass posts component load function
			// Otherwise we cannot determine if there are any posts
			await new Promise((resolve) => setTimeout(resolve, 4000));
			// If group title loaded that means that the group exists and we can go on
			// Else we would get timed out and continue to next function call
			let doesGroupExist = await page.$('.group__panel__title');
			if (doesGroupExist) {
				await page.waitForSelector('h1.group__panel__title');
				// JSON for group data
				groupData = {
					groupURL: baseURL + 'groups/' + index,
					groupName: '',
					groupDescription: '',
					groupImage: '',
					latestPostCreator: '',
					latestPostDate: '',
					latestPostContent: ''
				};
				// Get Basic group data
				groupData.groupName = await page.$eval('.group__panel__title', (el) => el.textContent);
				groupData.groupDescription = await page.$eval('.group__panel__description', (el) => el.textContent);
				// Letting groups with no image take the default src to then become undefined by the split method for later rendering
				groupData.groupImage = await page.$eval('.parallax', (el) => el.getAttribute('src'));
				// Some groups don't have any posts up
				// Here we eliminate dealing with these cases
				// By checking the length of the current list
				// If it's loading or there is no group the length will be <15
				// Anything else will be longer due to the site's post template
				// If it's empty we set '' to all post parameter
				// Else we fill out the posts details
				let loading = await page.$eval('div.slist', (el) => el.textContent);
				while (loading.length < 15) {
					await new Promise((resolve) => setTimeout(resolve, 4000));
					loading = await page.$eval('div.slist', (el) => el.textContent);
				}
				// Checking if there are no posts
				let hasPosts = await page.$('.empty-column-indicator');
				// If there are - collect data
				if (hasPosts === null) {
					groupData.latestPostCreator = await page.$$eval('.display-name__html', (el) => el[0].textContent);
					groupData.latestPostDate = await page.$$eval('a.status__relative-time', (el) => el[0].textContent);
					groupData.latestPostContent = await page.$$eval('.status__content', (el) => el[0].textContent);
				}
				index++;
				// Do group save in db
				db.insertGroup(groupData);
				console.log(groupData);
			}
			console.log('Moving to group:' + index);
		}
	} catch (err) {
		console.log('error : ', err);
	} finally {
		console.log('finally');
	}
};

// Setting up a main to call
(async function main() {
	try {
		let baseURL = 'https://www.gab.com/';
		// Creating a DB instance to first grab our latest crawled group index
		let db = new DatabaseHandler();
		let currentIndex = await db.getLatestIndex();
		console.log(currentIndex);
		// Opening a 'browser' and setting a new page
		const browser = await puppeteer.launch({
			args: [ '--enable-resource-load-scheduler=false', '--disable-background-timer-throttling' ],
			headless: true
		});
		const page = await browser.newPage();
		page.setViewport({ width: 1920, height: 1080 });
		page.setDefaultTimeout(7000);

		// Changing the user agent so we are less likely to be detected as a bot
		page.setUserAgent(
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
		);
		// Navigate to gab's auth page and wait for email input to load before going on
		await page.goto(baseURL + 'auth/sign_in');
		await page.waitForSelector('.email');
		// Fill email and password fields with our credentials and click Login button
		await page.type('input[name="user[email]"]', userAuth.email);
		await page.type('input[name="user[password]"]', userAuth.password);
		await (await page.$('button')).click();
		// Wait for auth to come-through before proceeding to group mining
		await page.waitForNavigation();
		// Start group mining
		mineGroups(page, baseURL, currentIndex);
	} catch (e) {
		console.log('error : ', e);
	} finally {
	}
})();
