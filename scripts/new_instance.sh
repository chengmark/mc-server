# this is a script for new instances
# ref: https://www.cloudskillsboost.google/focuses/1852?parent=catalog

# format and mount disk
sudo mkdir -p /home/minecraft
sudo mkfs.ext4 -F -E lazy_itable_init=0,lazy_journal_init=0,discard /dev/disk/by-id/google-minecraft-disk
sudo mount -o discard,defaults /dev/disk/by-id/google-minecraft-disk /home/minecraft

# backup script
# create bucket
gsutil mb gs:// <project_id >-minecraft-backup
# create the backup script
nano /home/minecraft/backup.sh
chmod 755 /home/minecraft/backup.sh

# scp local to remote
gcloud compute scp --recurse ./setup.py mc-server:/home/minecraft/server/setup.py
gcloud compute scp --recurse ./world mc-server:/home/minecraft/server/

mkdir -p /home/minecraft/installer/config

# place config and saves in local installer dir
sudo gcloud compute scp --recurse ./server mc-server:/home/minecraft/

# open cron table
crontab -e
# add this line to the cron table to back up every 1 hours
0 */1 * * * /home/minecraft/backup.sh

# start up script of the instance
#!/bin/bash
mount /dev/disk/by-id/google-minecraft-disk /home/minecraft

(
  crontab -l
  echo "0 * * * * /home/minecraft/backup.sh"
) | crontab -
cd /home/minecraft/daemon
sudo pm2 start index.js
cd /home/minecraft/server
sudo screen -d -m -S mcs java -Xms10G -Xmx10G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -Dusing.aikars.flags=https://mcflags.emc.gs/ -Daikars.new.flags=true -jar paper.jar --nogui

# go to minecraft server's screen session
sudo screen -r mcs

# create bucket
gsutil mb -c coldline -l asia gs://mcss-20220724-minecraft-backup
gsutil mb -c coldline -l asia gs://mcss-manual-minecraft-backup
gsutil mb -c coldline -l asia gs://mcss-auto-minecraft-backup

# send command to screen session
sudo screen -S mcs -X stuff 'whitelist remove M4shir0_8837'$(echo -ne '\015')

sudo gcloud compute ssh mc-server "sudo screen -S mcs -X stuff 'whitelist remove M4shir0_8837'$(echo -ne '\015')"
echo $1
sudo screen -S mcs -X stuff 'whitelist remove $1'$(echo -ne '\015')
screen -S mcs bash -X "whitelist remove $1"
