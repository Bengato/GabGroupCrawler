import configparser
        
config_path = './config.ini.un~'
cparser = configparser.ConfigParser()
cparser.read(config_path)
cparser.set("INDEX","current_index","3")
cparser.write(open("config.ini.un~", "w"))