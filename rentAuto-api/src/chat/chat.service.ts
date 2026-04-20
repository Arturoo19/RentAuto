import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

interface ChatwootConversation {
  id: number;
  last_activity_at: number;
  status: string;
}

interface ChatwootConversationsResponse {
  data: {
    payload: ChatwootConversation[];
  };
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly baseUrl = process.env.CHATWOOT_BASE_URL ?? 'https://app.chatwoot.com';
  private readonly apiToken = process.env.CHATWOOT_API_TOKEN;
  private readonly accountId = process.env.CHATWOOT_ACCOUNT_ID;

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanOldConversations(): Promise<void> {
    if (!this.apiToken || !this.accountId) {
      this.logger.warn(
        'Skipping Chatwoot cleanup: CHATWOOT_API_TOKEN or CHATWOOT_ACCOUNT_ID is missing.',
      );
      return;
    }

    this.logger.log('Checking Chatwoot conversations inactive for 24h...');

    try {
      const conversations = await this.getAllConversations();
      const now = Date.now();
      const cutoff = 24 * 60 * 60 * 1000;
      let resolvedCount = 0;

      for (const conv of conversations) {
        const lastActivity = conv.last_activity_at * 1000;
        if (now - lastActivity >= cutoff) {
          await this.resolveConversation(conv.id);
          resolvedCount += 1;
          this.logger.log(`Resolved inactive conversation #${conv.id}`);
        }
      }

      this.logger.log(
        `Chatwoot cleanup finished. Checked: ${conversations.length}, resolved: ${resolvedCount}.`,
      );
    } catch (err) {
      this.logger.error('Failed to clean Chatwoot conversations', err);
    }
  }

  private async getAllConversations(): Promise<ChatwootConversation[]> {
    const conversations: ChatwootConversation[] = [];
    let page = 1;

    while (true) {
      const { data } = await axios.get<ChatwootConversationsResponse>(
        `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations`,
        {
          headers: { api_access_token: this.apiToken },
          params: {
            page,
            status: 'all',
          },
        },
      );

      const pagePayload = data.data?.payload ?? [];
      conversations.push(...pagePayload);

      if (pagePayload.length === 0) {
        break;
      }

      page += 1;
    }

    return conversations;
  }

  private async resolveConversation(conversationId: number): Promise<void> {
    await axios.post(
      `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations/${conversationId}/toggle_status`,
      { status: 'resolved' },
      { headers: { api_access_token: this.apiToken } },
    );
  }
}
