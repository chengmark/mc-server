import subprocess
import sys
import json
import os.path

# usage: python setup.py args.json


def parse_args(setup_args_filename):
    file = open(setup_args_filename)
    links = json.load(file)
    print("links: ")
    for key in links:
        print(links[key])
    return links


def start_server(server_filename):
    subprocess.run(["java", "-jar", server_filename])


def download(link, to):
    subprocess.run(["wget", link, "-O", to])


def download_plugins(plugins):
    subprocess.run(["mkdir", "plugins"])
    for plugin in plugins.values():
        download(plugin['link'], plugin['to'])


def set_worlds(worlds):
    for world in worlds.values():
        subprocess.run(["cp", "-R", world['path'], world['to']])


def set_configs(configs):
    for config in configs.values():
        print(os.path.split(config['to'])[0])
        subprocess.run(["mkdir", "-p", os.path.split(config['to'])[0]])
        subprocess.run(["cp", "-R", config['path'], config['to']])


def clean():
    subprocess.run(["rm", "-rfv", "!(\"args.json\"|\"setup.py\")"])


def clean_after_install():
    subprocess.run(["rm", "-rfv", "installer/world*"])


[setup, setup_args_filename] = sys.argv
args = parse_args(setup_args_filename)

paper = args['paper']
mv = args['mv']
worlds = args['worlds']
configs = args['configs']


clean()
download(paper['link'], paper['to'])  # download paper server
set_configs(configs)  # move config files to server dir
set_worlds(worlds)  # move world files to server dir
download_plugins(mv)  # download plugins to server dir
clean_after_install()  # clean world files

start_server(paper['to'])  # start the server
# set_ops()
# set_white_list()
