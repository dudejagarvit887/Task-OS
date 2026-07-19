# Slack Integration for Executive Analytics

This guide explains how to set up and use the Slack integration for C-level executive analytics in your Tambo application.

## Overview

The Slack integration provides comprehensive analytics for executives to monitor:
- **Department Performance**: Track activity across all departments and channels
- **Communication Trends**: Analyze message volume, engagement, and collaboration
- **Risk Assessment**: Identify blockers, urgent issues, and potential problems
- **Progress Tracking**: Monitor task completion, in-progress work, and deadlines
- **Sentiment Analysis**: Understand team morale and communication tone

## Features

### 🔧 Tools Available to AI
1. **get_slack_channel_activity**: Analyze specific channels or all channels for activity metrics
2. **get_company_slack_analytics**: Get comprehensive company-wide insights and analytics
3. **get_slack_messages**: Retrieve raw messages from channels for detailed analysis

### 📊 SlackAnalytics Component
A beautiful dashboard component that displays:
- Overview metrics (total messages, channels, active users)
- Task progress tracking (completed, in-progress, blocked, overdue)
- Top risks and blockers across the company
- Department-specific insights with sentiment and risk levels
- Communication and collaboration trends

## Setup Instructions

### 1. Create a Slack App

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Enter an app name (e.g., "Executive Analytics Bot")
5. Select your workspace

### 2. Configure OAuth & Permissions

1. In your app settings, go to **"OAuth & Permissions"**
2. Under **"Scopes"** → **"Bot Token Scopes"**, add:
   - `channels:history` - View messages in public channels
   - `channels:read` - View basic channel information
   - `groups:history` - View messages in private channels
   - `groups:read` - View basic private channel information
   - `users:read` - View user information
   - `team:read` - View workspace information

3. Under **"Redirect URLs"**, add:
   ```
   http://localhost:3000/api/slack/callback
   https://yourdomain.com/api/slack/callback
   ```

### 3. Get Your Credentials

1. In **"Basic Information"** → **"App Credentials"**, copy:
   - **Client ID**
   - **Client Secret**

2. Add these to your `.env.local` file:
   ```env
   SLACK_CLIENT_ID=your_client_id_here
   SLACK_CLIENT_SECRET=your_client_secret_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 4. Install the App to Your Workspace

1. In your app settings, go to **"Install App"**
2. Click **"Install to Workspace"**
3. Review and authorize the permissions
4. The app is now installed!

### 5. Connect Slack in Your Application

1. Navigate to your dashboard
2. Go to **Settings** or **Integrations**
3. Find **"Link Integration"** dialog
4. Click on **Slack** to connect
5. Authorize the integration in the popup window

## Usage

### For Executives (Using the AI)

Simply chat with the AI assistant and ask questions like:

**Company-wide insights:**
- "Show me company analytics from Slack for the past week"
- "What are the biggest risks across all departments?"
- "How is my company doing based on Slack activity?"
- "Give me an overview of all department progress"

**Department-specific:**
- "How is the Engineering team doing?"
- "Show me activity in the marketing channels"
- "What blockers does the Sales team have?"

**Specific metrics:**
- "How many tasks are completed vs in progress?"
- "What's our collaboration score?"
- "Are there any urgent issues I should know about?"

### For Developers (Using Tools & Components)

#### Using Slack Tools in Tambo

The tools are automatically available when Slack is connected:

```typescript
// Tools are registered in lib/tambo.ts
import { slackTools } from './slack-tools'

// AI can call:
// - get_slack_channel_activity({ channelIds: 'all', daysBack: 7 })
// - get_company_slack_analytics({ daysBack: 7 })
// - get_slack_messages({ channelIds: ['C123', 'C456'], daysBack: 3 })
```

#### Using SlackAnalytics Component

```typescript
import { SlackAnalytics } from '@/components/executive/slack-analytics'

<SlackAnalytics
  title="Weekly Company Overview"
  period="Last 7 days"
  totalMessages={1250}
  totalChannels={24}
  activeUsers={47}
  overallSentiment="positive"
  departmentInsights={[
    {
      department: "Engineering",
      channels: ["#engineering", "#dev-backend"],
      totalMessages: 456,
      activeMembers: 12,
      tasksMentioned: 23,
      blockersMentioned: 2,
      progressIndicators: 15,
      sentiment: "positive",
      riskLevel: "low",
      keyHighlights: ["Strong progress signals", "High communication volume"]
    }
  ]}
  topRisks={[
    {
      risk: "Sales: 3 blockers identified",
      severity: "medium",
      source: "#sales-team"
    }
  ]}
  progressMetrics={{
    completedTasks: 45,
    inProgressTasks: 32,
    blockedTasks: 5,
    overdueItems: 3
  }}
  trends={{
    communicationTrend: "increasing",
    engagementLevel: "high",
    collaborationScore: 78
  }}
