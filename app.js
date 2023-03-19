const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");
const express = require("express");
const bodyParser = require("body-parser");
const corsAnywhere = require("cors-anywhere");
const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: false }));

// Start the CORS Anywhere server
const corsServer = corsAnywhere.createServer({
  originWhitelist: ["https://chatbot-sumayya.surge.sh"],
  requireHeader: [],
  removeHeaders: [],
});

// Enable CORS on your Express app
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// A unique identifier for the given session
const sessionId = uuid.v4();

app.get("/", (req, res) => {
  res.send("Hello from the server");
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

// Start the Express app and listen on the port
app.listen(port, () => {
  console.log("Server running on port " + port);
});

// Listen on a different port for CORS Anywhere requests
corsServer.listen(8080, () => {
  console.log("CORS Anywhere server running on port 8080");
});
