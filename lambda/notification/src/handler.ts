import { SNSEvent, SNSMessage } from 'aws-lambda';

interface SettlementResult {
  matchId: string;
  winner: 'home' | 'draw' | 'away';
  settled: number;
  totalPrizePaid: number;
}

function processMessage(snsMessage: SNSMessage): void {
  const payload: SettlementResult = JSON.parse(snsMessage.Message);
  const { matchId, winner, settled, totalPrizePaid } = payload;

  console.log(
    `[NOTIF] Resultado registrado: matchId=${matchId}, winner=${winner}, ` +
      `${settled} apostas liquidadas, R$ ${totalPrizePaid.toFixed(2)} distribuídos`
  );

  // In production this handler would fan out to:
  //   - Email notifications via SES
  //   - Push notifications via SNS mobile targets
  //   - WebSocket broadcasts via API Gateway
  //   - Slack/Discord alerts for ops team
}

export const handler = async (event: SNSEvent): Promise<void> => {
  console.log(`[NOTIF] Received ${event.Records.length} SNS record(s)`);

  for (const record of event.Records) {
    processMessage(record.Sns);
  }
};
