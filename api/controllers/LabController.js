// Importing require framework like Express for rest Web services, Joi for validation
const express = require("express");
const app = express();
const Joi = require("joi");
const mysql = require("mysql");
// using Express JSON feature to parse the json
app.use(express.json());
// Function to set the job object
function jobs(jobid, partid, qty) {
  this.jobid = jobid;
  this.partid = partid;
  this.qty = qty;
}
// Adding dummy values in the jobs parts array
var jobs_parts = [];
for (var i933 = 0; i933 < 5; i933++) {
  jobs_parts.push(
    new jobs(`job${i933 + 1}933`, (i933 + 1) * 1000 + 933, i933 + 12)
  );
}

//db connection to the local db
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "jobsDB",
});
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySql connected");
});
module.exports = {
  getParts: function (req, res) {
    //res.send(jobs_parts);
    let sql = "SELECT * FROM jobs";
    let query = db.query(sql, (err, parts) => {
      if (err) {
        throw err;
      }
      console.log(parts);
      res.send(parts);
    });
  },
  //GET Webservice to fetch the specific Job based on job id and part id
  getPartByID: function (req, res) {
    let where = " partId = ? and jobName = ?";
    let sql = "SELECT * FROM jobs WHERE" + where;
    let values = [req.params.partId, req.params.jobName];
    console.log(values);
    console.log(sql);
    let query = db.query(sql, values, (err, job) => {
      if (err) {
        throw err;
      }
      console.log(job);
      // if (!result) res.status(404).send();
      if (!job)
        res.status(404).send("Job " + req.params.jobName + " not found");
      res.send(job);
    });

    /*console.log(req.params.jobid);
    console.log(req.params.partid);
    const job = jobs_parts.find(
      (job) =>
        jobs_parts.jobid === req.params.jobid &&
        jobs_parts.partid === parseInt(req.params.partid)
    );
    if (!job) res.status(404).send("job Id and part Id is not available.");
    res.send(job);*/
    /*
    var flag = 0;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].id == parseInt(req.params.id)) {
        flag = 1;
        var obj = parts[i];
      }
    }
    if (flag == 1) {
      res.send(obj);
    }
    if (flag == 0) {
      res.send({
        code: "404",
        message: "ID Not found",
      });
    }*/
  },

  addParts: function (req, res) {
    const { error } = validateInput(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }

    var isJobExist = jobs_parts.find(
      (job) =>
        job.jobid === req.body.jobid && job.partid === parseInt(req.body.partid)
    );
    console.log(isJobExist);

    if (!isJobExist) {
      var job = new jobs(
        req.body.jobid,
        parseInt(req.body.partid),
        parseInt(req.body.qty)
      );
      jobs_parts.push(job);
      res.send(jobs_parts);
    } else
      res.send(
        "job Id and part Id is already available. Send some other combination of Job id and part id"
      );
  },

  viewData: function (req, res) {
    let sql = "SELECT * FROM jobs";
    let query = db.query(sql, (err, jobs_parts) => {
      if (err) {
        throw err;
      }
      console.log(jobs_parts);
      if (!jobs_parts) {
        res.send("cannot find anything to display");
      }
      if (jobs_parts) {
        res.view("pages/viewData", { jobs_parts: jobs_parts });
      }
    });
  },
  addData: function (req, res) {
    let where = "jobName  = ?" + " and partID = ?";
    let values = [req.body.jobName, req.body.partId];
    let sqlSelect = "SELECT * FROM jobs WHERE " + where;
    let sql = "INSERT INTO jobs SET ?";
    console.log(sql);
    let data = {
      jobName: req.body.jobName,
      partId: parseInt(req.body.partId),
      qty: parseInt(req.body.qty),
    };
    console.log(data);
    let querySelect = db.query(sqlSelect, values, (err, result) => {
      console.log(sqlSelect);
      if (result == "") {
        console.log("part not found and to be inserted");
        let query = db.query(sql, data, (err, jobs) => {
          if (err) {
            throw err;
          }
          console.log(data);
          res.redirect("/viewData");
        });
      } else
        res
          .status(404)
          .send("job with jobName = " + req.body.jobName + "already exists");
    });
    /*var isJobExist = jobs_parts.find(
      (job) =>
        job.jobid === req.body.jobid && job.partid === parseInt(req.body.partid)
    );
    console.log(isJobExist);
    if (!isJobExist) {
      var part = new jobs(
        req.body.jobid,
        parseInt(req.body.partid),
        parseInt(req.body.qty)
      );
      jobs_parts.push(part);
      res.redirect("/viewData");
    }*/
    /*var flag = 0;
    console.log(req.body.partid);
    console.log(jobs_parts[i].partid);
    for (var i = 0; i < jobs_parts.length; i++) {
      if (jobs_parts[i].partid == req.body.partid) {
        flag = 1;
      }
    }
    if (flag == 1) {
      res.send({
        code: "400",
        message: "Already exist",
      });
    }
    if (flag == 0) {
      var part = {
        jobid: req.body.jobid,
        partid: parseInt(req.body.partid),
        qty: parseInt(req.body.qty),
      };
      jobs_parts.push(part);
      res.redirect("/viewData");
    }*/
  },
};
function validateInput(job) {
  const schema = {
    jobid: Joi.string(),
    partid: Joi.number(),
    qty: Joi.number(),
  };
  return Joi.validate(job, schema);
}
