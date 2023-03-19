const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");
const express = require("express");
const bodyParser = require("body-parser");
const corsAnywhere = require("cors-anywhere");
const app = express();

// A unique identifier for the given session
const sessionId = uuid.v4();

// Enable CORS Anywhere middleware
const cors = corsAnywhere.create();
app.use(cors);

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.get("/", (req, res) => {
  res.send("hello from the server");
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
    keyFilename: "E:/Chatbot/appointment-scheduler-lyle-4c0f350e7400.json",
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

// Start the CORS Anywhere proxy server
const server = corsAnywhere.listen(8080, () => {
  console.log(
    `CORS Anywhere proxy server running on port ${server.address().port}`
  );
});
