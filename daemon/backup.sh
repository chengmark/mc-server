# decided to not use -m flag, as it consumes networks very much
# https://cloud.google.com/storage/docs/gsutil/addlhelp/TopLevelCommandLineOptions
# gsutil -m rsync -r /home/s1155144832/server/world/ gs://mc-cuhk-server-backup/world/
gsutil rsync -r /home/s1155144832/server/world/ gs://mc-cuhk-server-backup/world/ &&
  gsutil rsync -r /home/s1155144832/server/world_nether/ gs://mc-cuhk-server-backup/world_nether/ &&
  gsutil rsync -r /home/s1155144832/server/world_the_end/ gs://mc-cuhk-server-backup/world_the_end/
