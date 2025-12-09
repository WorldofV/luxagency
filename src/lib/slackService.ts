// Slack service for sending alert notifications via webhooks

export interface SlackAlert {
  webhookUrl: string;
  message: string;
  title: string;
}

export async function sendSlackAlert({ webhookUrl, message, title }: SlackAlert): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: title,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: title,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: message,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Slack API error: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
    throw error;
  }
}

