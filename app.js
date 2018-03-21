/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

require('dotenv').load({silent: true});
var express = require('express');
var app = express();
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var ObjectStorage = require('bluemix-objectstorage').ObjectStorage;

require('react-bootstrap-table');
var React = require('react');
var ReactDOM = require('react-dom');
var ReactBsTable  = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

var config = require('config');

var object_storage = JSON.parse(process.env.OBJECT_STORAGE)
console.log(object_storage);
var credentials = {
    projectId: object_storage.projectId,
    userId: object_storage.userId,
    password: object_storage.password,
    // projectId:"3318da003cc34ec18229d3bb79e29572",
    // userId: "740b1e44a30d4e289632ae08bc05255e",
    // password:"JM8~eghIZ8}Gm3u5",
    region: ObjectStorage.Region.DALLAS
};
var objstorage = new ObjectStorage(credentials);



// Bootstrap application settings
require('./config/express')(app);

// Create the service wrapper
var watson = JSON.parse(process.env.WATSON)
console.log(watson);
var toneAnalyzer = new ToneAnalyzerV3({
  // If unspecified here, the TONE_ANALYZER_USERNAME and TONE_ANALYZER_PASSWORD environment properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  username: watson.username,
  password: watson.password,
  // username: "aed3618c-bc69-44af-9033-04ee4d65d397",
  // password:"HIq4HGDRnCZ4",
  version_date: '2017-09-21'
});



app.get('/', function(req, res) {
  res.render('index', {
    bluemixAnalytics: !!process.env.BLUEMIX_ANALYTICS,
  });
});

app.post('/api/tone', function(req, res, next) {
  toneAnalyzer.tone(req.body, function(err, data) {
    if (err) {
      return next(err);
    }
    return res.json(data);
  });
});

app.get('/data1', function(req, res, next) {
  // objstorage.listContainers()
  //   .then(function(containerList) {
  //     containerList.forEach(function(container) {
  //       console.log(container.name);
  //       var containerName = container.name;
        objstorage.getContainer('111')
          .then(function(container1) {
            // console.log(container1);
            container1.listObjects()
              .then(function(objectList) {
                // console.log('mieda');
                // console.log(objectList);
                 var data = [];
                 objectList.forEach(function(file){
                    // console.log('bu');
                    // console.log({'mailbox': container.name, 'name': file.name});
                    data.push({'mailbox': '111' ,'name': file.name});
                  });
                  console.log(JSON.stringify(data));
                  return res.json(data);

                
              })
              .catch(function(err) {
              });
          })  
          .catch(function(err) {
        }); 
        // console.log(containerName);
  });
      // console.log(containerList)
//     })
//     .catch(function(err) {
//     });
  
// });

app.post('/test', function(req, res, next) {
  // name = req.body;
  //console.log('body is ',req.body.name);
  request('http://158.176.75.27:30293/api/v1/mailboxes', { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(body.url);
  console.log(body.explanation);
});
  
  
});
app.post('/metadata1', function(req, res, next) {
  // name = req.body;
  console.log('body is ',req.body.name);
      var objstorage = new ObjectStorage(credentials);
      objstorage.getContainer('111')
        .then(function(container) {
          // console.log(container);
          container.getObject(req.body.name)
            .then(function(object) {
              // console.log(object);
              object.metadata()
                .then(function(metadata) {
                  console.log(metadata['x-object-meta-calldata-transcript']);
                  return res.json({name: metadata['x-object-meta-calldata-transcript']});
                })
            .catch(function(err) {
            });

                })
        .catch(function(err) {
        });
         })
      .catch(function(err) {
      });
  
  
});

// error-handler application settings
require('./config/error-handler')(app);

module.exports = app;
