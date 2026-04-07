import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Cases that are not resolved or archived
  const openStatuses = [
    "new",
    "in_review",
    "opt_in_requested",
    "opt_in_received",
    "with_lawyer",
    "response_sent",
    "awaiting_reply",
    "escalated_urgent",
    "delayed",
  ];

  const inProgressStatuses = [
    "in_review",
    "opt_in_requested",
    "with_lawyer",
  ];

  const resolvedStatuses = [
    "resolved_no_action",
    "resolved_settlement",
  ];

  // Seven days ago for "delayed" calculation
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    urgentByStatus,
    urgentByDeadline,
    open,
    inProgress,
    resolvedThisMonth,
    pendingOptIns,
  ] = await Promise.all([
    // Urgent: escalated_urgent status
    prisma.legalCase.count({
      where: { status: "escalated_urgent" },
    }),
    // Urgent: overdue deadlines (any deadline field past now, still open)
    prisma.legalCase.count({
      where: {
        status: { in: openStatuses as any[] },
        OR: [
          { responseDeadline: { lt: now } },
          { internalDeadline: { lt: now } },
          { followUpDate: { lt: now } },
        ],
      },
    }),
    // Open cases
    prisma.legalCase.count({
      where: { status: { in: openStatuses as any[] } },
    }),
    // In progress
    prisma.legalCase.count({
      where: { status: { in: inProgressStatuses as any[] } },
    }),
    // Resolved this month
    prisma.legalCase.count({
      where: {
        status: { in: resolvedStatuses as any[] },
        updatedAt: { gte: startOfMonth },
      },
    }),
    // Pending opt-ins
    prisma.optInRequest.count({
      where: { status: "pending" },
    }),
  ]);

  // Delayed: open cases with no activity in 7+ days
  const delayedCases = await prisma.legalCase.count({
    where: {
      status: { in: openStatuses as any[] },
      updatedAt: { lt: sevenDaysAgo },
    },
  });

  // Deduplicate urgent counts (a case can be both escalated and overdue)
  const urgentCaseIds = await prisma.legalCase.findMany({
    where: {
      OR: [
        { status: "escalated_urgent" },
        {
          status: { in: openStatuses as any[] },
          OR: [
            { responseDeadline: { lt: now } },
            { internalDeadline: { lt: now } },
            { followUpDate: { lt: now } },
          ],
        },
      ],
    },
    select: { id: true },
  });
  const urgent = new Set(urgentCaseIds.map((c) => c.id)).size;

  return {
    urgent,
    open,
    inProgress,
    resolvedThisMonth,
    delayed: delayedCases,
    pendingOptIns,
  };
}

export async function getUpcomingDeadlines() {
  const now = new Date();
  const fourteenDaysFromNow = new Date();
  fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

  // Find cases with any deadline within 14 days (or overdue)
  const cases = await prisma.legalCase.findMany({
    where: {
      status: {
        notIn: ["resolved_no_action", "resolved_settlement", "archived"] as any[],
      },
      OR: [
        { responseDeadline: { lte: fourteenDaysFromNow } },
        { internalDeadline: { lte: fourteenDaysFromNow } },
        { followUpDate: { lte: fourteenDaysFromNow } },
      ],
    },
    include: {
      assignedTo: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const deadlineItems = cases.map((c) => {
    // Find the nearest deadline
    const deadlines: { type: string; date: Date }[] = [];
    if (c.responseDeadline) deadlines.push({ type: "response", date: c.responseDeadline });
    if (c.internalDeadline) deadlines.push({ type: "internal", date: c.internalDeadline });
    if (c.followUpDate) deadlines.push({ type: "followUp", date: c.followUpDate });

    // Sort by date ascending to find nearest
    deadlines.sort((a, b) => a.date.getTime() - b.date.getTime());
    const nearest = deadlines[0];

    const deadlineDate = new Date(
      nearest.date.getFullYear(),
      nearest.date.getMonth(),
      nearest.date.getDate()
    );
    const diffMs = deadlineDate.getTime() - today.getTime();
    const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

    let urgency: string;
    let urgencyOrder: number;
    if (daysUntil < 0) {
      urgency = "overdue";
      urgencyOrder = 0;
    } else if (daysUntil === 0) {
      urgency = "today";
      urgencyOrder = 1;
    } else if (daysUntil <= 3) {
      urgency = "soon";
      urgencyOrder = 2;
    } else {
      urgency = "upcoming";
      urgencyOrder = 3;
    }

    return {
      id: c.id,
      caseId: c.caseId,
      title: c.title,
      status: c.status,
      assignedTo: c.assignedTo,
      nearestDeadline: nearest.date,
      deadlineType: nearest.type,
      daysUntil,
      urgency,
      urgencyOrder,
    };
  });

  // Sort by urgency (overdue first), then by days until deadline
  deadlineItems.sort((a, b) => {
    if (a.urgencyOrder !== b.urgencyOrder) return a.urgencyOrder - b.urgencyOrder;
    return a.daysUntil - b.daysUntil;
  });

  // Remove internal sort field
  return deadlineItems.map(({ urgencyOrder, ...rest }) => rest);
}
