import { NextRequest, NextResponse } from 'next/server';
import { noktaService } from '@/lib/nokta';
import type { NoktaSessionPayload } from '@/lib/nokta';
import type { UserFeedback } from '@/lib/nokta';
import { logger } from '@/lib/utils/logger';
import { validateFeedback, validateSessionPayload, validationErrorResponse, serverErrorResponse, checkRateLimit } from '@/lib/utils/guards';

/** worse/same/better (UI) → still_high/reduced/clear (Nokta) */
const FEEDBACK_MAP: Record<string, UserFeedback> = {
  worse: 'still_high',
  same: 'reduced',
  better: 'clear',
  still_high: 'still_high',
  reduced: 'reduced',
  clear: 'clear',
};

export async function POST(request: NextRequest) {
  const requestId = `feedback-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();
  const endpoint = '/api/nokta/submit-feedback';

  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      logger.warn('Rate limit exceeded', { requestId, clientIp, resetAt: rateLimit.resetAt });
      return NextResponse.json(
        { error: 'Rate limit exceeded', requestId, retryAfter: rateLimit.resetAt },
        { status: 429 }
      );
    }

    logger.logRequest(endpoint, 'POST', requestId, { clientIp });

    const { sessionPayload, feedback } = await request.json();

    // Validation
    const errors: Array<{ field: string; message: string }> = [];
    
    const feedbackError = validateFeedback(feedback);
    if (feedbackError) errors.push(feedbackError);
    
    const payloadError = validateSessionPayload(sessionPayload);
    if (payloadError) errors.push(payloadError);

    if (errors.length > 0) {
      return validationErrorResponse(errors, requestId);
    }

    const noktaFeedback = FEEDBACK_MAP[String(feedback).toLowerCase()] ?? 'reduced';
    const payload = sessionPayload as NoktaSessionPayload;

    logger.debug('Submitting feedback', { requestId, userId: payload.userId, feedback: noktaFeedback });

    const out = await noktaService.submitFeedbackWithPayload(payload, noktaFeedback);

    const processingTime = Date.now() - startTime;
    logger.logResponse(endpoint, 'POST', requestId, 200, processingTime, {
      userId: payload.userId,
      signalAfter: out.signalAfter,
      shouldOfferShare: out.shouldOfferShare,
    });

    return NextResponse.json({
      success: true,
      signalAfter: out.signalAfter,
      shouldOfferShare: out.shouldOfferShare,
      sessionId: out.sessionId,
      skaneIndex: out.skaneIndex,
      requestId,
    });
  } catch (e) {
    const processingTime = Date.now() - startTime;
    logger.error('Submit feedback error', e, { requestId, processingTime });
    return serverErrorResponse('Submit feedback failed', e, requestId);
  }
}
