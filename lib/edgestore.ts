"use client";

import { createEdgeStoreProvider } from '@edgestore/react';

const { useEdgeStore, EdgeStoreProvider } = createEdgeStoreProvider();

export { useEdgeStore, EdgeStoreProvider };