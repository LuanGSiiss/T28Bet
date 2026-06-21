"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/handler.ts
var handler_exports = {};
__export(handler_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(handler_exports);
function processMessage(snsMessage) {
  const payload = JSON.parse(snsMessage.Message);
  const { matchId, winner, settled, totalPrizePaid } = payload;
  console.log(
    `[NOTIF] Resultado registrado: matchId=${matchId}, winner=${winner}, ${settled} apostas liquidadas, R$ ${totalPrizePaid.toFixed(2)} distribu\xEDdos`
  );
}
var handler = async (event) => {
  console.log(`[NOTIF] Received ${event.Records.length} SNS record(s)`);
  for (const record of event.Records) {
    processMessage(record.Sns);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
