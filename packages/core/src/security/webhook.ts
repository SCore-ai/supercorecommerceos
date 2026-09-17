export interface WebhookVerifier {
  verify(input: { headers: Headers; rawBody: string }): Promise<boolean>;
}

export class RejectWebhookVerifier implements WebhookVerifier {
  async verify(_input: { headers: Headers; rawBody: string }): Promise<boolean> {
    return false;
  }
}
