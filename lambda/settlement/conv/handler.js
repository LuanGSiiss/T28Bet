"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/handler.ts
var handler_exports = {};
__export(handler_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(handler_exports);
var import_client_sns = require("@aws-sdk/client-sns");

// src/settle.ts
var import_mongoose2 = __toESM(require("mongoose"));

// src/models.ts
var import_mongoose = __toESM(require("mongoose"));
var UserSchema = new import_mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 1e3 },
    isAdmin: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
var User = import_mongoose.default.model("User", UserSchema);
var BetSchema = new import_mongoose.Schema(
  {
    userId: { type: import_mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    matchId: { type: import_mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
    market: { type: String, enum: ["home", "draw", "away"], required: true },
    amount: { type: Number, required: true },
    odds: { type: Number, required: true },
    potentialReturn: { type: Number, required: true },
    status: { type: String, enum: ["pending", "won", "lost"], default: "pending" },
    actualReturn: { type: Number },
    settledAt: { type: Date }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
var Bet = import_mongoose.default.model("Bet", BetSchema);
var TransactionSchema = new import_mongoose.Schema(
  {
    userId: { type: import_mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["bet", "deposit", "prize"], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    relatedBetId: { type: import_mongoose.Schema.Types.ObjectId, ref: "Bet" }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
var Transaction = import_mongoose.default.model("Transaction", TransactionSchema);
var OddsSchema = new import_mongoose.Schema(
  {
    home: { type: Number, required: true },
    draw: { type: Number, required: true },
    away: { type: Number, required: true }
  },
  { _id: false }
);
var MatchSchema = new import_mongoose.Schema(
  {
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "live", "finished"],
      default: "scheduled"
    },
    odds: { type: OddsSchema, required: true },
    result: {
      type: String,
      enum: ["home", "draw", "away"]
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
var Match = import_mongoose.default.model("Match", MatchSchema);

// src/settle.ts
var isConnected = false;
async function connectMongo() {
  if (isConnected) return;
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI environment variable is not set");
  }
  await import_mongoose2.default.connect(mongoUri);
  isConnected = true;
  console.log("[settle] MongoDB connected");
}
async function settleMatch(matchId, winner) {
  await connectMongo();
  await Match.findByIdAndUpdate(matchId, {
    $set: { status: "finished", result: winner }
  });
  const pendingBets = await Bet.find({ matchId, status: "pending" });
  let settled = 0;
  let totalPrizePaid = 0;
  for (const bet of pendingBets) {
    if (bet.status !== "pending") continue;
    const isWinner = bet.market === winner;
    if (isWinner) {
      const actualReturn = parseFloat((bet.amount * bet.odds).toFixed(2));
      bet.status = "won";
      bet.actualReturn = actualReturn;
      bet.settledAt = /* @__PURE__ */ new Date();
      await bet.save();
      await User.findByIdAndUpdate(bet.userId, {
        $inc: { balance: actualReturn }
      });
      await Transaction.create({
        userId: bet.userId,
        type: "prize",
        amount: actualReturn,
        description: `Pr\xEAmio de aposta - Retorno de R$ ${actualReturn.toFixed(2)}`,
        relatedBetId: bet._id
      });
      totalPrizePaid += actualReturn;
    } else {
      bet.status = "lost";
      bet.settledAt = /* @__PURE__ */ new Date();
      await bet.save();
    }
    settled++;
  }
  console.log(
    `[settle] matchId=${matchId} winner=${winner} settled=${settled} totalPrizePaid=${totalPrizePaid}`
  );
  return { settled, totalPrizePaid };
}

// src/handler.ts
var snsClient = new import_client_sns.SNSClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  // Use LocalStack endpoint when SNS_ENDPOINT is set; fall back to real AWS
  ...process.env.SNS_ENDPOINT ? { endpoint: process.env.SNS_ENDPOINT } : {}
});
async function processRecord(record) {
  const message = JSON.parse(record.body);
  const { matchId, winner } = message;
  console.log(`[handler] Processing settlement: matchId=${matchId} winner=${winner}`);
  const result = await settleMatch(matchId, winner);
  const snsPayload = {
    matchId,
    winner,
    settled: result.settled,
    totalPrizePaid: result.totalPrizePaid
  };
  const topicArn = process.env.SNS_RESULTS_TOPIC_ARN;
  if (!topicArn) {
    console.warn("[handler] SNS_RESULTS_TOPIC_ARN not set \u2014 skipping SNS publish");
    return;
  }
  await snsClient.send(
    new import_client_sns.PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(snsPayload),
      Subject: `Settlement completed: ${matchId}`
    })
  );
  console.log(`[handler] SNS published: ${JSON.stringify(snsPayload)}`);
}
var handler = async (event) => {
  console.log(`[handler] Received ${event.Records.length} record(s)`);
  for (const record of event.Records) {
    await processRecord(record);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
