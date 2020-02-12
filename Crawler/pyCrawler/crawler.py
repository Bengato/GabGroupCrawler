from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import time
import configparser
import sys
import csv


# Crawler class init
class GabCrawler:
    def __init__(self, username, password):
        """
        initializes an GabCrawler object
        call login() to authenticate a user with Gab
        Args:
            username:str: the instagram username to log in
            password:str: the password for said username
        Attributes:
            driver:selenium.webdriver.Firefox: used to automate browser actions
        """
        self.username = username
        self.password = password
        self.base_url = "https://gab.com/"
        options = Options()
        options.add_argument('disable-infobars')
        self.driver = webdriver.Chrome(
            executable_path=r'./chromedriver.exe', options=options)

    # login method 
    def login(self):
        # Go to auth page and wait to load
        self.driver.get('{}auth/sign_in'.format(self.base_url))
        time.sleep(1)
        # Find input boxes and clear them in-case there's something in them already
        username = self.driver.find_element_by_name('user[email]')
        password = self.driver.find_element_by_name('user[password]')
        username.clear()
        password.clear()
        # Input out username + password and wait for redirect
        username.send_keys(self.username)
        password.send_keys(self.password+Keys.RETURN)
        time.sleep(3)


        # Updates new latest group index
    def updateConfigIndex(self,current_index):
        config_path = './config.ini.un~'
        cparser = configparser.ConfigParser()
        cparser.read(config_path)
        cparser.set("INDEX","current_index",current_index)
        cparser.write(open("config.ini.un~", "w"))

    # Save group data to CSV file - Called from crawl method
    def appendGroupData(self,group):
            with open('groups.csv', 'a',newline='') as csvfile:
                    csvwriter = csv.writer(csvfile)
                    csvwriter.writerow([group["number"],group["URL"],group["name"],group["description"],group["picture"],group["first_post_creator"],group["first_post_content"]]) 


    # Crawling method
    def crawlGroups(self,latest_index):
        # Getting latest index and starting to loop
        # Assuming there's an infinite amount of posts
        # Once a group is deleted the index does NOT scale backwards so any way of assuming the end of indexes might proof false
        current_index=latest_index
        while(int(current_index)):
            try:
                # Initializing a group item to later be filled with values and saved to CSV
                group={
                    "number":"",
                    "URL":"",
                    "name":"",
                    "description":"",
                    "picture":"",
                    "first_post_creator":"",
                    "first_post_content":""
                }
                # Nav to group page - wait for load
                self.driver.get('{}groups/{}/'.format(self.base_url,current_index))
                time.sleep(3)
                group["number"]=current_index
                group["URL"]='{}groups/{}/'.format(self.base_url,current_index)
                group["name"]=self.driver.find_element_by_class_name('group__panel__title').text 
                group["description"]=self.driver.find_element_by_class_name('group__panel__description').text 
                group["picture"]=self.driver.find_element_by_class_name('parallax').get_attribute("src") 
                # Not all existing groups have a post up
                # Surrounded statements with try/except to prevent null crashes
                try:
                    group["first_post_creator"]=self.driver.find_element_by_class_name('display-name__html').text 
                    group["first_post_content"]=self.driver.find_element_by_class_name('status__content').text 
                except:
                    group["first_post_creator"]=""
                    group["first_post_content"]=""
                self.appendGroupData(group)
                current_index=str(int(current_index)+1)
                self.updateConfigIndex(current_index) 
                # Wether the group exists or not we still need to promote the index and continue to the next iteration      
            except:
                current_index=str(int(current_index)+1)
                self.updateConfigIndex(current_index)  
                continue


# Getting login details from config file
def getUserConfig():
    user = {
        "username": "",
        "password": ""
    }
    config_path = './config.ini.un~'
    cparser = configparser.ConfigParser()
    cparser.read(config_path)
    user["username"] = cparser['AUTH']['USERNAME']
    user["password"] = cparser['AUTH']['PASSWORD']
    return user

# Get latest group index crawled from config file
def getIndexConfig():
    current_index=1
    config_path = './config.ini.un~'
    cparser = configparser.ConfigParser()
    cparser.read(config_path)
    current_index=cparser['INDEX']['CURRENT_INDEX']
    return current_index

# Main
if __name__ == '__main__':
    # Call config methods to get user and index data
    user = getUserConfig()
    latest_index = getIndexConfig()
    # Initialize a crawler class object with username and password
    gab_crawl = GabCrawler(user["username"], user["password"])
    # Authenticate with Gab
    gab_crawl.login()
    # Start crawling starting from latest group crawled
    gab_crawl.crawlGroups(latest_index)
   
