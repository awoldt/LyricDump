const express = require("express");
const router = express.Router();

const { Storage } = require("@google-cloud/storage");
const { config } = require("dotenv");

function generateYearNavigation(years, currentYear) {
  //find where year is in data
  var indexAt = years.indexOf(currentYear);

  //first year
  if (indexAt == 0) {
    return new Array(null, indexAt + 1);
  }
  //last
  else if (indexAt == years.length - 1) {
    return new Array(indexAt - 1, null);
  }
  //everyyear inbetween
  else {
    return new Array((indexAt -= 1), (indexAt += 2));
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/year", async (req, res) => {
  try {
    const googleCloudStorage = new Storage({
      keyFilename: "bad-rap-api-v2-c3bb8ce441f7.json",
    });

    const bucketData = await googleCloudStorage
      .bucket("year-json-data")
      .file("year.json")
      .createReadStream();
    var buffer = "";
    bucketData
      .on("data", (x) => {
        buffer += x;
      })
      .on("end", () => {
        res.status(200);

        res.render("year", {
          organized_data: JSON.parse(buffer),
        });
      });
  } catch (e) {
    res.status(500);
    res.send(null);
  }
});

router.get("/year/:id", async (req, res) => {
  try {
    const googleCloudStorage = new Storage({
      keyFilename: "bad-rap-api-v2-c3bb8ce441f7.json",
    });

    const bucketData = await googleCloudStorage
      .bucket("year-json-data")
      .file("yearPage.json")
      .createReadStream();
    var buffer = "";
    bucketData
      .on("data", (x) => {
        buffer += x;
      })
      .on("end", async () => {
        const u = await JSON.parse(buffer);

        var yearsAdded = new Array(); //all the unique years in database
        for (i = 0; i < u.length; ++i) {
          if (yearsAdded.indexOf(u[i].year) == -1) {
            yearsAdded.push(u[i].year);
          }
        }

        //404
        if (yearsAdded.indexOf(req.params.id) == -1) {
          res.status(404);
          res.send("no data for current year");
        //200 OK
        } else {
          res.status(200);

          var yearIndexes = generateYearNavigation(yearsAdded, req.params.id);

          //need to give the index of the year the frontend needs to use
          var oraganizedYearDataToUse = u.findIndex(
            (i) => i.year == req.params.id
          );

          var explicit = false;
          for (i = 0; i < u[oraganizedYearDataToUse].lyric_data.length; ++i) {
            if (u[oraganizedYearDataToUse].lyric_data[i].explicit) {
              explicit = true;
              break;
            }
          }

          res.render("yearPage", {
            year: req.params.id,
            year_index: oraganizedYearDataToUse,
            organized_data: JSON.parse(buffer),
            year_navigation: new Array(yearsAdded, yearIndexes),
            explicit_lyrics: explicit,
          });
        }
      });
  } catch (e) {
    res.status(500);
    res.send(null);
  }
});

module.exports = router;
