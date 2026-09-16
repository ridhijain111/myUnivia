import { Request, Response } from 'express';

/**
 * Event Moderation Controller
 * Endpoint: /api/events/approve
 * Allows an admin to approve/reject an event or toggle its visibility and push it to the main campus feed.
 */

export interface EventModerationPayload {
  eventId: string;
  action?: 'APPROVE' | 'REJECT' | 'TOGGLE';
  isVisible?: boolean;
  feedback?: string;
  adminId?: string;
  reviewerName?: string;
}

/**
 * Moderates an event:
 * - Toggles or sets status = 'APPROVED'
 * - Sets is_visible = true (pushes to main feed)
 * - Returns updated event object and audit log
 */
export const approveEventController = (req: Request, res: Response): void => {
  try {
    const {
      eventId,
      action = 'APPROVE',
      isVisible,
      feedback,
      adminId = 'UNIVIA-ADMIN-001',
      reviewerName = 'Ridhi Jain (Super Admin)',
    } = req.body as EventModerationPayload;

    if (!eventId) {
      res.status(400).json({
        success: false,
        error: 'Event ID is required to approve or toggle visibility.',
      });
      return;
    }

    const decision = action.toUpperCase();
    let newStatus: 'PENDING' | 'APPROVED' | 'REJECTED' = 'APPROVED';
    let newVisibility = true;

    if (decision === 'REJECT') {
      newStatus = 'REJECTED';
      newVisibility = false;
    } else if (decision === 'TOGGLE') {
      // Toggle logic
      if (typeof isVisible === 'boolean') {
        newVisibility = isVisible;
        newStatus = isVisible ? 'APPROVED' : 'PENDING';
      } else {
        newVisibility = true;
        newStatus = 'APPROVED';
      }
    } else {
      newStatus = 'APPROVED';
      newVisibility = typeof isVisible === 'boolean' ? isVisible : true;
    }

    const reviewAudit = {
      reviewedBy: reviewerName,
      adminId,
      decision: newStatus,
      isVisible: newVisibility,
      reviewedAt: new Date().toISOString(),
      feedback: feedback?.trim() || (newStatus === 'APPROVED' ? 'Endorsed by Admin. Published to active campus feed.' : 'Declined by Admin review.'),
    };

    console.log(`[Admin Moderation] Event "${eventId}" -> Status: ${newStatus}, Visible on Main Feed: ${newVisibility}`);

    res.status(200).json({
      success: true,
      message: newStatus === 'APPROVED'
        ? `Event ${eventId} approved and successfully pushed to the main feed!`
        : `Event ${eventId} updated to ${newStatus}.`,
      event: {
        id: eventId,
        status: newStatus,
        is_visible: newVisibility,
        adminReview: reviewAudit,
        publishedToFeedAt: newStatus === 'APPROVED' ? new Date().toISOString() : null,
      },
      audit: reviewAudit,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Event moderation failed.',
    });
  }
};
