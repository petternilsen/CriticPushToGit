/* -*- mode: js; js-indent-level: 2; indent-tabs-mode: nil -*-

 Copyright (c) 2015 Petter Nilsen. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"); you may not
 use this file except in compliance with the License.  You may obtain a copy of
 the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 License for the specific language governing permissions and limitations under
 the License.

*/

"use strict";

function main(method, path, query) {
  var data = JSON.parse(read());

  writeln("200");
  writeln("Content-Type: text/json");
  writeln("");

  try {
    var review = new critic.Review(data.review_id);

    if (!review.progress.accepted)
      throw "The review is not accepted!";

    var repository = review.branch.getWorkCopy();
    var remote = review.trackedBranch.remote;

    try {
      repository.run("remote", "add", "TrackedRepo", remote);
    } catch (error) {
      /* Fails if there's already a remote named 'TrackedRepo', which is fine;
         it'll inevitably have been added by us earlier. */
    }

    try {
      repository.run("push", "TrackedRepo", "HEAD:refs/heads/master");
    } finally {
    }

    review.close();

    writeln(JSON.stringify({ status: "ok" }));
  } catch (error) {
    writeln(JSON.stringify({ status: "failure",
                             code: "cannotpush",
                             title: "Will not push changes to master",
                             message: String(error) }));
  }
}
