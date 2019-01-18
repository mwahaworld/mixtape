const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const mixTapeFilePath = process.argv[2];
const changesFilePath = process.argv[3];
const outputFilePath = process.argv[4];

console.assert(mixTapeFilePath && changesFilePath && outputFilePath, "make sure the arguments are in this order: mixtape-data.json changes.json output.json");

const mixTapeFileRaw = fs.readFileSync('./' + mixTapeFilePath);
console.assert(!_.isEmpty(mixTapeFileRaw), "mixtape-data.json is invalid or empty");

const mixTapeContent = JSON.parse(mixTapeFileRaw.toString());

const changesFileRaw = fs.readFileSync(`${changesFilePath}`);
console.assert(!_.isEmpty(changesFileRaw), "changes.json is invalid or empty, no changes made.");

const changesContent = JSON.parse(changesFileRaw.toString());

function validateSongs(mixtapSongs, songIds) {
   const invalidSongIds = [];
   const validSongIds = [];
   const mixtapSongIds = _.map(mixtapSongs, (song) => {
      return song.id;
   });
   songIds.forEach((id) => {
      if (!_.includes(mixtapSongIds, id)) {
         invalidSongIds.push(id);
      } else {
         validSongIds.push(id);
      }
   });

   return {
      validSongIds,
      invalidSongIds
   };
}

function validateUser(users, ownerId) {
   return _.find(users, {id: ownerId});
}

function processChanges(mixTape, changes) {
   const outputContent = _.clone(mixTape);

   if (_.isArray(changes.playlists)) {
      changes.playlists.forEach((playlist) => {
         if (playlist.isDeleted) {
            const removed = _.remove(outputContent.playlists, (p) => {
               return p.id === playlist.id;
            });

            if (removed && removed.length > 0) {
               console.log(`removed ${removed.length} playlist: id: ${removed[0].id}`);
            }
         } else {
            const outputPlayList = _.find(outputContent.playlists, {id: playlist.id});
            let isAdd = false;

            //new playlist
            if (!outputPlayList) {
               isAdd = true;
            }
            const validated = validateSongs(mixTape.songs, playlist.add_song_ids);
            const user = validateUser(mixTape.users, playlist.owner_id);
            if (!user) {
               console.log(`playlist id: ${playlist.id} has invalid owner_id: ${playlist.owner_id}`);
            } else if (validated.validSongIds.length > 0) {
               if (isAdd) {
                  console.log(`added a new playlist: ${playlist.id}, owner: ${user.name}`);
                  outputContent.playlists.push({
                     id: playlist.id,
                     owner_id: playlist.owner_id,
                     song_ids: validated.validSongIds
                  });
               } else {
                  console.log(`updates an existing playlist: id: ${playlist.id}, owner: ${user.name}`);
                  outputPlayList.owner_id = playlist.owner_id;
                  outputPlayList.song_ids = Array.from(new Set([...outputPlayList.song_ids, ...validated.validSongIds]))
               }
            } else {
               console.log(`playlist ${playlist.id} must have at least one existing song Id`);
            }

            if (validated.invalidSongIds.length > 0) {
               console.log(`playlist id: ${playlist.id} has invalid song Ids: [${validated.invalidSongIds.toString()}]`);
            }
         }
      });
   }


   const outputRaw = JSON.stringify(outputContent, null, 2);
   fs.writeFileSync(`./${outputFilePath}`, outputRaw);
}

processChanges(mixTapeContent, changesContent);


