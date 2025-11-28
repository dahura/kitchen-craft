import { NextRequest, NextResponse } from 'next/server';
import type { KitchenConfig, RenderableModule } from '@/core/types';

// In-memory storage for kitchen configurations
// In production, this should be persisted to a database
const configStorage = new Map<
  string,
  { config: KitchenConfig; modules: RenderableModule[]; timestamp: string }
>();

/**
 * POST /api/kitchen-config
 * Save a kitchen configuration with its rendered modules
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { config, modules, description } = body as {
      config: KitchenConfig;
      modules: RenderableModule[];
      description?: string;
    };

    if (!config || !modules) {
      return NextResponse.json(
        { error: 'Missing config or modules' },
        { status: 400 }
      );
    }

    // Generate a unique ID for this configuration
    const configId = `kitchen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store the configuration
    configStorage.set(configId, {
      config,
      modules,
      timestamp: new Date().toISOString(),
    });

    console.log(`Saved kitchen configuration: ${configId}`);

    return NextResponse.json(
      {
        success: true,
        configId,
        description: description || 'AI-generated kitchen design',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving kitchen configuration:', error);
    return NextResponse.json(
      {
        error: 'Failed to save configuration',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kitchen-config?id=<configId>
 * Retrieve a saved kitchen configuration
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const configId = searchParams.get('id');

    if (!configId) {
      return NextResponse.json(
        { error: 'Missing config ID' },
        { status: 400 }
      );
    }

    const storedConfig = configStorage.get(configId);

    if (!storedConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(storedConfig, { status: 200 });
  } catch (error) {
    console.error('Error retrieving kitchen configuration:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve configuration',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

