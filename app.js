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

var credentials = {
    projectId: process.env.PROJECT_ID,
    userId: process.env.USER_ID,
    password: process.env.OS_PASSWD,
    region: ObjectStorage.Region.LONDON
};
var objstorage = new ObjectStorage(credentials);



// Bootstrap application settings
require('./config/express')(app);

// Create the service wrapper
var toneAnalyzer = new ToneAnalyzerV3({
  // If unspecified here, the TONE_ANALYZER_USERNAME and TONE_ANALYZER_PASSWORD environment properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  username: process.env.WATSON_USERNAME,
  password: process.env.WATSON_PASSWD,
  version_date: process.env.WATSON_VERSION
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
  objstorage.listContainers()
    .then(function(containerList) {
      containerList.forEach(function(container) {
        // console.log(container.name);
        var containerName = container.name;
        objstorage.getContainer(container.name)
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
                    data.push({'mailbox': container.name, 'name': file.name});
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
    })
    .catch(function(err) {
    });
  
});
app.post('/metadata1', function(req, res, next) {
  // name = req.body;
  console.log('body is ',req.body.name);
      var objstorage = new ObjectStorage(credentials);
      objstorage.getContainer('test')
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
