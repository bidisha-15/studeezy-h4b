import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';
import { initEdgeStore } from '@edgestore/server';

const es = initEdgeStore.create();

const edgeStoreRouter = es.router({
  publicFiles: es
    .fileBucket({
      accept: [
        'image/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      maxSize: 20 * 1024 * 1024, 
    })
    .beforeUpload(() => true)
    .beforeDelete(() => true),
});

export const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export const edgestore = es;
