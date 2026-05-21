export type AuditCategory = {
  name: string;
  score: number;
  benchmark: string;
  insight: string;
};

export type QuickWin = {
  title: string;
  impact: "High" | "Medium";
  effort: "Low" | "Medium";
  description: string;
};

export const auditCategories: AuditCategory[] = [
  {
    name: "Search Visibility",
    score: 82,
    benchmark: "Strong",
    insight: "Local search intent is clear, but service pages need stronger conversion paths."
  },
  {
    name: "Lead Response",
    score: 68,
    benchmark: "At Risk",
    insight: "Missed-call follow-up and after-hours capture are the largest near-term gaps."
  },
  {
    name: "Reputation",
    score: 74,
    benchmark: "Competitive",
    insight: "Review volume is healthy, but recent review velocity is below premium peers."
  },
  {
    name: "AI Automation",
    score: 59,
    benchmark: "Underused",
    insight: "Manual intake and repetitive follow-ups are slowing down booked appointments."
  },
  {
    name: "Offer Clarity",
    score: 88,
    benchmark: "Excellent",
    insight: "The core offer is strong and ready for more direct lead-capture messaging."
  }
];

export const overallAuditScore = Math.round(
  auditCategories.reduce((total, category) => total + category.score, 0) /
    auditCategories.length
);

export const quickWins: QuickWin[] = [
  {
    title: "Install missed-call textback",
    impact: "High",
    effort: "Low",
    description:
      "Send an instant branded response when calls go unanswered so warm leads stay engaged."
  },
  {
    title: "Add AI intake prompts",
    impact: "High",
    effort: "Medium",
    description:
      "Qualify service needs, urgency, and budget before the first human follow-up."
  },
  {
    title: "Refresh review request flow",
    impact: "Medium",
    effort: "Low",
    description:
      "Trigger review requests after completed jobs to raise trust signals in local search."
  }
];

export const optimizedBio =
  "Titan Visibility OS helps creators and businesses uncover visibility gaps, sharpen content execution, and turn profile attention into measurable growth workflows.";

export const reportHighlights = [
  "Overall AI readiness score with category-level diagnostics",
  "Top revenue leaks ranked by speed, effort, and growth impact",
  "Lead-ready recommendations written for a business owner",
  "90-day action path for follow-up, reputation, and conversion gains"
];
