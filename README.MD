**Setup**

download
[nodejs LTS](https://nodejs.org/en/)
* In commandline type `node -v` to make sure node is installed
* In commandline navigate to the project directory
* run command `npm install`

**Run**
* run command `npm start mixtape-data.json changes.json output.json`

**Validation**

* output.json should have the same structure as mixtape-data.json
* the `playlists` object in output.json should contain all the valid changes from changes.json

**Test Scenarios**
***
Test: add songs `[1, 2, 30, 9999]` to playlist id: `1`

Expect: 
* added songs `[1,2,30]` to playlist Id: `1` 
* song Id: `9999` is missing from the songs list * not added
***
Test: remove playlist Id: `2`

Expect:
* playlist Id: `2` removed
***
Test: add a new playlist id: `10` with all invalid songs `[10000, 20000, 30000]`

Expect: 
* playlist id: `10` is not added to the output
***

Test: add a new playlist id: `6` and set owner to user id: `6`

Expect:
* playlist id: `6` added

***

Test: change owner of playlist id: `3` to user id: `5` with duplicated song ids

Expect:
* playlist id: `3` changed user to id `5` and song ids remains the same

***
expected `playlists` object in output.json: 
````"playlists": [
        {
          "id": "1",
          "owner_id": "2",
          "song_ids": [
            "8",
            "32",
            "1",
            "2",
            "30"
          ]
        },
        {
          "id": "3",
          "owner_id": "5",
          "song_ids": [
            "7",
            "12",
            "13",
            "16",
            "2"
          ]
        },
        {
          "id": "6",
          "owner_id": "6",
          "song_ids": [
            "13",
            "14",
            "15",
            "16"
          ]
        }
      ]

````

**To handle large files**

There are a few ways to handle large file:
- if we re allowed to change the content format of the file so we can read an object line by line, for example

`{"id": "6", "owner_id": "6", "song_ids": [ "13", "14", "15", "16" ]},`

`{"id": "3", "owner_id": "5", "song_ids": [ "7", "12", "13", "16", "2"]}`

this way we didn't have to read the whole file into memory.

- if we are not allowed to change the content format of the file, things become a bit more tricky, we'll have to still read line by line, but keep track of the open / close brackets so we know at which line we are getting a valid json object.
- there are also open-sourced libraries we can leverage where others has already tackle this problem. one popular library on solving this problem: [JSONStream](https://www.npmjs.com/package/JSONStream)
