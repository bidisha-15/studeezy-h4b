import { prisma } from './prisma';

export async function getMaterialById(id: string) {
  return await prisma.material.findUnique({
    where: { id },
  });
}

export async function updateExtractedText(id: string, processedText: string) {
  return await prisma.material.update({
    where: { id },
    data: { processedText },
  });
}
