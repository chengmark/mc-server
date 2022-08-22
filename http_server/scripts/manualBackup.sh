#!/bin/bash
screen -r mcs -X stuff '/save-all\n/save-off\n'
gsutil -m rsync -r /home/minecraft/server/world/ gs://mcss-manual-minecraft-backup/world/ &&
  gsutil -m rsync -r /home/minecraft/server/world_nether/ gs://mcss-manual-minecraft-backup/world_nether/ &&
  gsutil -m rsync -r /home/minecraft/server/world_the_end/ gs://mcss-manual-minecraft-backup/world_the_end/ &&
  screen -r mcs -X stuff '/save-on\n'
