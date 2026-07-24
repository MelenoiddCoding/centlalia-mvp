'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  appendCheckInEvidence,
  readCheckInEvidence,
  type CheckInEvidence,
} from '@/lib/check-in-flow';

export function useCheckInEvidence() {
  const [evidence, setEvidence] = useState<CheckInEvidence[]>([]);

  useEffect(() => {
    queueMicrotask(() => setEvidence(readCheckInEvidence(window.localStorage)));
  }, []);

  const recordEvidence = useCallback((entry: CheckInEvidence) => {
    setEvidence(appendCheckInEvidence(window.localStorage, entry));
  }, []);

  return { evidence, recordEvidence };
}
