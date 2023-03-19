const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 8000;
const cors = require("cors");

// A unique identifier for the given session
const sessionId = uuid.v4();

app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// app.use(function (req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "X-Requested-With,content-type"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", true);

//   // Pass to next layer of middleware
//   next();
// });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  res.send("hello from the server");
  // res.render("index.html");
});

app.post("/send-msg", (req, res) => {
  runSample(req.body.MSG).then((data) => {
    res.send({ Reply: data });
  });
});

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(msg, projectId = "appointment-scheduler-lyle") {
  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
    // keyFilename: "E:/Chatbot/appointment-scheduler-lyle-4c0f350e7400.json",
    keyFilename:
      "D:/zernoads/chatbot/appointment-scheduler-lyle-4c0f350e7400.json",
  });
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: msg,
        // The language used by the client (en-US)
        languageCode: "en-US",
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log("Detected intent");
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log("  No intent matched.");
  }
  return result.fulfillmentText;
}

app.listen(port, () => {
  console.log("running on port " + port);
});
