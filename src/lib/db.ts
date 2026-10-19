import 'server-only';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/** Acceso genérico por tabla (lista blanca: las acciones del servidor NUNCA aceptan otras). */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const MODELS: Record<string, any> = {
  events: prisma.events,
  gallery_images: prisma.gallery_images,
  schedule_items: prisma.schedule_items,
  food_stalls: prisma.food_stalls,
  ads: prisma.ads,
  bono_types: prisma.bono_types,
  contact_messages: prisma.contact_messages,
  bono_purchases: prisma.bono_purchases,
};