/>
```

## How It Works

### Data Collection
1. When an executive asks for insights, the AI uses Slack tools
2. Tools fetch messages from all or specific channels for the past N days
3. Messages are analyzed for:
   - Keywords (urgent, task, blocker, completed, etc.)
   - Sentiment (positive/negative/mixed/neutral)
   - Topics (frequent meaningful words)
   - User activity patterns

### Analytics Generation
1. **Channel Mapping**: Channels are mapped to departments based on naming conventions
2. **Sentiment Analysis**: Simple keyword-based sentiment scoring
3. **Risk Assessment**: Calculated from blocker count and negative sentiment
4. **Progress Tracking**: Identified from task-related keywords
5. **Trends**: Computed from activity levels and engagement metrics

### Department Classification
Channels are automatically classified into departments:
- **Engineering**: channels with 'eng', 'dev', 'tech', 'backend', 'frontend', etc.
- **Product**: 'product', 'pm', 'design', 'ux', 'ui'
- **Sales**: 'sales', 'revenue', 'deals', 'customers'
- **Marketing**: 'marketing', 'social', 'content', 'growth'
- **Operations**: 'ops', 'operations', 'logistics'
- **Customer Success**: 'support', 'customer', 'cs'
- **Finance**: 'finance', 'accounting', 'budget'
- **HR**: 'hr', 'people', 'recruiting', 'hiring'
- **Legal**: 'legal', 'compliance', 'contracts'
- **General**: Other channels

## Security & Privacy

- OAuth tokens are stored securely in Clerk organization private metadata
- Only organization admins can connect/disconnect integrations
- The app only reads messages; it cannot post or modify anything
- All data is processed in real-time and not stored
- Sentiment analysis uses simple keyword matching (no external AI services)

## Troubleshooting

### "Slack is not connected" Error
- Ensure you've connected Slack through the Link Integration dialog
- Check that your Slack app is installed to the workspace
- Verify environment variables are set correctly

### "Invalid auth" or "Token expired"
- Disconnect and reconnect Slack in the Link Integration settings
- Check that your Slack app's OAuth scopes haven't changed
- Verify the Client ID and Secret are correct

### No Messages Returned
- Ensure your Slack app has been added to the channels you want to analyze
- Check that the app has the required permissions
- Verify the channels exist and have messages in the time range

### Analytics Seem Inaccurate
- The analytics use simple keyword-based heuristics
- Sentiment analysis is basic and may not capture nuance
- Risk levels are estimated based on keyword frequency
- For more accurate analysis, consider implementing AI-powered analysis

## Customization

### Extending Department Classification
Edit `/lib/slack-service.ts` → `mapChannelsToDepartments()` to add custom department keywords:

```typescript
const deptKeywords: Record<string, string[]> = {
  'Your Department': ['keyword1', 'keyword2'],
  // ... add more
}
```

### Adjusting Sentiment Keywords
Edit `/lib/slack-service.ts` → `analyzeMessages()` to customize:

```typescript
const positiveKeywords = ['great', 'awesome', /* add more */]
const negativeKeywords = ['problem', 'issue', /* add more */]
```

### Customizing the UI
The `SlackAnalytics` component uses Tailwind CSS and shadcn/ui components. Customize:
- Colors in the component file
- Layout in the grid structure
- Metrics displayed in the cards

## Rate Limits

Slack API has rate limits:
- **Tier 1**: 1+ request per minute
- **Tier 2**: 20+ requests per minute
- **Tier 3**: 50+ requests per minute

The implementation fetches up to 100 messages per channel. For large workspaces (50+ channels), consider:
- Implementing pagination
- Caching results
- Limiting channel selection
- Running analysis asynchronously

## Next Steps

- [ ] Add more sophisticated sentiment analysis with AI
- [ ] Implement caching for faster repeated queries
- [ ] Add filtering by date ranges in the UI
- [ ] Create scheduled reports (daily/weekly summaries)
- [ ] Add export functionality (PDF/CSV reports)
- [ ] Integrate with other tools (Linear, GitHub) for cross-platform insights
- [ ] Add real-time updates with webhooks
- [ ] Implement custom alert rules for executives

## Support

For issues or questions:
1. Check the Slack API documentation
2. Review the Clerk documentation for metadata storage
3. Check the browser console for detailed error messages
4. Review the server logs for API issues

## License

This integration is part of your Tambo application and follows the same license.
