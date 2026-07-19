# Slack Analytics Examples for Executives

This document provides example interactions between C-level executives and the AI assistant for Slack analytics.

## Quick Start Questions

### Company Overview
**Executive:** "Give me an overview of company activity on Slack from the past week"

**AI Response:** The AI will call the `get_company_slack_analytics` tool and display a `SlackAnalytics` component showing:
- Total messages across all channels
- Active user count
- Overall company sentiment
- Department breakdown with insights
- Top risks and blockers
- Progress metrics (completed/in-progress/blocked tasks)
- Communication trends

---

### Department Health Check
**Executive:** "How is the Engineering department doing?"

**AI Response:** The AI will analyze Engineering-related channels and show:
- Message volume and activity level
- Team engagement (active members)
- Number of tasks and blockers
- Sentiment analysis
- Risk level assessment
- Key highlights

---

### Risk Assessment
**Executive:** "What are the biggest blockers across the company right now?"

**AI Response:** The AI will identify:
- Top 5 risks by severity
- Source departments/channels
- Number of blockers per department
- Urgent items requiring attention

---

### Progress Tracking
**Executive:** "Show me our task completion metrics"

**AI Response:** Displays:
- Number of completed tasks
- Tasks in progress
- Blocked/stuck tasks
- Overdue items
- Progress indicators by department

---

## Advanced Queries

### Time-Based Analysis
**Executive:** "Compare this week's activity to last week"

**AI:** Can fetch data for different time periods:
- Last 7 days
- Last 14 days
- Last 30 days
- Custom date ranges

---

### Specific Channel Analysis
**Executive:** "What's happening in the #sales-team channel?"

**AI Response:** Provides channel-specific metrics:
- Message count
- Top contributors
- Sentiment analysis
- Key topics being discussed
- Urgent/action items

---

### Multi-Channel Analysis
**Executive:** "Analyze all marketing channels"

**AI Response:** Aggregates data from channels matching "marketing" keyword:
- Combined message count
- Cross-channel activity
- Team collaboration patterns
- Common topics across channels

---

### Sentiment Deep Dive
**Executive:** "Which departments have negative sentiment?"

**AI Response:** Lists departments with:
- Sentiment score
- Contributing factors
- Risk level
- Recommended actions

---

## Business Intelligence Questions

### Strategic Planning
**Executive:** "Based on Slack activity, which departments need more support?"

**AI Analysis:**
- Identifies high blocker counts
- Low progress indicators
- High message volume with negative sentiment
- Departments with elevated risk levels

---

### Team Engagement
**Executive:** "How engaged is our team based on Slack activity?"

**AI Response:**
- Collaboration score (0-100)
- Engagement level (high/medium/low)
- Active participation percentage
- Communication trends

---

### Cross-Functional Insights
**Executive:** "Are there any patterns in our company communication?"

**AI Analysis:**
- Communication volume trends
- Peak activity times
- Most collaborative departments
- Cross-department interaction patterns

---

## Sample SlackAnalytics Output

```
📊 Company Slack Analytics
Last 7 days | Overall Sentiment: Positive

Overview Metrics:
├─ Total Messages: 2,847 (across 32 channels)
├─ Active Users: 68
└─ Collaboration Score: 82/100 | High Engagement | ↑ Increasing

Task Progress:
├─ ✅ Completed: 156 tasks
├─ 🔄 In Progress: 89 tasks
├─ 🚫 Blocked: 12 tasks
└─ ⏰ Overdue: 7 items

⚠️ Top Risks & Blockers:
1. Sales: 5 blockers identified - MEDIUM - #sales-team
2. Customer Success: API integration issues - HIGH - #cs-escalations
3. Engineering: 3 urgent items - LOW - #eng-platform

🏢 Department Insights:

Engineering (positive, low risk)
Channels: #engineering, #dev-backend, #dev-frontend
├─ 856 messages | 18 active members
├─ 45 tasks mentioned | 3 blockers
├─ 28 progress signals
└─ Strong progress signals, High communication volume

Product (mixed, medium risk)
Channels: #product, #design, #product-roadmap
├─ 423 messages | 12 active members
├─ 34 tasks mentioned | 5 blockers
├─ 15 progress signals
└─ 5 blockers/urgent items identified

Sales (negative, high risk)
Channels: #sales, #sales-team, #deals
├─ 612 messages | 22 active members
├─ 67 tasks mentioned | 15 blockers
├─ 8 progress signals
└─ High blocker count, needs attention

[... more departments ...]
```

---

## Integration with Other Data

### Combined with Email Analytics
**Executive:** "Show me Slack and email activity together"

**AI Response:** Combines Gmail and Slack tools to show:
- Communication patterns across platforms
- Priority items from both sources
- Cross-platform sentiment
- Unified action items

---

### Meeting Correlation
**Executive:** "Correlate Slack blockers with my meeting schedule"

**AI Response:** 
- Identifies blockers requiring meetings
- Suggests availability for urgent discussions
- Recommends meeting attendees based on Slack activity

---

## Best Practices

### Daily Check-In
**Recommended Query:** "Give me a daily snapshot of company health from Slack"

Returns:
- Yesterday's activity summary
- New urgent items
- Department status updates
- Key highlights requiring attention

---

### Weekly Review
**Recommended Query:** "Weekly Slack analytics for executive review"

Comprehensive report including:
- Week-over-week trends
- Department performance
- Risk assessment
- Strategic insights

---

### Monthly Deep Dive
**Recommended Query:** "Month-to-month Slack analytics trends"

Extended analysis:
- 30-day activity patterns
- Long-term trends
- Department evolution
- Predictive insights

---

## Custom Queries

The AI is flexible and can answer various custom questions:

- "Which teams are most collaborative?"
- "What topics are trending company-wide?"
- "Show me channels with the most urgent discussions"
- "Which department improved the most this week?"
- "Are there any red flags I should be aware of?"
- "What's the general mood of the company?"
- "Which teams are overworked based on Slack?"

---

## Tips for Executives

1. **Be Specific**: Ask about specific departments, time ranges, or metrics
2. **Compare Periods**: Ask for week-over-week or month-over-month comparisons
3. **Drill Down**: Start broad, then ask follow-up questions for details
4. **Action-Oriented**: Ask "What should I focus on?" or "What needs my attention?"
5. **Regular Check-ins**: Make it a daily habit to review analytics

---

## Data Refresh

- Data is fetched in real-time when you ask
- Recommended check frequency:
  - Daily: Quick overview (5-10 seconds)
  - Weekly: Detailed review (30 seconds)
  - Monthly: Deep analysis (1-2 minutes)

---

## Privacy Note

All Slack data:
- Is analyzed in real-time
- Is not stored on servers
- Respects channel privacy settings
- Only accessible to authorized organization members
- Uses simple keyword analysis (no external AI services for content)
