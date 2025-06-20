import type { APIRoute } from 'astro';
import { ZodError } from 'zod';
import { LearningService } from '../../../lib/services/learning.service';
import { getLearningSessionSchema } from '../../../lib/schemas/learning.schema';

export const GET: APIRoute = async ({ request, locals }) => {
  const { supabase, session } = locals;

  if (!session) {
    return new Response(
      JSON.stringify({ 
        error: 'Unauthorized', 
        message: 'You must be logged in to start a learning session' 
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(request.url);
    const params = {
      session_id: url.searchParams.get('session_id') || undefined,
    };

    const validatedParams = getLearningSessionSchema.parse(params);

    console.log('Learning session request for user:', session.user.id);
    const learningService = new LearningService(supabase);
    const response = await learningService.getNextCard(
      session.user.id, 
      validatedParams.session_id
    );

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'Invalid parameters', 
          details: error.errors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return new Response(
        JSON.stringify({ 
          error: 'Not Found', 
          message: error.message 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('Error in GET /api/learn/session:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        message: 'Failed to get learning session' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const prerender = false;